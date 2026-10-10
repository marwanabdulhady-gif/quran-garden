// المصدر الوحيد لمحتوى اللعبة: 7 مستويات × 4 أزواج = 28 حرفًا (كل الأبجدية).
// كل زوج: الحرف (الشكل المنفرد)، واسم الحيوان بالعربية (بدون تشكيل) — ويجب أن يبدأ الاسم بنفس الحرف.
// الاختبار tests/content.test.js يتحقق من ذلك آليًا. التفاصيل: docs/CONTENT.md
// visual.emoji: احتياطي يظهر لو الصورة المولّدة ما اتحمّلتش. visual.image: مسار الرسمة (Phase 2).

export const ANIMALS = {
  أ: { word: 'أسد', emoji: '🦁', slug: 'lion' },
  ب: { word: 'بطة', emoji: '🦆', slug: 'duck' },
  ت: { word: 'تمساح', emoji: '🐊', slug: 'crocodile' },
  ث: { word: 'ثعلب', emoji: '🦊', slug: 'fox' },
  ج: { word: 'جمل', emoji: '🐪', slug: 'camel' },
  ح: { word: 'حصان', emoji: '🐴', slug: 'horse' },
  خ: { word: 'خروف', emoji: '🐑', slug: 'sheep' },
  د: { word: 'دب', emoji: '🐻', slug: 'bear' },
  ذ: { word: 'ذئب', emoji: '🐺', slug: 'wolf' },
  ر: { word: 'راكون', emoji: '🦝', slug: 'raccoon' },
  ز: { word: 'زرافة', emoji: '🦒', slug: 'giraffe' },
  س: { word: 'سلحفاة', emoji: '🐢', slug: 'turtle' },
  ش: { word: 'شمبانزي', emoji: '🐒', slug: 'chimpanzee' },
  ص: { word: 'صقر', emoji: '🦅', slug: 'eagle' },
  ض: { word: 'ضفدع', emoji: '🐸', slug: 'frog' },
  ط: { word: 'طاووس', emoji: '🦚', slug: 'peacock' },
  ظ: { word: 'ظبي', emoji: '🦌', slug: 'deer' },
  ع: { word: 'عصفور', emoji: '🐦', slug: 'sparrow' },
  غ: { word: 'غوريلا', emoji: '🦍', slug: 'gorilla' },
  ف: { word: 'فيل', emoji: '🐘', slug: 'elephant' },
  ق: { word: 'قط', emoji: '🐱', slug: 'cat' },
  ك: { word: 'كلب', emoji: '🐶', slug: 'dog' },
  ل: { word: 'لاما', emoji: '🦙', slug: 'llama' },
  م: { word: 'ماعز', emoji: '🐐', slug: 'goat' },
  ن: { word: 'نحلة', emoji: '🐝', slug: 'bee' },
  ه: { word: 'هامستر', emoji: '🐹', slug: 'hamster' },
  و: { word: 'وحيد القرن', emoji: '🦏', slug: 'rhinoceros' },
  ي: { word: 'يمامة', emoji: '🕊️', slug: 'dove' },
};

export const LEVELS = [
  { id: 1, title: 'غابة الأصدقاء', goal: 'الحروف الأولى: أ ب ت ث', letters: ['أ', 'ب', 'ت', 'ث'] },
  { id: 2, title: 'مزرعة الحروف', goal: 'ج ح خ د', letters: ['ج', 'ح', 'خ', 'د'] },
  { id: 3, title: 'جبل الحروف', goal: 'ذ ر ز س', letters: ['ذ', 'ر', 'ز', 'س'] },
  { id: 4, title: 'ساحل الحروف', goal: 'ش ص ض ط', letters: ['ش', 'ص', 'ض', 'ط'] },
  { id: 5, title: 'واحة الحروف', goal: 'ظ ع غ ف', letters: ['ظ', 'ع', 'غ', 'ف'] },
  { id: 6, title: 'قرية الحروف', goal: 'ق ك ل م', letters: ['ق', 'ك', 'ل', 'م'] },
  { id: 7, title: 'قمة النجوم', goal: 'ن ه و ي', letters: ['ن', 'ه', 'و', 'ي'] },
];

// الرسومات المولّدة الجاهزة (public/media/animals/<slug>.png). أي حيوان مش هنا بيظهر بالإيموجي لحد ما ترسم.
// tests/content.test.js بيتأكد إن كل ملف هنا موجود فعلًا على القرص.
export const ILLUSTRATED = new Set([
  'lion',
  'duck',
  'crocodile',
  'fox',
  'camel',
  'horse',
  'sheep',
  'bear',
  'wolf',
  'raccoon',
  'giraffe',
  'turtle',
  'chimpanzee',
  'eagle',
  'frog',
  'peacock',
  'deer',
  'sparrow',
  'gorilla',
  'elephant',
]);

export function artPathFor(slug) {
  return ILLUSTRATED.has(slug) ? `media/animals/${slug}.png` : null;
}

// يبني بيانات كل مستوى من الجدولين السابقين: pairs = [{ letter, word, emoji, slug, image }]
export function buildLevels() {
  return LEVELS.map((level) => ({
    ...level,
    pairs: level.letters.map((letter) => {
      const animal = ANIMALS[letter];
      return { letter, word: animal.word, emoji: animal.emoji, slug: animal.slug, image: artPathFor(animal.slug) };
    }),
  }));
}

export const LEVEL_DATA = buildLevels();
export const ALL_LETTERS = LEVEL_DATA.flatMap((l) => l.letters);
