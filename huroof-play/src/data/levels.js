// المصدر الوحيد لمحتوى اللعبة: 7 مستويات × 4 أزواج = 28 حرفًا (كل الأبجدية).
// كل زوج: الحرف (الشكل المنفرد)، واسم الحيوان بالعربية (بدون تشكيل) — ويجب أن يبدأ الاسم بنفس الحرف.
// الاختبار tests/content.test.js يتحقق من ذلك آليًا. التفاصيل: docs/CONTENT.md
// visual.emoji: احتياطي يظهر لو الصورة المولّدة ما اتحمّلتش. visual.image: مسار الرسمة (Phase 2).

export const ANIMALS = {
  أ: { word: 'أسد', emoji: '🦁' },
  ب: { word: 'بطة', emoji: '🦆' },
  ت: { word: 'تمساح', emoji: '🐊' },
  ث: { word: 'ثعلب', emoji: '🦊' },
  ج: { word: 'جمل', emoji: '🐪' },
  ح: { word: 'حصان', emoji: '🐴' },
  خ: { word: 'خروف', emoji: '🐑' },
  د: { word: 'دب', emoji: '🐻' },
  ذ: { word: 'ذئب', emoji: '🐺' },
  ر: { word: 'راكون', emoji: '🦝' },
  ز: { word: 'زرافة', emoji: '🦒' },
  س: { word: 'سلحفاة', emoji: '🐢' },
  ش: { word: 'شمبانزي', emoji: '🐒' },
  ص: { word: 'صقر', emoji: '🦅' },
  ض: { word: 'ضفدع', emoji: '🐸' },
  ط: { word: 'طاووس', emoji: '🦚' },
  ظ: { word: 'ظبي', emoji: '🦌' },
  ع: { word: 'عصفور', emoji: '🐦' },
  غ: { word: 'غوريلا', emoji: '🦍' },
  ف: { word: 'فيل', emoji: '🐘' },
  ق: { word: 'قط', emoji: '🐱' },
  ك: { word: 'كلب', emoji: '🐶' },
  ل: { word: 'لاما', emoji: '🦙' },
  م: { word: 'ماعز', emoji: '🐐' },
  ن: { word: 'نحلة', emoji: '🐝' },
  ه: { word: 'هامستر', emoji: '🐹' },
  و: { word: 'وحيد القرن', emoji: '🦏' },
  ي: { word: 'يمامة', emoji: '🕊️' },
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

// يبني بيانات كل مستوى من الجدولين السابقين: pairs = [{ letter, word, emoji, image }]
export function buildLevels() {
  return LEVELS.map((level) => ({
    ...level,
    pairs: level.letters.map((letter) => {
      const animal = ANIMALS[letter];
      return { letter, word: animal.word, emoji: animal.emoji, image: null };
    }),
  }));
}

export const LEVEL_DATA = buildLevels();
export const ALL_LETTERS = LEVEL_DATA.flatMap((l) => l.letters);
