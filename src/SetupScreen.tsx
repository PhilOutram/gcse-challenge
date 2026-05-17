import type { Theme } from './App';
import type { AllTotals } from './stats';
import { orderedPlayerNames, playerStyle, subjectDot } from './styles';
import type { ManifestEntry } from './topicLoader';
import type { Role, SessionState } from './types';

interface SetupScreenProps {
  session: SessionState | null;
  role: Role;
  name: string;
  setName: (n: string) => void;
  deviceId: string;
  totals: AllTotals;
  manifest: ManifestEntry[];
  filterSubject: string;
  setFilterSubject: (s: string) => void;
  filterLevel: string;
  setFilterLevel: (l: string) => void;
  theme: Theme;
  setTheme: (t: Theme) => void;
  onHost: () => void;
  onJoin: () => void;
  onCancel: () => void;
  onStartTopic: (entry: ManifestEntry) => void;
}

export default function SetupScreen({
  session, role, name, setName, deviceId, totals, manifest,
  filterSubject, setFilterSubject, filterLevel, setFilterLevel,
  theme, setTheme,
  onHost, onJoin, onCancel, onStartTopic,
}: SetupScreenProps) {
  const nameTrim = name.trim();
  const playerNames = orderedPlayerNames(session);
  const existingEntry = session?.players?.[nameTrim];
  const nameClashesWithQm = !!session && nameTrim === session.qmName;
  const nameTakenByOther = !!existingEntry && existingEntry.deviceId !== deviceId;
  const myTotals = totals[nameTrim];

  const subjects = [...new Set(manifest.map(t => t.subject))];
  const levels = [...new Set(manifest.map(t => t.level))];
  const filteredTopics = manifest.filter(t =>
    (filterSubject === 'all' || t.subject === filterSubject) &&
    (filterLevel === 'all' || t.level === filterLevel)
  );

  const segBase =
    'px-3 py-1 text-xs uppercase tracking-wider transition';
  const segActive =
    'bg-amber-500 text-slate-950 dark:bg-amber-400 dark:text-slate-950';
  const segIdle =
    'text-slate-600 hover:bg-slate-200 dark:text-slate-400 dark:hover:bg-white/5';

  return (
    <div className="space-y-6">
      <section className="space-y-3">
        <div className="flex justify-end">
          <div
            role="group"
            aria-label="Theme"
            className="inline-flex rounded-md border border-slate-200 overflow-hidden dark:border-white/10"
          >
            <button
              type="button"
              onClick={() => setTheme('light')}
              aria-pressed={theme === 'light'}
              className={`${segBase} ${theme === 'light' ? segActive : segIdle}`}
            >
              Light
            </button>
            <button
              type="button"
              onClick={() => setTheme('dark')}
              aria-pressed={theme === 'dark'}
              className={`${segBase} ${theme === 'dark' ? segActive : segIdle}`}
            >
              Dark
            </button>
          </div>
        </div>

        <label className="block">
          <span className="text-sm text-slate-500 dark:text-slate-400">Your name</span>
          <input
            type="text"
            value={name}
            onChange={e => setName(e.target.value)}
            placeholder="e.g. Pete"
            disabled={role === 'qm' || role === 'player'}
            className="mt-1 w-full px-3 py-2 rounded-md bg-slate-100 border border-slate-200 focus:border-amber-400/60 focus:outline-none disabled:opacity-60 dark:bg-white/5 dark:border-white/10"
            maxLength={20}
          />
          {myTotals && (
            <div className="mt-1 text-xs text-slate-400 dark:text-slate-500">
              Overall: <span className="text-emerald-700 tabular-nums dark:text-emerald-300">{myTotals.correct} correct</span>
              {' · '}
              <span className="text-rose-700 tabular-nums dark:text-rose-300">{myTotals.wrong} wrong</span>
            </div>
          )}
        </label>

        {!session && (
          <button
            onClick={onHost}
            disabled={!nameTrim}
            className="w-full py-3 rounded-md bg-amber-500 hover:bg-amber-400 text-slate-950 font-semibold tracking-wide disabled:bg-slate-200 disabled:text-slate-400 transition dark:disabled:bg-white/10 dark:disabled:text-slate-500"
          >
            Host a Quiz
          </button>
        )}

        {session && role === 'spectator' && (
          <div className="space-y-2">
            <button
              onClick={onJoin}
              disabled={!nameTrim || nameClashesWithQm || nameTakenByOther}
              className="w-full py-3 rounded-md bg-amber-500 hover:bg-amber-400 text-slate-950 font-semibold tracking-wide disabled:bg-slate-200 disabled:text-slate-400 transition dark:disabled:bg-white/10 dark:disabled:text-slate-500"
            >
              {nameClashesWithQm ? 'Name taken (QM has it)' :
                nameTakenByOther ? 'Name taken by another device' :
                  'Join Quiz'}
            </button>
            <button
              onClick={onCancel}
              className="w-full py-2 rounded-md border border-slate-200 text-rose-700 hover:bg-rose-50 text-sm dark:border-white/10 dark:text-rose-300 dark:hover:bg-rose-950/40"
            >
              Cancel Current Quiz
            </button>
          </div>
        )}

        {session && (role === 'qm' || role === 'player') && (
          <button
            onClick={onCancel}
            className="w-full py-2 rounded-md border border-slate-200 text-rose-700 hover:bg-rose-50 text-sm dark:border-white/10 dark:text-rose-300 dark:hover:bg-rose-950/40"
          >
            Cancel Quiz
          </button>
        )}
      </section>

      {session && (
        <section className="p-4 rounded-lg border border-slate-200 bg-slate-100 dark:border-white/10 dark:bg-white/[0.03]">
          <h2 className="text-xs uppercase tracking-wider text-slate-500 mb-3 dark:text-slate-400">Lobby</h2>
          <ul className="space-y-1.5 text-sm">
            <li className="flex items-center gap-2">
              <span className="text-amber-500 dark:text-amber-400">●</span>
              <span>{session.qmName}</span>
              <span className="text-xs text-slate-400 dark:text-slate-500">Quiz Master</span>
            </li>
            {playerNames.map(pn => {
              const ps = playerStyle(pn, playerNames);
              return (
                <li key={pn} className="flex items-center gap-2">
                  <span className={`w-2 h-2 rounded-full ${ps.dot}`} />
                  <span className={ps.text}>{pn}</span>
                  <span className="text-xs text-slate-400 dark:text-slate-500">Player</span>
                </li>
              );
            })}
            {playerNames.length === 0 && (
              <li className="text-xs text-slate-400 italic pl-4 dark:text-slate-500">
                Waiting for players...
              </li>
            )}
          </ul>
        </section>
      )}

      {role === 'qm' && (
        <section>
          <h2 className="text-xs uppercase tracking-wider text-slate-500 mb-2 dark:text-slate-400">Pick a topic</h2>
          <div className="flex flex-wrap gap-3 mb-3 text-sm">
            <label className="flex items-center gap-2">
              <span className="text-slate-400 dark:text-slate-500">Subject</span>
              <select
                value={filterSubject}
                onChange={e => setFilterSubject(e.target.value)}
                className="bg-slate-100 border border-slate-200 rounded px-2 py-1 dark:bg-white/5 dark:border-white/10"
              >
                <option value="all">All</option>
                {subjects.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </label>
            <label className="flex items-center gap-2">
              <span className="text-slate-400 dark:text-slate-500">Level</span>
              <select
                value={filterLevel}
                onChange={e => setFilterLevel(e.target.value)}
                className="bg-slate-100 border border-slate-200 rounded px-2 py-1 dark:bg-white/5 dark:border-white/10"
              >
                <option value="all">All</option>
                {levels.map(l => <option key={l} value={l}>{l}</option>)}
              </select>
            </label>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {filteredTopics.map(t => (
              <button
                key={t.id}
                onClick={() => onStartTopic(t)}
                disabled={playerNames.length === 0}
                className="text-left p-3 rounded-lg border border-slate-200 bg-slate-100 hover:bg-slate-200 disabled:opacity-40 disabled:cursor-not-allowed transition dark:border-white/10 dark:bg-white/[0.03] dark:hover:bg-white/[0.06]"
              >
                <div className="flex items-center gap-2 text-xs text-slate-500 mb-1 dark:text-slate-400">
                  <span className={`w-2 h-2 rounded-full ${subjectDot(t.subject)}`} />
                  <span>{t.subject} · {t.level}</span>
                </div>
                <div className="text-base font-medium">{t.topic}</div>
                <div className="text-xs text-slate-400 mt-1 dark:text-slate-500">{t.questionCount} questions</div>
              </button>
            ))}
            {filteredTopics.length === 0 && (
              <div className="text-sm text-slate-400 col-span-full dark:text-slate-500">No topics match these filters.</div>
            )}
          </div>
          {playerNames.length === 0 && (
            <div className="mt-3 text-xs text-slate-400 italic dark:text-slate-500">
              Waiting for a player to join before you can start a round.
            </div>
          )}
        </section>
      )}

      {role === 'player' && (
        <div className="text-center text-sm text-slate-500 py-4 dark:text-slate-400">
          Waiting for <span className="text-amber-500 dark:text-amber-400">{session?.qmName}</span> to start a round...
        </div>
      )}
    </div>
  );
}
