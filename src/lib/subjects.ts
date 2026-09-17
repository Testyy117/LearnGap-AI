import { collection, doc, getDocs, serverTimestamp, writeBatch } from "firebase/firestore";

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

    export const DEFAULT_STARTER_SUBJECTS = [
    { id: "starter-mathematics", name: "Mathematics Foundations", description: "Build confidence with core numeracy, algebra, and problem-solving skills.", icon: "calculator", color: "blue", tags: ["Foundations", "Starter"], modules: 6 },
    { id: "starter-science", name: "Science Foundations", description: "Explore the scientific method, evidence, and the world around you.", icon: "atom", color: "green", tags: ["Foundations", "Starter"], modules: 5 },
    { id: "starter-study-skills", name: "Study Skills", description: "Learn practical habits for planning, recall, and focused independent learning.", icon: "book", color: "purple", tags: ["Skills", "Starter"], modules: 4 },
    ] as const;

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

    export async function getGlobalSubjects() {
    const snapshot = await getDocs(collection(db, "subjects"));
    return snapshot.docs.map((subject) => normalizeSubject(subject.id, subject.data()));
    }

    async function seedStarterSubjects(uid: string) {
    const batch = writeBatch(db);
    DEFAULT_STARTER_SUBJECTS.forEach((subject) => {
      batch.set(doc(db, "users", uid, "subjects", subject.id), {
        ...subject,
        userId: uid,
        progress: 0,
        completed: 0,
        status: "Not started",
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      }, { merge: true });
    });

    try {
      await batch.commit();
      return DEFAULT_STARTER_SUBJECTS.map((subject) => normalizeSubject(subject.id, { ...subject, userId: uid, progress: 0, completed: 0, status: "Not started" }));
    } catch {
      return [];
    }
    }

    export async function getSubjectsForUser(uid: string) {
    const [globalResult, personalResult] = await Promise.allSettled([
      getGlobalSubjects(),
      getDocs(collection(db, "users", uid, "subjects")),
    ]);
    const globalSubjects = globalResult.status === "fulfilled" ? globalResult.value : [];
    const personalSubjects = personalResult.status === "fulfilled"
      ? personalResult.value.docs.map((subject) => normalizeSubject(subject.id, subject.data()))
      : [];

    if (globalSubjects.length === 0 && personalSubjects.length === 0) {
      const seededSubjects = await seedStarterSubjects(uid);
      return seededSubjects.length > 0
        ? seededSubjects
        : DEFAULT_STARTER_SUBJECTS.map((subject) => normalizeSubject(subject.id, { ...subject, userId: uid, progress: 0, completed: 0, status: "Not started" }));
    }

    const merged = new Map<string, SubjectRecord>();
    [...globalSubjects, ...personalSubjects].forEach((subject) => merged.set(subject.id, subject));
    return Array.from(merged.values());
    }
    