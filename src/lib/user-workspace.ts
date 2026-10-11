import type { User } from "firebase/auth";

    import { ensureUserProfile, type NewUserProfile, type UserProfile } from "@/lib/user-profile";
    import { syncUserSubjects, type SubjectRecord } from "@/lib/subjects";

    export type UserWorkspace = {
    profile: UserProfile;
    subjects: SubjectRecord[];
    subjectError?: unknown;
    };

    export async function initializeUserWorkspace(user: User, details: NewUserProfile = {}): Promise<UserWorkspace> {
    const profile = await ensureUserProfile(user, details);
    try {
      const subjects = await syncUserSubjects(user.uid);
      return { profile, subjects };
    } catch (subjectError) {
      return { profile, subjects: [], subjectError };
    }
    }
    