"use client";

    import * as React from "react";
    import Link from "next/link";
    import { onAuthStateChanged, type User } from "firebase/auth";
    import { AlertCircle, ArrowRight, Calendar, ChevronRight, Loader2, Sparkles, Target } from "lucide-react";

    import { aiPrioritizedStudyPlan, type AiPrioritizedStudyPlanOutput } from "@/ai/flows/ai-prioritized-study-plan";
    import { auth } from "@/lib/firebase";
    import { getQuizAttempts, type QuizAttempt } from "@/lib/learning-progress";
    import { getSubjectsForUser, type SubjectRecord } from "@/lib/subjects";
    import { Badge } from "@/components/ui/badge";
    import { Button } from "@/components/ui/button";
    import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
    import { Progress } from "@/components/ui/progress";

    type GapInput = { topic: string; accuracy: number; confidence: number; misconceptionDetail?: string };
    type PlanItem = { topic: string; recommendation: string; reasoning: string; urgency: string };

    function getLearningGaps(attempt: QuizAttempt): GapInput[] {
    const analysis = attempt.analysis as { detectedGaps?: Array<{ topic?: string; accuracy?: number; confidence?: number; description?: string; isMisconception?: boolean }> } | undefined;
    if (analysis?.detectedGaps?.length) return analysis.detectedGaps.map((gap) => ({ topic: gap.topic ?? "General", accuracy: gap.accuracy ?? 0, confidence: gap.confidence ?? 0, ...(gap.isMisconception ? { misconceptionDetail: gap.description } : {}) }));
    const grouped = new Map<string, typeof attempt.responses>();
    (attempt.responses ?? []).forEach((response) => grouped.set(response.topic || "General", [...(grouped.get(response.topic || "General") ?? []), response]));
    return Array.from(grouped.entries()).map(([topic, responses]) => ({ topic, accuracy: Math.round(responses.filter((response) => response.isCorrect).length / Math.max(1, responses.length) * 100), confidence: Math.round(responses.reduce((sum, response) => sum + response.confidence, 0) / Math.max(1, responses.length)) })).filter((gap) => gap.accuracy < 100);
    }

    function fallbackPlan(gaps: GapInput[]): AiPrioritizedStudyPlanOutput {
    const studyPlan: PlanItem[] = gaps.map((gap) => ({
      topic: gap.topic,
      recommendation: gap.misconceptionDetail ? "Review the misconception, then retry a short quiz on this topic." : "Review this topic and complete another published quiz.",
      reasoning: "Your saved quiz accuracy for this topic is " + gap.accuracy + "%.",
      urgency: gap.accuracy < 50 ? "High" : gap.accuracy < 80 ? "Moderate" : "Low",
    }));
    return { overallInsight: studyPlan.length ? "Your study priorities are based on your latest saved quiz results." : "Your latest quiz shows no topic gaps. Keep practicing to maintain your progress.", studyPlan } as AiPrioritizedStudyPlanOutput;
    }

    export default function StudyPlanPage() {
    const [user, setUser] = React.useState<User | null>(null);
    const [plan, setPlan] = React.useState<AiPrioritizedStudyPlanOutput | null>(null);
    const [subjects, setSubjects] = React.useState<SubjectRecord[]>([]);
    const [loading, setLoading] = React.useState(true);
    const [refreshing, setRefreshing] = React.useState(false);
    const [hasAttempt, setHasAttempt] = React.useState(false);
    const [error, setError] = React.useState("");

    const loadPlan = React.useCallback(async (activeUser: User) => {
      setRefreshing(true);
      setError("");
      try {
        const [attempts, nextSubjects] = await Promise.all([getQuizAttempts(activeUser.uid, 1), getSubjectsForUser(activeUser.uid)]);
        setSubjects(nextSubjects);
        const latest = attempts[0];
        setHasAttempt(Boolean(latest));
        if (!latest) { setPlan(null); return; }
        const gaps = getLearningGaps(latest);
        if (!gaps.length) { setPlan(fallbackPlan([])); return; }
        try {
          const result = await aiPrioritizedStudyPlan({ learningGaps: gaps });
          setPlan(result);
        } catch {
          setPlan(fallbackPlan(gaps));
        }
      } catch {
        setError("Your saved learning data could not be loaded. Please refresh and try again.");
      } finally {
        setRefreshing(false);
        setLoading(false);
      }
    }, []);

    React.useEffect(() => {
      const unsubscribe = onAuthStateChanged(auth, (activeUser) => {
        setUser(activeUser);
        if (activeUser) void loadPlan(activeUser);
      });
      return unsubscribe;
    }, [loadPlan]);

    if (loading) return <div className="flex min-h-[60vh] items-center justify-center"><div className="flex items-center gap-3 text-sm text-muted-foreground"><Loader2 className="h-5 w-5 animate-spin text-primary" />Building your study plan…</div></div>;
    if (!hasAttempt) return <div className="mx-auto max-w-2xl p-6"><Card><CardContent className="space-y-4 p-8 text-center"><Target className="mx-auto h-10 w-10 text-primary" /><h1 className="text-2xl font-bold">Your plan starts with a quiz</h1><p className="text-sm text-muted-foreground">Complete a published quiz so your priorities are based on your own results.</p>{error && <p role="alert" className="text-sm text-destructive">{error}</p>}<Button asChild><Link href="/dashboard/subjects">Browse subjects</Link></Button></CardContent></Card></div>;

    const refresh = () => { if (user) void loadPlan(user); };
    const planItems = (plan?.studyPlan ?? []) as PlanItem[];

    return <div className="mx-auto max-w-7xl space-y-8 p-6 lg:p-8"><div className="flex flex-col justify-between gap-4 md:flex-row md:items-end"><div><p className="text-sm font-semibold uppercase tracking-widest text-primary">Based on your latest quiz</p><h1 className="font-headline text-3xl font-bold">Priority Study Plan</h1><p className="mt-2 text-muted-foreground">Study priorities use your saved quiz performance and subject progress.</p></div><Button variant="outline" onClick={refresh} disabled={refreshing} className="gap-2">{refreshing ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}Refresh plan</Button></div>
      {error && <p role="alert" className="rounded-lg border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive-foreground">{error}</p>}
      {plan && <div className="rounded-2xl border border-primary/20 bg-primary/10 p-6"><div className="flex items-start gap-4"><Sparkles className="mt-1 h-6 w-6 shrink-0 text-primary" /><div><p className="mb-1 text-xs font-bold uppercase tracking-widest text-primary">Study overview</p><p className="font-medium leading-relaxed">{plan.overallInsight}</p></div></div></div>}
      <div className="grid gap-6 lg:grid-cols-3"><div className="space-y-4 lg:col-span-2"><h2 className="px-1 text-xl font-bold">Recommended actions</h2>{planItems.length ? planItems.map((item, index) => <Card key={item.topic + index}><CardContent className="flex gap-4 p-5"><div className={"w-1.5 shrink-0 rounded-full " + (item.urgency === "High" ? "bg-destructive" : item.urgency === "Moderate" ? "bg-accent" : "bg-primary")} /><div className="flex-1 space-y-3"><div className="flex flex-wrap items-center justify-between gap-2"><h3 className="text-lg font-bold">{item.topic}</h3><Badge variant="secondary">{item.urgency} priority</Badge></div><div><p className="mb-1 flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-muted-foreground"><Target className="h-3 w-3" />Recommendation</p><p className="text-sm">{item.recommendation}</p></div><p className="rounded-lg border bg-secondary/30 p-3 text-xs text-muted-foreground">{item.reasoning}</p></div></CardContent></Card>) : <Card><CardContent className="p-6 text-sm text-muted-foreground">Your latest quiz has no review gaps. Browse subjects and continue practicing.</CardContent></Card>}</div>
        <div className="space-y-4"><Card><CardHeader><CardTitle className="flex items-center gap-2 text-lg"><Calendar className="h-5 w-5 text-primary" />Your subject progress</CardTitle><CardDescription>Saved mastery for your curriculum</CardDescription></CardHeader><CardContent className="space-y-4">{subjects.length ? subjects.map((subject) => <div key={subject.id} className="space-y-2"><div className="flex justify-between gap-2 text-xs"><span className="truncate font-medium">{subject.name}</span><span>{subject.progress}%</span></div><Progress value={subject.progress} className="h-2" /></div>) : <p className="text-sm text-muted-foreground">No global subjects have been published yet.</p>}<Button asChild variant="outline" className="w-full gap-2"><Link href="/dashboard/subjects">Open subjects<ArrowRight className="h-4 w-4" /></Link></Button></CardContent></Card><Card className="bg-secondary/20"><CardContent className="flex gap-3 p-5"><AlertCircle className="h-5 w-5 shrink-0 text-primary" /><p className="text-xs leading-relaxed text-muted-foreground">Your plan refreshes from your latest saved quiz. Complete another quiz to update your study priorities.</p></CardContent></Card></div>
      </div>
    </div>;
    }
    