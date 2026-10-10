// وضع ولي الأمر لحديقة سلمان — دوال نقية (بدون React ولا تخزين).
// الحدود: عدد الزيارات في اليوم، وساعات الهدوء (بتوقيت الرياض)، ورمز PIN من 4 أرقام.
// الرمز حاجز ضد الضغط العرضي من الطفل، وليس حماية أمنية: الجهاز نفسه يملك أي بيانات محلية.
// لا يُعرض للطفل أي عدّاد أو مؤقّت، ولا تُعاقَب الزيارة المنتهية أو المتوقفة.

import { GARDEN_ORDER } from '../data/gardens.js';
import { skillState } from './leitner.js';

export const MAX_VISITS_MIN = 1;
export const MAX_VISITS_MAX = 3;

// الافتراضي: زيارة واحدة في اليوم، وساعات الهدوء من 8 مساءً حتى 7 صباحًا
export const PARENT_DEFAULTS = {
  pinHash: null,
  pinSalt: null,
  maxVisits: 1,
  quietFrom: 20,
  quietTo: 7,
};

export const STATUS_LABEL = {
  'not-started': 'لم تبدأ بعد',
  mastered: 'متقن',
  learning: 'يتعلّم',
  help: 'يحتاج مساعدة',
};

const isHour = (n) => Number.isInteger(n) && n >= 0 && n <= 23;

// تنظيف إعدادات ولي الأمر المحفوظة: أي قيمة غير صالحة تعود إلى الافتراضي
export function sanitizeParent(raw) {
  const base = { ...PARENT_DEFAULTS };
  if (!raw || typeof raw !== 'object') return base;
  const hashOk = typeof raw.pinHash === 'string' && /^[0-9a-f]{8}$/.test(raw.pinHash);
  const saltOk = typeof raw.pinSalt === 'string' && raw.pinSalt.length > 0 && raw.pinSalt.length <= 32;
  const maxVisits = Number(raw.maxVisits);
  const quietFrom = Number(raw.quietFrom);
  const quietTo = Number(raw.quietTo);
  return {
    pinHash: hashOk && saltOk ? raw.pinHash : null,
    pinSalt: hashOk && saltOk ? raw.pinSalt : null,
    maxVisits:
      Number.isInteger(maxVisits) && maxVisits >= MAX_VISITS_MIN && maxVisits <= MAX_VISITS_MAX
        ? maxVisits
        : base.maxVisits,
    quietFrom: isHour(quietFrom) ? quietFrom : base.quietFrom,
    quietTo: isHour(quietTo) ? quietTo : base.quietTo,
  };
}

// تجزئة FNV-1a على الملح والرمز. كافية لمنع الضغط العرضي، وليست تجزئة أمنية.
export function hashPin(pin, salt) {
  const str = `${salt}:${pin}`;
  let h = 0x811c9dc5;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 0x01000193) >>> 0;
  }
  return h.toString(16).padStart(8, '0');
}

export function isValidPin(pin) {
  return typeof pin === 'string' && /^\d{4}$/.test(pin);
}

export function makePinRecord(pin, salt = Math.random().toString(36).slice(2, 10)) {
  if (!isValidPin(pin)) throw new Error('PIN must be 4 digits');
  return { pinHash: hashPin(pin, salt), pinSalt: salt };
}

export function hasPin(parent) {
  return !!(parent && parent.pinHash && parent.pinSalt);
}

export function verifyPin(parent, pin) {
  if (!hasPin(parent) || !isValidPin(pin)) return false;
  return hashPin(pin, parent.pinSalt) === parent.pinHash;
}

// ساعة الرياض (0–23) لحساب ساعات الهدوء
export function riyadhHour(date = new Date()) {
  return Number(
    new Intl.DateTimeFormat('en-GB', { timeZone: 'Asia/Riyadh', hour: 'numeric', hourCycle: 'h23' }).format(date)
  );
}

// هل الساعة داخل نافذة الهدوء؟ تدعم النافذة التي تعبر منتصف الليل (20 → 7)
export function inQuietHours(hour, from, to) {
  if (from === to) return false;
  if (from < to) return hour >= from && hour < to;
  return hour >= from || hour < to;
}

export function visitsToday(state, dayKey) {
  const log = state.visitLog;
  return log && log.day === dayKey ? log.count : 0;
}

// هل تُسمح زيارة جديدة الآن؟ السبب إن كان الرفض: quiet أو cap
export function visitGate(state, { dayKey, hour }) {
  const p = state.parent || PARENT_DEFAULTS;
  if (inQuietHours(hour, p.quietFrom, p.quietTo)) return { open: false, reason: 'quiet' };
  if (visitsToday(state, dayKey) >= p.maxVisits) return { open: false, reason: 'cap' };
  return { open: true, reason: null };
}

// تسجيل بدء زيارة في اليوم
export function countVisit(state, dayKey) {
  return { ...state, visitLog: { day: dayKey, count: visitsToday(state, dayKey) + 1 } };
}

// تقرير لكل حديقة: الإتقان والتعلّم والحاجة للمساعدة (قاعدة بسيطة وموثّقة)
//  - لم تبدأ: لا عنصر ظهر بعد
//  - متقن: نصف عناصر الحديقة على الأقل في صندوق الإتقان
//  - يحتاج مساعدة: 4 عناصر أو أكثر ما زالت في الصندوق 1 (أُعيدت بعد خطأ)، والمتقن أقل من 20%
//  - يتعلّم: غير ذلك
export function gardenReport(state, catalog) {
  return GARDEN_ORDER.map((garden) => {
    const items = catalog[garden] || [];
    let mastered = 0;
    let learning = 0;
    let seen = 0;
    let struggling = 0;
    for (const it of items) {
      const rec = state.skills[it.id];
      const st = skillState(rec);
      if (st === 'mastered') mastered++;
      else if (st === 'learning') {
        learning++;
        if (rec.box === 1) struggling++;
      } else if (st === 'seen') seen++;
    }
    const total = items.length;
    const touched = mastered + learning + seen;
    let status = 'learning';
    if (touched === 0) status = 'not-started';
    else if (total > 0 && mastered / total >= 0.5) status = 'mastered';
    else if (struggling >= 4 && total > 0 && mastered / total < 0.2) status = 'help';
    return { garden, total, mastered, learning, seen, touched, status, stars: state.gardens[garden] || 0 };
  });
}
