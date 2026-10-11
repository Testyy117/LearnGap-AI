"use client";

    import * as React from "react";
    import { onAuthStateChanged } from "firebase/auth";
    import { Activity, Calendar, Loader2, Target, Trophy, Zap } from "lucide-react";
    import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

    import { auth } from "@/lib/firebase";
    import { getQuizAttempts, type QuizAttempt } from "@/lib/learning-progress";
    import { getSubjectsForUser, type SubjectRecord } from "@/lib/subjects";
    import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

    function attemptDate(attempt: QuizAttempt) {
    return attempt.createdAt?.toDate?.() ?? null;
    }

    export default function PerformanceReportPage() {
    const [attempts, setAttempts] = React.useState<QuizAttempt[]>([]);
    const [subjects, setSubjects] = React.useState<SubjectRecord[]>([]);
    const [loading, setLoading] = React.useState(true);
    const [error, setError] = React.useState("");

    React.useEffect(() => {
      let cancelled = false;
      const unsubscribe = onAuthStateChanged(auth, async (user) => {
        if (!user) return;
        try {
          const [nextAttempts, nextSubjects] = await Promise.all([getQuizAttempts(user.uid, 180), getSubjectsForUser(user.uid)]);
          if (!cancelled) { setAttempts(nextAttempts); setSubjects(nextSubjects); }
        } catch {
          if (!cancelled) setError("Your learning history could not be loaded. Please refresh and try again.");
        } finally {
          if (!cancelled) setLoading(false);
        }
      });
      return () => { cancelled = true; unsubscribe(); };
    }, []);

    const now = new Date();
    const monthlyData = Array.from({ length: 6 }, (_, index) => {
      const month = new Date(now.getFullYear(), now.getMonth() - 5 + index, 1);
      const monthAttempts = attempts.filter((attempt) => {
        const date = attemptDate(attempt);
        return date && date.getFullYear() === month.getFullYear() && date.getMonth() === month.getMonth();
      });
      const performance = monthAttempts.length ? Math.round(monthAttempts.reduce((sum, attempt) => sum + (attempt.score ?? 0), 0) / monthAttempts.length) : 0;
      return { month: month.toLocaleString(undefined, { month: "short" }), performance, attempts: monthAttempts.length };
    });
    const heatmapDays = Array.from({ length: 35 }, (_, index) => {
      const date = new Date(now.getFullYear(), now.getMonth(), now.getDate() - (34 - index));
      const count = attempts.filter((attempt) => {
        const created = attemptDate(attempt);
        return created && created.toDateString() === date.toDateString();
      }).length;
      return { id: index, date, count, intensity: Math.min(5, count) };
    });
    const averageScore = attempts.length ? Math.round(attempts.reduce((sum, attempt) => sum + (attempt.score ?? 0), 0) / attempts.length) : 0;
    const averageSecondsPerQuestion = attempts.length ? Math.round(attempts.reduce((sum, attempt) => sum + (attempt.durationSeconds ?? 0) / Math.max(1, attempt.totalQuestions ?? 1), 0) / attempts.length) : 0;
    const activeSubjects = subjects.filter((subject) => subject.attemptCount > 0).length;

    const intensityColor = (level: number) => {
      if (level >= 5) return "bg-primary";
      if (level === 4) return "bg-primary/80";
      if (level === 3) return "bg-primary/60";
      if (level === 2) return "bg-primary/40";
      if (level === 1) return "bg-primary/20";
      return "bg-secondary/20";
    };

    if (loading) return <div className="flex min-h-[60vh] items-center justify-center"><div className="flex items-center gap-3 text-sm text-muted-foreground"><Loader2 className="h-5 w-5 animate-spin text-primary" />Loading your progress…</div></div>;

    return <div className="mx-auto max-w-7xl space-y-8 p-6 lg:p-8"><div className="flex flex-col justify-between gap-4 md:flex-row md:items-end"><div><p className="text-sm font-semibold uppercase tracking-widest text-primary">Your learning record</p><h1 className="font-headline text-3xl font-bold">Mastery Metrics</h1><p className="mt-2 text-muted-foreground">Progress calculated from your saved quizzes and subject records.</p></div><Card className="flex items-center gap-3 border-none bg-secondary/20 px-4 py-2"><Calendar className="h-4 w-4 text-primary" /><span className="text-sm font-semibold">Last 6 months</span></Card></div>
      {error && <p role="alert" className="rounded-lg border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive-foreground">{error}</p>}
      {attempts.length === 0 && <div className="rounded-xl border border-dashed p-5 text-sm text-muted-foreground">Your report will fill in after you complete your first published quiz.</div>}
      <div className="grid gap-6 lg:grid-cols-3"><Card className="lg:col-span-2"><CardHeader><CardTitle className="text-lg">Quiz score history</CardTitle><CardDescription>Monthly average score for completed quizzes</CardDescription></CardHeader><CardContent className="h-[330px]">{attempts.length === 0 ? <div className="flex h-full items-center justify-center text-sm text-muted-foreground">No quiz scores yet.</div> : <ResponsiveContainer width="100%" height="100%"><BarChart data={monthlyData}><CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" /><XAxis dataKey="month" axisLine={false} tickLine={false} /><YAxis domain={[0, 100]} axisLine={false} tickLine={false} /><Tooltip cursor={{ fill: "hsl(var(--secondary)/.4)" }} contentStyle={{ backgroundColor: "hsl(var(--card))", borderRadius: "8px", border: "none" }} /><Bar dataKey="performance" name="Average score (%)" radius={[4, 4, 0, 0]} fill="hsl(var(--primary))" barSize={32} /></BarChart></ResponsiveContainer>}</CardContent></Card><Card><CardHeader><CardTitle className="text-sm font-bold uppercase tracking-widest">Study activity</CardTitle><CardDescription>Daily completed quiz count · last 35 days</CardDescription></CardHeader><CardContent><div className="grid grid-cols-7 gap-1.5">{heatmapDays.map((day) => <div key={day.id} className={"aspect-square rounded-sm " + intensityColor(day.intensity)} title={day.date.toLocaleDateString() + ": " + day.count + " quizzes"} />)}</div><div className="mt-4 flex items-center justify-end gap-1.5 text-[10px] font-bold uppercase tracking-widest text-muted-foreground"><span>Less</span><span className="h-3 w-3 rounded-sm bg-secondary/20" /><span className="h-3 w-3 rounded-sm bg-primary/20" /><span className="h-3 w-3 rounded-sm bg-primary/60" /><span className="h-3 w-3 rounded-sm bg-primary" /><span>More</span></div></CardContent></Card></div>
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4"><Card><CardContent className="flex items-center gap-4 p-5"><Activity className="h-6 w-6 text-primary" /><div><p className="text-xs uppercase tracking-widest text-muted-foreground">Quizzes completed</p><p className="text-2xl font-bold">{attempts.length}</p></div></CardContent></Card><Card><CardContent className="flex items-center gap-4 p-5"><Trophy className="h-6 w-6 text-accent" /><div><p className="text-xs uppercase tracking-widest text-muted-foreground">Average score</p><p className="text-2xl font-bold">{attempts.length ? averageScore + "%" : "—"}</p></div></CardContent></Card><Card><CardContent className="flex items-center gap-4 p-5"><Zap className="h-6 w-6 text-primary" /><div><p className="text-xs uppercase tracking-widest text-muted-foreground">Avg. seconds / question</p><p className="text-2xl font-bold">{attempts.length ? averageSecondsPerQuestion + "s" : "—"}</p></div></CardContent></Card><Card><CardContent className="flex items-center gap-4 p-5"><Target className="h-6 w-6 text-primary" /><div><p className="text-xs uppercase tracking-widest text-muted-foreground">Subjects attempted</p><p className="text-2xl font-bold">{activeSubjects}</p></div></CardContent></Card></div>
    </div>;
    }
    