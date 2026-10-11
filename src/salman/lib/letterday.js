// منطق «الدرس اليومي» في حدائق النور — دوال نقية (بلا React ولا تخزين) لتُختبَر وحدها.
// الخطة: docs/salmans-garden/PLAN-ISLAMIC-PHONICS.md §4 — سبع خطوات لكل حرف أو رقم أو صوت.
import { DAY_STEPS } from '../data/nour.js';

export { DAY_STEPS };

export const STEP_MINUTES = DAY_STEPS.reduce((n, s) => n + s.minutes, 0);

// قصة اليوم: اليوم الأول من الوحدة قصة النبي ﷺ أو القرآن، والثاني قصة الصحابي (إن وُجدت).
export function storyFor(unit, dayIndex = 0) {
  if (!unit || !unit.stories || !unit.stories.length) return null;
  if (dayIndex === 0) return unit.stories[0];
  return unit.stories[1] || unit.stories[0];
}

// خطة اليوم: الخطوات السبع مع حمولتها من الوحدة (نفس الخطة لكل وحدة)
export function dayPlan(unit, { dayIndex = 0 } = {}) {
  if (!unit) return [];
  const story = storyFor(unit, dayIndex);
  return DAY_STEPS.map((step) => {
    if (step.id === 'story' || step.id === 'door') return { ...step, story };
    if (step.id === 'sound') return { ...step, action: unit.action, chant: unit.chant, sound: unit.sound || null };
    // في حديقة الأرقام لا نصيد صوتًا بل عددًا — نفس المحرّك باسم يفهمه الطفل
    if (step.id === 'hunt' && unit.garden === 'math')
      return { ...step, title: 'صيد العدد', hint: 'ننقر ما عدده مثل عددنا', hunt: unit.hunt };
    if (step.id === 'hunt') return { ...step, hunt: unit.hunt };
    if (step.id === 'trace') return { ...step, trace: unit.trace };
    if (step.id === 'play') {
      const engine = unit.play === 'boxes' ? unit.boxes : unit.train;
      return { ...step, engine: unit.play === 'boxes' ? 'boxes' : 'train', round: engine };
    }
    if (step.id === 'deed') return { ...step, deed: unit.deed };
    return { ...step };
  });
}

// ---------- صيد الصوت ----------
export function huntTargets(hunt) {
  return (hunt?.items || []).filter((i) => i.correct).length;
}

export function huntDone(hunt, found = []) {
  return found.length >= huntTargets(hunt);
}

// نتيجة نقرة: 'hit' إن كان العنصر صحيحًا ولم يُوجد قبلها، 'again' إن أُوجد، 'miss' إن كان مشتِّتًا
export function huntTap(hunt, found, index) {
  const item = (hunt?.items || [])[index];
  if (!item) return 'miss';
  if (!item.correct) return 'miss';
  return found.includes(index) ? 'again' : 'hit';
}

// ---------- القطار (تركيب الكلمة/العدد) ----------
// الطفل ينقر البلاطات بالترتيب؛ نتحقق أن الترتيب المختار يطابق الحل.
// ترتيب العرض مبعثر بشكل ثابت (تدوير بخطوة) حتى لا يكون النقر من اليسار إلى اليمين تلقائيًا.
export function scramble(tiles = []) {
  if (tiles.length < 2) return tiles.map((_, i) => i);
  return tiles.map((_, i) => (i + 1) % tiles.length);
}

export function trainComplete(tiles, picked) {
  return Array.isArray(tiles) && picked.length === tiles.length;
}

export function trainCorrect(picked) {
  return picked.every((tile, i) => tile === i);
}

// ---------- صناديق الأصوات ----------
export function boxesCorrect(picked) {
  return Array.isArray(picked) && picked.every((tile, i) => tile === i);
}

// ---------- تقدّم اليوم ----------
export function nextStep(done = []) {
  return DAY_STEPS.find((s) => !done.includes(s.id)) || null;
}

export function dayFinished(done = []) {
  return done.length >= DAY_STEPS.length;
}

export function dayProgress(done = []) {
  return {
    done: done.length,
    total: DAY_STEPS.length,
    ratio: Math.max(0, Math.min(1, done.length / DAY_STEPS.length)),
  };
}

// مفتاح يوم الطفل في حالة الحديقة: { [unitId]: { day, done: [stepId], completed } }
export function unitDay(state, unitId) {
  return (state && state.nour && state.nour[unitId]) || null;
}

export function unitCompleted(state, unitId) {
  const rec = unitDay(state, unitId);
  return !!(rec && rec.completed);
}

// عدد وحدات الحدائق الثلاث المكتملة (لشريط التقدّم في الواجهة)
export function completedCount(state, units) {
  return (units || []).filter((u) => unitCompleted(state, u.id)).length;
}

// الوحدة التالية المقترحة: أول وحدة غير مكتملة في ترتيب الحديقة
export function nextUnit(units, state) {
  return (units || []).find((u) => !unitCompleted(state, u.id)) || null;
}
