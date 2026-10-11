// «آيات الكون» — مجرى الرابع: نطاق المحتوى فقط، لا نصّ يُعرض على الطفل.
//
// القاعدة الحاكمة (PLAN-K5-STREAMS.md §3.2): لا صوت ولا عرض قبل سجل المراجعة.
// لذلك هذا الملف يحمل **الهيكل والسند** فقط:
//   - لا نصّ قرآني ولا حديثي مكتوبًا (لا نكتب ما لم نقابله حرفًا بحرف).
//   - كل وحدة `review: 'pending'` و`anchor.verified: false` حتى تنجح في CONTENT-REVIEW.md.
//   - `voiced: false` في كل وحدة: لا تسجيل قبل المراجعة.
// اختبار `tests/salman-k5.test.mjs` يمنع تسرّب أي وحدة غير مُراجَعة إلى العرض.
//
// ملاحظة على المراجع: أرقام السور والآيات هنا **مسوّدة نطاق** وضعت لأجل شكل المجرى،
// وليست توثيقًا. أول عمل في P11 هو مقابلة كل مرجع على api.quran.com / sunnah.com.
//
// الرتب (bands.js · ANCHOR_RANKS): م١ نصّ · م٢ قصّة · م٣ معنًى · م٤ أثر.
// كل وحدات الكون م٤ (آية في الكون) إلا ما نصّ عليه خلافه.

import { ANCHOR_REVIEW } from './bands.js';

const PENDING = ANCHOR_REVIEW.pending;

// خطوات اليوم السبعة في مجرى الكون: نفس الهيكل، وثلاث تسميات تتبدّل (§6 من الخطة).
export const SCIENCE_DAY_LABELS = {
  door: { title: 'باب الآية', emoji: '📖', hint: 'نفتح المصحف على الآية' },
  story: { title: 'الآية والمعنى', emoji: '🗣️', hint: 'نسمع الآية ونفهم معناها بكلماتنا' },
  sound: { title: 'البطاقة والتدبّر', emoji: '🔍', hint: 'نتأمل الصورة ونسأل: كيف خلقها الله؟' },
  hunt: { title: 'صيد الأثر', emoji: '🔎', hint: 'ننقر كل ما يدلّ على الآية' },
  trace: { title: 'تتبّع الرسم', emoji: '✏️', hint: 'نتتبّع الرسم والمخطط' },
  play: { title: 'اللعب', emoji: '🎮', hint: 'لعبة صغيرة' },
  deed: { title: 'عمل الخلافة', emoji: '💚', hint: 'عمل واحد نفعله اليوم' },
};

// المحطات الثمانية: ثلاث في «التأسيس» وثلاث في «البناء» واثنتان في «التوسّع».
const STATIONS = [
  {
    id: 'sc1',
    band: 'k2',
    title: 'أنا وعالمي',
    emoji: '👁️',
    guide: 'الهدهد',
    units: [
      {
        id: 'sc-senses',
        band: 'k2',
        station: 'sc1',
        sign: 'الحواس الخمس',
        signEmoji: '👁️',
        theme: 'أسمع وأبصر وأشمّ وأذوق وألمس — وكلها نعمة تُسأل عنها.',
        // «إِنَّ السَّمْعَ وَالْبَصَرَ وَالْفُؤَادَ كُلُّ أُولَئِكَ كَانَ عَنْهُ مَسْئُولًا»
        anchor: { rank: 'm4', ref: 'الإسراء ٣٦', url: 'https://quran.com/17/36', review: PENDING, verified: false },
        deed: { emoji: '🙏', text: 'نَشْكُرُ اللهَ عَلَى نِعْمَةٍ نَرَاهَا بِعَيْنِنَا' },
      },
      {
        id: 'sc-body',
        band: 'k2',
        station: 'sc1',
        sign: 'جسمي',
        signEmoji: '🧍',
        theme: 'الجسم أمانة: نأكل، وننام، وننظّف.',
        anchor: { rank: 'm4', ref: 'التين ٤', url: 'https://quran.com/95/4', review: PENDING, verified: false },
        deed: { emoji: '🦷', text: 'نُنَظِّفُ أَسْنَانَنَا وَنَنَامُ مُبَكِّرِينَ' },
      },
      {
        id: 'sc-tahur',
        band: 'k2',
        station: 'sc1',
        sign: 'الطهارة',
        signEmoji: '💧',
        theme: 'الماء الطهور يُنقّينا، والوضوء قبل الصلاة.',
        // حديث: «الطُّهورُ شطرُ الإيمان» — م١ نصّ
        anchor: { rank: 'm1', ref: 'مسلم ٢٢٣', url: 'https://sunnah.com/muslim:223', review: PENDING, verified: false },
        deed: { emoji: '🤲', text: 'نَتَوَضَّأُ قَبْلَ الصَّلَاةِ وَنَحْمَدُ اللهَ' },
      },
    ],
  },
  {
    id: 'sc2',
    band: 'k2',
    title: 'الماء والسماء',
    emoji: '🌧️',
    guide: 'الهدهد',
    units: [
      {
        id: 'sc-water-life',
        band: 'k2',
        station: 'sc2',
        sign: 'الماء والحياة',
        signEmoji: '💧',
        theme: 'بالماء تحيا الأرض والنبات والحيوان.',
        anchor: { rank: 'm4', ref: 'الأنبياء ٣٠', url: 'https://quran.com/21/30', review: PENDING, verified: false },
        deed: { emoji: '🚰', text: 'نُغْلِقُ الصَّنْبُورَ وَلَا نُسْرِفُ فِي المَاءِ' },
      },
      {
        id: 'sc-rain',
        band: 'k2',
        station: 'sc2',
        sign: 'المطر',
        signEmoji: '🌧️',
        theme: 'المطر ينزل طهورًا فيُخرج النبات.',
        anchor: { rank: 'm4', ref: 'الفرقان ٤٨', url: 'https://quran.com/25/48', review: PENDING, verified: false },
        deed: { emoji: '🌱', text: 'نَدْعُو دُعَاءَ المَطَرِ وَنَزْرَعُ بَذْرَةً' },
      },
      {
        id: 'sc-sea',
        band: 'k2',
        station: 'sc2',
        sign: 'البحر',
        signEmoji: '🌊',
        theme: 'البحر مسخَّر، فيه منافع وسفن تجري.',
        anchor: { rank: 'm4', ref: 'النحل ١٤', url: 'https://quran.com/16/14', review: PENDING, verified: false },
        deed: { emoji: '🐚', text: 'نُنَظِّفُ شَاطِئًا أَوْ حَدِيقَةً مِنَ الأَذَى' },
      },
    ],
  },
  {
    id: 'sc3',
    band: 'k2',
    title: 'الحيوان',
    emoji: '🐝',
    guide: 'الهدهد',
    units: [
      {
        id: 'sc-camel',
        band: 'k2',
        station: 'sc3',
        sign: 'الإبل',
        signEmoji: '🐪',
        theme: 'أنظر كيف خُلقت: تحمل، وتسير في الرمل، وتصبر.',
        // «أَفَلَا يَنظُرُونَ إِلَى الْإِبِلِ كَيْفَ خُلِقَتْ» — أصرح آية في التدبّر في الخلق.
        anchor: { rank: 'm4', ref: 'الغاشية ١٧', url: 'https://quran.com/88/17', review: PENDING, verified: false },
        deed: { emoji: '🐾', text: 'نَرْفُقُ بِالْحَيَوَانِ وَلَا نُخِيفُهُ' },
      },
      {
        id: 'sc-bee',
        band: 'k2',
        station: 'sc3',
        sign: 'النحل',
        signEmoji: '🐝',
        theme: 'النحل يعمل بنظام، ويخرج منه شراب فيه شفاء.',
        anchor: { rank: 'm4', ref: 'النحل ٦٨–٦٩', url: 'https://quran.com/16/68', review: PENDING, verified: false },
        deed: { emoji: '🍯', text: 'نُهْدِي عَسَلًا أَوْ نَشْكُرُ صَانِعَهُ' },
      },
      {
        id: 'sc-ant',
        band: 'k2',
        station: 'sc3',
        sign: 'النمل',
        signEmoji: '🐜',
        theme: 'نملة صغيرة كلّمت قومها، وسمعها نبيّ الله سليمان.',
        // قصّة من الوحي تُروى: نملة وادي النمل وسليمان عليه السلام — م٢
        anchor: {
          rank: 'm2',
          ref: 'النمل ١٨–١٩',
          url: 'https://quran.com/27/18',
          review: PENDING,
          verified: false,
        },
        deed: { emoji: '🐜', text: 'لَا نُهْلِكُ حَشَرَةً وَلَا نُؤْذِي مَخْلُوقًا صَغِيرًا' },
      },
      {
        id: 'sc-bird',
        band: 'k2',
        station: 'sc3',
        sign: 'الطير',
        signEmoji: '🐦',
        theme: 'الطير يطير بجناحين بلا سقوط إلا بإذن الله.',
        anchor: { rank: 'm4', ref: 'الملك ١٩', url: 'https://quran.com/67/19', review: PENDING, verified: false },
        deed: { emoji: '🕊️', text: 'نَضَعُ مَاءً لِلطُّيُورِ' },
      },
    ],
  },
  {
    id: 'sc4',
    band: '2-4',
    title: 'الأرض والنبات',
    emoji: '🌱',
    guide: 'الهدهد',
    units: [
      {
        id: 'sc-seed',
        band: '2-4',
        station: 'sc4',
        sign: 'البذرة والنبات',
        signEmoji: '🌱',
        theme: 'البذرة تنمو: ماء وهواء وضوء، ويخرج النبات بإذن الله.',
        anchor: { rank: 'm4', ref: 'الأنعام ٩٩', url: 'https://quran.com/6/99', review: PENDING, verified: false },
        deed: { emoji: '🌾', text: 'نَزْرَعُ بَذْرَةً وَنَسْقِيهَا كُلَّ يَوْمٍ' },
      },
      {
        id: 'sc-palm',
        band: '2-4',
        station: 'sc4',
        sign: 'النخلة',
        signEmoji: '🌴',
        theme: 'النخلة شجرة مباركة: جذعها، سعفها، وثمرها.',
        anchor: { rank: 'm4', ref: 'النحل ١١', url: 'https://quran.com/16/11', review: PENDING, verified: false },
        deed: { emoji: '🌴', text: 'نُهْدِي ثَمَرَاتٍ لِجَارٍ' },
      },
      {
        id: 'sc-seasons',
        band: '2-4',
        station: 'sc4',
        sign: 'الفصول',
        signEmoji: '🍂',
        theme: 'الفصول تتغيّر بعدد وأقدار، ولها مواعيد.',
        anchor: { rank: 'm4', ref: 'البقرة ١٦٤', url: 'https://quran.com/2/164', review: PENDING, verified: false },
        deed: { emoji: '🧥', text: 'نُعِدُّ مَا نَحْتَاجُهُ لِفَصْلِنَا وَنَتَصَدَّقُ بِالزَّائِدِ' },
      },
    ],
  },
  {
    id: 'sc5',
    band: '2-4',
    title: 'الحركة والقوة',
    emoji: '⚖️',
    guide: 'الهدهد',
    units: [
      {
        id: 'sc-push',
        band: '2-4',
        station: 'sc5',
        sign: 'الدفع والسحب',
        signEmoji: '🚪',
        theme: 'نحرّك الأشياء بقوة، ولكل حركة سبب.',
        anchor: { rank: 'm4', ref: 'الروم ٥٤', url: 'https://quran.com/30/54', review: PENDING, verified: false },
        deed: { emoji: '🤝', text: 'نُسَاعِدُ أَحَدًا فِي حَمْلِ شَيْءٍ ثَقِيلٍ' },
      },
      {
        id: 'sc-balance',
        band: '2-4',
        station: 'sc5',
        sign: 'الميزان',
        signEmoji: '⚖️',
        theme: 'الوزن والعدل: نزن، ونقارن، ولا نبخس.',
        // «وَالسَّمَاءَ رَفَعَهَا وَوَضَعَ الْمِيزَانَ» — الطول والكتلة والعدل في آية.
        anchor: { rank: 'm4', ref: 'الرحمن ٧', url: 'https://quran.com/55/7', review: PENDING, verified: false },
        deed: { emoji: '⚖️', text: 'نَقْسِمُ بَيْنَ أَصْدِقَائِنَا بِالْعَدْلِ' },
      },
    ],
  },
  {
    id: 'sc6',
    band: '2-4',
    title: 'الضوء والظل',
    emoji: '🌤️',
    guide: 'الهدهد',
    units: [
      {
        id: 'sc-shadow',
        band: '2-4',
        station: 'sc6',
        sign: 'الظل',
        signEmoji: '🌤️',
        theme: 'الظل يمتدّ ويتقلّص بحركة الشمس — قياس وملاحظة.',
        anchor: { rank: 'm4', ref: 'الفرقان ٤٥', url: 'https://quran.com/25/45', review: PENDING, verified: false },
        deed: { emoji: '🌳', text: 'نَسْتَظِلُّ وَنَشْكُرُ اللهَ عَلَى الرَّاحَةِ' },
      },
      {
        id: 'sc-night-day',
        band: '2-4',
        station: 'sc6',
        sign: 'الليل والنهار',
        signEmoji: '🌗',
        theme: 'الليل لباس والنهار معاش، آيتان من آيات الله.',
        anchor: { rank: 'm4', ref: 'الإسراء ١٢', url: 'https://quran.com/17/12', review: PENDING, verified: false },
        deed: { emoji: '🌙', text: 'نَنَامُ مُبَكِّرِينَ لِنَقُومَ لِصَلَاةِ الفَجْرِ' },
      },
    ],
  },
  {
    id: 'sc7',
    band: '4-6',
    title: 'الأرض والسماء',
    emoji: '🌍',
    guide: 'الهدهد',
    units: [
      {
        id: 'sc-sun-moon',
        band: '4-6',
        station: 'sc7',
        sign: 'الشمس والقمر',
        signEmoji: '🌞',
        theme: 'الشمس سراج والقمر منير، ولكلٍّ مدار لا يتجاوزه.',
        // «لَا الشَّمْسُ يَنبَغِي لَهَا أَن تُدْرِكَ الْقَمَرَ»
        anchor: { rank: 'm4', ref: 'يس ٣٨–٤٠', url: 'https://quran.com/36/38', review: PENDING, verified: false },
        deed: { emoji: '📅', text: 'نَرْصُدُ الشَّمْسَ وَالقَمَرَ وَنُسَجِّلُ مَا نَرَى' },
      },
      {
        id: 'sc-stars',
        band: '4-6',
        station: 'sc7',
        sign: 'النجوم',
        signEmoji: '⭐',
        theme: 'النجوم يُهتدى بها، والسماء مرفوعة بلا عمد.',
        anchor: { rank: 'm4', ref: 'الذاريات ٤٧', url: 'https://quran.com/51/47', review: PENDING, verified: false },
        deed: { emoji: '🔭', text: 'نَنْظُرُ السَّمَاءَ لَيْلًا وَنَتَذَكَّرُ عَظَمَةَ الخَالِقِ' },
      },
    ],
  },
  {
    id: 'sc8',
    band: '4-6',
    title: 'البيئة والخلافة',
    emoji: '🌍',
    guide: 'الهدهد',
    units: [
      {
        id: 'sc-balance-eco',
        band: '4-6',
        station: 'sc8',
        sign: 'التوازن في الكون',
        signEmoji: '🌍',
        theme: 'لكل شيء قدر، والنظام البيئي توازن دقيق.',
        anchor: { rank: 'm4', ref: 'القمر ٤٩', url: 'https://quran.com/54/49', review: PENDING, verified: false },
        deed: { emoji: '♻️', text: 'نُفَرِّزُ النُّفَايَاتِ وَنُعِيدُ مَا نَسْتَطِيعُ اسْتِعْمَالَهُ' },
      },
      {
        id: 'sc-israf',
        band: '4-6',
        station: 'sc8',
        sign: 'الإسراف',
        signEmoji: '🚫',
        theme: 'لا نسرف في ماء ولا طعام ولا كهرباء.',
        anchor: { rank: 'm4', ref: 'الأعراف ٣١', url: 'https://quran.com/7/31', review: PENDING, verified: false },
        deed: { emoji: '💡', text: 'نُطْفِئُ مَا لَا نَحْتَاجُهُ مِنْ أَنْوَارٍ' },
      },
    ],
  },
];

// حالة المراجعة تُفرض فرضًا لا تُكتب تكرارًا: أي وحدة جديدة تدخل المجرى تبدأ
// `pending` و`voiced: false` تلقائيًا، فلا يمكن أن تتسرّب وحدة غير مُراجَعة إلى العرض
// بنسيان حقل. (اختبار `tests/salman-k5.test.mjs` يحرس ذلك.)
const withReviewState = (u) => ({
  ...u,
  review: u.review ?? PENDING,
  voiced: u.voiced ?? false,
  anchor: { ...u.anchor, review: u.anchor?.review ?? PENDING, verified: u.anchor?.verified ?? false },
});

export const SCIENCE_STATIONS = STATIONS.map((st) => ({
  ...st,
  units: st.units.map(withReviewState),
}));

// وحدات المجرى مسطّحة، ومعرّفاتها فريدة.
export const SCIENCE_UNITS = Object.fromEntries(SCIENCE_STATIONS.flatMap((st) => st.units.map((u) => [u.id, u])));

export function scienceStation(id) {
  return SCIENCE_STATIONS.find((st) => st.id === id) || null;
}

/** محطات نطاق: أساس الخريطة المرحلية لمجرى الكون. */
export function scienceStationsForBand(band) {
  return SCIENCE_STATIONS.filter((st) => st.band === band);
}

/**
 * هل تصلح الوحدة للعرض على الطفل؟
 * الرادّ واحد: أن تنجح في سجل المراجعة وتعود `anchor.verified` صحيحة.
 * الواجهة لا تسأل غيرها — وهذه هي القاعدة التي تحمي الطفل.
 */
export function scienceUnitPlayable(unit) {
  return Boolean(unit && unit.anchor && unit.anchor.verified === true && unit.review === 'ok');
}

export function playableScienceUnits() {
  return Object.values(SCIENCE_UNITS).filter(scienceUnitPlayable);
}
