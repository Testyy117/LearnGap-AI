"use client";

    import { addDoc, collection, serverTimestamp } from "firebase/firestore";
    import { onAuthStateChanged, type User } from "firebase/auth";
    import { useEffect, useState } from "react";
    import { BrainCircuit, Loader2, Save, ShieldCheck } from "lucide-react";

    import { auth, db } from "@/lib/firebase";
    import { getGlobalSubjects, type SubjectRecord } from "@/lib/subjects";
    import { Badge } from "@/components/ui/badge";
    import { Button } from "@/components/ui/button";
    import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
    import { Input } from "@/components/ui/input";
    import { Label } from "@/components/ui/label";
    import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
    import { Textarea } from "@/components/ui/textarea";
    import { useToast } from "@/hooks/use-toast";

    export default function AddQuestionWizard() {
    const { toast } = useToast();
    const [currentUser, setCurrentUser] = useState<User | null>(null);
    const [subjects, setSubjects] = useState<SubjectRecord[]>([]);
    const [saving, setSaving] = useState(false);
    const [form, setForm] = useState({ subjectId: "", topic: "", difficulty: "Medium", text: "", options: ["", "", "", ""], correctIdx: 0, explanation: "" });

    useEffect(() => {
      const unsubscribe = onAuthStateChanged(auth, (user) => setCurrentUser(user));
      getGlobalSubjects().then(setSubjects).catch(() => setSubjects([]));
      return unsubscribe;
    }, []);

    const updateOption = (index: number, value: string) => setForm((current) => ({ ...current, options: current.options.map((option, optionIndex) => optionIndex === index ? value : option) }));

    const handleSubmit = async () => {
      const selectedSubject = subjects.find((subject) => subject.id === form.subjectId);
      if (!currentUser || !selectedSubject || !form.text.trim() || form.options.some((option) => !option.trim())) {
        toast({ title: "Complete the question first", description: "Choose a subject and fill in the question and all four options.", variant: "destructive" });
        return;
      }

      setSaving(true);
      try {
        await addDoc(collection(db, "questions"), {
          subjectId: selectedSubject.id,
          subjectName: selectedSubject.name,
          topic: form.topic.trim(),
          difficulty: form.difficulty,
          text: form.text.trim(),
          options: form.options.map((option) => option.trim()),
          correctIdx: form.correctIdx,
          explanation: form.explanation.trim(),
          createdBy: currentUser.uid,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        });
        toast({ title: "Question published", description: "The question is now linked to the selected global subject." });
        setForm({ subjectId: "", topic: "", difficulty: "Medium", text: "", options: ["", "", "", ""], correctIdx: 0, explanation: "" });
      } catch {
        toast({ title: "Could not publish question", description: "Check your connection and administrator permissions, then try again.", variant: "destructive" });
      } finally {
        setSaving(false);
      }
    };

    return <div className="mx-auto max-w-3xl space-y-8 p-6 lg:p-8"><div className="space-y-2"><div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-primary"><ShieldCheck className="h-3.5 w-3.5" />Admin content tools</div><h1 className="font-headline text-3xl font-bold">Question Wizard</h1><p className="text-muted-foreground">Publish diagnostic questions linked to global curriculum subjects.</p></div>
      <Card><CardHeader><CardTitle className="flex items-center gap-2"><BrainCircuit className="h-5 w-5 text-primary" />Question content</CardTitle><CardDescription>Questions are saved to Firestore and can be retrieved by subject ID.</CardDescription></CardHeader><CardContent className="space-y-6"><div className="grid gap-4 sm:grid-cols-2"><div className="space-y-2"><Label>Subject</Label><Select value={form.subjectId} onValueChange={(value) => setForm((current) => ({ ...current, subjectId: value }))} disabled={subjects.length === 0}><SelectTrigger><SelectValue placeholder={subjects.length === 0 ? "Create a subject first" : "Select subject"} /></SelectTrigger><SelectContent>{subjects.map((subject) => <SelectItem key={subject.id} value={subject.id}>{subject.name}</SelectItem>)}</SelectContent></Select>{subjects.length === 0 && <p className="text-xs text-muted-foreground">Use the Curriculum page to create the first global subject.</p>}</div><div className="space-y-2"><Label>Difficulty</Label><Select value={form.difficulty} onValueChange={(value) => setForm((current) => ({ ...current, difficulty: value }))}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="Easy">Easy</SelectItem><SelectItem value="Medium">Medium</SelectItem><SelectItem value="Hard">Hard</SelectItem></SelectContent></Select></div></div><div className="space-y-2"><Label>Topic</Label><Input value={form.topic} onChange={(event) => setForm((current) => ({ ...current, topic: event.target.value }))} placeholder="e.g. Linear equations" /></div><div className="space-y-2"><Label>Question</Label><Textarea value={form.text} onChange={(event) => setForm((current) => ({ ...current, text: event.target.value }))} placeholder="Write the diagnostic question" /></div><div className="grid gap-4 sm:grid-cols-2">{form.options.map((option, index) => <div className="space-y-2" key={index}><Label>Option {String.fromCharCode(65 + index)}</Label><Input value={option} onChange={(event) => updateOption(index, event.target.value)} /></div>)}</div><div className="space-y-2"><Label>Correct option</Label><Select value={String(form.correctIdx)} onValueChange={(value) => setForm((current) => ({ ...current, correctIdx: Number(value) }))}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="0">Option A</SelectItem><SelectItem value="1">Option B</SelectItem><SelectItem value="2">Option C</SelectItem><SelectItem value="3">Option D</SelectItem></SelectContent></Select></div><div className="space-y-2"><Label>Explanation</Label><Textarea value={form.explanation} onChange={(event) => setForm((current) => ({ ...current, explanation: event.target.value }))} placeholder="Explain the correct answer" /></div><div className="flex justify-end"><Button onClick={handleSubmit} disabled={saving || subjects.length === 0} className="gap-2">{saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}Publish question</Button></div></CardContent></Card>
    </div>;
    }
    