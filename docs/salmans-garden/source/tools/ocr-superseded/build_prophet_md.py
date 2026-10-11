import json, re, os
OUT='/home/user/quran-garden/docs/salmans-garden/source/alphabet-with-the-final-prophet.md'
base='/home/user/.qa-tools/ocr/out/prophet'
ARAB=re.compile(r'[\u0600-\u06FF]')
# confidences from the job log
import json
conf={int(k):v for k,v in json.load(open('/home/user/.qa-tools/ocr/conf-prophet.json')).items()}
pages=[]
for i in range(1,51):
    raw=open(f'{base}/p{i:02d}.txt',encoding='utf-8').read()
    paras=[]; cur=[]
    for ln in raw.split('\n'):
        s=ln.strip()
        if not s:
            if cur: paras.append(' '.join(cur)); cur=[]
            continue
        if len(ARAB.findall(s))<4:   # page numbers, stray marks
            continue
        cur.append(s)
    if cur: paras.append(' '.join(cur))
    pages.append((i,conf.get(i,0),paras))
lines=[]
lines.append('# حروف الهجاء مع خاتم الأنبياء — نص مستخرج (OCR)\n')
lines.append('> **المصدر:** ملف Drive «حروف الهجاء مع خاتم الانبياء» (`1QipxkfLJXg_1R4Gwq4nvwSKP8Kqt7DwK`، 50 صفحة ممسوحة ضوئيًا، بلا طبقة نص).\n')
lines.append('> **طريقة التحويل:** تعرّف ضوئي آلي (Tesseract، نموذج العربية) على صور الصفحات بدقة 300 dpi، ثم تنظيف آلي: حذف أرقام الصفحات والعلامات المنفردة، ودمج الأسطر في فقرات. **لم تُراجع بشريًا بعد.** قد تحوي أخطاء في الحروف والكلمات والتشكيل وعلامات الترقيم.\n')
lines.append('> **حالة الصفحات:** كل صفحة عليها نسبة الثقة الآلية. الصفحات ذات الثقة أقل من 70٪ موسومة بـ ⚠️ وتحتاج مراجعة دقيقة.\n')
lines.append('> **ملاحظة:** الملف دليل للوالدين والمربين. الصفحة في الكتاب تبدأ غالبًا بحرف أو كلمة مفتاحية، ثم قصة من السيرة، وحديث، وفكرة تطبيقية.\n')
lines.append('---\n')
for i,c,paras in pages:
    flag = ' ⚠️' if c<70 else ''
    lines.append(f'## الصفحة {i}{flag}\n')
    lines.append(f'<!-- ثقة التعرف: {c}٪ -->\n')
    if not paras:
        lines.append('> (صفحة بلا نص مقروء آليًا — غلاف أو صورة؛ راجع المسح الأصلي)\n')
    for p in paras:
        lines.append(p+'\n')
    lines.append('')
os.makedirs(os.path.dirname(OUT),exist_ok=True)
open(OUT,'w',encoding='utf-8').write('\n'.join(lines))
print('pages',len(pages),'low-conf',sum(1 for _,c,_ in pages if c<70),'total chars',sum(len(p) for _,_,ps in pages for p in ps))
