# Salman's Garden — Islamic Phonics plan ("حروف النور")

> **Status: plan for review. Nothing here is implemented.** Code starts only after you approve the decisions in §12.
> Scope: the Arabic garden first. The same method then applies to the English and Math gardens.
> Sources: `source/alphabet-with-the-final-prophet.md` (28 letters) and `source/alphabet-with-the-companions.md` (27 chapters).

---

## 1. The idea in one paragraph

Jolly Phonics works because each sound gets **a story, an action, a picture, a song and a letter shape**, taught in a fixed order. The child then uses the sounds right away to **blend** and **segment** real words. We keep that method and make the content Islamic:

- Every Arabic letter gets **two stories**: one from the Prophet ﷺ's life (final-prophet book) and one about a companion (companions book).
- Every letter also gets an **action**, a short **chant**, a **picture**, a **tracing path** and one small **good deed** the child does at home.

The English and Math gardens reuse the same lesson shape and the same game engines.

> **Note on the name "Jolly Phonics":** it's a trademark, and its stories, actions and songs are copyrighted. We use the *method* (synthetic phonics, multi-sensory, fixed order), which is public teaching practice. All our stories, actions, chants and art are original, so the app never says "Jolly Phonics". Working name: **حروف النور** (the Letters of Light).

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

## 4. One letter, one "Letter Day" (the daily 10 minutes)

A new letter is taught on one day, then reviewed over the next days (Leitner, as now). Every new-letter day has the same 7 steps. The child learns the routine and feels safe.

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
| ف | فَ | His brave night ride (فرس) | **⚠️ No chapter in the companions book. Needs a source story.** | Gallop | Be brave and help |
| ق | قَ | Usayd ibn Hudayr's recitation (قرآن) | Abdullah ibn Mas'ud (قرآن) | Open your hands like a mushaf | Listen to one ayah |
| ك | كَ | The man who gave water to a thirsty dog (كلب) | The Prophet's scribe (كاتب) | Paws holding a bucket | Give an animal water |
| ل | لَ | The guest and the milk (لبن) | Aisha (لعب) | Drink from a cup | Don't fill your tummy too much |
| م | مَ | He carried his grandson into the mosque (مسجد) | Uthman ibn Abi al-As (مرض) | Hands make a dome | Go to the masjid with your family |
| ن | نَ | «The longest hand» means the most giving (نخلة / اليد العليا) | Al-Bara ibn Azib (نوم) | Arms up like a palm tree | Give something to someone in need |
| هـ | هَـ | He loved gifts and gave back (هدية) | Abdullah ibn Busr (هدية) | Hand over a gift | Give a small gift |
| و | وَ | His care for wudu (وضوء) | Jarir ibn Abdullah (وجه) | Wash your hands | Wudu with a parent |
| ي | يَ | Starting with the right (يمين) | Abdullah ibn Ja'far (يتيم) | Raise your right hand | Start with the right |

Gaps and checks from the sources:
- **ف** has no companion chapter. A source story needs to be chosen by the reviewing teacher. **I won't invent one.**
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

**Writing and review process (unchanged rule: nothing is voiced before review):**
1. I draft the child version from the source, for all 56 stories (28 Prophet ﷺ stories + 28 companion stories: ف has none, غ has two).
2. A teacher or scholar checks the meaning and the hadith wording. I mark each story `approved` or `needs-change`.
3. Only approved stories are voiced (voice-00) and illustrated.

---

## 8. Visual plan

### 8.1 Style bible (keeps what already exists)
- **Watercolor**, soft paper texture, warm light, the same style as the current 28 animals and garden backgrounds.
- Each garden keeps its color: Arabic coral #fb7185, Math green #22c55e, English yellow #eab308, Quran teal #14b8a6.
- The guide characters stay: the hoopoe (Arabic), the squirrel (Math), the silkworm (English), Salman (the child hero).

### 8.2 Depiction rules (Islamic): to confirm in §12
- **Never show** the Prophet ﷺ, any prophet, the companions, the Mothers of the Believers or angels: no faces, no figures, no silhouettes.
- **Show instead:** places (Madinah, the mosque, palm groves, Uhud at sunset), objects (the door, dates, the garment, the miswak), animals (the camel, the rooster, the horse), light and nature.
  - Example for the ب story: a wooden door of an old Madinah house, a small hand knocking, from the child's point of view.
- **Salman (the child mascot)** appears only in "today's deed" scenes, doing the deed himself (knocking, giving water to a cat). He never stands in for a story character.
- **Modest dress** for any generic child or family figure. **No music instruments** in any scene.

### 8.3 Assets per letter
| Asset | Count | Notes |
|---|---|---|
| Letter card (big letter + key-word picture) | 28 | Reuse the 28 animals where the key word is an animal (جمل، ديك، ذئب، كلب، فرس) |
| Story panels | 28 × 2 stories × 3 panels = 168 | **Phase it:** 1 hero panel per story first (56), the other 2 later |
| Action icons (mascot doing the action) | 28 | Small, 2 frames: a simple loop, not video |
| Sound-hunt scenes | 7 (one per station) | One big scene per station that holds items for its 4 letters, reused for review |
| Tracing paths | 28 + harakat | **SVG vector paths, not images**: stroke order, start dot, arrows |
| Good-deed stickers | ~25 | For the good-deed tree |

**Budget note:** image generation has been about 10 images per turn, so the 56 hero panels take about 6 turns and all 168 panels about 17. That's why the plan starts with a pilot (§11).

### 8.4 Screen layouts (no code, just the look)
- **Story screen:** a full-width panel on top (16:9), large narrated text below with the key word in coral, page dots, and a big 🔊 replay.
- **Letter screen:** a giant letter on the left with the action icon on the right, the sound button, then the 7 step-chips of the Letter Day as a path (lit when done).
- **Station screen:** the station scene as the background. The 4 letters are stones on a path, then come the station game and the blending words of the station.

---

## 9. English garden: the same method, original content

- **Sounds:** move from today's 25 single letters to the full synthetic-phonics set of **42 sounds in 7 groups**, in the standard teaching order: s a t i p n · c k e h r m d · g o u l f b · ai j oa ie ee or · z w ng v oo oo · y x ch sh th th · qu ou oi ue er ar.
  - That order is public teaching practice. **The stories, actions and songs are ours.**
- **Stories:** the 25 current stories stay where their sound matches. New stories are short and set in a Muslim family's everyday life: salaam, sharing, the masjid, Eid, wudu, kindness to animals. Example: «s — Sami says salaam to the sun as it rises».
- **Actions and chants:** original, voice-only, the same rules as Arabic.
- **Tricky words:** I, the, he, she, me, we, be, was, to, do, are, all … taught as picture words.
- **Same engines** (§6): hunt, trace, train (s-a-t), sound boxes, memory, odd one out.
- **Voice:** voice-00 in English, which is still untested. Proposal: audition 3 sounds before producing 42.

---

## 10. Math garden: the same method

Each number gets a **mini story** from Islamic daily life, an **action** (fingers), a **trace path** (both ١٢٣ and 123) and a **hunt scene**. Examples:

| Number | Story idea | Real-life link |
|---|---|---|
| ١ | One Allah: we say «قل هو الله أحد» | Raise one finger (the tashahhud finger) |
| ٢ | Two hands for wudu | Wash both hands |
| ٣ | Three dates at iftar | Count dates at the table |
| ٥ | Five prayers in the day | The prayer chart |
| ٧ | Seven days of the week, Friday is Jumu'ah | Week calendar |
| ١٠ | Ten fingers that make dhikr | Count tasbeeh on the fingers |
| … to ٢٠ | Rak'ahs, the 30 juz' (later), the months … | — |

Stations:
1. 1–5
2. 6–10
3. 11–20
4. More / less
5. Number bonds to 10
6. Shapes in the masjid: the dome, the arch, the minaret
7. Patterns: Islamic geometric patterns, *copying and continuing a pattern*

The current math stories and the 16 scene images are reused.

---

## 11. Roadmap (each phase has a 10-minute real-child gate, as now)

| Phase | What | Output | Gate |
|---|---|---|---|
| **P0 — Content** | Child versions of the stories for station 1 (ا ب م د), actions, chants, good deeds | `content/letters/*.md`, reviewed | Teacher or scholar review signed off |
| **P1 — Engines** | Hunt, trace, train and sound boxes as data-driven components (match already exists) | Shared engine module + tests | All 4 engines work by tap and keyboard |
| **P2 — Pilot station 1** | Full Letter Day for ا ب م د: stories, panels (hero only), actions, tracing, games | Station 1 playable end-to-end | **Salman plays 4 Letter Days**, and we watch what works |
| **P3 — Arabic 2–7** | Repeat P0 and P2 for the other 24 letters, in batches of 4 | 28 letters | Real-child gate per station |
| **P4 — Arabic 8–10** | Harakat, madd, tanween, shadda, ال, special words | Blending stations | Child reads 10 real words |
| **P5 — English** | 42 sounds in 7 groups, same engines | English stations | Gate per group |
| **P6 — Math** | Number stories and stations 1–7 | Math stations | Gate per station |
| **P7 — Panels 2 and 3** | The remaining story panels | Full storybooks | — |

Rough effort for station 1:
- 8 child stories
- 8 hero panels + 4 action icons + 1 hunt scene
- ~30 audio clips: sounds with 3 harakat, words, chants, stories
- 4 engines

---

## 12. Decisions needed from you before any code

1. **Letter order:** switch to the phonics groups in §3, or keep the alphabet? *(I recommend phonics groups.)*
2. **Chants:** voice only, no instruments, and no musical beat? *(I recommend voice only, with clapping allowed.)*
3. **Depiction rules** in §8.2: approve as written?
4. **The ف companion story:** who chooses the source story?
5. **Story review:** who is the teacher or scholar for the 56 child versions and the hadith wording?
6. **English:** move to 42 sounds and 7 groups? *(I recommend yes.)*
7. **Name:** «حروف النور» for the method inside the app, or another name?
8. **Pilot first:** build station 1 fully (P0–P2) before anything else? *(I recommend yes.)*
