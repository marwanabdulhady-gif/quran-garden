# سجلّ العروض (Render log)

كلّ دفعة عُرضت عبر GitHub Actions (workflow `Videos` → وظيفة `Render MP4s`) تُسجَّل هنا.
التنزيل من صفحة الـ run → **Artifacts** (التنزيل داخل الـ sandbox محجوب عبر CDN).

| التاريخ | commit | run | garden | quality | format | فيديوهات | حجم الأرتيفاكت | الأرتيفاكت |
|---|---|---|---|---|---|---|---|---|
| 2026-10-12 | `393099a` | 38216631970 | english | draft | portrait | 3 (تجربة دخان) | 9.9 MB | `story-videos-english-portrait-draft` |
| 2026-10-12 | `5f42ef0` | 38219398745 | english | looks | portrait | 25 | 230.5 MB | `story-videos-english-portrait-looks` |
| 2026-10-12 | `26366d8` | 38227548434 | math,quran | delivery | portrait | 33 | 529.7 MB | `story-videos-math+quran-portrait-delivery` |
| 2026-10-12 | `f60ed24` | 38235647987 | arabic · part1 (1–19) | draft | portrait | 19 | 115.8 MB | `story-videos-arabic-portrait-draft-part1` |
| 2026-10-12 | `18f6983` | 38235718032 | arabic · part2 (20–38) | draft | portrait | 19 | 118.8 MB | `story-videos-arabic-portrait-draft-part2` |
| 2026-10-12 | `4c4430d` | 38235741527 | arabic · part3 (39–56) | draft | portrait | 18 | 114.8 MB | `story-videos-arabic-portrait-draft-part3` |

## قيد مهم: حدّ الـ 6 ساعات للوظيفة

> **قيد العرض (2026-10-12):** `math,quran` بجودة delivery (دفعة واحدة)، و`arabic` بجودة
> draft مقسّمة على **3 دفعات** (‎`offset`/`limit`/`part`‎) لأن 56 فيديو ≈ 104 دقائق لقطات
> تتجاوز حدّ الـ 6 ساعات: part1 = ‎`offset=0 limit=19`‎ (ar-01-p→ar-10-p) · part2 =
> ‎`offset=19 limit=19`‎ (ar-10-c1→ar-19-c1) · part3 = ‎`offset=38 limit=18`‎
> (ar-19-c2→ar-28-c1). الأرتيفاكتات: `story-videos-arabic-portrait-draft-part1/2/3`.
>
> **اكتمل ✓:** الدفعات الثلاث عُرضت بنجاح (56 فيديو، ‎~349.5 MB‎ إجمالًا) بالتوازي، وكلّ
> فيديو تحقّق منه `render-all.mjs` عبر ffprobe. نزّل `story-videos-arabic-portrait-draft-part1/2/3`
> من صفحات الـ run وادمجها (كلّ جزء فيديوهات مستقلة، لا حاجة لدمج ملفات).

زمن العرض تهيمن عليه **لقطات الإطارات في المتصفح** (30fps، 1080×1920) ولا يتغيّر كثيرًا
باختيار الجودة — الجودة (`draft`/`looks`/`delivery`) تغيّر **ترميز ffmpeg** فقط
(`ultrafast`/CRF28 · `medium`/CRF16 · `slow`/CRF15). لذلك الحديقة العربية (56 فيديو،
متوسط 111 ثانية ≈ 104 دقائق من اللقطات ≈ 12× لقطات الإنجليزية) تستغرق نحو **7 ساعات حتى
بجودة draft**، وهو ما يتجاوز حدّ GitHub الصارم **6 ساعات لكل وظيفة**. الحلّ: تقسيمها على
دفعات (`--only`/نطاق) أو خفض الـ fps لدفعة draft واحدة.
