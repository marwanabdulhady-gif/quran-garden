# Plan — مغامرة الحروف (Huroof Play)

Working branch: `arena/d1d6ab89-quran-garden` (session-bound). One pull request tracks all phases; each phase is one or more commits, and its quality gate must be green before the phase is ticked.

| Phase | Scope | Quality gate | Status |
| --- | --- | --- | --- |
| **0 — Audit** | Check the source site, feature inventory, findings, decisions (`docs/AUDIT.md`) | Findings evidenced; limits stated | ✅ |
| **1 — Game core** | Vite/React app, 7 levels × 4 letter–animal pairs, drag + tap placement, stars, feedback, keyboard support | lint, format, unit tests, SSR smoke, build, Chromium E2E | ✅ |
| **2 — Media** | Generated illustrations (28 animals, scenes, mascot, icons), voice clips (Arabic narration), Web Speech for names | Image/audio inventory check, size budget (< 3 MB precache), visual review | 🔄 partial: narration 8/8 ✅, illustrations 10/28, icons & scene ⬜ |
| **3 — Progress & voice check** | Player profiles (nickname), per-level progress, teacher/parent panel, JSON/CSV export, reset, optional spoken-name check (SpeechRecognition) | Unit tests for storage + export + migration; e2e: play → progress → export | ⬜ |
| **4 — Deploy & PWA** | Offline PWA, install prompt, Vercel/Netlify configs, CI workflow for this app, `robots.txt`, security headers | `npm run build` artefacts, `dist` served and checked in headless browser, CI green | ⬜ |
| **5 — Documentation & release** | README (AR + EN), DEPLOY, PRIVACY, CONTENT, MEDIA (licences & prompts), QA report, CHANGELOG | Docs link-check and command check (every documented command executed) | ⬜ |

## Phase details

### 1 — Game core
- Levels: 7, each four pairs; all 28 Arabic letters are covered once (see `docs/CONTENT.md`).
- Round: a letter card is shown; the child drags/taps it onto the animal whose name starts with it.
- Correct: star +1, success sound, animal "celebrates". Wrong: gentle shake and a retry; after two misses the correct target pulses (never a penalty).
- Level complete: stars summary + next level unlocked (levels 1→7 unlocked in order).
- Keyboard: Tab to a letter, Enter/Space to pick it, Tab to an animal, Enter/Space to place it.

### 2 — Media
- Illustrations generated per animal (transparent-background PNG, 384 px), one scene background, one mascot, PWA icons (192/512/maskable).
- Voice: one narrator voice generated with `add_voice` / `generate_speech` for instructions and feedback phrases (≤ 10 clips/turn). Animal and letter names are spoken with the browser's `speechSynthesis` (ar) when available; the UI always shows the text.

### 3 — Progress & voice check
- Nickname only (max 20 chars); no birthdate, no photo, no email.
- Progress per player: stars, completed levels, attempts, correct-first-try rate, last played date.
- Teacher/parent panel: summary table + export as JSON or CSV, delete a single player or reset all.
- Schema versioned (`SCHEMA_VERSION` + migrations), corrupt data falls back safely.

### 4 — Deploy & PWA
- `vite-plugin-pwa` (autoUpdate), precache app shell + audio + images.
- `vercel.json` (Root Directory = `huroof-play`), `netlify.toml`, `public/_headers` for security headers.
- CI: `.github/workflows/huroof-play-ci.yml` runs lint → format → tests → smoke → build → e2e.

### 5 — Documentation & release
- Every shell command written in the docs is executed once during QA.
- Final PR description lists all phases, QA evidence and known limits.
