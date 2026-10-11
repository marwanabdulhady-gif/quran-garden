# Salman's Garden — «مجاري النور»: the K–5 extension of the four gardens

> **Status: proposed — awaiting your approval of the decisions in §12.** No child-facing content is authored by this document; it is architecture and scope. The sibling plan [`PLAN-ISLAMIC-PHONICS.md`](PLAN-ISLAMIC-PHONICS.md) stays the authority on the *method* (the seven-step day) and this document is the authority on the *route* (what comes after station 1, and how it goes from K to 5).
>
> **Scope:** Arabic, English, Math and **Science** — as four continuous **streams** (مجارٍ) that flow from one spring (الوحي) and return to it. The Quran is not a fifth stream: it is the spring every stream rises from.
>
> **Two rules this plan obeys, inherited from the sibling plan:** reuse the art, audio and engines we already own (§9 — the new work is composition, not a rebuild), and nothing is voiced or shown to the child before it passes its record in [`CONTENT-REVIEW.md`](CONTENT-REVIEW.md) (§3).
>
> **Where the second repository fits:** [`fikr-dashboard`](https://github.com/marwanabdulhady-gif/fikr-dashboard) is the *teacher* side of the same curriculum: gates (1–16), doors (`1:1-1`), keepers, trials, the caravan route, the pebble bowl, `js/wadi-data.js`. This document defines the **shared spine** (§8) so a door on the teacher's dashboard and a unit in the child's garden are the same object with the same code — and **Salman the explorer is already the same character on both sides** (the app's own `عمر → سلمان` migration proves the naming was settled).

---

## 1. The idea in one paragraph

`PLAN-ISLAMIC-PHONICS.md` answered *how* a child learns one unit (a story, a sound, an action, a chant, a trace, a game, a deed). It did not answer *what comes after the pilot station*, and it stopped at ages 4–6. **مجاري النور** answers both: each of the four subjects becomes one continuous **stream** a child enters at K and leaves at grade 5 — never re-entering, never restarting, only going deeper. A stream has **stations** (محطات, our gates), **days** (the existing seven-step unit), and **signs** (الآيات التي تسنده). The three **bands** — K–2 · 2–4 · 4–6, the same vocabulary `fikr-dashboard` already uses — are *depth targets, not gates*: a six-year-old reading at band 2–4 is not moved out of the garden, they simply draw from the deeper bed of the same stream. Islam is central not by decorating each unit, but by being **the source of every unit**: nothing enters a stream without a *sanad* (§3, «لا وحدة بلا سند»).

---

## 2. What "stream" means here — and why it is the right word

A garden with irrigation channels is Quranic imagery before it is our metaphor: «جَنَّاتٍ تَجْرِي مِن تَحْتِهَا الْأَنْهَارُ». So the architecture is named accordingly, and every part of it already exists in one of the two repositories:

| Stream anatomy | Arabic | Child's app (this repo) | Teacher's app (`fikr-dashboard`) |
| --- | --- | --- | --- |
| **The spring** | العين | حديقة القرآن — juz 58–114, الآية اليوم, جسر المعاني | `js/wadi-data.js` story hooks |
| **The stream** | المجرى | a garden: `arabic` · `math` · `english` · **`science`** | the subject's World Tour |
| **The band** | النطاق | **new** — `bands.js` (§4) | `docs/ux-review-*` K–2 · 2–4 · 4–6 |
| **The station** | المحطة | `station` field, `MATH_STATIONS`, the 7 letters stations | **gates** 1–16 |
| **The day** | اليوم | a unit + `DAY_STEPS` (7 steps) | a **door** (`1:1-1`) |
| **The guardian** | الدليل | سلمان · الهدهد · دودة الحرير · السنجاب · **+1 for science** | keeper + artifact per gate |
| **The return** | المحطة الختامية | review day, `unitCompleted`, badges | **gate trial** (⚔) |

**The one thing the child's side is missing is the *route*.** Today the gardens are four separate pockets of stations with no continuous path between K and 5, and no way to say "you are here" relative to a whole subject. The stream is that route.

### 2.1 The stream is not a fifth garden, and the Quran is not a subject

This is the structural statement of the whole plan, and it is deliberate:

```
                    عين الوحي  (the spring — the Quran)
                          │
        ┌─────────────────┼─────────────────┬─────────────────┐
   مجرى العربية      مجرى الرياضيات    مجرى الإنجليزية    مجرى الكون
   (Arabic)            (Math)            (English)        (Science)
        │                 │                 │                 │
        └─────────────────┴─────────────────┴─────────────────┘
                          │
                 كل عقدة ترجع إلى العين
              (every node anchors back to the spring)
```

- **`quran` is the axis, not a stream.** It stays a garden a child visits (it is the reason the app exists), but it is *also* the table every other stream draws from. In code: `AXIS = 'quran'`, `STREAM_ORDER = ['arabic','math','english','science']`.
- **A stream with no anchor is not a stream, it is a school subject.** §3 makes that a test, not a wish.

---

## 3. The centrality rule — مراتب السند (this is the heart of the plan)

"Islamic centrality" is the easiest thing to claim and the hardest thing to keep. It fails in one of two ways: content that **uses** Islam as decoration (a hadith sticker on a fractions worksheet), or content that **claims** Islam loosely (an unverified "scientific miracle"). This section is the mechanism that prevents both.

### 3.1 Every unit carries a *sanad*, and it has four ranks

Reusing the field the app already has — every story in `nour.js` already carries `ref`, `url`, `review` — and lifting it from the story to the **unit**:

| Rank | Arabic | What it means | Example | Requirement |
| --- | --- | --- | --- | --- |
| **م١** | نصّ | The unit *is* a quoted text: an ayah or a hadith. | ٣ = «كَانَ يَتَنَفَّسُ فِي الشَّرَابِ ثَلَاثًا» (مسلم 2028) | Quote matched character-for-character in the review record. |
| **م٢** | قصّة | A narrative from revelation, retold for the child. | الهدهد وبلقيس (النمل ٢٠–٢٨) | Story must retell, never add; nothing depicted (§8.2 of the sibling plan). |
| **م٣** | معنًى | No direct text; a value drawn from the Sharia. | English `/ng/` → «وَلَا تَنَابَزُوا» — be gentle with words | **Must link to a م١/م٢ unit** via `related` (the field `nour-english.js` already uses). |
| **م٤** | أثر | A sign Allah placed in creation, studied as science. | الإبل — «أَفَلَا يَنظُرُونَ إِلَى الْإِبِلِ كَيْفَ خُلِقَتْ» (الغاشية ١٧) | **Must carry an ayah as the lens.** Never a bare, ayah-less "science + Islam" pairing. |

**م٤ is the rank that makes Science work**, and it is deliberately the strictest: the ayah is not an attachment to the science lesson, it is *the reason the child is looking*.

### 3.2 The four guards («القواعد التي لا تُكسر»)

These extend the sibling plan's §7/§8 rules and become automated tests in `tests/salman-k5.test.mjs`:

1. **لا وحدة بلا سند** — no unit may enter a stream without `anchor {rank, ref, url, review}`. A test fails the build if one does. *This is the single most important line in the plan.*
2. **لا إعجاز بلا تفسير** — we teach **تدبّر** (reflection on the sign) and we never assert **إعجاز علمي** (the ayah "predicted" a fact) unless a cited *tafsir* or a recognised scholar's source is in the record. The difference matters: تدبّر is what a five-year-old can do, and it is what the Qur'an asks for. This guard keeps the app from ageing badly when science moves.
3. **لا نصّ محرَّف** — every «» quote is matched against the Uthmani text (`api.quran.com`) or `sunnah.com` in the review record, exactly as the sibling plan already does for the two letter books.
4. **لا تجسيد** — the depiction rule (§8.2) extends unchanged to Science: we show the ant, the ark, the palm, the sea, the birds, the stars — never a prophet, a companion or an angel.

### 3.3 Why rank م٣ is legal rather than a loophole

A value with no direct text is the weakest form of centrality, so it is fenced: it must **point at a real text** through `related`, and a test walks the chain and fails if the pointer dangles or if a م٣ unit ever becomes a terminal node. In practice the K–2 layer almost never needs م٣ — there is enough text — and the rank exists mainly for the English sound inventory, where 42 sounds cannot each own an ayah. The English garden already solved this correctly in `nour-english.js`; م٣ just makes the existing `related` field mandatory instead of optional.

---

## 4. The K–5 bands: نطاق K–2 · 2–4 · 4–6

Three bands, deliberately **overlapping at grade 2 and grade 4** — the same bands `fikr-dashboard` uses, so the two applications speak one vocabulary. Overlap is the feature: a child in grade 2 may sit in either band, and the app lets them, because the repo's standing rule is that there are no timers, no leaderboards and no punishment for error. A band is **a depth target and a reading load**, never a lock.

| | **نطاق ١ · K–2** | **نطاق ٢ · 2–4** | **نطاق ٣ · 4–6** |
| --- | --- | --- | --- |
| **Age** | 5–7 | 7–10 | 9–12 |
| **Arabic name** | التأسيس | البناء | التوسّع |
| **Session** | 5–8 items, ~10 min (today's) | 6–9 items, ~15 min | 8–12 items, ~20 min |
| **New units / day** | 2 per garden (today's `DAILY_NEW_CAP`) | 3 | 3, plus one *composition* task |
| **Language of instruction** | Arabic, spoken-first, zero print | Arabic by default; English garden in English | Arabic and English; subject register introduced |
| **Reading load** | a word and a picture | a sentence, then a paragraph | a passage, then a table or a diagram |
| **Engines tier (§9)** | tap only: hunt · trace · train · boxes · memory · sorting | + matching · odd-one-out · scramble · cloze · Venn · timeline | + model+keypad · maze · number-maze · speed-tap |
| **The "I can…" objective** | «أنا أسمع الصوت» | «أنا أقرأ الكلمة» | «أنا أشرح لماذا» |
| **Assessment shape** | the day is finished | the station trial (⚔) | the trial + a written/told production |
| **The deed** | one action, done with an adult | one action, done alone | one action, done for someone else |
| **Parent report** | did they finish the day | station mastery (متقن/يتعلّم/يحتاج مساعدة — already in `parent.js`) | + the production, + the reasoning |
| **Badge weight** | first taste | mastery | service |

**Bands are declared, never inferred.** The child's band lives with the child's profile (like `stats` and `parent`), defaults from age, and can be moved by the parent at any time in ولي الأمر — a floor, not a ceiling: a child may always draw from a *later* band inside the same stream, and the app records which band a unit came from so a report can say which band the child is actually working in. This is `fikr-dashboard`'s standing rule ("every grade band stays in the catalogue") applied to the child's side.

---

## 5. The four streams, band by band

The K–2 column is mostly **already built** — that is the point. This section is a map of what exists, what it anchors to, and where the stream flows next.

### 5.1 مجرى العربية — «حروف النور» → القراءة والقواعد

| Band | The child works on | Already in the app | The next build | Anchor examples |
| --- | --- | --- | --- | --- |
| **K–2** | 28 letters in 7 phonics groups (stations 1–7), then harakat, madd, tanween, shadda, ال (stations 8–10) | `nour.js` + `nour-letters.js` (24 of 28 letters live); stations 1–10 defined in the sibling plan §3 | finish groups 6–7, P4 stations 8–10 | م١/م٢ per letter (the two books) |
| **2–4** | real words → phrases → sentences; **Quranic vocabulary**; handwriting; dictation; المفرد/الجمع، المذكر/المؤنث، أل التعريف | **جسر المعاني (50 words)** and **كلماتي** already do exactly this — they have been the 2–4 layer all along without being named one | reading passages from juz 28–30; a graded reader built from the 50 bridge words; nahw micro-lessons | م٢ ayat the words came from |
| **4–6** | نحو وصرف: الأفعال الثلاثة، الإعراب المبسط، الهمزات؛ إملاء; تعبير (a told paragraph); خط نسخ ثم رقعة; comprehension of a short surah + a hadith text | `Listening.jsx` (juz 58–114) and the player's memorisation tools | writing & dictation set; tafsir-aligned comprehension of the surahs already in the app | م١ quoted texts |

**The gap this closes:** today a child who finishes the 28 letters has nowhere to go inside the app. 2–4 named as a band turns جسر المعاني and كلماتي from a side-room into the main road.

### 5.2 مجرىالإنجليزية — «Letters of Light» → الفهم والكتابة

| Band | The child works on | Already in the app | The next build | Anchor examples |
| --- | --- | --- | --- | --- |
| **K–2** | 42 sounds in 7 groups; tricky words | `nour-english.js` — 24 of 42 sounds live, each with a Quran story in English and a `related` link to its Arabic twin | groups 3–7 (P5 of the sibling plan) | م٢ (Yusuf's dream for `/or/`, the ant for `/s/`) |
| **2–4** | CVC → CVCe → blends → sight words; simple sentences; **Islamic vocabulary in English**; speaking & listening | the 25 existing phonics stories (the sibling plan keeps them as extra reading) | graded readers; a 100-word sight list; the Islamic register (masjid, salah, wudu, imam, Ramadan, adhan) | م٣ → linked to Arabic units |
| **4–6** | grammar (nouns, verbs, tenses, pronouns); guided writing (3–5 sentences); comprehension; spelling patterns; **the English register of Islamic speech** | — | the writing set; «ﷺ» → "peace be upon him" taught explicitly | م١/م٢ |

**The existing bridge is the model.** `nour-english.js` states its own rule: every English unit carries `related` pointing at an Arabic unit with the same story — the same content in a second language fixes *one* meaning. K–5 promotes that from a convention in one file to an invariant of the whole stream (§3.3, guard 1).

### 5.3 مجرىالرياضيات — «أرقام النور» → الحساب والأنصبة

| Band | The child works on | Already in the app | The next build | Anchor examples |
| --- | --- | --- | --- | --- |
| **K–2** | numbers ١–٢٠ as 20 full days; counting; more/less; bonds to 10; shapes in the masjid | **done** — `nour-numbers.js`, `MATH_STATIONS` (4 stations), the P6b stations 5–7 still open | stations 5–7 (bigger/smaller, bonds of ten, shapes) | م١/م٢ per number (`PLAN-ISLAMIC-PHONICS.md` §10) |
| **2–4** | to 1000; place value; +/− with carrying; × tables; halves and quarters; measuring | count objects + 16 math scenes are reusable | the × table set anchored to 5, 7, 12, 30, 40; **the first real fractions** | م١ **الأنصبة** — «نِصْفُ» · «الثُّلُثُ» · «الرُّبُعُ» · «السُّدُسُ» · «الثُّمُنُ» (النساء ١١–١٢) |
| **4–6** | fractions ↔ decimals ↔ percent; ratio; area & perimeter; data and graphs; **زكاة ٢٫٥٪ = ربع العشر**; مواريث as worked ratio | the app already **draws a bar chart** of listening minutes over 8 weeks (`Listening.jsx`) — a live graph a child can read | the percent & ratio set; the masjid measurement project | م١ quoted texts |

**Two anchors worth naming, because they are the reason this stream is not a normal maths course:**
- **الأنصبة (سورة النساء ١١–١٢)** is a *real fraction curriculum*, revealed, with halves, thirds, quarters, sixths and eighths — the exact denominators the K–5 fraction standard teaches. A child who learns ثلث from a pizza learned it twice; a child who learns it from the ayah and then meets it in fara'id learned it once, properly.
- **الزكاة = ربع العشر = ٢٫٥٪** is the single most natural percent lesson that exists in this tradition, and it is a *calculator exercise with a consequence* — which is what the 4–6 band is for.

### 5.4 مجرى الكون — «آيات الكون» (Science — new stream)

The fourth stream, and the only one that does not exist yet. It is built exactly like the other three: the same seven-step day, the same review record, the same art rules — with **three of the seven steps relabelled** (§6.1), because a sign is examined, not sounded.

| Band | Stations | The child works on | Anchor examples (م٤ unless noted) |
| --- | --- | --- | --- |
| **K–2** | ١ · أنا وعالمي | the five senses; my body; cleanliness (**الطُّهورُ شطرُ الإيمان**, مسلم ٢٢٣ — م١) | «إِنَّ السَّمْعَ وَالْبَصَرَ وَالْفُؤَادَ كُلُّ أُولَئِكَ كَانَ عَنْهُ مَسْئُولًا» (الإسراء ٣٦) |
| | ٢ · الماء والسماء | water, rain, the sea; water is clean (**الطهور**) | «وَجَعَلْنَا مِنَ الْمَاءِ كُلَّ شَيْءٍ حَيٍّ» (الأنبياء ٣٠) · «وَأَنزَلْنَا مِنَ السَّمَاءِ مَاءً طَهُورًا» (الفرقان ٤٨) |
| | ٣ · الحيوان | the camel, the bee, the ant, the bird, the fish | «أَفَلَا يَنظُرُونَ إِلَى الْإِبِلِ كَيْفَ خُلِقَتْ» (الغاشية ١٧) · «وَأَوْحَى رَبُّكَ إِلَى النَّحْلِ» (النحل ٦٨) · النمل ١٨–١٩ (م٢) |
| **2–4** | ٤ · الأرض والنبات | the seed, the palm, seasons, what plants need | «فَأَخْرَجْنَا بِهِ نَبَاتَ كُلِّ شَيْءٍ» (الأنعام ٩٩) · النخل (النحل ١١) |
| | ٥ · الحركة والقوة | push and pull, the pulley, the balance | «وَوَضَعَ الْمِيزَانَ» (الرحمن ٧) |
| | ٦ · الضوء والظل | light, shadow, sun and moon as two different lights | «وَجَعَلْنَا اللَّيْلَ وَالنَّهَارَ آيَتَيْنِ» (الإسراء ١٢) |
| **4–6** | ٧ · الأرض والسماء | sun, moon, stars, orbits, night and day, the tides | «لَا الشَّمْسُ يَنبَغِي لَهَا أَن تُدْرِكَ الْقَمَرَ» (يس ٤٠) · «وَالشَّمْسُ تَجْرِي لِمُسْتَقَرٍّ لَّهَا» (يس ٣٨) · «وَالسَّمَاءَ بَنَيْنَاهَا بِأَيْدٍ» (الذاريات ٤٧) |
| | ٨ · البيئة والخلافة | ecosystems, balance, waste, **الإسراف** | «وَلَا تُسْرِفُوا إِنَّهُ لَا يُحِبُّ الْمُسْرِفِينَ» (الأنعام ١٤١) · «وَكُلُوا وَاشْرَبُوا وَلَا تُسْرِفُوا» (الأعراف ٣١) |

> **⚠ These ayah references are a scope draft, not a verification.** They are placed here as the *shape* of the stream, and every one of them must pass the review record (§3.2 guards 3 and 4) before a single word is written for the child — including the surah/ayah numbers themselves. Per the standing rule, **P0 of this stream is the review, not the writing.**

**The guardian of the fourth stream.** Each stream has a guide: سلمان · الهدهد · دودة الحرير · السنجاب. Science needs its own, and the candidate is the **hoopoe (الهدهد)** — the bird of an-Naml ٢٠–٢٨, who *brought news* of a sign and then inspected it. That is exactly what a science guide does, and it costs nothing: the hoopoe's art and the an-Naml backdrop already ship with the Arabic garden. *(Decision D6, §12 — the alternative is a new keeper tied to a `fikr-dashboard` gate.)*

---

## 6. The day, unchanged — with three labels moved

A new unit in any of the four streams is still the approved seven-step day. Science needs the same skeleton with a different vocabulary, and that is the *only* structural concession in this plan:

| # | All four streams | Science says instead | Why |
| --- | --- | --- | --- |
| 1 | باب القصة 📖 | **باب الآية** 📖 | the ayah opens the door |
| 2 | القصة 🗣️ | **الآية والمعنى** 🗣️ | the text, then its meaning in child words |
| 3 | الصوت والحركة 🎵 | **البطاقة والتدبّر** 🔍 | no phoneme to sound; a sign card and a question instead |
| 4 | صيد الصوت 🔍 | صيد الأثر 🔍 | unchanged mechanic, same `Hunt` engine |
| 5 | التتبّع ✏️ | تتبّع الرسم ✏️ | same `TracePad`, tracing a labelled diagram |
| 6 | اللعب 🎮 | اللعب 🎮 | identical |
| 7 | عمل اليوم 💚 | **عمل الخلافة** 💚 | stewardship: plant, save, care, share |

Steps 1 and 2 invert the usual science lesson: the child meets **the text first**, then looks. That ordering is the whole pedagogy — the observation is an answer to the ayah's question («أَفَلَا يَنظُرُونَ…»), not a fact with a verse attached at the end. Small change in the data model (a `label` override per garden), zero new screens.

---

## 7. What this does to the session and the report

- **`pickSession`** takes an `order`; it becomes a *banded* order — the child's band decides the station pool per stream, the existing rules (reviews first, cap on new, 5–8 items) are untouched. The one-line change is the pool passed in, not the algorithm.
- **The daily visit order** stays العربية ← الرياضيات ← القرآن ← الإنجليزية, with **الكون** placed next to القرآن so the day opens and closes near the spring: العربية · الرياضيات · **الكون** · القرآن · الإنجليزية. *(Decision D5 — this is a felt change for the child, so it is your call, not mine.)*
- **`parent.js`** already reports per garden (متقن / يتعلّم / يحتاج مساعدة). It gains a **band** column so a parent sees *which band* the child is actually working in — the only new information the parent needs from K–5.
- **The gap warning stays.** A child may draw from a later band in one stream and an earlier band in another; the report says so, plainly, and never implies a deficit.

---

## 8. The shared spine — so a door and a unit are the same object

This is the part that makes the two repositories one curriculum instead of two products. `fikr-dashboard` codes a lesson as `semester:lesson` — `1:1-1` — keeps it in `js/wadi-data.js`, and seals it as a door. A child's unit is `ar-ت` or `num-3`. Today those are unrelated strings.

**The contract:** both sides agree on one code, and the child's unit may *carry* the teacher's. No shared runtime, no API, no coupling — one exported artifact:

```
docs/salmans-garden/content/stream-spine.json     ← generated from the child's app data
```

| Spine field | From the child's side | Used by the teacher's side |
| --- | --- | --- |
| `stream` | `arabic` · `math` · `english` · `science` | the subject's World Tour |
| `band` | `k2` · `2-4` · `4-6` | the K–2 · 2–4 · 4–6 catalogue rule |
| `station` | the existing `station` field | a **gate** (1–16) |
| `door` | *new, optional* — the teacher-side code (`1:1-1`) | the door, the game, the seal |
| `unit` | the existing unit id (`ar-ت`) | the story box inside a lesson |
| `anchor` | `{rank, ref, url}` | the lesson's 🏮 Wadi story hook + its "I can…" |
| `deed` | the existing `deed` | the production pathway / STEAM commission |
| `guardian` | the garden's `guide` | the **keeper** of the gate |

Rules for the bridge, so it stays honest:
1. The spine is **generated, never hand-edited** (the repo's existing rule for `stories.generated.js`).
2. A `door` is **optional**. The child's curriculum is complete without any teacher-side code; the spine only *links* when a link exists.
3. **Nothing is written into the teacher's saved dashboard** — exactly the rule `fikr-dashboard` already applies to `js/wadi-data.js`. An older dashboard gets the spine with no migration.
4. The bridge ships in its own phase (P15, §11) and its own PR. Neither app is blocked on the other.

**And the naming is already done for us:** fikr-dashboard says *"The explorer is called Salman everywhere"*, and this app already migrated `عمر → سلمان`. سلمان is the same child on both sides of the desk. The pebble bowl (collective recognition, never a rank) is the teacher-side twin of this app's own rule: **no leaderboards, no punishment for error.**

---

## 9. Engines — the same four, matured by band

`fikr-dashboard` ships 19 hero verbs across 92 lesson doors, all played on the same kit. Its lesson for us is that **a small set of engines plus good content beats many screens** — which is what `src/salman/Engines.jsx` already assumes.

| Engine | Today | K–2 | 2–4 | 4–6 |
| --- | --- | --- | --- | --- |
| `Hunt` (صيد) | ✅ | tap the target | tap all + distractors that look similar | tap the *counter-example* and say why |
| `TracePad` (تتبّع) | ✅ | the glyph | the word | the labelled diagram |
| `OrderGame` — `train` (بلending) | ✅ | two tiles | three-to-four tiles | word → phrase |
| `OrderGame` — `boxes` (segmenting) | ✅ | two boxes | three boxes | word → sentence |
| **+ memory · sorting** | ⬜ | ✅ tap-only | ✅ | ✅ |
| **+ odd-one-out · matching** | ⬜ | — | ✅ | ✅ |
| **+ Venn · timeline · cloze** | ⬜ | — | ✅ | ✅ |
| **+ model + keypad** | ⬜ | — | — | ✅ worked answers, for math & science |

**The rule that keeps this cheap:** every new engine lands inside `Engines.jsx` and the existing day screen. **Zero new screens, zero new backgrounds, zero new panels** — the same discipline the pilot stated, and the reason `fikr-dashboard` can afford 92 doors is the same reason we can afford eight engines. Adding an engine means adding a *verb*, not a page.

---

## 10. Art and audio — reuse first, and the byte budget is a gate

Inherited wholesale from the sibling plan §8.1, and extended:

- **Reuse:** 4 garden backgrounds · 3 gate banners · 10 trip scenes · 4 tafa cards · 7 screen backgrounds · 28 animal sprites · 16 math scenes · 5 count objects · the hero's poses and poses set.
- **New art, science only, and only where it earns its place:** one sprite per science station scene — a small, closed set (a plant, a seed, a cloud, a jar of water, a shadow, a star chart). Budgeted at **≤ 200 KB**, checked in the same pass, because the PWA precache is already ≈13.3 MB and the repo's own rule is that the budget is a gate, not a note.
- **Audio:** chants are **voice-only** (sibling plan decision 2 — no instruments, clapping allowed). Content is voiced only *after* its review record: ٥–٢٠ in math are still unvoiced and running on device TTS, which is the intended fallback, not a defect.
- **The English voice is still unauditioned** (sibling plan §9) — that blocks the English 2–4 layer, and it is a `add_voice` call, not a build.

---

## 11. Phases — and the gate that is actually blocking everything

Each phase is its own PR, matching the sibling plan's convention. This document's own phase is **P8** and it is **docs + model only**.

| Phase | What | Output | Gate |
| --- | --- | --- | --- |
| **P9 ⚠ — بوابة الطفل الحقيقية** | **Run the 10-minute child gate that has never been run** (`CHILD-TEST.md`), on the existing pilot station | a written session record | **This is the real blocker.** Every phase below assumes a human watched a child use this app once. The repo has scheduled this gate since phase A and it is still ⬜. Building K–5 on top of an unvalidated K–2 is the one risk that makes every other risk irrelevant. |
| **P10 — المحور: النطاقات والسند** ← *this PR* | `bands.js` (bands, streams, anchors, guards), `nour-science.js` (scope only, review-gated), `tests/salman-k5.test.mjs` | the model, tested, **not yet wired to the UI** | tests pass; nothing in the running app changes; no child-facing content added |
| **P11 — الكون، المحطة الأولى** | Science station ١ playable end-to-end (أنت وعالمي: الحواس · الجسم · الطهارة), with its review record | the fourth garden live in the app, one station | review record complete for every unit · the child gate on the new station · ≤ 200 KB art |
| **P12 — العربية 2–4** | جسر المعاني and كلماتي promoted into the named 2–4 road; graded reader; nahw micro-lessons | the first band above K–2 | a child reads 10 real words aloud; the review record per story |
| **P13 — الرياضيات 2–4** | to 1000, place value, +/− with carrying, × tables, **الأنصبة as the first fractions** | the انصبة set | trial per station; a child solves an انصبة problem |
| **P14 — الإنجليزية 2–4** | CVCe and blends, the Islamic register, the 100-word sight list | 42 sounds complete + the reading layer | **the English voice must be auditioned first** (`add_voice`) — hard prerequisite |
| **P15 — جسر fikr** | `stream-spine.json` generator + the `door` field; the contract in §8 | the two repos share one spine | a teacher-side door and a child-side unit resolve to the same code |
| **P16 — نطاق 4–6** | the deep band across all four streams (نحو، كتابة، النسبة والمئوية والزكاة، الأرض والسماء) | the full K–5 range | one child gate per stream, in band 4–6 |

**P9 first is a recommendation, not a formality.** The plan below it is sound either way — but if a real child cannot finish the existing station, then the K–5 route is being designed on a foundation nobody has stood on, and the honest order is to go and look.

---

## 12. Decisions I need from you

| # | Decision | My recommendation | Effect |
| --- | --- | --- | --- |
| **D1** | The band model itself: three overlapping bands (K–2 · 2–4 · 4–6) as **depth targets, never locks** | **Approve.** It reuses `fikr-dashboard`'s exact vocabulary, and overlap is what the repo's no-punishment rule implies. | if rejected, the alternative is six hard grades, which reintroduces gating and needs a migration |
| **D2** | **Science as the fourth stream**, Quran-anchored from the first word (م٤) | **Approve**, with the science stream starting at one station (P11), not eight | without it, "K–5 in the main subjects" is three subjects, not four |
| **D3** | The four ranks (م١ نصّ · م٢ قصّة · م٣ معنًى · م٤ أثر) and the four guards (§3.2) | **Approve.** These are what make "Islam is central" testable instead of aspirational. | this is the load-bearing decision; everything else is scheduling |
| **D4** | **لا إعجاز بلا تفسير** — تدبّر yes, إعجاز only with a cited tafsir | **Approve in full.** It is the difference between an app that ages well and one that dates badly. | if relaxed, science units may assert claims nobody can defend |
| **D5** | Place **الكون next to القرآن** in the daily visit | **Approve**, but it is the one change a child feels immediately — and **only once the science station is live** | otherwise the order stays as it is |
| **D6** | The science stream's guardian | **The hoopoe (الهدهد)** — the bird of an-Naml who brought news of a sign and inspected it; its art is already in the repo | a new keeper instead costs one sprite and one story |
| **D7** | The science ayah table in §5.4 is a **scope draft** | **Approve as draft**, and P11's first act is the review record — not the writing | the alternative is unverified text reaching a child, which the repo forbids |
| **D8** | The `fikr-dashboard` bridge (§8) ships as its own phase (P15) and its own PR | **Approve.** Neither app is blocked on the other. | wiring it now would couple two privately-versioned apps |

Two items stay open on purpose, and neither blocks P10:
- **Which band a given child starts in** — age-derived by default, parent-adjustable; the exact default ages are yours to set against your school's intake.
- **Whether the teacher-side codes (`1:1-1`) map to the child's units at all, or only to the spine.** That is a question about your school's timetable, not about this codebase.

---

## 13. What this plan deliberately does not do

- It does not touch `src/store.js`, `src/App.jsx` or anything in the Quran journey outside `src/salman/` — the repo's standing rule.
- It does not author child-facing text. Every word a child reads still passes `CONTENT-REVIEW.md` first.
- It does not add a screen, a background or a panel.
- It does not change the running app. **P10 is model + tests only**; the fourth garden stays dark until its content passes review.
