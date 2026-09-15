"use client";

    import Link from "next/link";
    import { useRouter } from "next/navigation";
    import { useState, type FormEvent } from "react";
    import { createUserWithEmailAndPassword, updateProfile } from "firebase/auth";
    import { doc, setDoc } from "firebase/firestore";

    import { auth, db } from "@/Firebase";
    import { Button } from "@/components/ui/button";
    import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
    } from "@/components/ui/card";
    import { Input } from "@/components/ui/input";

    export default function RegisterPage() {
    const router = useRouter();
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");

    const handleRegister = async (event: FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      setError("");

      try {
        const userCred = await createUserWithEmailAndPassword(auth, email, password);
        await updateProfile(userCred.user, { displayName: name });
        await setDoc(doc(db, "users", userCred.user.uid), {
          name,
          email,
          createdAt: new Date(),
        });
        router.push("/dashboard");
      } catch (registrationError) {
        setError(
          registrationError instanceof Error
            ? registrationError.message
            : "Unable to create your account. Please try again.",
        );
      }
    };

    return (
      <main className="relative min-h-screen overflow-hidden bg-background px-4 py-10 text-foreground sm:px-6 lg:px-8">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_right,hsl(var(--primary)/0.18),transparent_38%),radial-gradient(circle_at_bottom_left,hsl(var(--accent)/0.1),transparent_34%)]" />
        <div className="relative mx-auto flex min-h-[calc(100vh-5rem)] w-full max-w-6xl items-center justify-center">
          <Card className="w-full max-w-md border-border/70 bg-card/95 shadow-2xl shadow-black/30 backdrop-blur">
            <CardHeader className="space-y-3 p-6 sm:p-8">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-lg font-bold text-primary-foreground shadow-lg shadow-primary/25">
                  L
                </div>
                <div>
                  <p className="text-sm font-semibold text-primary">LearnGap AI</p>
                  <p className="text-xs text-muted-foreground">Learn with clarity</p>
                </div>
              </div>
              <div className="space-y-1">
                <CardTitle className="text-3xl">Create your account</CardTitle>
                <CardDescription>
                  Start building a smarter, more focused learning routine.
                </CardDescription>
              </div>
            </CardHeader>
            <CardContent className="p-6 pt-0 sm:p-8 sm:pt-0">
              <form onSubmit={handleRegister} className="space-y-5">
                {error && (
                  <div
                    role="alert"
                    className="rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive-foreground"
                  >
                    {error}
                  </div>
                )}
                <div className="space-y-2">
                  <label htmlFor="name" className="text-sm font-medium">
                    Full name
                  </label>
                  <Input
                    id="name"
                    name="name"
                    placeholder="Alex Sterling"
                    autoComplete="name"
                    value={name}
                    onChange={(event) => setName(event.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <label htmlFor="email" className="text-sm font-medium">
                    Email address
                  </label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="you@example.com"
                    autoComplete="email"
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <label htmlFor="password" className="text-sm font-medium">
                    Password
                  </label>
                  <Input
                    id="password"
                    name="password"
                    type="password"
                    placeholder="Create a secure password"
                    autoComplete="new-password"
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    required
                    minLength={6}
                  />
                </div>
                <Button type="submit" className="h-11 w-full text-base">
                  Sign Up
                </Button>
              </form>
              <p className="mt-6 text-center text-sm text-muted-foreground">
                Already have an account?{" "}
                <Link href="/login" className="font-medium text-primary underline-offset-4 hover:underline">
                  Sign in
                </Link>
              </p>
            </CardContent>
          </Card>
        </div>
      </main>
    );
    }
    