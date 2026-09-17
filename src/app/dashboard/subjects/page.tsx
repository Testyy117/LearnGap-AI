"use client";

    import { onAuthStateChanged } from "firebase/auth";
    import Link from "next/link";
    import { useRouter } from "next/navigation";
    import { useEffect, useState } from "react";
    import { ArrowRight, Atom, Beaker, BookMarked, Calculator, Clock, Dna, Loader2, PlayCircle, Trophy } from "lucide-react";

    import { auth } from "@/lib/firebase";
    import { getSubjectsForUser, type SubjectRecord } from "@/lib/subjects";
    import { Badge } from "@/components/ui/badge";
    import { Button } from "@/components/ui/button";
    import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
    import { Progress } from "@/components/ui/progress";

    const iconMap = { calculator: Calculator, atom: Atom, dna: Dna, beaker: Beaker, book: BookMarked };
    const colorMap: Record<string, { surface: string; text: string; progress: string }> = { primary: { surface: "bg-primary/10", text: "text-primary", progress: "bg-primary" }, blue: { surface: "bg-blue-500/10", text: "text-blue-400", progress: "bg-blue-500" }, red: { surface: "bg-red-500/10", text: "text-red-400", progress: "bg-red-500" }, green: { surface: "bg-green-500/10", text: "text-green-400", progress: "bg-green-500" }, yellow: { surface: "bg-yellow-500/10", text: "text-yellow-400", progress: "bg-yellow-500" }, purple: { surface: "bg-purple-500/10", text: "text-purple-400", progress: "bg-purple-500" } };

    export default function SubjectsPage() {
    const router = useRouter();
    const [subjects, setSubjects] = useState<SubjectRecord[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
      let cancelled = false;
      const unsubscribe = onAuthStateChanged(auth, async (user) => {
        if (!user) { router.replace("/login"); return; }
        try { const nextSubjects = await getSubjectsForUser(user.uid); if (!cancelled) setSubjects(nextSubjects); } catch { if (!cancelled) setError("We couldn’t load your subjects. Please refresh and try again."); } finally { if (!cancelled) setLoading(false); }
      });
      return () => { cancelled = true; unsubscribe(); };
    }, [router]);

    if (loading) return <div className="flex min-h-[60vh] items-center justify-center"><div className="flex items-center gap-3 text-sm text-muted-foreground"><Loader2 className="h-5 w-5 animate-spin text-primary" />Loading your subjects…</div></div>;

    return <div className="mx-auto max-w-7xl space-y-8 p-6 lg:p-8"><div className="flex flex-col justify-between gap-4 md:flex-row md:items-end"><div className="space-y-2"><p className="text-sm font-semibold uppercase tracking-widest text-primary">Your learning library</p><h1 className="font-headline text-3xl font-bold">Your Subjects</h1><p className="text-muted-foreground">Your courses and progress are loaded from your account.</p></div><Button variant="outline" asChild><Link href="/dashboard">Back to dashboard</Link></Button></div>
      {error && <div role="alert" className="rounded-xl border border-destructive/30 bg-destructive/10 p-4 text-sm text-destructive-foreground">{error}</div>}
      {subjects.length === 0 ? <Card><CardContent className="p-10 text-center"><BookMarked className="mx-auto mb-4 h-10 w-10 text-muted-foreground" /><h2 className="text-lg font-semibold">No subjects yet</h2><p className="mt-2 text-sm text-muted-foreground">Your administrator can add subjects to the Firestore subjects collection.</p></CardContent></Card> : <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">{subjects.map((subject) => { const Icon = iconMap[subject.iconKey as keyof typeof iconMap] ?? BookMarked; const colors = colorMap[subject.colorKey] ?? colorMap.primary; return <Card key={subject.id} className="group flex flex-col overflow-hidden transition-all duration-300 hover:border-primary/50"><CardHeader className={"relative flex h-32 items-center justify-center " + colors.surface}><Icon className={"h-16 w-16 " + colors.text + " transition-transform duration-500 group-hover:scale-110"} /><div className="absolute left-4 top-4 flex gap-2">{subject.tags.map((tag) => <Badge key={tag} variant="secondary" className="bg-background/80 text-[10px]">{tag}</Badge>)}</div></CardHeader><CardContent className="flex-1 space-y-5 p-6"><div><h3 className="mb-2 font-headline text-xl font-bold group-hover:text-primary">{subject.name}</h3><p className="line-clamp-2 text-sm text-muted-foreground">{subject.description}</p></div><div className="space-y-3"><div className="flex items-center justify-between text-xs font-semibold"><span className="text-muted-foreground">Mastery level</span><span>{subject.progress}%</span></div><Progress value={subject.progress} className="h-2" indicatorClassName={colors.progress} /><div className="grid grid-cols-2 gap-3 text-xs text-muted-foreground"><span className="flex items-center gap-2"><Clock className="h-3.5 w-3.5" />{subject.completed}/{subject.modules} modules</span><span className="flex items-center justify-end gap-2"><Trophy className="h-3.5 w-3.5" />{subject.status}</span></div></div></CardContent><CardFooter className="flex gap-2 p-6 pt-0"><Button asChild className="h-10 flex-1 gap-2"><Link href={"/dashboard/quiz/" + subject.id}><PlayCircle className="h-4 w-4" />Start quiz</Link></Button><Button asChild variant="outline" size="icon" className="h-10 w-10"><Link href={"/dashboard/quiz/" + subject.id} aria-label={"Open " + subject.name}><ArrowRight className="h-4 w-4" /></Link></Button></CardFooter></Card>; })}</div>}
    </div>;
    }
    