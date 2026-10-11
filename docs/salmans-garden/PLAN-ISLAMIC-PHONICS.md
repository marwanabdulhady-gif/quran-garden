# Salman's Garden — «حدائق النور»: one Islamic learning method for Arabic, Math and English

> **Status: approved 2026-10-11.** All nine decisions in §12 are answered; the review protocol is [`CONTENT-REVIEW.md`](CONTENT-REVIEW.md). Phases are in §11, and **P0 (content for station 1) is the next step**. No app code has changed yet.
> Scope: **all three gardens equally.** Arabic is «حروف النور», Math is «أرقام النور», and English is «Letters of Light». Each one gets the same story-led method, not just phonics.
> Two rules the whole plan obeys: **reuse the art and audio we already own** (§8.1 — the new work is composition and ~20 sprites, not a rebuild), and **nothing is voiced or shown to the child before it passes the review record** (§7).
> Sources:
> - `source/alphabet-with-the-final-prophet.md` (28 letters)
> - `source/alphabet-with-the-companions.md` (27 chapters)
> - `source/additions-fa-and-numbers.md` (the missing ف companion story and the number stories, researched, sourced and verified)

---

## 1. The idea in one paragraph

Jolly Phonics works because every unit of learning gets **a story, an action, a picture, a song and a shape to trace**, taught in a fixed order. The child then *uses* it right away. We keep that method, make the content Islamic, and apply it to **all three gardens**:

| | Arabic «حروف النور» | Math «أرقام النور» | English «Letters of Light» |
|---|---|---|---|
| Unit | a letter sound (بَ) | a number (٣) | a sound (/s/) |
| Story | a Prophet ﷺ story + a companion story, from the two books | a Quran or hadith story where the number really appears, e.g. ٣ = he drank in three breaths (Muslim 2028) | a Quran story in simple English, e.g. /s/ = Sulaiman and the ant (an-Naml 18) |
| Action | a gesture (knock on the door for باب) | fingers showing the number | a gesture |
| Chant | 2 lines, voice only | a counting chant | 2 lines, voice only |
| Trace | letter body, then dots | ١٢٣ and 123 | lowercase letter |
| Use it | blend and segment words | count, compare, add | blend and segment words |
| Good deed | from the book's «فكرة تربوية» | from the story (drink in 3 breaths) | from the story (be gentle with ants) |

All three share **the same 7-step daily lesson (§4)**, **the same game engines (§6)**, **the same story rules (§7)** and **the same art rules (§8)**. Only the content changes.

> **Note on the name "Jolly Phonics":** it's a trademark, and its stories, actions and songs are copyrighted. We use the *method* (synthetic phonics, multi-sensory, fixed order), which is public teaching practice. All our stories, actions, chants and art are original, so the app never says "Jolly Phonics". Working name for the whole method: **حدائق النور** (the Gardens of Light).

---

## 2. Jolly's five skills, mapped to Arabic

| Jolly skill | What it means | Our Arabic version |
|---|---|---|
| 1. Learning letter sounds | The sound first, not the name | Teach **بَ** (the sound), not «باء». The child hears and says the sound with the action and chant. |
| 2. Letter formation | How to write it | Finger tracing with a start dot and arrows. The **body of the letter first, the dots last** (that's how Arabic is written). |
| 3. Blending | Sounds → word | **Harakat train:** بَ + ا = بَا → بَاب. Starts after group 1, with real words only. |
| 4. Identifying sounds (segmenting) | Word → sounds | **Sound boxes:** hear «تَمْر», drag ت م ر into three boxes. Also «first sound» and «last sound» hunts. |
| 5. Tricky words | Words that break the rules | **كلمات مميّزة:** الله، هذا، هذه، ذلك، لكن، الرحمن، words with silent letters, and ال الشمسية (sun letters). Each is learned as a whole picture word. |

Arabic needs extra steps that English doesn't. They come after the 28 letters, as stations 8–10:
- **Harakat:** fatha, kasra, damma, then sukun.
- **Long vowels (madd):** ا و ي.
- **Tanween**, then **shadda**.
- **Letter positions:** initial, middle, final.

---

## 3. Letter order: phonics groups, not alphabetical

Today the 7 stations follow the alphabet (أ ب ت ث …). The plan below reorders them so that:
- after group 1 the child can already read **real family words** (بابا، ماما، باب);
- letters that differ only by dots (ب ت ث، ج ح خ، د ذ، ر ز، س ش، ص ض، ط ظ، ع غ) are **never in the same group**, as Jolly separates b and d;
- the hardest sounds come last: the emphatic letters ص ض ط ظ and the rarer ث غ.

| Station | Letters | Words the child can read at the end of the station (with earlier letters) |
|---|---|---|
| 1 · غابة البداية | **ا · ب · م · د** | بابا · ماما · باب · دُبّ · دَم |
| 2 · مزرعة النخيل | **ت · ن · ل · ر** | تَمْر · نار · لَبَن · بِنْت · رَمْل · دار |
| 3 · سوق المدينة | **س · ي · و · ك** | سَمَك · بَيْت · وَلَد · كَلْب · يَد · سُوق |
| 4 · واحة القمر | **ف · ق · ع · ج** | فِيل · قَلَم · قَمَر · جَمَل · عَيْن · فَم |
| 5 · خيمة الهدايا | **ح · خ · هـ · ش** | حَبْل · خَيْمَة · هَدِيَّة · شَمْس · شَجَرَة |
| 6 · جبل النور | **ص · ط · ز · ذ** | صَلاة · طَيْر · زَيْت · ذِئْب |
| 7 · قمة النجوم | **ض · ظ · غ · ث** | ضَحِك · ظِلّ · غُصْن · ثَوْب |
| 8 · أرجوحة الحركات | fatha / kasra / damma / sukun | بَ بِ بُ بْ for every letter learned so far |
| 9 · قطار المدّ | ا و ي (long vowels) · tanween | بَا بُو بِي · كِتَابٌ |
| 10 · بيت الكلمات | shadda · ال (sun and moon letters) · positions · special words | الشَّمْس · القَمَر · الله · هذا |

The **letters-adventure game** (drag the letter to its friend) follows the same 7 groups, so each station's game matches what was just learned.

---

## 4. One unit, one day: the same 7 steps for a letter, a number or an English sound (the daily 10 minutes)

A new unit (an Arabic letter, a number or an English sound) is taught on one day, then reviewed over the next days (Leitner, as now). Every new-unit day has the same 7 steps; the example below is the letter ب. The child learns the routine and feels safe.

| # | Step | Time | What happens |
|---|---|---|---|
| 1 | **The story door** | 1 min | The hoopoe opens a storybook. Scene 1 of the story appears with sound and a gentle Ken Burns pan. |
| 2 | **The story** | 2 min | A short child version (60–90 words, full tashkeel). The key word glows each time it's said. Three panels turn like pages. |
| 3 | **Sound + action + chant** | 1 min | «هذا صوت بَ … بَ بَ بَ». The mascot does the action; the child copies it. A two-line chant, voice only. |
| 4 | **Sound hunt** | 1 min | Tap everything in the scene that starts with بَ: باب، بطة، بيت. Wrong taps give a soft "try again". |
| 5 | **Trace** | 2 min | Trace the letter body, then the dots: three times on a big letter, once on a small one. |
| 6 | **Play** | 2 min | One mini-game from the catalogue (§6), rotating each day. |
| 7 | **Today's good deed** | 1 min | From the book's «فكرة تربوية», as one action, e.g. «اليوم: نردد مع المؤذن» (ب: «اطرق الباب واستأذن»). The parent ticks it in parent mode, and it earns a ⭐ and grows a flower in the garden. |

- **Day 2** of each letter is the **companion story**, with the same steps but a different scene and game.
- **Review days** mix learned letters: sound hunt, blending and sound boxes.

---

## 5. The 28 letters: content map

Key words and stories come from the two books (story summaries checked against the source text). **The actions and good deeds are my proposals for your review** (and the teacher's).

| Letter | Sound | Prophet ﷺ story (key word) | Companion story (key word) | Action (proposal) | Good deed (from the book's educational idea) |
|---|---|---|---|---|---|
| ا/أ | أَ | Mount Uhud «هذا جبل يحبنا» (أُحُد) | Abu Mahdhura the muezzin (أذان) | Cup a hand to the ear, like listening to the adhan | Repeat after the muezzin |
| ب | بَ | Anas at the Prophet's door: asking permission (باب) | Fatima, the Prophet's daughter (بنت) | Knock on a door in the air | Knock and ask permission |
| ت | تَ | Zakat dates shared with the poor (تمر) | The clever trader (تاجر) | Put a date in your mouth | Share dates |
| ث | ثَ | Little Umm Khalid's new garment (ثوب) | Jabir ibn Abdullah (ثلاثة) | Tug your shirt | Say thank you for new clothes |
| ج | جَ | Young Abdullah ibn Ja'far and the camel (جمل) | The Prophet's neighbour (جار) | Hands as a camel's hump, bouncing | Be kind to animals and neighbours |
| ح | حَ | The rope trick on a sleeping friend: don't frighten others (حبل) | The Prophet's grandson (حفيد) | Pull a rope hand over hand | Never frighten a friend, even as a joke |
| خ | خَ | The tent on the Hijra road (خيمة) | The Prophet's speaker (خطيب) | Make a tent roof with both hands | Welcome guests |
| د | دَ | The rooster and Allah's creatures (ديك) | Abu Hurairah (دعاء) | Flap your arms like a rooster | Morning dua |
| ذ | ذَ | The shepherdess and the wolf near Uhud (ذئب) | Abdullah ibn Abbas (ذكاء) | Wolf ears on your head | Ask a good question |
| ر | رَ | The imam of Quba who loved «قل هو الله أحد» (رجل) | Abdullah ibn Umar (رؤيا) | Roll your hands (the trilled r) | Recite «قل هو الله أحد» |
| ز | زَ | Visiting the Ansar's homes (زيت) | The visit to Ali's house (زيارة) | Pour oil | Visit a relative |
| س | سَ | His love of the miswak (سواك) | Aisha's question (سؤال) | Brush your teeth with a miswak | Miswak before prayer |
| ش | شَ | The tree that came to him on a journey (شجرة) | The Prophet's horseman (شرب) | Arms swaying like branches | Drink sitting down |
| ص | صَ | His grandchildren at the prayer (صلاة) | The little imam (صلاة) | Hands up for takbir | Pray next to Baba |
| ض | ضَ | He smiled at Jarir every time (ضحك) | The two friends and the Quran (ضوء) | Hold your belly laughing | Smile at your brother |
| ط | طَ | A child eating with the Prophet ﷺ (طعام) | The Prophet's muezzin (طريق) | Spoon to mouth | Say bismillah and eat with the right hand |
| ظ | ظَ | Patience in the shade of the Ka'bah (ظل) | Uqbah ibn Amir (ظلام) | Shade your eyes with your hand | Be patient when someone is unkind |
| ع | عَ | The dua he taught his uncle al-Abbas (عم) | Mu'adh ibn Jabal (عالم) | Arms open for a hug | Learn the dua «اللهم إني أسألك العافية» |
| غ | غَ | The two trees in the valley (غصن) | Abu Bakr and Abu Sa'id (غضب) | Gargle sound + bend a branch | When angry: sit down and stay quiet |
| ف | فَ | His brave night ride (فرس) | **Added:** Anas ibn Malik, «أنت مع من أحببت» (فَرَح), Bukhari 3688, Muslim 2639 (verified). See `source/additions-fa-and-numbers.md` | Gallop | Make a «tree of those we love» |
| ق | قَ | Usayd ibn Hudayr's recitation (قرآن) | Abdullah ibn Mas'ud (قرآن) | Open your hands like a mushaf | Listen to one ayah |
| ك | كَ | The man who gave water to a thirsty dog (كلب) | The Prophet's scribe (كاتب) | Paws holding a bucket | Give an animal water |
| ل | لَ | The guest and the milk (لبن) | Aisha (لعب) | Drink from a cup | Don't fill your tummy too much |
| م | مَ | He carried his grandson into the mosque (مسجد) | Uthman ibn Abi al-As (مرض) | Hands make a dome | Go to the masjid with your family |
| ن | نَ | «The longest hand» means the most giving (نخلة / اليد العليا) | Al-Bara ibn Azib (نوم) | Arms up like a palm tree | Give something to someone in need |
| هـ | هَـ | He loved gifts and gave back (هدية) | Abdullah ibn Busr (هدية) | Hand over a gift | Give a small gift |
| و | وَ | His care for wudu (وضوء) | Jarir ibn Abdullah (وجه) | Wash your hands | Wudu with a parent |
| ي | يَ | Starting with the right (يمين) | Abdullah ibn Ja'far (يتيم) | Raise your right hand | Start with the right |

Gaps and checks from the sources:
- **ف** has no companion chapter in the book. **Filled** with an authentic story in the book's style: Anas ibn Malik and «أنت مع من أحببت» (key word فَرَح; Bukhari 3688, Muslim 2639). The alternative is Sa'd ibn Abi Waqqas, «فِدَاكَ أبي وأمي» (Bukhari 4059, Muslim 2411), but its context is battle, so it fits ages 4–6 less well. Both are in `source/additions-fa-and-numbers.md` with their sources. The story fits the book's closing section «نحبهم حتى نكون في الآخرة معهم».
- **غ** has two companion stories. Use one on Day 2 and the other on a review day.
- **ن / ه** page order in the scanned companions book needs checking against the printed copy (already noted in `source/README.md`).
- **ص** has the same key word in both books (صلاة), so the child gets two angles on one word. Good.
- The «أسئلة تربوية» and «فكرة تربوية» sections become the **parent corner** (§7) and the **good deed** (step 7).

---

## 6. Game engines: built once, used in all three gardens

Each engine takes data (letter, number or English sound), so Arabic, Math and English share the same code and the same feel.

| # | Engine | Arabic | Math | English |
|---|---|---|---|---|
| 1 | **Match to a friend** (drag) — *exists* | Letter → animal | Number → set of objects | Sound → picture |
| 2 | **Hunt in the scene** | Things starting with بَ | Count the dates in the scene | Things starting with /s/ |
| 3 | **Trace** | Body, then dots | ١ ٢ ٣ and 1 2 3 | Lowercase letters |
| 4 | **Train** (blending) | بَ + ا + ب → بَاب | Number line: what comes next? | s-a-t → sat |
| 5 | **Sound boxes** (segmenting) | تَمْر → ت م ر | Split ٥ into ٢ + ٣ | dog → d-o-g |
| 6 | **Harakat swing** | Hear بُ: fatha, kasra or damma? | More or less? | Short or long sound? |
| 7 | **Memory pairs** | Letter ↔ picture | Numeral ↔ dots | Letter ↔ picture |
| 8 | **Story sequence** | Put 3 panels in order | Before / after | Put 3 panels in order |
| 9 | **Odd one out** | Which doesn't start with سَ? | Which group isn't 3? | Which doesn't start with /m/? |
| 10 | **Good-deed tree** | Deeds done this week | Count deeds (real data!) | — |

Rules for every engine:
- Mistakes never punish: a soft sound, a hint after two tries, then the answer glows (as now).
- Every round takes ≤ 2 minutes.
- Everything works by tap (no drag needed) and has large targets.
- Audio first: the child can play without reading the instructions.

---

## 7. Stories upgrade: from raw pages to a children's storybook

Today the app shows the books' paragraphs almost as transcribed. They're long, adult-level, and often without full tashkeel. Each story becomes **two layers**:

**A. The child's story (in the app, narrated)**
- 60–90 words in 3 short scenes, 2–3 sentences per scene.
- Full tashkeel on every word, since the child is learning harakat.
- The key word appears 3 times and glows.
- When the Prophet ﷺ's words are quoted, they stay **exactly as in the source**, short and in «» quotes. Everything else is a simple retelling.
- Always write ﷺ, and رضي الله عنه/عنها.
- Ends with one question: who, what, how did they feel, or what would you do.

**B. The parent corner (parent mode, not narrated)**
- The full source text, the hadith with its reference (تخريج), and the book's «أسئلة تربوية / فكرة تربوية».
- "Talk about it at dinner": 2 questions.

**Writing and review process (nothing is voiced or shown to the child before it passes):**
1. I draft the child version from the source, for all 57 Arabic stories (28 Prophet ﷺ stories + 29 companion stories: the 27 book chapters, a second story for غ, and the added ف story), plus 12 Math and 42 English stories.
2. I run the six checks of [`CONTENT-REVIEW.md`](CONTENT-REVIEW.md) on each story — source and reference, the exact wording inside «», the Arabic and tashkeel, the age fit, the wording of ﷺ and رضي الله عنه, and the story shape (key word ×3, one action, one good deed) — and record the row in the review log with the source link.
3. Only stories whose row is ✅ (or 🟡 with the note written) are voiced (voice-00) and get their scene composed. Every story keeps its source link in the app, so a parent can re-check it and can stop any story by changing its row.

---

## 8. Visual plan — reuse what we own (decided 2026-10-11)

**Decision: no rebuild.** Everything the three gardens need is already in the repo, and the new content is *composed* from it, not drawn again. Image generation happens only for the few objects that nothing in the library can stand in for.

### 8.1 What we already own (the library we reuse)

| Category | Count | Where | Reused for |
|---|---|---|---|
| Garden backgrounds (16:9) | 4 | `public/salman/art/bg-{arabic,math,english,quran}.jpg` | the garden and station screens of all three gardens |
| Guide mascots (transparent PNG) | 4 + Salman | `mascot-{hoopoe,squirrel,silkworm,salman}.png` | story narrator, action demos, good-deed scenes |
| Letter animals | 28 | `art/animals/*.png` | the letter card, the «الحرف ← الحيوان» game, and every story whose key word is an animal (جمل، ذئب، كلب، حصان …) |
| Count objects | 5 | `art/count/{apple,egg,fish,flower,star}.png` | the counting scenes and the new number games |
| Math story scenes | 16 | `art/stories/math-*.jpg` | station 4 (١٣–٢٠) and review days, unchanged |
| Quran-garden scenery | 10 trips + 4 tafa cards + 7 backgrounds | `public/assets/trip-*.jpg`، `tafa-*.jpg`، `bg-*.jpg` | the scenery layer of every Arabic and English story scene |
| Sprites: decor · hero · rewards | 8 · 4 · 3 | `public/assets/decor-*.png`، `hero-*.png`، `medal-rosette-t.png`، `trophy-t.png`، `gift-t.png` | good-deed stickers, reward moments |
| Badges · gifts | 10 · 6 | `art/badges/`, `art/gifts/` | unchanged |
| Audio: instructions · letters · stories | 10 · 28 · 45 | `public/salman/audio/` | instructions and letter clips reused as they are; the 25 English story clips stay as extra reading, and the 20 counting clips stay in station 4 |
| PWA icons | 3 | `public/salman/icons/` | unchanged |

### 8.2 A story scene is a composition, not a new image

Every story panel is layered in code from what we own:

1. **Scenery** — one of the 14 scenery images (10 trips + 4 tafa), gently dimmed and tinted with the garden colour.
2. **Subject** — an animal PNG, or one of the few new object sprites (§8.3).
3. **Decor** — a `decor-*.png` sprite for life and motion (birds, butterflies).
4. **Type** — the key word in large watercolour type; the one element that is always "new", and it is text, not art.

This is what removes the 168-panel budget: **the pilot needs zero panel images**, and the whole program needs ~20 sprites instead of ~200 images.

### 8.3 The delta we still need (small, phased)

| Asset | Count | Notes |
|---|---|---|
| Object sprites — one per story object nothing covers (باب، تمر، ثوب، حبل، خيمة، ديك، سواك، شجرة، سجادة، طعام، ظلّ، غصن، فرس، مصحف، كوب لبن، مسجد، نخلة، هدية، إبريق، كفّ) | ~20 (≈4 in the pilot) | transparent PNG, 256 px, ≤40 KB, watercolour, **no faces** |
| Action icons | **0 images** | SVG drawn in code (a hand knocking, a trunk, a rope pull …), one stroke style, tinted per garden |
| Tracing paths | **0 images** | SVG paths in code: letter body then dots (Arabic), ١٢٣ and 123, lowercase letters |
| Sound-hunt scenes | **0 images** | the scenery itself + sprites; the items *are* the sprites |
| Good-deed stickers | **0 images** | reuse `decor-*.png` and `art/gifts/` |
| Numeral cards · letter cards · sound cards | **0 images** | type and colour, drawn in code |

**Byte budget (a gate in every phase):** the pilot adds ≤ 200 KB of images; the whole program ≤ 1 MB.

### 8.4 Depiction rules (**approved 2026-10-11, unchanged**)
- **Never show** the Prophet ﷺ, any prophet, the companions, the Mothers of the Believers or angels: no faces, no figures, no silhouettes.
- **Show instead:** places (Madinah, the mosque, palm groves, Uhud at sunset), objects (the door, dates, the garment, the miswak), animals (the camel, the rooster, the horse), light and nature.
  - Example for the ب story: a wooden door of an old Madinah house, a small hand knocking, from the child's point of view.
- **Salman (the child mascot)** appears only in "today's deed" scenes, doing the deed himself (knocking, giving water to a cat). He never stands in for a story character.
- **Modest dress** for any generic child or family figure. **No music instruments** in any scene.

### 8.5 Screens: reuse, then extend
- The existing garden, station and letter screens stay. The Letter Day adds the 7 step-chips as a row inside the letter screen, not as a new screen.
- The existing «صِل الحرف بصديقه» screen becomes the shared **Match** engine for all three gardens (letter ← animal, number ← set, sound ← picture).
- The story screen keeps its current shape: composed panel on top, large narrated text below, the key word glowing in the garden colour, page dots, and the big replay button.

---

## 9. English garden «Letters of Light»: the same method, with Islamic stories — **approved 2026-10-11**

**Update 2026-10-11 (after the owner's note that the first English stories were too plain):** the sound *set and grouping* follow the widely used synthetic-phonics order (Jolly Phonics, 42 sounds in 7 groups: 1) s a t i p n · 2) c k e h r m d · 3) g o u l f b · 4) ai j oa ie ee or · 5) z w ng v oo oo · 6) y x ch sh th th · 7) qu ou oi ue er ar). **The story texts are ours**: no text is copied from that (copyrighted) programme — we take the sound sequence and write longer, warmer stories from our own pool of prophets and companions, and each unit links back to its Arabic-letter unit (`related`) so the same story lives in both gardens. Groups 1 (s a t i p n) and 2 (c k e h r m d) are written, recorded and reviewed in [`CONTENT-REVIEW.md`](CONTENT-REVIEW.md) §3.4.

- **Sounds:** move from today's 25 single letters to the full synthetic-phonics set of **42 sounds in 7 groups**, in the standard teaching order: s a t i p n · c k e h r m d · g o u l f b · ai j oa ie ee or · z w ng v oo oo · y x ch sh th th · qu ou oi ue er ar.
  - That order is public teaching practice. **The stories, actions and songs are ours.**
- **Stories: Quran stories told in simple English**, so English carries the same values as Arabic. Each sound's story is a Quran story whose key word starts with that sound. The first two groups:

| Sound | Key word | Story (source) | Action | Good deed |
|---|---|---|---|---|
| s | Sulaiman / ants | The ant warns the others and Sulaiman smiles (an-Naml 18–19) | Wiggle fingers like marching ants, "sss" | Be gentle with small creatures |
| a | Adam | Allah taught Adam the names of all things (al-Baqarah 31) | Point to things and name them | Learn one new word |
| t | tree | Maryam shakes the palm tree and dates fall (Maryam 25) | Shake a tree trunk | Eat dates, say bismillah |
| i | Ibrahim & Ismail | Building the Ka'bah together (al-Baqarah 127) | Stack bricks with both hands | Help Baba build or fix something |
| p | pen | "He taught by the pen" (al-Alaq 4) | Write in the air | Draw or write something kind |
| n | Nuh | Building the ark and the animals boarding (Hud 37–44) | Hammer, "n-n-n" | Be patient |
| c / k | cave / Ka'bah | The young men in the cave (al-Kahf 10) | Hands make a cave | Make dua when worried |
| e | elephant | The army of the elephant and the birds (al-Fil) | Swing your arm like a trunk | Allah protects His House |
| h | hoopoe | The hoopoe brings news to Sulaiman (an-Naml 20–22) | Flap wings, "h-h-h" | Tell the truth |
| r | rain | Allah sends blessed rain from the sky (Qaf 9) | Wiggle fingers down like rain | Say the dua when it rains |
| m | Musa | The sea parts for Musa (ash-Shu'ara 63) | Hands part like the sea | Trust Allah |
| d | Dawud | The mountains and birds praise Allah with Dawud (Saba 10) | Hands up, sway | Say SubhanAllah |

  - The other 30 sounds are drafted the same way in P0. Sounds that are hard to match to a Quran word (ng, x, qu …) use everyday Muslim family life instead (a king's ring, a box of gifts for Eid, the Queen of Saba for qu).
  - The 25 current English stories are kept as **extra reading stories** for blending practice.
- **Never depict** prophets: the same art rules as §8.2. We show the ants, the ark, the palm tree, the sea and the birds.
- **Actions and chants:** original and voice-only.
- **Tricky words:** I, the, he, she, me, we, be, was, to, do, are, all … taught as picture words.
- **Same engines** (§6): hunt, trace, train (s-a-t), sound boxes, memory, odd one out.
- **Voice:** voice-00 in English, which is still untested. Proposal: audition 3 sounds before producing 42.

---

## 10. Math garden «أرقام النور»: the same method, with authentic stories — **approved 2026-10-11**

Each number gets the same full treatment as a letter:
- a **story** from the Quran or authentic hadith where the number really appears;
- a **finger action** and a **counting chant**;
- **tracing** of both ١٢٣ and 123;
- a **hunt scene** and a **good deed**.

The full texts, written in the books' style, are in `source/additions-fa-and-numbers.md`. All of them were researched, and every source is listed.

**Verification (2026-10-11):** every hadith reference here and in the additions file was matched against sunnah.com (Sahih al-Bukhari / Sahih Muslim, Darussalam numbering), and every Quran reference against the Uthmani text (api.quran.com). The verification log is at the end of `source/additions-fa-and-numbers.md`. What remains is human: matching the numbers to the printed edition the family uses, and the teacher/scholar review — nothing is voiced before that.

| Number | Story | Source | Good deed |
|---|---|---|---|
| ١ | «قل هو الله أحد», one finger in tashahhud | al-Ikhlas 1 | Recite al-Ikhlas |
| ٢ | «ركعتا الفجر خير من الدنيا وما فيها» | Muslim 725 | Count two rak'ahs |
| ٣ | He ﷺ drank in three breaths | Muslim 2028, Bukhari 5631 | Drink in 3 breaths |
| ٤ | Ibrahim and the four birds | al-Baqarah 260 | Count 4 birds outside |
| ٥ | The five rights of a Muslim (and five prayers) | Bukhari 1240, Muslim 2162 | Return the salaam, say «يرحمك الله» |
| ٦ | The heavens and earth in six days | al-A'raf 54 | Count 6 things Allah made |
| ٧ | Seven in the shade of Allah: «شاب نشأ في عبادة الله» | Bukhari 660, Muslim 1031 | Love your friends for Allah |
| ٨ | Eight gates of Jannah, one called ar-Rayyan | Bukhari 3257 | Draw 8 doors |
| ٩ | Nine clear signs to Musa | al-Isra 101 | Fold fingers and count |
| ١٠ | A good deed is worth ten | al-An'am 160 | 1 deed = 10 stars (first taste of multiplying) |
| ١١ | Yusuf's eleven stars | Yusuf 4 | Count 11 stars |
| ١٢ | Twelve springs from the rock (and 12 months) | al-Baqarah 60, at-Tawbah 36 | Share water fairly |
| ١٣–٢٠ | The current counting stories (squirrel, stars, roses …), each with a good deed added | — | — |
| ١٠٠ (later) | «إني لأستغفر الله في اليوم مائة مرة» | Muslim 2702 | Count istighfar in tens |

Stations, each built from 4 number days:
1. ١–٤
2. ٥–٨
3. ٩–١٢
4. ١٣–٢٠ (counting stories)
5. More / less and comparing
6. Number bonds to 10, "fair sharing" (the 12 springs)
7. Shapes and patterns in the masjid: the dome, the arch, the minaret, geometric patterns

The current math stories and their 16 scene images are reused in station 4 and in review days.

---

## 11. Phases (each phase ends at a gate we can see)

Rules in every phase: build on the existing screens and engines, reuse the library in §8.1, generate art only for the sprites in §8.3, and check the byte budget in the same pass. The content review (§7) is run by me, with the protocol and the records in [`CONTENT-REVIEW.md`](CONTENT-REVIEW.md), **before anything is voiced or shown to the child**.

**Each phase gets its own pull request**, so the plan PR stays docs-only: PR #7 = the plan and the decisions; then P0, P1, P2 … each opens its own PR with its gate results written in the description.

**حالة التنفيذ (2026-10-11):** P0 وP1 ✅ منجزان، وP2 🟡 يعمل وينتظر 18 مقطعًا صوتيًا وبوابة الطفل — التفصيل في [`PHASES.md`](PHASES.md) وفي PR #7. ونص الطفل يُكتب في وحدة البيانات نفسها (`src/salman/data/nour.js`) لأنها مصدر التطبيق الوحيد، وسجلّ المراجعة في `CONTENT-REVIEW.md` — بدل ملفات `content/*.md` المذكورة أدناه.

| Phase | What | What it reuses | Output | Gate |
|---|---|---|---|---|
| **P0 — Content, station 1** | Child versions for the first station of each garden: Arabic **ا ب م د** (أُحُد، باب، مسجد، ديك + أذان، بنت، مرض، دعاء = 8 stories), Math **١–٤**, English **s a t i** — each with story, action, voice-only chant and good deed | the two book transcriptions, `additions-fa-and-numbers.md`, the review protocol | `docs/salmans-garden/content/{arabic,math,english}/*.md` + a review record per story | every story has a record and a source link; 16 stories signed off |
| **P1 — Engines, on the existing screens** | Hunt, trace, train (blending) and sound boxes as small data-driven components; Match refactored to take any pair | `src/huroof/` level map and match game, `salman/lib/catalog.js`, `leitner.js` | one shared engine module + tests | unit tests pass; the four engines work by tap and by keyboard; no new screen invented |
| **P2 — Pilot: station 1 × 3 gardens** | A playable Letter Day for ا ب م د · ١–٤ · s a t i, chants voice-only, tracing | all of §8.1 | the first station of each garden playable end-to-end; ≤ 4 new sprites | a 10-minute real-child session with written notes; image budget ≤ 200 KB |
| **P3 — Arabic, stations 2–7** | The other 24 letters, in batches of 4 letters | the two books, the same screens, the same engines | 28 letters live | a review record per batch + the child gate per station |
| **P4 — Arabic, stations 8–10** | harakat, madd, tanween, shadda, ال, special words | the tracing engine | blending stations | the child reads 10 real words aloud |
| **P5 — English, groups 2–7** | the remaining sounds of the 42 | the 25 existing stories as extra reading, the existing backgrounds | 42 sounds live in 7 groups | a child gate per group |
| **P6 — Math, stations 2–7** | numbers ٥–٢٠, comparing, number bonds to 10, shapes in the masjid | the 16 math scenes and the 5 count objects | 7 math stations live | a child gate per station |
| **P7 — Story polish** | the second and third scenes per story, where they earn their place | existing sprites | full storybooks | — |

**Pilot effort** (the number that matters): 16 child stories · 4 new sprites · **0 new panels** · 0 new screens · 0 new backgrounds · ~60 audio clips · 4 shared engines.

---

## 12. Decisions — answered 2026-10-11

| # | Decision | Answer | Effect |
|---|---|---|---|
| 1 | Letter order | **Phonics groups** (§3) | stations 1–7 are reordered; the current alphabet order retires |
| 2 | Chants | **Voice only, no instruments; clapping allowed** | no music assets and no beat; a chant is a spoken couplet |
| 3 | Depiction rules (§8.4) | **Approved as written** | no prophet, companion or angel is ever depicted |
| 4 | The ف companion story | **Anas ibn Malik, «أنت مع من أحببت»** (فَرَح; Bukhari 3688, Muslim 2639) | Sa'd «فِدَاء» stays in the file as the unused alternative |
| 5 | Story review | **I search, verify and quality-assure** — protocol and records in [`CONTENT-REVIEW.md`](CONTENT-REVIEW.md), with a source link per story | the human-scholar gate becomes a documented agent review; every story keeps its source so a parent can re-check it |
| 6 | English | **42 sounds in 7 groups, with Quran stories in English** (§9) | the 25 current stories become extra reading |
| 7 | Math | **number stories ١–١٢ and the 7 stations approved** (§10) | station 4 keeps the current counting stories |
| 8 | Name | **«حدائق النور» · «حروف النور» · «أرقام النور» · «Letters of Light»** | used in the app, the parent area and the docs |
| 9 | Pilot | **station 1 of all three gardens first (P0–P2)** | no other station is built before the pilot passes its child gate |

Two items stay open on purpose, and neither blocks P0:
- **Matching the hadith numbers to the printed edition** the family uses (the files currently use sunnah.com's Darussalam numbering).
- **The two-book proofread** already tracked in [`source/README.md`](source/README.md).
