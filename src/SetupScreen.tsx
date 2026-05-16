import { orderedPlayerNames, playerStyle, subjectDot } from './styles';
import type { ManifestEntry } from './topicLoader';
import type { Role, SessionState } from './types';

interface SetupScreenProps {
  session: SessionState | null;
  role: Role;
  name: string;
  setName: (n: string) => void;
  manifest: ManifestEntry[];
  filterSubject: string;
  setFilterSubject: (s: string) => void;
  filterLevel: string;
  setFilterLevel: (l: string) => void;
  onHost: () => void;
  onJoin: () => void;
  onCancel: () => void;
  onStartTopic: (entry: ManifestEntry) => void;
}

export default function SetupScreen({
  session, role, name, setName, manifest,
  filterSubject, setFilterSubject, filterLevel, setFilterLevel,
  onHost, onJoin, onCancel, onStartTopic,
}: SetupScreenProps) {
  const nameTrim = name.trim();
  const playerNames = orderedPlayerNames(session);
  const nameClashesWithQm = !!session && nameTrim === session.qmName;
  const nameClashesWithPlayer = !!session && nameTrim !== '' && playerNames.includes(nameTrim) && role !== 'player';

  const subjects = [...new Set(manifest.map(t => t.subject))];
  const levels = [...new Set(manifest.map(t => t.level))];
  const filteredTopics = manifest.filter(t =>
    (filterSubject === 'all' || t.subject === filterSubject) &&
    (filterLevel === 'all' || t.level === filterLevel)
  );

  return (
    <div className="space-y-6">
      <section className="space-y-3">
        <label className="block">
          <span className="text-sm text-slate-400">Your name</span>
          <input
            type="text"
            value={name}
            onChange={e => setName(e.target.value)}
            placeholder="e.g. Pete"
            disabled={role === 'qm' || role === 'player'}
            className="mt-1 w-full px-3 py-2 rounded-md bg-white/5 border border-white/10 focus:border-amber-400/60 focus:outline-none disabled:opacity-60"
            maxLength={20}
          />
        </label>

        {!session && (
          <button
            onClick={onHost}
            disabled={!nameTrim}
            className="w-full py-3 rounded-md bg-amber-500 hover:bg-amber-400 text-slate-950 font-semibold tracking-wide disabled:bg-white/10 disabled:text-slate-500 transition"
          >
            Host a Quiz
          </button>
        )}

        {session && role === 'spectator' && (
          <div className="space-y-2">
            <button
              onClick={onJoin}
              disabled={!nameTrim || nameClashesWithQm || nameClashesWithPlayer}
              className="w-full py-3 rounded-md bg-amber-500 hover:bg-amber-400 text-slate-950 font-semibold tracking-wide disabled:bg-white/10 disabled:text-slate-500 transition"
            >
              {nameClashesWithQm ? 'Name taken (QM has it)' :
                nameClashesWithPlayer ? 'Name already in use' :
                  'Join Quiz'}
            </button>
            <button
              onClick={onCancel}
              className="w-full py-2 rounded-md border border-white/10 text-rose-300 hover:bg-rose-950/40 text-sm"
            >
              Cancel Current Quiz
            </button>
          </div>
        )}

        {session && (role === 'qm' || role === 'player') && (
          <button
            onClick={onCancel}
            className="w-full py-2 rounded-md border border-white/10 text-rose-300 hover:bg-rose-950/40 text-sm"
          >
            Cancel Quiz
          </button>
        )}
      </section>

      {session && (
        <section className="p-4 rounded-lg border border-white/10 bg-white/[0.03]">
          <h2 className="text-xs uppercase tracking-wider text-slate-400 mb-3">Lobby</h2>
          <ul className="space-y-1.5 text-sm">
            <li className="flex items-center gap-2">
              <span className="text-amber-400">●</span>
              <span>{session.qmName}</span>
              <span className="text-xs text-slate-500">Quiz Master</span>
            </li>
            {playerNames.map(pn => {
              const ps = playerStyle(pn, playerNames);
              return (
                <li key={pn} className="flex items-center gap-2">
                  <span className={`w-2 h-2 rounded-full ${ps.dot}`} />
                  <span className={ps.text}>{pn}</span>
                  <span className="text-xs text-slate-500">Player</span>
                </li>
              );
            })}
            {playerNames.length === 0 && (
              <li className="text-xs text-slate-500 italic pl-4">
                Waiting for players...
              </li>
            )}
          </ul>
        </section>
      )}

      {role === 'qm' && (
        <section>
          <h2 className="text-xs uppercase tracking-wider text-slate-400 mb-2">Pick a topic</h2>
          <div className="flex flex-wrap gap-3 mb-3 text-sm">
            <label className="flex items-center gap-2">
              <span className="text-slate-500">Subject</span>
              <select
                value={filterSubject}
                onChange={e => setFilterSubject(e.target.value)}
                className="bg-white/5 border border-white/10 rounded px-2 py-1"
              >
                <option value="all">All</option>
                {subjects.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </label>
            <label className="flex items-center gap-2">
              <span className="text-slate-500">Level</span>
              <select
                value={filterLevel}
                onChange={e => setFilterLevel(e.target.value)}
                className="bg-white/5 border border-white/10 rounded px-2 py-1"
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
                className="text-left p-3 rounded-lg border border-white/10 bg-white/[0.03] hover:bg-white/[0.06] disabled:opacity-40 disabled:cursor-not-allowed transition"
              >
                <div className="flex items-center gap-2 text-xs text-slate-400 mb-1">
                  <span className={`w-2 h-2 rounded-full ${subjectDot(t.subject)}`} />
                  <span>{t.subject} · {t.level}</span>
                </div>
                <div className="text-base font-medium">{t.topic}</div>
                <div className="text-xs text-slate-500 mt-1">{t.questionCount} questions</div>
              </button>
            ))}
            {filteredTopics.length === 0 && (
              <div className="text-sm text-slate-500 col-span-full">No topics match these filters.</div>
            )}
          </div>
          {playerNames.length === 0 && (
            <div className="mt-3 text-xs text-slate-500 italic">
              Waiting for a player to join before you can start a round.
            </div>
          )}
        </section>
      )}

      {role === 'player' && (
        <div className="text-center text-sm text-slate-400 py-4">
          Waiting for <span className="text-amber-400">{session?.qmName}</span> to start a round...
        </div>
      )}
    </div>
  );
}
