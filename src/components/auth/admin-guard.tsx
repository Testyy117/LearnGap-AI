"use client";

    import { onAuthStateChanged } from "firebase/auth";
    import { Loader2 } from "lucide-react";
    import { useRouter } from "next/navigation";
    import { useEffect, useState } from "react";

    import { auth } from "@/lib/firebase";
    import { getUserProfile, isAdminUser } from "@/lib/user-profile";

    export function AdminGuard({ children }: { children: React.ReactNode }) {
    const router = useRouter();
    const [status, setStatus] = useState<"loading" | "allowed" | "denied">("loading");

    useEffect(() => {
      let cancelled = false;
      const unsubscribe = onAuthStateChanged(auth, async (user) => {
        if (!user) {
          if (!cancelled) setStatus("denied");
          router.replace("/login");
          return;
        }

        try {
          const profile = await getUserProfile(user);
          if (cancelled) return;
          if (isAdminUser(user, profile)) {
            setStatus("allowed");
          } else {
            setStatus("denied");
            router.replace("/dashboard");
          }
        } catch {
          if (!cancelled) setStatus("denied");
          router.replace("/dashboard");
        }
      });

      return () => {
        cancelled = true;
        unsubscribe();
      };
    }, [router]);

    if (status === "loading") {
      return <div className="flex min-h-screen items-center justify-center bg-background text-foreground"><div className="flex items-center gap-3 text-sm text-muted-foreground"><Loader2 className="h-5 w-5 animate-spin text-primary" />Checking administrator access…</div></div>;
    }
    if (status === "denied") return null;
    return <>{children}</>;
    }
    