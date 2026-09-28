// أدوات النص القرآني — دوال نقية بلا React (قابلة للاختبار في node)

// يزيل علامات الوقف الصغيرة والتطويل من نص عثماني (للعرض)
export function cleanAyah(s) {
  return (s || '').replace(/[\u0670\u06D5-\u06ED\u0640]/g, '');
}

// يزيل التشكيل (لوضع "خط واضح" للقارئ المبتدئ)
export function stripTashkeel(s) {
  return (s || '').replace(/[\u064B-\u065F\u0670]/g, '');
}

// نص الآية لعرضه حسب إعداد قراءة الطفل (حجم لا يدخل هنا — فقط التشكيل)
export function readAyah(text, child) {
  const plain = child?.reading?.plain === true;
  const c = cleanAyah(text);
  return plain ? stripTashkeel(c) : c;
}

// شكل مطابقة: بدون تشكيل أو علامات، مع توحيد الألف والياء الممدودة (حرف بحرف — آمن بالفهارس)
export function matchForm(s) {
  return (s || '')
    .replace(/[\u064B-\u065F\u0670\u0640\u06D5-\u06ED\u06E5-\u06E9]/g, '')
    .replace(/\u0671/g, '\u0627')
    .replace(/\u0649/g, '\u064A');
}

// يحدد مواضع الكلمة داخل الآية لعرضها مظللة — بأمان كامل بين النصوص المشكّلة وغير المشكّلة:
// نبحث في "شكل المطابقة" ثم نرجع الفهارس إلى نص العرض الأصلي.
export function splitWord(ayah, word, plain = false) {
  const a = readAyah(ayah, { reading: { plain } });
  const A = matchForm(a);
  const W = matchForm(word);
  if (!W) return { before: '', mid: a, after: '', found: false };
  const i = A.indexOf(W);
  if (i === -1) return { before: '', mid: a, after: '', found: false };
  // فهرس كل حرف ناجٍ (لم يُحذف بالتشكيل) داخل نص العرض
  const keep = [];
  for (let k = 0; k < a.length; k++) {
    if (matchForm(a[k])) keep.push(k);
  }
  const s = keep[i];
  let e = keep[i + W.length - 1] + 1;
  // الشمول علامات التشكيل اللي لاقفة آخر حرف في الكلمة المعروضة
  while (e < a.length && /[\u064B-\u065F\u0670\u06D6-\u06ED]/.test(a[e])) e++;
  return { before: a.slice(0, s), mid: a.slice(s, e), after: a.slice(e), found: true };
}

export function starLabel(n) {
  if (n === 1) return 'نجمة';
  if (n === 2) return 'نجمتان';
  if (n >= 3 && n <= 10) return 'نجوم';
  return 'نجمة';
}
