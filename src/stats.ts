import type { PlayerStats } from './types';

export const STATS_KEY = 'gcse-challenge-stats-v2';
export const NAME_KEY = 'gcse-challenge-name-v1';
export const DEVICE_ID_KEY = 'gcse-challenge-device-id-v1';
export const TOTALS_KEY = 'gcse-challenge-totals-v1';
export const THEME_KEY = 'gcse-challenge-theme-v1';
export const GRADUATE_THRESHOLD = 2;

export function getDeviceId(): string {
  let id = localStorage.getItem(DEVICE_ID_KEY);
  if (!id) {
    id = crypto.randomUUID();
    localStorage.setItem(DEVICE_ID_KEY, id);
  }
  return id;
}

export interface PlayerTotals {
  correct: number;
  wrong: number;
}

export type AllTotals = Record<string, PlayerTotals>;

export function incrementTotal(
  totals: AllTotals,
  playerName: string,
  kind: 'correct' | 'wrong',
): AllTotals {
  const cur = totals[playerName] ?? { correct: 0, wrong: 0 };
  return {
    ...totals,
    [playerName]: {
      correct: cur.correct + (kind === 'correct' ? 1 : 0),
      wrong: cur.wrong + (kind === 'wrong' ? 1 : 0),
    },
  };
}

export function loadJSON<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (raw === null) return fallback;
    return (JSON.parse(raw) as T) ?? fallback;
  } catch {
    return fallback;
  }
}

export function saveJSON<T>(key: string, value: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // ignore quota / disabled storage
  }
}

export function updatePlayerStat(
  stats: PlayerStats,
  playerName: string,
  qId: string,
  correct: boolean,
): PlayerStats {
  const ps = stats[playerName] ?? {};
  const cur = ps[qId] ?? { c: 0, missed: false };
  return {
    ...stats,
    [playerName]: {
      ...ps,
      [qId]: {
        c: correct ? cur.c + 1 : 0,
        missed: cur.missed || !correct,
      },
    },
  };
}

export function countMissedFor(stats: PlayerStats, playerName: string): number {
  return Object.values(stats[playerName] ?? {})
    .filter(s => s.missed && s.c < GRADUATE_THRESHOLD)
    .length;
}

export function computeWrongPool(stats: PlayerStats, playerNames: string[]): string[] {
  return [...new Set(
    playerNames.flatMap(name =>
      Object.entries(stats[name] ?? {})
        .filter(([, s]) => s.missed && s.c < GRADUATE_THRESHOLD)
        .map(([qId]) => qId),
    ),
  )];
}
