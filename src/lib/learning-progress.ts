import { addDoc, collection, doc, getDoc, getDocs, limit, orderBy, query, runTransaction, serverTimestamp, setDoc, where } from "firebase/firestore";

    import { db } from "@/lib/firebase";
    import { syncUserSubjects } from "@/lib/subjects";

    export type QuizQuestion = {
    id: string;
    subjectId: string;
    text: string;
    topic: string;
    options: string[];
    correctIdx: number;
    explanation?: string;
    difficulty?: string;
    };

    export type QuizSessionState = {
    currentIdx: number;
    answers: Record<string, number>;
    confidence: Record<string, number>;
    bookmarks: string[];
    timeLeft: number;
    updatedAt?: { toMillis?: () => number } | null;
    };

    export type QuizResponse = {
    questionId: string;
    topic: string;
    questionText: string;
    answerIndex: number;
    isCorrect: boolean;
    confidence: number;
    };

    export type QuizAttempt = {
    id: string;
    subjectId: string;
    subjectName: string;
    score: number;
    correctCount: number;
    totalQuestions: number;
    durationSeconds: number;
    responses: QuizResponse[];
    analysis?: Record<string, unknown>;
    createdAt?: { toDate?: () => Date; seconds?: number } | null;
    };

    function finiteNumber(value: unknown, fallback = 0) {
    return typeof value === "number" && Number.isFinite(value) ? value : fallback;
    }

    export async function getQuestionsForSubject(subjectId: string): Promise<QuizQuestion[]> {
    const snapshot = await getDocs(query(collection(db, "questions"), where("subjectId", "==", subjectId)));
    return snapshot.docs
      .map((item) => ({ id: item.id, ...item.data() }))
      .filter((item) => item.subjectId === subjectId)
      .map((item) => {
        const options = Array.isArray(item.options) ? item.options.filter((value): value is string => typeof value === "string") : [];
        const answerIndex = typeof item.correctIdx === "number" ? item.correctIdx : options.indexOf(String(item.answer ?? ""));
        return {
          id: item.id,
          subjectId,
          text: typeof item.text === "string" ? item.text : "",
          topic: typeof item.topic === "string" && item.topic.trim() ? item.topic : "General",
          options,
          correctIdx: answerIndex,
          explanation: typeof item.explanation === "string" ? item.explanation : undefined,
          difficulty: typeof item.difficulty === "string" ? item.difficulty : undefined,
        };
      })
      .filter((item) => item.text.length > 0 && item.options.length >= 2 && item.correctIdx >= 0 && item.correctIdx < item.options.length);
    }

    export async function getQuizSession(uid: string, subjectId: string): Promise<QuizSessionState | null> {
    const snapshot = await getDoc(doc(db, "users", uid, "quizSessions", subjectId));
    return snapshot.exists() ? snapshot.data() as QuizSessionState : null;
    }

    export async function saveQuizSession(uid: string, subjectId: string, state: Omit<QuizSessionState, "updatedAt">) {
    await setDoc(doc(db, "users", uid, "quizSessions", subjectId), {
      subjectId,
      currentIdx: state.currentIdx,
      answers: state.answers,
      confidence: state.confidence,
      bookmarks: state.bookmarks,
      timeLeft: state.timeLeft,
      updatedAt: serverTimestamp(),
    }, { merge: true });
    }

    export async function getQuizAttempts(uid: string, maxItems = 100): Promise<QuizAttempt[]> {
    const snapshot = await getDocs(query(collection(db, "users", uid, "quizAttempts"), orderBy("createdAt", "desc"), limit(maxItems)));
    return snapshot.docs.map((item) => ({ id: item.id, ...item.data() } as QuizAttempt));
    }

    export async function getQuizAttempt(uid: string, attemptId: string): Promise<QuizAttempt | null> {
    const snapshot = await getDoc(doc(db, "users", uid, "quizAttempts", attemptId));
    return snapshot.exists() ? { id: snapshot.id, ...snapshot.data() } as QuizAttempt : null;
    }

    export async function recordQuizAttempt(input: {
    uid: string;
    subjectId: string;
    subjectName: string;
    responses: QuizResponse[];
    durationSeconds: number;
    analysis: Record<string, unknown>;
    }) {
    const { uid, subjectId, subjectName, responses, durationSeconds, analysis } = input;
    if (responses.length === 0) throw new Error("A quiz must contain at least one response.");
    await syncUserSubjects(uid);

    const correctCount = responses.filter((response) => response.isCorrect).length;
    const score = Math.round((correctCount / responses.length) * 100);
    const attemptRef = doc(collection(db, "users", uid, "quizAttempts"));
    const subjectRef = doc(db, "users", uid, "subjects", subjectId);
    const profileRef = doc(db, "users", uid);
    const sessionRef = doc(db, "users", uid, "quizSessions", subjectId);

    await runTransaction(db, async (transaction) => {
      const subjectSnapshot = await transaction.get(subjectRef);
      const profileSnapshot = await transaction.get(profileRef);
      const subject = subjectSnapshot.exists() ? subjectSnapshot.data() : {};
      const profile = profileSnapshot.exists() ? profileSnapshot.data() : {};
      const bestScore = Math.max(finiteNumber(subject.bestScore), score);
      const progress = Math.max(finiteNumber(subject.progress), bestScore);
      const modules = finiteNumber(subject.modules);
      const completed = Math.max(finiteNumber(subject.completed), Math.round(modules * progress / 100));
      const previousXp = finiteNumber(profile.xp);
      const nextXp = previousXp + correctCount * 10;
      const status = progress >= 100 ? "Completed" : progress > 0 ? "In progress" : "Not started";

      transaction.set(attemptRef, {
        subjectId,
        subjectName,
        score,
        correctCount,
        totalQuestions: responses.length,
        durationSeconds: Math.max(0, Math.round(durationSeconds)),
        responses,
        analysis,
        createdAt: serverTimestamp(),
      });
      transaction.set(subjectRef, {
        subjectId,
        userId: uid,
        progress,
        completed,
        bestScore,
        lastScore: score,
        attemptCount: finiteNumber(subject.attemptCount) + 1,
        status,
        lastAttemptAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      }, { merge: true });
      transaction.set(profileRef, {
        xp: nextXp,
        level: Math.floor(nextXp / 500) + 1,
        updatedAt: serverTimestamp(),
      }, { merge: true });
      transaction.delete(sessionRef);
    });

    return { id: attemptRef.id, score, correctCount, totalQuestions: responses.length };
    }
    