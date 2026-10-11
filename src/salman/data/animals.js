// الحيوانات الـ 28 لتمرين الحرف ← الحيوان (المرحلة B).
// منسوخة من huroof-play/src/data/levels.js (المصدر الوحيد لمحتوى الحروف في مشروع مغامرة الحروف).
// القاعدة: اسم الحيوان يبدأ بنفس الحرف. الاختبار tests/salman-letters.test.mjs يتحقق من ذلك.
// art: رسمة مائية جاهزة في public/salman/art/animals/<slug>.png. clip: مقطع اسم الحرف في public/salman/audio/letters/letter-NN.mp3.
// الرقم NN هو ترتيب الحرف (1 لـ أ … 28 لـ ي). الحروف بلا علم تظهر بالإيموجي حتى تُولَّد أصولها.

export const ANIMALS = {
  أ: { word: 'أسد', emoji: '🦁', slug: 'lion', art: true, clip: true },
  ب: { word: 'بطة', emoji: '🦆', slug: 'duck', art: true, clip: true },
  ت: { word: 'تمساح', emoji: '🐊', slug: 'crocodile', art: true, clip: true },
  ث: { word: 'ثعلب', emoji: '🦊', slug: 'fox', art: true, clip: true },
  ج: { word: 'جمل', emoji: '🐪', slug: 'camel', art: true, clip: true },
  ح: { word: 'حصان', emoji: '🐴', slug: 'horse', art: true, clip: true },
  خ: { word: 'خروف', emoji: '🐑', slug: 'sheep', art: true, clip: true },
  د: { word: 'دب', emoji: '🐻', slug: 'bear', art: true, clip: true },
  ذ: { word: 'ذئب', emoji: '🐺', slug: 'wolf', art: true, clip: true },
  ر: { word: 'راكون', emoji: '🦝', slug: 'raccoon', art: true, clip: true },
  ز: { word: 'زرافة', emoji: '🦒', slug: 'giraffe', art: true, clip: true },
  س: { word: 'سلحفاة', emoji: '🐢', slug: 'turtle', art: true, clip: true },
  ش: { word: 'شمبانزي', emoji: '🐒', slug: 'chimpanzee', art: true, clip: true },
  ص: { word: 'صقر', emoji: '🦅', slug: 'eagle', art: true, clip: true },
  ض: { word: 'ضفدع', emoji: '🐸', slug: 'frog', art: true, clip: true },
  ط: { word: 'طاووس', emoji: '🦚', slug: 'peacock', art: true, clip: true },
  ظ: { word: 'ظبي', emoji: '🦌', slug: 'deer', art: true, clip: true },
  ع: { word: 'عصفور', emoji: '🐦', slug: 'sparrow', art: true, clip: true },
  غ: { word: 'غوريلا', emoji: '🦍', slug: 'gorilla', art: true, clip: true },
  ف: { word: 'فيل', emoji: '🐘', slug: 'elephant', art: true, clip: true },
  ق: { word: 'قط', emoji: '🐱', slug: 'cat', art: false, clip: false },
  ك: { word: 'كلب', emoji: '🐶', slug: 'dog', art: false, clip: false },
  ل: { word: 'لاما', emoji: '🦙', slug: 'llama', art: false, clip: false },
  م: { word: 'ماعز', emoji: '🐐', slug: 'goat', art: false, clip: false },
  ن: { word: 'نحلة', emoji: '🐝', slug: 'bee', art: false, clip: false },
  ه: { word: 'هامستر', emoji: '🐹', slug: 'hamster', art: false, clip: false },
  و: { word: 'وحيد القرن', emoji: '🦏', slug: 'rhinoceros', art: false, clip: false },
  ي: { word: 'يمامة', emoji: '🕊️', slug: 'dove', art: false, clip: false },
};
