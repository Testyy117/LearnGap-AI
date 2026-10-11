"use client";

    import { createUserWithEmailAndPassword, updateProfile } from "firebase/auth";
    import { useState } from "react";
    import { useRouter } from "next/navigation";

    import { auth } from "@/lib/firebase";
    import { ensureUserProfile } from "@/lib/user-profile";
    import { syncUserSubjects } from "@/lib/subjects";
    import { Button } from "@/components/ui/button";
    import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

    export default function RegisterPage() {
    const router = useRouter();
    const [fullName, setFullName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [grade, setGrade] = useState("");
    const [error, setError] = useState("");
    const [saving, setSaving] = useState(false);

    const handleSubmit = async () => {
      setError("");
      if (!fullName.trim() || !email.trim() || !password || !grade) {
        setError("Please fill in all fields.");
        return;
      }

      setSaving(true);
      try {
        const credential = await createUserWithEmailAndPassword(auth, email.trim(), password);
        await updateProfile(credential.user, { displayName: fullName.trim() });
        await ensureUserProfile(credential.user, { fullName: fullName.trim(), grade });
        await syncUserSubjects(credential.user.uid);
        router.replace("/dashboard");
      } catch (error) {
        const code = typeof error === "object" && error && "code" in error ? String(error.code) : "";
        if (code === "auth/email-already-in-use") {
          setError("An account already uses this email. Sign in instead.");
        } else if (auth.currentUser) {
          router.replace("/dashboard");
        } else {
          setError("We could not create your account. Check your details and try again.");
        }
      } finally {
        setSaving(false);
      }
    };

    return <div className="flex min-h-screen items-center justify-center bg-background p-4"><Card className="w-full max-w-md shadow-2xl"><CardHeader><CardTitle className="text-2xl font-bold">Create Account</CardTitle><CardDescription>Enter your details to begin your mastery journey.</CardDescription></CardHeader><CardContent className="space-y-4">{error && <p role="alert" className="text-sm text-destructive">{error}</p>}<div className="space-y-2"><label className="text-sm font-medium">Full Name</label><input className="w-full rounded-lg border border-border bg-muted p-3" placeholder="Your full name" value={fullName} onChange={(event) => setFullName(event.target.value)} /></div><div className="space-y-2"><label className="text-sm font-medium">Class / Grade</label><select className="w-full rounded-lg border border-border bg-muted p-3" value={grade} onChange={(event) => setGrade(event.target.value)}><option value="">Select your grade level</option><option value="Primary">Primary School</option><option value="Junior Secondary">Junior Secondary</option><option value="Senior Secondary">Senior Secondary (WAEC)</option><option value="University">University</option></select></div><div className="space-y-2"><label className="text-sm font-medium">Email Address</label><input className="w-full rounded-lg border border-border bg-muted p-3" placeholder="your@email.com" type="email" value={email} onChange={(event) => setEmail(event.target.value)} /></div><div className="space-y-2"><label className="text-sm font-medium">Password</label><input className="w-full rounded-lg border border-border bg-muted p-3" placeholder="At least 6 characters" type="password" value={password} onChange={(event) => setPassword(event.target.value)} /></div><Button className="w-full" onClick={handleSubmit} disabled={saving}>{saving ? "Setting up your account…" : "Start Learning Free"}</Button><p className="text-center text-sm text-muted-foreground">Already have an account? <a href="/login" className="text-primary underline">Sign in</a></p></CardContent></Card></div>;
    }
    