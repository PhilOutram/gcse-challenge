import { initializeApp, type FirebaseApp } from 'firebase/app';
import {
  getDatabase,
  onValue,
  ref,
  remove,
  runTransaction,
  set,
  update,
  type Database,
} from 'firebase/database';
import type { QuestionStatKind, SessionState } from './types';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  databaseURL: import.meta.env.VITE_FIREBASE_DATABASE_URL,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

export const app: FirebaseApp = initializeApp(firebaseConfig);
export const db: Database = getDatabase(app);

export const ACTIVE_SESSION_ID = 'ACTIVE';

const sessionRef = () => ref(db, `sessions/${ACTIVE_SESSION_ID}`);
const sessionFieldRef = (field: string) => ref(db, `sessions/${ACTIVE_SESSION_ID}/${field}`);
const questionStatRef = (qId: string, kind: QuestionStatKind) =>
  ref(db, `questionStats/${qId}/${kind}`);

export function subscribeToSession(callback: (state: SessionState | null) => void): () => void {
  return onValue(sessionRef(), snap => {
    const raw = snap.val() as Partial<SessionState> | null;
    if (raw === null || raw === undefined) {
      callback(null);
      return;
    }
    callback({
      qmDeviceId: raw.qmDeviceId ?? '',
      qmName: raw.qmName ?? '',
      players: raw.players ?? {},
      phase: raw.phase ?? 'lobby',
      currentTopic: raw.currentTopic ?? null,
      qIdx: raw.qIdx ?? 0,
      buzzedBy: raw.buzzedBy ?? null,
      buzzTime: raw.buzzTime ?? null,
      lockedOut: raw.lockedOut ?? {},
      revealed: raw.revealed ?? false,
      hintGiven: raw.hintGiven ?? false,
      showQuestionToPlayers: raw.showQuestionToPlayers ?? false,
      roundResults: raw.roundResults ?? [],
      questionStartTime: raw.questionStartTime ?? 0,
    });
  });
}

export function createSession(qmDeviceId: string, qmName: string): Promise<void> {
  const initial: SessionState = {
    qmDeviceId,
    qmName,
    players: {},
    phase: 'lobby',
    currentTopic: null,
    qIdx: 0,
    buzzedBy: null,
    buzzTime: null,
    lockedOut: {},
    revealed: false,
    hintGiven: false,
    showQuestionToPlayers: false,
    roundResults: [],
    questionStartTime: 0,
  };
  return set(sessionRef(), initial);
}

export function cancelSession(): Promise<void> {
  return remove(sessionRef());
}

export function updateSession(patch: Partial<SessionState>): Promise<void> {
  return update(sessionRef(), patch);
}

export function tryClaimBuzz(playerName: string, buzzTimeMs: number): Promise<boolean> {
  return runTransaction(sessionFieldRef('buzzedBy'), current => {
    if (current === null || current === undefined) return playerName;
    return; // abort - someone already buzzed
  }).then(result => {
    if (result.committed) {
      return update(sessionRef(), { buzzTime: buzzTimeMs }).then(() => true);
    }
    return false;
  });
}

export function incrementQuestionStat(qId: string, kind: QuestionStatKind): Promise<void> {
  return runTransaction(questionStatRef(qId, kind), current => {
    return (typeof current === 'number' ? current : 0) + 1;
  }).then(() => undefined);
}
