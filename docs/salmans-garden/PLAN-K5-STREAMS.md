# «مجاري النور» — خطة امتداد حديقة سلمان من التمهيدي إلى الصف الخامس

## The K–5 Stream Plan for the Four Gardens — Arabic · English · Math · Science

> **Status: proposed — this document asks for the eight decisions in [§14](#14-القرارات-المطلوبة-the-eight-decisions). Nothing in it is approved, built, voiced or shown to a child yet.**
>
> **Companion document:** [`PLAN-ISLAMIC-PHONICS.md`](PLAN-ISLAMIC-PHONICS.md) (approved 2026-10-11) remains the authority on **the method** — the seven-step day, the letter order, the two-book story map, the review protocol. **This document does not replace it. It is the authority on the route**: what comes *after* the pilot station, and how one method carries a child from K to grade 5 in four subjects instead of one station in three.
>
> **Two inherited rules this plan obeys without exception:**
> 1. **Reuse before build** ([§10](#10-الفنّ-والصوت--reuse-first-and-the-budget-is-a-gate)). The new work is composition, sequencing and a small closed set of sprites — not a rebuild.
> 2. **Nothing is voiced or shown to a child before it passes its record in [`CONTENT-REVIEW.md`](CONTENT-REVIEW.md).** No exception for good intentions.
>
> **The second repository:** [`fikr-dashboard`](https://github.com/marwanabdulhady-gif/fikr-dashboard) is the **teacher** end of the same curriculum — the flipped Grade 4 enVision programme, its gates 1–16, its doors (`1:1-1`), its keepers and trials, its caravan route on the Wadi map, its class pebble bowl, and `js/wadi-data.js`. Its README states the fact that matters most for this plan: **"The explorer is called Salman everywhere."** The child's app migrated `عمر → سلمان` in its own phase P3. **سلمان is the same child on both sides of the desk.** [§11](#11-جسر-fikr-dashboard--the-spine-contract) turns that from a coincidence into a contract.

---

## Table of contents

| § | |
|---|---|
| [0](#0-كيف-نقرأ-هذه-الخطة-how-to-read-this-plan) | How to read this plan |
| [1](#1-الخلاصة-في-فقرة-واحدة-the-idea-in-one-paragraph) | The idea in one paragraph |
| [2](#2-معجم-the-vocabulary) | **The vocabulary** — every term defined |
| [3](#3-تشريح-المجرى-stream-anatomy) | Stream anatomy — the ten parts |
| [4](#4-لماذا-«مجرى»-why-stream-and-why-now) | Why "stream", and why now |
| [5](#5-قاعدة-المركزية--مراتب-السند-the-centrality-rule) | **The centrality rule — مراتب السند** |
| [6](#6-القواعد-الأربع-التي-لا-تُكسر-the-four-guards) | **The four guards** |
| [7](#7-النطاقات-الثلاثة-the-three-bands) | The three bands — full specification |
| [8](#8-المجاري-الأربعة-مجرى-مجرى-the-four-streams-band-by-band) | The four streams, band by band |
| [9](#9-اليوم-السبعي-the-seven-step-day) | The seven-step day — full specification |
| [10](#10-الفنّ-والصوت--reuse-first-and-the-budget-is-a-gate) | Art & audio — reuse first, budget as a gate |
| [11](#11-جسر-fikr-dashboard--the-spine-contract) | **The fikr-dashboard bridge — the spine contract** |
| [12](#12-المحرّكات-واختيار-الجلسة-والتقارير) | Engines, session selection, reports |
| [13](#13-نموذج-البيانات-the-data-model) | The data model |
| [14](#14-القرارات-المطلوبة-the-eight-decisions) | **The eight decisions** |
| [15](#15-المراحل-phases) | Phases P9–P16 |
| [16](#16-المخاطر-ومعالجتها-risks-and-mitigations) | Risks and mitigations |
| [17](#17-ما-لا-تفعله-هذه-الخطة-what-this-plan-deliberately-does-not-do) | What this plan deliberately does not do |
| [18](#18-أسئلة-مفتوحة-open-questions) | Open questions |
| [A](#appendix-a--المصادر-sources) | Appendix A — Sources |
| [B](#appendix-b--الحروف-الـ٢٨-والأصوات-الـ٤٢) | Appendix B — the 28 letters and the 42 sounds |
| [C](#appendix-c--جدول-آيات-الكون-مسوّدة-نطاق) | Appendix C — the creation-ayah table (**scope draft**) |
| [D](#appendix-d--جدول-تعارض-المصطلحات-glossary-conflicts) | Appendix D — glossary conflicts |

---

## 0. كيف نقرأ هذه الخطة (How to read this plan)

### 0.1 الجمهور (Audience)

| Reader | Read | Why |
|---|---|---|
| **صاحب المشروع (you)** | §1 · §5 · §6 · §7 · §14 · §15 | The idea, the rules, the band model, the decisions, the order of work |
| **The teacher / المعلّم** | §1 · §7 · §8 · §9 | What a child actually does each day, and what changes between grades |
| **ولي الأمر (the parent)** | §1 · §7 · §12.3 | What the bands mean, and what the report will tell them |
| **A developer picking this up** | §2 · §9 · §12 · §13 · §11 | The data shapes, the day's state machine, the spine contract |
| **A reviewer / عالم أو معلّم يراجع المحتوى** | §5 · §6 · §8 · Appendix C | The sanad rules, the guards, and exactly what must be checked |
| **A designer** | §9 · §10 | Which screens exist, which sprites are needed, and the byte budget |

### 0.2 رموز الحالة (Status markers used throughout)

| Marker | Meaning |
|---|---|
| ✅ | **مبنيّ** — exists in the app today, with tests and assets |
| 🟡 | **جزئيّ** — partially built; the exact remainder is named |
| ⬜ | **مخطَّط** — designed here, nothing built |
| 🔒 | **محجوب** — blocked by a review, a voice, or a decision — the blocker is named |
| ⚠️ | **خطر** — an open risk, listed again in [§16](#16-المخاطر-ومعالجتها-risks-and-mitigations) |

### 0.3 ما هذه الخطة وما ليست (What this is / is not)

**It is:** architecture, band model, the *sanad* rule, the full scope of four subjects across K–5, the day's specification, the engine catalogue, the phase plan, and the bridge to the teacher's app.

**It is not:** child-facing text. **This document contains no story written for a child and no Quranic or hadith text quoted as content.** Where it cites a source it cites a *reference* (`الغاشية ١٧`, `مسلم ٢٠٢٨`) as a **slot to be verified**, never a quotation to be shipped. The distinction is deliberate and is enforced as a rule in [§6](#6-القواعد-الأربع-التي-لا-تُكسر-the-four-guards): *nothing is written before it is matched.*

### 0.4 الوضع الحالي في سطر (Where the app is today, in one line)

Three of the four subjects exist, **but only as one station each** (age band 4–6); the Quran journey spans juz 58–114; and there is **no route** connecting any of it from K to grade 5 — which is the gap this plan closes.

---

## 1. الخلاصة في فقرة واحدة (The idea in one paragraph)

`PLAN-ISLAMIC-PHONICS.md` answered *how* a child learns one unit: a story, a sound, an action, a chant, a trace, a game, a deed. It did not answer *what comes after the pilot station*, and it stopped at ages 4–6. **«مجاري النور»** answers both. Each of the four subjects becomes one **مجرى (stream)** a child enters at K and leaves at grade 5 — never re-entering, never restarting, only going deeper. A stream is made of **محطات (stations)**, **أيام (the existing seven-step days)**, and **سند (the revealed source of every unit)**. The three **نطاقات (bands)** — **K–2 · 2–4 · 4–6**, the same vocabulary `fikr-dashboard` already uses — are **depth targets, not locks**: a six-year-old reading at band 2–4 is not moved out of the garden, they simply draw from a deeper bed of the same stream. And Islam is central not by decorating each unit with a verse, but by being **the source of every unit**: **no unit enters a stream without a sanad** ([§5](#5-قاعدة-المركزية--مراتب-السند-the-centrality-rule)), and that rule is enforced by a test rather than trusted to discipline.

---

## 2. معجم (The vocabulary)

Every new term in this document, defined once. Arabic is the working language of the app; the English word is given because the second repository and its docs are in English.

| Term | Arabic | Definition | Where it lives in code today |
|---|---|---|---|
| **The Spring** | **العين** | The Quran: the revealed source. In the child's app it is the Quran journey (juz 58–114, آية اليوم, جسر المعاني, بوابات الاستماع). **It is not a subject.** | `src/App.jsx`, `src/JourneyMap.jsx`, `src/Listening.jsx`, `src/Bridge.jsx` |
| **The Axis** | **المحوَر** | The structural role the Spring plays: every stream node resolves back to it. Constant `AXIS = 'quran'`. | 🟡 (modelled, [§13](#13-نموذج-البيانات-the-data-model)) |
| **The Stream** | **المجرى** | One subject's continuous route from K to grade 5. Four streams: `arabic` · `math` · `english` · `science`. | 🟡 `GARDENS` + `NOUR_ORDER` are the seed of one |
| **The Band** | **النطاق** | A depth target and reading load: `k2` (K–2) · `2-4` · `4-6`. **Not a lock, not a grade.** | ⬜ |
| **The Station** | **المحطة** | A cluster of units inside a stream — the unit of a map screen and of a trial. | ✅ `station` field, `MATH_STATIONS`; the 7 letter stations + 8–10 |
| **The Day** | **اليوم** | One unit taught in one sitting through the seven steps. | ✅ `DAY_STEPS`, `letterday.js` |
| **The Unit** | **الوحدة** | The thing being learned: a letter, a sound, a number, a sign. | ✅ `NOUR_UNITS` |
| **The Sanctuary / Gate** | **البوابة** | The teacher's term for a station (`fikr-dashboard` gate 1–16). One gate ≈ one station. | ⬜ (bridge) |
| **The Door** | **الباب** | The teacher's term for one lesson (`1:1-1`). One door ≈ one day/unit. | ⬜ (bridge) |
| **The Guide** | **الدليل** | The child's companion for a stream: سلمان · الهدهد · دودة الحرير · السنجاب · (+1 for science). The teacher's side calls the same idea a **keeper**. | ✅ `GARDENS[x].guide` |
| **The Sanad** | **السند** | The revealed source a unit is built on, at one of four ranks. Field `anchor`. | ⬜ |
| **The Rank** | **المرتبة** | One of four sanad ranks: `m1` نصّ · `m2` قصّة · `m3` معنًى · `m4` أثر. | ⬜ |
| **The Deed** | **عمل اليوم** | The one action a child takes after the lesson. In science: **عمل الخلافة**. | ✅ `unit.deed` |
| **The Trial** | **المحطة الختامية** | The end-of-station check, matching `fikr-dashboard`'s ⚔ gate trial. | 🟡 `unitCompleted`, badges |
| **تدبّر** | — | Reflection on a sign Allah placed in creation. Permitted, encouraged, and age-appropriate. | ⬜ |
| **إعجاز علمي** | — | The claim that a text "predicted" a scientific fact. **Requires a cited tafsir** ([§6](#6-القواعد-الأربع-التي-لا-تُكسر-the-four-guards) guard 2). | ⬜ |
| **البوابة الطفلية** | — | The 10-minute real-child session gate the repo has scheduled since phase A and has **never run**. [§15](#15-المراحل-phases) makes it P9. | ⬜ ⚠️ |

### 2.1 كلمة عن «الحديقة» و«المجرى» (A note on "garden" vs "stream")

The app calls its four subjects **حدائق (gardens)**; `fikr-dashboard` calls its units of progress **gates** and its overall journey a **caravan route**. This plan introduces **مجرى (stream)** for the third thing that neither word covers: **the continuous path**. The three words are not synonyms and none replaces another:

- A **garden** is a *place* (a screen, a colour, a guide, a background).
- A **stream** is a *path* (an order across time, grades, and depth).
- A **station** is a *stop* on that path.

A garden with no stream is what the app has today: four pleasant places with no road between them.

---

## 3. تشريح المجرى (Stream anatomy)

Every stream in «مجاري النور», without exception, has these ten parts. The right-hand column shows where each part already exists in one of the two repositories — because the point of this architecture is that **almost all of it is already built, and only the arrangement is new.**

| # | Part | Arabic | Child's app (this repo) | Teacher's app (`fikr-dashboard`) |
|---|---|---|---|---|
| 1 | **The spring** | العين | حديقة القرآن — juz 58–114, الآية اليوم, جسر المعاني, البوابات | `js/wadi-data.js` story hooks & gates |
| 2 | **The stream** | المجرى | a garden id: `arabic` · `math` · `english` · **`science`** | the subject's World Tour |
| 3 | **The band** | النطاق | ⬜ new — `bands` | `docs/ux-review-*`: K–2 · 2–4 · 4–6 |
| 4 | **The station** | المحطة | ✅ `station` field, `MATH_STATIONS` | **gate** 1–16 |
| 5 | **The day** | اليوم | ✅ a unit + `DAY_STEPS` | a **door** (`1:1-1`) |
| 6 | **The guide** | الدليل | ✅ سلمان · الهدهد · دودة الحرير · السنجاب | **keeper** + artifact per gate |
| 7 | **The sanad** | السند | ⬜ new — `anchor` | the lesson's 🏮 Wadi story hook |
| 8 | **The deed** | عمل اليوم | ✅ `unit.deed` | production pathways A & B · STEAM commission |
| 9 | **The trial** | المحطة الختامية | 🟡 `unitCompleted`, badges | ⚔ gate trial (needs every door taught) |
| 10 | **The recognition** | التكريم | ✅ stars, badges, `growth-*.png` | **the pebble bowl** — collective, *never a rank* |

### 3.1 ما ينقص اليوم بالضبط (What is missing today, precisely)

Three things, and only three:

1. **الطريق (The road).** There is no order connecting station to station across grades. `NOUR_ORDER` orders units *within a garden*; nothing orders *stations across years*.
2. **النطاق (The depth axis).** There is one implicit band (ages 4–6). A seven-year-old and a ten-year-old get identical content.
3. **السند (The source).** Stories carry `ref`/`url`/`review`; **units do not**. So the *story* is sourced, but the *thing being taught* is not — which is exactly the gap that lets a curriculum drift into "Islamic decoration" one unit at a time.

Everything else — screens, engines, assets, audio, Leitner, the parent area, the badges — is built and reusable.

### 3.2 الشكل (The shape)

```
                            ┌──────────────────────────────┐
                            │      العين — the Spring      │
                            │         (the Quran)          │
                            │   AXIS = 'quran'             │
                            └───────────────┬──────────────┘
                                            │
        ┌───────────────┬───────────────┬───┴───────────┬───────────────┐
        │               │               │               │               │
   ┌────▼────┐     ┌────▼────┐    ┌────▼────┐    ┌─────▼─────┐   (every node)
   │ العربية │     │الرياضيات│    │الإنجليزية│    │  الكون    │◄── anchor back
   │ arabic  │     │  math   │    │ english │    │  science  │    to the spring
   └────┬────┘     └────┬────┘    └────┬────┘    └─────┬─────┘
        │               │               │               │
   ┌────▼────┐     ┌────▼────┐    ┌────▼────┐    ┌─────▼─────┐
   │محطات ١–١٠│     │محطات ١–٧ │    │مجموعات ١–٧│   │محطات ١–٨  │
   │28 حرفًا  │     │ ١–٢٠ →   │    │42 صوتًا  │    │ 8 stations │
   │ + نحو    │     │ الأنصبة  │    │ + قراءة  │    │  ⬜ new    │
   └─────────┘     └─────────┘    └─────────┘    └───────────┘
        │               │               │               │
        └───────────────┴───────────────┴───────────────┘
                                │
                    كل وحدة يومٌ من سبع خطوات
                    (every unit is one seven-step day)
```

---

## 4. لماذا «مجرى»؟ (Why "stream", and why now)

### 4.1 الكلمة (The word)

The metaphor is not ours; it is the Qur'an's own picture of a garden: **«جَنَّاتٍ تَجْرِي مِن تَحْتِهَا الْأَنْهَارُ»** — gardens with rivers running beneath them. An irrigation channel is the right image for three reasons, and each one is a design decision rather than poetry:

1. **A channel has a source.** Water that appears in a channel with no source is a leak, not irrigation. Applied to curriculum: **a unit with no source is not teaching, it is content** — this is [§5](#5-قاعدة-المركزية--مراتب-السند-the-centrality-rule) in metaphor.
2. **A channel runs one way, continuously.** It does not restart each year. This is why the band model ([§7](#7-النطاقات-الثلاثة-the-three-bands)) rejects hard grade gates.
3. **A channel can widen without changing direction.** Deeper content at band 3 goes *further down the same bed*, not into a different subject. This is what keeps a 10-year-old from being taught "a new maths" while the 6-year-old learns "the old maths."

### 4.2 لماذا الآن (Why now)

Four facts, all verifiable in this repository:

| Fact | Evidence |
|---|---|
| The pilot is finished and its method is locked | `PLAN-ISLAMIC-PHONICS.md` "P0 وP1 ✅ منجزان، وP6a ✅ منجز" |
| The content already outgrew the station it was filed under | 8 letters, 24 sounds, 20 numbers, 50 bridge words are **all** filed as one band | 
| The sibling plan explicitly stopped short | "(P0 (content for station 1) is the next step)" — and no document says what station 2 is *for a seven-year-old* |
| The teacher-side app exists and already has the route concept | `fikr-dashboard` gates/doors/trials/Wadi map |

**The strategic point:** the child's app has a *method* with no *route*, and the teacher's app has a *route* with no *child*. Joining them ([§11](#11-جسر-fikr-dashboard--the-spine-contract)) makes each one's weakness the other's strength — and the joining is a *contract*, not a merger.

### 4.3 لماذا لا نتركه كما هو (Why the alternative fails)

The obvious alternative is to keep adding stations ad hoc, the way P3/P6a did. It worked for three phases, and it fails at K–5 for four structural reasons:

- **No depth axis** → the same content is served to a 5-year-old and a 10-year-old, and the only way to differentiate becomes *speed*, which is exactly what the repo's rules forbid ("لا توجد مؤقتات ولا لوحات متصدّرين ولا عقوبة على الخطأ").
- **No sanad on units** → each new batch re-invents its own sourcing discipline. The existing units prove it: the *stories* in `nour-letters.js` carry `ref`/`url`/`review: 'ok'` with a note, while the *units* carrying them do not.
- **No route** → progress cannot be reported to a parent in any unit larger than a unit. `parent.js` can say "متقن في الحديقة" but not "أين هو من خمس سنوات".
- **No bridge** → the two apps drift, and every future integration becomes a migration instead of a lookup.

---

## 5. قاعدة المركزية — مراتب السند (The centrality rule)

> **This is the heart of the plan.** Everything else in this document is scheduling. This section is the reason the plan exists.

### 5.1 المشكلة (The problem being solved)

"Islamic centrality" is the easiest claim to make and the hardest to keep. In practice it fails in one of exactly two ways, and both are visible in ordinary Islamic-school material:

| Failure | What it looks like | Why it is worse than it seems |
|---|---|---|
| **الاستعمال (Instrumental use)** | A hadith sticker on a fractions worksheet. The verse is *decoration*; remove it and the lesson is unchanged. | It teaches the child — at the level of form, which is the level children learn from — that revelation is *ornament*. |
| **الدعوى (Overclaiming)** | "The Qur'an predicted the expanding universe" — with no tafsir cited. | It dates badly the moment the science shifts, and it puts words in the Qur'an's mouth to do it. |

Note carefully: **neither failure is about sincerity.** Both are about mechanism. A sincere teacher produces both, because nothing in their material *prevents* it. So the plan does not ask for sincerity; it asks for a **field that must be filled in.**

### 5.2 الحلّ (The solution): every unit declares a `sanad`, at one of four ranks

The repository already has the right idea, applied to the wrong object: **stories** in `nour-letters.js` carry `ref`, `url` and `review: 'ok'` **with a note recording exactly what was matched**. This plan lifts that field one level up — from the *story attached to a unit* to **the unit itself** — and gives it four ranks, because not every unit can be a quote and pretending otherwise is how the field becomes a formality.

| Rank | Arabic | Test — does this unit pass? | What it requires | Worked example |
|---|---|---|---|---|
| **م١** | **نصّ** | **Is the unit itself a text?** Can you point at an ayah or a hadith that *is* the thing being taught, not a comment on it? | `ref` + `url`; quoted words matched character-for-character in the review record | **٣** — the number three, taught through the Prophet ﷺ drinking in three breaths (`مسلم ٢٠٢٨`) |
| **م٢** | **قصّة** | **Is there a revealed narrative?** Does the Qur'an or an authentic hadith tell a *story* this unit retells? | `ref` + `url`; retelling adds nothing and depicts nothing ([§6](#6-القواعد-الأربع-التي-لا-تُكسر-the-four-guards) guard 4) | **النمل** — the ant who spoke, heard by Sulaiman عليه السلام (`النمل ١٨–١٩`) |
| **م٣** | **معنًى** | **Is there only a value?** No text says this directly, but the Sharia teaches the principle. | **`related` — a live link to a م١ or م٢ unit.** A م٣ unit that is a terminal node is *invalid*. | English **/ng/** → gentleness in speech → links to the Arabic unit built on the same meaning |
| **م٤** | **أثر** | **Is it a sign in creation?** The unit is *observation* — the ayah is the lens the child looks *through*, not the fact attached at the end. | **`ref` is mandatory.** An ayah-less م٤ is *invalid* — that is precisely the "science + Islam" pairing this rank exists to prevent | **الإبل** — observe how it is made, because `الغاشية ١٧` asks the child to look |

### 5.3 لماذا أربع مراتب ولا واحدة (Why four ranks and not one)

Because one rank collapses under contact with a real K–5 curriculum. Three concrete pressures:

- **Maths needs م١.** Numbers have *texts*: ٣ (three breaths), ٥ (the five rights of a Muslim), ٧ (seven in the shade), ٨ (the eight gates), ١٢ (the twelve springs, the twelve months). Forcing these down to "value" rank would throw away the strongest material the subject has.
- **Science *is* م٤ and must not be م١.** A science unit that presents an ayah as its *content* is a religious-studies lesson wearing a lab coat. Science is the study of the sign; the ayah is why we look. Conflating them is the single most common failure in Islamic science curricula, and the rank system makes it structurally visible.
- **English cannot be anything but م٣ for most of its inventory.** 42 phonemes cannot each own an ayah. There is no honest way to source `/x/` from revelation. Rank م٣ gives that inventory a *legal, fenced* home instead of a dishonest one — and by requiring `related`, it keeps the English garden tied to the Arabic one at the level of *meaning*.

### 5.4 الحقول (The field, exactly)

```jsonc
// one unit, showing only the sanad and what it governs
{
  "id": "num-3",                       // the unit's identity
  "anchor": {
    "rank": "m1",                      // m1 | m2 | m3 | m4   — the four ranks
    "ref":  "مسلم ٢٠٢٨",              // required for m1, m2, m4
    "url":  "https://sunnah.com/muslim:2028",   // a link a parent can re-check
    "related": null,                   // required for m3 — a live link to an m1/m2 unit
    "review": "pending",               // ok | note | pending
    "verified": false                  // true only after a record exists in CONTENT-REVIEW.md
  }
}
```

Field notes, each of which is a decision rather than a detail:

- **`url` is not decoration.** `fikr-dashboard` builds its whole parent portal on the principle that a family can *check* what the school claims (codes → `portal_lookup()` returns only that child's slice). The same principle here: a parent who doubts a hadith reference should be one tap from `sunnah.com`. The `url` is that tap.
- **`verified` is separate from `review`.** `review` records the *verdict*; `verified` records whether the *check happened at all*. A unit can legitimately be `review: 'ok'` with `verified: false` **only** in draft files that are not playable. Collapsing the two is how a draft silently becomes content.
- **`related` reuses the existing field name.** `nour-english.js` already carries `related` pointing each English unit at the Arabic unit telling the same story. This plan does not invent a field — it makes the existing one **mandatory** for م٣.
- **`rank` is a string (`m1`…`m4`), not an integer.** So that a future rank added between م٢ and م٣ does not require renumbering every unit in the curriculum. This is the same reasoning that made `SCHEMA_VERSION` a chain rather than a number comparison in `gamify.js`.

### 5.5 دورة المراجعة (The review cycle for a sanad)

Extending `CONTENT-REVIEW.md`, which already records a source, a status and a note per story:

1. **التوليد (Propose).** A unit is written with `rank`, a candidate `ref` and `url`, and `review: 'pending'`, `verified: false`. **It is not playable.** The app cannot show it to a child even if a screen renders it — the playability predicate is one function ([§13](#13-نموذج-البيانات-the-data-model)), and it returns `false`.
2. **المقابلة (Match).** The reference is matched against `api.quran.com` (Uthmani text) or `sunnah.com` (Darussalam numbering), exactly as the sibling plan already did for the two letter books. **For م١ and م٢ the quoted words are matched character-for-character**, and the record says what was matched — this is the existing convention, e.g. *«اللفظان مطابقان»* with the reason.
3. **الفحص الشرعي (Doctrinal check).** Five things, applied to every rank:
   - ﷺ after the Prophet's name; رضي الله عنه/عنها for a companion.
   - No description of a person's form, and no depiction — ever (`لا تجسيد`).
   - The age rule: **no fighting, no frightening death, no description of punishment**, and safely distanced from any painful scene (this rule already exists in `CONTENT-REVIEW.md` for ages 4–6; **K–5 requires it be re-read per band, see [§7.6](#76-نشر-المراجعة-على-النطاقات-review-scope-by-band)**).
   - **تدبّر vs إعجاز** ([§6](#6-القواعد-الأربع-التي-لا-تُكسر-the-four-guards) guard 2).
   - For م٣: the `related` target exists, is itself م١/م٢, and actually carries the meaning claimed.
4. **القيد (Record).** `review: 'ok' | 'note'` and `verified: true`, plus one line saying *what was checked*. A `note` is not a failure — the existing review file records notes like *"وحُذف الرقمان السابقان (أبو داود ١٤٢٥ وابن ماجه ٩٧٥) لعدم مطابقتهما"* — a correction recorded is better than a silence.
5. **الصوت (Voice), last.** Only after step 4 does a unit become eligible for recording. The sibling plan's rule is unchanged: **no audio before the review record.**

### 5.6 الحالات الحدّية (Edge cases, decided here rather than discovered later)

| Case | Decision | Why |
|---|---|---|
| A unit where the text exists but is too adult for K–2 | **Same sanad, softer band.** The unit keeps م١ and the *story* is written at the band's level; the rank does not change. | Downgrading the rank would lose a real text; changing the story is what the bands are *for*. |
| A unit with two candidate sources, one weak | **Record both; ship the stronger.** The sibling plan already does this for the ف companion story (Anas ibn Malik chosen; Sa'd «فِدَاء» kept as the unused alternative). | Keeps the research visible without splitting the child's experience. |
| A unit that is Islamic in *origin* but neutral in *content* (e.g. a short-vowel drill) | **It is م٣ and must link.** | This is the exact case that becomes "decoration" if left unfenced. Linking costs one field. |
| A hadith whose *wording* is fine but whose numbering differs by edition | **Ship with `review: 'note'`, recording the edition.** The sibling plan already lists "matching the hadith numbers to the printed edition the family uses" as an open item. | The child's text is unaffected; the parent's ability to check is what matters. |
| A science unit where the observation is currently contested | **It becomes م٣ (value), not م٤ (sign)** — or it is dropped. | A sign must be a sign. Observation of a *contested* claim is not تدبّر; it is a bet. |
| A unit in the Quran garden itself (juz 58–114) | **Out of scope for this plan.** The Quran is the Spring; it is not subject to the sanad rule because it *is* the sanad. | Stated explicitly so nobody "applies" a rule to the axis and turns the Qur'an into a citation. |

---

## 6. القواعد الأربع التي لا تُكسر (The four guards)

Four prohibitions. Each has a rationale, a concrete violation it prevents, and a way it is enforced. Together they are what turn [§5](#5-قاعدة-المركزية--مراتب-السند-the-centrality-rule) from a schema into a curriculum.

### 6.1 🔒 القاعدة الأولى: لا وحدة بلا سند

> **No unit enters a stream without a sanad.**

- **Prevents:** content drifting into the app because it *fits a gap in a sequence* rather than because it belongs in this curriculum. This is the failure mode of every large educational app: units accumulate by slot-filling, and nobody can later say why any particular one is there.
- **Enforced:** `validateAnchor(unit)` returns the list of problems; `playableUnits()` filters on it. A unit with `anchor: undefined`, an unknown rank, a م٣ with no live `related`, or a م٤ with no `ref` **cannot become playable**, whatever the UI does.
- **Honest note on the existing content:** the ⇢ ~56 live units (8 letters, 24 sounds, 20 numbers, and the 4 pilot units) **predate this rule and do not carry it.** This plan does **not** grandfather them silently. It records the debt explicitly: they are counted, the count is a **ratchet that may only fall**, and each later phase pays down part of it ([§15](#15-المراحل-phases)). A rule that starts by exempting its largest body of content is not a rule.

### 6.2 🔒 القاعدة الثانية: لا إعجاز بلا تفسير

> **We teach تدبّر. We never assert إعجاز علمي without a cited tafsir.**

- **Prevents:** the app ageing badly — and more seriously, putting claims in the Qur'an's mouth that a scholar would not sign. `fikr-dashboard`'s academic honesty ("the document stays the source of truth"; a queryable projection *alongside* it rather than replacing it) is the same instinct applied to content.
- **The test that distinguishes them, applied to every م٤ unit:**
  1. Does the unit ask the child to **look at something**? → تدبّر. ✅
  2. Does it claim the text **told us a fact science later found**? → إعجاز. **Needs a cited tafsir, or it does not ship.**
  3. Does it work if the science changes? تدبّر survives (*look at the camel*); إعجاز often does not.
- **Why this belongs in a plan ostensibly about **curriculum organisation**: it is the rule most likely to be violated by enthusiasm rather than by error, and enthusiasm is not catchable in review unless the rule is written down before the writing starts.

### 6.3 🔒 القاعدة الثالثة: لا نصّ محرَّف

> **Every «» quotation is matched character-for-character against the Uthmani text or `sunnah.com` in the review record.**

- **Prevents:** the slow accumulation of near-quotes — a word dropped, a vowel altered, a phrase paraphrased into a «» pair — which is the most corrosive failure in religious educational material precisely because it is invisible.
- **Enforced:** the existing convention, extended. `nour-letters.js` already records notes such as *«اللفظ بين «» مطابق للرواية»* and records deletions when a reference did not match. K–5 makes this **mandatory for every م١ and م٢ unit**, not optional for the diligent.
- **A second, mechanical enforcement:** **the plan and its scope files carry references, never quotations.** A check reads the science scope file and fails if Quranic text appears in it ([§13](#13-نموذج-البيانات-the-data-model)). This makes "we do not write before we match" a property of the file, not a promise.

### 6.4 🔒 القاعدة الرابعة: لا تجسيد

> **No prophet, companion, or angel is ever depicted.**

- Already written in `PLAN-ISLAMIC-PHONICS.md` §8.2 and approved as decision 3 (*«Approved as written»*). It is restated here because **Science is where it is most likely to be broken by accident** — a science garden naturally reaches for illustration, and a scene of the ark (هود) or of Sulaiman with the ants (− an-Naml) will tempt a designer. The rule for art is the existing one: **we show the ant, the ark, the palm, the sea, the birds, the stars, the camel — never a person who is a prophet or a companion.**
- The existing review records show this rule already operating in practice: *«ولا وصف للمَلَك ولا صورة لأي إنسان»*, *«لا صورة للنبي ﷺ — وصف لا تصوير»*. K–5 inherits it unchanged and re-asserts it for the new stream.

### 6.5 ملخّص (The guards in one table)

| # | Guard | Protects against | Enforced by |
|---|---|---|---|
| 1 | لا وحدة بلا سند | Drift, slot-filling, "it fitted the sequence" | `validateAnchor` · playability predicate · a falling debt ratchet |
| 2 | لا إعجاز بلا تفسير | Overclaiming; ageing badly; putting words in the text | A three-question test per م٤ unit |
| 3 | لا نصّ محرَّف | Invisible near-quotes | Character-for-character matching, recorded; no quotation in scope files |
| 4 | لا تجسيد | Depiction, especially in the new science art | The existing approved rule, restated and re-checked per asset |

---

## 7. النطاقات الثلاثة (The three bands)

### 7.1 القرار الأساسي (The core decision)

**A band is a depth target and a reading load. It is not a lock, not a grade, and not a level.**

Three bands, overlapping deliberately at grade 2 and grade 4, using **the same names and the same boundaries `fikr-dashboard` already uses** (`docs/ux-review-2026-09-28.md` states the standing rule: *"every grade band (K–2 · 2–4 · 4–6) stays in the catalogue"*). This is not a convenience — it is what makes the two applications able to talk about the same child.

### 7.2 المواصفات الكاملة (Full specification)

| | **النطاق ١** | **النطاق ٢** | **النطاق ٣** |
|---|---|---|---|
| **id** | `k2` | `2-4` | `4-6` |
| **Name (ar)** | نِطَاق ١ · التأسيس | نِطَاق ٢ · البناء | نِطَاق ٣ · التوسّع |
| **Grades** | K · 1 · 2 | 2 · 3 · 4 | 4 · 5 · 6 |
| **Ages** | 5–7 | 7–10 | 9–12 |
| **Session length** | 5–8 items · **~10 min** (today's) | 6–9 items · **~15 min** | 8–12 items · **~20 min** |
| **New units per day** | 2 per garden (today's `DAILY_NEW_CAP`) | 3 | 3 + one composition task |
| **Reading load** | a word and a picture | a sentence, then a paragraph | a passage, then a table or a diagram |
| **Language** | Arabic, spoken-first, **zero print** | Arabic by default; the English stream in English | Arabic and English; subject register introduced |
| **"I can…" objective** | «أنا أسمع الصوت» | «أنا أقرأ الكلمة» | «أنا أشرح لماذا» |
| **Engine tier** | tap-only: hunt · trace · train · boxes · memory · sorting | + matching · odd-one-out · scramble · cloze · Venn · timeline | + model+keypad · maze · number-maze · speed-tap |
| **Assessment shape** | the day is finished | the station trial (⚔) | the trial **+ a production** (told or written) |
| **The deed** | one action, **with an adult** | one action, **alone** | one action, **for someone else** |
| **Parent report says** | did they finish the day | station mastery (متقن / يتعلّم / يحتاج مساعدة) | + the production + the reasoning |
| **Badge weight** | first taste | mastery | service |

### 7.3 لغات الهدف (The three "I can…" sentences — why they are specific)

`fikr-dashboard` puts an **"I can…" objective** on every lesson door. This plan adopts it and makes it **band-defining**, because the honest difference between a 6-year-old and a 10-year-old is not *more content*, it is **what counts as knowing**:

- **النطاق ١ — «أنا أسمع الصوت»** — the child's evidence of learning is *recognition*. Producing output is not required and not assessed.
- **النطاق ٢ — «أنا أقرأ الكلمة»** — the evidence is *use*: they take the symbol and get meaning out of it.
- **النطاق ٣ — «أنا أشرح لماذا»** — the evidence is *reasoning*: they can justify, connect and apply. This is also where the production task enters, matching the teacher's side (production pathways A and B, the STEAM commission).

### 7.4 التقاطع، ولماذا هو الميزة لا العيب (The overlap — why it is the feature)

| Grade | Bands available | Default |
|---|---|---|
| K | `k2` | `k2` |
| 1 | `k2` | `k2` |
| 2 | **`k2` · `2-4`** | `2-4` |
| 3 | `2-4` | `2-4` |
| 4 | **`2-4` · `4-6`** | `4-6` |
| 5 | `4-6` | `4-6` |
| 6 | `4-6` | `4-6` (on-ramp, outside the K–5 promise) |

**The default is the deeper of the two available**, because **a band is a floor, not a ceiling**: a child may always draw from a *later* band inside the same stream, and is never pushed *back*. This is the only reading of the band model consistent with the repository's own rule — *"لا توجد مؤقتات ولا لوحات متصدّرين ولا عقوبة على الخطأ"*. Grade gates would create exactly the failure the app was built to avoid: a child who is behind is told so.

### 7.5 كيف يُختار النطاق ويُغيَّر (How a band is chosen and changed)

| Question | Answer |
|---|---|
| Where does the band live? | With the child's profile, beside the existing `stats` and `parent` fields — **not** derived from the clock or the session. |
| What is the default? | Age-derived: the deeper of the bands available for the child's grade. |
| Who can change it? | **The parent**, in ولي الأمر (and the teacher's side, if the bridge is ever used for placement). Never the child, never automatically. |
| Can a child be in different bands per stream? | **Yes — and this is expected.** A child may read at `4-6` in Arabic and work at `2-4` in English. The app records per-stream placement. |
| Does the report imply a deficit? | **No.** The report states the band the child is *working in* per stream, as a fact, and never as a comparison to grade. This is a hard requirement on the copy, not a style preference — and it is the reason [§12.3](#123-تقرير-ولي-الأمر-the-parent-report) specifies the report as a per-stream column rather than a single number. |
| What happens at a boundary? | Nothing. There is no transition event, no promotion, no ceremony. The band changes only when a parent changes it. |

### 7.6 نشر المراجعة على النطاقات (Review scope by band)

The existing age rule in `CONTENT-REVIEW.md` is specific to **ages 4–6**: *"لا قتال، لا موت مفزع، لا وصف عذاب، والفكرة تُفهم بجملة واحدة، ومسافة آمنة عن كل مشهد مؤلم"*. **K–5 breaks this rule's assumption** and the plan addresses it explicitly rather than letting each author improvise:

| Band | Content scope | Still forbidden, always |
|---|---|---|
| `k2` | As today. The idea is understood in one sentence; a safe distance from every painful scene. | Fighting · frightening death · description of punishment · depiction · anything needing explanation before it can be understood |
| `2-4` | A **story with a cause**: why it happened, what it led to. Two to three panels. Death may be *mentioned* as the end of a life, **never depicted, never described as a scene**, and never the climax. | Depiction · graphic detail · anything a child would need to unsee |
| `4-6` | **Context and consequence**, including difficult history where the lesson is the *lesson* (e.g. patience under persecution) — still at the safe distance, still told, never shown. | Depiction · gratuitous detail · horror as emphasis |

**The rule for the reviewer, in one line:** *the band changes how much a child is told; it never changes what a child is shown.* Depiction is forbidden at every band and at every age, without exception.

### 7.7 ما لا تفعله النطاقات (What the bands are not)

- **Not a scoring system.** No band is "higher" in value; they are different depths of the *same* stream.
- **Not automatic.** Nothing in the app promotes or demotes a child on completion.
- **Not a substitute for the child gate.** A band is a design target for content; whether it *works* is answered by watching a child ([§15](#15-المراحل-phases), P9).
- **Not visible as a rank to the child.** The child sees a deeper bed of the same stream, not a label. Copy rules for the child-facing screens are specified in [§12.2](#122-ما-يراه-الطفل-what-the-child-sees).

---

## 8. المجاري الأربعة، مجرى مجرى (The four streams, band by band)

Each subsection follows the same shape: **what exists** (with its status marker), **what is next**, **the sanad examples**, and **the one thing that makes this stream worth building**. The K–2 column is largely ✅ — that is the point of the plan, and the reason it is affordable.

### 8.1 مجرى العربية — «حروف النور» → القراءة والقواعد

**The road:** the 28 letters in 7 phonics groups (stations 1–7) → the harakat layer (stations 8–10) → real words and sentences → Quranic vocabulary → nahw and writing.

#### 8.1.1 النطاق ١ · K–2 — the letter layer

| Station | Letters | A child can read at the end | Status |
|---|---|---|---|
| 1 · غابة البداية | ا · ب · م · د | بابا · ماما · باب · دُبّ · دَم | 🟡 **4 of 4 live** — أ ب in `nour.js`, د م in the pilot |
| 2 · مزرعة النخيل | ت · ن · ل · ر | تَمْر · نار · لَبَن · بِنْت · رَمْل · دار | 🟡 ت live (`nour-letters.js`) |
| 3 · سوق المدينة | س · ي · و · ك | سَمَك · بَيْت · وَلَد · كَلْب · يَد · سُوق | ⬜ |
| 4 · واحة القمر | ف · ق · ع · ج | فِيل · قَلَم · قَمَر · جَمَل · عَيْن · فَم | 🟡 ج live |
| 5 · خيمة الهدايا | ح · خ · هـ · ش | حَبْل · خَيْمَة · هَدِيَّة · شَمْس · شَجَرَة | 🟡 ح live |
| 6 · جبل النور | ص · ط · ز · ذ | صَلاة · طَيْر · زَيْت · ذِئْب | ⬜ |
| 7 · قمة النجوم | ض · ظ · غ · ث | ضَحِك · ظِلّ · غُصْن · ثَوْب | 🟡 ث live |
| 8 · أرجوحة الحركات | fatha / kasra / damma / sukun | بَ بِ بُ بْ for every letter learned | ⬜ |
| 9 · قطار المدّ | ا و ي long vowels · tanween | بَا بُو بِي · كِتَابٌ | ⬜ |
| 10 · بيت الكلمات | shadda · ال (sun & moon) · positions · special words | الشَّمْس · القَمَر · الله · هذا | ⬜ |

**Progress: 8 of 28 letters live.** The remaining 20 are letters, not a new system — `LETTER_UNITS` takes a batch and the order is derived (`LETTER_SEQUENCE`, `byLetter`), so **P3/P4 batches land without touching the ordering logic**. This is the single clearest example in the repo of "the architecture is already there."

#### 8.1.2 النطاق ٢ · 2–4 — the reading layer

**The insight that makes this cheap: the app has been serving band 2–4 for a long time without naming it.** **جسر المعاني (the Bridge)** — 50 Quranic words across 10 trips and 4 rounds — and **كلماتي (my words)** are *precisely* a 2–4 reading programme: a real word, its meaning in child language, its recitation, and its source link to `quran.com`.

| Band 2–4 works on | Existing assets it reuses | What is genuinely new |
|---|---|---|
| Real words → phrases → sentences | **جسر المعاني** (50 words, all sourced) · **كلماتي** | A **graded reader** built from the 50 bridge words: the child meets the same words they already know in connected text. This is the cheapest high-value content in the whole plan, because the vocabulary, the audio and the review record already exist. |
| Handwriting → dictation | the `TracePad` engine, the letter forms | A dictation set: hear the word, write it. The engine exists; the sequencing is new. |
| المفرد والجمع · المذكر والمؤنث · أل التعريف | the Quran text itself (`juz28-29.js`, `juz30.js`, embedded offline) | Micro-lessons whose examples are **real ayat the child is already hearing** — `SURAH_META` and the embedded text make this free of new sources. |
| Reading juz 28–30 independently | `Listening.jsx` (58 surahs, 1132 ayat), the player, the memorisation controls | A "read it yourself" mode beside the existing "listen" mode. |

#### 8.1.3 النطاق ٣ · 4–6 — the language layer

| Works on | Anchored to | Notes |
|---|---|---|
| نحو وصرف: الأفعال الثلاثة، الإعراب المبسط، الهمزات | الأمثلة كلها من الآيات المدمجة | Grammar taught on text the child already knows by heart — the classical method, and the one the app is uniquely positioned to support |
| إملاء · تعبير (a told paragraph) · خط نسخ ثم رقعة | — | The production task enters here ([§7.2](#72-المواصفات-الكاملة-full-specification)) |
| Comprehension of a short surah + a hadith text | Tafsir-aligned summaries | Reuses the existing `url`-per-story convention so a parent can check |

#### 8.1.4 السند في هذا المجرى (The sanad in this stream)

- **K–2:** each letter carries **two** stories already — a Prophet ﷺ story and a companion story (56 stories exist). These are **م٢**. The rank is assigned **at the unit**, which is what the existing letters *lack*.
- **2–4:** the 50 bridge words are **م٢** (each has an ayah behind it). The graded reader inherits those ranks.
- **4–6:** quoted texts are **م١**; the grammar examples are **م٣ → linked** to the ayat they are drawn from.

---

### 8.2 مجرى الإنجليزية — «Letters of Light» → الفهم والكتابة

**The road:** 42 sounds in 7 groups → blending and word reading → the Islamic register → comprehension and guided writing.

#### 8.2.1 النطاق ١ · K–2 — the sound layer

| Group | Sounds | Status |
|---|---|---|
| 1 | s · a · t · i · p · n | ✅ complete |
| 2 | c k · e · h · r · m · d | ✅ complete |
| 3 | g · o · u · l · f · b | ✅ complete |
| 4 | ai · j · oa · ie · ee · or | ✅ complete |
| 5 | z · w · ng · v · oo · oo | ⬜ |
| 6 | y · x · ch · sh · th · th | ⬜ |
| 7 | qu · ou · oi · ue · er · ar | ⬜ |

**24 of 42 sounds live**, each with a **Quran story told in English** and each carrying `related` back to its Arabic twin. That bridge is the plan's model and the reason [§6.1](#61--القاعدة-الأولى-لا-وحدة-بلا-سند) makes `related` mandatory rather than nice.

- **Tricky words** (band 1, later half): *I · the · he · she · me · we · be · was · to · do · are · all* — taught as picture words, per the sibling plan.
- **The 25 existing phonics stories** stay as *extra reading* for blending practice (sibling plan decision 6) — they are not retired, they are re-filed.

#### 8.2.2 النطاق ٢ · 2–4 — the reading layer

| Works on | The Islamic register (this is what makes it *this* curriculum) |
|---|---|
| CVC → CVCe → blends → digraphs | **A working vocabulary of Islamic life in English**: masjid · salah · wudu · imam · adhan · Ramadan · dua · sadaqah · alhamdulillah |
| ~100 sight words | **The register of address**: how a Muslim *says* things in English — greeting, thanking, asking permission, congratulating |
| Simple sentences; speaking & listening | The child can describe their own day in English using words from their own religion — the most direct route to English feeling *theirs* rather than foreign |

#### 8.2.3 النطاق ٣ · 4–6 — the writing layer

| Works on | Notes |
|---|---|
| Grammar: nouns, verbs, tenses, pronouns | Taught on the English Quran stories already in `nour-english.js` |
| Guided writing (3–5 sentences) | The production task for this stream |
| Reading comprehension | On the Qur'an and prophet stories in English |
| **«ﷺ» → "peace be upon him"** taught *explicitly* | A small thing with large consequences: a Muslim child writing English needs to know how their religious register is *written*, not only spoken |

#### 8.2.4 السند في هذا المجرى (The sanad in this stream) — the honest problem, answered

**42 phonemes cannot each own an ayah.** This is stated plainly because pretending otherwise is how this subject becomes dishonest. The resolution is the rank system:

- Sounds with a natural narrative → **م٢** (e.g. `/or/` → Yusuf's dream, `يوسف ٤٣–٤٧`).
- Sounds with no natural text → **م٣ with a mandatory `related`** back to the Arabic unit carrying the same meaning (the existing convention: *«كل وحدة إنجليزية تحمل `related` تشير إلى وحدة عربية بنفس القصة أو بنفس المعنى»*).
- The **vocabulary** layer (2–4) is where this stream pays the sanad back: *masjid*, *adhan*, *sadaqah* are **م١/م٢** words — the child learns an English word that *is* a Quranic word.

**The rule that keeps it honest:** a م٣ unit is never a terminal node ([§5.6](#56-الحالات-الحدّية-edge-cases-decided-here-rather-than-discovered-later)). The English stream is anchored to the Arabic one at the level of *meaning*, and a test walks the chain.

---

### 8.3 مجرى الرياضيات — «أرقام النور» → الحساب والأنصبة

**The road:** numbers 1–20 as 20 full days → place value and operations → the multiplication tables → **the shares (الأنصبة)** → percent and ratio.

#### 8.3.1 النطاق ١ · K–2

| Station | Content | Status |
|---|---|---|
| 1 | ١–٤ | ✅ 4 full days |
| 2 | ٥–٨ | ✅ 4 full days |
| 3 | ٩–١٢ | ✅ 4 full days |
| 4 | ١٣–٢٠ (original counting stories) | ✅ 8 full days |
| 5 | bigger / smaller · comparing | ⬜ (P6b) |
| 6 | bonds to ten · fair sharing | ⬜ (P6b) |
| 7 | shapes and patterns in the masjid: the dome, the arch, the minaret, geometric pattern | ⬜ (P6b) |

**20 of 20 numbers are live as complete seven-step days** — the most complete stream in the app. The pending audio (32 clips for ٥–٢٠, currently on device TTS) is a recording task, not a build task, and TTS is the intended fallback rather than a defect.

#### 8.3.2 النطاق ٢ · 2–4 — and the two anchors that justify this whole stream

| Works on | Notes |
|---|---|
| To 1000 · place value · +/− with carrying | Reuses the count objects and the 16 math scenes |
| Multiplication tables | Anchored to the numbers the tradition actually uses: **٥ · ٧ · ١٢ · ٣٠ · ٤٠** |
| Halves and quarters | **The Shares (الأنصبة) — `النساء ١١–١٢`** |

**The Shares (الأنصبة) deserve their own paragraph.**

Surah an-Nisa 11–12 distributes inheritance in **halves, thirds, quarters, sixths and eighths** — «نِصْفُ» · «الثُّلُثُ» · «الرُّبُعُ» · «السُّدُسُ» · «الثُّمُنُ». These are **exactly the denominators** the K–5 fraction standard teaches, and the ayah reaches them *before* any curriculum committee did.

The consequence is a design decision, not a footnote: **the fraction unit is built on the shares.** A child who learns ثلث from a pizza learned a fraction and forgot it. A child who learns ثلث as the share of a mother when there are no children, and *then* meets it in fara'id, learned it once, in the place where it matters, and will meet it again as an adult. This is the clearest example in the whole plan of the difference between **decoration** and **source**: the ayah is not illustrating the maths — the maths is serving the ayah.

#### 8.3.3 النطاق ٣ · 4–6

| Works on | Anchored to |
|---|---|
| Fractions ↔ decimals ↔ percent | **الزكاة = ربع العشر = ٢٫٥٪** — the most natural percent lesson in this tradition, and a *calculator exercise with a consequence* |
| Ratio | **مواريث** as worked ratio — the shares again, now as computation |
| Area & perimeter · measurement | A masjid measurement project (the app's own backdrop) |
| Data and graphs | **Already built:** `Listening.jsx` draws an 8-week bar chart of listening minutes. A child can read a graph of their own behaviour — the cheapest real dataset in the app. |

---

### 8.4 مجرى الكون — «آيات الكون» (Science — the new stream)

The fourth stream, and the only one that does not exist. Built exactly like the other three: the same seven-step day, the same review record, the same art rules — with **three of the seven steps relabelled** ([§9.3](#93-الكون-الخطوات-السبع-في-مجرى-العلم-the-seven-steps-in-the-science-stream)), because a sign is examined, not sounded.

#### 8.4.1 المبدأ (The principle)

**The child meets the text first, then looks.** This ordering *is* the pedagogy, and it is what distinguishes this stream from a normal science course with verses attached:

- A conventional lesson: *here is a fact about camels → here is a verse mentioning camels.*
- This lesson: *`الغاشية ١٧` asks: will they not look at the camel, how it was created? → let us look.*

The child is not given a fact and told it is religious. They are given a **question from the Qur'an** and taught to investigate it. That is تدبّر, it is what a five-year-old can genuinely do, and it survives any future change in the science.

#### 8.4.2 المحطات الثمانية (The eight stations)

| Station | Band | Title | The child works on |
|---|---|---|---|
| **sc1** | `k2` | **أنا وعالمي** | the five senses · my body · purification (الطهارة) |
| **sc2** | `k2` | **الماء والسماء** | water and life · rain · the sea |
| **sc3** | `k2` | **الحيوان** | the camel · the bee · the ant · the bird |
| **sc4** | `2-4` | **الأرض والنبات** | the seed · the palm · the seasons |
| **sc5** | `2-4` | **الحركة والقوة** | push and pull · the balance |
| **sc6** | `2-4` | **الضوء والظل** | shadow · night and day |
| **sc7** | `4-6` | **الأرض والسماء** | sun and moon · the stars |
| **sc8** | `4-6` | **البيئة والخلافة** | balance in creation · waste (الإسراف) |

**Three in band 1, three in band 2, two in band 3** — deliberately front-loaded, because the earlier bands are where this stream earns its place (a five-year-old's sense of wonder is the whole asset) and where the app can be honest soonest.

#### 8.4.3 الوحدة النموذجية (A unit, opened up — `sc-camel`)

Written here in full as the **reference unit** every other science unit will be built against. Note what is *not* in it: no quotation, no claim, no fact asserted without a `ref` slot to be matched.

| Part | Content | Status |
|---|---|---|
| **The sign (الأثر)** | الإبل — the camel | — |
| **The door step** | Opens on the ayah, not on the animal: `الغاشية ١٧` asks the child to look | 🔒 ref to be matched |
| **The story step** | The ayah's meaning in child language: *"الله يسألنا: ألا تنظرون إلى الإبل كيف خُلقت؟"* — one sentence, band 1 | 🔒 after review |
| **The card step** | The sign card: what does it carry? What happens when it drinks? How long can it walk? | — |
| **The hunt step** | Tap everything on the camel that helps it live in the desert | — |
| **The trace step** | Trace the camel's outline and label the hump | — |
| **The play step** | One engine from the band-1 tier | — |
| **The deed step (عمل الخلافة)** | *«نرفق بالحيوان ولا نخيفه»* — be gentle with animals, never frighten them | — |
| **The sanad** | `rank: m4`, `ref: 'الغاشية ١٧'`, `url`, `review: pending`, `verified: false` | ⬜ |
| **The guide** | الهدهد | — |

#### 8.4.4 دليل المجرى (The stream's guide) — decision D6

Each stream has a guide: **سلمان · الهدهد · دودة الحرير · السنجاب**. Science needs its own, and the candidate costs nothing because **the art already ships**: the **hoopoe (الهدهد)** — the bird of `النمل ٢٠–٢٨`, who *brought news of a sign* and then inspected it.

The match is not decorative. A science guide should do exactly two things: **notice something and go look at it.** That is the hoopoe in the ayah, and it is why this is a recommendation rather than a preference. The alternative — a new keeper tied to a `fikr-dashboard` gate — costs one sprite and one story, and is a perfectly reasonable answer if you prefer the two apps to share a keeper.

#### 8.4.5 السند في هذا المجرى (The sanad in this stream)

- **Every unit is `m4` except two classes of exception:**
  - **`m1`** where the unit *is* a text — e.g. **الطهارة**, built on «الطُّهورُ شطرُ الإيمان» (`مسلم ٢٢٣`).
  - **`m2`** where the unit retells a narrative — e.g. **النمل**, the story of `النمل ١٨–١٩`.
- **م٤ requires an ayah** ([§6.1](#61--القاعدة-الأولى-لا-وحدة-بلا-سند)). An ayah-less science unit is *invalid*, and this is the structural defence against "science + Islam" pairing.
- **The table in [Appendix C](#appendix-c--جدول-آيات-الكون-مسوّدة-نطاق) is a scope draft**, and every reference in it must be matched before a word is written. The first act of the science phase is **the review, not the writing**.

#### 8.4.6 ما لا يفعله هذا المجرى (What this stream will not do)

- **It will not claim إعجاز** without a cited tafsir (guard 2).
- **It will not depict** a prophet, a companion or an angel (guard 4) — so the ark of Nuh is shown as *an ark*, the parting of the sea as *the sea*, the ants as *ants*.
- **It will not become a fifth "religion" subject.** It is science, taught under a Qur'anic lens.
- **It will not teach a contested claim as a sign** ([§5.6](#56-الحالات-الحدّية-edge-cases-decided-here-rather-than-discovered-later)).
- **It will not be built before the review record exists** — it ships dark ([§13.4](#134-البوابة-الواحدة-the-single-gate-to-the-child)).

---

## 9. اليوم السباعي (The seven-step day)

The day is the approved unit from `PLAN-ISLAMIC-PHONICS.md` §4: **one unit, one sitting, seven steps, ten minutes.** This section specifies it as an implementation and defines the science variant. **Nothing here is new for the three existing streams** — it is documented because K–5 needs the day's *state*, *timings* and *data shape* written down once, and because the science variant must be a relabelling, not a second method.

### 9.1 الخطوات (The seven steps)

| # | Step | Arabic | Min | What happens | Engine | Data it writes |
|---|---|---|---|---|---|---|
| 1 | door | باب القصة 📖 | 1 | The guide opens a storybook; scene 1 appears with sound and a gentle pan | `StoryScene` | `steps: ['door']` |
| 2 | story | القصة 🗣️ | 2 | A child version (60–90 words, full tashkeel); the key word glows when said; three panels turn like pages | `StoryScene` | `steps: [...,'story']` |
| 3 | sound | الصوت والحركة 🎵 | 1 | «هذا صوت بَ … بَ بَ بَ» — the mascot does the action, the child copies; a two-line chant, **voice only** | `say()` / clip | `steps: [...,'sound']` |
| 4 | hunt | صيد الصوت 🔍 | 1 | Tap everything in the scene that starts with the sound; a wrong tap gives a soft "try again" — **never a penalty** | `Hunt` | `steps: [...,'hunt']` |
| 5 | trace | التتبّع ✏️ | 2 | Trace the letter body then the dots; three times big, once small | `TracePad` | `steps: [...,'trace']` |
| 6 | play | اللعب 🎮 | 2 | One mini-game from the band's tier, rotating daily | `OrderGame` | `steps: [...,'play']` |
| 7 | deed | عمل اليوم 💚 | 1 | One action; the parent ticks it in parent mode; earns ⭐ and grows a flower | — | `recordDayStep` |

**Day 2** of each unit is the **companion story** — same steps, different scene and game. **Review days** mix learned units: sound hunt, blending, sound boxes.

### 9.2 آلة الحالة (The day as a state machine)

The day's persistence is already correct in the repo and is restated here because it is a *rule*, not an implementation detail:

- `recordDayStep({unitId, dayKey, steps})` — progress is written **per step**, so a child who stops mid-day loses nothing.
- `unitCompleted(state, unitId)` — completion is derived, never a flag.
- `dayProgress(done)` / `nextStep(done)` — the UI asks these, never its own counters.
- **A step is never scored.** Steps record *that they happened*; stars are awarded per completed unit (`recordDay`), which is what keeps the app's no-punishment rule true at the data layer and not merely in the copy.

### 9.3 الكون: الخطوات السبع في مجرى العلم (The seven steps in the science stream)

The **only** structural concession in this plan: **three labels move, the skeleton does not.** Implemented as a per-stream label override, so there is no second method and no second screen.

| # | All three existing streams | **Science says** | Why |
|---|---|---|---|
| 1 | باب القصة | **باب الآية** | the ayah opens the door |
| 2 | القصة | **الآية والمعنى** | the text, then its meaning in child words |
| 3 | الصوت والحركة | **البطاقة والتدبّر** | there is no phoneme to sound; there is a sign card and a question |
| 4 | صيد الصوت | **صيد الأثر** | unchanged mechanic, the same `Hunt` engine |
| 5 | التتبّع | **تتبّع الرسم** | the same `TracePad`, tracing a labelled diagram |
| 6 | اللعب | اللعب | identical |
| 7 | عمل اليوم | **عمل الخلافة** | stewardship: plant, save, care, share |

**Cost:** one label object per stream. **New screens: zero.**

### 9.4 التوقيت (Timing by band)

| Band | Day length | Steps affected |
|---|---|---|
| `k2` | ~10 min | as specified above (today's) |
| `2-4` | ~15 min | steps 2 and 5 lengthen (a paragraph; a word rather than a glyph) |
| `4-6` | ~20 min | steps 2, 5 lengthen, and **step 7 gains the production task** (a told or written output) |

**Timings are design targets, not timers.** The app runs no clock on the child ([§7.1](#71-القرار-الأساسي-the-core-decision)) — the table exists so that content authors know how much text a step can hold.

---

## 10. الفنّ والصوت — Reuse first, and the budget is a gate

Inherited wholesale from `PLAN-ISLAMIC-PHONICS.md` §8.1, extended for the new stream. The repo's own principle: *the new work is composition and ~20 sprites, not a rebuild.*

### 10.1 المخزون القابل لإعادة الاستخدام (The reusable inventory)

| Asset class | Count | Location | Reused by |
|---|---|---|---|
| Garden backgrounds | 4 | `public/salman/art/bg-*.jpg` | every station screen of all four streams |
| Gate banners | 3 | `public/assets/gate-*.jpg` | station and list headers |
| Trip scenes | 10 | `public/assets/trip-*.jpg` | the scenery layer of Arabic and English story scenes |
| Tafa cards | 4 | `public/assets/tafa-*.jpg` | weekly reflection cards |
| Screen backgrounds | 7 | `public/assets/bg-*.jpg` | home, bridge, words, badges, map, settings |
| Animal sprites | 28 | `public/salman/art/animals/` | letter match games |
| Math scenes | 16 | `public/salman/art/stories/` | station 4 and review days |
| Count objects | 5 | `public/salman/art/count/` | every counting unit |
| Hero poses | ~10 | `public/assets/hero-*`, decor | celebrations, the garden scene |
| Growth stages | 5 | `public/salman/art/growth-*.png` | per-garden progress |

### 10.2 الجديد، وبأقلّ ما يمكن (The new, and as little as possible)

| New asset | Count | Band | Budget |
|---|---|---|---|
| One sprite per science station scene | **8** at the very most | by station | — |
| Sign cards for band 1 science units | reuses the 8 above where possible | `k2` | **≤ 200 KB total** |
| The science guide (if D6 = a new keeper) | 1 | — | ~15 KB |
| A labelled diagram per band-2/3 science unit | ⬜ to be assessed at P11 | `2-4` · `4-6` | inside the same budget |

**The budget is a gate, not a note.** The repo already treats byte size as a verification step (the sibling plan: *"check the byte budget in the same pass"*; `salman-precache-check.mjs` exists for exactly this). The precache is already large, so the science phase must land **inside** its stated budget or the art is cut back — the station sprites are the first thing to reduce, since a shared sign card can serve two units.

### 10.3 الصوت (Audio)

| Rule | Source |
|---|---|
| **Chants are voice-only. No instruments. Clapping allowed.** | Sibling plan, decision 2 |
| **Nothing is voiced before its review record exists.** | `CONTENT-REVIEW.md` |
| **Device TTS is a legitimate fallback, not a defect.** | `nour-numbers.js` runs ٥–٢٠ unvoiced today |
| **The English voice is still unauditioned.** | Sibling plan §9 — **this blocks the English band-2 layer** ([§15](#15-المراحل-phases) P14), and it is an `add_voice` call, not a build |

**Consequence for sequencing:** the English `2-4` phase cannot start before the voice decision, while the Arabic and Math `2-4` phases can. That is why [§15](#15-المراحل-phases) orders them as it does.

---

## 11. جسر fikr-dashboard — The spine contract

### 11.1 المشكلة (The problem)

`fikr-dashboard` codes a lesson as `semester:lesson` — `1:1-1` — holds it in `js/wadi-data.js`, and seals it as a door. A child's unit is `ar-ت` or `num-3`. **Today those are unrelated strings.** If they stay unrelated, the two apps can never speak about the same child, and any future joining becomes a migration.

### 11.2 العقد (The contract): one exported artifact

```
docs/salmans-garden/content/stream-spine.json     ← generated from the child's app data
```

**The field mapping:**

| Spine field | Source (child's side) | Consumed by (teacher's side) |
|---|---|---|
| `stream` | `arabic` · `math` · `english` · `science` | the subject's World Tour |
| `band` | `k2` · `2-4` · `4-6` | the K–2 · 2–4 · 4–6 catalogue rule |
| `station` | the existing `station` field | a **gate** (1–16) |
| `door` | **new, optional** — the teacher-side code (`1:1-1`) | the door, its game, its seal |
| `unit` | the existing unit id (`ar-ت`) | the story box inside a lesson |
| `anchor` | `{rank, ref, url}` | the lesson's 🏮 Wadi story hook, and its "I can…" |
| `deed` | the existing `unit.deed` | the production pathway / the STEAM commission |
| `guardian` | the garden's `guide` | the **keeper** of the gate |

### 11.3 مثال (A worked example)

```jsonc
{
  "stream": "math",
  "band": "k2",
  "station": "math-1",          // gates 1–16 on the teacher's side; one gate ≈ one station
  "door": null,                 // filled only when a teacher-side lesson actually maps
  "unit": "num-3",
  "title": "العدد ٣",
  "anchor": { "rank": "m1", "ref": "مسلم ٢٠٢٨", "url": "https://sunnah.com/muslim:2028" },
  "deed": "نشرب على ثلاث مرات",
  "guardian": "السنجاب"
}
```

### 11.4 شروط الجسر (The rules that keep the bridge honest)

1. **The spine is generated, never hand-edited** — the repo's existing rule for `stories.generated.js`.
2. **A `door` is optional.** The child's curriculum is complete without any teacher-side code; the spine only *links* where a link genuinely exists. A null `door` is a normal, correct value, not a gap.
3. **Nothing is written into the teacher's saved dashboard** — exactly the rule `fikr-dashboard` already applies to `js/wadi-data.js` (*"It is never written into the teacher's saved dashboard, so edited lessons and older dashboards all get it with no migration"*). The spine is a **read-only lookup** on both sides.
4. **The bridge ships in its own phase (P15) and its own PR.** Neither app is blocked on the other.

### 11.5 الأمانة المشتركة (The shared ethics — already aligned)

The two apps already agree on the values that matter most, and the bridge should say so explicitly because it is the strongest argument that they are one system:

| Value | Child's app (this repo) | Teacher's app (`fikr-dashboard`) |
|---|---|---|
| **No ranking of children** | *"لا توجد مؤقتات ولا لوحات متصدّرين ولا عقوبة على الخطأ"* | The **pebble bowl**: *"it is recognition shared by everyone, never a rank"* |
| **Recognition is collective** | stars, badges, `growth-*.png` per garden | one jar per class; points taken away never remove pebbles |
| **The family can check** | per-story `url` to the source | the parent portal with per-pupil codes and `portal_lookup()` |
| **The same child** | migrated `عمر → سلمان` | *"The explorer is called Salman everywhere"* |
| **Sitr / dignity** | no punishment, no failure state | *"In the spirit of Wadi's Sitr"* |

### 11.6 ما ليس في العقد (What is deliberately not in the contract)

- **No shared runtime**, no API call, no dependency between the repositories.
- **No pupil data flows to the child's app.** Teaching material only. The child's app has no notion of a pupil, a class or a mark, and never will.
- **No coupling of releases.** The spine is regenerated when either side chooses.

---

## 12. المحرّكات واختيار الجلسة والتقارير

### 12.1 محرّكات اللعب (The engine catalogue)

`fikr-dashboard` ships **92 lesson doors** played on a shared kit of **19 hero verbs** — its lesson for this plan is that *a small set of engines plus good content beats many screens*. This repo already assumes exactly that (four engines, one day screen), so the catalogue is an **extension**, never a parallel system.

| Engine | Today | Band 1 | Band 2 | Band 3 |
|---|---|---|---|---|
| `Hunt` | ✅ | tap the target | tap all, with look-alike distractors | tap the **counter-example** and explain |
| `TracePad` | ✅ | the glyph | the word | the labelled diagram |
| `OrderGame · train` | ✅ | two tiles | three–four tiles | word → phrase |
| `OrderGame · boxes` | ✅ | two boxes | three boxes | word → sentence |
| **memory · sorting** | ⬜ | ✅ tap-only | ✅ | ✅ |
| **odd-one-out · matching** | ⬜ | — | ✅ | ✅ |
| **Venn · timeline · cloze** | ⬜ | — | ✅ | ✅ |
| **model + keypad** | ⬜ | — | — | ✅ worked answers (math & science) |

**The rule that keeps it cheap:** every new engine lands **inside `Engines.jsx` and the existing day screen.** **Zero new screens, zero new backgrounds, zero new panels.** Adding an engine means adding a *verb*, not a page — which is precisely how the teacher's side can afford 92 doors and this side can afford eight engines.

**Data-driven, always.** Each engine takes a plain object (`hunt`, `trace`, `train`, `boxes` — the shapes already in `nour.js`) so a content author never touches a component.

### 12.2 ما يراه الطفل (What the child sees)

| Element | Rule |
|---|---|
| **The band** | **Never shown as a label, never as a rank.** The child sees a deeper bed of the same stream, not "level 2". |
| **The station** | Shown as a place on the map (the existing `GardenMap` pattern), with growth art per station |
| **The guide** | Present and speaking, per stream |
| **Stars** | Per completed unit, as today |
| **Failure states** | **None.** A wrong tap gives a soft "try again", as today |
| **Copy for a new band** | Never "harder", never "advanced" — the stream simply continues |

### 12.3 تقرير ولي الأمر (The parent report)

`parent.js` already reports per garden — **متقن / يتعلّم / يحتاج مساعدة / لم تبدأ** — with documented thresholds (مثلاً *«4 عناصر أو أكثر في الصندوق 1 مع أقل من 20% متقن»* = يحتاج مساعدة). K–5 adds exactly **one column**:

| Garden | Band the child works in | Mastery | The deed |
|---|---|---|---|
| العربية | النطاق ٢ · البناء | يتعلّم | ✅ 3 this week |
| الرياضيات | النطاق ١ · التأسيس | متقن | ✅ 5 this week |
| الإنجليزية | النطاق ١ · التأسيس | لم تبدأ | — |
| الكون | — | — | — |

**Copy rules for the report (hard requirements, not style notes):**
- The band is stated **as the bed the child is drawing from**, as a fact.
- **Never** compared to the child's grade. Never "behind", never "ahead".
- A child working in different bands across streams is **normal** and the report must not read as inconsistency.

This is `fikr-dashboard`'s own habit of honest reporting (week-on-week deltas *with* sparklines, absentees dropping out of denominators rather than counting as zeros) applied to the child's side: **report the truth in a shape that cannot humiliate.**

---

## 13. نموذج البيانات (The data model)

### 13.1 الوحدة (A unit — the complete shape)

```jsonc
{
  "id": "sc-camel",              // unique across the whole app
  "band": "k2",                  // k2 | 2-4 | 4-6
  "station": "sc3",              // the station it belongs to
  "stream": "science",           // derived from the garden, stored for the spine
  "sign": "الإبل",               // the created sign (science), or the glyph/keyword (others)
  "signEmoji": "🐪",
  "anchor": {                    // §5 — mandatory, always
    "rank": "m4",
    "ref": "الغاشية ١٧",
    "url": "https://quran.com/88/17",
    "related": null,             // required when rank = m3
    "review": "pending",         // ok | note | pending
    "verified": false            // true only after a CONTENT-REVIEW.md record
  },
  "theme": "…",                  // one sentence, our words — never a quotation
  "deed": { "emoji": "🐾", "text": "…" },
  "review": "pending",
  "voiced": false,
  "door": null                   // §11 — the optional teacher-side lesson code
}
```

**Two shape rules that are enforced, not stylistic:**

1. **Review state is applied structurally.** When the science scope is normalised, `review: 'pending'`, `voiced: false`, `anchor.review: 'pending'` and `anchor.verified: false` are set **at export**, so a newly added unit **cannot** be introduced without being marked unverified, even by forgetting a field. (This is the fix that a first draft of this plan needed — the field was in the prose and not in the data, and a test caught it.)

2. **`band` is declared or derived, never guessed twice.** `bandOfUnit(unit)` returns `unit.band` when it is a valid band, otherwise the stream's declared default (`k2` for today's content). **One function, one answer.**

### 13.2 المجرى والنطاق (A stream and a band)

```jsonc
// stream
{ "id": "science", "name": "مجرى الكون", "method": "آيات الكون",
  "guide": "الهدهد", "axisUse": "التدبّر في آيات الخلق", "live": false }

// band
{ "id": "2-4", "name": "نِطَاق ٢", "ar": "البناء", "en": "2–4",
  "grades": [2,3,4], "ages": [7,10],
  "session": { "min": 6, "max": 9, "minutes": 15 }, "newPerDay": 3,
  "reading": "جملة ثم فقرة", "objective": "أنا أقرأ الكلمة",
  "tier": ["matching","odd","scramble","cloze","venn","timeline"] }
```

### 13.3 العلاقة مع ما هو موجود (How this relates to what exists)

| Existing | Change | Compatibility |
|---|---|---|
| `NOUR_UNITS` / `nour.js` | **No change in the plan phase.** Bands are *derived* for existing units (`bandOfUnit` → `k2`). | Zero content edits; zero migrations |
| `station` field | Reused as-is ([§3](#3-تشريح-المجرى-stream-anatomy) part 4) | No change |
| `GARDEN_ORDER` | **Untouched.** Science is declared but not added until it is live. | A hard invariant: the set of live streams + the axis must equal `GARDEN_ORDER` |
| `nour-english.js` `related` | Becomes **mandatory** for م٣ instead of conventional | Existing links already satisfy it |
| `gamify.js` schema | **No change.** A unit is a skill id in `state.skills` as today. | No migration |
| `parent.js` | One added column ([§12.3](#123-تقرير-ولي-الأمر-the-parent-report)) | Additive |

### 13.4 البوابة الواحدة إلى الطفل (The single gate to the child)

**One predicate decides whether a child can ever see a unit:**

```
playable(unit)  ⇔  unit.anchor exists
                ∧  unit.anchor.rank is one of the four
                ∧  the rank's requirements are met (ref for m1/m2/m4 · live `related` for m3)
                ∧  unit.anchor.review ≠ 'pending'
                ∧  unit.anchor.verified === true
```

**Every screen asks this predicate. No screen asks anything else.** That is what makes [§6](#6-القواعد-الأربع-التي-لا-تُكسر-the-four-guards) enforceable rather than advisory — and it is why the science stream, whose units are all `verified: false`, returns an **empty playable list** and therefore cannot reach a child even if a route renders it by mistake.

---

## 14. القرارات المطلوبة (The eight decisions)

| # | Decision | My recommendation | Cost if approved | Cost if rejected |
|---|---|---|---|---|
| **D1** | **The band model itself**: three overlapping bands (K–2 · 2–4 · 4–6) as **depth targets, never locks** | **Approve.** It reuses `fikr-dashboard`'s exact vocabulary, and overlap is what the repo's no-punishment rule already implies. | The work in §7 and a `band` field | The alternative is six hard grades, which reintroduces gating and needs a data migration for every existing child |
| **D2** | **Science as the fourth stream**, Quran-anchored from its first word (mostly م٤) | **Approve**, starting with **one station** (P11), not eight | One stream's worth of scope, art ≤ 200 KB, one guide | "K–5 in the main subjects" becomes three subjects, not four — and the most natural fit for م٤ is lost |
| **D3** | **The four ranks** (م١ نصّ · م٢ قصّة · م٣ معنًى · م٤ أثر) and **the four guards** (§6) | **Approve.** These are what make "Islam is central" testable instead of aspirational. | One field per unit; a review pass over time | Centrality remains a claim; the app's sourcing stays uneven (stories sourced, units not) |
| **D4** | **لا إعجاز بلا تفسير** — تدبّر yes; إعجاز only with a cited tafsir | **Approve in full.** It is the difference between content that ages well and content that dates. | A three-question test per م٤ unit | Science units may assert claims nobody can defend later |
| **D5** | Place **الكون next to القرآن** in the daily visit order | **Approve, but only once the science station is live.** This is the one change a child feels immediately. | One line in the session order | The order stays العربية · الرياضيات · القرآن · الإنجليزية |
| **D6** | The science stream's guide | **The hoopoe (الهدهد)** — the bird of `النمل ٢٠–٢٨` who brought news of a sign and inspected it. **Its art already ships.** | Nothing | One new keeper sprite + one story |
| **D7** | The creation-ayah table ([Appendix C](#appendix-c--جدول-آيات-الكون-مسوّدة-نطاق)) is a **scope draft**, and P11's first act is the review record — not the writing | **Approve as draft.** | A verification pass before writing | Unverified references reaching a child, which the repo already forbids |
| **D8** | The `fikr-dashboard` bridge (§11) ships as **its own phase (P15) and its own PR** | **Approve.** Neither app is blocked on the other. | Later integration, done cleanly | Coupling two privately-versioned apps now, and a migration instead of a lookup |

**Two items stay open on purpose, and neither blocks P10:**
- **Which band a given child starts in** — age-derived by default and parent-adjustable; the exact default ages are yours to set against your school's intake.
- **Whether the teacher-side codes (`1:1-1`) map to the child's units at all**, or only to the spine. That is a question about your timetable, not about this codebase.

---

## 15. المراحل (Phases)

Each phase is **its own PR**, matching the sibling plan's convention (*"Each phase gets its own pull request, so the plan PR stays docs-only"*). This document is the plan PR and contains **no code**.

| Phase | What | Output | Gate | Depends on |
|---|---|---|---|---|
| **P9** ⚠️ | **بوابة الطفل الحقيقية — run the 10-minute child gate that has never been run** (`CHILD-TEST.md`), on the *existing* pilot station | A written session record | **A human watched a child use this app once.** This is the real blocker. | Nothing — it can run today |
| **P10** | **المحوَر: النطاقات والسند** — the band/stream/anchor model, bands · anchor ranks · `validateAnchor` · `bandOfUnit` · `streamByBand`, plus the invariant tests | Model + tests. **No UI wiring, no content edits, nothing visible changes.** | Tests pass; science declared but not live; the playable science list is empty; the anchor-debt ratchet is in place | D1 · D3 · D4 |
| **P11** | **الكون، المحطة الأولى** — science station 1 (أنا وعالمي: الحواس · الجسم · الطهارة) playable end to end | The fourth garden live, one station | **A review record for every unit** ([§5.5](#55-دورة-المراجعة-the-review-cycle-for-a-sanad)) · the child gate on the new station · art ≤ 200 KB | D2 · D4 · D7 · P10 |
| **P12** | **العربية ٢–٤** — the Bridge and my-words promoted into a named band-2 road; the graded reader from the 50 bridge words; nahw micro-lessons | The first band above K–2 | A child reads 10 real words aloud; a review record per new story | P9 · P10 |
| **P13** | **الرياضيات ٢–٤** — to 1000, place value, +/− with carrying, the × tables, **الأنصبة as the first fractions** | The shares set | A trial per station; a child solves one أنصبة problem | P9 · P10 |
| **P14** | **الإنجليزية ٢–٤** — CVCe and blends, the Islamic register, the sight-word list | 42 sounds complete + the reading layer | 🔒 **The English voice must be auditioned first** (`add_voice`) — a hard prerequisite, not a task | The voice decision |
| **P15** | **جسر fikr** — the spine generator + the optional `door` field | One spine shared by both apps | A teacher-side door and a child-side unit resolve to the same code | D8 · P10 |
| **P16** | **نطاق ٤–٦** — the deep band across all four streams (نحو · كتابة · النسبة والمئوية والزكاة · الأرض والسماء) | The full K–5 range | One child gate per stream, in band 3 | P12 · P13 · P14 |

### 15.1 ترتيبٌ مقترح، ومخالفته مشروعة (The order is a recommendation)

- **P9 first is a recommendation, not a formality**, and it is the only place in this plan where I would argue against my own sequencing if you disagree — but note what it is: the repository has carried *«هذه البوابة لم تُنفَّذ في أي مرحلة بعد»* since phase A. If a child cannot finish the existing station, then five years of route is being designed on a foundation nobody has stood on, and the honest order is to go and look.
- **P10 is deliberately inert.** It changes nothing a child sees, which is what makes it safe to merge while the decisions are still fresh.
- **P12–P14 are independent of each other** and can be reordered or run in parallel, with one exception: **P14 waits on the English voice.**
- **P16 is the only phase that is genuinely large**, and it is last for that reason.

### 15.2 ما لا يبدأ قبل ماذا (Hard dependencies in one list)

1. **Nothing child-facing starts before P9** (recommended).
2. **No science content before its review record** — structural, not procedural.
3. **No English band 2–4 before the voice audition.**
4. **No `GARDEN_ORDER` change before the science station is playable** — the live-streams invariant holds it.

---

## 16. المخاطر ومعالجتها (Risks and mitigations)

| # | Risk | Likelihood | Impact | Mitigation |
|---|---|---|---|---|
| **R1** | **The child gate never runs**, and K–5 is built on K–2 that nobody has watched a child use | **High** — it has been open since phase A | Severe | **P9, first.** Treat it as a release blocker, not a nice-to-have |
| **R2** | The *sanad* rule becomes paperwork — every unit gets an `anchor`, few get read | Medium | High — a guard that is filled in but not checked is worse than none, because it *looks* verified | The rank system requires *specific* things (a live `related` for م٣, an ayah for م٤), and the review record must state **what was matched** — the existing convention (*«اللفظان مطابقان»*) already models this |
| **R3** | Band 3 (4–6) content is written but a child finds it either too easy or too hard | Medium | Medium | Bands are floors, not locks; a child may draw from a later band; and the report shows the band **without comparison to grade** |
| **R4** | Science art exceeds the byte budget and damages the PWA precache | Medium | Medium | The budget is a **gate** with an existing checker; the station sprites are the designated cut; shared sign cards can serve two units |
| **R5** | The English voice is never auditioned, parking all of the English stream | **Medium–High** | Medium | Isolate it: P14 is the only phase that depends on it, so Arabic, Math and Science proceed regardless |
| **R6** | Two apps drift, and the spine is generated against a `fikr-dashboard` shape that has changed | Medium | Medium | The spine is **generated and read-only on both sides**; a null `door` is a valid value, so drift degrades to fewer links rather than breakage |
| **R7** | Scope creep: this plan is large and the repo has a track record of finishing phases | Medium | High | Each phase is one PR with a visible gate; K–2 is already largely built; P10 is inert |
| **R8** | A م٤ unit slips into overclaiming despite guard 2 | Medium | **High** — reputational and religious | The three-question test is written in the plan **before** any science content exists; the review record must cite a tafsir for any إعجاز claim; and the review is documented (sibling decision 5) |
| **R9** | The content-review backlog grows faster than it is paid | Medium | Medium | The anchor-debt ratchet makes the number visible and monotonic — it can only fall |
| **R10** | A reviewer "applies" the sanad rule to the Qur'an garden itself and turns the Qur'an into a citation | Low | High if it happens | Explicitly out of scope ([§5.6](#56-الحالات-الحدّية-edge-cases-decided-here-rather-than-discovered-later)): the Quran is the Spring; it *is* the sanad |

---

## 17. ما لا تفعله هذه الخطة (What this plan deliberately does not do)

- **It does not touch `src/store.js`, `src/App.jsx`, or anything in the Quran journey outside `src/salman/`** — the repository's standing rule.
- **It does not author child-facing text.** Every word a child reads still passes `CONTENT-REVIEW.md` first.
- **It does not add a screen, a background or a panel.**
- **It does not change the running app.** The plan PR is documentation; P10 is model + tests only; the fourth garden stays dark until its content passes review.
- **It does not modify generated files** (`stories.generated.js`, `journey/index.html`).
- **It does not introduce timers, leaderboards, or punishment for error** — the repository's rule, extended unchanged into K–5.
- **It does not merge the two repositories**, and **no pupil data ever reaches the child's app**.

---

## 18. أسئلة مفتوحة (Open questions)

Answerable without blocking P10, but they need answers before their phase:

1. **The default ages** per band against your school's actual intake — the plan proposes 5–7 / 7–10 / 9–12 from the grade mapping, and your intake may differ by a year.
2. **Which band a brand-new child starts in** when the parent has not set one — the plan says the deeper of the two for their grade; a school may prefer the shallower.
3. **Whether the teacher-side codes map to child units at all**, or only at the spine level — a timetable question, not a code question.
4. **The English voice** — audition it, or accept device TTS for the English stream indefinitely?
5. **The Arabic voice for bands 2–4** — the existing clips are band-1 material (letter names, words). A band-2 graded reader needs new recording, or TTS.
6. **Who reviews the science content**, given the sibling plan's decision 5 (*"I search, verify and quality-assure"*) — the same agent-review model, or a human scholar for م٤ specifically?
7. **Whether the science guide is the hoopoe** (D6) or a keeper shared with the teacher's side.
8. **The printed-edition hadith numbering** — the sibling plan already carries this as an open item; science adds no new hadith burden but inherits the question.

---

## Appendix A — المصادر (Sources)

| Source | Role in this plan |
|---|---|
| `docs/salmans-garden/PLAN-ISLAMIC-PHONICS.md` | **The authority on the method.** The seven-step day, the 28 letters in 7 groups, the two-book story map, the four-art rules, P0–P7, the nine answered decisions |
| `docs/salmans-garden/CONTENT-REVIEW.md` | **The protocol.** The review record every unit must pass; the age rule; the sourced-story log |
| `docs/salmans-garden/PHASES.md` | The living phase record; the un-run child gate |
| `docs/salmans-garden/CHILD-TEST.md` | The 10-minute child-gate script that P9 runs |
| `docs/salmans-garden/source/alphabet-with-the-final-prophet.md` | 28 letters, Prophet ﷺ stories |
| `docs/salmans-garden/source/alphabet-with-the-companions.md` | 27 chapters, companion stories |
| `docs/salmans-garden/source/additions-fa-and-numbers.md` | The ف companion story; the number stories 1–12 with their sources; the verification log against sunnah.com and `api.quran.com` |
| `docs/salmans-garden/VISUALS.md` · `ASSETS.md` · `FILES.md` | The asset inventory and the byte budget |
| `docs/salmans-garden/PROPOSAL.md` | The original four-garden proposal and the session rules |
| **`fikr-dashboard`** (private, read via its README) | The teacher side: gates/doors/keepers/trials, the Wadi route, the pebble bowl, the band vocabulary, the "Salman everywhere" naming, and the door/spine shapes this plan's §11 mirrors |
| `api.quran.com` · `sunnah.com` | The verification targets for every reference in this plan |

**Note on the fikr-dashboard sources:** that repository is private and was not readable directly; this plan is built from its README as provided. If its Wadi data model or its band boundaries differ from [§11](#11-جسر-fikr-dashboard--the-spine-contract), **§11 is the section to correct**, and correcting it costs nothing else in the plan.

---

## Appendix B — الحروف الـ٢٨ والأصوات الـ٤٢

### B.1 مجموعات الحروف السبع (The seven letter groups — from the sibling plan §3)

| Station | Group | The child can read at the end | Status today |
|---|---|---|---|
| 1 | ا · ب · م · د | بابا · ماما · باب · دُبّ · دَم | 🟡 4/4 live |
| 2 | ت · ن · ل · ر | تَمْر · نار · لَبَن · بِنْت · رَمْل · دار | 🟡 1/4 |
| 3 | س · ي · و · ك | سَمَك · بَيْت · وَلَد · كَلْب · يَد · سُوق | ⬜ |
| 4 | ف · ق · ع · ج | فِيل · قَلَم · قَمَر · جَمَل · عَيْن · فَم | 🟡 1/4 |
| 5 | ح · خ · هـ · ش | حَبْل · خَيْمَة · هَدِيَّة · شَمْس · شَجَرَة | 🟡 1/4 |
| 6 | ص · ط · ز · ذ | صَلاة · طَيْر · زَيْت · ذِئْب | 🟡 1/4 |
| 7 | ض · ظ · غ · ث | ضَحِك · ظِلّ · غُصْن · ثَوْب | 🟡 1/4 |
| 8 | أرجوحة الحركات (fatha/kasra/damma/sukun) | بَ بِ بُ بْ | ⬜ |
| 9 | قطار المدّ (long vowels · tanween) | بَا بُو بِي · كِتَابٌ | ⬜ |
| 10 | بيت الكلمات (shadda · ال · positions · special words) | الشَّمْس · القَمَر · الله · هذا | ⬜ |

**Letters live: 8 of 28.** The two rules the sibling plan states and this plan keeps: letters that differ only by dots are **never in the same group**, and the hardest sounds (ص ض ط ظ and the rarer ث غ) come **last**.

### B.2 الأصوات الـ٤٢ في سبع مجموعات (The 42 sounds)

| Group | Sounds | Status |
|---|---|---|
| 1 | s · a · t · i · p · n | ✅ |
| 2 | c k · e · h · r · m · d | ✅ |
| 3 | g · o · u · l · f · b | ✅ |
| 4 | ai · j · oa · ie · ee · or | ✅ |
| 5 | z · w · ng · v · oo · oo | ⬜ |
| 6 | y · x · ch · sh · th · th | ⬜ |
| 7 | qu · ou · oi · ue · er · ar | ⬜ |

**Sounds live: 24 of 42.** The sequence is the widely used synthetic-phonics teaching order; **the stories are ours** (the sibling plan is explicit: the *method* is public practice, the programme's own texts are copyrighted and are not used).

**Sounds with no natural Quranic narrative** (`ng`, `x`, `qu` …) draw on everyday Muslim family life instead — a king's ring, a box of gifts for Eid, the Queen of Saba for `qu` — at rank **م٣, with a mandatory `related`** back to the Arabic unit carrying the same meaning.

### B.3 المجموع (The totals today)

| Subject | Live units | Of the target | Note |
|---|---|---|---|
| العربية | **8** letters | 28 letters + 3 stations of harakat/madd/words | Stations 1–10 defined |
| الإنجليزية | **24** sounds | 42 sounds | Stories written in English, `related` links in place |
| الرياضيات | **20** numbers | 20 numbers ✅ · stations 5–7 open | The most complete stream |
| الكون | **0** | 8 stations, ~20 units scoped | Not started |
| **The Bridge** | **50** words | — | The de-facto band 2–4 reading layer |

---

## Appendix C — جدول آيات الكون (مسوّدة نطاق)

> ### ⚠️ مسوّدة نطاق — ليست توثيقًا (scope draft — not verification)
>
> **Every reference below is a slot to be matched, not a source to be quoted.** Ayah and hadith numbers are placed here so the *shape* of the stream is visible; **none has been matched yet**, and the first act of the science phase (P11) is the review record — **not** the writing. Guard 3 ([§6.3](#63--القاعدة-الثالثة-لا-نصّ-محرَّف)) applies to every row. No quoted text appears in this table, deliberately.

| Station | Unit | Rank | Reference (to verify) | The sign |
|---|---|---|---|---|
| sc1 | الحواس الخمس | م٤ | `الإسراء ٣٦` | hearing, sight, the heart — and that each is asked about |
| sc1 | جسمي | م٤ | `التين ٤` | the body as a trust: eat, sleep, clean |
| sc1 | الطهارة | **م١** | `مسلم ٢٢٣` | purity is half of faith |
| sc2 | الماء والحياة | م٤ | `الأنبياء ٣٠` | from water, every living thing |
| sc2 | المطر | م٤ | `الفرقان ٤٨` | sent down purifying water |
| sc2 | البحر | م٤ | `النحل ١٤` | the sea made subject, ships running in it |
| sc3 | الإبل | م٤ | `الغاشية ١٧` | *look at the camel, how it was created* |
| sc3 | النحل | م٤ | `النحل ٦٨–٦٩` | the bee, inspired; a drink with healing |
| sc3 | النمل | **م٢** | `النمل ١٨–١٩` | the ant that spoke; Sulaiman heard her |
| sc3 | الطير | م٤ | `الملك ١٩` | birds above, held up by none but Him |
| sc4 | البذرة والنبات | م٤ | `الأنعام ٩٩` | the seed, and what comes out of it |
| sc4 | النخلة | م٤ | `النحل ١١` | the palm and its fruit |
| sc4 | الفصول | م٤ | `البقرة ١٦٤` | the changing of seasons as a sign |
| sc5 | الدفع والسحب | م٤ | `الروم ٥٤` | weakness → strength → weakness, and movement |
| sc5 | الميزان | م٤ | `الرحمن ٧` | the heaven raised, the balance set |
| sc6 | الظل | م٤ | `الفرقان ٤٥` | the shadow, and how it is spread |
| sc6 | الليل والنهار | م٤ | `الإسراء ١٢` | night and day as two signs |
| sc7 | الشمس والقمر | م٤ | `يس ٣٨–٤٠` | the sun runs its course; neither overtakes the other |
| sc7 | النجوم | م٤ | `الذاريات ٤٧` | the heaven built, and we are expanding it |
| sc8 | التوازن | م٤ | `القمر ٤٩` | every thing created in due measure |
| sc8 | الإسراف | م٤ | `الأعراف ٣١` | eat, drink, and do not waste |

**Column discipline:**
- **rank م١** must carry its own quotation (matched) — three rows are marked so.
- **rank م٢** retells a narrative — one row.
- **m٤ must carry an ayah** — every remaining row.
- **No row may claim إعجاز** ([§6.2](#62--القاعدة-الثانية-لا-إعجاز-بلا-تفسير)) without a cited tafsir. Note that the `الذاريات ٤٧` row is the classic example of an ayah often used for an إعجاز claim; under guard 2 it ships as **تدبّر** (*look at what was built*) unless a cited tafsir is recorded.

---

## Appendix D — جدول تعارض المصطلحات (Glossary conflicts)

The two repositories use overlapping words for different things. Recorded here **once**, so the bridge in [§11](#11-جسر-fikr-dashboard--the-spine-contract) does not silently conflate them:

| Word | In this repo (child) | In `fikr-dashboard` (teacher) | Resolution |
|---|---|---|---|
| **حديقة / garden** | a subject's *place* (screen, colour, guide) | not used | The child's term. A stream contains gardens |
| **بوابة / gate** | an ear-listening screen (بوابة جزء عمّ) | a curriculum cluster (gates 1–16) | **Same word, different meaning — the app keeps its own.** The spine maps `station ⇄ gate` and never renames the child's screens |
| **مستوى / level** | a Quran level (3 levels) | — | Unchanged |
| **محطة / station** | a cluster of units | a gate | The spine's join point |
| **يوم / day** | one unit, seven steps | a door / a lesson | The spine's join point |
| **دليل / guide** | the child's companion animal | a gate's **keeper** | One concept, two names — the spine maps them |
| **نجمة / star** | a unit-completion reward, per child | points on the board | Deliberately *not* unified: stars are the child's, points are the teacher's |
| **النطاق / band** | K–2 · 2–4 · 4–6 | K–2 · 2–4 · 4–6 | **Identical on purpose** — this is the vocabulary the two apps must share |

---

## ملخّص تنفيذي في عشرة أسطر (Executive summary in ten lines)

1. **The gap:** the app has a *method* for one station and no *route* across K–5.
2. **The fix:** four **streams** (Arabic · Math · English · **Science**) flowing from one **spring** (the Quran), across three **bands** (K–2 · 2–4 · 4–6).
3. **Bands are depth targets, never locks** — overlapping at 2 and 4, chosen per stream, changed by the parent, never a rank.
4. **Islam is central by being the *source*, not the decoration** — every unit carries a **sanad** at one of four ranks: **نصّ · قصّة · معنًى · أثر**.
5. **Four guards** enforce it: **لا وحدة بلا سند · لا إعجاز بلا تفسير · لا نصّ محرَّف · لا تجسيد**.
6. **Science is the new stream** — «آيات الكون» — teaching the child to *look* because the Qur'an asked, with the hoopoe as its guide.
7. **The expensive parts are already built** — 20 numbers, 8 letters, 24 sounds, 50 bridge words, four engines, six screens, the whole asset library.
8. **The bridge to `fikr-dashboard`** is one generated file, read-only on both sides: **سلمان is the same child on both sides of the desk.**
9. **The real blocker is P9**: the 10-minute child gate the repo has never run.
10. **Eight decisions are needed** ([§14](#14-القرارات-المطلوبة-the-eight-decisions)); seven are cheap, and D3 is the one that matters.
