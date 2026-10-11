# فهرس ملفات حديقة سلمان

> ملف مُولَّد من البيانات والملفات الفعلية. كل مسار نسبي إلى جذر المستودع `/home/user/quran-garden` إلا ما ذُكر أنه خارجه.
> الأرقام محسوبة وقت الإنشاء: الصوت 83 مقطعًا (10 + 28 + 45)، والصور 28 حيوانًا + 10 أوسمة + 6 هدايا + 5 نمو + 4 شخصيات + 4 خلفيات + 3 أيقونات.

## 1. الكود

| الملف | الدور |
| --- | --- |
| `salman.html` | نقطة دخول التطبيق (`/salman.html`) |
| `src/salman/main.jsx` | تشغيل الواجهة |
| `src/salman/SalmanApp.jsx` | الواجهة الرئيسية: الغابة، الدرس، زيارة اليوم، الاحتفال |
| `src/salman/ParentArea.jsx` | منطقة الوالدين (PIN، الحد اليومي، ساعات الهدوء) |
| `src/salman/salman.css`، `src/salman/effects.css` | التنسيق والتأثيرات |
| `src/salman/data/gardens.js` | قصص العدّ (20) وقصص الفونيكس (25) وتعريف الحدائق |
| `src/salman/data/animals.js` | الحروف الـ28 والحيوانات (الكلمة، الإيموجي، slug، علامات الصورة والمقطع) |
| `src/salman/data/stories.generated.js` | قصص الحروف العربية (56 قصة، **مسودة**)، مُولَّد |
| `src/salman/data/quran.js` | السور والمستويات وقصص القرآن (مسودات، بلا صوت) |
| `src/salman/data/fatiha.js` | نص الفاتحة للعمل دون إنترنت |
| `src/salman/data/art.js` | مسارات الصور والخلفيات والمراحل |
| `src/salman/lib/catalog.js` | بناء العناصر لكل حديقة (الحروف والأرقام والقصص) |
| `src/salman/lib/clips.js` | مقاطع التعليمات (10) ونصوصها |
| `src/salman/lib/voice.js` | تشغيل المقاطع، والرجوع إلى صوت المتصفح عند الغياب |
| `src/salman/lib/leitner.js`، `session.js`، `store.js` | Leitner، وجلسة الزيارة، وتخزين سلمان (v2) |
| `src/salman/lib/gamify.js`، `sfx.js`، `speech.js`، `parent.js` | المكافآت، الأصوات، النطق، PIN الوالدين |

## 2. الصور (`public/salman/art/`)

### 2.1 الحيوانات (28 صورة، حرف ← حيوان)

| الحرف | الكلمة | الصورة | المقطع | علم الصورة | علم المقطع |
| --- | --- | --- | --- | --- | --- |
| أ | أسد | `public/salman/art/animals/lion.png` | `public/salman/audio/letters/letter-01.mp3` | true | true |
| ب | بطة | `public/salman/art/animals/duck.png` | `public/salman/audio/letters/letter-02.mp3` | true | true |
| ت | تمساح | `public/salman/art/animals/crocodile.png` | `public/salman/audio/letters/letter-03.mp3` | true | true |
| ث | ثعلب | `public/salman/art/animals/fox.png` | `public/salman/audio/letters/letter-04.mp3` | true | true |
| ج | جمل | `public/salman/art/animals/camel.png` | `public/salman/audio/letters/letter-05.mp3` | true | true |
| ح | حصان | `public/salman/art/animals/horse.png` | `public/salman/audio/letters/letter-06.mp3` | true | true |
| خ | خروف | `public/salman/art/animals/sheep.png` | `public/salman/audio/letters/letter-07.mp3` | true | true |
| د | دب | `public/salman/art/animals/bear.png` | `public/salman/audio/letters/letter-08.mp3` | true | true |
| ذ | ذئب | `public/salman/art/animals/wolf.png` | `public/salman/audio/letters/letter-09.mp3` | true | true |
| ر | راكون | `public/salman/art/animals/raccoon.png` | `public/salman/audio/letters/letter-10.mp3` | true | true |
| ز | زرافة | `public/salman/art/animals/giraffe.png` | `public/salman/audio/letters/letter-11.mp3` | true | true |
| س | سلحفاة | `public/salman/art/animals/turtle.png` | `public/salman/audio/letters/letter-12.mp3` | true | true |
| ش | شمبانزي | `public/salman/art/animals/chimpanzee.png` | `public/salman/audio/letters/letter-13.mp3` | true | true |
| ص | صقر | `public/salman/art/animals/eagle.png` | `public/salman/audio/letters/letter-14.mp3` | true | true |
| ض | ضفدع | `public/salman/art/animals/frog.png` | `public/salman/audio/letters/letter-15.mp3` | true | true |
| ط | طاووس | `public/salman/art/animals/peacock.png` | `public/salman/audio/letters/letter-16.mp3` | true | true |
| ظ | ظبي | `public/salman/art/animals/deer.png` | `public/salman/audio/letters/letter-17.mp3` | true | true |
| ع | عصفور | `public/salman/art/animals/sparrow.png` | `public/salman/audio/letters/letter-18.mp3` | true | true |
| غ | غوريلا | `public/salman/art/animals/gorilla.png` | `public/salman/audio/letters/letter-19.mp3` | true | true |
| ف | فيل | `public/salman/art/animals/elephant.png` | `public/salman/audio/letters/letter-20.mp3` | true | true |
| ق | قط | `public/salman/art/animals/cat.png` | `public/salman/audio/letters/letter-21.mp3` | true | true |
| ك | كلب | `public/salman/art/animals/dog.png` | `public/salman/audio/letters/letter-22.mp3` | true | true |
| ل | لاما | `public/salman/art/animals/llama.png` | `public/salman/audio/letters/letter-23.mp3` | true | true |
| م | ماعز | `public/salman/art/animals/goat.png` | `public/salman/audio/letters/letter-24.mp3` | true | true |
| ن | نحلة | `public/salman/art/animals/bee.png` | `public/salman/audio/letters/letter-25.mp3` | true | true |
| ه | هامستر | `public/salman/art/animals/hamster.png` | `public/salman/audio/letters/letter-26.mp3` | true | true |
| و | وحيد القرن | `public/salman/art/animals/rhinoceros.png` | `public/salman/audio/letters/letter-27.mp3` | true | true |
| ي | يمامة | `public/salman/art/animals/dove.png` | `public/salman/audio/letters/letter-28.mp3` | true | true |

### 2.2 باقي الصور

- الأوسمة (10): `first-star.png`، `first-visit.png`، `four-gardens.png`، `quran-level-1.png`، `quran-level-2.png`، `quran-level-3.png`، `streak-3.png`، `streak-7.png`، `ten-stars.png`، `tree.png` — في `public/salman/art/badges/`
- الهدايا (6): `bird.png`، `butterfly.png`، `flower.png`، `owl.png`، `rainbow.png`، `star.png` — في `public/salman/art/gifts/`
- مراحل النمو (5): `growth-1.png`، `growth-2.png`، `growth-3.png`، `growth-4.png`، `growth-5.png` — في `public/salman/art/`
- الشخصيات (4): `mascot-hoopoe.png`، `mascot-salman.png`، `mascot-silkworm.png`، `mascot-squirrel.png` — في `public/salman/art/`
- خلفيات الحدائق (4): `bg-arabic.jpg`، `bg-english.jpg`، `bg-math.jpg`، `bg-quran.jpg` — في `public/salman/art/`
- الأيقونات (3): `icon-192.png`، `icon-512.png`، `icon-maskable-512.png` — في `public/salman/icons/`

- الأشياء المعدودة (5، V1): `public/salman/art/count/{apple,star,flower,fish,egg}.png`، PNG شفاف 256px، تُعرض في سؤال العدّ.

## 3. الصوت (`public/salman/audio/`) — بصوت voice-00

### 3.1 التعليمات (10 مقاطع في `public/salman/audio/`)

| المفتاح | الملف | النص |
| --- | --- | --- |
| welcome | `public/salman/audio/welcome.mp3` | أهلًا يا سلمان! غابتك تنتظرك. هيا نزور حدائقها اليوم. |
| correct | `public/salman/audio/correct.mp3` | أحسنت! لقد أنبتّ نجمة جديدة في حديقتك. |
| retry | `public/salman/audio/retry.mp3` | قريب! جرّب مرة ثانية، أنت تقدر. |
| hint | `public/salman/audio/hint.mp3` | تلميح: الجواب الصحيح مضاء الآن. اختره بثقة. |
| visit-done | `public/salman/audio/visit-done.mp3` | ممتاز! انتهت زيارة اليوم، وجاءتك هدية جديدة. |
| level-unlock | `public/salman/audio/level-unlock.mp3` | فتحت مستوى جديدًا من السور! يا بطل. |
| surah-learned | `public/salman/audio/surah-learned.mp3` | ما شاء الله! حفظت سورة جديدة. افتخر بنفسك. |
| badge | `public/salman/audio/badge.mp3` | وسام جديد! أنت بطل حقيقي. |
| garden-grow | `public/salman/audio/garden-grow.mp3` | حديقتك تكبر! ظهرت شجرة جديدة. |
| streak | `public/salman/audio/streak.mp3` | أنت تزورنا كل يوم! استمر يا بطل. |

### 3.2 أسماء الحروف (28 مقطعًا في `public/salman/audio/letters/`)

`letter-NN.mp3` حيث NN ترتيب الحرف من 01 (أ) إلى 28 (ي). كل مقطع يقول اسم الحرف ثم اسم الحيوان.

### 3.3 القصص (45 مقطعًا في `public/salman/audio/stories/`)

| الحديقة | المعرّف | الوصف | الملف |
| --- | --- | --- | --- |
| عدّ | `math-01` | العدد 3 | `public/salman/audio/stories/math-01.mp3` |
| عدّ | `math-02` | العدد 5 | `public/salman/audio/stories/math-02.mp3` |
| عدّ | `math-03` | العدد 7 | `public/salman/audio/stories/math-03.mp3` |
| عدّ | `math-04` | العدد 10 | `public/salman/audio/stories/math-04.mp3` |
| عدّ | `math-s01` | العدد 1 | `public/salman/audio/stories/math-s01.mp3` |
| عدّ | `math-s02` | العدد 2 | `public/salman/audio/stories/math-s02.mp3` |
| عدّ | `math-s04` | العدد 4 | `public/salman/audio/stories/math-s04.mp3` |
| عدّ | `math-s06` | العدد 6 | `public/salman/audio/stories/math-s06.mp3` |
| عدّ | `math-s08` | العدد 8 | `public/salman/audio/stories/math-s08.mp3` |
| عدّ | `math-s09` | العدد 9 | `public/salman/audio/stories/math-s09.mp3` |
| عدّ | `math-s11` | العدد 11 | `public/salman/audio/stories/math-s11.mp3` |
| عدّ | `math-s12` | العدد 12 | `public/salman/audio/stories/math-s12.mp3` |
| عدّ | `math-s13` | العدد 13 | `public/salman/audio/stories/math-s13.mp3` |
| عدّ | `math-s14` | العدد 14 | `public/salman/audio/stories/math-s14.mp3` |
| عدّ | `math-s15` | العدد 15 | `public/salman/audio/stories/math-s15.mp3` |
| عدّ | `math-s16` | العدد 16 | `public/salman/audio/stories/math-s16.mp3` |
| عدّ | `math-s17` | العدد 17 | `public/salman/audio/stories/math-s17.mp3` |
| عدّ | `math-s18` | العدد 18 | `public/salman/audio/stories/math-s18.mp3` |
| عدّ | `math-s19` | العدد 19 | `public/salman/audio/stories/math-s19.mp3` |
| عدّ | `math-s20` | العدد 20 | `public/salman/audio/stories/math-s20.mp3` |
| فونيكس | `en-01` | الصوت s | `public/salman/audio/stories/en-01.mp3` |
| فونيكس | `en-02` | الصوت a | `public/salman/audio/stories/en-02.mp3` |
| فونيكس | `en-03` | الصوت t | `public/salman/audio/stories/en-03.mp3` |
| فونيكس | `en-04` | الصوت p | `public/salman/audio/stories/en-04.mp3` |
| فونيكس | `en-05` | الصوت i | `public/salman/audio/stories/en-05.mp3` |
| فونيكس | `en-06` | الصوت n | `public/salman/audio/stories/en-06.mp3` |
| فونيكس | `en-07` | الصوت m | `public/salman/audio/stories/en-07.mp3` |
| فونيكس | `en-08` | الصوت d | `public/salman/audio/stories/en-08.mp3` |
| فونيكس | `en-09` | الصوت g | `public/salman/audio/stories/en-09.mp3` |
| فونيكس | `en-10` | الصوت o | `public/salman/audio/stories/en-10.mp3` |
| فونيكس | `en-11` | الصوت k | `public/salman/audio/stories/en-11.mp3` |
| فونيكس | `en-12` | الصوت e | `public/salman/audio/stories/en-12.mp3` |
| فونيكس | `en-13` | الصوت u | `public/salman/audio/stories/en-13.mp3` |
| فونيكس | `en-14` | الصوت r | `public/salman/audio/stories/en-14.mp3` |
| فونيكس | `en-15` | الصوت h | `public/salman/audio/stories/en-15.mp3` |
| فونيكس | `en-16` | الصوت b | `public/salman/audio/stories/en-16.mp3` |
| فونيكس | `en-17` | الصوت f | `public/salman/audio/stories/en-17.mp3` |
| فونيكس | `en-18` | الصوت l | `public/salman/audio/stories/en-18.mp3` |
| فونيكس | `en-19` | الصوت j | `public/salman/audio/stories/en-19.mp3` |
| فونيكس | `en-20` | الصوت v | `public/salman/audio/stories/en-20.mp3` |
| فونيكس | `en-21` | الصوت w | `public/salman/audio/stories/en-21.mp3` |
| فونيكس | `en-22` | الصوت x | `public/salman/audio/stories/en-22.mp3` |
| فونيكس | `en-23` | الصوت y | `public/salman/audio/stories/en-23.mp3` |
| فونيكس | `en-24` | الصوت z | `public/salman/audio/stories/en-24.mp3` |
| فونيكس | `en-25` | الصوت q | `public/salman/audio/stories/en-25.mp3` |

## 4. نصوص القصص

- عدّ: 20 قصة في `src/salman/data/gardens.js` (`MATH_STORIES`)، مع 20 مقطعًا مسجّلًا.
- فونيكس: 25 قصة في `src/salman/data/gardens.js` (`ENGLISH_STORIES`)، مع 25 مقطعًا مسجّلًا.
- حروف عربية: 56 قصة في `src/salman/data/stories.generated.js`، **مسودة** (`draft: true`)، بلا صوت.
- قصص القرآن: 13 سورة في `src/salman/data/quran.js`، **مسودات بلا صوت** حتى مراجعة معلّم أو عالم.

## 5. المصادر والأدوات

| الملف | الدور |
| --- | --- |
| `docs/salmans-garden/source/alphabet-with-the-companions.md`، `alphabet-with-the-final-prophet.md` | نصّا الكتابين (Markdown)، والمصدر الذي بُنيت منه قصص الحروف |
| `docs/salmans-garden/source/README.md` | تحذير: النصوص غير مُدقَّقة |
| `tools/build_salman_stories.py` | `python3 tools/build_salman_stories.py --write` |
| `tools/salman-process-scenes.py` | معالجة رسوم العدّ (`count`) ومشاهد القصص (`scene`) حسب VISUALS.md |
| `tools/salman-process-animals.py` | معالجة الصور الخام: إزالة الخلفية، قص، تصغير 256، تقليل الألوان إلى 200 |
| `tools/salman-offline-check.mjs` | فحص دون إنترنت (يحتاج Chromium خارج المستودع) |
| `tools/build_journey.py` | بناء `docs/salmans-garden/journey/index.html` |

## 6. الاختبارات (`tests/`)

- `tests/salman-assets-exist.test.mjs`: كل صورة وصوت تشير إليه البيانات موجود وأكبر من 1 KB، بالجمع من البيانات نفسها.
- `tests/salman-stories.test.mjs`: تغطية العدّ 1–20، المعرّفات، أصوات الفونيكس، مطابقة الملفات، مسودة الحروف العربية.
- `tests/salman-data.test.mjs`، `salman-letters.test.mjs`، `salman-leitner.test.mjs`، `salman-gamify.test.mjs`، `salman-parent.test.mjs`، `salman-parent-ui.test.jsx`، `salman-app.test.jsx`، `salman-assets.test.mjs`، `salman-pwa.test.mjs`.

## 7. ملفات خارج المستودع (غير مُدارة من Git)

> **تنبيه (V1):** أُعيدت تهيئة البيئة، فاختفت من `/home/user/recovery/` الصور الخام للحيوانات (28)، ولوحات مراجعتها، وسكربت المعالجة الأصلي، ومجلد الفحص دون إنترنت. الصور المعالجة للحيوانات كاملة في Git (`public/salman/art/animals/`)، لكن **إعادة معالجتها لن تعمل** حتى تُعاد الصور الخام. الذي بقي وأُعيد إنشاؤه موضّح أدناه.

| المسار | الحالة والمحتوى |
| --- | --- |
| `/home/user/recovery/raw/count-*.png` | صور العدّ الخام الخمس (apple، star، flower، fish، egg)، وهي المصدر لـ `public/salman/art/count/` |
| `/home/user/recovery/raw/animal-<slug>.png` | **مفقودة** بعد إعادة التهيئة. لا توجد نسخة خارج Git |
| `tools/salman-process-animals.py` | يقرأ من `raw/animal-<slug>.png`، لذلك **لن يعمل** حتى تُعاد الصور الخام |
| `/home/user/recovery/venv/` | بايثون مع Pillow، أُعيد إنشاؤه (`python3 -m venv` ثم `pip install pillow`) |
| `/home/user/recovery/chrome/` | أداة الفحص دون إنترنت (puppeteer-core@23، @sparticuz/chromium@131)، أُعيد تثبيتها |
| `/home/user/recovery/chrome/offline-check-run.mjs` | نسخة من `tools/salman-offline-check.mjs` تُشغَّل من داخل مجلد الأداة |
| `/home/user/recovery/libs/lib/` | مكتبات Chromium، أُعيد استخراجها من `al2023.tar.br` و`al2.tar.br` |
| `/home/user/recovery/sheet-count.png`، `apple-check.png` | لوحة مراجعة رسوم العدّ، وفحص تفاحة بعد إعادة المعالجة |

## 8. الأدلة الأخرى

- `docs/salmans-garden/PHASES.md`: حالة المراحل وسجل الـ commits.
- `docs/salmans-garden/APP.md`: وصف التطبيق وما هو معلّق.
- `docs/salmans-garden/ASSETS.md`: الأصول وما تبقّى منها.
- `docs/salmans-garden/PROPOSAL.md`: الاقتراح المعتمد.
- `docs/salmans-garden/README.md`: فهرس الوثائق.
