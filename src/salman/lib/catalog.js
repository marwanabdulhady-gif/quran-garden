// كتالوج العناصر القابلة للعب: كل قصة = عنصر فيه نص وسؤال من خيارين.
// الترتيب داخل الزيارة اليومية: العربية ← الرياضيات ← القرآن ← الإنجليزية (اختيار الجلسة في session.js).

import { ARABIC_STORIES } from '../data/stories.generated.js';
import { GARDENS, MATH_STORIES, ENGLISH_STORIES } from '../data/gardens.js';
import { SURAHS, QURAN_LEVELS, SURAH_STORIES } from '../data/quran.js';
import { ANIMALS } from '../data/animals.js';

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

// الأرقام حتى 20 من الجدول، وما بعدها يُحوَّل رقمًا رقمًا (مثلًا 21 ← ٢١)
export function toArabicNumeral(n) {
  return ARABIC_NUMERALS[n] ?? String(n).replace(/\d/g, (d) => ARABIC_NUMERALS[Number(d)]);
}

const animalLabel = (letter) => `${ANIMALS[letter].emoji} ${ANIMALS[letter].word}`;

// الحرف ← الحيوان (مرحلة B): أي حيوان اسمه يبدأ بهذا الحرف؟ خياران فقط، والثاني حيوان لحرف بعيد
function letterItem(L, distractorLetter) {
  return {
    id: `ar-m-${String(L.num).padStart(2, '0')}`,
    garden: 'arabic',
    title: `الحرف ${L.letter}`,
    source: 'match',
    paragraphs: [`الحرف ${L.letter} يبدأ به اسم حيوان. ابحث عنه!`],
    question: {
      prompt: `أي حيوان اسمه يبدأ بحرف «${L.letter}»؟`,
      choices: [animalLabel(L.letter), animalLabel(distractorLetter)],
      answer: animalLabel(L.letter),
    },
  };
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
    items.push(letterItem(L, distractor));
  }
  return items;
}

function mathStoryItems() {
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

// الأرقام 1 إلى 20 (مرحلة C): عدّ الأشياء المعروضة ثم اختيار الرقم. خياران: الرقم الصحيح وجاره.
// المرحلة الأولى 1–10 والثانية 11–20 في الجدول نفسه.
const COUNT_OBJECTS = ['🍎', '⭐', '🌸', '🐟', '🥚'];
export function numberItems() {
  return Array.from({ length: 20 }, (_, i) => {
    const n = i + 1;
    const obj = COUNT_OBJECTS[i % COUNT_OBJECTS.length];
    const distractor = n >= 20 ? n - 1 : n + 1;
    return {
      id: `math-n-${String(n).padStart(2, '0')}`,
      garden: 'math',
      title: `العدّ حتى ${toArabicNumeral(n)}`,
      source: 'count',
      paragraphs: [`عُدّ معي: ${Array(n).fill(obj).join(' ')}`],
      question: {
        prompt: 'كم عددها؟',
        choices: [toArabicNumeral(n), toArabicNumeral(distractor)],
        answer: toArabicNumeral(n),
      },
    };
  });
}

function mathItems() {
  return [...mathStoryItems(), ...numberItems()];
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
