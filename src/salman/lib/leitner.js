// قواعد Leitner لحديقة سلمان — دوال نقية (بدون React ولا تخزين).
// معتمدة من المستخدم كما هي في docs/salmans-garden/PROPOSAL.md §4.
//
// الحقول لكل عنصر (skills[itemId]):
//   box          0..3   (0 = شُوهد، 1 = تعلّم، 2 = تعلّم أكثر، 3 = صندوق الإتقان)
//   days         عدد الأيام المختلفة التي أُجيب فيها صحيحًا
//   lastCorrect  آخر يوم أُجيب فيه صحيحًا (YYYY-MM-DD) أو null
//   lastSeen     آخر يوم ظهر فيه العنصر أو null (للسجلات المرحّلة)
//   due          أول يوم يُعاد فيه العنصر (YYYY-MM-DD)، أو null = مستحق الآن
//
// القواعد:
//   1. صحيح في يوم جديد: box = min(box+1, 3)، و days += 1.
//   2. صحيح في اليوم نفسه: لا ترقية (ممارسة فقط)، والمواعيد تُحسب من جديد.
//   3. غلط: box = 1، و days يبقى كما هو.
//   4. متقن = box 3 و days >= 3. لو box 3 لكن days < 3 يبقى «تعلّم».
//   5. مواعيد المراجعة: box 0 → اليوم نفسه، 1 → بعد يوم، 2 → بعد 3 أيام، 3 → بعد 7 أيام.
//   6. الجديد: حدّ 2 لكل حديقة في اليوم (يُطبَّق في session.js).
//
// ملاحظة تطبيقية: العنصر يُحسب بأول محاولة فقط. الخطأ الأول يُسجَّل غلطًا حتى لو نجح الطفل بعده.

export const BOX_INTERVAL = [0, 1, 3, 7];
export const MASTER_BOX = 3;
export const MASTER_DAYS = 3;
export const DAILY_NEW_CAP = 2;

const DAY_RE = /^\d{4}-\d{2}-\d{2}$/;

export function addDays(dayKey, n) {
  const [y, m, d] = dayKey.split('-').map(Number);
  const dt = new Date(Date.UTC(y, m - 1, d + n));
  return dt.toISOString().slice(0, 10);
}

export function newRecord(dayKey) {
  return { box: 0, days: 0, lastCorrect: null, lastSeen: dayKey, due: dayKey };
}

// حالة العنصر للعرض: new / seen / learning / mastered
export function skillState(rec) {
  if (!rec) return 'new';
  if (rec.box === MASTER_BOX && rec.days >= MASTER_DAYS) return 'mastered';
  if (rec.box === 0) return 'seen';
  return 'learning';
}

// هل يجب أن يُعرض العنصر في جلسة هذا اليوم؟ (العناصر الجديدة لا تُعدّ هنا)
export function isDue(rec, dayKey) {
  if (!rec) return false;
  return rec.due === null || rec.due <= dayKey;
}

// يطبّق نتيجة إجابة واحدة (أول محاولة) على السجل، ويعيد سجلًا جديدًا.
export function applyAnswer(rec, { correct, dayKey }) {
  const prev = rec || newRecord(dayKey);
  let box = prev.box;
  let days = prev.days;
  let lastCorrect = prev.lastCorrect;

  if (correct) {
    if (lastCorrect !== dayKey) {
      box = Math.min(box + 1, MASTER_BOX);
      days += 1;
      lastCorrect = dayKey;
    }
  } else {
    box = 1;
  }

  return {
    box,
    days,
    lastCorrect,
    lastSeen: dayKey,
    due: addDays(dayKey, BOX_INTERVAL[box]),
  };
}

// يُسجّل ظهور العنصر لأول مرة (يصبح «شُوهد») دون أن يغيّر تقدّمه إن وُجد.
export function markSeen(rec, dayKey) {
  if (rec) return { ...rec, lastSeen: dayKey };
  return newRecord(dayKey);
}

// تنظيف السجل المحفوظ: يُسقط أي قيمة تالفة بدل أن ينكسر التطبيق
export function sanitizeRecord(raw) {
  if (!raw || typeof raw !== 'object') return null;
  const box = Number(raw.box);
  const days = Number(raw.days);
  if (!Number.isInteger(box) || box < 0 || box > MASTER_BOX) return null;
  if (!Number.isInteger(days) || days < 0 || days > 9999) return null;
  const day = (v) => (typeof v === 'string' && DAY_RE.test(v) ? v : null);
  return {
    box,
    days,
    lastCorrect: day(raw.lastCorrect),
    lastSeen: day(raw.lastSeen),
    due: raw.due === null ? null : day(raw.due),
  };
}

// سجل العنصر المكتمل قبل الترحيل: تعلّمه سابقًا ويحتاج مراجعة، فيُعطى box 1 و days 1 ومستحق الآن
export function legacyRecord() {
  return { box: 1, days: 1, lastCorrect: null, lastSeen: null, due: null };
}
