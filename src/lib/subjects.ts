import { collection, doc, getDocs, serverTimestamp, writeBatch } from "firebase/firestore";

    import { db } from "@/lib/firebase";

    export type SubjectRecord = {
    id: string;
    name: string;
    description: string;
    progress: number;
    modules: number;
    completed: number;
    bestScore: number;
    lastScore?: number;
    attemptCount: number;
    status: string;
    tags: string[];
    iconKey: string;
    colorKey: string;
    };

    function numberValue(value: unknown, fallback = 0) {
    if (typeof value === "number" && Number.isFinite(value)) return value;
    if (typeof value === "string" && value.trim() !== "") {
      const parsed = Number(value);
      return Number.isFinite(parsed) ? parsed : fallback;
    }
    return fallback;
    }

    function normalizeGlobalSubject(id: string, data: Record<string, unknown>): SubjectRecord {
    const modules = Array.isArray(data.modules) ? data.modules.length : numberValue(data.modules ?? data.totalModules);
    return {
      id,
      name: typeof data.name === "string" ? data.name : typeof data.title === "string" ? data.title : "Untitled subject",
      description: typeof data.description === "string" ? data.description : "",
      progress: 0,
      modules: Math.max(0, Math.round(modules)),
      completed: 0,
      bestScore: 0,
      attemptCount: 0,
      status: "Not started",
      tags: Array.isArray(data.tags) ? data.tags.filter((tag): tag is string => typeof tag === "string") : [],
      iconKey: typeof data.icon === "string" ? data.icon.toLowerCase() : "book",
      colorKey: typeof data.color === "string" ? data.color.toLowerCase() : "primary",
    };
    }

    export async function getGlobalSubjects(): Promise<SubjectRecord[]> {
    const snapshot = await getDocs(collection(db, "subjects"));
    return snapshot.docs.map((subject) => normalizeGlobalSubject(subject.id, subject.data()));
    }

    export async function syncUserSubjects(uid: string): Promise<SubjectRecord[]> {
    const [globalSubjects, savedSnapshot] = await Promise.all([
      getGlobalSubjects(),
      getDocs(collection(db, "users", uid, "subjects")),
    ]);
    const saved = new Map(savedSnapshot.docs.map((subject) => [subject.id, subject.data()]));
    const missing = globalSubjects.filter((subject) => !saved.has(subject.id));

    for (let offset = 0; offset < missing.length; offset += 400) {
      const batch = writeBatch(db);
      missing.slice(offset, offset + 400).forEach((subject) => {
        batch.set(doc(db, "users", uid, "subjects", subject.id), {
          subjectId: subject.id,
          userId: uid,
          name: subject.name,
          modules: subject.modules,
          progress: 0,
          completed: 0,
          bestScore: 0,
          lastScore: null,
          attemptCount: 0,
          status: "Not started",
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        });
      });
      await batch.commit();
    }

    return globalSubjects.map((subject) => {
      const state = saved.get(subject.id) ?? {};
      const progress = Math.max(0, Math.min(100, numberValue(state.progress)));
      return {
        ...subject,
        progress,
        completed: Math.max(0, Math.round(numberValue(state.completed))),
        bestScore: Math.max(0, Math.min(100, numberValue(state.bestScore))),
        lastScore: typeof state.lastScore === "number" ? state.lastScore : undefined,
        attemptCount: Math.max(0, Math.round(numberValue(state.attemptCount))),
        status: typeof state.status === "string" ? state.status : progress > 0 ? "In progress" : "Not started",
      };
    });
    }

    export async function getSubjectsForUser(uid: string) {
    return syncUserSubjects(uid);
    }
    