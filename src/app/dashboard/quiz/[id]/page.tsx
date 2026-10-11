"use client";

    import * as React from "react";
    import Link from "next/link";
    import { useParams, useRouter } from "next/navigation";
    import { onAuthStateChanged, type User } from "firebase/auth";
    import { Bookmark, BrainCircuit, ChevronLeft, ChevronRight, Info, Loader2, Timer } from "lucide-react";

    import { analyzeLearningGap } from "@/ai/flows/ai-learning-gap-analysis-flow";
    import { auth } from "@/lib/firebase";
    import { ensureUserProfile } from "@/lib/user-profile";
    import { getSubjectsForUser } from "@/lib/subjects";
    import { getQuestionsForSubject, getQuizSession, recordQuizAttempt, saveQuizSession, type QuizQuestion } from "@/lib/learning-progress";
    import { Button } from "@/components/ui/button";
    import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
    import { Label } from "@/components/ui/label";
    import { Progress } from "@/components/ui/progress";
    import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
    import { Slider } from "@/components/ui/slider";
    import { useToast } from "@/hooks/use-toast";

    type ResponseForAnalysis = { questionId: string; questionText: string; correctAnswer: string; studentAnswer: string; isCorrect: boolean; confidenceLevel: number; subject: string; topic: string };

    function buildFallbackAnalysis(results: ResponseForAnalysis[]) {
    const groups = new Map<string, ResponseForAnalysis[]>();
    results.forEach((item) => groups.set(item.topic, [...(groups.get(item.topic) ?? []), item]));
    const detectedGaps = Array.from(groups.entries()).map(([topic, items]) => {
      const correct = items.filter((item) => item.isCorrect).length;
      const accuracy = Math.round(correct / items.length * 100);
      const confidence = Math.round(items.reduce((sum, item) => sum + item.confidenceLevel, 0) / items.length);
      const misconception = accuracy < 50 && confidence >= 70;
      return {
        topic,
        description: "You answered " + correct + " of " + items.length + " questions correctly in this topic.",
        accuracy,
        confidence,
        isMisconception: misconception,
        recommendation: accuracy < 100 ? "Review this topic and try another diagnostic quiz." : "Keep this topic fresh with occasional review.",
      };
    }).filter((item) => item.accuracy < 100);
    const correctCount = results.filter((item) => item.isCorrect).length;
    return {
      overallInsight: "You answered " + correctCount + " of " + results.length + " questions correctly. Review the topics below to guide your next study session.",
      gapSummary: {
        totalGaps: detectedGaps.length,
        topicsWithGaps: detectedGaps.map((item) => item.topic),
        misconceptionCount: detectedGaps.filter((item) => item.isMisconception).length,
      },
      detectedGaps,
    };
    }

    export default function QuizPage() {
    const params = useParams<{ id: string | string[] }>();
    const subjectId = Array.isArray(params.id) ? params.id[0] : params.id;
    const router = useRouter();
    const { toast } = useToast();
    const [user, setUser] = React.useState<User | null>(null);
    const [subjectName, setSubjectName] = React.useState("");
    const [questions, setQuestions] = React.useState<QuizQuestion[]>([]);
    const [answers, setAnswers] = React.useState<Record<string, number>>({});
    const [confidence, setConfidence] = React.useState<Record<string, number>>({});
    const [bookmarks, setBookmarks] = React.useState<string[]>([]);
    const [currentIdx, setCurrentIdx] = React.useState(0);
    const [timeLeft, setTimeLeft] = React.useState(1800);
    const [loading, setLoading] = React.useState(true);
    const [saving, setSaving] = React.useState(false);
    const [error, setError] = React.useState("");
    const [sessionReady, setSessionReady] = React.useState(false);

    React.useEffect(() => {
      let cancelled = false;
      const unsubscribe = onAuthStateChanged(auth, async (activeUser) => {
        if (!activeUser) { router.replace("/login"); return; }
        if (!subjectId) { setError("This subject could not be found."); setLoading(false); return; }
        setUser(activeUser);
        setLoading(true);
        setError("");
        try {
          await ensureUserProfile(activeUser);
          const [subjects, loadedQuestions, savedSession] = await Promise.all([
            getSubjectsForUser(activeUser.uid),
            getQuestionsForSubject(subjectId),
            getQuizSession(activeUser.uid, subjectId),
          ]);
          if (cancelled) return;
          const subject = subjects.find((item) => item.id === subjectId);
          if (!subject) throw new Error("This subject is not in the published curriculum.");
          setSubjectName(subject.name);
          setQuestions(loadedQuestions);
          if (savedSession) {
            setAnswers(savedSession.answers ?? {});
            setConfidence(savedSession.confidence ?? {});
            setBookmarks(savedSession.bookmarks ?? []);
            setCurrentIdx(Math.min(Math.max(0, savedSession.currentIdx ?? 0), Math.max(0, loadedQuestions.length - 1)));
            const savedAt = savedSession.updatedAt?.toMillis?.() ?? Date.now();
            const elapsed = Math.max(0, Math.floor((Date.now() - savedAt) / 1000));
            setTimeLeft(Math.max(0, (savedSession.timeLeft ?? 1800) - elapsed));
          }
          setSessionReady(true);
        } catch {
          if (!cancelled) setError("We couldn't load this quiz. Refresh the page or return to your subjects.");
        } finally {
          if (!cancelled) setLoading(false);
        }
      });
      return () => { cancelled = true; unsubscribe(); };
    }, [router, subjectId]);

    React.useEffect(() => {
      if (!sessionReady || !user || !subjectId || questions.length === 0 || saving) return;
      const timer = setTimeout(() => {
        saveQuizSession(user.uid, subjectId, { currentIdx, answers, confidence, bookmarks, timeLeft }).catch(() => {
          setError("Your latest quiz answers could not be saved. Check your connection before continuing.");
        });
      }, 600);
      return () => clearTimeout(timer);
    }, [sessionReady, user, subjectId, questions.length, currentIdx, answers, confidence, bookmarks, timeLeft, saving]);

    React.useEffect(() => {
      if (!sessionReady || questions.length === 0 || saving) return;
      const timer = setInterval(() => setTimeLeft((seconds) => Math.max(0, seconds - 1)), 1000);
      return () => clearInterval(timer);
    }, [sessionReady, questions.length, saving]);

    const formatTime = (seconds: number) => {
      const minutes = Math.floor(seconds / 60);
      const remaining = seconds % 60;
      return minutes + ":" + remaining.toString().padStart(2, "0");
    };

    const handleFinish = async () => {
      if (!user || questions.length === 0 || questions.some((question) => answers[question.id] === undefined)) return;
      setSaving(true);
      const elapsedSeconds = Math.max(0, 1800 - timeLeft);
      const analysisResponses: ResponseForAnalysis[] = questions.map((question) => {
        const answerIndex = answers[question.id];
        return {
          questionId: question.id,
          questionText: question.text,
          correctAnswer: question.options[question.correctIdx],
          studentAnswer: question.options[answerIndex] ?? "",
          isCorrect: answerIndex === question.correctIdx,
          confidenceLevel: confidence[question.id] ?? 50,
          subject: subjectId,
          topic: question.topic,
        };
      });

      let analysis = buildFallbackAnalysis(analysisResponses);
      try {
        const aiResult = await analyzeLearningGap({ quizResults: analysisResponses });
        analysis = JSON.parse(JSON.stringify(aiResult));
      } catch {
        // Persist deterministic results even when the optional AI analysis is unavailable.
      }

      try {
        const result = await recordQuizAttempt({
          uid: user.uid,
          subjectId,
          subjectName,
          responses: questions.map((question) => ({
            questionId: question.id,
            topic: question.topic,
            questionText: question.text,
            answerIndex: answers[question.id],
            isCorrect: answers[question.id] === question.correctIdx,
            confidence: confidence[question.id] ?? 50,
          })),
          durationSeconds: elapsedSeconds,
          analysis: analysis as unknown as Record<string, unknown>,
        });
        toast({ title: "Quiz results saved", description: "Your score and progress are now part of your learning record." });
        router.push("/dashboard/analysis?attemptId=" + encodeURIComponent(result.id));
      } catch {
        toast({ variant: "destructive", title: "Results could not be saved", description: "Check your connection and try again. Your quiz answers are still saved as a draft." });
        setSaving(false);
      }
    };

    if (loading) return <div className="flex min-h-[60vh] items-center justify-center"><div className="flex items-center gap-3 text-sm text-muted-foreground"><Loader2 className="h-5 w-5 animate-spin text-primary" />Loading quiz…</div></div>;
    if (error && questions.length === 0) return <div className="mx-auto max-w-2xl p-6"><Card><CardContent className="space-y-4 p-8 text-center"><p role="alert" className="text-sm text-destructive">{error}</p><Button asChild variant="outline"><Link href="/dashboard/subjects">Return to subjects</Link></Button></CardContent></Card></div>;
    if (questions.length === 0) return <div className="mx-auto max-w-2xl p-6"><Card><CardContent className="space-y-4 p-8 text-center"><BrainCircuit className="mx-auto h-10 w-10 text-primary" /><h1 className="text-2xl font-bold">No quiz published yet</h1><p className="text-sm text-muted-foreground">There are no questions for {subjectName} yet. Your administrator will add a diagnostic quiz soon.</p><Button asChild><Link href="/dashboard/subjects">Back to subjects</Link></Button></CardContent></Card></div>;

    const question = questions[currentIdx];
    const progress = ((currentIdx + 1) / questions.length) * 100;
    const answeredCount = Object.keys(answers).length;

    return <div className="mx-auto max-w-5xl space-y-6 p-6"><div className="flex flex-col justify-between gap-4 rounded-xl border bg-card/40 p-4 sm:flex-row sm:items-center"><div className="flex items-center gap-4"><Button variant="outline" size="icon" onClick={() => router.back()}><ChevronLeft className="h-4 w-4" /></Button><div><h2 className="font-headline text-lg font-bold">{subjectName} Diagnostic Quiz</h2><p className="text-xs uppercase tracking-widest text-muted-foreground">Question {currentIdx + 1} of {questions.length} · {answeredCount} answered</p></div></div><div className="flex items-center justify-between gap-4 sm:justify-end"><div className="flex items-center gap-2 font-mono text-xl font-bold text-primary"><Timer className="h-5 w-5" />{formatTime(timeLeft)}</div><Button className="px-6 font-bold" disabled={answeredCount < questions.length || saving} onClick={handleFinish}>{saving ? "Saving results…" : "Finish Quiz"}</Button></div></div>
      {error && <p role="alert" className="rounded-lg border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive-foreground">{error}</p>}
      <div className="grid gap-6 lg:grid-cols-4"><div className="space-y-6 lg:col-span-3"><Progress value={progress} className="h-2" /><Card className="flex min-h-[400px] flex-col"><CardHeader className="flex flex-row items-start justify-between"><div className="space-y-2"><p className="text-xs font-semibold uppercase tracking-widest text-primary">{question.topic} · {question.difficulty ?? "Diagnostic"}</p><CardTitle className="mt-2 text-xl leading-relaxed">{question.text}</CardTitle></div><Button variant="ghost" size="icon" aria-label="Bookmark question" className={bookmarks.includes(question.id) ? "text-primary" : "text-muted-foreground"} onClick={() => setBookmarks((current) => current.includes(question.id) ? current.filter((id) => id !== question.id) : [...current, question.id])}><Bookmark className="h-5 w-5" fill={bookmarks.includes(question.id) ? "currentColor" : "none"} /></Button></CardHeader><CardContent className="flex-grow pt-4"><RadioGroup value={answers[question.id] === undefined ? "" : String(answers[question.id])} onValueChange={(value) => setAnswers((current) => ({ ...current, [question.id]: Number(value) }))} className="space-y-3">{question.options.map((option, index) => <Label key={index} className={"flex cursor-pointer items-center gap-3 rounded-xl border p-4 transition-all " + (answers[question.id] === index ? "border-primary bg-primary/5 ring-1 ring-primary" : "hover:bg-secondary/40")}><RadioGroupItem value={String(index)} /><span className="text-sm font-medium">{option}</span></Label>)}</RadioGroup></CardContent><CardFooter className="flex flex-col gap-6 border-t bg-secondary/20 p-6"><div className="w-full space-y-4"><div className="flex items-center justify-between"><div className="flex items-center gap-2 text-sm font-semibold"><BrainCircuit className="h-4 w-4 text-accent" />How confident are you?</div><span className="font-mono text-sm text-accent">{confidence[question.id] ?? 50}%</span></div><Slider value={[confidence[question.id] ?? 50]} onValueChange={(value) => setConfidence((current) => ({ ...current, [question.id]: value[0] ?? 50 }))} max={100} step={1} /><div className="flex justify-between text-[10px] font-bold uppercase tracking-widest text-muted-foreground"><span>Guessing</span><span>Sure</span></div></div><div className="flex w-full justify-between border-t border-border/50 pt-4"><Button variant="outline" onClick={() => setCurrentIdx((index) => Math.max(0, index - 1))} disabled={currentIdx === 0} className="gap-2"><ChevronLeft className="h-4 w-4" />Previous</Button><Button onClick={() => setCurrentIdx((index) => Math.min(questions.length - 1, index + 1))} disabled={currentIdx === questions.length - 1} className="gap-2">Next Question<ChevronRight className="h-4 w-4" /></Button></div></CardFooter></Card></div><div className="space-y-4"><Card><CardHeader className="pb-3"><CardTitle className="text-sm font-bold uppercase tracking-wider">Question navigator</CardTitle></CardHeader><CardContent><div className="grid grid-cols-5 gap-2">{questions.map((item, index) => <button key={item.id} type="button" onClick={() => setCurrentIdx(index)} aria-label={"Go to question " + (index + 1)} className={"relative flex aspect-square w-full items-center justify-center rounded-md text-xs font-bold transition-all " + (currentIdx === index ? "z-10 scale-110 bg-primary text-white shadow-lg" : answers[item.id] !== undefined ? "border border-primary/20 bg-primary/20 text-primary" : "bg-secondary text-muted-foreground")}>{index + 1}{bookmarks.includes(item.id) && <Bookmark className="absolute -right-1 -top-1 h-3 w-3 fill-accent text-accent" />}</button>)}</div><div className="mt-5 flex items-start gap-2 border-t pt-4 text-xs text-muted-foreground"><Info className="h-4 w-4 shrink-0 text-primary" /><span>Your answers and question position are saved automatically on this account.</span></div></CardContent></Card></div></div>
    </div>;
    }
    