# مراجعة الخطة (v1 → v2)

> تاريخ المراجعة: 2026-10-10 · المراجع: Arena agent · المصادر في آخر الملف.
> **ملحوظة:** الملف المرفوع «Salman's Garden — Build Plan.md» ما وصلش للـ sandbox (مش موجود في `/home/user/uploads/` ولا في أي مسار على الجهاز). المراجعة دي على خطة `huroof-play` نفسها. لو ترفعه تاني هقارنه بهذا الملف وأضيف أي نقطة فيه ما اتغطتش.

## 1. الحكم على الخطة v1

**قوية في البنية:** مراحل واضحة، كل مرحلة ليها بوابة جودة (quality gate) محددة، وأدلة مكتوبة (screenshots وتقارير). الاختبارات والـ E2E وفرت أخطاء حقيقية (لوحة المفاتيح، وlint اللي كان بيتخطى الـ JSX).

**ناقصة في 6 نقط مهمة** (اتضافت في v2):

| # | الفجوة في v1 | ليه مهمة | التغيير في v2 |
| --- | --- | --- | --- |
| G1 | **مفيش بوابة موافقة ولي الأمر** قبل ما الطفل يدخل اسمه | نظام حماية البيانات السعودي (PDPL) بيعرّف الطفل تحت 13 سنة، ولازم موافقة ولي الأمر الصريحة والموثّقة، وسحب الموافقة لازم يكون بسهولة الموافقة نفسها. | **Phase 3:** شاشة موافقة ولي الأمر (مربع صريح + تاريخ)، سجل موافقة محلي، زر «سحب الموافقة ومسح البيانات». |
| G2 | **تقليل البيانات** مش مذكور كقاعدة | PDPL بيطلب الحد الأدنى من البيانات لغرض محدد | اسم مستعار فقط (20 حرف كحد)، مفيش صورة ولا تاريخ ميلاد ولا إيميل. الاختبار يتأكد إن المفاتيح المحفوظة هي المسموح بيها فقط. |
| G3 | **التصدير والمسح** متاحين لأي حد ممسك الجهاز | الطفل ممكن يمسح تقدمه أو يصدّره | **بوابة والدين** (سؤال حساب بسيط) قبل التصدير والمسح، زي ما Apple Kids بتعمل. |
| G4 | **تعليم الصوت (phonics)** ناقص — اللعبة بتربط الحرف بالحيوان بس | تطبيقات الحروف العربية الناجحة بتبدأ بصوت الحرف ثم كلمة تبدأ بيه (Aarak، Nimnim، Kids Phonics). | **Phase 2b:** زر «صوت الحرف» في كل بطاقة + مقاطع صوت للحروف الـ 28 (على دفعات بسبب حد 10 مقاطع/دورة). |
| G5 | **تحقق من إمكانية الوصول آليًا** مش موجود | WCAG 2.2 معيار 2.5.7 (السحب) لازم بديل بنقرة، ومعيار 2.5.8 (حجم الهدف). الاختبار اليدوي مش كفاية. | **Phase 4:** فحص axe-core داخل الـ E2E + اختبار صريح لكل معيار WCAG اللي بنغطيه + `docs/ACCESSIBILITY.md`. |
| G6 | **مفيش CI للتطبيق** (الـ CI الموجود للـ quran-garden بس) والـ security headers مش متعرّفة | أي PR لازم يتفحص تلقائيًا، والنشر يحتاج CSP وheaders | **Phase 4:** `.github/workflows/huroof-play-ci.yml`، `public/_headers` (CSP + X-Frame-Options + Referrer-Policy)، و`netlify.toml`/`vercel.json` مع Root Directory. |

**نقط إضافية (stretch) اتضافت كـ Phase 6:** الأشكال الموضعية للحروف (أول/وسط/آخر الكلمة) — مهمة للقراءة العربية الحقيقية وبتتعلمها تطبيقات الحروف الجادة.

## 2. قرارات مفتوحة (تحتاج قرار منك)

1. **مقاطع صوت الحروف الـ 28**: تسجيل بالصوت الموحد (~3 دورات عمل، 10 مقاطع في الدورة) مقابل نطق المتصفح (`speechSynthesis`). المتصفح مش دايمًا بينطق صوت الحرف المجرد صح. **التوصية:** التسجيل.
2. **هل اللعبة للأطفال 4–7 سنين بس؟** ده بيحدد حجم الخط وعدد الحيوانات وطول الجلسة.
3. **حد وقت الجلسة**: زي quran-garden (وضع الوالدين بحد يومي)؟ مش في v2 الأساسي، ممكن نضيفه في Phase 3.

## 3. الخطة v2 (المراحل بعد التحسين)

| المرحلة | النطاق | بوابة الجودة | الحالة |
| --- | --- | --- | --- |
| **0 — تدقيق** | نسخ الموقع الأصلي، القائمة، النتائج | الادعاءات مدعومة بأدلة | ✅ |
| **1 — نواة اللعبة** | 7 مستويات، سحب + ضغط + كيبورد، نجوم، تلميحات | lint (يشمل JSX)، format، 42 اختبار، smoke، build، E2E 18/18 | ✅ |
| **2a — الرسومات** | 20/28 رسمة حيوان؛ الـ 8 الباقية؛ أيقونات PWA؛ خلفية المشهد | مراجعة بصرية لكل دفعة (شبكة معاينة)، حجم < 3MB | 🔄 20/28 |
| **2b — الصوت** | تعليق (8/8 ✅)، صوت الحروف الـ 28 (زر «صوت الحرف»)، تشغيل احتياطي | كل مقطع موجود وصحيح الصيغة، E2E بيشغّل المقطع | ⬜ |
| **3 — التقدم والموافقة** | موافقة ولي الأمر، سجل الموافقة، اسم مستعار فقط، ملفات لاعبين، لوحة المعلم/الوالد، تصدير JSON/CSV، بوابة والدين، سحب الموافقة | اختبارات التخزين والترحيل والتصدير، اختبار تقليل البيانات، E2E: موافقة ← لعب ← تصدير ← مسح | ⬜ |
| **4 — النشر و PWA و الوصولية** | PWA أوفلاين، CSP/headers، CI، axe-core، `docs/ACCESSIBILITY.md` | CI أخضر، axe 0 مخالفات حرجة، build artefacts، فحص headers | ⬜ |
| **5 — التوثيق والإصدار** | README (عربي + إنجليزي)، DEPLOY، PRIVACY (PDPL)، ACCESSIBILITY، CONTENT، MEDIA، QA report، CHANGELOG | كل أمر في الوثائق اتنفّذ مرة في QA | ⬜ |
| **6 — (اختياري) الأشكال الموضعية** | أول/وسط/آخر الحرف في المستوى 7 | اختبار محتوى للأشكال + مراجعة بصرية | ⬜ |

## 4. المصادر

- **PDPL السعودي (الطفل تحت 13، موافقة ولي الأمر، سحب الموافقة، تقليل البيانات):** [Usercentrics — Saudi PDPL](https://usercentrics.com/knowledge-hub/saudi-arabia-personal-data-protection-law-pdpl/)، [Cookiebot — PDPL](https://www.cookiebot.com/en/saudi-arabia-personal-data-protection-law-pdpl/)، [Baker McKenzie — Legal bases](https://resourcehub.bakermckenzie.com/en/resources/global-data-and-cyber-handbook/emea/saudi-arabia/topics/legal-bases-for-processing-of-personal-data).
- **Privacy by design لقاصرين في السعودية (موافقة الوصي، تقليل البيانات، حذف واضح):** [ResearchGate — Designing for Safety: Privacy by Design for Saudi Minors](https://www.researchgate.net/publication/403611516_Designing_for_Safety_Privacy_by_Design_for_Saudi_Minors_A_Comprehensive_Analysis_of_Saudi_Arabia's_Approach_to_Protecting_its_Youngest_Digital_Citizens).
- **WCAG 2.2 SC 2.5.7 Dragging Movements (بديل بنقرة واحدة، والكيبورد منفصل):** [W3C Understanding 2.5.7](https://www.w3.org/WAI/WCAG22/Understanding/dragging-movements.html)، [WCAG 2.2 AA — Dragging Movements](https://wcag22aa.org/new-criteria/dragging-movements/).
- **تعليم الحروف العربية (الصوت أولًا، ربط بالصور، تعلم متعدد الحواس):** [Aarak — Arabic alphabet learning games](https://aarak.net/arabic-alphabet-learning-games/)، [Nimnim](https://www.nimnim.uk/) (4 ألعاب لكل حرف، أعمار 3–7)، [Kids Phonics A–Z (App Store)](https://apps.apple.com/us/app/kids-phonics-a-z-alphabet-letter-sounds-learning/id464535310) (حيوانات + صوت البداية).
