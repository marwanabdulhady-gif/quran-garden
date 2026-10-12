# سجلّ العروض (Render log)

كلّ دفعة عُرضت عبر GitHub Actions (workflow `Videos` → وظيفة `Render MP4s`) تُسجَّل هنا.
التنزيل من صفحة الـ run → **Artifacts** (التنزيل داخل الـ sandbox محجوب عبر CDN).

| التاريخ | commit | run | garden | quality | format | فيديوهات | حجم الأرتيفاكت | الأرتيفاكت |
|---|---|---|---|---|---|---|---|---|
| 2026-10-12 | `393099a` | 38216631970 | english | draft | portrait | 3 (تجربة دخان) | 9.9 MB | `story-videos-english-portrait-draft` |
| 2026-10-12 | `5f42ef0` | 38219398745 | english | looks | portrait | 25 | 230.5 MB | `story-videos-english-portrait-looks` |

## قيد مهم: حدّ الـ 6 ساعات للوظيفة

زمن العرض تهيمن عليه **لقطات الإطارات في المتصفح** (30fps، 1080×1920) ولا يتغيّر كثيرًا
باختيار الجودة — الجودة (`draft`/`looks`/`delivery`) تغيّر **ترميز ffmpeg** فقط
(`ultrafast`/CRF28 · `medium`/CRF16 · `slow`/CRF15). لذلك الحديقة العربية (56 فيديو،
متوسط 111 ثانية ≈ 104 دقائق من اللقطات ≈ 12× لقطات الإنجليزية) تستغرق نحو **7 ساعات حتى
بجودة draft**، وهو ما يتجاوز حدّ GitHub الصارم **6 ساعات لكل وظيفة**. الحلّ: تقسيمها على
دفعات (`--only`/نطاق) أو خفض الـ fps لدفعة draft واحدة.
