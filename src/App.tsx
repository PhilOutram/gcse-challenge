import { useEffect, useRef, useState } from 'react';
import SetupScreen from './SetupScreen';
import QuizScreen from './QuizScreen';
import ResultsScreen from './ResultsScreen';
import {
  NAME_KEY,
  STATS_KEY,
  THEME_KEY,
  TOTALS_KEY,
  getDeviceId,
  incrementTotal,
  loadJSON,
  saveJSON,
  updatePlayerStat,
  type AllTotals,
} from './stats';

export type Theme = 'light' | 'dark';

function initialTheme(): Theme {
  const stored = loadJSON<Theme | ''>(THEME_KEY, '');
  if (stored === 'light' || stored === 'dark') return stored;
  if (typeof window !== 'undefined' && window.matchMedia) {
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  }
  return 'dark';
}
import {
  cancelSession,
  createSession,
  incrementQuestionStat,
  subscribeToSession,
  tryClaimBuzz,
  updateSession,
  updateSessionPaths,
} from './firebase';
import { fetchManifest, loadTopic, type ManifestEntry } from './topicLoader';
import type {
  PlayerStats,
  Question,
  Role,
  RoundResultEntry,
  SessionPlayer,
  SessionState,
} from './types';

function deriveRole(session: SessionState | null, deviceId: string, name: string): Role {
  if (!session) return 'none';
  if (session.qmDeviceId === deviceId) return 'qm';
  if (name && session.players && session.players[name]?.deviceId === deviceId) return 'player';
  return 'spectator';
}

export default function App() {
  const [deviceId] = useState<string>(() => getDeviceId());
  const [name, setNameState] = useState<string>(() => loadJSON<string>(NAME_KEY, ''));
  const [session, setSession] = useState<SessionState | null>(null);
  const [stats, setStats] = useState<PlayerStats>(() => loadJSON<PlayerStats>(STATS_KEY, {}));
  const [totals, setTotals] = useState<AllTotals>(() => loadJSON<AllTotals>(TOTALS_KEY, {}));
  const [theme, setTheme] = useState<Theme>(initialTheme);

  const [manifest, setManifest] = useState<ManifestEntry[]>([]);
  const [manifestError, setManifestError] = useState<string | null>(null);

  const [filterSubject, setFilterSubject] = useState<string>('all');
  const [filterLevel, setFilterLevel] = useState<string>('all');

  const consumedResultsRef = useRef<number>(0);

  useEffect(() => saveJSON(NAME_KEY, name), [name]);
  useEffect(() => saveJSON(STATS_KEY, stats), [stats]);
  useEffect(() => saveJSON(TOTALS_KEY, totals), [totals]);
  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark');
    saveJSON(THEME_KEY, theme);
  }, [theme]);

  useEffect(() => {
    fetchManifest()
      .then(setManifest)
      .catch((e: unknown) => setManifestError(e instanceof Error ? e.message : String(e)));
  }, []);

  useEffect(() => subscribeToSession(setSession), []);

  const role = deriveRole(session, deviceId, name);

  useEffect(() => {
    if (role !== 'player' || !session) return;
    const results = session.roundResults ?? [];
    if (results.length <= consumedResultsRef.current) {
      consumedResultsRef.current = results.length;
      return;
    }
    const newEntries = results.slice(consumedResultsRef.current);
    consumedResultsRef.current = results.length;
    setStats(prev => {
      let next = prev;
      for (const entry of newEntries) {
        if (entry.wonBy === name) {
          next = updatePlayerStat(next, name, entry.qId, true);
        } else if (entry.losers?.includes(name)) {
          next = updatePlayerStat(next, name, entry.qId, false);
        }
      }
      return next;
    });
    setTotals(prev => {
      let next = prev;
      for (const entry of newEntries) {
        if (entry.wonBy === name) {
          next = incrementTotal(next, name, 'correct');
        } else if (entry.losers?.includes(name)) {
          next = incrementTotal(next, name, 'wrong');
        }
      }
      return next;
    });
  }, [session, role, name]);

  useEffect(() => {
    if (session?.phase === 'quiz' && (session.roundResults?.length ?? 0) === 0) {
      consumedResultsRef.current = 0;
    }
  }, [session?.phase, session?.roundResults?.length]);

  const setName = (n: string) => {
    setNameState(n);
  };

  const handleHost = async () => {
    if (!name.trim()) return;
    await createSession(deviceId, name.trim());
  };

  const handleJoin = async () => {
    const trimmed = name.trim();
    if (!trimmed || !session) return;
    if (trimmed === session.qmName) return;

    const existing = session.players?.[trimmed];
    if (existing) {
      // Reconnect only if this device originally owned the name.
      // (Different deviceId = someone else's slot, blocked by the UI too.)
      if (existing.deviceId === deviceId) return; // already mine, no-op
      return;
    }

    const newPlayer: SessionPlayer = { deviceId, score: 0, joinedAt: Date.now() };
    await updateSessionPaths({ [`players/${trimmed}`]: newPlayer });
  };

  const handleCancel = async () => {
    if (!confirm('Cancel the current quiz for everyone? This cannot be undone.')) return;
    await cancelSession();
  };

  const handleStartTopic = async (entry: ManifestEntry) => {
    const topic = await loadTopic(entry.file);
    const now = Date.now();
    await updateSession({
      phase: 'quiz',
      currentTopic: topic,
      qIdx: 0,
      buzzedBy: null,
      buzzTime: null,
      lockedOut: {},
      revealed: false,
      hintGiven: false,
      showQuestionToPlayers: false,
      roundResults: [],
      questionStartTime: now,
    });
  };

  const handleBuzz = async () => {
    if (!session || role !== 'player') return;
    if (session.revealed || session.buzzedBy !== null) return;
    if (session.lockedOut?.[name]) return;
    const elapsed = session.questionStartTime
      ? Date.now() - session.questionStartTime
      : 0;
    await tryClaimBuzz(name, elapsed);
  };

  const currentQ: Question | undefined =
    session?.currentTopic?.questions?.[session.qIdx];

  const handleCorrect = async () => {
    if (!session || !currentQ || session.buzzedBy === null) return;
    const winner = session.buzzedBy;
    const newScore = (session.players?.[winner]?.score ?? 0) + 1;
    const entry: RoundResultEntry = {
      qId: currentQ.id,
      q: currentQ.q,
      a: currentQ.a,
      explanation: currentQ.explanation,
      status: 'correct',
      wonBy: winner,
      losers: Object.keys(session.lockedOut ?? {}),
    };
    await updateSessionPaths({
      revealed: true,
      roundResults: [...(session.roundResults ?? []), entry],
      [`players/${winner}/score`]: newScore,
    });
    void incrementQuestionStat(currentQ.id, 'correct');
  };

  const handleWrong = async () => {
    if (!session || !currentQ || session.buzzedBy === null) return;
    const loser = session.buzzedBy;
    const newLockedOut = { ...(session.lockedOut ?? {}), [loser]: true as const };
    const playerNames = Object.keys(session.players ?? {});
    const everyoneLocked =
      playerNames.length > 0 && playerNames.every(p => newLockedOut[p]);

    if (everyoneLocked) {
      const entry: RoundResultEntry = {
        qId: currentQ.id,
        q: currentQ.q,
        a: currentQ.a,
        explanation: currentQ.explanation,
        status: 'unanswered',
        wonBy: null,
        losers: Object.keys(newLockedOut),
      };
      await updateSession({
        lockedOut: newLockedOut,
        buzzedBy: null,
        buzzTime: null,
        revealed: true,
        roundResults: [...(session.roundResults ?? []), entry],
      });
    } else {
      await updateSession({
        lockedOut: newLockedOut,
        buzzedBy: null,
        buzzTime: null,
        questionStartTime: Date.now(),
      });
    }
    void incrementQuestionStat(currentQ.id, 'wrong');
  };

  const handleSkip = async () => {
    if (!session || !currentQ) return;
    const entry: RoundResultEntry = {
      qId: currentQ.id,
      q: currentQ.q,
      a: currentQ.a,
      explanation: currentQ.explanation,
      status: 'unanswered',
      wonBy: null,
      losers: Object.keys(session.lockedOut ?? {}),
    };
    await updateSession({
      revealed: true,
      roundResults: [...(session.roundResults ?? []), entry],
    });
  };

  const handleHint = async () => {
    await updateSession({ hintGiven: true });
  };

  const handleNext = async () => {
    if (!session || !session.currentTopic) return;
    const total = session.currentTopic.questions.length;
    if (session.qIdx + 1 >= total) {
      await updateSession({ phase: 'results' });
      return;
    }
    await updateSession({
      qIdx: session.qIdx + 1,
      buzzedBy: null,
      buzzTime: null,
      lockedOut: {},
      revealed: false,
      hintGiven: false,
      questionStartTime: Date.now(),
    });
  };

  const handleBackToLobby = async () => {
    if (role !== 'qm') return;
    await updateSession({
      phase: 'lobby',
      currentTopic: null,
      qIdx: 0,
      buzzedBy: null,
      buzzTime: null,
      lockedOut: {},
      revealed: false,
      hintGiven: false,
      roundResults: [],
      showQuestionToPlayers: false,
    });
  };

  const handleToggleShowQuestion = async (v: boolean) => {
    await updateSession({ showQuestionToPlayers: v });
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-indigo-50 via-slate-50 to-slate-50 text-slate-900 dark:from-indigo-950 dark:via-slate-950 dark:to-slate-950 dark:text-slate-100">
      <div className="max-w-2xl mx-auto px-4 py-6">
        <header className="flex justify-between items-baseline pb-4 mb-6 border-b border-slate-200 dark:border-white/10">
          <h1 className="text-2xl font-semibold tracking-tight">
            GCSE <span className="text-amber-500 dark:text-amber-400">Challenge</span>
          </h1>
          {session && (
            <div className="text-xs text-slate-500 dark:text-slate-400">
              {role === 'qm' ? `Hosting as ${session.qmName}` :
                role === 'player' ? `Playing as ${name}` :
                  `${session.qmName}'s quiz`}
            </div>
          )}
        </header>

        {manifestError && (
          <div className="mb-4 p-3 rounded border border-rose-300 bg-rose-50 text-sm text-rose-700 dark:border-rose-700/60 dark:bg-rose-950/30 dark:text-rose-300">
            Failed to load topics: {manifestError}
          </div>
        )}

        {(!session || session.phase === 'lobby') && (
          <SetupScreen
            session={session}
            role={role}
            name={name}
            setName={setName}
            deviceId={deviceId}
            totals={totals}
            manifest={manifest}
            filterSubject={filterSubject}
            setFilterSubject={setFilterSubject}
            filterLevel={filterLevel}
            setFilterLevel={setFilterLevel}
            theme={theme}
            setTheme={setTheme}
            onHost={handleHost}
            onJoin={handleJoin}
            onCancel={handleCancel}
            onStartTopic={handleStartTopic}
          />
        )}

        {session?.phase === 'quiz' && currentQ && session.currentTopic && (
          <QuizScreen
            session={session}
            role={role}
            name={name}
            setName={setName}
            currentQ={currentQ}
            onBuzz={handleBuzz}
            onJoin={handleJoin}
            onCorrect={handleCorrect}
            onWrong={handleWrong}
            onHint={handleHint}
            onSkip={handleSkip}
            onNext={handleNext}
            onToggleShowQuestion={handleToggleShowQuestion}
            onCancel={handleCancel}
          />
        )}

        {session?.phase === 'results' && (
          <ResultsScreen
            session={session}
            role={role}
            totals={totals}
            onBackToLobby={handleBackToLobby}
            onCancel={handleCancel}
          />
        )}
      </div>
    </div>
  );
}
