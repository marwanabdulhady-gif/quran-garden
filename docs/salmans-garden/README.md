# حديقة سلمان — فهرس الوثائق

فهرس لكل ما يخص حديقة سلمان داخل هذا المستودع. الكود في `src/salman/`، وصفحتها في `salman.html`.

## الوثائق
| الملف | المحتوى |
|---|---|
| [`PHASES.md`](PHASES.md) | **المرجع الحي**: حالة المراحل A–H والبوابات، والقرارات المُجابة والمعلّقة، وسجل الـ commits |
| [`PROPOSAL.md`](PROPOSAL.md) | الاقتراح الأصلي: الغابة الأربع، مستويات القرآن، قواعد Leitner، الصوت، المراحل |
| [`APP.md`](APP.md) | ما يعمل الآن في التطبيق: الغابة، الجلسة، Leitner، التخزين، الأوفلاين، والأوامر |
| [`ASSETS.md`](ASSETS.md) | جرد الصور والأيقونات والصوت والمؤثرات، وما تبقّى |
| [`source/`](source/README.md) | المصادر Markdown لكتابي الصحابة وخاتم الأنبياء (والأداة التي تبني القصص) |
| [`journey/`](journey/) | خريطة الرحلة التفاعلية (ملف HTML واحد)، تُبنى بـ `tools/build_journey.py` |

## تشغيل وفحص
```bash
npm run dev            # ثم افتح /salman.html
npx vitest run         # كل الاختبارات (سلمان: tests/salman-*)
npx eslint src tests && npx prettier --check "src/**/*.{js,jsx}" "tests/**/*.{js,mjs,jsx}"
npm run build          # يبني index.html و salman.html ويضعهما في precache
npm run test:ssr       # دخان SSR لكل الشاشات
```

## تحقق دون إنترنت
نُفِّذ يدويًا بمتصفح Chromium (سكربت خارج المستودع). الخطوات: فتح `/salman.html` أونلاين، انتظار تسجيل الـ service worker، ثم قطع الشبكة وإعادة التحميل. النتيجة: التطبيق والحديقة يعملان، والمقاطع والصور والأيقونة والـ manifest تُخدم من الكاش.

## قواعد لا تُكسر
- لا تُعدَّل ملفات حديقة القرآن (`src/App.jsx` وباقي `src/` خارج `src/salman/`، و`src/store.js`، و`PLAN.md`).
- المحتوى المولّد لا يُعدَّل يدويًا: `src/salman/data/stories.generated.js` و`journey/index.html`.
- لا توجد مؤقتات ولا لوحات متصدّرين ولا عقوبة على الخطأ.
