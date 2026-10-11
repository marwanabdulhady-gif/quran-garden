// «حدائق النور» — محتوى المحطة الأولى (الطيار): العربية ا ب م د · الرياضيات ١–٤ · الإنجليزية s a t i.
// الطريقة: docs/salmans-garden/PLAN-ISLAMIC-PHONICS.md §4 (الدرس اليومي بسبع خطوات).
// المصادر: كتابا الحروف (docs/salmans-garden/source/*.md) + additions-fa-and-numbers.md.
// المراجعة: docs/salmans-garden/CONTENT-REVIEW.md — لا صوت ولا عرض للطفل قبل صفّ مراجعة.
// القاعدة البصرية: لا بناء جديد — الخلفيات والشخصيات الحالية + صور قليلة للأشياء (public/salman/art/nour/).
//
// حالة المراجعة لكل قصة: 'ok' ✅ (قوبل على sunnah.com) · 'note' 🟡 (مقبول مع ملاحظة) · 'pending' ⬜.

import { LETTER_UNITS } from './nour-letters.js';

export const REVIEW = { ok: 'ok', note: 'note', pending: 'pending' };

// خطوات اليوم السبع: هي نفسها لكل حديقة (حرف أو رقم أو صوت).
export const DAY_STEPS = [
  { id: 'door', title: 'باب القصة', emoji: '📖', minutes: 1, hint: 'نفتح كتاب الحكاية' },
  { id: 'story', title: 'القصة', emoji: '🗣️', minutes: 2, hint: 'نسمع وننظر للصورة' },
  { id: 'sound', title: 'الصوت والحركة', emoji: '🎵', minutes: 1, hint: 'نقلّد الحركة ونردد النشيد' },
  { id: 'hunt', title: 'صيد الصوت', emoji: '🔍', minutes: 1, hint: 'ننقر ما يبدأ بالصوت' },
  { id: 'trace', title: 'التتبّع', emoji: '✏️', minutes: 2, hint: 'نرسم بإصبعنا على الرسم' },
  { id: 'play', title: 'اللعب', emoji: '🎮', minutes: 2, hint: 'لعبة صغيرة' },
  { id: 'deed', title: 'عمل اليوم', emoji: '💚', minutes: 1, hint: 'عمل واحد نفعله اليوم' },
];

// ---------- العربية: المحطة الأولى (المجموعة الصوتية 1) ----------
const arabic = [
  {
    id: 'ar-أ',
    clip: 'ar-alif',
    letter: 'أ',
    sound: 'أَ',
    keyWord: 'أُحُد',
    keyEmoji: '⛰️',
    art: 'salman/art/nour/mountain.png',
    letterAudio: 'salman/audio/letters/letter-01.mp3',
    action: { emoji: '👂', text: 'ضع كفّك خلف أذنك كأنك تسمع الأذان' },
    chant: {
      voiced: true,
      lines: ['أَ … أَ … أُحُد', 'جَبَلٌ يُحِبُّنَا وَنُحِبُّهُ'],
      text: 'أَ، أَ، أُحُد. جبلٌ يحبّنا ونحبّه.',
    },
    trace: { script: 'ar', glyph: 'أ', hint: 'من أعلى إلى أسفل، خطٌّ واحد' },
    hunt: {
      prompt: 'اِنْقُرْ كُلَّ مَا يَبْدَأُ بِـ «أَ»',
      items: [
        { label: 'أُحُد', emoji: '⛰️', correct: true },
        { label: 'أَسَد', emoji: '🦁', correct: true },
        { label: 'أَرْنَب', emoji: '🐰', correct: true },
        { label: 'بَاب', emoji: '🚪', correct: false },
        { label: 'مَسْجِد', emoji: '🕌', correct: false },
      ],
    },
    train: { prompt: 'رَكِّبِ الكَلِمَةَ بِالتَّرْتِيب', tiles: ['أَ', 'بَ'], result: 'أَب' },
    boxes: { prompt: 'ضَعْ كُلَّ حَرْفٍ فِي صُنْدُوقِهِ', word: 'أَب', tiles: ['أَ', 'ب'] },
    play: 'train',
    deed: { emoji: '🕌', text: 'نُرَدِّدُ مَعَ المُؤَذِّنِ' },
    stories: [
      {
        id: 'ar-a-p',
        from: 'prophet',
        title: 'جبل أُحُد',
        text: 'صَعِدَ النَّبِيُّ ﷺ جَبَلَ أُحُدٍ مَعَ أَصْحَابِهِ أَبُو بَكْرٍ وَعُمَرَ وَعُثْمَانَ، فَرْجَفَ الجَبَلُ فَرَحًا بِهِمْ! فَقَالَ ﷺ بِرِفْقٍ: «اثْبُتْ أُحُد؛ فَإِنَّمَا عَلَيْكَ نَبِيٌّ وَصِدِّيقٌ وَشَهِيدَانِ». وَكَانَ ﷺ إِذَا رَأَى أُحُدًا قَالَ: «هَذَا جَبَلٌ يُحِبُّنَا وَنُحِبُّهُ». أُحُدٌ جَبَلٌ فِي المَدِينَةِ، وَقَلْبُهُ يَحُبُّ النَّبِيَّ ﷺ.',
        ref: 'البخاري 3675 (فضائل الصحابة، ح 25) · مسلم 1393',
        url: 'https://sunnah.com/bukhari:3675',
        review: 'ok',
        voiced: true,
      },
      {
        id: 'ar-a-c',
        from: 'companions',
        title: 'المؤذّن أبو محذورة',
        text: 'أَبُو مَحْذُورَةَ شَابٌّ صَوْتُهُ عَالٍ جَمِيلٌ. سَمِعَ الأَذَانَ فَقَلَّدَ المُؤَذِّنَ مَعَ أَصْحَابِهِ، فَسَمِعَ صَوْتَهُ النَّبِيُّ ﷺ، فَأَرْسَلَ إِلَيْهِمْ حَتَّى وَقَفُوا بَيْنَ يَدَيْهِ. قَالَ ﷺ: «قُمْ فَأَذِّنْ بِالصَّلَاةِ»، فَأَذَّنَ أَبُو مَحْذُورَةَ، فَأَعْجَبَ صَوْتُهُ النَّبِيَّ ﷺ، وَعَلَّمَهُ الأَذَانَ بِنَفْسِهِ، وَمَسَحَ عَلَى نَاصِيَتِهِ. ثُمَّ قَالَ لَهُ: «قَدْ أَمَرْتُكَ بِهِ». فَصَارَ أَبُو مَحْذُورَةَ رَضِيَ اللهُ عَنْهُ مُؤَذِّنًا فِي البَيْتِ الحَرَامِ.',
        ref: 'صحيح النسائي 632 (حسن) · صحيح أبي داود 501',
        url: 'https://sunnah.com/nasai:632',
        review: 'ok',
        voiced: true,
        note: 'بالمعنى، بلا زيادة على ما في الرواية: حُذف ذكر «خمسين سنة» و«الدعاء له» لعدم ثبوتهما في هذا الطريق.',
      },
    ],
  },
  {
    id: 'ar-ب',
    clip: 'ar-ba',
    letter: 'ب',
    sound: 'بَ',
    keyWord: 'بَاب',
    keyEmoji: '🚪',
    art: 'salman/art/nour/door.png',
    letterAudio: 'salman/audio/letters/letter-02.mp3',
    action: { emoji: '✊', text: 'اطرق الباب في الهواء: طَك طَك' },
    chant: { voiced: true, lines: ['بَ … بَ … بَاب', 'أَطْرُقُ وَأَسْتَأْذِنُ'], text: 'بَ، بَ، باب. أطرق وأستأذن.' },
    trace: { script: 'ar', glyph: 'ب', hint: 'القوس أولًا من اليمين إلى اليسار، ثم النقطة تحته' },
    hunt: {
      prompt: 'اِنْقُرْ كُلَّ مَا يَبْدَأُ بِـ «بَ»',
      items: [
        { label: 'بَاب', emoji: '🚪', correct: true },
        { label: 'بَطَّة', emoji: '🦆', correct: true },
        { label: 'بِنْت', emoji: '👧', correct: true },
        { label: 'تُفَّاح', emoji: '🍎', correct: false },
        { label: 'دِيك', emoji: '🐓', correct: false },
      ],
    },
    train: { prompt: 'رَكِّبِ الكَلِمَةَ بِالتَّرْتِيب', tiles: ['بَ', 'ا', 'ب'], result: 'بَاب' },
    boxes: { prompt: 'ضَعْ كُلَّ حَرْفٍ فِي صُنْدُوقِهِ', word: 'بَاب', tiles: ['بَ', 'ا', 'ب'] },
    play: 'train',
    deed: { emoji: '🚪', text: 'نَطْرُقُ البَابَ وَنَقُولُ: السَّلَامُ عَلَيْكُمْ' },
    stories: [
      {
        id: 'ar-b-p',
        from: 'prophet',
        title: 'أَدَبُ البَاب',
        text: 'كَانَ أَنَسٌ خَادِمَ النَّبِيِّ ﷺ وَعُمْرُهُ عَشْرُ سِنِينَ، وَكَانَ يَدْخُلُ بِغَيْرِ إِذْنٍ. فَنَزَلَتْ آيَةُ الاِسْتِئْذَانِ: ﴿لَا تَدْخُلُوا بُيُوتًا غَيْرَ بُيُوتِكُمْ حَتَّى تَسْتَأْنِسُوا وَتُسَلِّمُوا عَلَى أَهْلِهَا﴾. فَقَالَ ﷺ: «كَمَا أَنْتَ يَا بُنَيَّ؛ لَا تَدْخُلَنَّ إِلَّا بِإِذْنٍ، وَاطْرُقِ البَابَ وَانْتَظِرْ». وَجَاءَ جَابِرٌ فَدَقَّ البَابَ، فَقَالَ ﷺ: «مَنْ ذَا؟» فَقَالَ: أَنَا جَابِرٌ. فَعَلَّمَنَا أَنْ نَقُولَ اسْمَنَا.',
        ref: 'البخاري 6250 (الاستئذان، ح 24) · النور 27',
        url: 'https://sunnah.com/bukhari:6250',
        review: 'ok',
        voiced: true,
      },
      {
        id: 'ar-b-c',
        from: 'companions',
        title: 'فاطمة بنت النبي ﷺ',
        text: 'فَاطِمَةُ بِنْتُ النَّبِيِّ ﷺ، وَهُوَ يُحِبُّهَا كَثِيرًا. كَانَ ﷺ إِذَا جَاءَتْ إِلَيْهِ قَامَ لَهَا وَرَحَّبَ بِهَا وَقَبَّلَهَا وَأَجْلَسَهَا فِي مَجْلِسِهِ. وَكَانَتْ إِذَا دَخَلَ عَلَيْهَا قَامَتْ لَهُ وَأَخَذَتْ بِيَدِهِ وَرَحَّبَتْ بِهِ وَقَبَّلَتْهُ وَأَجْلَسَتْهُ فِي مَجْلِسِهَا. وَقَالَ ﷺ: «فَاطِمَةُ بُضْعَةٌ مِنِّي، فَمَنْ أَغْضَبَهَا أَغْضَبَنِي». فَاطِمَةُ رَضِيَ اللهُ عَنْهَا تُحِبُّ أَبَاهَا، وَنَحْنُ نُحِبُّ أَبَانَا وَأُمَّنَا وَنُقَبِّلُ أَيْدِيَهُمَا.',
        ref: 'الأدب المفرد 971 · البخاري 3714 و3623',
        url: 'https://sunnah.com/adab:971',
        review: 'ok',
        voiced: true,
        note: 'لفظ الحديث بين «» مطابق (البخاري 3714). و«تقبيل الجبهة» استُبدل بما في الأدب المفرد 971: تقبيل بلا تحديد موضع.',
      },
    ],
  },
  {
    id: 'ar-م',
    clip: 'ar-meem',
    letter: 'م',
    sound: 'مَ',
    keyWord: 'مَسْجِد',
    keyEmoji: '🕌',
    art: 'salman/art/nour/mosque.png',
    letterAudio: 'salman/audio/letters/letter-24.mp3',
    action: { emoji: '🙌', text: 'ارفع يديك واصنع قبةً فوق رأسك' },
    chant: {
      voiced: true,
      lines: ['مَ … مَ … مَسْجِد', 'أَمْشِي إِلَى المَسْجِدِ بِفَرَحٍ'],
      text: 'مَ، مَ، مسجد. أمشي إلى المسجد بفرح.',
    },
    trace: { script: 'ar', glyph: 'م', hint: 'الرأس دائرة صغيرة، ثم ننزل بالذيل إلى اليسار' },
    hunt: {
      prompt: 'اِنْقُرْ كُلَّ مَا يَبْدَأُ بِـ «مَ»',
      items: [
        { label: 'مَسْجِد', emoji: '🕌', correct: true },
        { label: 'مَاء', emoji: '💧', correct: true },
        { label: 'مَاعِز', emoji: '🐐', correct: true },
        { label: 'بَاب', emoji: '🚪', correct: false },
        { label: 'أُحُد', emoji: '⛰️', correct: false },
      ],
    },
    train: { prompt: 'رَكِّبِ الكَلِمَةَ بِالتَّرْتِيب', tiles: ['مَ', 'ا', 'ء'], result: 'مَاء' },
    boxes: { prompt: 'ضَعْ كُلَّ حَرْفٍ فِي صُنْدُوقِهِ', word: 'مَاء', tiles: ['مَ', 'ا', 'ء'] },
    play: 'boxes',
    deed: { emoji: '🕌', text: 'نَذْهَبُ إِلَى المَسْجِدِ مَعَ العَائِلَةِ' },
    stories: [
      {
        id: 'ar-m-p',
        from: 'prophet',
        title: 'أمامة في المسجد',
        text: 'كَانَ النَّبِيُّ ﷺ يُصَلِّي فِي المَسْجِدِ وَهُوَ يَحْمِلُ حَفِيدَتَهُ أُمَامَةَ بِنْتَ زَيْنَبَ. فَإِذَا قَامَ حَمَلَهَا، وَإِذَا سَجَدَ وَضَعَهَا بِرِفْقٍ. رَآهُ أَبُو قَتَادَةَ رَضِيَ اللهُ عَنْهُ فَأَخْبَرَنَا بِذَلِكَ. المَسْجِدُ بَيْتُ اللهِ، وَفِيهِ الرَّحْمَةُ وَالحَنَانُ.',
        ref: 'صحيح مسلم 543 (رواية أبي قتادة) · البخاري 516',
        url: 'https://sunnah.com/muslim:543a',
        review: 'ok',
        voiced: true,
      },
      {
        id: 'ar-m-c',
        from: 'companions',
        title: 'الدعاء الذي علّمه النبي ﷺ',
        text: 'كَانَ عُثْمَانُ بْنُ أَبِي العَاصِ أَصْغَرَ وَفْدِ ثَقِيفٍ، وَكَانَ أَحْرَصَهُمْ عَلَى التَّعَلُّمِ، فَقَالَ لَهُ النَّبِيُّ ﷺ: «أَنْتَ إِمَامُهُمْ». ثُمَّ أَصَابَهُ أَلَمٌ شَدِيدٌ، فَشَكَا لِلنَّبِيِّ ﷺ، فَعَلَّمَهُ دُعَاءً: يَضَعُ يَدَهُ عَلَى مَوْضِعِ الأَلَمِ، وَيَقُولُ: بِاسْمِ اللهِ ثَلَاثًا، وَسَبْعَ مَرَّاتٍ: «أَعُوذُ بِعِزَّةِ اللهِ وَقُوَّتِهِ مِنْ شَرِّ مَا أَجِدُ». فَشَفَاهُ اللهُ تَعَالَى.',
        ref: 'صحيح الترمذي 2080 · صحيح مسلم 2202 · كتاب الصحابة ص 55 (سياق «أنت إمامهم»)',
        url: 'https://sunnah.com/tirmidhi:2080',
        review: 'ok',
        voiced: true,
        note: 'لفظ الدعاء كما في الترمذي 2080 و«باسم الله ثلاثًا» كما في مسلم 2202؛ وسياق الإمامة من فصل الكتاب بلا زيادة.',
      },
    ],
  },
  {
    id: 'ar-د',
    clip: 'ar-dal',
    letter: 'د',
    sound: 'دَ',
    keyWord: 'دِيك',
    keyEmoji: '🐓',
    art: 'salman/art/nour/rooster.png',
    letterAudio: 'salman/audio/letters/letter-08.mp3',
    action: { emoji: '🐓', text: 'حرّك ذراعيك كالجناحين وقل: كوكوكو' },
    chant: { voiced: true, lines: ['دَ … دَ … دِيك', 'يُوقِظُنَا لِلصَّلَاةِ'], text: 'دَ، دَ، ديك. يوقظنا للصلاة.' },
    trace: { script: 'ar', glyph: 'د', hint: 'قوسٌ صغير من فوق، ثم ننزل به إلى اليسار' },
    hunt: {
      prompt: 'اِنْقُرْ كُلَّ مَا يَبْدَأُ بِـ «دَ»',
      items: [
        { label: 'دِيك', emoji: '🐓', correct: true },
        { label: 'دُبّ', emoji: '🐻', correct: true },
        { label: 'دَجَاجَة', emoji: '🐔', correct: true },
        { label: 'أَسَد', emoji: '🦁', correct: false },
        { label: 'مَاء', emoji: '💧', correct: false },
      ],
    },
    train: { prompt: 'رَكِّبِ الكَلِمَةَ بِالتَّرْتِيب', tiles: ['دَ', 'بّ'], result: 'دُبّ' },
    boxes: { prompt: 'ضَعْ كُلَّ حَرْفٍ فِي صُنْدُوقِهِ', word: 'دُبّ', tiles: ['دُ', 'بّ'] },
    play: 'boxes',
    deed: { emoji: '🌅', text: 'حِينَ نَسْمَعُ الدِّيكَ نَقُولُ: اللَّهُمَّ إِنِّي أَسْأَلُكَ مِنْ فَضْلِكَ' },
    stories: [
      {
        id: 'ar-d-p',
        from: 'prophet',
        title: 'الديك يُوقظ للصلاة',
        text: 'خَلَقَ اللهُ الدِّيكَ لِنَنْتَفِعَ بِصَوْتِهِ، فَيَصِيحُ عِنْدَ الفَجْرِ فَيَسْتَيْقِظُ النَّاسُ لِلصَّلَاةِ. وَكَانَ النَّبِيُّ ﷺ يَسْتَيْقِظُ لِصَلَاةِ الوِتْرِ إِذَا سَمِعَ صِيَاحَ الدِّيكِ. وَذَاتَ يَوْمٍ صَاحَ دِيكٌ فَشَتَمَهُ رَجُلٌ، فَقَالَ النَّبِيُّ ﷺ: «لَا تَسُبُّوا الدِّيكَ؛ فَإِنَّهُ يُوقِظُ لِلصَّلَاةِ». وَقَالَ ﷺ: «إِذَا سَمِعْتُمْ صِيَاحَ الدِّيَكَةِ فَاسْأَلُوا اللهَ مِنْ فَضْلِهِ».',
        ref: 'البخاري 1132 (التهجد، ح 12) · صحيح أبي داود 5101 · نسائي، من تخريج الكتاب',
        url: 'https://sunnah.com/bukhari:1132',
        review: 'ok',
        voiced: true,
      },
      {
        id: 'ar-d-c',
        from: 'companions',
        title: 'دعاء أبي هريرة لأمه',
        text: 'كَانَتْ أُمُّ أَبِي هُرَيْرَةَ تُحِبُّ الأَصْنَامَ، فَدَعَاهَا إِلَى الإِسْلَامِ فَرَدَّتْ بِقَسْوَةٍ. حَزِنَ أَبُو هُرَيْرَةَ رَضِيَ اللهُ عَنْهُ وَذَهَبَ إِلَى النَّبِيِّ ﷺ يَبْكِي، وَقَالَ: يَا رَسُولَ اللهِ، ادْعُ اللهَ أَنْ يَهْدِيَ أُمِّي. فَقَالَ ﷺ: «اللَّهُمَّ اهْدِ أُمَّ أَبِي هُرَيْرَةَ». فَلَمَّا رَجَعَ إِلَى البَيْتِ فَتَحَتْ لَهُ البَابَ وَقَالَتْ: أَشْهَدُ أَنْ لَا إِلَهَ إِلَّا اللهُ، وَأَشْهَدُ أَنَّ مُحَمَّدًا رَسُولُ اللهِ. فَرَجَعَ إِلَى النَّبِيِّ ﷺ يَبْكِي مِنَ الفَرَحِ!',
        ref: 'صحيح مسلم 2491 (فضائل الصحابة، ح 226)',
        url: 'https://sunnah.com/muslim:2491',
        review: 'ok',
        voiced: true,
        note: 'بالمعنى؛ حُذفت الكلمات القاسية وأُبقيت القصة ولفظ الدعاء كما في الرواية.',
      },
    ],
  },
];

// ---------- الرياضيات: أرقام النور ١–٤ ----------
// النظام نفسه: قصة من القرآن أو السنة يقابلها الرقم + عمل اليوم + لعبة.
const math = [
  {
    id: 'num-1',
    n: 1,
    keyWord: 'أَحَد',
    keyEmoji: '☝️',
    action: { emoji: '☝️', text: 'ارفع إصبعًا واحدًا' },
    chant: {
      voiced: true,
      lines: ['وَاحِد … اللهُ أَحَد', 'لَا شَرِيكَ لَهُ'],
      text: 'واحد. قل هو الله أحد. لا شريك له.',
    },
    trace: { script: 'num', glyph: '١', latin: '1', hint: 'خطٌّ واحد من أعلى إلى أسفل' },
    hunt: {
      prompt: 'اِنْقُرْ مَا عَدَدُهُ وَاحِد',
      items: [
        { label: 'شَمْسٌ وَاحِدَة', emoji: '☀️', correct: true },
        { label: 'قَمَرٌ وَاحِد', emoji: '🌙', correct: true },
        { label: 'ثَلَاثُ نُجُوم', emoji: '✨✨✨', correct: false },
        { label: 'بَيْضَتَان', emoji: '🥚🥚', correct: false },
      ],
    },
    train: { prompt: 'مَا الَّذِي يَأْتِي بَعْدَ ١؟', tiles: ['١', '٢'], result: '٢' },
    boxes: { prompt: 'ضَعْ كُلَّ حَبَّةٍ فِي صُنْدُوقٍ', word: '☝️', tiles: ['●'] },
    play: 'train',
    deed: { emoji: '🤲', text: 'نَقْرَأُ سُورَةَ الإِخْلَاصِ مَرَّةً' },
    stories: [
      {
        id: 'num-1-s',
        from: 'quran',
        title: 'قُلْ هُوَ اللهُ أَحَدٌ',
        text: 'عَلَّمَنَا اللهُ أَنْ نَقُولَ: ﴿قُلْ هُوَ اللَّهُ أَحَدٌ﴾. اللهُ وَاحِدٌ، لَا شَرِيكَ لَهُ. وَنَحْنُ نَرْفَعُ إِصْبَعًا وَاحِدًا فِي التَّشَهُّدِ. هَيَّا نَرْفَعُ إِصْبَعًا وَاحِدًا وَنَقُولُ: اللهُ أَحَدٌ، لَا شَرِيكَ لَهُ.',
        ref: 'القرآن: الإخلاص 1',
        url: 'https://quran.com/112/1',
        review: 'ok',
        voiced: true,
      },
    ],
  },
  {
    id: 'num-2',
    n: 2,
    keyWord: 'رَكْعَتَان',
    keyEmoji: '🕋',
    action: { emoji: '🙌', text: 'ارفع إصبعين: هذه ركعة وهذه ركعة' },
    chant: {
      voiced: true,
      lines: ['وَاحِد … اثْنَان', 'رَكْعَتَا الفَجْرِ أَحَبُّ إِلَيَّ'],
      text: 'واحد، اثنان. ركعتا الفجر أحب إليّ.',
    },
    trace: { script: 'num', glyph: '٢', latin: '2', hint: 'خطٌّ مائل صغير، ثم مثل عصا' },
    hunt: {
      prompt: 'اِنْقُرْ مَا عَدَدُهُ اثْنَان',
      items: [
        { label: 'حَمَامَتَان', emoji: '🕊️🕊️', correct: true },
        { label: 'عَيْنَان', emoji: '👀', correct: true },
        { label: 'سَمَكَة', emoji: '🐟', correct: false },
        { label: 'أَرْبَعُ زَهَرَات', emoji: '🌷🌷🌷🌷', correct: false },
      ],
    },
    train: { prompt: 'مَا الَّذِي يَأْتِي بَعْدَ ١؟', tiles: ['١', '٢', '٣'], result: '٢' },
    boxes: { prompt: 'اِقْسِمْ إِلَى قِسْمَيْن', word: '٢', tiles: ['●', '●'] },
    play: 'boxes',
    deed: { emoji: '🕌', text: 'نَعُدُّ رَكْعَتَيِ الفَجْرِ مَعَ بَابَا' },
    stories: [
      {
        id: 'num-2-s',
        from: 'hadith',
        title: 'رَكْعَتَا الفَجْر',
        text: 'قَالَتْ عَائِشَةُ رَضِيَ اللهُ عَنْهَا: قَالَ رَسُولُ اللهِ ﷺ: «رَكْعَتَا الفَجْرِ خَيْرٌ مِنَ الدُّنْيَا وَمَا فِيهَا». الرَّكْعَتَانِ صَلَاتَانِ قَبْلَ الفَجْرِ. هَيَّا نَعُدُّ مَعًا: رَكْعَةٌ، وَرَكْعَتَانِ.',
        ref: 'مسلم 725 (صلاة المسافرين، ح 118)',
        url: 'https://sunnah.com/muslim:725',
        review: 'ok',
        voiced: true,
      },
    ],
  },
  {
    id: 'num-3',
    n: 3,
    keyWord: 'ثَلَاثَة',
    keyEmoji: '💧',
    action: { emoji: '💧', text: 'اشرب ثلاث مرات، ونفَسك خارج الكوب' },
    chant: {
      voiced: true,
      lines: ['وَاحِد … اثْنَان … ثَلَاثَة', 'نَشْرَبُ ثَلَاثًا كَمَا فَعَلَ النَّبِيُّ ﷺ'],
      text: 'واحد، اثنان، ثلاثة. نشرب ثلاثًا كما فعل النبي ﷺ.',
    },
    trace: { script: 'num', glyph: '٣', latin: '3', hint: 'ثلاثُ حلقات صغيرة متتابعة' },
    hunt: {
      prompt: 'اِنْقُرْ مَا عَدَدُهُ ثَلَاثَة',
      items: [
        { label: 'رُكْعَةٌ وَاحِدَة', emoji: '🕌', correct: false },
        { label: 'ثَلَاثُ حَبَّات', emoji: '🌰🌰🌰', correct: true },
        { label: 'فَرَاشَاتٌ ثَلَاث', emoji: '🦋🦋🦋', correct: true },
        { label: 'كَوْكَبَان', emoji: '⭐⭐', correct: false },
      ],
    },
    train: { prompt: 'مَا الَّذِي يَأْتِي بَعْدَ ٢؟', tiles: ['١', '٢', '٣'], result: '٣' },
    boxes: { prompt: 'اِقْسِمِ المَاءَ ثَلَاثَ مَرَّات', word: '٣', tiles: ['●', '●', '●'] },
    play: 'train',
    deed: { emoji: '🥤', text: 'نَشْرَبُ المَاءَ عَلَى ثَلَاثِ مَرَّاتٍ وَنَعُدُّهَا' },
    stories: [
      {
        id: 'num-3-s',
        from: 'hadith',
        title: 'ثلاثة أنفاس',
        text: 'كَانَ النَّبِيُّ ﷺ يَشْرَبُ وَيَتَنَفَّسُ ثَلَاثَ مَرَّاتٍ، يَشْرَبُ، ثُمَّ يَتَنَفَّسُ خَارِجَ الإِنَاءِ. قَالَ أَنَسٌ رَضِيَ اللهُ عَنْهُ: كَانَ رَسُولُ اللهِ ﷺ يَتَنَفَّسُ فِي الشَّرَابِ ثَلَاثًا. هَيَّا نَشْرَبُ مَعًا وَنَعُدُّ: وَاحِدٌ، اثْنَانِ، ثَلَاثَةٌ.',
        ref: 'مسلم 2028 (الأشربة، ح 160) · البخاري 5631',
        url: 'https://sunnah.com/muslim:2028',
        review: 'ok',
        voiced: true,
      },
    ],
  },
  {
    id: 'num-4',
    n: 4,
    keyWord: 'أَرْبَعَة',
    keyEmoji: '🐦',
    action: { emoji: '🐦', text: 'ارفع أربعة أصابع، وحرّكها كالطيور' },
    chant: {
      voiced: true,
      lines: ['وَاحِد … اثْنَان … ثَلَاثَة … أَرْبَعَة', 'أَرْبَعَةٌ مِنَ الطَّيْرِ'],
      text: 'واحد، اثنان، ثلاثة، أربعة. أربعة من الطير.',
    },
    trace: { script: 'num', glyph: '٤', latin: '4', hint: 'ثلاثة رؤوس صغيرة، ثم خط يرتفع' },
    hunt: {
      prompt: 'اِنْقُرْ مَا عَدَدُهُ أَرْبَعَة',
      items: [
        { label: 'أَرْبَعَةُ عُصَافِير', emoji: '🐦🐦🐦🐦', correct: true },
        { label: 'أَرْبَعُ نَجْمَات', emoji: '⭐⭐⭐⭐', correct: true },
        { label: 'خَمْسُ زَهَرَات', emoji: '🌼🌼🌼🌼🌼', correct: false },
        { label: 'ثَلَاثُ بَيْضَات', emoji: '🥚🥚🥚', correct: false },
      ],
    },
    train: { prompt: 'مَا الَّذِي يَأْتِي بَعْدَ ٣؟', tiles: ['٢', '٣', '٤'], result: '٤' },
    boxes: { prompt: 'ضَعْ أَرْبَعًا فِي صُنْدُوقٍ', word: '٤', tiles: ['●', '●', '●', '●'] },
    play: 'boxes',
    deed: { emoji: '🔭', text: 'نَعُدُّ أَرْبَعَةَ طُيُورٍ فِي السَّمَاءِ وَنَشْكُرُ اللهَ' },
    stories: [
      {
        id: 'num-4-s',
        from: 'quran',
        title: 'أربعة من الطير',
        text: 'قَالَ إِبْرَاهِيمُ عَلَيْهِ السَّلَامُ: ﴿رَبِّ أَرِنِي كَيْفَ تُحْيِ الْمَوْتَى﴾. فَأَمَرَهُ اللهُ أَنْ يَأْخُذَ ﴿أَرْبَعَةً مِّنَ الطَّيْرِ﴾، ثُمَّ يَدْعُوهُنَّ فَيَأْتِينَهُ سَعْيًا. فَعَلَ إِبْرَاهِيمُ مَا أَمَرَهُ اللهُ، فَجَاءَتِ الطُّيُورُ الأَرْبَعَةُ تَسْعَى إِلَيْهِ. هَيَّا نَعُدُّ: وَاحِدٌ، اثْنَانِ، ثَلَاثَةٌ، أَرْبَعَةٌ.',
        ref: 'القرآن: البقرة 260',
        url: 'https://quran.com/2/260',
        review: 'ok',
        voiced: true,
        note: 'يُقدَّم بلا تفصيل، والآية مقابَلة على النص العثماني.',
      },
    ],
  },
];

// ---------- الإنجليزية: Letters of Light — الأصوات s a t i ----------
const english = [
  {
    id: 'en-s',
    sound: 's',
    keyWord: 'sun',
    keyEmoji: '☀️',
    action: { emoji: '🐍', text: 'Wiggle your hand like a snake and say: sss' },
    chant: {
      voiced: true,
      lines: ['sss … sss … sun', 'Sulaiman heard the ant'],
      text: 'sss, sss, sun. Sulaiman heard the ant.',
      lang: 'en',
    },
    trace: { script: 'en', glyph: 's', hint: 'Start at the top, curve like a little snake' },
    hunt: {
      prompt: 'Tap everything that starts with sss',
      lang: 'en',
      items: [
        { label: 'sun', emoji: '☀️', correct: true },
        { label: 'snake', emoji: '🐍', correct: true },
        { label: 'star', emoji: '⭐', correct: true },
        { label: 'tree', emoji: '🌴', correct: false },
        { label: 'ant', emoji: '🐜', correct: false },
      ],
    },
    train: { prompt: 'Tap the sounds in order', lang: 'en', tiles: ['s', 'a', 't'], result: 'sat' },
    boxes: { prompt: 'One sound in each box', lang: 'en', word: 'sun', tiles: ['s', 'u', 'n'] },
    play: 'train',
    deed: { emoji: '🐜', text: 'Be gentle with small creatures, like the ants' },
    stories: [
      {
        id: 'en-s-s',
        from: 'quran',
        title: 'Sulaiman and the Ant',
        text: 'Sulaiman led a big army. They came to the valley of the ants. A little ant said: "Run, ants! Go into your homes, so Sulaiman and his soldiers do not crush you." Sulaiman heard the ant, and he smiled. He said: "Thank you, Allah, for this gift." Can you say the sound s? sss, sss, sun, sand, snake.',
        lang: 'en',
        ref: 'Quran: an-Naml 18–19',
        url: 'https://quran.com/27/18',
        review: 'ok',
        voiced: true,
      },
    ],
  },
  {
    id: 'en-a',
    sound: 'a',
    keyWord: 'ant',
    keyEmoji: '🐜',
    action: { emoji: '🐜', text: 'Point at things and name them: a, a, ant' },
    chant: {
      voiced: true,
      lines: ['a … a … ant', 'Allah taught Adam the names'],
      text: 'a, a, ant. Allah taught Adam the names.',
      lang: 'en',
    },
    trace: { script: 'en', glyph: 'a', hint: 'A little circle, then a line down' },
    hunt: {
      prompt: 'Tap everything that starts with a',
      lang: 'en',
      items: [
        { label: 'ant', emoji: '🐜', correct: true },
        { label: 'apple', emoji: '🍎', correct: true },
        { label: 'arm', emoji: '💪', correct: true },
        { label: 'pen', emoji: '🖊️', correct: false },
        { label: 'moon', emoji: '🌙', correct: false },
      ],
    },
    train: { prompt: 'Tap the sounds in order', lang: 'en', tiles: ['a', 'n', 't'], result: 'ant' },
    boxes: { prompt: 'One sound in each box', lang: 'en', word: 'ant', tiles: ['a', 'n', 't'] },
    play: 'boxes',
    deed: { emoji: '📚', text: 'Learn one new word today and say it to Baba' },
    stories: [
      {
        id: 'en-a-s',
        from: 'quran',
        title: 'Adam Names the Things',
        text: 'Allah taught Adam the names of all things. Allah said: "Tell the angels their names." Adam said: "This is a tree. This is a bird. This is an ant." Adam knew every name. What can you name? Look around: a mat, a bag, a rag. Say the sound a: a, a, ant.',
        lang: 'en',
        ref: 'Quran: al-Baqarah 31',
        url: 'https://quran.com/2/31',
        review: 'ok',
        voiced: true,
      },
    ],
  },
  {
    id: 'en-t',
    sound: 't',
    keyWord: 'tree',
    keyEmoji: '🌴',
    action: { emoji: '🌴', text: 'Shake your hands like a tree and say: t, t, t' },
    chant: {
      voiced: true,
      lines: ['t … t … tree', 'Maryam shook the palm tree'],
      text: 't, t, tree. Maryam shook the palm tree.',
      lang: 'en',
    },
    trace: { script: 'en', glyph: 't', hint: 'A line down, then a small cross at the top' },
    hunt: {
      prompt: 'Tap everything that starts with t',
      lang: 'en',
      items: [
        { label: 'tree', emoji: '🌴', correct: true },
        { label: 'tap', emoji: '👆', correct: true },
        { label: 'table', emoji: '🪑', correct: true },
        { label: 'sun', emoji: '☀️', correct: false },
        { label: 'ant', emoji: '🐜', correct: false },
      ],
    },
    train: { prompt: 'Tap the sounds in order', lang: 'en', tiles: ['t', 'e', 'n'], result: 'ten' },
    boxes: { prompt: 'One sound in each box', lang: 'en', word: 'tree', tiles: ['t', 'r', 'ee'] },
    play: 'train',
    deed: { emoji: '🌰', text: 'Eat a date and say bismillah' },
    stories: [
      {
        id: 'en-t-s',
        from: 'quran',
        title: 'Maryam and the Palm Tree',
        text: 'Maryam was tired and hungry. Allah said to her: "Shake the trunk of the palm tree, and fresh ripe dates will fall for you." She shook the tree: tap, tap, tap. Dates fell down! Maryam ate and she was happy. Say the sound t: t, t, tree. Can you tap the table like this? Tap, tap, tap.',
        lang: 'en',
        ref: 'Quran: Maryam 25',
        url: 'https://quran.com/19/25',
        review: 'ok',
        voiced: true,
      },
    ],
  },
  {
    id: 'en-i',
    sound: 'i',
    keyWord: 'in',
    keyEmoji: '🧱',
    action: { emoji: '🧱', text: 'Put one hand in the other: brick in, brick in' },
    chant: {
      voiced: true,
      lines: ['i … i … in', 'Brick in, brick in'],
      text: 'i, i, in. Brick in, brick in.',
      lang: 'en',
    },
    trace: { script: 'en', glyph: 'i', hint: 'A line down, then a small dot on top' },
    hunt: {
      prompt: 'Tap everything that starts with i',
      lang: 'en',
      items: [
        { label: 'ink', emoji: '🖊️', correct: true },
        { label: 'insect', emoji: '🐞', correct: true },
        { label: 'igloo', emoji: '🏠', correct: true },
        { label: 'ant', emoji: '🐜', correct: false },
        { label: 'sun', emoji: '☀️', correct: false },
      ],
    },
    train: { prompt: 'Tap the sounds in order', lang: 'en', tiles: ['i', 'n'], result: 'in' },
    boxes: { prompt: 'One sound in each box', lang: 'en', word: 'ink', tiles: ['i', 'n', 'k'] },
    play: 'boxes',
    deed: { emoji: '🔨', text: 'Help Baba fix or build something today' },
    stories: [
      {
        id: 'en-i-s',
        from: 'quran',
        title: "Ibrahim and Isma'il",
        text: 'Ibrahim and his son Isma\'il built the House of Allah. Ibrahim put the bricks, and Isma\'il brought the stones. Brick in, brick in, brick in. They said: "Our Lord, accept this from us." Is there a job you can do with Baba? Say the sound i: i, i, in. Put the brick in.',
        lang: 'en',
        ref: 'Quran: al-Baqarah 127',
        url: 'https://quran.com/2/127',
        review: 'ok',
        voiced: true,
        note: 'لا يُصوَّر نبي؛ مشهد البناء بالحجارة والطير فقط.',
      },
    ],
  },
];

const withGarden = (list, garden) => list.map((u) => ({ ...u, garden }));

// ترتيب الحروف الهجائي: يحكم تسلسل «اليوم التالي» في حديقة الحروف، فأي دفعة جديدة
// (P3/P4) تُدمج هنا وتأخذ مكانها تلقائيًا بلا ترقيع للترتيب.
const LETTER_SEQUENCE = 'أبتثجحخدذرزسشصضطظعغفقكلمنهوي';
const byLetter = (a, b) => LETTER_SEQUENCE.indexOf(a.letter) - LETTER_SEQUENCE.indexOf(b.letter);
const arabicUnits = [...arabic, ...LETTER_UNITS].sort(byLetter);

export const NOUR_UNITS = Object.fromEntries(
  [...withGarden(arabicUnits, 'arabic'), ...withGarden(math, 'math'), ...withGarden(english, 'english')].map((u) => [
    u.id,
    u,
  ])
);

// ترتيب الوحدات داخل كل حديقة (حديقة الحروف بترتيب الألفباء، والبقية بترتيبها)
export const NOUR_ORDER = {
  arabic: arabicUnits.map((u) => u.id),
  math: math.map((u) => u.id),
  english: english.map((u) => u.id),
};

export const UNIT_BY_LETTER = Object.fromEntries(arabicUnits.map((u) => [u.letter, u.id]));

export function nourUnit(id) {
  return NOUR_UNITS[id] || null;
}

export function gardenUnits(garden) {
  return (NOUR_ORDER[garden] || []).map((id) => NOUR_UNITS[id]);
}

// نص القصة للطفل (يُستخدم للنطق الاحتياطي بصوت المتصفح إن لم يوجد المقطع)
export function storyText(unit, story) {
  return story.text;
}

// ---------- اشتقاق واحد لا ينحرف ----------
// الواجهة تحتاج رمزًا معروضًا لكل وحدة (ترويسة اليوم وبطاقات الحدائق) وهو نفس رمز التتبّع؛
// نشتقّه هنا مرة واحدة بدل تكراره في البيانات والواجهة.
for (const unit of Object.values(NOUR_UNITS)) {
  unit.glyph = unit.glyph || unit.trace.glyph;
}
