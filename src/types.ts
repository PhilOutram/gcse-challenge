export interface Question {
  id: string;
  q: string;
  a: string;
  hint?: string;
  explanation?: string;
}

export interface Topic {
  id?: string;
  subject: string;
  level: string;
  topic: string;
  questions: Question[];
}

export interface PerQuestionStat {
  c: number;
  missed: boolean;
}

export type PlayerStats = Record<string, Record<string, PerQuestionStat>>;

export type RoundStatus = 'correct' | 'unanswered';

export interface RoundResultEntry {
  qId: string;
  q: string;
  a: string;
  explanation?: string;
  status: RoundStatus;
  wonBy: string | null;
  losers: string[];
}

export type SessionPhase = 'lobby' | 'quiz' | 'results';

export interface SessionPlayer {
  deviceId: string;
  score: number;
  joinedAt: number;
}

export interface SessionState {
  qmDeviceId: string;
  qmName: string;
  players: Record<string, SessionPlayer>;
  phase: SessionPhase;
  currentTopic: Topic | null;
  qIdx: number;
  buzzedBy: string | null;
  buzzTime: number | null;
  lockedOut: Record<string, true>;
  revealed: boolean;
  hintGiven: boolean;
  showQuestionToPlayers: boolean;
  roundResults: RoundResultEntry[];
  questionStartTime: number;
}

export type QuestionStatKind = 'correct' | 'wrong';

export type Role = 'none' | 'qm' | 'player' | 'spectator';
