import type { User } from "firebase/auth";
    import { doc, getDoc, serverTimestamp, setDoc } from "firebase/firestore";

    import { db } from "@/lib/firebase";

    export type UserProfile = {
    uid: string;
    displayName?: string;
    email?: string;
    photoURL?: string;
    xp?: number;
    level?: number;
    role?: string;
    isAdmin?: boolean;
    };

    function firstString(...values: unknown[]) {
    return values.find((value): value is string => typeof value === "string" && value.trim().length > 0)?.trim();
    }

    function numericValue(value: unknown) {
    if (typeof value === "number" && Number.isFinite(value)) return value;
    if (typeof value === "string" && value.trim() !== "") {
      const parsed = Number(value);
      return Number.isFinite(parsed) ? parsed : undefined;
    }
    return undefined;
    }

    function profileFromData(user: User, data: Record<string, unknown>): UserProfile {
    return {
      uid: user.uid,
      displayName: firstString(user.displayName, data.displayName, data.fullName, data.name),
      email: firstString(user.email, data.email),
      photoURL: firstString(user.photoURL, data.photoURL),
      xp: numericValue(data.xp),
      level: numericValue(data.level),
      role: firstString(data.role)?.toLowerCase(),
      isAdmin: data.isAdmin === true,
    };
    }

    export async function getUserProfile(user: User): Promise<UserProfile> {
    const snapshot = await getDoc(doc(db, "users", user.uid));
    return profileFromData(user, snapshot.exists() ? snapshot.data() : {});
    }

    export async function ensureUserProfile(user: User): Promise<UserProfile> {
    const fallback = profileFromData(user, { xp: 0, level: 1 });

    try {
      const reference = doc(db, "users", user.uid);
      const snapshot = await getDoc(reference);
      if (snapshot.exists()) return profileFromData(user, snapshot.data());

      const initialData = {
        uid: user.uid,
        xp: 0,
        level: 1,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        ...(fallback.displayName ? { displayName: fallback.displayName } : {}),
        ...(fallback.email ? { email: fallback.email } : {}),
        ...(fallback.photoURL ? { photoURL: fallback.photoURL } : {}),
      };
      await setDoc(reference, initialData);
      return fallback;
    } catch {
      return fallback;
    }
    }

    export function isAdminUser(user: User, profile: UserProfile) {
    const configuredAdminUid = process.env.NEXT_PUBLIC_ADMIN_UID?.trim();
    const role = profile.role?.toLowerCase();
    return Boolean(
      (configuredAdminUid && user.uid === configuredAdminUid) ||
        role === "admin" ||
        role === "administrator" ||
        profile.isAdmin === true,
    );
    }
    