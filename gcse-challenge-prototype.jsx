import React, { useState, useEffect } from 'react';

// ============================================================
// SAMPLE TOPIC DATA
// In production: separate JSON files in /topics/ auto-discovered via manifest.
// Each question MUST have a stable id.
// Optional fields: hint, explanation
// ============================================================
const SAMPLE_TOPICS = [
  {
    id: "geo-y9-rivers",
    subject: "Geography",
    level: "Year 9",
    topic: "Rivers and Coasts",
    questions: [
      { id: "geo-y9-rivers-001", q: "What term describes a bend or curve in a river's course?", a: "A meander", hint: "Starts with M — a winding shape", explanation: "Meanders form on the lower course of a river where lateral erosion is greater than vertical erosion." },
      { id: "geo-y9-rivers-002", q: "What is the place where a river starts called?", a: "The source", hint: "Often a spring, lake, or melting glacier", explanation: "The source is usually in upland areas. From the source, the river flows downhill towards its mouth." },
      { id: "geo-y9-rivers-003", q: "What is the name for the flat land beside a river that floods?", a: "The floodplain", explanation: "Floodplains are built up by repeated deposition of silt during floods, making them very fertile." },
      { id: "geo-y9-rivers-004", q: "What landform is created when a river meets the sea and deposits sediment?", a: "A delta", hint: "Named after a Greek letter shape", explanation: "Deltas form when a river loses energy as it enters the sea and deposits its load faster than waves can remove it." },
      { id: "geo-y9-rivers-005", q: "What is the load of a river that is rolled along its bed called?", a: "Traction", explanation: "Traction is one of four transportation processes: traction (rolling), saltation (bouncing), suspension (carried in flow), solution (dissolved)." },
    ]
  },
  {
    id: "bio-y9-cells",
    subject: "Biology",
    level: "Year 9",
    topic: "Cells",
    questions: [
      { id: "bio-y9-cells-001", q: "What is the function of mitochondria?", a: "To produce energy (ATP) — the powerhouse of the cell", hint: "It's where respiration happens", explanation: "Mitochondria are the site of aerobic respiration, where glucose and oxygen produce ATP — the cell's usable energy currency." },
      { id: "bio-y9-cells-002", q: "What is the jelly-like substance inside a cell where chemical reactions occur?", a: "Cytoplasm", explanation: "The cytoplasm is mostly water with dissolved nutrients, salts, and enzymes — the medium for most cellular reactions." },
      { id: "bio-y9-cells-003", q: "Which structure controls what enters and leaves a cell?", a: "The cell membrane", hint: "It's selectively permeable", explanation: "The cell membrane is partially permeable — it lets small molecules through but blocks large ones, controlling the cell's internal environment." },
      { id: "bio-y9-cells-004", q: "What structure do plant cells have that animal cells don't, that gives them rigidity?", a: "Cell wall", explanation: "Plant cell walls are made of cellulose, providing structural support and preventing the cell from bursting when full of water." },
      { id: "bio-y9-cells-005", q: "What green pigment in plants absorbs light for photosynthesis?", a: "Chlorophyll", hint: "It's what makes leaves green", explanation: "Chlorophyll is found in chloroplasts and absorbs mainly red and blue light, reflecting green — which is why plants look green." },
    ]
  },
  {
    id: "chem-y9-atoms",
    subject: "Chemistry",
    level: "Year 9",
    topic: "Atomic Structure",
    questions: [
      { id: "chem-y9-atoms-001", q: "What is the relative charge of a proton?", a: "Positive (+1)", explanation: "Protons have a +1 charge, electrons have −1, neutrons are neutral. A neutral atom has equal protons and electrons." },
      { id: "chem-y9-atoms-002", q: "Where in the atom are protons and neutrons found?", a: "The nucleus", hint: "The dense centre", explanation: "The nucleus is tiny but contains almost all the atom's mass. Electrons orbit in shells around it." },
      { id: "chem-y9-atoms-003", q: "What does the atomic number of an element tell you?", a: "The number of protons", explanation: "Atomic number defines the element — every carbon atom has 6 protons, every oxygen atom has 8. Change the protons, change the element." },
      { id: "chem-y9-atoms-004", q: "What is the maximum number of electrons in the first shell of an atom?", a: "Two", hint: "Think small numbers", explanation: "Shell capacities go 2, 8, 8 (then 18) for the early elements — the first shell is closest to the nucleus and fills first." },
      { id: "chem-y9-atoms-005", q: "What name is given to atoms of the same element with different numbers of neutrons?", a: "Isotopes", explanation: "Isotopes have the same atomic number but different mass numbers. Carbon-12 and carbon-14 are isotopes — same element, different neutrons." },
    ]
  },
  {
    id: "hist-y9-ww1",
    subject: "History",
    level: "Year 9",
    topic: "World War One",
    questions: [
      { id: "hist-y9-ww1-001", q: "In which year did World War One begin?", a: "1914", explanation: "Britain declared war on Germany on 4 August 1914, following Germany's invasion of neutral Belgium." },
      { id: "hist-y9-ww1-002", q: "What was the event in Sarajevo that triggered the war?", a: "The assassination of Archduke Franz Ferdinand", hint: "An assassination of an heir to a throne", explanation: "Franz Ferdinand, heir to the Austro-Hungarian throne, was shot on 28 June 1914. The system of alliances pulled Europe's powers into the conflict that followed." },
      { id: "hist-y9-ww1-003", q: "What was the name given to the area between opposing trenches?", a: "No man's land", explanation: "No man's land was the deadly strip between front-line trenches — typically scarred by shell craters, barbed wire, and bodies." },
      { id: "hist-y9-ww1-004", q: "Which 1916 battle on the Western Front lasted nearly five months?", a: "The Battle of the Somme", hint: "Named after a French river", explanation: "The Somme (July–November 1916) saw over a million casualties combined. The first day alone cost the British army around 57,000 men." },
      { id: "hist-y9-ww1-005", q: "In which month and year did WW1 end?", a: "November 1918", hint: "The 11th hour of the 11th day of the 11th month", explanation: "The Armistice was signed on 11 November 1918. Remembrance Day commemorates the moment fighting stopped at 11am." },
    ]
  },
];

// Subject visual identity — keeps the UI varied without random colour
const SUBJECT_STYLES = {
  Geography: { dot: 'bg-lime-400', text: 'text-lime-300', border: 'border-lime-700/60', bg: 'bg-lime-950/30' },
  Biology:   { dot: 'bg-teal-400', text: 'text-teal-300', border: 'border-teal-700/60', bg: 'bg-teal-950/30' },
  Chemistry: { dot: 'bg-violet-400', text: 'text-violet-300', border: 'border-violet-700/60', bg: 'bg-violet-950/30' },
  History:   { dot: 'bg-orange-400', text: 'text-orange-300', border: 'border-orange-700/60', bg: 'bg-orange-950/30' },
  Revision:  { dot: 'bg-amber-400', text: 'text-amber-300', border: 'border-amber-700/60', bg: 'bg-amber-950/30' },
};
const subjStyle = (s) => SUBJECT_STYLES[s] || SUBJECT_STYLES.Revision;

// Player identity — player 1 sky, player 2 rose
const PLAYER_STYLES = [
  { text: 'text-sky-300', ring: 'ring-sky-500/40', dot: 'bg-sky-400' },
  { text: 'text-rose-300', ring: 'ring-rose-500/40', dot: 'bg-rose-400' },
];

// ============================================================
// LOCAL STORAGE
// ============================================================
const STATS_KEY = 'gcse-challenge-stats-v2'; // per-player per-question { c, missed }
const NAMES_KEY = 'gcse-challenge-names-v1';
const GRADUATE_THRESHOLD = 2; // consecutive corrects to graduate from revision pool

const loadJSON = (key, fallback) => {
  try { return JSON.parse(localStorage.getItem(key)) ?? fallback; }
  catch { return fallback; }
};
const saveJSON = (key, value) => {
  try { localStorage.setItem(key, JSON.stringify(value)); } catch {}
};

const fmtSecs = (ms) => `${((ms ?? 0) / 1000).toFixed(2)}s`;

// ============================================================
// MAIN
// ============================================================
export default function GCSEChallenge() {
  const [phase, setPhase] = useState('setup'); // 'setup' | 'quiz' | 'results'

  // Persistent
  const [names, setNames] = useState(() => loadJSON(NAMES_KEY, ['Pete', 'Sam']));
  // stats[playerName][qId] = { c: consecutiveCorrect, missed: boolean }
  const [stats, setStats] = useState(() => loadJSON(STATS_KEY, {}));

  // Session
  const [scores, setScores] = useState([0, 0]);
  const [filterSubject, setFilterSubject] = useState('all');
  const [filterLevel, setFilterLevel] = useState('all');
  const [showQuestionToPlayers, setShowQuestionToPlayers] = useState(false);

  // Round
  const [currentTopic, setCurrentTopic] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [qIdx, setQIdx] = useState(0);
  const [roundResults, setRoundResults] = useState([]); // for end-of-round review

  // Per-question
  const [buzzed, setBuzzed] = useState(null);
  const [lockedOut, setLockedOut] = useState([false, false]);
  const [revealed, setRevealed] = useState(false);
  const [hintGiven, setHintGiven] = useState(false);
  const [questionStartTime, setQuestionStartTime] = useState(null);
  const [buzzTime, setBuzzTime] = useState(null);

  useEffect(() => saveJSON(NAMES_KEY, names), [names]);
  useEffect(() => saveJSON(STATS_KEY, stats), [stats]);

  // Derived
  const subjects = [...new Set(SAMPLE_TOPICS.map(t => t.subject))];
  const levels = [...new Set(SAMPLE_TOPICS.map(t => t.level))];
  const filteredTopics = SAMPLE_TOPICS.filter(t =>
    (filterSubject === 'all' || t.subject === filterSubject) &&
    (filterLevel === 'all' || t.level === filterLevel)
  );
  // Revision pool: union across players of questions they've missed and not yet graduated
  const wrongPool = [...new Set(
    names.flatMap(name =>
      Object.entries(stats[name] || {})
        .filter(([, s]) => s.missed && s.c < GRADUATE_THRESHOLD)
        .map(([qId]) => qId)
    )
  )];
  const wrongCountFor = (name) =>
    Object.values(stats[name] || {}).filter(s => s.missed && s.c < GRADUATE_THRESHOLD).length;

  const allLocked = lockedOut[0] && lockedOut[1];
  const currentQ = questions[qIdx];

  // Actions
  const recordPlayerStat = (playerName, qId, correct) => {
    setStats(s => {
      const ps = s[playerName] || {};
      const cur = ps[qId] || { c: 0, missed: false };
      return {
        ...s,
        [playerName]: {
          ...ps,
          [qId]: {
            c: correct ? cur.c + 1 : 0,
            missed: cur.missed || !correct,
          }
        }
      };
    });
  };

  const recordResult = (status, wonBy) => {
    setRoundResults(r => [...r, {
      qId: currentQ.id,
      q: currentQ.q,
      a: currentQ.a,
      explanation: currentQ.explanation,
      status,    // 'correct' | 'unanswered'
      wonBy,     // player name or null
    }]);
  };

  const resetForQuestion = () => {
    setBuzzed(null);
    setLockedOut([false, false]);
    setRevealed(false);
    setHintGiven(false);
    setBuzzTime(null);
    setQuestionStartTime(Date.now());
  };

  const startTopic = (topic) => {
    setCurrentTopic(topic);
    setQuestions(topic.questions);
    setQIdx(0);
    setRoundResults([]);
    setBuzzed(null);
    setLockedOut([false, false]);
    setRevealed(false);
    setHintGiven(false);
    setBuzzTime(null);
    setQuestionStartTime(Date.now());
    setPhase('quiz');
  };

  const startWrongAnswersRound = () => {
    const allQs = SAMPLE_TOPICS.flatMap(t => t.questions);
    const pool = wrongPool
      .map(id => allQs.find(q => q.id === id))
      .filter(Boolean)
      .sort(() => Math.random() - 0.5)
      .slice(0, 20);
    if (pool.length === 0) return;
    startTopic({
      subject: 'Revision',
      level: 'Mixed',
      topic: `Wrong Answers (${pool.length})`,
      questions: pool,
    });
  };

  const handleBuzz = (idx) => {
    if (revealed || buzzed !== null || lockedOut[idx]) return;
    setBuzzTime(questionStartTime !== null ? Date.now() - questionStartTime : 0);
    setBuzzed(idx);
  };

  const handleCorrect = () => {
    if (buzzed === null) return;
    const winner = names[buzzed];
    setScores(s => { const n = [...s]; n[buzzed]++; return n; });
    recordPlayerStat(winner, currentQ.id, true);
    recordResult('correct', winner);
    setRevealed(true);
  };

  const handleWrong = () => {
    if (buzzed === null) return;
    const loser = names[buzzed];
    recordPlayerStat(loser, currentQ.id, false);
    const newLocked = [...lockedOut];
    newLocked[buzzed] = true;
    setLockedOut(newLocked);
    setBuzzed(null);
    setBuzzTime(null);

    if (newLocked.every(x => x)) {
      // Both wrong: reveal and record
      recordResult('unanswered', null);
      setRevealed(true);
    } else {
      setQuestionStartTime(Date.now()); // restart timer for second-chance
    }
  };

  const handleSkip = () => {
    recordResult('unanswered', null);
    setRevealed(true);
  };

  const handleHint = () => setHintGiven(true);

  const handleNext = () => {
    if (qIdx + 1 >= questions.length) {
      setPhase('results');
      return;
    }
    setQIdx(qIdx + 1);
    resetForQuestion();
  };

  const handleBackToSetup = () => {
    setPhase('setup');
    resetForQuestion();
  };

  // ============================================================
  // RENDER
  // ============================================================
  return (
    <div
      className="min-h-screen text-slate-100"
      style={{
        fontFamily: 'ui-sans-serif, system-ui, -apple-system, "Segoe UI", sans-serif',
        background: 'radial-gradient(ellipse at top, #1e293b 0%, #020617 70%)',
      }}
    >
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&display=swap');
        .serif { font-family: 'Instrument Serif', Georgia, serif; }
      `}</style>

      <div className="max-w-3xl mx-auto px-4 py-6">

        {/* Header */}
        <header className="flex justify-between items-baseline pb-4 mb-6 border-b border-slate-800">
          <h1 className="serif text-3xl tracking-tight">
            GCSE <span className="text-amber-400">Challenge</span>
          </h1>
          {phase !== 'setup' && (
            <button onClick={handleBackToSetup} className="text-sm text-slate-400 hover:text-slate-100">
              ← New round
            </button>
          )}
        </header>

        {/* ============ SETUP ============ */}
        {phase === 'setup' && (
          <div className="space-y-6">

            {/* Players */}
            <section>
              <h2 className="text-sm text-slate-400 mb-2">Competitors</h2>
              <div className="grid grid-cols-2 gap-3">
                {[0, 1].map(i => (
                  <div key={i}>
                    <div className="flex items-center gap-2 mb-1">
                      <div className={`w-2 h-2 rounded-full ${PLAYER_STYLES[i].dot}`} />
                      <span className={`text-xs ${PLAYER_STYLES[i].text}`}>Player {i + 1}</span>
                    </div>
                    <input
                      type="text"
                      value={names[i]}
                      onChange={e => { const n = [...names]; n[i] = e.target.value; setNames(n); }}
                      className="w-full px-3 py-2 rounded bg-slate-900/80 border border-slate-700 focus:border-slate-500 focus:outline-none"
                      maxLength={20}
                    />
                    <div className="text-xs text-slate-500 mt-1">
                      Score {scores[i]} · {wrongCountFor(names[i])} to revise
                    </div>
                  </div>
                ))}
              </div>
              <div className="flex gap-4 mt-3 text-xs text-slate-500">
                <button onClick={() => setScores([0, 0])} className="hover:text-slate-200">Reset scores</button>
                <button
                  onClick={() => { if (confirm('Clear all stored revision data?')) setStats({}); }}
                  className="hover:text-slate-200"
                >
                  Clear revision data
                </button>
              </div>
            </section>

            {/* Wrong-answers revision round */}
            {wrongPool.length > 0 && (
              <button
                onClick={startWrongAnswersRound}
                className="w-full text-left p-4 rounded-lg border border-amber-700/60 bg-amber-950/30 hover:bg-amber-950/50 transition"
              >
                <div className="flex items-center gap-2 text-xs text-amber-300 mb-1">
                  <div className="w-2 h-2 rounded-full bg-amber-400" />
                  Revision · Spaced repetition
                </div>
                <div className="serif text-xl">Wrong Answers ({wrongPool.length})</div>
                <div className="text-xs text-slate-400 mt-1">
                  Up to 20 from both players' missed questions, shuffled. Each graduates after {GRADUATE_THRESHOLD} consecutive corrects.
                </div>
              </button>
            )}

            {/* Topic picker */}
            <section>
              <h2 className="text-sm text-slate-400 mb-2">Topics</h2>
              <div className="flex flex-wrap gap-3 mb-3 text-sm">
                <label className="flex items-center gap-2">
                  <span className="text-slate-500">Subject</span>
                  <select
                    value={filterSubject}
                    onChange={e => setFilterSubject(e.target.value)}
                    className="bg-slate-900 border border-slate-700 rounded px-2 py-1"
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
                    className="bg-slate-900 border border-slate-700 rounded px-2 py-1"
                  >
                    <option value="all">All</option>
                    {levels.map(l => <option key={l} value={l}>{l}</option>)}
                  </select>
                </label>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {filteredTopics.map(t => {
                  const s = subjStyle(t.subject);
                  return (
                    <button
                      key={t.id}
                      onClick={() => startTopic(t)}
                      className={`text-left p-3 rounded-lg border ${s.border} ${s.bg} hover:brightness-125 transition`}
                    >
                      <div className="flex items-center gap-2 text-xs mb-1">
                        <div className={`w-2 h-2 rounded-full ${s.dot}`} />
                        <span className={s.text}>{t.subject} · {t.level}</span>
                      </div>
                      <div className="serif text-lg">{t.topic}</div>
                      <div className="text-xs text-slate-400 mt-1">{t.questions.length} questions</div>
                    </button>
                  );
                })}
                {filteredTopics.length === 0 && (
                  <div className="text-sm text-slate-500 col-span-full">No topics match these filters.</div>
                )}
              </div>
            </section>
          </div>
        )}

        {/* ============ QUIZ ============ */}
        {phase === 'quiz' && currentQ && (
          <div className="space-y-4">

            {/* QM Panel */}
            <section className={`p-4 rounded-lg border ${subjStyle(currentTopic.subject).border} bg-slate-900/60`}>
              <div className="flex justify-between items-center text-xs mb-3">
                <div className="flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full ${subjStyle(currentTopic.subject).dot}`} />
                  <span className={subjStyle(currentTopic.subject).text}>
                    {currentTopic.subject} · {currentTopic.topic}
                  </span>
                </div>
                <div className="text-slate-400">Question {qIdx + 1} of {questions.length}</div>
              </div>

              <label className="flex items-center gap-2 text-sm text-slate-400 mb-3 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={showQuestionToPlayers}
                  onChange={e => setShowQuestionToPlayers(e.target.checked)}
                  className="accent-amber-500"
                />
                Show question on players' devices
              </label>

              <div className="serif text-2xl leading-snug mb-3">{currentQ.q}</div>

              {/* Hint (shown after QM clicks Give hint) */}
              {hintGiven && currentQ.hint && (
                <div className="p-3 rounded mb-3 border-l-2 border-sky-500 bg-sky-950/30">
                  <div className="text-xs text-sky-300 mb-1">Hint</div>
                  <div className="serif text-base italic">{currentQ.hint}</div>
                </div>
              )}

              {/* Answer (QM only, always visible) */}
              <div className="p-3 rounded mb-3 border-l-2 border-amber-500 bg-amber-950/20">
                <div className="text-xs text-amber-300 mb-1">
                  Answer {revealed ? '· revealed' : '· QM only'}
                </div>
                <div>{currentQ.a}</div>
                {revealed && currentQ.explanation && (
                  <div className="text-sm text-slate-300 mt-2 leading-relaxed">{currentQ.explanation}</div>
                )}
              </div>

              {/* Status */}
              <div className="text-sm text-slate-300 mb-3">
                {revealed
                  ? 'Question complete — click Next.'
                  : buzzed !== null
                    ? <>
                        <span className={PLAYER_STYLES[buzzed].text}>{names[buzzed]}</span> buzzed in{' '}
                        <span className="tabular-nums text-amber-300">{fmtSecs(buzzTime)}</span>{' '}
                        — awaiting answer.
                      </>
                    : allLocked
                      ? 'Both players locked out.'
                      : 'Awaiting buzz...'}
              </div>

              {/* QM Controls */}
              <div className="flex gap-2 flex-wrap">
                {buzzed !== null && !revealed && (
                  <>
                    <button onClick={handleCorrect} className="px-4 py-2 rounded bg-emerald-600 hover:bg-emerald-500 text-white font-medium">
                      Right
                    </button>
                    <button onClick={handleWrong} className="px-4 py-2 rounded bg-rose-600 hover:bg-rose-500 text-white font-medium">
                      Wrong
                    </button>
                  </>
                )}
                {!revealed && currentQ.hint && !hintGiven && (
                  <button onClick={handleHint} className="px-4 py-2 rounded border border-sky-700/60 bg-sky-950/30 text-sky-300 hover:bg-sky-950/50">
                    Give hint
                  </button>
                )}
                {!revealed && (
                  <button onClick={handleSkip} className="px-4 py-2 rounded border border-slate-700 text-slate-300 hover:bg-slate-800">
                    Skip
                  </button>
                )}
                {(revealed || allLocked) && (
                  <button onClick={handleNext} className="px-4 py-2 rounded bg-amber-500 hover:bg-amber-400 text-slate-950 font-medium ml-auto">
                    {qIdx + 1 >= questions.length ? 'Finish round' : 'Next →'}
                  </button>
                )}
              </div>
            </section>

            {/* Player Panels */}
            <section className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {[0, 1].map(i => (
                <PlayerPanel
                  key={i}
                  player={PLAYER_STYLES[i]}
                  name={names[i]}
                  score={scores[i]}
                  isBuzzed={buzzed === i}
                  isLockedOut={lockedOut[i]}
                  buzzerDisabled={revealed || buzzed !== null || lockedOut[i]}
                  onBuzz={() => handleBuzz(i)}
                  buzzedByName={buzzed !== null ? names[buzzed] : null}
                  buzzedByPlayer={buzzed !== null ? PLAYER_STYLES[buzzed] : null}
                  buzzTimeMs={buzzed !== null ? buzzTime : null}
                  visibleQuestion={(showQuestionToPlayers || revealed) ? currentQ.q : null}
                  visibleAnswer={revealed ? currentQ.a : null}
                  visibleExplanation={revealed ? currentQ.explanation : null}
                  visibleHint={hintGiven ? currentQ.hint : null}
                />
              ))}
            </section>

            <p className="text-xs text-slate-500 text-center">
              Prototype: all three roles on one screen. In production, each phone shows only its own view.
            </p>
          </div>
        )}

        {/* ============ RESULTS + REVIEW (combined) ============ */}
        {phase === 'results' && (
          <div className="space-y-6">
            <div className="text-center py-6 space-y-3">
              <div className="text-sm text-slate-400">Round complete</div>
              <h2 className="serif text-5xl">
                {scores[0] === scores[1]
                  ? 'A draw'
                  : <>
                      <span className={PLAYER_STYLES[scores[0] > scores[1] ? 0 : 1].text}>
                        {names[scores[0] > scores[1] ? 0 : 1]}
                      </span>
                      {' '}wins
                    </>}
              </h2>
              <div className="flex justify-center gap-10 pt-2">
                {[0, 1].map(i => (
                  <div key={i}>
                    <div className={`text-sm ${PLAYER_STYLES[i].text}`}>{names[i]}</div>
                    <div className="serif text-4xl tabular-nums">{scores[i]}</div>
                  </div>
                ))}
              </div>
              <button
                onClick={handleBackToSetup}
                className="mt-4 px-5 py-2 rounded bg-amber-500 hover:bg-amber-400 text-slate-950 font-medium"
              >
                Next round →
              </button>
            </div>

            {/* Review */}
            <section className="border-t border-slate-800 pt-6">
              <h3 className="text-sm text-slate-400 mb-3">Review · {roundResults.length} questions</h3>
              <div className="space-y-3">
                {roundResults.map((r, idx) => {
                  const correct = r.status === 'correct';
                  return (
                    <div
                      key={idx}
                      className={`p-3 rounded-lg border ${correct ? 'border-emerald-800/60 bg-emerald-950/15' : 'border-rose-800/60 bg-rose-950/15'}`}
                    >
                      <div className="flex items-baseline justify-between gap-3 mb-2">
                        <div className="serif text-base flex-1">{r.q}</div>
                        <div className={`text-xs ${correct ? 'text-emerald-300' : 'text-rose-300'} whitespace-nowrap`}>
                          {correct ? `✓ ${r.wonBy}` : '✗ missed'}
                        </div>
                      </div>
                      <div className="text-sm text-amber-300">{r.a}</div>
                      {r.explanation && (
                        <div className="text-sm text-slate-300 mt-2 leading-relaxed">{r.explanation}</div>
                      )}
                    </div>
                  );
                })}
              </div>
            </section>
          </div>
        )}
      </div>
    </div>
  );
}

// ============================================================
// PLAYER PANEL
// ============================================================
function PlayerPanel({
  player, name, score, isBuzzed, isLockedOut, buzzerDisabled, onBuzz,
  buzzedByName, buzzedByPlayer, buzzTimeMs,
  visibleQuestion, visibleAnswer, visibleExplanation, visibleHint,
}) {
  let buzzerLabel = 'BUZZ';
  let buzzerClass = 'bg-amber-500 hover:bg-amber-400 text-slate-950';
  let buzzerHelp = 'Tap to answer';

  if (isBuzzed) {
    buzzerLabel = 'BUZZED';
    buzzerHelp = 'Answer the question';
  } else if (isLockedOut) {
    buzzerClass = 'bg-slate-800 text-slate-500 cursor-not-allowed';
    buzzerLabel = 'LOCKED';
    buzzerHelp = 'Wrong — wait for next';
  } else if (buzzerDisabled) {
    buzzerClass = 'bg-slate-800 text-slate-500 cursor-not-allowed';
    buzzerHelp = '';
  }

  return (
    <div className={`p-3 rounded-lg border bg-slate-900/60 ${isBuzzed ? 'border-amber-500 ring-2 ring-amber-500/30' : 'border-slate-800'}`}>
      <div className="flex justify-between items-center mb-3">
        <div className="flex items-center gap-2">
          <div className={`w-2 h-2 rounded-full ${player.dot}`} />
          <span className={`text-sm ${player.text}`}>{name}</span>
        </div>
        <div className="serif text-xl tabular-nums">{score}</div>
      </div>

      <button
        onClick={onBuzz}
        disabled={buzzerDisabled}
        className={`w-full py-6 rounded-md text-xl tracking-wider font-medium transition ${buzzerClass}`}
      >
        {buzzerLabel}
      </button>
      <div className="text-xs text-slate-500 mt-1 text-center min-h-[1em]">{buzzerHelp}</div>

      {/* Shared buzz status */}
      {buzzedByName && buzzTimeMs !== null && (
        <div className="mt-3 p-2 rounded bg-slate-800/80 text-sm text-center">
          <span className={buzzedByPlayer.text}>{buzzedByName}</span>{' '}
          buzzed in{' '}
          <span className="tabular-nums text-amber-300">{fmtSecs(buzzTimeMs)}</span>
        </div>
      )}

      {/* Hint visible to players when given */}
      {visibleHint && (
        <div className="mt-3 p-2 rounded border border-sky-700/60 bg-sky-950/30 text-sm">
          <div className="text-xs text-sky-300 mb-1">Hint</div>
          <div className="serif italic">{visibleHint}</div>
        </div>
      )}

      {/* Question + reveal */}
      {visibleQuestion && (
        <div className="mt-3 p-2 rounded bg-slate-800/80 text-sm">
          <div className="serif">{visibleQuestion}</div>
          {visibleAnswer && (
            <div className="text-amber-300 mt-2">{visibleAnswer}</div>
          )}
          {visibleExplanation && (
            <div className="text-slate-300 mt-2 leading-relaxed">{visibleExplanation}</div>
          )}
        </div>
      )}
    </div>
  );
}
