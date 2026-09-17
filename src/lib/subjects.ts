import { collection, getDocs } from "firebase/firestore";

    import { db } from "@/lib/firebase";

    export type SubjectRecord = {
    id: string;
    name: string;
    description: string;
    progress: number;
    modules: number;
    completed: number;
    status: string;
    tags: string[];
    iconKey: string;
    colorKey: string;
    userId?: string;
    };

    function numberValue(value: unknown, fallback = 0) {
    if (typeof value === "number" && Number.isFinite(value)) return value;
    if (typeof value === "string" && value.trim() !== "") {
      const parsed = Number(value);
      return Number.isFinite(parsed) ? parsed : fallback;
    }
    return fallback;
    }

    function normalizeSubject(id: string, data: Record<string, unknown>): SubjectRecord {
    const modules = Array.isArray(data.modules) ? data.modules.length : numberValue(data.modules ?? data.totalModules);
    const completed = numberValue(data.completed ?? data.completedModules);
    const rawProgress = numberValue(data.progress ?? data.mastery);
    const progress = Math.max(0, Math.min(100, rawProgress || (modules > 0 ? (completed / modules) * 100 : 0)));
    const status = typeof data.status === "string" && data.status.trim()
      ? data.status
      : progress >= 85 ? "Almost mastered" : progress >= 50 ? "In progress" : progress > 0 ? "Needs focus" : "Not started";

    return {
      id,
      name: typeof data.name === "string" ? data.name : typeof data.title === "string" ? data.title : "Untitled subject",
      description: typeof data.description === "string" ? data.description : "Continue building your understanding of this subject.",
      progress: Math.round(progress),
      modules: Math.max(0, Math.round(modules)),
      completed: Math.max(0, Math.round(completed)),
      status,
      tags: Array.isArray(data.tags) ? data.tags.filter((tag): tag is string => typeof tag === "string") : [],
      iconKey: typeof data.icon === "string" ? data.icon.toLowerCase() : "book",
      colorKey: typeof data.color === "string" ? data.color.toLowerCase() : "primary",
      userId: typeof data.userId === "string" ? data.userId : typeof data.uid === "string" ? data.uid : undefined,
    };
    }

    export async function getSubjectsForUser(uid: string) {
    const snapshot = await getDocs(collection(db, "subjects"));
    const allSubjects = snapshot.docs.map((subject) => normalizeSubject(subject.id, subject.data()));
    return allSubjects.filter((subject) => !subject.userId || subject.userId === uid);
    }
    