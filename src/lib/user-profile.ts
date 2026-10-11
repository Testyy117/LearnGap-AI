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

    export type NewUserProfile = { fullName?: string; grade?: string };

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
      xp: numericValue(data.xp) ?? 0,
      level: numericValue(data.level) ?? 1,
      role: firstString(data.role),
      isAdmin: data.isAdmin === true,
    };
    }

    export async function getUserProfile(user: User): Promise<UserProfile> {
    const snapshot = await getDoc(doc(db, "users", user.uid));
    return profileFromData(user, snapshot.exists() ? snapshot.data() : {});
    }

    export async function ensureUserProfile(user: User, details: NewUserProfile = {}): Promise<UserProfile> {
    const reference = doc(db, "users", user.uid);
    const snapshot = await getDoc(reference);
    const stored = snapshot.exists() ? snapshot.data() : {};
    const defaults: Record<string, unknown> = {};

    if (!snapshot.exists()) {
      defaults.uid = user.uid;
      defaults.xp = 0;
      defaults.level = 1;
      defaults.createdAt = serverTimestamp();
    } else {
      if (numericValue(stored.xp) === undefined) defaults.xp = 0;
      if (numericValue(stored.level) === undefined) defaults.level = 1;
    }

    const fullName = firstString(details.fullName, user.displayName);
    const email = firstString(user.email);
    if (fullName && !firstString(stored.displayName, stored.fullName, stored.name)) {
      defaults.fullName = fullName;
      defaults.displayName = fullName;
    }
    if (email && !firstString(stored.email)) defaults.email = email;
    if (details.grade && !firstString(stored.grade)) defaults.grade = details.grade;

    if (Object.keys(defaults).length > 0) {
      defaults.updatedAt = serverTimestamp();
      await setDoc(reference, defaults, { merge: true });
    }

    return profileFromData(user, { ...stored, ...defaults });
    }

    export function isAdminUser(user: User, profile: UserProfile) {
    const role = profile.role?.trim();
    const authorizedRoles = ["admin", "administrator", "Admin", "Administrator"];
    return profile.uid === user.uid && Boolean(role && authorizedRoles.includes(role));
    }
    