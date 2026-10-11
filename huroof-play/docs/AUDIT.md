# Audit — مغامرة الحروف (Huroof Play)

> **Source audited:** https://huroofplay-fpb3vc4z.manus.space/ (title: «مغامرة الحروف | حروف الحيوانات»)
> **Audit date:** 2026-10-10 · **Auditor:** Arena agent · **Status:** Phase 0 complete

## 1. How this audit was done (and its limits)

| Method | Result |
| --- | --- |
| Rendered page text via `fetch_page` | ✅ Full text of the landing screen retrieved (single chunk). |
| Headless Chromium from the build sandbox | ❌ `ERR_CONNECTION_CLOSED` — the sandbox cannot reach the host, so **no screenshot, no source, no network trace** of the original was possible. |
| `robots.txt` | 404 (no crawler directives, no sitemap). |
| Source code / repository | ❌ Not public. The original is a hosted build ("Made with Manus"). |

**Consequence:** the rebuild in `huroof-play/` is a *functional re-implementation* based on the visible text and elements (title, tagline, drag-and-drop instruction, 7 levels, voice interaction, name entry, progress for teacher/parent, letters أ ب ت, animals 🦁 🦆 🦊, waving hand, sun and clouds). Pixel-level parity could not be verified and is not claimed.

## 2. Feature inventory (as observed)

| # | Observed on the page | Rebuild |
| --- | --- | --- |
| F-1 | Arabic, RTL, children's audience ("لعبة عربية للأطفال") | ✅ `dir="rtl"`, `lang="ar"`, Arabic UI and copy |
| F-2 | Core mechanic: drag a letter onto the animal that starts with it | ✅ Pointer drag **and** tap-to-select-then-tap-to-place |
| F-3 | "٧ مستويات" — 7 levels | ✅ 7 levels × 4 letter–animal pairs = all 28 Arabic letters |
| F-4 | "تفاعل صوتي" — voice interaction | ✅ Letter/animal names read aloud + voice-clip feedback; optional spoken check with the Web Speech API |
| F-5 | Player name prompt "ما اسم البطل أو البطلة؟" and «هيا نلعب» | ✅ Name entry on first launch, multiple players supported |
| F-6 | Saves name + results "ليظهر التقدم للمعلم أو ولي الأمر" | ✅ Local-only progress; teacher/parent panel; JSON/CSV export; reset |
| F-7 | Stars, sun/clouds scene, cheerful landing | ✅ Stars per correct answer, scene with generated art |
| F-8 | Disclaimer: "AI-generated content — verify carefully and submit no personal information" | ✅ Content is verified by an automated test (every animal name starts with its letter); no personal data leaves the device |

## 3. Findings

Severity: **H** = affects children's privacy / correctness, **M** = usability or quality, **L** = polish.

| ID | Sev | Finding | Evidence | Resolution in rebuild |
| --- | --- | --- | --- | --- |
| A-1 | **H** | The page collects a child's name and "saves results" but does not say **where** data is stored, for how long, or who can delete it. The page's own footer tells users to "submit no personal information". These two statements conflict. | Landing text, footer disclaimer | Store only a nickname on-device (`localStorage`), no accounts, no network calls carrying the name, a clear privacy notice in-app and in `docs/PRIVACY.md`, parent-controlled **reset/delete** and **export**. |
| A-2 | **H** | Content is explicitly "AI-generated (possibly user-edited) — please verify carefully". Letter/animal pairs are a correctness risk for an educational product. | Footer disclaimer | Single source of truth `src/data/levels.js`; a test fails the build if any animal's name does not start with its letter; a content table in `docs/CONTENT.md` with the Arabic spelling used. |
| A-3 | **M** | Drag-and-drop is pointer-driven. Children with motor difficulties, keyboard users and some touch devices need an alternative. | Mechanic described as «اسحب الحرف» only | Tap-to-select then tap-to-place, keyboard support (Enter/Space), `aria-live` feedback, large touch targets (≥ 48px). |
| A-4 | **M** | No evidence of offline support. A kids' app used in classrooms with flaky connectivity should work offline. | Not observable | PWA with precached shell, installable, works offline after first load. |
| A-5 | **M** | The "Made with Manus" hosting badge and third-party report link are shown to children's users; the operator cannot control hosting or the badge. | Footer | The rebuild is a self-hostable static app (Vercel / Netlify / any static host); see `docs/DEPLOY.md`. |
| A-6 | **L** | No `robots.txt` / sitemap, and no visible favicon/manifest data in the audited text. | 404 on `/robots.txt` | Added `public/robots.txt`, web manifest, icons. |
| A-7 | **L** | The first screen does not state a reading/age range or what a "level" is. | Landing text | Each level has a short Arabic title and a «هدف المستوى» line; age guidance in README (4–7 years). |

## 4. Decisions

- **Stack:** React 18 + Vite 5 + `vite-plugin-pwa`, mirroring the sibling project `quran-garden` so the same CI and tooling conventions apply.
- **Location:** `huroof-play/` inside this repository (the session is bound to one branch, so changes ship as commits on it; see PLAN.md).
- **No third-party data APIs** are needed for the core game. Media is generated for the project (illustrations, voice clips). Browser APIs are used for speech (`speechSynthesis`, `SpeechRecognition` when available), vibration and storage. Optional external APIs are listed in `docs/MEDIA.md` with their licences, but none is required.
- **Privacy by design:** no analytics, no third-party scripts, no fonts from CDNs, no personal data sent anywhere.

## 5. Quality gates (applied at every phase)

1. `npm run lint` — 0 errors.
2. `npm run format:check` — clean.
3. `npm test` — unit tests for content integrity, game logic, storage/migration, progress export.
4. `npm run test:smoke` — SSR render of every screen.
5. `npm run build` — production build + PWA manifest/service worker emitted.
6. `npm run e2e` — headless-Chromium walkthrough (screenshots saved to `docs/qa/`), run at phase ends.
7. Visual review of the screenshots (RTL layout, text overflow, touch sizes) before a phase is marked done.
