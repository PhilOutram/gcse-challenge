import { orderedPlayerNames, playerStyle } from './styles';
import type { Role, SessionState } from './types';

interface ResultsScreenProps {
  session: SessionState;
  role: Role;
  onBackToLobby: () => void;
  onCancel: () => void;
}

export default function ResultsScreen({
  session, role, onBackToLobby, onCancel,
}: ResultsScreenProps) {
  const ordered = orderedPlayerNames(session);
  const players = ordered.map(n => ({
    name: n,
    score: session.players?.[n]?.score ?? 0,
  }));
  const maxScore = players.reduce((m, p) => Math.max(m, p.score), 0);
  const winners = players.filter(p => p.score === maxScore);
  const draw = winners.length !== 1;
  const winnerStyle = !draw ? playerStyle(winners[0].name, ordered) : null;

  return (
    <div className="space-y-6">
      <div className="text-center py-6 space-y-3">
        <div className="text-xs uppercase tracking-wider text-slate-400">Round complete</div>
        <h2 className="text-4xl font-semibold tracking-tight">
          {draw ? 'A draw' : <>
            <span className={winnerStyle?.text ?? 'text-amber-300'}>{winners[0].name}</span> wins
          </>}
        </h2>
        <div className="flex justify-center gap-10 pt-2 flex-wrap">
          {players.map(p => {
            const ps = playerStyle(p.name, ordered);
            return (
              <div key={p.name}>
                <div className={`text-sm ${ps.text}`}>{p.name}</div>
                <div className="text-3xl tabular-nums font-semibold">{p.score}</div>
              </div>
            );
          })}
        </div>
        {role === 'qm' && (
          <button
            onClick={onBackToLobby}
            className="mt-4 px-5 py-2 rounded-md bg-amber-500 hover:bg-amber-400 text-slate-950 font-semibold"
          >
            New round →
          </button>
        )}
        {role !== 'qm' && (
          <div className="text-xs text-slate-500 mt-4">Waiting for QM to start a new round...</div>
        )}
      </div>

      <section className="border-t border-white/10 pt-6">
        <h3 className="text-xs uppercase tracking-wider text-slate-400 mb-3">
          Review · {session.roundResults.length} questions
        </h3>
        <div className="space-y-2.5">
          {session.roundResults.map((r, idx) => {
            const correct = r.status === 'correct';
            return (
              <div
                key={idx}
                className={
                  'p-3 rounded-md border ' +
                  (correct ? 'border-emerald-800/60 bg-emerald-950/15' : 'border-rose-800/60 bg-rose-950/15')
                }
              >
                <div className="flex items-baseline justify-between gap-3 mb-1.5">
                  <div className="text-base flex-1 font-medium">{r.q}</div>
                  <div className={
                    'text-xs whitespace-nowrap ' +
                    (correct ? 'text-emerald-300' : 'text-rose-300')
                  }>
                    {correct ? `✓ ${r.wonBy}` : '✗ missed'}
                  </div>
                </div>
                <div className="text-sm text-amber-300">{r.a}</div>
                {r.explanation && (
                  <div className="text-sm text-slate-400 mt-1.5 leading-relaxed">{r.explanation}</div>
                )}
              </div>
            );
          })}
        </div>
      </section>

      <div className="pt-2 text-center">
        <button onClick={onCancel} className="text-xs text-slate-500 hover:text-rose-400">
          End session
        </button>
      </div>
    </div>
  );
}
