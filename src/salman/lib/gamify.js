// منطق التلعيب لحديقة سلمان — دوال نقية (بدون React ولا تخزين) لتسهيل الاختبار.
// القواعد: كل إجابة صحيحة تعطي نجمة، والصحيحة من أول محاولة تعطي نجمتين.
// الخطأ لا يُنقص شيئًا ولا يُلغي تقدّمًا. الحدائق تنمو بالنجوم، والأوسمة تُفتح بالإنجازات.
// لا مؤقتات ولا لوحات متصدّرين. قواعد Leitner غير مُضافة بعد (بانتظار موافقة ولي الأمر).

import { GARDEN_ORDER } from '../data/gardens.js';
import { QURAN_LEVELS } from '../data/quran.js';

export const STORAGE_KEY = 'salman-garden-v1';

// مراحل نمو الحديقة حسب عدد النجوم
export const GROWTH = [
  { min: 0, emoji: '🌱', name: 'بذرة' },
  { min: 3, emoji: '🌿', name: 'نبتة' },
  { min: 8, emoji: '🌳', name: 'شجرة صغيرة' },
  { min: 15, emoji: '🌸', name: 'شجرة مزهرة' },
  { min: 25, emoji: '🌺', name: 'بستان' },
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
  { id: 'first-star', emoji: '⭐', title: 'أول نجمة', test: (s) => s.stars >= 1 },
  { id: 'ten-stars', emoji: '🌟', title: 'عشر نجوم', test: (s) => s.stars >= 10 },
  { id: 'streak-3', emoji: '🔥', title: 'ثلاثة أيام متتالية', test: (s) => s.streak.best >= 3 },
  { id: 'streak-7', emoji: '🏆', title: 'أسبوع كامل', test: (s) => s.streak.best >= 7 },
  { id: 'tree', emoji: '🌳', title: 'حديقة صارت شجرة', test: (s) => Object.values(s.gardens).some((v) => v >= 8) },
  {
    id: 'four-gardens',
    emoji: '🌲',
    title: 'الغابة الأربع',
    test: (s) => GARDEN_ORDER.every((g) => (s.gardens[g] || 0) >= 1),
  },
  { id: 'first-visit', emoji: '🎁', title: 'أول زيارة', test: (s) => s.visits >= 1 },
  { id: 'quran-level-1', emoji: '📗', title: 'المستوى الأول من القرآن', test: (s) => levelDone(s, 1) },
  { id: 'quran-level-2', emoji: '📘', title: 'المستوى الثاني من القرآن', test: (s) => levelDone(s, 2) },
  { id: 'quran-level-3', emoji: '📕', title: 'المستوى الثالث من القرآن', test: (s) => levelDone(s, 3) },
];

export function createState() {
  return {
    v: 1,
    stars: 0,
    gardens: { quran: 0, arabic: 0, math: 0, english: 0 },
    doneStories: {},
    learnedSurahs: {},
    streak: { current: 0, best: 0, last: null },
    visits: 0,
    gifts: [],
    badges: {},
  };
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
  return {
    ...base,
    stars: Number.isFinite(stars) && stars >= 0 ? stars : 0,
    gardens,
    doneStories: raw.doneStories && typeof raw.doneStories === 'object' ? raw.doneStories : {},
    learnedSurahs: raw.learnedSurahs && typeof raw.learnedSurahs === 'object' ? raw.learnedSurahs : {},
    streak: raw.streak && typeof raw.streak === 'object' ? { ...base.streak, ...raw.streak } : base.streak,
    visits: Number.isFinite(Number(raw.visits)) ? Number(raw.visits) : 0,
    gifts: Array.isArray(raw.gifts) ? raw.gifts : [],
    badges: raw.badges && typeof raw.badges === 'object' ? raw.badges : {},
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
