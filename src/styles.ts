import type { SessionState } from './types';

export const SUBJECT_DOT: Record<string, string> = {
  Geography: 'bg-lime-400',
  Biology: 'bg-teal-400',
  Chemistry: 'bg-violet-400',
  History: 'bg-orange-400',
  Revision: 'bg-amber-400',
};

export const subjectDot = (s: string): string => SUBJECT_DOT[s] ?? 'bg-slate-400';

export const fmtSecs = (ms: number | null | undefined): string =>
  `${((ms ?? 0) / 1000).toFixed(1)}s`;

export interface PlayerStyle {
  bg: string;
  bgHover: string;
  bgActive: string;
  // Combined light + dark text-color classes, themed via the `dark:` variant.
  text: string;
  dot: string;
  ring: string;
  border: string;
}

export const PLAYER_STYLES: PlayerStyle[] = [
  { bg: 'bg-sky-500',     bgHover: 'hover:bg-sky-400',     bgActive: 'bg-sky-300',     text: 'text-sky-700 dark:text-sky-300',         dot: 'bg-sky-400',     ring: 'ring-sky-300',     border: 'border-sky-400' },
  { bg: 'bg-violet-500',  bgHover: 'hover:bg-violet-400',  bgActive: 'bg-violet-300',  text: 'text-violet-700 dark:text-violet-300',   dot: 'bg-violet-400',  ring: 'ring-violet-300',  border: 'border-violet-400' },
  { bg: 'bg-cyan-500',    bgHover: 'hover:bg-cyan-400',    bgActive: 'bg-cyan-300',    text: 'text-cyan-700 dark:text-cyan-300',       dot: 'bg-cyan-400',    ring: 'ring-cyan-300',    border: 'border-cyan-400' },
  { bg: 'bg-fuchsia-500', bgHover: 'hover:bg-fuchsia-400', bgActive: 'bg-fuchsia-300', text: 'text-fuchsia-700 dark:text-fuchsia-300', dot: 'bg-fuchsia-400', ring: 'ring-fuchsia-300', border: 'border-fuchsia-400' },
  { bg: 'bg-indigo-500',  bgHover: 'hover:bg-indigo-400',  bgActive: 'bg-indigo-300',  text: 'text-indigo-700 dark:text-indigo-300',   dot: 'bg-indigo-400',  ring: 'ring-indigo-300',  border: 'border-indigo-400' },
  { bg: 'bg-teal-500',    bgHover: 'hover:bg-teal-400',    bgActive: 'bg-teal-300',    text: 'text-teal-700 dark:text-teal-300',       dot: 'bg-teal-400',    ring: 'ring-teal-300',    border: 'border-teal-400' },
];

export function orderedPlayerNames(session: SessionState | null): string[] {
  if (!session) return [];
  return Object.entries(session.players ?? {})
    .sort(([, a], [, b]) => (a.joinedAt ?? 0) - (b.joinedAt ?? 0))
    .map(([name]) => name);
}

export function playerStyle(playerName: string, ordered: string[]): PlayerStyle {
  const idx = ordered.indexOf(playerName);
  if (idx < 0) return PLAYER_STYLES[0];
  return PLAYER_STYLES[idx % PLAYER_STYLES.length];
}
