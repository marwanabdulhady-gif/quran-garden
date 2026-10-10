// منطق التلعيب لحديقة سلمان — دوال نقية (بدون React ولا تخزين) لتسهيل الاختبار.
// القواعد: كل إجابة صحيحة تعطي نجمة، والصحيحة من أول محاولة تعطي نجمتين.
// الخطأ لا يُنقص شيئًا ولا يُلغي تقدّمًا. الحدائق تنمو بالنجوم، والأوسمة تُفتح بالإنجازات.
// لا مؤقتات ولا لوحات متصدّرين. قواعد Leitner (leitner.js) معتمدة من المستخدم ومطبّقة على كل عنصر.

import { GARDEN_ORDER } from '../data/gardens.js';
import { QURAN_LEVELS } from '../data/quran.js';
import { DAILY_NEW_CAP, applyAnswer, legacyRecord, markSeen, newRecord, sanitizeRecord } from './leitner.js';

// مفتاح التخزين ثابت، ورقم المخطط داخل الحالة (v) يتغيّر مع الترحيل.
// v1: بلا Leitner. v2: skills (سجل Leitner لكل عنصر) و daily (عدّاد الجديد لكل حديقة في اليوم).
export const STORAGE_KEY = 'salman-garden-v1';
export const SCHEMA_VERSION = 2;

// مراحل نمو الحديقة حسب عدد النجوم
export const GROWTH = [
  { min: 0, emoji: '🌱', name: 'بذرة', art: 'salman/art/growth-1.png' },
  { min: 3, emoji: '🌿', name: 'نبتة', art: 'salman/art/growth-2.png' },
  { min: 8, emoji: '🌳', name: 'شجرة صغيرة', art: 'salman/art/growth-3.png' },
  { min: 15, emoji: '🌸', name: 'شجرة مزهرة', art: 'salman/art/growth-4.png' },
  { min: 25, emoji: '🌺', name: 'بستان', art: 'salman/art/growth-5.png' },
];

export function growthStage(stars) {
  let stage = GROWTH[0];
  let index = 0;
  GROWTH.forEach((g, i) => {
    if (stars >= g.min) {
      stage = g;
      index = i;
    }
  });
  const next = GROWTH[index + 1] || null;
  return { ...stage, index, next, toNext: next ? next.min - stars : 0 };
}

// مفتاح اليوم بتوقيت الرياض (YYYY-MM-DD)
export function dayKeyFrom(date = new Date()) {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Riyadh',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(date);
}

function keyToUTC(key) {
  const [y, m, d] = key.split('-').map(Number);
  return Date.UTC(y, m - 1, d);
}

export function diffDays(fromKey, toKey) {
  return Math.round((keyToUTC(toKey) - keyToUTC(fromKey)) / 86400000);
}

export function updateStreak(streak, dayKey) {
  const prev = streak || { current: 0, best: 0, last: null };
  if (prev.last === dayKey) return prev;
  const current = prev.last && diffDays(prev.last, dayKey) === 1 ? prev.current + 1 : 1;
  return { current, best: Math.max(prev.best, current), last: dayKey };
}

// الهدايا: تُمنح في نهاية كل زيارة يومية بالترتيب
export const GIFTS = [
  { id: 'gift-star', emoji: '⭐', name: 'نجمة ذهبية' },
  { id: 'gift-butterfly', emoji: '🦋', name: 'فراشة' },
  { id: 'gift-bird', emoji: '🐦', name: 'عصفور صغير' },
  { id: 'gift-flower', emoji: '🌷', name: 'زهرة' },
  { id: 'gift-rainbow', emoji: '🌈', name: 'قوس قزح' },
  { id: 'gift-owl', emoji: '🦉', name: 'بومة حكيمة' },
];

export function giftFor(visitNumber) {
  return GIFTS[(visitNumber - 1) % GIFTS.length];
}

export function levelDone(state, levelNumber) {
  const level = QURAN_LEVELS.find((l) => l.level === levelNumber);
  return !!level && level.surahs.every((id) => state.learnedSurahs[id]);
}

export function levelUnlocked(state, levelNumber) {
  if (levelNumber <= 1) return true;
  return levelDone(state, levelNumber - 1);
}

export const BADGES = [
  {
    id: 'first-star',
    art: 'salman/art/badges/first-star.png',
    emoji: '⭐',
    title: 'أول نجمة',
    test: (s) => s.stars >= 1,
  },
  {
    id: 'ten-stars',
    art: 'salman/art/badges/ten-stars.png',
    emoji: '🌟',
    title: 'عشر نجوم',
    test: (s) => s.stars >= 10,
  },
  {
    id: 'streak-3',
    art: 'salman/art/badges/streak-3.png',
    emoji: '🔥',
    title: 'ثلاثة أيام متتالية',
    test: (s) => s.streak.best >= 3,
  },
  {
    id: 'streak-7',
    art: 'salman/art/badges/streak-7.png',
    emoji: '🏆',
    title: 'أسبوع كامل',
    test: (s) => s.streak.best >= 7,
  },
  {
    id: 'tree',
    art: 'salman/art/badges/tree.png',
    emoji: '🌳',
    title: 'حديقة صارت شجرة',
    test: (s) => Object.values(s.gardens).some((v) => v >= 8),
  },
  {
    id: 'four-gardens',
    art: 'salman/art/badges/four-gardens.png',
    emoji: '🌲',
    title: 'الغابة الأربع',
    test: (s) => GARDEN_ORDER.every((g) => (s.gardens[g] || 0) >= 1),
  },
  {
    id: 'first-visit',
    art: 'salman/art/badges/first-visit.png',
    emoji: '🎁',
    title: 'أول زيارة',
    test: (s) => s.visits >= 1,
  },
  {
    id: 'quran-level-1',
    art: 'salman/art/badges/quran-level-1.png',
    emoji: '📗',
    title: 'المستوى الأول من القرآن',
    test: (s) => levelDone(s, 1),
  },
  {
    id: 'quran-level-2',
    art: 'salman/art/badges/quran-level-2.png',
    emoji: '📘',
    title: 'المستوى الثاني من القرآن',
    test: (s) => levelDone(s, 2),
  },
  {
    id: 'quran-level-3',
    art: 'salman/art/badges/quran-level-3.png',
    emoji: '📕',
    title: 'المستوى الثالث من القرآن',
    test: (s) => levelDone(s, 3),
  },
];

export function createState() {
  return {
    v: SCHEMA_VERSION,
    stars: 0,
    gardens: { quran: 0, arabic: 0, math: 0, english: 0 },
    doneStories: {},
    learnedSurahs: {},
    streak: { current: 0, best: 0, last: null },
    visits: 0,
    gifts: [],
    badges: {},
    skills: {},
    daily: { day: null, newByGarden: {} },
  };
}

// الترحيل من v1 إلى v2: كل قصة مكتملة سابقًا تصبح عنصرًا متعلَّمًا يحتاج مراجعة (box 1، مستحق الآن).
// النجوم والأوسمة والسلسلة لا تتغيّر. الإصلاح idempotent: القصة التي لها سجل تبقى كما هي.
function normalizeSkills(raw, doneStories) {
  const skills = {};
  if (raw && typeof raw === 'object') {
    for (const [id, rec] of Object.entries(raw)) {
      const clean = sanitizeRecord(rec);
      if (clean) skills[id] = clean;
    }
  }
  for (const id of Object.keys(doneStories)) {
    if (!skills[id]) skills[id] = legacyRecord();
  }
  return skills;
}

function normalizeDaily(raw) {
  const base = { day: null, newByGarden: {} };
  if (!raw || typeof raw !== 'object') return base;
  const day = typeof raw.day === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(raw.day) ? raw.day : null;
  const newByGarden = {};
  if (raw.newByGarden && typeof raw.newByGarden === 'object') {
    for (const [g, n] of Object.entries(raw.newByGarden)) {
      const k = Number(n);
      if (Number.isInteger(k) && k >= 0 && k <= 99) newByGarden[g] = k;
    }
  }
  return { day, newByGarden };
}

// عدد العناصر الجديدة المسموح بها اليوم في هذه الحديقة (حدّ 2)
export function newAllowed(state, garden, dayKey) {
  const used = state.daily.day === dayKey ? state.daily.newByGarden[garden] || 0 : 0;
  return Math.max(0, DAILY_NEW_CAP - used);
}

// يُسجَّل ظهور عنصر لأول مرة (يصبح «شُوهد») ويُحسب ضمن حدّ الجديد اليومي.
// إن كان للعنصر سجل بالفعل فلا يُحسب مرة ثانية.
export function exposeItem(state, { itemId, garden, dayKey }) {
  const rec = state.skills[itemId];
  if (rec) {
    return { ...state, skills: { ...state.skills, [itemId]: markSeen(rec, dayKey) } };
  }
  const daily = state.daily.day === dayKey ? state.daily : { day: dayKey, newByGarden: {} };
  const used = daily.newByGarden[garden] || 0;
  return {
    ...state,
    skills: { ...state.skills, [itemId]: newRecord(dayKey) },
    daily: { day: dayKey, newByGarden: { ...daily.newByGarden, [garden]: used + 1 } },
  };
}

// إجابة واحدة (أول محاولة فقط): صحيحة أو غلط، تُحدّث صندوق Leitner.
export function answerItem(state, { itemId, garden, correct, dayKey }) {
  const exposed = exposeItem(state, { itemId, garden, dayKey });
  const next = applyAnswer(exposed.skills[itemId], { correct, dayKey });
  return { ...exposed, skills: { ...exposed.skills, [itemId]: next } };
}

// يدمج الحالة المحفوظة مع القيم الافتراضية، فيتحمّل أي بيانات ناقصة أو تالفة.
export function normalizeState(raw) {
  const base = createState();
  if (!raw || typeof raw !== 'object') return base;
  const gardens = { ...base.gardens };
  if (raw.gardens && typeof raw.gardens === 'object') {
    for (const g of Object.keys(gardens)) {
      const n = Number(raw.gardens[g]);
      gardens[g] = Number.isFinite(n) && n >= 0 ? n : 0;
    }
  }
  const stars = Number(raw.stars);
  const doneStories = raw.doneStories && typeof raw.doneStories === 'object' ? raw.doneStories : {};
  return {
    ...base,
    stars: Number.isFinite(stars) && stars >= 0 ? stars : 0,
    gardens,
    doneStories,
    learnedSurahs: raw.learnedSurahs && typeof raw.learnedSurahs === 'object' ? raw.learnedSurahs : {},
    streak: raw.streak && typeof raw.streak === 'object' ? { ...base.streak, ...raw.streak } : base.streak,
    visits: Number.isFinite(Number(raw.visits)) ? Number(raw.visits) : 0,
    gifts: Array.isArray(raw.gifts) ? raw.gifts : [],
    badges: raw.badges && typeof raw.badges === 'object' ? raw.badges : {},
    skills: normalizeSkills(raw.skills, doneStories),
    daily: normalizeDaily(raw.daily),
  };
}

// يضيف الأوسمة الجديدة إلى الحالة ويعيد قائمة بما فُتح الآن
export function awardBadges(state) {
  const newly = [];
  const badges = { ...state.badges };
  for (const b of BADGES) {
    if (!badges[b.id] && b.test(state)) {
      badges[b.id] = true;
      newly.push(b.id);
    }
  }
  return { state: { ...state, badges }, newly };
}

function addStars(state, garden, amount) {
  return {
    ...state,
    stars: state.stars + amount,
    gardens: { ...state.gardens, [garden]: (state.gardens[garden] || 0) + amount },
  };
}

// تسجيل قصة أو تمرين مكتمل. إعادة نفس العنصر لا تعطي نجومًا جديدة.
export function recordStory(state, { storyId, garden, firstTry, dayKey }) {
  if (state.doneStories[storyId]) return { state, earned: 0, newBadges: [] };
  const earned = firstTry ? 2 : 1;
  let next = addStars(state, garden, earned);
  next = {
    ...next,
    doneStories: { ...state.doneStories, [storyId]: true },
    streak: updateStreak(state.streak, dayKey),
  };
  const awarded = awardBadges(next);
  return { state: awarded.state, earned, newBadges: awarded.newly };
}

// تعلّم سورة (الطفل أو ولي الأمر يضغط «حفظتها»). يعطي نجمتين ومرة واحدة فقط.
export function recordSurah(state, { surahId, dayKey }) {
  if (state.learnedSurahs[surahId]) return { state, earned: 0, newBadges: [] };
  let next = addStars(state, 'quran', 2);
  next = {
    ...next,
    learnedSurahs: { ...state.learnedSurahs, [surahId]: true },
    streak: updateStreak(state.streak, dayKey),
  };
  const awarded = awardBadges(next);
  return { state: awarded.state, earned: 2, newBadges: awarded.newly };
}

// نهاية الزيارة اليومية: هدية جديدة + شارة أول زيارة إن لزم
export function finishVisit(state) {
  const visits = state.visits + 1;
  const gift = giftFor(visits);
  const awarded = awardBadges({ ...state, visits, gifts: [...state.gifts, gift.id] });
  return { state: awarded.state, gift, newBadges: awarded.newly };
}
