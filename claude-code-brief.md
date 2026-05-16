# GCSE Challenge — Claude Code Handoff Brief

A multi-device quiz buzzer web app for GCSE revision. One Quiz Master (QM) phone, two player phones, all synchronised live. Inspired by University Challenge.

A working single-device prototype already exists as a React JSX file (from chat). The job now is to turn it into a real deployable project with multi-device sync via Firebase, a proper topic-folder structure, and Vercel deployment.

---

## Tech stack

- **Vite + React** (the prototype is already in React)
- **Tailwind CSS** for styling (Tailwind v3 or v4, your call — v3 is simpler)
- **Firebase Realtime Database** for live multi-device state sync and aggregate question stats
- **localStorage** for per-player persistent revision data (privacy-friendly — never leaves the device)
- **Vercel** for deployment (free, auto-deploys on git push)

---

## Architecture summary

Three storage layers, each doing one job:

1. **localStorage on each player's phone** — that player's per-question stats: consecutive correct count, "ever missed" flag. Privacy-preserving, never sent to a server. The basis of spaced repetition.
2. **Firebase `/sessions/{sessionId}`** — ephemeral live game state: phase, current question index, who's buzzed, who's locked out, scores, players in room. Disappears when session ends. This is what makes the buzzers work across phones.
3. **Firebase `/questionStats/{qId}`** — anonymous aggregate `{correct, wrong}` counts per question across all games and players. No names attached. Powers a future "commonly missed across all kids" revision mode. Auto-purge entries where `correct > 10 × wrong`.

**Buzz fairness:** all buzz events write to `/sessions/{sessionId}/buzzed` in Firebase. First write wins; subsequent writes are ignored because the field is no longer null. Server arrival order is the fairness arbiter — same uplink (QM's hotspot) means equal latency for all phones.

---

## Project structure

```
gcse-challenge/
├── public/
│   └── topics/                       # JSON files — one per topic
│       ├── geography-y9-rivers.json
│       ├── biology-y9-cells.json
│       ├── chemistry-y9-atoms.json
│       ├── history-y9-ww1.json
│       └── manifest.json             # auto-generated, lists all topics
├── scripts/
│   └── generate-manifest.js          # scans /public/topics/ and builds manifest.json
├── src/
│   ├── App.jsx                       # main component, routes between phases
│   ├── PlayerPanel.jsx               # one player's buzzer + status
│   ├── SetupScreen.jsx               # name entry, topic picker, room create/join
│   ├── QuizScreen.jsx                # active quiz UI
│   ├── ResultsScreen.jsx             # winner + end-of-round review
│   ├── firebase.js                   # Firebase init + session/stats helpers
│   ├── topicLoader.js                # loads topics from public/topics/ via manifest
│   ├── stats.js                      # localStorage stats (spaced repetition)
│   ├── styles.js                     # SUBJECT_STYLES, PLAYER_STYLES constants
│   ├── main.jsx                      # entry point
│   └── index.css                     # tailwind directives + Instrument Serif import
├── .env.local                        # Firebase config — gitignored
├── .env.example                      # template showing required env vars
├── .gitignore
├── package.json
├── vite.config.js
├── tailwind.config.js
└── README.md
```

Splitting `App.jsx` into `SetupScreen` / `QuizScreen` / `ResultsScreen` keeps each file under ~200 lines and easier to follow. The prototype kept everything in one file for speed; for a real project, splitting is worth it.

---

## Prerequisites (do these before opening Claude Code)

### 1. Firebase Console setup
1. Create a project at https://console.firebase.google.com — call it `gcse-challenge`
2. Decline Google Analytics
3. Left sidebar → Build → Realtime Database → Create Database
4. Location: `europe-west1` (closest to UK)
5. Start in **test mode** (30 days of open access — easy to extend later)
6. Project Settings (gear icon) → Your apps → click `</>` → register web app called `gcse-challenge-web`. **Don't** tick Firebase Hosting.
7. Copy the `firebaseConfig` object that's displayed — save it for the `.env.local` step below

### 2. Security rules (Realtime Database → Rules tab)

Paste this in:

```json
{
  "rules": {
    "sessions": {
      "$sessionId": {
        ".read": true,
        ".write": true,
        ".validate": "$sessionId.matches(/^[A-Z0-9]{4,8}$/)"
      }
    },
    "questionStats": {
      ".read": true,
      "$qId": {
        ".write": true,
        ".validate": "newData.hasChildren(['correct', 'wrong'])"
      }
    }
  }
}
```

### 3. GitHub repo
Create a new private repo called `gcse-challenge`. Don't initialise with anything — Claude Code will set it up.

### 4. Have your Firebase config handy
You'll paste the values into `.env.local`. They look like:
```
VITE_FIREBASE_API_KEY=AIza...
VITE_FIREBASE_AUTH_DOMAIN=gcse-challenge.firebaseapp.com
VITE_FIREBASE_DATABASE_URL=https://gcse-challenge-default-rtdb.europe-west1.firebasedatabase.app
VITE_FIREBASE_PROJECT_ID=gcse-challenge
VITE_FIREBASE_STORAGE_BUCKET=gcse-challenge.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=...
VITE_FIREBASE_APP_ID=1:...
```
(The `VITE_` prefix is required for Vite to expose these to the browser.)

---

## Step-by-step prompts for Claude Code

Paste each one when ready for that step. Wait for it to finish before moving on.

### Step 1 — Scaffold the project

> Set up a new Vite + React project in this directory called `gcse-challenge`. Use the React template (not TypeScript). Install Tailwind CSS v3 with PostCSS, and install the `firebase` package. Configure Tailwind to scan `./index.html` and `./src/**/*.{js,jsx}`. Add the Tailwind directives to `src/index.css` and the Instrument Serif Google Font import. Show me the final `package.json`, `tailwind.config.js`, and `src/index.css`.

### Step 2 — Drop in the prototype

Upload `gcse-challenge-prototype.jsx` to the project directory, then:

> I've added a single-file React prototype called `gcse-challenge-prototype.jsx`. Split it into the project structure described in the handoff brief: `src/App.jsx`, `src/PlayerPanel.jsx`, `src/SetupScreen.jsx`, `src/QuizScreen.jsx`, `src/ResultsScreen.jsx`, `src/stats.js` (localStorage helpers and spaced repetition logic), and `src/styles.js` (SUBJECT_STYLES, PLAYER_STYLES, fmtSecs). Keep all current functionality identical. Update `src/main.jsx` to mount `App`. Then run `npm run dev` and confirm it works.

### Step 3 — Topic files in /public/topics/

> Extract the four topics from the `SAMPLE_TOPICS` constant in `App.jsx` (or wherever it now lives) into individual JSON files in `public/topics/`: `geography-y9-rivers.json`, `biology-y9-cells.json`, `chemistry-y9-atoms.json`, `history-y9-ww1.json`. Each file should contain a single topic object with the same structure as the prototype. Then write `scripts/generate-manifest.js` that scans `public/topics/`, reads each JSON file's metadata (subject, level, topic, question count) plus the filename, and writes `public/topics/manifest.json`. Add an npm script `"build:topics"` that runs it, and call it automatically before `dev` and `build` via a `"predev"` and `"prebuild"` hook. Then write `src/topicLoader.js` that fetches `/topics/manifest.json` at app start, and provides a function to load a full topic on demand. Update `App.jsx` to use this instead of the hardcoded `SAMPLE_TOPICS`. Verify the app still works.

### Step 4 — Hint and explanation fields

The prototype already has these. They should have carried over. Verify in Step 3.

### Step 5 — Firebase Realtime Database integration

> Add Firebase Realtime Database integration. Create `src/firebase.js` that:
> 1. Reads the Firebase config from `import.meta.env.VITE_FIREBASE_*` variables
> 2. Initialises the app and a Realtime Database connection
> 3. Exports helper functions: `createSession(sessionId)`, `joinSession(sessionId, playerName)`, `subscribeToSession(sessionId, callback)`, `updateSessionField(sessionId, field, value)`, `incrementQuestionStat(qId, kind)` where `kind` is `'correct'` or `'wrong'`.
> 
> Also create `.env.example` with the seven required `VITE_FIREBASE_*` variables empty, and add `.env.local` to `.gitignore`. I'll create `.env.local` myself with my Firebase config.

### Step 6 — Session create/join flow

> Add a session model on top of the existing app:
> - On launch, if no session, show a "Create" / "Join" choice
> - Create flow: user (QM) picks a 4-character code (or auto-generate one) and becomes the QM. Their phone owns the QM controls.
> - Join flow: user enters the 4-character code and a name. They appear as a player in the session.
> - All quiz state (current question, buzzed player, scores, lockout, revealed, etc.) lives in `/sessions/{sessionId}` in Firebase and is subscribed to by all connected clients.
> - The buzzer is now write-to-Firebase: pressing buzz attempts to write your name into `/sessions/{sessionId}/buzzedBy` only if it's currently null. Use a Firebase transaction so the first writer wins.
> - QM controls (Right/Wrong/Skip/Next/Hint/show-question toggle) all write to the session state.
> - Each client computes their own view: QM sees QM controls, players see their buzzer + name + score + (optionally) the question.
> 
> Keep the existing localStorage stats logic working — that still runs locally on each player's device.

### Step 7 — Aggregate question stats

> Wire up the anonymous question stats. After every Right click in the QM controls, call `incrementQuestionStat(qId, 'correct')`. After every Wrong click, call `incrementQuestionStat(qId, 'wrong')`. These are anonymous — no player names attached. Use Firebase transactions to safely increment.

### Step 8 — Deploy to Vercel

> Create a `README.md` with setup instructions and the deployment process. Then guide me through: pushing to a new GitHub repo, connecting it to Vercel, and adding the seven `VITE_FIREBASE_*` environment variables in Vercel's project settings. The app should auto-deploy on git push.

### Step 9 — Test with three real devices

Once deployed:
1. QM creates a hotspot on their phone, both players connect to it
2. All three phones open the live URL
3. QM creates session, gets code
4. Both players join via code, enter names
5. Play through a round

---

## Topic file format reference

```json
{
  "subject": "Geography",
  "level": "Year 9",
  "topic": "Rivers and Coasts",
  "questions": [
    {
      "id": "geo-y9-rivers-001",
      "q": "What term describes a bend or curve in a river's course?",
      "a": "A meander",
      "hint": "Starts with M — a winding shape",
      "explanation": "Meanders form on the lower course of a river where lateral erosion is greater than vertical erosion."
    }
  ]
}
```

**Required:** `id`, `q`, `a`. **Optional:** `hint`, `explanation`.

**ID convention:** `{subject-short}-{level}-{topic-short}-{three-digit-number}` (e.g. `bio-y9-cells-001`). Must be stable across edits — the ID is what gets stored in player revision lists, so renaming breaks references.

---

## Firebase data model reference

```
/sessions/{sessionId}                  // 4-char alphanumeric, uppercase
  qmId: string                         // device ID of the QM
  players: {
    [playerName]: {
      score: number
      joinedAt: number (timestamp)
    }
  }
  phase: 'lobby' | 'quiz' | 'results'
  currentTopicId: string | null
  currentQuestion: {                    // pushed by QM at each Next
    id, q, a, hint, explanation
  } | null
  questionStartTime: number (timestamp)
  qIdx: number
  totalQuestions: number
  buzzedBy: string | null               // playerName who buzzed first
  buzzTime: number | null               // ms taken
  lockedOut: { [playerName]: true }     // resets per question
  revealed: boolean
  hintGiven: boolean
  showQuestionToPlayers: boolean
  roundResults: [...]                   // for end-of-round review

/questionStats/{qId}
  correct: number
  wrong: number
```

---

## Spaced repetition model (already in prototype, lives in `stats.js`)

```js
// localStorage shape: { [playerName]: { [qId]: { c: 0, missed: false } } }
// c = consecutive correct count (resets on any wrong)
// missed = ever-wrong flag (sticky until graduation)
// Question is in revision pool if: missed && c < GRADUATE_THRESHOLD
// GRADUATE_THRESHOLD = 2 by default
```

---

## Done-when checklist

- [ ] Three phones can join one session and play a round end-to-end
- [ ] Buzzer is genuinely race-fair (test by pressing simultaneously many times)
- [ ] Wrong answers persist on each player's phone across page refreshes
- [ ] Revision rounds pull from the per-player wrong list
- [ ] Questions graduate after 2 consecutive corrects
- [ ] Adding a new topic file in `public/topics/` and rerunning `npm run dev` makes it appear in the picker
- [ ] Deployed to Vercel and accessible by URL
- [ ] Works on iOS Safari and Chrome on Android

---

## Notes on potential gotchas

- **iOS Safari and Firebase WebSockets:** generally fine but can disconnect when the tab is backgrounded. Make sure reconnection is automatic — Firebase SDK handles this, but verify.
- **Race conditions on buzz:** use a Firebase transaction (`runTransaction`) on `buzzedBy` rather than a plain `set`. This is what guarantees the first writer wins atomically.
- **Tailwind v4** (if you go that route) has a different config approach — easier setup, no `tailwind.config.js`. Either version is fine; v3 is more documented if you're learning.
- **Environment variables:** Vite only exposes vars prefixed with `VITE_`. Don't forget the prefix or the app will silently fail to connect to Firebase.
- **30-day rule expiry:** Firebase test-mode rules expire after 30 days. The custom rules above don't have that limitation, so paste them in early.
