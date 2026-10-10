// كتالوج العناصر القابلة للعب: كل قصة = عنصر فيه نص وسؤال من خيارين.
// الترتيب داخل الزيارة اليومية: العربية ← الرياضيات ← القرآن ← الإنجليزية (اختيار الجلسة في session.js).

import { ARABIC_STORIES } from '../data/stories.generated.js';
import { GARDENS, MATH_STORIES, ENGLISH_STORIES } from '../data/gardens.js';
import { SURAHS, QURAN_LEVELS, SURAH_STORIES } from '../data/quran.js';

const ALPHABET = ARABIC_STORIES.map((l) => l.letter);
const ARABIC_NUMERALS = [
  '٠',
  '١',
  '٢',
  '٣',
  '٤',
  '٥',
  '٦',
  '٧',
  '٨',
  '٩',
  '١٠',
  '١١',
  '١٢',
  '١٣',
  '١٤',
  '١٥',
  '١٦',
  '١٧',
  '١٨',
  '١٩',
  '٢٠',
];

export function toArabicNumeral(n) {
  return ARABIC_NUMERALS[n] ?? String(n);
}

function arabicItems() {
  const items = [];
  for (const L of ARABIC_STORIES) {
    // سؤال الحرف: أي حرف يبدأ به الكلمة؟ الخيار الثاني حرف قريب من الترتيب الهجائي
    const distractor = ALPHABET[(ALPHABET.indexOf(L.letter) + 3) % ALPHABET.length];
    for (const st of L.stories) {
      const word = st.source === 'companions' && L.companionWord ? L.companionWord : L.word;
      items.push({
        id: st.id,
        garden: 'arabic',
        title: st.title,
        source: st.source,
        paragraphs: st.paragraphs,
        question: {
          prompt: `أي حرف يبدأ به «${word}»؟`,
          choices: [L.letter, distractor],
          answer: L.letter,
        },
      });
    }
  }
  return items;
}

function mathItems() {
  return MATH_STORIES.map((m) => {
    const distractor = m.count >= 10 ? m.count - 1 : m.count + 1;
    return {
      id: m.id,
      garden: 'math',
      title: m.title,
      paragraphs: [m.text],
      audio: `stories/${m.id}`,
      question: {
        prompt: 'كم العدد؟',
        choices: [toArabicNumeral(m.count), toArabicNumeral(distractor)],
        answer: toArabicNumeral(m.count),
      },
    };
  });
}

function quranItems() {
  const items = [];
  for (const level of QURAN_LEVELS) {
    for (const sid of level.surahs) {
      const surah = SURAHS[sid];
      // الخيار الثاني: سورة أخرى من نفس المستوى
      const others = level.surahs.filter((x) => x !== sid);
      const distractor = SURAHS[others[0]].name;
      items.push({
        id: `q-${sid}`,
        garden: 'quran',
        title: `سورة ${surah.name}`,
        paragraphs: [SURAH_STORIES[sid]],
        question: {
          prompt: 'ما اسم السورة اللي قصتها هذه؟',
          choices: [surah.name, distractor],
          answer: surah.name,
        },
      });
    }
  }
  return items;
}

function englishItems() {
  return ENGLISH_STORIES.map((e) => ({
    id: e.id,
    garden: 'english',
    title: e.title,
    lang: 'en',
    paragraphs: [e.text],
    audio: `stories/${e.id}`,
    question: {
      prompt: 'Which sound do you hear? · أي صوت تسمع؟',
      choices: e.choices,
      answer: e.sound,
    },
  }));
}

export const CATALOG = {
  arabic: arabicItems(),
  math: mathItems(),
  quran: quranItems(),
  english: englishItems(),
};

export function gardenItems(garden) {
  return CATALOG[garden] || [];
}

export function gardenMeta(id) {
  return GARDENS[id];
}
