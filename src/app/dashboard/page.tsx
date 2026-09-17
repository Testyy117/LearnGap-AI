"use client";

    import Link from "next/link";
    import { onAuthStateChanged } from "firebase/auth";
    import { useRouter } from "next/navigation";
    import { useEffect, useMemo, useState } from "react";
    import { ArrowRight, BookOpen, Loader2, Target, TrendingUp, Trophy } from "lucide-react";

    import { auth } from "@/lib/firebase";
    import { getSubjectsForUser, type SubjectRecord } from "@/lib/subjects";
    import { ensureUserProfile, type UserProfile } from "@/lib/user-profile";
    import { Badge } from "@/components/ui/badge";
    import { Button } from "@/components/ui/button";
    import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
    import { Progress } from "@/components/ui/progress";

    const colorClasses: Record<string, { surface: string; text: string }> = {
    primary: { surface: "bg-primary/10", text: "text-primary" },
    blue: { surface: "bg-blue-500/10", text: "text-blue-400" },
    red: { surface: "bg-red-500/10", text: "text-red-400" },
    green: { surface: "bg-green-500/10", text: "text-green-400" },
    yellow: { surface: "bg-yellow-500/10", text: "text-yellow-400" },
    purple: { surface: "bg-purple-500/10", text: "text-purple-400" },
    };

    export default function DashboardPage() {
    const router = useRouter();
    const [profile, setProfile] = useState<UserProfile | null>(null);
    const [subjects, setSubjects] = useState<SubjectRecord[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
      let cancelled = false;
      const unsubscribe = onAuthStateChanged(auth, async (user) => {
        if (!user) { router.replace("/login"); return; }
        setLoading(true);
        setError("");
        try {
          const results = await Promise.all([ensureUserProfile(user), getSubjectsForUser(user.uid)]);
          if (!cancelled) { setProfile(results[0]); setSubjects(results[1]); }
        } catch {
          if (!cancelled) setError("We couldn’t load your dashboard data. Please refresh and try again.");
        } finally {
          if (!cancelled) setLoading(false);
        }
      });
      return () => { cancelled = true; unsubscribe(); };
    }, [router]);

    const averageProgress = useMemo(() => subjects.length ? Math.round(subjects.reduce((total, subject) => total + subject.progress, 0) / subjects.length) : 0, [subjects]);
    const completedSubjects = subjects.filter((subject) => subject.progress >= 100).length;
    const firstName = profile?.displayName?.split(" ")[0] || "Learner";

    if (loading) return <div className="flex min-h-[60vh] items-center justify-center"><div className="flex items-center gap-3 text-sm text-muted-foreground"><Loader2 className="h-5 w-5 animate-spin text-primary" />Loading your dashboard…</div></div>;

    return <div className="mx-auto max-w-7xl space-y-8 p-6 lg:p-8">
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end"><div><p className="mb-2 text-sm font-semibold uppercase tracking-widest text-primary">Your learning hub</p><h1 className="font-headline text-3xl font-bold tracking-tight sm:text-4xl">Welcome back, {firstName}</h1><p className="mt-2 text-muted-foreground">Your progress is based on the latest data in your account.</p></div><Button asChild className="gap-2"><Link href="/dashboard/subjects">Browse subjects <ArrowRight className="h-4 w-4" /></Link></Button></div>
      {error && <div role="alert" className="rounded-xl border border-destructive/30 bg-destructive/10 p-4 text-sm text-destructive-foreground">{error}</div>}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card><CardContent className="flex items-center gap-4 p-5"><div className="rounded-xl bg-primary/10 p-3 text-primary"><TrendingUp className="h-5 w-5" /></div><div><p className="text-xs uppercase tracking-widest text-muted-foreground">Average progress</p><p className="text-2xl font-bold">{averageProgress}%</p></div></CardContent></Card>
        <Card><CardContent className="flex items-center gap-4 p-5"><div className="rounded-xl bg-accent/10 p-3 text-accent"><BookOpen className="h-5 w-5" /></div><div><p className="text-xs uppercase tracking-widest text-muted-foreground">Subjects</p><p className="text-2xl font-bold">{subjects.length}</p></div></CardContent></Card>
        <Card><CardContent className="flex items-center gap-4 p-5"><div className="rounded-xl bg-green-500/10 p-3 text-green-400"><Trophy className="h-5 w-5" /></div><div><p className="text-xs uppercase tracking-widest text-muted-foreground">Completed</p><p className="text-2xl font-bold">{completedSubjects}</p></div></CardContent></Card>
        <Card><CardContent className="flex items-center gap-4 p-5"><div className="rounded-xl bg-purple-500/10 p-3 text-purple-400"><Target className="h-5 w-5" /></div><div><p className="text-xs uppercase tracking-widest text-muted-foreground">XP</p><p className="text-2xl font-bold">{(profile?.xp ?? 0).toLocaleString()}</p></div></CardContent></Card>
      </div>
      <Card><CardHeader className="flex flex-row items-center justify-between"><CardTitle>Subject progress</CardTitle><Link href="/dashboard/subjects" className="text-sm font-medium text-primary hover:underline">View all</Link></CardHeader><CardContent>{subjects.length === 0 ? <div className="rounded-xl border border-dashed p-8 text-center text-sm text-muted-foreground">Welcome to LearnGap. Your starter subjects will appear here while your curriculum is being prepared.</div> : <div className="grid gap-4 md:grid-cols-2">{subjects.slice(0, 6).map((subject) => { const colors = colorClasses[subject.colorKey] ?? colorClasses.primary; return <Link key={subject.id} href={"/dashboard/quiz/" + subject.id} className="group rounded-xl border p-4 transition-colors hover:border-primary/50 hover:bg-secondary/20"><div className="mb-3 flex items-start justify-between gap-3"><div className="flex items-center gap-3"><div className={"rounded-lg p-2 " + colors.surface}><BookOpen className={"h-4 w-4 " + colors.text} /></div><div><h3 className="font-semibold group-hover:text-primary">{subject.name}</h3><p className="text-xs text-muted-foreground">{subject.status}</p></div></div><Badge variant="secondary">{subject.progress}%</Badge></div><Progress value={subject.progress} className="h-2" /></Link>; })}</div>}</CardContent></Card>
    </div>;
    }
    