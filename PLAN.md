# خطة تحسين حديقة القرآن — Improvement Plan

> Current state: full feature parity with the original (home, garden, bridge, words, journey map, gates + player, daily, settings, family link), 24/24 logic tests, 10/10 screen renders, clean prod build.
> Plan ordered by priority: **P0 = defects (data safety), P1 = memorization value + offline, P2 = UX polish, P3 = engineering hardening, P4 = stretch**.

---

## P0 — Data integrity & safety ✅ DONE

> All five items implemented & tested (34/34 in `tests/store.test.mjs`, `npm test`).


### 1. Family link blows up with photos 🔴
- **Problem:** `gardenLink()` base64-encodes the *entire* family state — including child avatar dataURLs (≈300–800 KB each). One child with two photos → 1.5 MB+ URL. Browsers/servers truncate or reject this; the "restore on another device" feature silently stops working exactly when it's needed most.
- **Fix:** strip `avatar` / `avatarReading` before encoding (link = progress only). UI note: "الصور تبقى على كل جهاز — انقل التقدم فقط". Optionally support chunked links (multiple `#garden=N=` parts) if photo transfer is ever wanted.
- **Accept:** link with 3 children (no photos) < 50 KB; restore round-trips stars/badges/listening; documented behavior when photos differ per device.

### 2. localStorage quota errors are swallowed 🔴
- **Problem:** `store.js` wraps `localStorage.setItem` in `try/catch { }` — on quota exceeded (a few photo-children ≈ 5 MB) every subsequent update **silently fails**; the pill still says "محفوظ".
- **Fix:** catch → set a `storageError` flag in state → toast "مساحة التخزين ممتلئة — احذف صورًا قديمة" + prevent further photo uploads until resolved. Compress uploads harder (max 400px, quality-checked PNG size warning > 400KB).
- **Accept:** simulated quota error shows the toast; no silent data loss path remains.

### 3. `restoreFamily` trusts arbitrary JSON 🔴
- **Problem:** the link/restore path parses untrusted JSON and merges it straight into state (no shape validation, no caps).
- **Fix:** a `sanitizeFamily()` pass: validate/coerce every child field (names ≤ 20 chars, numeric fields, known enums), cap children ≤ 8, drop unknown keys, strip `data:` images on link restore (per #1).
- **Accept:** fuzzed/corrupt/partial payloads can't crash the app or break state; unit-tested.

### 4. Player restarts at ayah 1 instead of resuming 🟠
- **Problem:** an in-progress surah (e.g. heard 14/30) always plays from ayah 1 on re-entry.
- **Fix:** initial `cur` = `min(heard, total-1)` when `heard > 0`; "إعادة السورة" stays the explicit restart.
- **Accept:** reopening a half-listened surah starts at the next unheard ayah.

### 5. Quiz reveals the correct answer after one miss 🟠
- **Problem:** `Quiz` highlights the correct option the moment any option is picked, while *also* offering "أحاول مرة أخرى" — contradictory pedagogy.
- **Fix:** wrong pick → shake only the wrong option; the correct answer is revealed only via "ساعدني أفهم الكلمة" (or after 2 misses).
- **Accept:** miss #1 shows no correct highlight; help flow unchanged.

---

## P1 — Memorization value + offline ✅ DONE

> All five items implemented & verified: `npm test` = 118/118, `npm run test:ssr` = 12/12 screens, prod build with PWA (sw.js + manifest + runtime caches), icons generated.

### 6. Player repeat & speed controls — the core of ḥifẓ ⭐ ✅
- **What:** per-ayah loop toggle (1× / 2× / 4× then advance), playback speed (0.75× / 1× / 1.25×), "next ayah" / "previous ayah" buttons.
- **Why:** these three are what actually make a child memorize; they're the highest-value missing feature.
- **How:** `audio.playbackRate`; small control bar under the play button in `Player`.
- **Accept:** "كرر 2×" plays the ayah twice then advances; speed persists per child.
- **Done:** `Player` got a repeat row (1×/2×/4×) + speed row (0.75/1/1.25) + prev/next buttons; `playbackRate` applied per play; repeat loops the same ayah via a `playsRef` counter before advancing; `repeat`/`speed` persist per child in `child.playback` (sanitized in `sanitizeChild`).

### 7. PWA: offline + installable ⭐
- **What:** `vite-plugin-pwa` — precache app shell, runtime-cache `api.alquran.cloud` responses (CacheFirst, cap 50 entries / 200 MB), web manifest (garden icon, `#10b981`, RTL Arabic), install prompt banner.
- **Why:** kids use this on phones with flaky data; recitation must not die mid-surah.
- **Offline text fallback:** embed Juz 30 (568 ayahs, ~60 KB) in `data.js` so the bridge quiz + daily ayah + juz-30 review work with zero network (audio gracefully shows "لا يوجد إنترنت — التلاوة تحتاج اتصال").
- **Accept:** airplane-mode test: app opens, bridge works (text), player shows offline notice, cached surahs still play.
- **Done:** `vite-plugin-pwa` (autoUpdate) with Arabic RTL manifest + 3 icons (192/512/maskable, AI-generated); precache app shell; runtime CacheFirst for `api.alquran.cloud` (60 entries) and `cdn.islamic.network` audio (200 entries). **Offline text:** embedded Juz 30 (78–114, 564 ayahs, 43 KB) in `src/juz30.js`; `api.js` falls back to it (text only, `audio: null`, `offline: true`) and to a built-in 58–114 surah list. Player/Bridge/Words/Daily show a "📴 التلاوة تحتاج إنترنت" notice and disable audio buttons when `audio` is null. Install prompt banner in `App.jsx`.

### 8. Badge wall "أوسمتي" ⭐
- **Problem:** badges are awarded but never *seen* — no screen lists them (only a count).
- **What:** modal/screen (from home card ⭐ tap or settings): all badges with earned vs locked (grayed) states, earned dates, e.g. بداية جميلة 🌱، مواظب 🌿، وسام جسر المعاني 🌉…
- **Accept:** earning a badge live-updates the wall; locked badges show the unlock hint.
- **Done:** badges stored as `{ id, at }` (old string format migrated on load + in `sanitizeChild`); `data.js` BADGES gained a `hint` per badge; new `src/Badges.jsx` screen (route `badges`) with earned (color + date in Arabic) vs locked (gray + hint) cards, streak chip, and entry points: garden top bar 🏅, Bridge stat-card (now clickable), home child-card star row.

### 9. Activity streaks (النظام الحالي يسقي الورد فقط)
- **What:** a daily-activity streak: any meaningful action (word discovered, surah ayah heard, daily ayah played, garden watered) marks the day; consecutive days = streak 🔥.
- **Where:** home child card ("🔥 5 أيام متتالية"), garden top bar, map header.
- **How:** `daily: { lastActive: date, streak: n }` touched by a single `touchActivity()` helper called from the existing award points.
- **Accept:** same-day actions don't double-count; gap resets to 1.
- **Done:** `child.daily.lastActive/streak` + pure `touchDaily(daily, today, yesterday)` (unit-tested) called from `awardStars`, `markWord` (on `done`), and garden watering (`water()` in Garden.jsx). `streakOf(child)` shows the streak only while it's alive (active today or yesterday). Displayed on: home child card (`progressSummary`), garden top bar, journey-map header, badge wall.

### 10. Family-link conflict dialog (matches original behavior)
- **Problem:** restore currently replaces silently. The original showed "يوجد تقدم مختلف على جهاز آخر" and never auto-replaced.
- **What:** when both sides have progress, per-child dialog: "هذا الجهاز" vs "الرابط" (show stars/dates) → keep this / take link / merge (take max of stars, badges union, listening max per surah, words union).
- **Accept:** merge is deterministic and unit-tested; nothing auto-replaced.
- **Done:** `hasProgress`, `pairChildren` (match by id then name), `mergeChild` (max stars, badges union sorted, per-surah max-heard/completed-OR, words union max-reviewed, decor union, gifts max, daily by higher streak, identity from this device) and `applyRestore(local, incoming, decisions)` all in `store.js` + unit-tested (incl. determinism under argument swap). New `src/RestoreDialog.jsx` (used by App hash-link restore and Settings) shows per-child "هذا الجهاز ⇄ الرابط" comparison with keep/take/merge choices, auto-resolves non-conflicts, lists extra children, and keeps an explicit "open whole link (replace)" option.

---

## P2 — UX polish ✅ DONE

> All eight items implemented & verified (128/128 `npm test`, 12/12 SSR, clean prod build with local fonts precached).

### 11. Splash screen ✅
Branded "جاري تحميل حديقة القرآن..." (tree + leaf spinner) shown while the bundle loads (index.html inline, fades out on first render).
- **Done:** inline `#splash` in index.html with its own `<style>` (works before the bundle/CSS load), `body.app-ready` added by `main.jsx` on first render, 0.5s fade; reduced-motion aware.

### 12. Haptics + keyboard ✅
- `navigator.vibrate(30)` on correct / `[80,40,80]` on wrong (mobile, gated by sound setting).
- Player: Space = play/pause, ←/→ = prev/next ayah.
- **Done:** `buzz()` in `sound.js` wired into `sfx.ok()`/`sfx.wrong()` (auto-gated by the muted flag); Player registers a keydown listener (ref-based, skips inputs/selects, prevents Space scroll).

### 13. Ayah display controls ✅
Per-child reading-font size (S/M/L) applied to player + bridge + daily ayah text; optional "خط واضح" (no-tashkeel) toggle for early readers.
- **Done:** `child.reading = { size, plain }` (defaulted + migrated on load + sanitized); new pure `src/text.js` (`cleanAyah`, `stripTashkeel`, `readAyah`, `matchForm`, `splitWord`); applied to Player, Bridge, Daily, Listen-Review, Words + Settings preview card. **Bonus fix:** `splitWord` had an index-alignment bug (sliced diacritized text with stripped-form indices → highlighted the wrong characters, e.g. "ومَ" instead of "سُبَاتًا"); now maps indices back through a keep-table and includes trailing diacritics — 20/20 words verified in both display modes.

### 14. Long-surah chip row ✅
52-ayah surahs produce a 30+ button wrap. Replace with a horizontally scrollable row + sticky "current" indicator.
- **Done:** `.ayahs-mini` is a nowrap horizontal scroller (thin scrollbar, RTL-aware); the current chip auto-center-scrolls on every change; the "الآية X من Y" line + count stay as the sticky indicator.

### 15. Garden life ✅
Hero walk-in on first garden entry (CSS translate along the path, 1.5s), 2 ambient butterflies drifting, sun/moon in the corner matching the time-of-day (home already does day/night).
- **Done:** `hero.walking` plays once per session (module flag), two 🦋 with drifting keyframes, `skyIcon()` ☀️/🌤️/🌇/🌙 floating in the corner.

### 16. Wording pass ✅
Native-speaker review of all Egyptian-dialect strings (consistent code-switching, no glitches), especially onboarding and celebration texts.
- **Done:** full string extraction + review. Fixed: "قراء"→"اقرأ", "نراجعها قريبًا"→"نراجع المعاني دلوقتي" (button acted instantly), "اضغط مرة أخرى لتشغيل التسجيل"→"استمع لتسجيلك", "سورة اتسمعت"→"سمعت N سورة لحد دلوقتي", "مرحبًا بك"→"أهلًا", "امشي الجسر"→"اعبر الجسر". Dialect variants (بتتحفظ/بيتحفظ, النهارده, كويس) confirmed as legitimate Egyptian usage — left intact.

### 17. Accessibility baseline ✅
`aria-label` on icon/emoji buttons, visible `:focus-visible` rings, `prefers-reduced-motion` disables confetti/bob animations, contrast check on chips over garden photo.
- **Done:** 11 back-buttons labeled "العودة"; global `:focus-visible` ring (amber variant on dark garden/player); `prefers-reduced-motion` block kills animations/confetti/butterflies/walk-in; nav pills verified white-on-green ≥ 4.5:1.

### 18. Self-host fonts ✅
Subset Amiri + Cairo to the Arabic glyphs actually used, host in `/fonts` (removes the Google Fonts dependency; also fixes degraded styling in offline/PWA mode).
- **Done:** Amiri 400/700 + Cairo 400/600/700/800/900 (arabic + trimmed latin subsets, 572 KB total) in `public/fonts/`, 14 local `@font-face` rules in `styles.css`, Google Fonts links removed, `woff2` added to the PWA precache → styling works fully offline.

---

## P3 — Visual enrichment (polish layer) ✅ DONE

> **Done (2026-09-27):** waves A + B shipped and verified. 8 new assets (6 screen bgs + 2 hero poses) = **1.35 MB total** (budget ≤1.5 MB). 128/128 store + 4/4 migrate + 12/12 SSR, build green, precache 41 entries ≈5.2 MB. Salman is the default child with a one-time migration from «عمر».

> Goal: take the app from "functional, clean cards" to a real **illustrated children's world** — one coherent watercolor art direction across every screen, with a motion vocabulary that rewards the kid. Default character: **سلمان** 🌳.
>
> **Asset budget:** ≤ ~10 new images, total ≤ 1.5 MB added to the precache (each optimized ≤ 180 KB, WebP/JPEG). All new motion respects `prefers-reduced-motion`.
>
> **Style tokens (lock before generating anything):** soft watercolor children's-book, emerald-mint palette (#10b981 / #ecfdf5 / #fffbeb), warm sun accents (#fbbf24), no harsh outlines, generous sky space for UI, consistent with the existing `garden-bg.jpg` + hero art.

### 19. Illustrated backgrounds for every screen ✅
- **What:** one custom full-bleed background per screen (home, garden ✓ exists, bridge, words, badges, journey map, settings) in the locked style — e.g. bridge = river + wooden bridge at golden hour; words = cozy reading nook with bookshelves; badges = trophy wall with garlands; settings = calm corner with a lamp.
- **Why:** today 6 screens share the same flat mint gradient — the world doesn't change as the child moves through it.
- **How:** `generate_image` per screen with the shared style prompt (fixed seed-style wording, same palette); CSS layer (image + soft top/bottom gradient for text contrast); content stays on existing cards.
- **Accept:** all screens have distinct, palette-consistent backgrounds; body text contrast ≥ 4.5:1 over them.

### 20. A real illustrated journey map ⭐ ✅
- **What:** replace the CSS step-strip with one generated **winding path map** (10 waypoints, 58→114, two gate flags, finish 🏆) with the hero marker on it.
- **Why:** the map is the emotional spine of ḥifẓ — a map the child can "see" where they are is worth more than any stat.
- **How:** generate the map (top-down-ish, cute, waypoints as numbered stepping-stones); overlay an **SVG path** matching the drawing for crisp progress (completed = colored, upcoming = dashed) + absolutely-positioned hero/gate markers at fixed % coordinates (no image parsing needed — coordinates defined in code per surah index).
- **Accept:** done/current/upcoming read at a glance on a 360 px screen; marker snaps between states; works offline (asset precached).

### 21. Per-trip theming (the four bridges get four personalities) ✅
- **What:** each bridge trip gets its own accent + mini scene header: وادي البدايات 🌱 green, بستان الفراشات 🦋 violet, شلال الرفق 💦 blue, حديقة الفوانيس 🏮 amber.
- **Why:** trip identity makes "today I'm on the butterfly garden" a real moment; also helps little kids navigate.
- **How:** 4 CSS custom-property sets (`--trip-accent`, `--trip-soft`) applied to trip cards, step progress bar, topbar chip, celebration confetti palette; 4 generated 640×280 scene headers for the trip list + step screen.
- **Accept:** switching trips visibly re-themes the section without touching base tokens.

### 22. Garden day/night cycle + gentle parallax ✅
- **What:** the garden follows the clock like the home screen already does — dawn glow, bright day, dusk orange, and a full **night mode** (deep-blue overlay, stars, bigger moon, flowers with tiny fireflies 🪲✨) synced to the existing `skyIcon()`.
- **Why:** the kid opens the app at different times of day; a garden that sleeps with them is the single most "alive" feeling we can add cheaply.
- **How:** CSS overlay gradients + star field (box-shadow dots or small inline SVG) keyed off the same time buckets as `greeting()`; 2 parallax layers (drifting clouds, distant hills) on pointer/scroll with `transform: translateZ`-free lerped offsets; existing butterflies/walk-in kept.
- **Accept:** night mode keeps all text/controls readable; parallax ≤ 12 px total, disabled under reduced-motion.

### 23. One motion vocabulary (micro-interactions everywhere) ✅
- **What:** a shared keyframe system: staggered card entrance (60 ms), springy press (existing), **star-fly** (on earning ⭐, a star clone arcs from the trigger to the topbar counter, counter pulses), **new-badge glow** + «جديد!» ribbon for 24 h after a badge lands, avatar **level ring** (SVG circle = stars toward next badge), rose sway + droplet splash (existing, tuned).
- **Why:** rewards should be *felt* — the current confetti+toast is generic; the star flying home is the moment a kid screenshots.
- **How:** WAAPI (`element.animate`) for the star flight (no new deps); CSS custom properties for the stagger; everything behind the reduced-motion gate.
- **Accept:** identical motion language on all reward moments; 60 fps on mid-range Android (no layout-thrashing anims).

### 24. Hero poses for the big moments ✅
- **What:** two more **سلمان** poses in the exact existing style: 🎉 celebratory (arms up, confetti) and 🎁 gift-opening (kneeling by the box).
- **Why:** the same standing pose for every celebration dilutes the moment.
- **How:** `generate_image` with the standing hero as reference; swap the hero `img` src in Garden celebrations / gate-complete / trip-complete modals with a bounce-in; transparent-background clean-up like the existing assets.
- **Accept:** both poses swap in at their 3 celebration sites; each ≤ 400 KB; offline-safe.

### 25. Empty states with personality ✅
- **What:** friendly empty states (emoji-composition + one line + CTA) for: no children yet, no badges yet, no words discovered, no gift decorations, nothing to review.
- **Why:** dead-end text like «عندك ٠ كلمات نراجعها» is accurate but lonely.
- **How:** no new assets — layered emoji in soft circles (e.g. 🏅 inside a dashed circle) + existing wording, small `EmptyState` component in Shared.jsx.
- **Accept:** every dead-end screen has a kind empty state with a next-step CTA.

### 26. Typography & token polish ✅
- **What:** a type scale (display 28 / H1 24 / H2 19 / body 16 / caption 13) as CSS variables; a **decorative Arabic display font** for the logo + screen titles only (candidate: Lalezar or Reem Kufi — self-hosted subset, same pipeline as item 18); radius/shadow/spacing tokens unified; tabular numerals on all counters; a **logo lockup** (🌳 + wordmark) used in home header + splash.
- **Why:** the last 10% of "premium" feel is consistency of small things — mixed font sizes and default serif fallbacks are the current weak spots.
- **How:** `:root` token pass over styles.css (no per-element font-size outside the scale), one new font pair (arabic+latin subset), lockup as inline SVG component.
- **Accept:** no `font-size` in styles.css outside the scale (except component-tuned ones documented); logo identical in home + splash.

**Suggested waves:** A = 21, 25, 26 (no new assets, ~1 day) → B = 19, 20, 22, 23, 24 (asset generation + integration, ~2 days). — ✅ both waves done.

**Shipped details:** Lalezar display font (self-hosted, home logo lockup); per-trip accents via `--acc/--acc-soft` (4 trips, 4 confetti palettes); EmptyState component (Bridge review / Words pre-first-discovery); Garden decor hint; fresh-badge 24 h glow + «جديد!» tag; level ring on child avatars; fly-star micro-interaction on correct picks (WAAPI, reduced-motion gated); illustrated backgrounds per screen with white wash; garden day/night phases (tint + star twinkle) + rAF mouse parallax (reduced-motion gated); Salman celebrate/gift poses in Celebration + gift modals; journey map meadow trail + stepping-stone dot colors; staggered rise-in entrances.

---

## P4 — Engineering hardening (continuous) ✅ DONE

> **Done (2026-09-27):** all four items shipped & verified — 343/343 Vitest tests (store 128 asserts migrated + 10 migration + 10 API + 265 fuzz + 26 data-integrity + 13 component), ESLint clean, Prettier formatted, SSR 12/12, build green, CI workflow in `.github/workflows/ci.yml`.
>
> **Bugs caught by the new suite (fixed):** Quiz marked a *correct* pick with the “wrong” style (index vs id comparison); `sanitizeChild` could **throw** on prototype-polluted objects (`Number()` on hostile input); future-version states were being demoted instead of passed through.

### 27. Real test suite in-repo ✅
Move the ad-hoc suites into `tests/` with **Vitest**:
- store logic (existing 24 assertions)
- data integrity: all 20 bridge words match their ayah under `matchForm` (auto-fails if data.js drifts)
- `sanitizeFamily` fuzz cases
- component tests: `Quiz` (reveal rules), `StepScreen` (correct/wrong/help flow), `Player` (repeat/advance) with mocked audio
- CI (GitHub Actions): lint → test → build on PR.

### 28. Lint + types ✅
ESLint (react-hooks, no-unused) + Prettier (RTL-safe config). Optionally `JSDoc`-typed store for the critical state shape.

### 29. API client hardening ✅
`fetch` timeout (10s) + one retry with backoff; cache layer already in `api.js` — extend to persist (IndexedDB) so re-opens don't re-fetch; version the cache.

### 30. State migrations ✅
`version` field exists but is inert: add `migrate(v)` chain so future schema changes (new daily fields, streaks) upgrade old localStorage safely.

---

## P5 — Stretch (when the core feels done) ✅ DONE

| # | Item | Notes |
|---|------|-------|
| 31 | **Journey round 2** ✅ — 10 more words (سُبَاتًا-class) as a "الجولة الثانية" unlocked after round 1 | `WORDS_R2` (10) + `TRIPS_R2` (2×5) reuse the whole bridge engine; kickers ٣٠ كلمة/٦ رحلات; Round-2 locked cards (🔒) on Bridge + Words until all 20 of round 1 are done; new badges trip5/trip6/round2 (🏆 on the 30th word); data-integrity now covers all 30 |
| 32 | **Listening stats** ✅ — minutes/ayahs per surah, weekly chart (tiny canvas) | `child.stats` (v3): total seconds + per-ISO-week + per-day + per-surah; Player estimates each ayah's seconds from word count ÷ speed at `onended`; `StatsPanel` on the gate list (3 cells + 8-week canvas bars); feeds "مواظب" context |
| 33 | **Shareable progress card** ✅ — canvas-rendered PNG (name, stars, badges, words, streak, listening min) | `shareCard.js` (600×760, self-hosted fonts, avatar clip); `navigator.share` file when available, PNG download otherwise; button on the badge wall |
| 34 | **More tafakkur cards** ✅ — weekly rotation (الطيور، السماوات، الماء، المصابيح) with audio | `TAFAKKUR` array (4) from Surah Al-Mulk, `pickTafakkur()` = ISO-week deterministic rotation, audio playback unchanged |
| 35 | **Parent mode** (PIN-locked) ✅ — daily listening cap + quiet hours | `child.parent` (v3): 4-digit PIN + toggle + cap (0–120 min) + quiet window (overnight-aware); `parentBlock()` gates the Player with a friendly 🔒 screen + amber banner on the gate list; panel lives in Settings (set/unlock/save/delete PIN) |
| 36 | **Second recitation layer** ✅ — "مع الأطفال" reciter auto-selected on first launch | `defaultChild().reciter = 'ar.husain al-azazi with children'` (verified live on api.alquran.cloud) |

**P5 shipped details:** schema v3 (`migrateV2ToV3` = stats+parent on every child, dogfoods the P4 chain; `safeStats`/`safeParent` type-guarded with size caps); 10 round-2 words verified against the embedded Uthmani text (`matchForm` + `splitWord`, e.g. عَلَقٍ 96:2, كَبَدٍ 90:4, وَجُوهٌ 80:38, ٱلْفَوْزُ 85:11, مُخْلِصِينَ 98:5, يَغْشَى 91:4, ٱلثَّاقِبُ 86:3, ٱلْفَجْرِ 89:1, يَسْعَى 80:8, ٱلْحُطَمَةِ 104:5); two real bugs caught while wiring (Bridge `byId` only searched round 1; store `WORD_IDS` sanitizer dropped round-2 words on reload); pre-existing `go('gate', gate.id)` param bug fixed (fell back to first gate); tests now 368 (was 343): +10 round-2 data-integrity, +2 tafakkur rotation, +9 stats/parent store tests, +3 v3 migration, +2 share-card stats.

---

## P6 — Visual enrichment II: the illustrated world layer 🎨

> **Status (2026-09-28): waves 1–4 shipped and verified — 14/14 assets generated, optimized & wired (760 KB total, precache 55 entries ≈ 6.1 MB). Waves 5–6 planned below.**
> P3 gave every screen a watercolor background and the hero his poses — but the app's **content** surfaces are still carried by emoji: trip cards, gate headers, tafakkur cards, badge medals, garden decor. This phase replaces the emoji that carry the most emotional weight with generated watercolor art, in the same locked style, under a strict byte budget so the PWA precache stays healthy.
>
> **Shipped:** 6 trip scenes → Bridge card thumbs + step banners (locked round-2 = grayscale + 🔒) · 2 gate banners → gate intro + list head (replaced the bouncing 🏰) · 4 tafakkur illustrations → Daily تأمل الأسبوع card (all four weekly cards now rotate art too) · rosette frame behind every earned badge (wall + celebrations) · golden trophy sticker on trip-complete/round-2 celebrations + as the round-2 badge art on the wall.

### Locked art direction — the shared prompt prefix

Every asset of this phase is generated with the *same* style preamble (style drift is the #1 risk, see P4 risks — so one batch, one voice):

```
Soft watercolor children's storybook illustration, gentle washes, dreamy soft
edges, no harsh outlines, subtle paper texture, calming emerald and mint green
palette (#10b981 / #ecfdf5) with warm cream light (#fffbeb) and a small golden
sun accent (#fbbf24), cozy and peaceful, no people, no text, no letters,
no numbers, no watermark.
```

- Trip/gate/tafakkur scenes tint toward the surface's existing accent (violet / blue / amber / indigo / rose) while keeping the mint-emerald base.
- Flat frontal compositions, wide landscapes with generous negative space where UI text sits on top.
- Transparent art (rewards) is generated on a **pure white background**, then flood-fill keyed + alpha-softened in ImageMagick (same pipeline that produced `hero-*-t.png`).

### Byte budget — the guardrail

| Rule | Value |
| --- | --- |
| Waves 1–4 (this drop) | 14 assets |
| Per asset, optimized | scene/banner ≤ 120 KB · tafakkur ≤ 90 KB · transparent PNG ≤ 150 KB |
| Total added to precache | ≤ 1.1 MB (precache ≈ 5.2 MB → ≤ 6.3 MB) |
| Formats | JPEG for scenes/banners/tafakkur, PNG for transparent reward art |
| Processing | ImageMagick: center-crop to target ratio → resize → strip metadata → quality tune to budget |

### Asset manifest

| # | Asset | File | Target | Surface (where it appears) | Wave |
| --- | --- | --- | --- | --- | --- |
| 1 | وادي البدايات scene | `trip-1-wadi.jpg` | 720×300 | Bridge trip card thumb + step banner | 1 ✅ |
| 2 | بستان الفراشات scene | `trip-2-bustan.jpg` | 720×300 | same | 1 ✅ |
| 3 | شلال الرفق scene | `trip-3-shallal.jpg` | 720×300 | same | 1 ✅ |
| 4 | حديقة الفوانيس scene | `trip-4-fawanis.jpg` | 720×300 | same | 1 ✅ |
| 5 | مغامرة الخلق scene | `trip-5-khalq.jpg` | 720×300 | same (round-2 trip) | 1 ✅ |
| 6 | سماء وفجر scene | `trip-6-fajr.jpg` | 720×300 | same (round-2 trip) | 1 ✅ |
| 7 | بوابة جزء تبارك banner | `gate-tabarak.jpg` | 800×280 | Listening gate head | 2 ✅ |
| 8 | بوابة قد سمع banner | `gate-qadsama.jpg` | 800×280 | Listening gate head | 2 ✅ |
| 9 | تأمل الطيور | `tafa-birds.jpg` | 480×360 | Daily tafakkur card | 3 ✅ |
| 10 | تأمل السماوات | `tafa-heavens.jpg` | 480×360 | same | 3 ✅ |
| 11 | تأمل الماء | `tafa-water.jpg` | 480×360 | same | 3 ✅ |
| 12 | تأمل المصابيح | `tafa-lamps.jpg` | 480×360 | same | 3 ✅ |
| 13 | وسام-إطار مائي (rosette) | `medal-rosette-t.png` | 420² | behind every badge emoji (wall + celebrations) | 4 ✅ |
| 14 | كأس الأبطال | `trophy-t.png` | 420² | «بطل الجولتين» + trip-complete celebrations | 4 ✅ |
| 15–22 | garden decor sprites (قطة/عصفور/تنين/تاج/طوق/نجمة/ميدالية/فراشة) | `decor-*-t.png` | 200² | Garden scene, replaces floating emoji | 5 ⏳ |
| 23 | وردة الحديقة + مرجيحة/زحليقة/مقعد spots | `spot-*.png` | ~240² | Garden interactive spots | 6 ⏳ backlog |

### 37. Trip identity scenes ⭐ (wave 1) ✅

- **What:** six illustrated scene headers, one per bridge trip (4 round-1 + 2 round-2), tinted to each trip's accent; trip cards get a rounded scene **thumbnail** in place of the emoji box (same 62 px footprint — zero layout risk), and the step screen gets a full-width **scene banner** above the bridge strip.
- **Why:** the bridge is the heart of the app; «اليوم أنا في بستان الفراشات» should *look* different from «شلال الرفق». Locked round-2 cards show the scene grayscale + 🔒 overlay — a teaser, not a dead lock.
- **Accept:** every trip reads at a glance from its card; step banner keeps ≥ 4.5:1 text contrast (name overlaid on a cream wash); total ≤ 700 KB. — ✅ 258 KB for the six (34–71 KB each), scene name sits on a `#fffbeb` wash at `#065f46`.

### 38. Illustrated gate banners (wave 2) ✅

- **What:** two wide banners — a vine-wrapped wooden garden arch (تبارك) and a pale-stone arch with a soft geometric rim (قد سمع) — as the header of each gate screen.
- **Accept:** both gates feel like two doors of the same garden; ≤ 240 KB the pair. — ✅ 111 KB the pair; wired into the gate intro hero (replacing the bouncing 🏰) and the gate list head.

### 39. Tafakkur card illustrations (wave 3) ✅

- **What:** four small illustrations (doves / layered sky / winding river / glowing lamps) matching the four weekly تأمل cards from Surah Al-Mulk; rendered at the top of the tafakkur card.
- **Accept:** weekly rotation visibly changes the art; ≤ 340 KB all four. — ✅ 125 KB all four; `img` field per TAFAKKUR entry, card renders it only when present.

### 40. Reward medal + trophy (wave 4) ✅

- **What:** a watercolor **rosette frame** (transparent) that sits behind every badge emoji — badge wall, celebration modals — and a **golden trophy** for «بطل الجولتين» and trip-complete moments. The emoji stays as the badge's unique center; the rosette gives all 13 badges one consistent, illustrated body.
- **How:** both generated on pure white and keyed to alpha (flood-fill from the edges + alpha-blur seam, same pipeline as `hero-*-t.png`); rosette = CSS `background` on the earned `.b-emoji` box and on `.badge-medal` (replacing the radial-gradient circle); trophy = corner sticker in trip/round-2 celebrations + the round-2 badge's own art on the wall.
- **Accept:** locked badges keep their gray treatment (🔒 centered in the same-size box so grid rows stay even); earned medals animate in (existing `badge-spin`, auto-gated by the global reduced-motion rule); 257 KB the pair (budget ≤ 300 KB). ✅

### 41. Garden decor sprites (wave 5 — next)

- **What:** the 8 gift decorations become small transparent watercolor sprites pinned on the garden photo at their existing `x/y` anchors; tap → same `say()` bubble + a tiny sway animation.
- **Risk note:** transparent keying of soft watercolor needs visual QA (white fuzz halos on the garden photo); generate on pure white, flood-fill from the edges, alpha-blur the seam, and verify at 72–96 px render size before shipping all 8.

### 42. Words cards & share-card art (wave 6 — backlog)

- **What:** tiny leaf/word motifs for «كلماتي» cards, hero art in the canvas share card, and an optional night-garden variant background.
- **Why:** nice-to-have polish; only after waves 1–5 prove their byte cost.

### QA checklist per wave

1. `npm test` (368) + `npm run lint` + `npm run build` stay green.
2. New files counted against the budget table — anything over budget gets re-compressed, not shipped fat.
3. Live-preview pass on a 360 px viewport: contrast, RTL alignment, reduced-motion (no new animation on transparent art beyond existing gates).
4. PWA: new assets land in the precache manifest automatically (`globPatterns` covers jpg/png) — verify `dist/sw.js` count grows by exactly the shipped files.

---

## Suggested execution order

```
Week 1   P0 (1–5)            → ship: safe sync, honest storage, resumable player
Week 2   P1 (6,7)            → ship: repeat/speed + offline PWA   ← biggest perceived jump
Week 3   P1 (8,9,10) + P2 (11,12,14)
Week 4   P2 remainder + P3 wave A (21,25,26)
Week 5   P3 wave B (19–20,22–24) + P4 (27,28,30) → illustrated, CI-protected, a11y'd
Backlog  P5 as momentum allows
```

**Shipped details:** Vitest suite in `tests/` (store, migrate, api, data-integrity, sanitize-fuzz ×260, components: Quiz reveal rules / StepScreen flows / Player repeat-advance with fake Audio); ESLint (react-hooks, react jsx-uses, no-unused) + Prettier config; `fetchJson` = 10 s AbortController timeout + one backoff retry (4xx never retried); persistent IndexedDB cache `quran-garden-cache` v1 with versioned keys (`v1:surah:…`) + stale-while-revalidate; `SCHEMA_VERSION` + `migrateState()` chain (v1→v2 = عمر→سلمان + badge objects) wired into load(), sanitizeFamily(), and family links; JSDoc `Child`/`FamilyState` typedefs on the store; CI = lint → format → test → SSR → build on PR.

**Risks to watch:** PWA cache size on low-end Android (cap + eviction, and P3's ≤ 1.5 MB image budget is the guardrail), family-link chunking scope creep (skip until asked), P3 image-style drift (lock the style tokens + generate all screens in one batch, not over days), content authoring for P5-31 (needs careful meaning review, not a code task).
