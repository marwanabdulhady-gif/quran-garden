// يبني قائمة موحَّدة بكل القصص القابلة للتحويل إلى فيديو من بيانات التطبيق نفسها.
//
// المصدر الوحيد للحقيقة هو src/salman/data (وليس نسخًا يدوية)، حتى يبقى الفيديو
// متزامنًا مع ما يراه الطفل في «حديقة سلمان» فور تحديث القصص.
//
// كل سجل يعيد:
//   id, garden, lang, dir, title, kicker, chips, paragraphs[], art, audio, question, artCredit
import { existsSync } from 'node:fs';
import { resolve } from 'node:path';

const ROOT = resolve(import.meta.dirname, '../..');

/** مسار عام بالنسبة لجذر المستودع + تحقق من الوجود. */
const pub = (...parts) => {
  const rel = parts.join('/');
  return { rel: `public/${rel}`, abs: resolve(ROOT, 'public', ...parts), exists: existsSync(resolve(ROOT, 'public', ...parts)) };
};

const audioDir = (...parts) => {
  const p = pub('salman/audio', ...parts);
  return p.exists ? p : null;
};

// ── تنظيف النص ────────────────────────────────────────────────────────────────
// نصوص قصص الصحابة مولَّدة من OCR وتحمل علامات تنسيق وهوامش لا تُنطق ولا تُعرض.

/** يحذف علامات التنسيق وهوامش المصادر من نص معروض/مقروء. */
export function cleanText(raw) {
  return String(raw ?? '')
    .replace(/\*\*/g, '') // تعليم عريض من المولِّد
    .replace(/[*_`]/g, '')
    .replace(/[⁽⁾]\s*[٠-٩0-9]+\s*[⁽⁾]/g, '') // ⁽¹⁾
    .replace(/[⁽⁾]/g, '')
    .replace(/\[\s*(النور|البقرة|آل عمران|الأحزاب|الحجرات|الفتح|الإسراء|الكهف|مريم|طه|الأنبياء|الحج|المؤمنون|النمل|القصص|العنكبوت|الروم|لقمان|السجدة|يس|الصافات|الزمر|غافر|فصلت|الشورى|الزخرف|الدخان|الجاثية|الأحقاف|محمد|الفتح|الحشر|الممتحنة|الصف|الجمعة|المنافقون|التغابن|الطلاق|التحريم|الملك|القلم|الحاقة|المعارج|نوح|الجن|المزمل|المدثر|القيامة|الإنسان|المرسلات|النبأ|النازعات|عبس|التكوير|الانفطار|المطففين|الانشقاق|البروج|الطارق|الأعلى|الغاشية|الفجر|البلد|الشمس|الليل|الضحى|الشرح|التين|العلق|القدر|البينة|الزلزلة|العاديات|القارعة|التكاثر|العصر|الهمزة|الفيل|قريش|الماعون|الكوثر|الكافرون|النصر|المسد|الإخلاص|الفلق|الناس)\s*:?\s*\d+\s*\]/g, '') // [النور: 27]
    .replace(/\s{2,}/g, ' ')
    .trim();
}

/**
 * يقسّم نصًا إلى بطاقات مقروءة.
 * يبدأ بالجمل، ثم يدمج القصيرة ويشقّ الطويلة على الفواصل، ليبقى السطر مريحًا للطفل.
 */
export function chunkText(text, { maxChars = 170, minChars = 55 } = {}) {
  const sentences = text
    .split(/(?<=[.!؟…])\s+|(?<=»)\s+(?=[A-Zء-ي«])/u)
    .map((s) => s.trim())
    .filter(Boolean);

  const chunks = [];
  let buf = '';
  for (const s of sentences) {
    if (s.length > maxChars) {
      if (buf) chunks.push(buf.trim()), (buf = '');
      // جملة أطول من البطاقة: نشقّها على الفواصل
      let part = '';
      for (const clause of s.split(/(?<=[،؛,;:])\s+/u)) {
        if ((part + ' ' + clause).trim().length > maxChars && part) {
          chunks.push(part.trim());
          part = clause;
        } else {
          part = (part ? part + ' ' : '') + clause;
        }
      }
      if (part.trim()) chunks.push(part.trim());
      continue;
    }
    if ((buf + ' ' + s).trim().length > maxChars && buf) {
      chunks.push(buf.trim());
      buf = s;
    } else {
      buf = (buf ? buf + ' ' : '') + s;
    }
  }
  if (buf.trim()) chunks.push(buf.trim());

  // ندمج آخر بطاقة إن كانت قصيرة جدًا لتفادي مشهد من كلمتين
  if (chunks.length > 1 && chunks.at(-1).length < minChars) {
    const tail = chunks.pop();
    chunks.push((chunks.pop() + ' ' + tail).trim());
  }
  return chunks.filter(Boolean);
}

// ── القصص العربية (حرف + كلمة) ────────────────────────────────────────────────

export async function arabicStories() {
  const { ARABIC_STORIES } = await import('../../src/salman/data/stories.generated.js');
  const out = [];
  for (const L of ARABIC_STORIES) {
    const num = String(L.num).padStart(2, '0');
    for (const st of L.stories) {
      const isCompanion = st.source === 'companions';
      const word = isCompanion && L.companionWord ? L.companionWord : L.word;
      const art = pub('salman/art/stories', `${st.id}.jpg`);
      // مقاطع الحروف مسجَّلة لبعض الحروف فقط (letter-NN)؛ نستخدمها شارةً صوتية إن وُجدت
      const letterAudio = audioDir('letters', `letter-${num}.mp3`);
      out.push({
        id: st.id,
        garden: 'arabic',
        lang: 'ar',
        dir: 'rtl',
        letter: L.letter,
        word,
        title: cleanText(st.title),
        kicker: isCompanion ? 'من قصص الصحابة' : 'من سيرة النبي ﷺ',
        chips: [`الحرف ${L.letter}`, word],
        paragraphs: st.paragraphs.map(cleanText).filter(Boolean),
        art: art.exists ? art : null,
        audio: null, // لا يوجد تسجيل سردي للقصص العربية بعد
        stingerAudio: letterAudio,
        question: { prompt: `أي حرف يبدأ به «${word}»؟`, answer: L.letter },
      });
    }
  }
  return out;
}

// ── القصص الإنجليزية (أصوات الحروف) ──────────────────────────────────────────

export async function englishStories() {
  const { ENGLISH_STORIES } = await import('../../src/salman/data/gardens.js');
  return ENGLISH_STORIES.map((e) => {
    const art = pub('salman/art/stories', `${e.id}.jpg`);
    const audio = audioDir('stories', `${e.id}.mp3`);
    return {
      id: e.id,
      garden: 'english',
      lang: 'en',
      dir: 'ltr',
      title: e.title,
      kicker: "Salman's Garden · English",
      chips: [`Sound ${e.sound}`],
      sound: e.sound,
      paragraphs: [cleanText(e.text)],
      art: art.exists ? art : null,
      audio,
      stingerAudio: null,
      question: { prompt: `Which sound do you hear? · أي صوت تسمع؟`, answer: e.sound, choices: e.choices },
    };
  });
}

// ── قصص الرياضيات (العدّ) ────────────────────────────────────────────────────

const AR_NUM = ['٠', '١', '٢', '٣', '٤', '٥', '٦', '٧', '٨', '٩', '١٠', '١١', '١٢', '١٣', '١٤', '١٥', '١٦', '١٧', '١٨', '١٩', '٢٠'];
export const toArabicNumeral = (n) => AR_NUM[n] ?? String(n).replace(/\d/g, (d) => AR_NUM[Number(d)]);

export async function mathStories() {
  const { MATH_STORIES } = await import('../../src/salman/data/gardens.js');
  return MATH_STORIES.map((m) => {
    const art = pub('salman/art/stories', `${m.id}.jpg`);
    const audio = audioDir('stories', `${m.id}.mp3`);
    return {
      id: m.id,
      garden: 'math',
      lang: 'ar',
      dir: 'rtl',
      title: m.title,
      kicker: 'حدائق النور · العدّ',
      chips: [`العدد ${toArabicNumeral(m.count)}`],
      count: m.count,
      paragraphs: [cleanText(m.text)],
      art: art.exists ? art : null,
      audio,
      stingerAudio: null,
      question: { prompt: 'كم العدد؟', answer: toArabicNumeral(m.count) },
    };
  });
}

// ── قصص السور ────────────────────────────────────────────────────────────────

export async function quranStories() {
  const { SURAHS, SURAH_STORIES, QURAN_LEVELS } = await import('../../src/salman/data/quran.js');
  const levelOf = {};
  for (const lv of QURAN_LEVELS) for (const sid of lv.surahs) levelOf[sid] = lv;
  return Object.keys(SURAHS)
    .sort((a, b) => Number(a) - Number(b))
    .map((sid) => {
      const s = SURAHS[sid];
      const art = pub('salman/art/stories', `q-${sid}.jpg`);
      const lv = levelOf[sid];
      return {
        id: `q-${sid}`,
        garden: 'quran',
        lang: 'ar',
        dir: 'rtl',
        title: `سورة ${s.name}`,
        kicker: 'حدائق النور · القرآن',
        chips: [`${toArabicNumeral(s.ayahs)} آيات`, lv ? `المستوى ${toArabicNumeral(lv.level)}` : null].filter(Boolean),
        paragraphs: [cleanText(SURAH_STORIES[sid])].filter(Boolean),
        art: art.exists ? art : null,
        audio: audioDir('stories', `q-${sid}.mp3`), // غير مسجَّلة حاليًا؛ تُلتقط تلقائيًا إن أُضيفت
        stingerAudio: null,
        surah: s,
        question: { prompt: 'ما اسم السورة اللي قصتها هذه؟', answer: s.name },
      };
    });
}

// ── الكل معًا ────────────────────────────────────────────────────────────────

export const GARDENS = [
  { key: 'arabic', label: 'الحروف العربية', load: arabicStories },
  { key: 'english', label: 'English Sounds', load: englishStories },
  { key: 'math', label: 'العدّ والرياضيات', load: mathStories },
  { key: 'quran', label: 'قصص السور', load: quranStories },
];

/**
 * يعيد كل القصص، أو مجموعة مُصفّاة.
 * @param {string[]} only مفاتيح الحدائق المطلوبة (فارغة = الكل)
 */
export async function collectStories({ only = [] } = {}) {
  const gardens = only.length ? GARDENS.filter((g) => only.includes(g.key)) : GARDENS;
  const all = [];
  for (const g of gardens) {
    const items = await g.load();
    for (const s of items) all.push({ ...s, gardenLabel: g.label });
  }
  return all;
}
