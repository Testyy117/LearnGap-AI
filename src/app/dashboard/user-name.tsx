"use client";

    import { onAuthStateChanged } from "firebase/auth";
    import { useEffect, useState } from "react";

    import { auth } from "@/lib/firebase";
    import { getUserProfile } from "@/lib/user-profile";

    export function UserName() {
    const [name, setName] = useState("Learner");
    useEffect(() => {
      let cancelled = false;
      const unsubscribe = onAuthStateChanged(auth, async (user) => {
        if (!user) return;
        try {
          const profile = await getUserProfile(user);
          if (!cancelled) setName(profile.displayName?.split(" ")[0] || "Learner");
        } catch {
          if (!cancelled) setName(user.displayName?.split(" ")[0] || "Learner");
        }
      });
      return () => { cancelled = true; unsubscribe(); };
    }, []);
    return <span>{name}</span>;
    }
    