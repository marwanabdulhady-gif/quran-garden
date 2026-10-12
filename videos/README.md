# فيديوهات القصص — Salman's Garden Story Videos

فيديو واحد لكل قصة في «حدائق سلمان»، مبني بـ [HyperFrames](https://github.com/heygen-com/hyperframes):
نكتب HTML + GSAP، فيُعرَض إلى MP4 حتميّ (deterministic). كل التركيبات **مولَّدة** من
بيانات القصص نفسها في `src/salman/data`، فلا تنسخ نصًا يدويًا ولا تفلتر من التطبيق.

## ما الذي يُبنى

| الحديقة | العدد | مصدر البيانات | رسم فني | سرد صوتي |
| --- | --- | --- | --- | --- |
| `arabic` — الحروف (سيرة + صحابة) | 56 | `data/stories.generated.js` | ✅ | ❌ (لم يُسجَّل بعد) |
| `english` — أصوات الحروف | 25 | `data/gardens.js` | ✅ | ✅ |
| `math` — العدّ | 20 | `data/gardens.js` | ✅ | ✅ |
| `quran` — قصص السور | 13 | `data/quran.js` | ✅ | ❌ |
| **المجموع** | **114** | | **114** | **45** |

إجمالي مدة الفيديوهات ≈ **124 دقيقة** (الصيغة العمودية `portrait`). القصص العربية أطول
(متوسط ~111 ثانية، مشاهد متعددة) لأن نصّها أطول؛ الإنجليزية/الرياضيات ~20 ثانية.

## بنية الفيديو

لكل قصة تركيب مستقل في `compositions/<id>.html` يعرض:

1. **بطاقة افتتاحية** — الحرف/الصوت كبيرًا مع كلمة الحديقة.
2. **بطاقة العنوان** — الرسم الفني (Ken Burns) + العنوان + شرائح (الحرف/الكلمة/الصوت).
3. **مشاهد النص** — القصة مقسَّمة جملةً جملة على بطاقات، مدة كل مشهد محسوبة من طول النص
   (حرف/ثانية لكل لغة) حتى يقرأ الطفل براحة. إن وُجد سرد مسجَّل، تتمدد المشاهد لتطابق طول الصوت.
4. **بطاقة سؤال** — سؤال القصة وإجابته (من `catalog.js`).
5. **الخاتمة** — «حدائق سلمان».

شريط تقدّم أسفل الإطار طوال الفيديو. الاتجاه العربي يُضبَط بـ `direction: rtl` على كل عنصر نصّي
(**لا** `dir` على `<html>` — ذلك يُنتج فيديو فارغًا صامتًا، وتفحصه البوابة).

## الأوامر

```bash
npm run videos:dry                 # ملخّص المدد/المشاهد دون كتابة ملفات
npm run videos:build               # ولّد كل التركيبات + انسخ الأصول + اكتب manifest.json
npm run videos:build -- --garden=english,math
npm run videos:build -- --format=landscape      # portrait | landscape | square
npm run videos:build -- --only=en-01,ar-01-p
npm run videos:check               # البوابة: lint + اتساق (بلا متصفح) — يجب أن تبقى نظيفة
npm run videos:preview             # معاينة HyperFrames Studio في المتصفح
npm run videos:render -- --garden=english --quality=looks   # اعرض MP4 فعليًا
npm run videos:browser             # مرة واحدة: نزّل Chrome Headless Shell للعرض
```

`videos:build` ينسخ الأصول إلى `videos/assets/` و `videos/vendor/` (من `public/` و
`node_modules/gsap`)، وهذه **مولَّدة** فلا تُلتزم (انظر `videos/.gitignore`). الملتزَم هو
`compositions/*.html` + `manifest.json` + ملفات الضبط.

## العرض إلى MP4 — أين ولماذا

العرض يحتاج ثلاثة: **ffmpeg** و **ffprobe** و **Chrome Headless Shell**.

- ffmpeg/ffprobe: تُحلّ تلقائيًا من PATH أو من `@ffmpeg-installer` / `@ffprobe-installer`
  (مثبَّتة كـ `optionalDependencies`، وتشحن الثنائي داخل الحزمة فلا تنزيل إضافي).
- Chrome: `npm run videos:browser` **مرة واحدة**. يُنزَّل من CDN لجوجل — وهذا يعمل على
  جهازك وعلى عدّاءات GitHub Actions.

> **ملاحظة بيئة مقيّدة:** في بيئات sandbox التي تسمح فقط بـ npm/GitHub/PyPI (مثل هذه الجلسة)،
> لا يمكن تنزيل Chrome، فيفشل العرض المحلي عند «Chrome not found» — وهذا هو الحاجز الوحيد.
> التركيبات والأصول و ffmpeg كلها تُفحص وتنجح؛ يتبقّى المتصفح فقط. لذا مسار العرض الموصى به
> هنا هو **GitHub Actions** (انظر `.github/workflows/videos.yml` → `workflow_dispatch`)، حيث
> العدّاءات تملك الإنترنت لتنزيل Chrome.

### العرض في CI

شغّل workflow ‏**Videos** يدويًا واختر:
- `garden` — أي حديقة (أو `all`)،
- `quality` — `draft` (سريع للتجربة) / `looks` (الافتراضي) / `delivery` (الأعلى)،
- `format` — `portrait` / `landscape` / `square`،
- `limit` — أقصى عدد (للتجربة).

ينتج artifact ‏`story-videos-*` فيه ملفات MP4، و`render-report.json` بحالة كل فيديو
(المدة الفعلية مقابل المتوقَّعة، الحجم، زمن العرض). العرض الكامل (~ساعتان من الفيديو) بطيء على
العدّاء (لقطة شاشة + GPU برمجي)؛ ابدأ بحديقة واحدة أو `limit` صغير.

## التحقق (لماذا بوابة `videos:check`)

`videos:check` تجمع أمرين:
1. **`hyperframes lint`** على المشروع كله — يفحص عقد HyperFrames: كل عنصر مُوقَّت له `id`
   و`class="clip"` و`data-start`/`data-duration`، الخط الزمني مسجَّل ومتوقف، الوسائط لها `id`
   (وإلا صُمّت في العرض)، لا `dir` على `<html>`، لا مراجع شبكة خارجية، ولا تداخل GSAP.
2. **فحص اتساق** من `check-videos.mjs` — كل تركيب يطابق `manifest.json` (المدة، المعرّف، وجود/غياب
   السرد)، كل الأصول موجودة على القرص نسبيًا للتركيب، لا مشهد يتجاوز مدة الجذر، ولا ملفات
   شاردة خارج البيان.

الحالة الحالية: **0 خطأ · 0 تحذير · 114/114 تركيب**.

## الملفات

```
tools/videos/
  build-videos.mjs      المولِّد الرئيسي (CLI)
  story-manifest.mjs    توحيد كل القصص من src/salman/data + تنظيف النص + تقطيعه
  mp3-duration.mjs      مدة MP3 بلا ffprobe (يقرأ ترويسة Xing/Info) — طابق ffmpeg على 45/45 ملفًا
  check-videos.mjs      بوابة التحقق
  render-all.mjs        العرض الدفعي + تقرير
  env.mjs               إيجاد ffmpeg/ffprobe ومتغيرات البيئة
videos/
  compositions/<id>.html   فيديو كل قصة (مولَّد — ملتزَم)
  index.html               بطاقة عنوان المجموعة
  manifest.json            بيان كل فيديو (مولَّد — ملتزَم)
  hyperframes.json         ضبط المشروع (paths.assets = assets)
  package.json             سكربتات المشروع الفرعي
  assets/  vendor/  renders/   مولَّد/مخرجات — غير ملتزَمة
```

## ضبط الإيقاع

في `build-videos.mjs`:
- `CHARS_PER_SECOND` — سرعة القراءة لكل لغة (`ar:15`, `en:16`, `quran:11`). مرِّر `--cps=` للتجاوز.
- `maxChars` / `minChars` — حدود طول البطاقة النصية.
- `padSec` / `minSceneSec` — حشو وأدنى مدة للمشهد.
- المدد الافتتاحية/الختامية ثابتة في `buildScenes`.

بعد أي تعديل على القصص في `src/salman/data` أو على `public/salman`، أعد `npm run videos:build`
ثم `npm run videos:check`.
