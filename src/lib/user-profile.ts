import type { User } from "firebase/auth";
    import { doc, getDoc } from "firebase/firestore";

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
    return values.find(
      (value): value is string => typeof value === "string" && value.trim().length > 0,
    )?.trim();
    }

    function numericValue(value: unknown) {
    if (typeof value === "number" && Number.isFinite(value)) return value;
    if (typeof value === "string" && value.trim() !== "") {
      const parsed = Number(value);
      return Number.isFinite(parsed) ? parsed : undefined;
    }
    return undefined;
    }

    export async function getUserProfile(user: User): Promise<UserProfile> {
    const snapshot = await getDoc(doc(db, "users", user.uid));
    const data = snapshot.exists() ? snapshot.data() : {};

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
    