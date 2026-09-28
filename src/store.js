import { useSyncExternalStore } from 'react';
import { BADGES, DECOR, LEVELS, RECIERS, WORDS, WORDS_R2 } from './data.js';

/**
 * شكل بيانات الطفل (النسخة المرقّمة SCHEMA_VERSION).
 * كل ترقية للمخطط لازم توثّقها هنا + تضيف ترحيلة في السلسلة.
 *
 * @typedef {Object} Child
 * @property {string} id
 * @property {string} name
 * @property {string|null} avatar         صورة واقف (dataURL)
 * @property {string|null} avatarReading  صورة جالس بالمصحف (dataURL)
 * @property {string} reciter             من RECIERS
 * @property {boolean} sound
 * @property {boolean} bridgeSfx
 * @property {number} stars
 * @property {{id: string, at: number}[]} badges
 * @property {{pending: number, decor: string[]}} gifts
 * @property {{level: string, words: Record<string, {done: boolean, discovered: boolean, reviewed: number}>, tripsDone: number[]}} bridge
 * @property {Record<number, {heard: number, completed: boolean}>} listening
 * @property {{repeat: 1|2|4, speed: 0.75|1|1.25}} playback
 * @property {{size: 's'|'m'|'l', plain: boolean}} reading
 * @property {{lastAyah: string|null, lastWater: string|null, waterStreak: number, lastTafakkur: string|null, lastActive: string|null, streak: number}} daily
 * @property {{seconds: number, weeks: Record<string, number>, surahs: Record<number, {seconds: number, ayahs: number}>, days: Record<string, number>}} stats
 * @property {{pin: string|null, enabled: boolean, dailyCapMin: number, quietFrom: string|null, quietUntil: string|null}} parent
 * @property {number} createdAt
 */

/**
 * @typedef {Object} FamilyState
 * @property {string} familyKey
 * @property {number} version   = SCHEMA_VERSION
 * @property {Child[]} children
 * @property {string} activeChildId
 * @property {number} updatedAt
 */

const KEY = 'quran-garden-family-v1';

const dayStr = (d) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
const todayStr = () => dayStr(new Date());
const yesterdayStr = () => {
  const d = new Date();
  d.setDate(d.getDate() - 1);
  return dayStr(d);
};

// دالة نقية (سهلة الاختبار): تحديث سلسلة النشاط لأي تاريخ محدّد.
// نشاط في نفس اليوم ما يزيد العدّاد؛ يوم متصل يزيد بواحد؛ فجوة يرجّع لـ 1.
export function touchDaily(daily, t = todayStr(), y = yesterdayStr()) {
  const d = daily || {};
  if (d.lastActive === t) return { ...d, lastActive: t, streak: d.streak || 1 };
  return { ...d, lastActive: t, streak: d.lastActive === y ? (d.streak || 0) + 1 : 1 };
}

// سلسلة النشاط الظاهرة: تُعرض ما دام آخر نشاط اليوم أو بالأمس (قبل انقطاعها)
export function streakOf(child) {
  const d = child?.daily || {};
  if (!d.streak) return 0;
  return d.lastActive === todayStr() || d.lastActive === yesterdayStr() ? d.streak : 0;
}

const genKey = () => Math.random().toString(36).slice(2, 10) + Date.now().toString(36);

/** يولّد طفلًا افتراضيًا كامل الحقول.
 * @returns {Child} */
export function defaultChild(name = 'سلمان', id = null) {
  return {
    id: id || 'c' + Math.random().toString(36).slice(2, 9),
    name,
    avatar: null, // صورة واقف (dataURL)
    avatarReading: null, // صورة جالس بالمصحف
    reciter: 'ar.husary', // الافتراضي: الحصري — تلاوة هادئة واضحة مناسبة للصغار (بطلب الوالدين)
    sound: true,
    bridgeSfx: true,
    stars: 0,
    badges: [], // [{ id, at }]
    gifts: { pending: 0, decor: [] },
    bridge: { level: 'easy', words: {}, tripsDone: [] },
    listening: {},
    playback: { repeat: 1, speed: 1 }, // تكرار الآية وسرعة التلاوة (محفوظ لكل طفل)
    reading: { size: 'm', plain: false }, // حجم نص الآية (s/m/l) وخط واضح بلا تشكيل
    daily: { lastAyah: null, lastWater: null, waterStreak: 0, lastTafakkur: null, lastActive: null, streak: 0 },
    stats: emptyStats(), // إحصائيات الاستماع (ثوانٍ + أسبوعي + يومي + لكل سورة)
    parent: { pin: null, enabled: false, dailyCapMin: 0, quietFrom: null, quietUntil: null }, // وضع الوالدين (P5-35)
    createdAt: Date.now(),
  };
}

// ---------- إحصائيات الاستماع (P5-32) و وضع الوالدين (P5-35) ----------
const emptyStats = () => ({ seconds: 0, weeks: {}, surahs: {}, days: {} });

/** مفتاح الأسبوع ISO على شكل 'YYYY-Www' (مثال 2026-W39) — ثابت طول الأسبوع. */
export function weekKey(d = new Date()) {
  const d1 = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
  const day = d1.getUTCDay() || 7;
  d1.setUTCDate(d1.getUTCDate() + 4 - day);
  const yearStart = new Date(Date.UTC(d1.getUTCFullYear(), 0, 1));
  const week = Math.ceil(((d1 - yearStart) / 86400000 + 1) / 7);
  const yy = d1.getUTCFullYear();
  return `${yy}-W${String(week).padStart(2, '0')}`;
}

/** مفتاح اليوم 'YYYY-MM-DD' — نفس شكل dayStr الداخلي. */
export function dayKey(d = new Date()) {
  return dayStr(d);
}

/** يطهّر كائن الإحصائيات: أرقام موجبة فقط، مفاتيح معقولة، حدود حجم. */
function safeStats(raw) {
  const s = emptyStats();
  if (!raw || typeof raw !== 'object') return s;
  s.seconds = num(raw.seconds, 0, 999999999);
  if (raw.weeks && typeof raw.weeks === 'object') {
    s.weeks = Object.fromEntries(
      Object.entries(raw.weeks)
        .filter(([k, v]) => typeof k === 'string' && k.length <= 12 && typeof v === 'number' && v >= 0)
        .slice(0, 260)
        .map(([k, v]) => [k, num(v, 0, 999999999)])
    );
  }
  if (raw.surahs && typeof raw.surahs === 'object') {
    s.surahs = Object.fromEntries(
      Object.entries(raw.surahs)
        .filter(([k, v]) => Number.isInteger(+k) && +k >= 1 && +k <= 114 && v && typeof v === 'object')
        .slice(0, 114)
        .map(([k, v]) => [k, { seconds: num(v.seconds, 0, 999999999), ayahs: num(v.ayahs, 0, 99999) }])
    );
  }
  if (raw.days && typeof raw.days === 'object') {
    s.days = Object.fromEntries(
      Object.entries(raw.days)
        .filter(([k, v]) => typeof k === 'string' && k.length <= 12 && typeof v === 'number' && v >= 0)
        .sort(([a], [b]) => (a < b ? -1 : 1))
        .slice(-90)
        .map(([k, v]) => [k, num(v, 0, 999999999)])
    );
  }
  return s;
}

const CAPS = [0, 15, 30, 45, 60, 90, 120];
const TIME_RE = /^([01]\d|2[0-3]):[0-5]\d$/;

/** يطهّر كائن وضع الوالدين. */
function safeParent(raw) {
  const d = defaultChild().parent;
  if (!raw || typeof raw !== 'object') return { ...d };
  const pin = str(raw.pin, 4);
  return {
    pin: /^\d{4}$/.test(pin) ? pin : null,
    enabled: raw.enabled === true && /^\d{4}$/.test(pin),
    dailyCapMin: CAPS.includes(num(raw.dailyCapMin, -1)) ? num(raw.dailyCapMin, 0) : 0,
    quietFrom: TIME_RE.test(str(raw.quietFrom, 5)) ? str(raw.quietFrom, 5) : null,
    quietUntil: TIME_RE.test(str(raw.quietUntil, 5)) ? str(raw.quietUntil, 5) : null,
  };
}

const WORD_IDS = new Set([...WORDS, ...WORDS_R2].map((w) => w.id)); // كل كلمات الجولتين (P5-31)
const BADGE_IDS = new Set(Object.keys(BADGES));
const DECOR_IDS = new Set(DECOR.map((d) => d.id));
const RECIER_IDS = new Set(RECIERS.map((r) => r.id));
const LEVEL_IDS = new Set(LEVELS.map((l) => l.id));

// تحويل صيغة الأوسمة القديمة (سلسلة) إلى الجديدة ({ id, at })
function normalizeBadges(badges, createdAt) {
  if (!Array.isArray(badges)) return [];
  const seen = new Set();
  const out = [];
  for (const b of badges) {
    const id = typeof b === 'string' ? b : b && typeof b === 'object' ? b.id : null;
    if (typeof id !== 'string' || !BADGE_IDS.has(id) || seen.has(id)) continue;
    seen.add(id);
    const at = b && typeof b === 'object' ? (safeNum(b.at) ?? (createdAt || Date.now())) : createdAt || Date.now();
    out.push({ id, at });
  }
  return out.slice(0, 40);
}

/* ---------- ترحيل مخطط الحالة (سلسلة نُسَخ) ----------
   كل ترقية للمخطط تضيف دالة migrateV<old>ToV<new> + رقم في SCHEMA_VERSION.
   البيانات القديمة (بدون version) تُعتبر v1. */
export const SCHEMA_VERSION = 3;

// v1 → v2: الاسم الافتراضي القديم «عمر» بقى «سلمان» + أوسمة النصية → { id, at }
const migrateV1ToV2 = (s) => ({
  ...s,
  version: 2,
  children: (Array.isArray(s.children) ? s.children : []).map((c) =>
    c && typeof c === 'object'
      ? {
          ...c,
          name: c.name === 'عمر' ? 'سلمان' : c.name,
          badges: normalizeBadges(c.badges, safeNum(c.createdAt) ?? Date.now()),
        }
      : c
  ),
});

// v2 → v3: إحصائيات الاستماع + وضع الوالدين
const migrateV2ToV3 = (s) => ({
  ...s,
  version: 3,
  children: (Array.isArray(s.children) ? s.children : []).map((c) =>
    c && typeof c === 'object' ? { ...c, stats: safeStats(c.stats), parent: safeParent(c.parent) } : c
  ),
});

const MIGRATIONS = { 1: migrateV1ToV2, 2: migrateV2ToV3 };

/** تُرجع نفس الكيان بعد تطبيق سلسلة الترحيلات حتى SCHEMA_VERSION. لا ترمي على مدخل تالف.
    نُسخت مجهولة أعلى من الحالية تمر كما هي (ما ننزلّهاش — ممكن فيها حقول فهمناهاش). */
export function migrateState(raw) {
  let s = raw;
  if (!s || typeof s !== 'object') return s;
  if (!Array.isArray(s.children) || !s.children.length) return s;
  const v = Number.isInteger(s.version) && s.version > 0 ? s.version : 1;
  if (v >= SCHEMA_VERSION) return s;
  let guard = 0;
  let cur = v;
  while (cur < SCHEMA_VERSION && guard < 10) {
    const fn = MIGRATIONS[cur];
    if (!fn) break; // فجوة في السلسلة — نوقف بدل ما نخرب
    s = fn(s);
    cur += 1;
    guard += 1;
  }
  return { ...s, version: SCHEMA_VERSION };
}

// تحميل الحالة مع ترحيل خفي للبيانات القديمة (سلسلة الترحيلات + حقول جديدة)
function load() {
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) {
      const s = migrateState(JSON.parse(raw));
      if (s && Array.isArray(s.children) && s.children.length) {
        const kids = s.children.slice(0, 8).map((c) => {
          const savedName = typeof c?.name === 'string' ? c.name : null;
          const d = defaultChild(savedName || 'سلمان', typeof c?.id === 'string' ? c.id : null);
          return {
            ...d,
            ...c,
            name: d.name, // الاسم المفصّل (مع الترحيل) له الأولوية على البيانات القديمة
            badges: normalizeBadges(c?.badges, safeNum(c?.createdAt) ?? d.createdAt),
            playback: { ...d.playback, ...(c?.playback && typeof c.playback === 'object' ? c.playback : {}) },
            reading: { ...d.reading, ...(c?.reading && typeof c.reading === 'object' ? c.reading : {}) },
            daily: { ...d.daily, ...(c?.daily && typeof c.daily === 'object' ? c.daily : {}) },
            gifts: { ...d.gifts, ...(c?.gifts && typeof c.gifts === 'object' ? c.gifts : {}) },
            bridge: { ...d.bridge, ...(c?.bridge && typeof c.bridge === 'object' ? c.bridge : {}) },
            listening: c?.listening && typeof c.listening === 'object' ? c.listening : {},
          };
        });
        return {
          familyKey: typeof s.familyKey === 'string' ? s.familyKey : genKey(),
          version: SCHEMA_VERSION,
          children: kids,
          activeChildId: kids.some((k) => k.id === s.activeChildId) ? s.activeChildId : kids[0].id,
          updatedAt: Number.isFinite(Number(s.updatedAt)) ? Number(s.updatedAt) : Date.now(),
        };
      }
    }
  } catch (e) {
    // بيانات تالفة — نبني حديقة جديدة
  }
  const c = defaultChild();
  return {
    familyKey: genKey(),
    version: SCHEMA_VERSION,
    children: [c],
    activeChildId: c.id,
    updatedAt: Date.now(),
  };
}

let state = load();
const subs = new Set();

// خطأ مساحة التخزين — يُعلَن للواجهة بدل بلع الخطأ بصمت
let storageError = false;
const errSubs = new Set();

export function useStorageError() {
  return useSyncExternalStore(
    (f) => (errSubs.add(f), () => errSubs.delete(f)),
    () => storageError,
    () => storageError
  );
}

export const getStorageError = () => storageError;

export const getState = () => state;

export function setState(updater) {
  const next = typeof updater === 'function' ? updater(state) : updater;
  next.updatedAt = Date.now();
  state = next;
  try {
    localStorage.setItem(KEY, JSON.stringify(state));
    if (storageError) {
      storageError = false;
      errSubs.forEach((f) => f());
    }
  } catch (e) {
    // مساحة التخزين ممتلئة (صور كثيرة) — نبلّغ الواجهة
    if (!storageError) {
      storageError = true;
      errSubs.forEach((f) => f());
    }
  }
  subs.forEach((f) => f());
}

export function subscribe(f) {
  subs.add(f);
  return () => subs.delete(f);
}

export function useGarden() {
  return useSyncExternalStore(subscribe, getState, getState);
}

export function activeChild(s = state) {
  return s.children.find((c) => c.id === s.activeChildId) || s.children[0];
}

export function updateChild(id, patch) {
  setState((s) => ({
    ...s,
    children: s.children.map((c) => (c.id === id ? (typeof patch === 'function' ? patch(c) : { ...c, ...patch }) : c)),
  }));
}

/** يضيف وقت استماع (ثوانٍ) على الطفل: إجمالي + أسبوعي + يومي + لكل سورة. */
export function addListening(childId, o) {
  const secs = num(o?.seconds, 0, 3600);
  if (secs <= 0) return;
  const surahNum = Number.isInteger(o?.surahNum) && o.surahNum >= 1 && o.surahNum <= 114 ? o.surahNum : 114;
  const ayahs = num(o?.ayahs, 0, 300) || 1;
  const wk = weekKey();
  const dk = dayKey();
  updateChild(childId, (c) => {
    const st = c.stats && typeof c.stats === 'object' ? c.stats : emptyStats();
    const days = { ...(st.days || {}), [dk]: (st.days?.[dk] || 0) + secs };
    const dayKeys = Object.keys(days);
    if (dayKeys.length > 90) {
      dayKeys.sort();
      for (const k of dayKeys.slice(0, dayKeys.length - 90)) delete days[k];
    }
    const prevSur = st.surahs?.[surahNum] || { seconds: 0, ayahs: 0 };
    return {
      ...c,
      stats: {
        seconds: (st.seconds || 0) + secs,
        weeks: { ...(st.weeks || {}), [wk]: (st.weeks?.[wk] || 0) + secs },
        surahs: {
          ...(st.surahs || {}),
          [surahNum]: { seconds: (prevSur.seconds || 0) + secs, ayahs: (prevSur.ayahs || 0) + ayahs },
        },
        days,
      },
    };
  });
}

/** هل وضع الوالدين بيمنع الاستماع دلوقتي؟ @returns {{quiet:boolean, over:boolean, capMin:number}} */
export function parentBlock(child, d = new Date()) {
  const res = { quiet: false, over: false, capMin: child?.parent?.dailyCapMin || 0 };
  const p = child?.parent;
  if (!p || !p.enabled) return res;
  if (p.quietFrom && p.quietUntil) {
    const [fh, fm] = p.quietFrom.split(':').map(Number);
    const [th, tm] = p.quietUntil.split(':').map(Number);
    const cur = d.getHours() * 60 + d.getMinutes();
    const from = fh * 60 + fm;
    const to = th * 60 + tm;
    res.quiet = from <= to ? cur >= from && cur < to : cur >= from || cur < to;
  }
  if (res.capMin > 0) {
    const todaySecs = child.stats?.days?.[dayKey(d)] || 0;
    res.over = todaySecs >= res.capMin * 60;
  }
  return res;
}

export function setChild(id) {
  setState((s) => ({ ...s, activeChildId: id }));
}

export function addChild(name, avatars = {}) {
  const c = defaultChild(name, 'c' + Math.random().toString(36).slice(2, 9));
  c.avatar = avatars.standing || avatars.avatar || null;
  c.avatarReading = avatars.reading || avatars.avatarReading || null;
  setState((s) => ({
    ...s,
    children: [...s.children, c],
    activeChildId: c.id,
  }));
  return c;
}

export function removeChild(id) {
  setState((s) => {
    const children = s.children.filter((c) => c.id !== id);
    const next = children.length ? children : [defaultChild()];
    return {
      ...s,
      children: next,
      activeChildId: s.activeChildId === id ? next[0].id : s.activeChildId,
    };
  });
}

// ---- النجوم والأوسمة والهدايا (كلها تلمس سلسلة النشاط) ----
export function awardStars(id, n) {
  setState((s) => ({
    ...s,
    children: s.children.map((c) => (c.id === id ? { ...c, stars: c.stars + n, daily: touchDaily(c.daily) } : c)),
  }));
}

export function awardBadge(id, badgeKey) {
  if (!BADGE_IDS.has(badgeKey)) return;
  setState((s) => ({
    ...s,
    children: s.children.map((c) =>
      c.id === id && !c.badges.some((b) => b.id === badgeKey)
        ? { ...c, badges: [...c.badges, { id: badgeKey, at: Date.now() }] }
        : c
    ),
  }));
}

export function addGift(id) {
  updateChild(id, (c) => ({ ...c, gifts: { ...c.gifts, pending: c.gifts.pending + 1 } }));
}

// ---- كلمات جسر المعاني ----
export function wordState(child, wordId) {
  return child.bridge.words[wordId] || { done: false, discovered: false, reviewed: 0 };
}

export function markWord(childId, wordId, patch) {
  setState((s) => ({
    ...s,
    children: s.children.map((c) => {
      if (c.id !== childId) return c;
      const words = { ...c.bridge.words, [wordId]: { ...wordState(c, wordId), ...patch } };
      return { ...c, bridge: { ...c.bridge, words }, daily: patch && patch.done ? touchDaily(c.daily) : c.daily };
    }),
  }));
}

export function discoveredCount(child) {
  return Object.values(child.bridge.words || {}).filter((w) => w.done).length;
}

// ---- روابط الحديقة العائلية (مزامنة بدون خادم) ----
function b64encode(str) {
  return btoa(unescape(encodeURIComponent(str)))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');
}
function b64decode(str) {
  const s = str.replace(/-/g, '+').replace(/_/g, '/');
  return decodeURIComponent(escape(atob(s)));
}

export function gardenLink() {
  // الرابط يحمل التقدم فقط — الصور كبيرة ولا تُرسل (تبقى على كل جهاز)
  const slim = {
    ...state,
    children: state.children.map(({ avatar: _avatar, avatarReading: _avatarReading, ...rest }) => rest),
  };
  return location.origin + location.pathname + '#garden=' + b64encode(JSON.stringify(slim));
}

export function parseGardenLink(url) {
  try {
    const m = url.match(/#garden=([A-Za-z0-9_\-]+)/);
    if (!m) return null;
    const data = JSON.parse(b64decode(m[1]));
    if (data && Array.isArray(data.children) && data.children.length) return data;
  } catch (e) {
    /* رابط غير صالح */
  }
  return null;
}

// ---- تطهير البيانات القادمة من روابط/ملفات غير موثوقة ----
// Number() يرمي على كائنات بتقنية prototype pollution — فالنوع لازم يتفحص الأول
function safeNum(v) {
  if (typeof v !== 'number' && typeof v !== 'string') return null;
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
}
function num(v, min = 0, max = 1e9) {
  const n = safeNum(v);
  if (n === null) return min;
  return Math.max(min, Math.min(max, Math.floor(n)));
}
function str(v, max = 20) {
  return typeof v === 'string' ? v.slice(0, max) : null;
}
function dataUrl(v, cap = 1_500_000) {
  return typeof v === 'string' && v.startsWith('data:image/') ? v.slice(0, cap) : null;
}

/** يطهّر طفلًا وافدًا (من رابط/مل) إلى شكل آمن كامل الحقول.
 * @param {*} raw أي مدخل — ما يرميش
 * @returns {Child} */
export function sanitizeChild(raw) {
  const d = defaultChild();
  const c = { ...d };
  if (!raw || typeof raw !== 'object') return c;
  c.name = str(raw.name, 20) || d.name;
  c.id = str(raw.id, 24) || d.id;
  c.avatar = dataUrl(raw.avatar);
  c.avatarReading = dataUrl(raw.avatarReading);
  c.reciter = RECIER_IDS.has(raw.reciter) ? raw.reciter : d.reciter;
  c.sound = raw.sound !== false;
  c.bridgeSfx = raw.bridgeSfx !== false;
  c.stars = num(raw.stars, 0, 999999);
  c.badges = normalizeBadges(raw.badges, safeNum(raw.createdAt) ?? Date.now());
  c.gifts = {
    pending: num(raw?.gifts?.pending, 0, 99),
    decor: Array.isArray(raw?.gifts?.decor) ? [...new Set(raw.gifts.decor.filter((x) => DECOR_IDS.has(x)))] : [],
  };
  const bw = raw?.bridge?.words;
  c.bridge = {
    level: LEVEL_IDS.has(raw?.bridge?.level) ? raw.bridge.level : d.bridge.level,
    words:
      bw && typeof bw === 'object'
        ? Object.fromEntries(
            Object.entries(bw)
              .filter(([k, v]) => WORD_IDS.has(k) && v && typeof v === 'object')
              .slice(0, 60)
              .map(([k, v]) => [
                k,
                { done: !!v.done, discovered: !!v.discovered, reviewed: num(v.reviewed, 0, 100000) },
              ])
          )
        : {},
    tripsDone: Array.isArray(raw?.bridge?.tripsDone)
      ? raw.bridge.tripsDone.filter((t) => [1, 2, 3, 4, 5, 6].includes(t)).slice(0, 6)
      : [],
  };
  c.stats = safeStats(raw?.stats);
  c.parent = safeParent(raw?.parent);
  const ls = raw?.listening;
  c.listening =
    ls && typeof ls === 'object'
      ? Object.fromEntries(
          Object.entries(ls)
            .filter(([k, v]) => Number.isInteger(+k) && +k >= 1 && +k <= 114 && v && typeof v === 'object')
            .slice(0, 114)
            .map(([k, v]) => [k, { heard: num(v.heard, 0, 300), completed: !!v.completed }])
        )
      : {};
  const pb = raw?.playback;
  c.playback = {
    repeat: [1, 2, 4].includes(Number(pb?.repeat)) ? Number(pb.repeat) : 1,
    speed: [0.75, 1, 1.25].includes(Number(pb?.speed)) ? Number(pb.speed) : 1,
  };
  const rd = raw?.reading;
  c.reading = {
    size: ['s', 'm', 'l'].includes(rd?.size) ? rd.size : 'm',
    plain: rd?.plain === true,
  };
  c.daily = {
    lastAyah: str(raw?.daily?.lastAyah, 12),
    lastWater: str(raw?.daily?.lastWater, 12),
    waterStreak: num(raw?.daily?.waterStreak, 0, 10000),
    lastTafakkur: str(raw?.daily?.lastTafakkur, 12),
    lastActive: str(raw?.daily?.lastActive, 12),
    streak: num(raw?.daily?.streak, 0, 100000),
  };
  c.createdAt = safeNum(raw.createdAt) ?? Date.now();
  return c;
}

/** يطهّر عائلة وافدة. @param {*} raw @returns {FamilyState|null} */
export function sanitizeFamily(raw) {
  // نرحّل أولًا (روابط قديمة من نُسخت أقدم) ثم نطهّر
  let data = raw;
  try {
    data = migrateState(raw);
  } catch (e) {
    /* مدخل مش طبيعي — نكمل بالبيانات الأصلية */
  }
  if (!data || typeof data !== 'object' || !Array.isArray(data.children) || data.children.length === 0) return null;
  const children = data.children.slice(0, 8).map((c) => sanitizeChild(c));
  const activeChildId = children.some((c) => c.id === data.activeChildId) ? data.activeChildId : children[0].id;
  return {
    familyKey: str(data.familyKey, 40) || genKey(),
    version: SCHEMA_VERSION,
    children,
    activeChildId,
    updatedAt: Date.now(),
  };
}

// ---- دمج تقدم جهازين: "دمج" حتمي دون استبدال تلقائي ----
// هل عند الطفل تقدم يستاهل الحماية؟
export function hasProgress(c) {
  if (!c) return false;
  return (
    (c.stars || 0) > 0 ||
    (c.badges?.length || 0) > 0 ||
    (c.gifts?.pending || 0) > 0 ||
    discoveredCount(c) > 0 ||
    Object.values(c.listening || {}).some((l) => (l?.heard || 0) > 0 || l?.completed)
  );
}

// دمج طفلين (جهاز + رابط): النجوم الأكبر، الأوسمة كلها، الكلمات كلها،
// أعلى تقدم سماع لكل سورة، الزينة كلها. هوية الطفل (الاسم/الصور/القارئ) تبقى من هذا الجهاز.
export function mergeChild(local, inc) {
  const L = sanitizeChild(local);
  const I = sanitizeChild(inc);
  const badges = [...L.badges];
  const ids = new Set(badges.map((b) => b.id));
  for (const b of I.badges) {
    if (!ids.has(b.id)) {
      badges.push(b);
      ids.add(b.id);
    }
  }
  badges.sort((a, b) => (a.id < b.id ? -1 : a.id > b.id ? 1 : 0));
  const listening = {};
  for (const k of new Set([...Object.keys(L.listening), ...Object.keys(I.listening)])) {
    const a = L.listening[k] || { heard: 0, completed: false };
    const b = I.listening[k] || { heard: 0, completed: false };
    listening[k] = { heard: Math.max(a.heard || 0, b.heard || 0), completed: !!(a.completed || b.completed) };
  }
  const words = {};
  for (const k of new Set([...Object.keys(L.bridge.words), ...Object.keys(I.bridge.words)])) {
    const a = L.bridge.words[k] || { done: false, discovered: false, reviewed: 0 };
    const b = I.bridge.words[k] || a;
    words[k] = {
      done: !!(a.done || b.done),
      discovered: !!(a.discovered || b.discovered),
      reviewed: Math.max(a.reviewed || 0, b.reviewed || 0),
    };
  }
  const da = L.daily || {};
  const db = I.daily || {};
  const laterStreak =
    (db.streak || 0) > (da.streak || 0)
      ? db
      : (da.streak || 0) > (db.streak || 0)
        ? da
        : (da.lastActive || '') >= (db.lastActive || '')
          ? da
          : db;
  const maxStr = (a, b) => (a && b ? (a >= b ? a : b) : a || b);
  const daily = {
    lastAyah: maxStr(da.lastAyah, db.lastAyah),
    lastWater: maxStr(da.lastWater, db.lastWater),
    waterStreak: Math.max(da.waterStreak || 0, db.waterStreak || 0),
    lastTafakkur: maxStr(da.lastTafakkur, db.lastTafakkur),
    lastActive: laterStreak.lastActive || null,
    streak: laterStreak.streak || 0,
  };
  return {
    ...L,
    stars: Math.max(L.stars, I.stars),
    badges,
    gifts: {
      pending: Math.max(L.gifts.pending, I.gifts.pending),
      decor: [...new Set([...L.gifts.decor, ...I.gifts.decor])],
    },
    bridge: {
      level: L.bridge.level,
      words,
      tripsDone: [...new Set([...L.bridge.tripsDone, ...I.bridge.tripsDone])],
    },
    listening,
    daily,
    createdAt: Math.min(L.createdAt || Date.now(), I.createdAt || Date.now()),
  };
}

// مطابقة أطفال الجهاز مع أطفال الرابط: بالـ id أولًا ثم بالاسم
export function pairChildren(localChildren, incChildren) {
  const used = new Set();
  const pairs = localChildren.map((lc) => {
    const inc =
      incChildren.find((c) => c.id === lc.id && !used.has(c.id)) ||
      incChildren.find((c) => c.name === lc.name && !used.has(c.id)) ||
      null;
    if (inc) used.add(inc.id);
    return { local: lc, inc, conflict: !!(inc && hasProgress(lc) && hasProgress(inc)) };
  });
  const extra = incChildren.filter((ic) => !pairs.some((p) => p.inc?.id === ic.id));
  return { pairs, extra };
}

// تطبيق الاسترجاع بحسمات المستخدم. الحسمات: 'local' | 'link' | 'merge' لكل طفل في الجهاز.
// غير المتعارض يُحسم تلقائيًا (ما عنده تقدم هنا → من الرابط، وإلا يبقى هنا).
export function applyRestore(local, incoming, decisions = {}) {
  const { pairs, extra } = pairChildren(local.children, incoming.children);
  const out = [];
  for (const { local: lc, inc } of pairs) {
    const defaultDec = inc && !hasProgress(lc) ? 'link' : 'local';
    const dec = decisions[lc.id] || defaultDec;
    if (inc && dec === 'link') out.push(inc);
    else if (inc && dec === 'merge') out.push(mergeChild(lc, inc));
    else out.push(lc);
  }
  for (const ic of extra) out.push(ic);
  const children = out.slice(0, 8);
  const activeChildId = children.some((c) => c.id === local.activeChildId)
    ? local.activeChildId
    : children.some((c) => c.id === incoming.activeChildId)
      ? incoming.activeChildId
      : children[0].id;
  return {
    familyKey: local.familyKey || genKey(),
    version: SCHEMA_VERSION,
    children,
    activeChildId,
    updatedAt: Date.now(),
  };
}

// استرجاع بحسمات (لا شيء يُستبدل تلقائيًا)
export function restoreWithDecisions(data, decisions) {
  const clean = sanitizeFamily(data);
  if (!clean) return false;
  setState(applyRestore(state, clean, decisions));
  return true;
}

// استرجاع كامل (يحل محل كل شيء) — يُستخدم فقط باختيار صريح "افتح حديقة الرابط كاملة"
export function restoreFamily(data) {
  const clean = sanitizeFamily(data);
  if (!clean) return false;
  setState(clean);
  return true;
}

export function today() {
  return todayStr();
}

export function progressSummary(child) {
  const disc = discoveredCount(child);
  const surahsDone = Object.values(child.listening || {}).filter((l) => l.completed).length;
  const streak = streakOf(child);
  if (disc === 0 && surahsDone === 0 && streak === 0 && (child.daily?.waterStreak || 0) === 0) return 'جاهز للرحلة 🌿';
  const parts = [];
  if (disc > 0) parts.push(`اكتشف ${disc} من ٣٠ كلمة`);
  if (surahsDone > 0) parts.push(`أتم الاستماع لـ${surahsDone} سورة`);
  if (streak >= 2) parts.push(`🔥 ${streak} أيام متتالية`);
  return parts.length ? parts.join(' · ') : 'جاهز للرحلة 🌿';
}
