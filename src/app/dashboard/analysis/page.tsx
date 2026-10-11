"use client";

    import * as React from "react";
    import Link from "next/link";
    import { onAuthStateChanged } from "firebase/auth";
    import { useRouter } from "next/navigation";
    import { AlertTriangle, BrainCircuit, CheckCircle2, Lightbulb, Loader2, Sparkles, Target } from "lucide-react";
    import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip as ChartTooltip } from "recharts";

    import { auth } from "@/lib/firebase";
    import { getQuizAttempt, getQuizAttempts, type QuizAttempt } from "@/lib/learning-progress";
    import { Badge } from "@/components/ui/badge";
    import { Button } from "@/components/ui/button";
    import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

    type Gap = { topic: string; description: string; accuracy: number; confidence: number; isMisconception: boolean; recommendation: string };
    type Analysis = { overallInsight: string; gapSummary: { totalGaps: number; topicsWithGaps: string[]; misconceptionCount: number }; detectedGaps: Gap[] };

    function createAnalysis(attempt: QuizAttempt): Analysis {
    const value = attempt.analysis as Partial<Analysis> | undefined;
    if (value && typeof value.overallInsight === "string" && Array.isArray(value.detectedGaps)) {
      return {
        overallInsight: value.overallInsight,
        gapSummary: value.gapSummary ?? { totalGaps: value.detectedGaps.length, topicsWithGaps: value.detectedGaps.map((gap) => gap.topic), misconceptionCount: value.detectedGaps.filter((gap) => gap.isMisconception).length },
        detectedGaps: value.detectedGaps,
      };
    }

    const grouped = new Map<string, typeof attempt.responses>();
    (attempt.responses ?? []).forEach((response) => grouped.set(response.topic || "General", [...(grouped.get(response.topic || "General") ?? []), response]));
    const detectedGaps = Array.from(grouped.entries()).map(([topic, responses]) => {
      const accuracy = responses.length ? Math.round(responses.filter((response) => response.isCorrect).length / responses.length * 100) : 0;
      const confidence = responses.length ? Math.round(responses.reduce((sum, response) => sum + response.confidence, 0) / responses.length) : 0;
      return { topic, accuracy, confidence, isMisconception: accuracy < 50 && confidence >= 70, description: "You answered " + responses.filter((response) => response.isCorrect).length + " of " + responses.length + " questions correctly in this topic.", recommendation: accuracy < 100 ? "Review this topic and try another diagnostic quiz." : "Keep this topic fresh with occasional review." };
    }).filter((gap) => gap.accuracy < 100);
    const score = attempt.score ?? 0;
    return {
      overallInsight: "You scored " + score + "% on " + attempt.subjectName + ". Use the topic results below to choose what to review next.",
      gapSummary: { totalGaps: detectedGaps.length, topicsWithGaps: detectedGaps.map((gap) => gap.topic), misconceptionCount: detectedGaps.filter((gap) => gap.isMisconception).length },
      detectedGaps,
    };
    }

    export default function AnalysisPage() {
    const router = useRouter();
    const [attempt, setAttempt] = React.useState<QuizAttempt | null>(null);
    const [loading, setLoading] = React.useState(true);
    const [error, setError] = React.useState("");

    React.useEffect(() => {
      let cancelled = false;
      const attemptId = typeof window === "undefined" ? null : new URLSearchParams(window.location.search).get("attemptId");
      const unsubscribe = onAuthStateChanged(auth, async (user) => {
        if (!user) { router.replace("/login"); return; }
        try {
          const latest = attemptId ? await getQuizAttempt(user.uid, attemptId) : (await getQuizAttempts(user.uid, 1))[0] ?? null;
          if (!cancelled) setAttempt(latest);
        } catch {
          if (!cancelled) setError("Your saved report could not be loaded. Please refresh and try again.");
        } finally {
          if (!cancelled) setLoading(false);
        }
      });
      return () => { cancelled = true; unsubscribe(); };
    }, [router]);

    if (loading) return <div className="flex min-h-[60vh] items-center justify-center"><div className="flex items-center gap-3 text-sm text-muted-foreground"><Loader2 className="h-5 w-5 animate-spin text-primary" />Loading your diagnostic report…</div></div>;
    if (!attempt) return <div className="mx-auto max-w-2xl p-6"><Card><CardContent className="space-y-4 p-8 text-center"><BrainCircuit className="mx-auto h-10 w-10 text-primary" /><h1 className="text-2xl font-bold">Your first report starts with a quiz</h1><p className="text-sm text-muted-foreground">Complete a published subject quiz and your results and recommendations will appear here.</p>{error && <p role="alert" className="text-sm text-destructive">{error}</p>}<Button asChild><Link href="/dashboard/subjects">Browse subjects</Link></Button></CardContent></Card></div>;

    const data = createAnalysis(attempt);
    const score = Math.max(0, Math.min(100, attempt.score ?? 0));
    const gapValue = 100 - score;
    const misconceptionCount = Math.min(data.gapSummary.misconceptionCount, data.detectedGaps.length);
    const misconceptionValue = data.detectedGaps.length ? Math.round(gapValue * misconceptionCount / data.detectedGaps.length) : 0;
    const pieData = [
      { name: "Correct answers", value: score, color: "hsl(var(--accent))" },
      { name: "Other gaps", value: Math.max(0, gapValue - misconceptionValue), color: "hsl(var(--primary))" },
      { name: "High-confidence gaps", value: misconceptionValue, color: "hsl(var(--destructive))" },
    ].filter((item) => item.value > 0);
    const strengths = (attempt.responses ?? []).reduce((groups, response) => {
      const key = response.topic || "General";
      const current = groups.get(key) ?? { total: 0, correct: 0 };
      current.total += 1;
      if (response.isCorrect) current.correct += 1;
      groups.set(key, current);
      return groups;
    }, new Map<string, { total: number; correct: number }>());
    const strongTopics = Array.from(strengths.entries()).filter(([, value]) => value.total && value.correct / value.total >= 0.8);

    return <div className="mx-auto max-w-7xl space-y-8 p-6 lg:p-8"><div className="flex flex-col justify-between gap-4 md:flex-row md:items-end"><div><p className="text-sm font-semibold uppercase tracking-widest text-primary">{attempt.subjectName} · {score}% score</p><h1 className="font-headline text-3xl font-bold">Diagnostic Report</h1><p className="mt-2 text-muted-foreground">Your saved answers, confidence, and topic-level results.</p></div><Button asChild className="gap-2"><Link href="/dashboard/plan">Build study plan<Target className="h-4 w-4" /></Link></Button></div>
      {error && <p role="alert" className="rounded-lg border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive-foreground">{error}</p>}
      <div className="rounded-2xl border border-primary/20 bg-primary/10 p-6"><div className="flex items-start gap-4"><div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-primary/20 text-primary"><Sparkles className="h-6 w-6" /></div><div><h2 className="mb-2 text-xs font-bold uppercase tracking-widest text-primary">Quiz insight</h2><p className="text-lg font-medium leading-relaxed">{data.overallInsight}</p></div></div></div>
      <div className="grid gap-6 lg:grid-cols-3"><Card className="flex flex-col"><CardHeader><CardTitle className="text-lg">Answer summary</CardTitle><CardDescription>{attempt.correctCount} correct out of {attempt.totalQuestions}</CardDescription></CardHeader><CardContent className="flex flex-1 flex-col items-center justify-center"><div className="h-[230px] w-full"><ResponsiveContainer width="100%" height="100%"><PieChart><Pie data={pieData} innerRadius={58} outerRadius={82} paddingAngle={4} dataKey="value">{pieData.map((item, index) => <Cell key={index} fill={item.color} />)}</Pie><ChartTooltip /></PieChart></ResponsiveContainer></div><div className="w-full space-y-2">{pieData.map((item) => <div key={item.name} className="flex items-center justify-between rounded-lg bg-secondary/30 p-2 text-xs"><span>{item.name}</span><strong>{item.value}%</strong></div>)}</div></CardContent></Card><div className="space-y-6 lg:col-span-2"><Card><CardHeader className="flex flex-row items-center justify-between"><div><CardTitle className="text-lg">Topics to review</CardTitle><CardDescription>Recommendations from this saved attempt</CardDescription></div><Badge variant="outline" className="border-primary font-bold text-primary">{data.gapSummary.totalGaps} topics</Badge></CardHeader><CardContent className="space-y-4">{data.detectedGaps.length === 0 ? <div className="rounded-xl border border-dashed p-6 text-center text-sm text-muted-foreground">No topic gaps were detected in this attempt. Keep practicing to maintain your mastery.</div> : data.detectedGaps.map((gap, index) => <div key={gap.topic + index} className={"rounded-xl border p-4 " + (gap.isMisconception ? "border-destructive/20 bg-destructive/5" : "")}><div className="flex flex-wrap items-center justify-between gap-2"><h3 className="font-bold">{gap.topic}</h3>{gap.isMisconception && <Badge variant="destructive"><AlertTriangle className="mr-1 h-3 w-3" />High-confidence gap</Badge>}</div><p className="mt-2 text-sm text-muted-foreground">{gap.description}</p><div className="mt-3 flex flex-wrap gap-4 text-xs"><span>Accuracy: <strong>{gap.accuracy}%</strong></span><span>Confidence: <strong>{gap.confidence}%</strong></span></div><p className="mt-3 flex items-start gap-2 text-xs"><Lightbulb className="h-4 w-4 shrink-0 text-primary" /><span>{gap.recommendation}</span></p></div>)}</CardContent></Card></div></div>
      <div className="grid gap-6 md:grid-cols-2"><Card><CardHeader><CardTitle className="flex items-center gap-2 text-sm"><CheckCircle2 className="h-4 w-4 text-accent" />Your strengths</CardTitle></CardHeader><CardContent className="space-y-2">{strongTopics.length ? strongTopics.map(([topic, value]) => <div key={topic} className="rounded-lg border border-accent/10 bg-background/50 p-3 text-sm">{topic}: {Math.round(value.correct / value.total * 100)}% accuracy</div>) : <p className="text-sm text-muted-foreground">More quiz attempts will reveal your strongest topics.</p>}</CardContent></Card><Card><CardHeader><CardTitle className="flex items-center gap-2 text-sm"><BrainCircuit className="h-4 w-4 text-primary" />Next steps</CardTitle></CardHeader><CardContent className="space-y-3">{data.detectedGaps.slice(0, 3).map((gap, index) => <div key={gap.topic} className="flex items-center gap-3"><span className="flex h-7 w-7 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">{index + 1}</span><p className="text-sm text-muted-foreground">{gap.recommendation} <strong className="text-foreground">{gap.topic}</strong></p></div>)}{data.detectedGaps.length === 0 && <p className="text-sm text-muted-foreground">Keep using published quizzes to build your mastery record.</p>}</CardContent></Card></div>
    </div>;
    }
    