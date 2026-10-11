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

    const STARTER_SUBJECTS: SubjectRecord[] = [
    { id: "mathematics", name: "Mathematics", description: "Starter curriculum subject. Topics and quizzes can be published by an administrator.", progress: 0, modules: 0, completed: 0, bestScore: 0, attemptCount: 0, status: "Not started", tags: ["Starter"], iconKey: "calculator", colorKey: "blue" },
    { id: "english-language", name: "English Language", description: "Starter curriculum subject. Topics and quizzes can be published by an administrator.", progress: 0, modules: 0, completed: 0, bestScore: 0, attemptCount: 0, status: "Not started", tags: ["Starter"], iconKey: "book", colorKey: "primary" },
    { id: "basic-science", name: "Basic Science", description: "Starter curriculum subject. Topics and quizzes can be published by an administrator.", progress: 0, modules: 0, completed: 0, bestScore: 0, attemptCount: 0, status: "Not started", tags: ["Starter"], iconKey: "atom", colorKey: "green" },
    { id: "computer-studies", name: "Computer Studies", description: "Starter curriculum subject. Topics and quizzes can be published by an administrator.", progress: 0, modules: 0, completed: 0, bestScore: 0, attemptCount: 0, status: "Not started", tags: ["Starter"], iconKey: "book", colorKey: "purple" },
    ];

    const inFlightSyncs = new Map<string, Promise<SubjectRecord[]>>();

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

    // Called from the guarded admin curriculum page; Firestore rules require the caller to hold an admin role.
    export async function ensureStarterCurriculum(adminUid: string): Promise<SubjectRecord[]> {
    const snapshot = await getDocs(collection(db, "subjects"));
    const existingIds = new Set(snapshot.docs.map((subject) => subject.id));
    const missing = STARTER_SUBJECTS.filter((subject) => !existingIds.has(subject.id));

    for (let offset = 0; offset < missing.length; offset += 400) {
      const batch = writeBatch(db);
      missing.slice(offset, offset + 400).forEach((subject) => {
        batch.set(doc(db, "subjects", subject.id), {
          name: subject.name,
          description: subject.description,
          icon: subject.iconKey,
          color: subject.colorKey,
          tags: subject.tags,
          modules: subject.modules,
          completed: 0,
          progress: 0,
          status: "Not started",
          createdBy: adminUid,
          starter: true,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        });
      });
      await batch.commit();
    }

    return getGlobalSubjects();
    }

    function normalizeSavedSubject(id: string, data: Record<string, unknown>): SubjectRecord {
    const progress = Math.max(0, Math.min(100, numberValue(data.progress)));
    return {
      id,
      name: typeof data.name === "string" ? data.name : typeof data.subjectName === "string" ? data.subjectName : "Saved subject",
      description: typeof data.description === "string" ? data.description : "",
      progress,
      modules: Math.max(0, Math.round(numberValue(data.modules))),
      completed: Math.max(0, Math.round(numberValue(data.completed))),
      bestScore: Math.max(0, Math.min(100, numberValue(data.bestScore))),
      lastScore: typeof data.lastScore === "number" ? data.lastScore : undefined,
      attemptCount: Math.max(0, Math.round(numberValue(data.attemptCount))),
      status: typeof data.status === "string" ? data.status : progress > 0 ? "In progress" : "Not started",
      tags: Array.isArray(data.tags) ? data.tags.filter((tag): tag is string => typeof tag === "string") : [],
      iconKey: typeof data.iconKey === "string" ? data.iconKey : "book",
      colorKey: typeof data.colorKey === "string" ? data.colorKey : "primary",
    };
    }

    async function syncUserSubjectsOnce(uid: string): Promise<SubjectRecord[]> {
    const [globalSubjects, savedSnapshot] = await Promise.all([
      getGlobalSubjects(),
      getDocs(collection(db, "users", uid, "subjects")),
    ]);
    const curriculumSubjects = globalSubjects.length > 0 ? globalSubjects : STARTER_SUBJECTS;
    const saved = new Map(savedSnapshot.docs.map((subject) => [subject.id, subject.data()]));
    const missing = curriculumSubjects.filter((subject) => !saved.has(subject.id));

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

    const activeIds = new Set(curriculumSubjects.map((subject) => subject.id));
    const activeSubjects = curriculumSubjects.map((subject) => {
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
    const preservedSubjects = savedSnapshot.docs
      .filter((subject) => !activeIds.has(subject.id))
      .map((subject) => normalizeSavedSubject(subject.id, subject.data()));
    return [...activeSubjects, ...preservedSubjects];
    }

    export async function syncUserSubjects(uid: string): Promise<SubjectRecord[]> {
    const existing = inFlightSyncs.get(uid);
    if (existing) return existing;

    const pending = syncUserSubjectsOnce(uid);
    inFlightSyncs.set(uid, pending);
    try {
      return await pending;
    } finally {
      if (inFlightSyncs.get(uid) === pending) inFlightSyncs.delete(uid);
    }
    }

    export async function getSubjectsForUser(uid: string): Promise<SubjectRecord[]> {
    return syncUserSubjects(uid);
    }
    