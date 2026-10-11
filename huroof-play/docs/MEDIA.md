# الوسائط — الرسومات والصوت والخطوط

## 1. الرسومات (Illustrations)

| الملف | الوصف | الحالة |
| --- | --- | --- |
| `public/media/animals/<slug>.png` | رسمة كرتونية لكل حيوان، 384×384، خلفية شفافة | 10 من 28 |
| `public/favicon.svg` | أيقونة الموقع (حرف أ + أسد) | ✅ |
| `public/icons/*` | أيقونات PWA 192/512/maskable | ⬜ (Phase 4) |

**طريقة التوليد** (Arena image generation):
- Prompt الأساس (نفس النمط للكل، عشان الأسلوب يبقى موحّد):
  > A cute friendly cartoon `<animal>` character, flat vector illustration with soft shading, thick clean outlines, big expressive eyes, happy smile, centered in frame, full body, plain solid pure white background, no text, no letters, no border, children's educational game art style.
- الصور الخام تتحفظ في `media-src/animals/<slug>.png` (مش داخلة في Git — مستبعدة في `.gitignore`).
- المعالجة: `python3 scripts/media/process_images.py` (Pillow): flood-fill من الحواف يشيل الخلفية البيضاء، قص حول الرسمة مع هامش، تربيع، تصغير 384px، حفظ PNG مضغوط.
- المراجعة: شبكة معاينة على خلفية زرقاء في `docs/qa/animals-sheet-*.png` — بتتفحص بصريًا قبل الإضافة لـ `ILLUSTRATED`.

**حدود الحالة الحالية**: حد توليد الصور في الجلسة هو 10 صور لكل دورة عمل، فالـ 18 المتبقية هتتولّد في دورة لاحقة. لحد ما يحصل، الإيموجي بيظهر بدلها ومفيش أي وظيفة بتتكسر.

## 2. الصوت

### التعليق الصوتي (Narration)
- الصوت: صوت أنثوي عربي مختار بالتجربة (`voice-00`، use case: educational) — توليد بـ Arena TTS.
- 8 مقاطع في `public/audio/narration/*.mp3` (ID3 MP3، حوالي 260 KB):

| الملف | النص | المكان |
| --- | --- | --- |
| intro.mp3 | أهلًا بيك في مغامرة الحروف… هيا نلعب! | زر «هيا نلعب» |
| correct-1 / correct-2 | أحسنت! الحرف في مكانه الصحيح. / برافو عليك! استمر هكذا. | كل إجابة صح (بالتبادل) |
| retry.mp3 | لا بأس، جرّب حيوانًا آخر. | كل غلطة |
| hint.mp3 | انظر إلى الحيوان الذي يضيء… | أول تلميح بعد غلطتين |
| level-complete.mp3 | مبروك! أكملت المستوى… | إكمال مستوى |
| select.mp3 | اخترتَ الحرف… | اختيار حرف |
| champion.mp3 | أنت بطل الحروف! | (محجوز لنهاية اللعبة — Phase 3) |

- **الاحتياطي**: لو المتصفح منع التشغيل أو الملف فشل، يُنطق نفس النص بـ `speechSynthesis` (ar). المنطق في `src/lib/audio.js`.
- **حد الحصة**: 10 مقاطع لكل دورة عمل — الـ 8 دول خلصوا.

### نطق أسماء الحيوانات والحروف
- أسماء الحيوانات بتتنطق بـ `speechSynthesis` بالعربي عند الضغط على الحرف (`src/lib/speech.js`)، لأن توليد 28 مقطع منفصل يحتاج دورات إضافية. الواجهة دايمًا بتعرض النص.

### المؤثرات
- مفيش ملفات مؤثرات؛ كل التفاعل بالتعليق الصوتي + الحركة البصرية (`celebrate`، `wobble`، `pulse`).

## 3. الخطوط

| الخط | الملفات | الترخيص |
| --- | --- | --- |
| Cairo (400/700/900، subset عربي) | `public/fonts/Cairo-*-arabic.woff2` (منسوخة من مشروع quran-garden) | SIL Open Font License 1.1 |

الخط محلي بالكامل — مفيش طلبات لـ Google Fonts (الخصوصية والعمل أوفلاين).

## 4. APIs خارجية
- **مفيش API خارجي مطلوب للعب.** الاستخدام الوحيد: متصفح Web Speech API (اختياري، بيشتغل لو موجود).
- اتقيّمت بدائل (Wikimedia/Openverse للصور الحقيقية) — مش مستخدمة لأن الرسومات المولّدة متسقة الأسلوب وبدون مشاكل ترخيص للصور.
