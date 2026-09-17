"use client";

    import { onAuthStateChanged, type User } from "firebase/auth";
    import { collection, doc, serverTimestamp, setDoc } from "firebase/firestore";
    import { useEffect, useState } from "react";
    import { BookOpen, Loader2, Plus, ShieldCheck } from "lucide-react";

    import { auth, db } from "@/lib/firebase";
    import { getGlobalSubjects, type SubjectRecord } from "@/lib/subjects";
    import { Button } from "@/components/ui/button";
    import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
    import { Input } from "@/components/ui/input";
    import { Label } from "@/components/ui/label";
    import { Textarea } from "@/components/ui/textarea";
    import { useToast } from "@/hooks/use-toast";

    function slugify(value: string) {
    return value.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "") || "subject";
    }

    export default function CurriculumPage() {
    const { toast } = useToast();
    const [currentUser, setCurrentUser] = useState<User | null>(null);
    const [subjects, setSubjects] = useState<SubjectRecord[]>([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [form, setForm] = useState({ name: "", description: "", icon: "book", color: "primary", tags: "", modules: "5" });

    const loadSubjects = async () => {
      try { setSubjects(await getGlobalSubjects()); } catch { setSubjects([]); }
      finally { setLoading(false); }
    };

    useEffect(() => {
      const unsubscribe = onAuthStateChanged(auth, (user) => setCurrentUser(user));
      loadSubjects();
      return unsubscribe;
    }, []);

    const handleSubmit = async () => {
      if (!currentUser || !form.name.trim()) {
        toast({ title: "Add a subject name", description: "A name is required before saving curriculum.", variant: "destructive" });
        return;
      }
      setSaving(true);
      const subjectId = slugify(form.name);
      try {
        await setDoc(doc(db, "subjects", subjectId), {
          name: form.name.trim(),
          description: form.description.trim(),
          icon: form.icon.trim() || "book",
          color: form.color.trim() || "primary",
          tags: form.tags.split(",").map((tag) => tag.trim()).filter(Boolean),
          modules: Math.max(0, Number(form.modules) || 0),
          completed: 0,
          progress: 0,
          status: "Not started",
          createdBy: currentUser.uid,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        }, { merge: true });
        toast({ title: "Subject saved", description: "This global subject is now available to students." });
        setForm({ name: "", description: "", icon: "book", color: "primary", tags: "", modules: "5" });
        await loadSubjects();
      } catch {
        toast({ title: "Could not save subject", description: "Check your administrator permissions and try again.", variant: "destructive" });
      } finally {
        setSaving(false);
      }
    };

    return <div className="mx-auto max-w-5xl space-y-8 p-6 lg:p-8"><div className="flex items-start gap-3"><div className="rounded-xl bg-primary/10 p-3 text-primary"><ShieldCheck className="h-6 w-6" /></div><div><p className="text-[10px] font-bold uppercase tracking-widest text-primary">Admin curriculum</p><h1 className="font-headline text-3xl font-bold">Global Subjects</h1><p className="mt-2 text-muted-foreground">Create the subjects that appear across student dashboards and question publishing.</p></div></div><div className="grid gap-8 lg:grid-cols-[1fr_1.1fr]"><Card><CardHeader><CardTitle className="flex items-center gap-2"><Plus className="h-5 w-5 text-primary" />Add or update subject</CardTitle><CardDescription>The subject ID is generated from its name so questions can link to it consistently.</CardDescription></CardHeader><CardContent className="space-y-4"><div className="space-y-2"><Label>Name</Label><Input value={form.name} onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))} placeholder="e.g. Physics" /></div><div className="space-y-2"><Label>Description</Label><Textarea value={form.description} onChange={(event) => setForm((current) => ({ ...current, description: event.target.value }))} placeholder="What students will learn" /></div><div className="grid gap-4 sm:grid-cols-2"><div className="space-y-2"><Label>Icon key</Label><Input value={form.icon} onChange={(event) => setForm((current) => ({ ...current, icon: event.target.value }))} placeholder="book, atom, dna" /></div><div className="space-y-2"><Label>Color key</Label><Input value={form.color} onChange={(event) => setForm((current) => ({ ...current, color: event.target.value }))} placeholder="primary, blue, green" /></div></div><div className="grid gap-4 sm:grid-cols-2"><div className="space-y-2"><Label>Tags</Label><Input value={form.tags} onChange={(event) => setForm((current) => ({ ...current, tags: event.target.value }))} placeholder="Science, WAEC" /></div><div className="space-y-2"><Label>Module count</Label><Input type="number" min="0" value={form.modules} onChange={(event) => setForm((current) => ({ ...current, modules: event.target.value }))} /></div></div><Button onClick={handleSubmit} disabled={saving} className="w-full gap-2">{saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}Save global subject</Button></CardContent></Card><Card><CardHeader><CardTitle>Published subjects</CardTitle><CardDescription>Students see these subjects automatically after their next dashboard load.</CardDescription></CardHeader><CardContent>{loading ? <div className="flex items-center gap-2 text-sm text-muted-foreground"><Loader2 className="h-4 w-4 animate-spin" />Loading curriculum…</div> : subjects.length === 0 ? <div className="rounded-xl border border-dashed p-8 text-center text-sm text-muted-foreground"><BookOpen className="mx-auto mb-3 h-8 w-8" />No global subjects yet.</div> : <div className="space-y-3">{subjects.map((subject) => <div key={subject.id} className="flex items-center justify-between rounded-xl border p-3"><div><p className="font-semibold">{subject.name}</p><p className="text-xs text-muted-foreground">{subject.modules} modules · ID: {subject.id}</p></div><span className="rounded-full bg-primary/10 px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-primary">Global</span></div>)}</div>}</CardContent></Card></div></div>;
    }
    