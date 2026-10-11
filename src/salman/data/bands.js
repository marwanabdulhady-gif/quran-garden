// «مجاري النور» — نموذج النطاقات والمجاري والسند (PLAN-K5-STREAMS.md).
//
// هذا الملف **نموذج فقط**: لا يضيف نصًّا يُعرض على الطفل ولا يغيّر سلوك التطبيق.
// الغرض منه أن يصبح «الإسلام محورًا» شيئًا **يُختبر** لا شيئًا يُدَّعى:
//   - لكل وحدة `anchor`، ومن لا سند له لا يدخل مجرى (guard 1).
//   - النطاقات أهداف عمق لا أقفال، ومتقاطعة عند ٢ و٤ كما في fikr-dashboard.
//   - القرآن ليس مجرى خامسًا: هو العين التي تجري منها المجاري الأربعة.
//
// موضع الربط بالواجهة: حين يُبنى مجرى الكون (P11) تُضاف 'science' إلى GARDEN_ORDER
// في data/gardens.js، و`SCIENCE_LIVE` هنا يصير true — والاختبارات تحرس ذلك.

// ---------- العين والمجاري ----------

// العين: محور التطبيق، وليس مادة من المواد.
export const AXIS = 'quran';

// المجاري الأربعة: المواد الأساسية من تمهيدي إلى الخامس.
export const STREAM_ORDER = ['arabic', 'math', 'english', 'science'];

export const STREAMS = {
  arabic: {
    id: 'arabic',
    name: 'مجْرَى العَرَبِيَّة',
    gardenName: 'حديقة الحروف',
    method: 'حروف النور',
    guide: 'الهدهد',
    axisUse: 'قراءة القرآن وفهم كلماته',
  },
  math: {
    id: 'math',
    name: 'مجْرَى الرِّيَاضِيَّات',
    gardenName: 'حديقة الأرقام',
    method: 'أرقام النور',
    guide: 'السنجاب',
    axisUse: 'الأنصبة والزكاة والعدد في القرآن',
  },
  english: {
    id: 'english',
    name: 'مجْرَى الإِنْجِلِيزِيَّة',
    gardenName: 'حديقة الإنجليزية',
    method: 'Letters of Light',
    guide: 'دودة الحرير',
    axisUse: 'حكايات القرآن بالإنجليزية وأدب المخاطبة',
  },
  science: {
    id: 'science',
    name: 'مجْرَى الكَوْن',
    gardenName: 'حديقة الكون',
    method: 'آيات الكون',
    guide: 'الهدهد',
    // المجرى الوحيد غير المبني: يعمل في النموذج، ولا يظهر للطفل حتى تُراجَع محطته الأولى.
    live: false,
    axisUse: 'التدبّر في آيات الخلق',
  },
};

// المجاري الحيّة الآن (الحدائق الأربع في data/gardens.js) — الكون ليس منها بعد.
export const LIVE_STREAMS = STREAM_ORDER.filter((id) => STREAMS[id].live !== false);

// هل مجرى الكون ظاهر للطفل؟ (مفتاح واحد يُقلب في P11)
export const SCIENCE_LIVE = STREAMS.science.live === true;

// ---------- النطاقات: K–2 · 2–4 · 4–6 ----------
//
// التقاطع عند ٢ و٤ مقصود: الطفل ليس صفًّا، والنطاق هدف عمق لا قفل.
// نفس مفردات fikr-dashboard (docs/ux-review-*) حتى تتكلّم الجهتان لغة واحدة.

export const BANDS = [
  {
    id: 'k2',
    name: 'نِطَاق ١',
    ar: 'التأسيس',
    en: 'K–2',
    grades: ['K', 1, 2],
    ages: [5, 7],
    session: { min: 5, max: 8, minutes: 10 },
    newPerDay: 2,
    reading: 'كلمة وصورة',
    objective: 'أنا أسمع الصوت',
    tier: ['hunt', 'trace', 'train', 'boxes', 'memory', 'sorting'],
    deed: 'عمل واحد يفعله الطفل مع والده',
    report: 'أكمل يومه',
  },
  {
    id: '2-4',
    name: 'نِطَاق ٢',
    ar: 'البناء',
    en: '2–4',
    grades: [2, 3, 4],
    ages: [7, 10],
    session: { min: 6, max: 9, minutes: 15 },
    newPerDay: 3,
    reading: 'جملة ثم فقرة',
    objective: 'أنا أقرأ الكلمة',
    tier: ['matching', 'odd', 'scramble', 'cloze', 'venn', 'timeline'],
    deed: 'عمل يفعله بنفسه',
    report: 'إتقان المحطة',
  },
  {
    id: '4-6',
    name: 'نِطَاق ٣',
    ar: 'التوسّع',
    en: '4–6',
    grades: [4, 5, 6],
    ages: [9, 12],
    session: { min: 8, max: 12, minutes: 20 },
    newPerDay: 3,
    reading: 'نصّ ثم جدول أو مخطط',
    objective: 'أنا أشرح لماذا',
    tier: ['model', 'maze', 'number-maze', 'speed-tap'],
    deed: 'عمل يفعله لغيره',
    report: 'الإتقان والإنتاج',
  },
];

export const BAND_ORDER = BANDS.map((b) => b.id);

// درجات التمثيل: تمهيدي…الخامس (والسادس مَطلع لا حلقة).
export const GRADES = ['K', 1, 2, 3, 4, 5];

export function bandFor(id) {
  return BANDS.find((b) => b.id === id) || null;
}

// النطاقات التي يصلح لها صفّ: التقاطع يعني أن للصف الواحد نطاقين (٢ و٤ خاصة).
export function bandsForGrade(grade) {
  return BANDS.filter((b) => b.grades.includes(grade));
}

// اتجاه التقدّم: هل يسبق `a` النطاقَ `b`؟ (نستعمله لاختيار أعمق النطاقين للصف)
export function bandIndex(id) {
  return BAND_ORDER.indexOf(id);
}

export function deeperBand(a, b) {
  return bandIndex(a) >= bandIndex(b) ? a : b;
}

// نطاق الطفل الافتراضي من صفه: الأعمق المتاح، لأن النطاق أرضية لا سقف.
export function defaultBandFor(grade) {
  const found = bandsForGrade(grade);
  if (!found.length) return BAND_ORDER[0];
  return found[found.length - 1].id;
}

// ---------- مراتب السند (مراتب السند §3) ----------
//
// لكل وحدة سند، ورتبته تحدد ما يلزمه. و`validateAnchor` تحرس الوحدات كلها في الاختبارات.

export const ANCHOR_RANKS = {
  m1: {
    id: 'm1',
    ar: 'نصّ',
    meaning: 'الوحدة نفسها نصّ: آية أو حديث.',
    needs: ['ref'],
  },
  m2: {
    id: 'm2',
    ar: 'قصّة',
    meaning: 'حكاية من الوحي مُعادة للطفل.',
    needs: ['ref'],
  },
  m3: {
    id: 'm3',
    ar: 'معنًى',
    meaning: 'قيمة بلا نصّ مباشر — ولا بد أن تشير إلى وحدة نصيّة.',
    needs: ['related'],
  },
  m4: {
    id: 'm4',
    ar: 'أثر',
    meaning: 'آيةٌ في الكون — والآية هي العدسة التي ينظر الطفل بها.',
    needs: ['ref'],
  },
};

export const ANCHOR_RANK_ORDER = ['m1', 'm2', 'm3', 'm4'];

// حالة المراجعة: نفس مفردات data/nour.js حتى لا تتفرّع المفاهيم.
export const ANCHOR_REVIEW = { ok: 'ok', note: 'note', pending: 'pending' };

const has = (v) => typeof v === 'string' && v.trim().length > 0;

/**
 * يفحص سند وحدة ويعيد قائمة بالمشاكل (فارغة = سند سليم).
 * الوحدة بلا سند = مخالفة للقاعدة الأولى: «لا وحدة بلا سند».
 */
export function validateAnchor(unit) {
  const problems = [];
  const a = unit?.anchor;
  if (!a) {
    problems.push('لا سند للوحدة (anchor مفقود)');
    return problems;
  }
  const rank = ANCHOR_RANKS[a.rank];
  if (!rank) {
    problems.push(`رتبة سند غير معروفة: ${a.rank}`);
    return problems;
  }
  for (const need of rank.needs) {
    if (!has(a[need])) problems.push(`الرتبة ${a.rank} تحتاج «${need}»`);
  }
  // القاعدة الرابعة: أثر الكون لا بد فيه من آية (ref) — لا اقتران مجرّد بين «علم» و«إسلام».
  if (a.rank === 'm4' && !has(a.ref)) problems.push('أثر بلا آية (م٤ يحتاج ref)');
  if (a.rank === 'm3' && !has(a.related)) problems.push('معنًى بلا مرجع نصّي (م٣ يحتاج related)');
  if (!Object.values(ANCHOR_REVIEW).includes(a.review)) problems.push(`حالة مراجعة غير معروفة: ${a.review}`);
  return problems;
}

// ---------- ربط الوحدات بالنطاقات ----------
//
// في هذه المرحلة (P10) لا نعدّل ملفات المحتوى القائمة: نستنتج النطاق.
// المحتوى المبنيّ اليوم كله «التأسيس» (حروف، أصوات، أعداد ١–٢٠).

export const DEFAULT_BAND = 'k2';

export function bandOfUnit(unit) {
  if (!unit) return null;
  if (has(unit.band)) return bandFor(unit.band) ? unit.band : null;
  return DEFAULT_BAND;
}

/** يوزّع وحدات مجرى على نطاقاته — أساس الخريطة المرحلية في P11+. */
export function streamByBand(units) {
  const out = Object.fromEntries(BAND_ORDER.map((b) => [b, []]));
  for (const u of units || []) {
    const band = bandOfUnit(u);
    if (band) out[band].push(u);
  }
  return out;
}
