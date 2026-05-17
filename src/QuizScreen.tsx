import { useState } from 'react';
import { fmtSecs, orderedPlayerNames, playerStyle, subjectDot } from './styles';
import type { Question, Role, SessionState } from './types';

interface QuizScreenProps {
  session: SessionState;
  role: Role;
  name: string;
  setName: (n: string) => void;
  currentQ: Question;
  onBuzz: () => void;
  onJoin: () => void;
  onCorrect: () => void;
  onWrong: () => void;
  onHint: () => void;
  onSkip: () => void;
  onNext: () => void;
  onToggleShowQuestion: (v: boolean) => void;
  onCancel: () => void;
}

export default function QuizScreen({
  session, role, name, setName, currentQ,
  onBuzz, onJoin, onCorrect, onWrong, onHint, onSkip, onNext,
  onToggleShowQuestion, onCancel,
}: QuizScreenProps) {
  const topic = session.currentTopic!;
  const total = topic.questions.length;
  const playerNames = orderedPlayerNames(session);
  const allLocked = playerNames.length > 0 &&
    playerNames.every(p => session.lockedOut?.[p]);
  const dotClass = subjectDot(topic.subject);
  const myStyle = role === 'player' ? playerStyle(name, playerNames) : null;
  const buzzerStyle = session.buzzedBy ? playerStyle(session.buzzedBy, playerNames) : null;

  // QM-only optimistic state for "Next" (avoid double-click while await pending).
  const [advancing, setAdvancing] = useState(false);

  const handleNext = () => {
    if (advancing) return;
    setAdvancing(true);
    Promise.resolve(onNext()).finally(() => setAdvancing(false));
  };

  const myLocked = role === 'player' && Boolean(session.lockedOut?.[name]);
  const myScore = role === 'player' ? session.players?.[name]?.score ?? 0 : null;
  const buzzedByName = session.buzzedBy;
  const buzzTimeMs = session.buzzTime;
  const showQuestionToMe = role === 'qm' || session.showQuestionToPlayers || session.revealed;

  const buzzButtonState =
    session.revealed ? 'revealed' :
      myLocked ? 'locked' :
        buzzedByName === name ? 'mine' :
          buzzedByName !== null ? 'someone-else' :
            'ready';

  return (
    <div className="space-y-5">
      <section>
        <div className="flex items-baseline justify-between mb-1">
          <h2 className="text-2xl font-semibold tracking-tight">{topic.topic}</h2>
          <div className="text-xs text-slate-500 tabular-nums dark:text-slate-400">Q {session.qIdx + 1} of {total}</div>
        </div>
        <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
          <span className={`w-2 h-2 rounded-full ${dotClass}`} />
          <span>{topic.subject} · {topic.level}</span>
        </div>
      </section>

      {role === 'qm' && (
        <label className="flex items-center gap-2 text-sm text-slate-500 cursor-pointer select-none dark:text-slate-400">
          <input
            type="checkbox"
            checked={session.showQuestionToPlayers}
            onChange={e => onToggleShowQuestion(e.target.checked)}
            className="accent-amber-500"
          />
          Show question on players' devices
        </label>
      )}

      {showQuestionToMe ? (
        <div className="text-xl font-medium leading-snug">{currentQ.q}</div>
      ) : (
        <div className="text-sm text-slate-400 italic dark:text-slate-500">Question hidden by QM</div>
      )}

      {session.hintGiven && currentQ.hint && (
        <div className="p-3 rounded-md border-l-2 border-sky-400 bg-sky-50 dark:bg-sky-950/20">
          <div className="text-xs text-sky-700 mb-1 uppercase tracking-wider dark:text-sky-300">Hint</div>
          <div className="text-base italic">{currentQ.hint}</div>
        </div>
      )}

      {(role === 'qm' || session.revealed) && (
        <div className="p-3 rounded-md border-l-2 border-amber-400 bg-amber-50 dark:bg-amber-950/20">
          <div className="text-xs text-amber-700 mb-1 uppercase tracking-wider dark:text-amber-300">
            Answer {role === 'qm' && !session.revealed ? '· QM only' : ''}
          </div>
          <div className="text-amber-800 text-lg font-medium dark:text-amber-200">{currentQ.a}</div>
          {session.revealed && currentQ.explanation && (
            <div className="text-sm text-slate-700 mt-2 leading-relaxed dark:text-slate-300">{currentQ.explanation}</div>
          )}
        </div>
      )}

      {role === 'qm' && (
        <>
          <div className="text-sm text-slate-700 dark:text-slate-300">
            {session.revealed
              ? 'Question complete - tap Next.'
              : buzzedByName !== null
                ? <><span className={buzzerStyle?.text ?? 'text-amber-700 dark:text-amber-300'}>{buzzedByName}</span> buzzed in <span className="tabular-nums">{fmtSecs(buzzTimeMs)}</span>. Awaiting answer.</>
                : allLocked
                  ? 'All players locked out.'
                  : playerNames.length === 0
                    ? 'No players in session.'
                    : 'Awaiting buzz...'}
          </div>

          <div className="flex gap-2 flex-wrap">
            {buzzedByName !== null && !session.revealed && (
              <>
                <button onClick={onCorrect} className="px-4 py-2 rounded-md bg-emerald-600 hover:bg-emerald-500 text-white font-medium">
                  Right
                </button>
                <button onClick={onWrong} className="px-4 py-2 rounded-md bg-rose-600 hover:bg-rose-500 text-white font-medium">
                  Wrong
                </button>
              </>
            )}
            {!session.revealed && currentQ.hint && !session.hintGiven && (
              <button onClick={onHint} className="px-4 py-2 rounded-md border border-sky-300 bg-sky-50 text-sky-700 hover:bg-sky-100 dark:border-sky-700/60 dark:bg-sky-950/30 dark:text-sky-300 dark:hover:bg-sky-950/50">
                Give Hint
              </button>
            )}
            {!session.revealed && (
              <button onClick={onSkip} className="px-4 py-2 rounded-md border border-slate-200 text-slate-700 hover:bg-slate-100 dark:border-white/10 dark:text-slate-300 dark:hover:bg-white/5">
                Skip
              </button>
            )}
            {(session.revealed || allLocked) && (
              <button
                onClick={handleNext}
                disabled={advancing}
                className="px-5 py-2 rounded-md bg-amber-500 hover:bg-amber-400 text-slate-950 font-semibold ml-auto disabled:opacity-60"
              >
                {session.qIdx + 1 >= total ? 'Finish round' : 'Next →'}
              </button>
            )}
          </div>

          <div className="pt-2 border-t border-slate-200 dark:border-white/10">
            <div className="text-xs uppercase tracking-wider text-slate-400 mb-2 dark:text-slate-500">Players</div>
            <div className="grid grid-cols-2 gap-2">
              {playerNames.map(p => {
                const ps = playerStyle(p, playerNames);
                const locked = Boolean(session.lockedOut?.[p]);
                const buzzed = buzzedByName === p;
                const score = session.players[p]?.score ?? 0;
                return (
                  <div
                    key={p}
                    className={
                      'p-3 rounded-md border ' +
                      (buzzed ? `${ps.border} bg-slate-100 dark:bg-white/[0.05]` :
                        locked ? 'border-rose-300 bg-rose-50 opacity-60 dark:border-rose-700/40 dark:bg-rose-950/15' :
                          'border-slate-200 bg-slate-100 dark:border-white/10 dark:bg-white/[0.03]')
                    }
                  >
                    <div className="flex justify-between items-baseline gap-2">
                      <div className="flex items-center gap-2 min-w-0">
                        <span className={`w-2 h-2 rounded-full shrink-0 ${ps.dot}`} />
                        <span className={`text-sm truncate ${ps.text}`}>{p}</span>
                      </div>
                      <span className="tabular-nums text-lg shrink-0">{score}</span>
                    </div>
                    <div className="text-xs text-slate-400 mt-0.5 dark:text-slate-500">
                      {buzzed ? `Buzzed in ${fmtSecs(buzzTimeMs)}` :
                        locked ? 'Locked out' :
                          'Active'}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </>
      )}

      {role === 'player' && (
        <div className="space-y-3 pt-2">
          <div className="flex justify-between items-baseline">
            <span className="text-xs uppercase tracking-wider text-slate-400 dark:text-slate-500">Your score</span>
            <span className="tabular-nums text-2xl font-semibold">{myScore ?? 0}</span>
          </div>

          <button
            onClick={onBuzz}
            disabled={buzzButtonState !== 'ready'}
            className={
              'w-full py-8 rounded-lg text-2xl tracking-widest font-bold transition ' +
              (buzzButtonState === 'ready' ? `${myStyle?.bg ?? 'bg-amber-500'} ${myStyle?.bgHover ?? 'hover:bg-amber-400'} text-slate-950` :
                buzzButtonState === 'mine' ? `${myStyle?.bgActive ?? 'bg-amber-300'} text-slate-950 ring-4 ${myStyle?.ring ?? 'ring-amber-200'}` :
                  buzzButtonState === 'locked' ? 'bg-rose-100 text-rose-500 cursor-not-allowed dark:bg-rose-950/40 dark:text-rose-400' :
                    'bg-slate-100 text-slate-400 cursor-not-allowed dark:bg-white/5 dark:text-slate-500')
            }
          >
            {buzzButtonState === 'ready' ? 'BUZZ' :
              buzzButtonState === 'mine' ? 'BUZZED' :
                buzzButtonState === 'locked' ? 'LOCKED' :
                  buzzButtonState === 'someone-else' ? buzzedByName?.toUpperCase() ?? 'WAIT' :
                    'WAIT'}
          </button>

          {buzzedByName && buzzTimeMs !== null && (
            <div className="text-center text-sm text-slate-500 dark:text-slate-400">
              <span className={buzzerStyle?.text ?? 'text-amber-700 dark:text-amber-300'}>{buzzedByName}</span> buzzed in <span className="tabular-nums">{fmtSecs(buzzTimeMs)}</span>
            </div>
          )}
        </div>
      )}

      {role === 'spectator' && (() => {
        const nameTrim = name.trim();
        const clashesQm = nameTrim === session.qmName;
        const isReconnect = nameTrim !== '' && playerNames.includes(nameTrim);
        const disabled = !nameTrim || clashesQm;
        return (
          <div className="p-4 rounded-lg border border-amber-300 bg-amber-50 space-y-3 dark:border-amber-700/40 dark:bg-amber-950/15">
            <div className="text-sm text-amber-700 dark:text-amber-300">
              {isReconnect ? 'Reconnect to the quiz?' : 'Quiz in progress · join in?'}
            </div>
            <input
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="Your name"
              className="w-full px-3 py-2 rounded-md bg-slate-100 border border-slate-200 focus:border-amber-400/60 focus:outline-none dark:bg-white/5 dark:border-white/10"
              maxLength={20}
            />
            <button
              onClick={onJoin}
              disabled={disabled}
              className="w-full py-2 rounded-md bg-amber-500 hover:bg-amber-400 text-slate-950 font-semibold disabled:bg-slate-200 disabled:text-slate-400 dark:disabled:bg-white/10 dark:disabled:text-slate-500"
            >
              {clashesQm ? 'Name taken (QM has it)' :
                isReconnect ? `Reconnect as ${nameTrim}` :
                  'Join Quiz'}
            </button>
          </div>
        );
      })()}

      <div className="pt-2 text-center">
        <button onClick={onCancel} className="text-xs text-slate-400 hover:text-rose-500 dark:text-slate-500 dark:hover:text-rose-400">
          Cancel quiz
        </button>
      </div>
    </div>
  );
}
