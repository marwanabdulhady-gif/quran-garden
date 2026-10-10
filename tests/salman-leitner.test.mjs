// اختبارات قواعد Leitner، وحدّ الجديد اليومي، واختيار الجلسة، والترحيل v1 → v2، وسورة الفاتحة.
import { describe, it, expect } from 'vitest';
import {
  addDays,
  applyAnswer,
  isDue,
  markSeen,
  newRecord,
  sanitizeRecord,
  skillState,
  DAILY_NEW_CAP,
} from '../src/salman/lib/leitner.js';
import {
  answerItem,
  createState,
  exposeItem,
  newAllowed,
  normalizeState,
  SCHEMA_VERSION,
} from '../src/salman/lib/gamify.js';
import { pickSession, SESSION_MAX, SESSION_MIN } from '../src/salman/lib/session.js';
import { CATALOG } from '../src/salman/lib/catalog.js';
import { FATIHA } from '../src/salman/data/fatiha.js';
import { SURAHS } from '../src/salman/data/quran.js';

const D1 = '2026-10-11';
const D2 = '2026-10-12';
const D3 = '2026-10-13';

describe('قواعد Leitner (§4)', () => {
  it('إجابة صحيحة في يوم جديد ترقّي الصندوق وتزيد الأيام', () => {
    const r = applyAnswer(newRecord(D1), { correct: true, dayKey: D1 });
    expect(r.box).toBe(1);
    expect(r.days).toBe(1);
    expect(r.lastCorrect).toBe(D1);
  });

  it('إجابة صحيحة في اليوم نفسه لا ترقّي (ممارسة فقط)', () => {
    const once = applyAnswer(newRecord(D1), { correct: true, dayKey: D1 });
    const twice = applyAnswer(once, { correct: true, dayKey: D1 });
    expect(twice.box).toBe(1);
    expect(twice.days).toBe(1);
  });

  it('الغلط يضبط الصندوق على 1 ويُبقي الأيام كما هي', () => {
    const rec = { box: 2, days: 2, lastCorrect: D2, lastSeen: D2, due: D3 };
    const r = applyAnswer(rec, { correct: false, dayKey: D3 });
    expect(r.box).toBe(1);
    expect(r.days).toBe(2);
    expect(r.due).toBe(addDays(D3, 1));
  });

  it('المثال من الخطة: صحيح يومين مختلفين ← صندوق 2، ثم يوم ثالث ← متقن', () => {
    let r = applyAnswer(null, { correct: true, dayKey: D1 });
    r = applyAnswer(r, { correct: true, dayKey: D2 });
    expect(r.box).toBe(2);
    expect(r.days).toBe(2);
    expect(skillState(r)).toBe('learning');
    r = applyAnswer(r, { correct: true, dayKey: D3 });
    expect(r.box).toBe(3);
    expect(r.days).toBe(3);
    expect(skillState(r)).toBe('mastered');
  });

  it('الصندوق 3 مع أقل من 3 أيام يبقى «تعلّم» وليس «متقنًا»', () => {
    expect(skillState({ box: 3, days: 2, lastCorrect: D2, lastSeen: D2, due: D3 })).toBe('learning');
  });

  it('مواعيد المراجعة: الصندوق 0 اليوم، 1 بعد يوم، 2 بعد 3 أيام، 3 بعد 7 أيام', () => {
    expect(applyAnswer(null, { correct: false, dayKey: D1 }).due).toBe(addDays(D1, 1));
    const b2 = { box: 1, days: 1, lastCorrect: D1, lastSeen: D1, due: D2 };
    expect(applyAnswer(b2, { correct: true, dayKey: D2 }).due).toBe(addDays(D2, 3));
    const b3 = { box: 2, days: 2, lastCorrect: D2, lastSeen: D2, due: D3 };
    const m = applyAnswer(b3, { correct: true, dayKey: D3 });
    expect(m.due).toBe(addDays(D3, 7));
    expect(isDue(m, addDays(D3, 6))).toBe(false);
    expect(isDue(m, addDays(D3, 7))).toBe(true);
  });

  it('المتقن يعود أسبوعيًا: مراجعة كل 7 أيام', () => {
    const mastered = { box: 3, days: 3, lastCorrect: D3, lastSeen: D3, due: addDays(D3, 7) };
    expect(skillState(mastered)).toBe('mastered');
    expect(isDue(mastered, addDays(D3, 7))).toBe(true);
  });

  it('حالات العنصر: جديد ← شُوهد ← تعلّم ← متقن', () => {
    expect(skillState(undefined)).toBe('new');
    const seen = markSeen(null, D1);
    expect(skillState(seen)).toBe('seen');
    expect(seen.due).toBe(D1);
    expect(skillState(applyAnswer(seen, { correct: true, dayKey: D1 }))).toBe('learning');
  });

  it('addDays يعبر نهاية الشهر والسنة', () => {
    expect(addDays('2026-12-31', 1)).toBe('2027-01-01');
    expect(addDays('2026-03-01', -1)).toBe('2026-02-28');
  });

  it('sanitizeRecord يُسقط القيم التالفة', () => {
    expect(sanitizeRecord({ box: 9, days: 1, lastSeen: D1 })).toBeNull();
    expect(sanitizeRecord({ box: 1, days: -1, lastSeen: D1 })).toBeNull();
    expect(sanitizeRecord({ box: 1, days: 1, lastSeen: 'yesterday' })).toEqual({
      box: 1,
      days: 1,
      lastCorrect: null,
      lastSeen: null,
      due: null,
    });
    expect(sanitizeRecord('junk')).toBeNull();
  });
});

describe('الحدّ اليومي للجديد (حد 2 لكل حديقة)', () => {
  it('الحدّ 2 ويُحسب عند الظهور، ولا يُعاد حسابه لنفس العنصر', () => {
    let s = createState();
    expect(newAllowed(s, 'arabic', D1)).toBe(DAILY_NEW_CAP);
    s = exposeItem(s, { itemId: 'a', garden: 'arabic', dayKey: D1 });
    s = exposeItem(s, { itemId: 'a', garden: 'arabic', dayKey: D1 });
    expect(newAllowed(s, 'arabic', D1)).toBe(1);
    s = exposeItem(s, { itemId: 'b', garden: 'arabic', dayKey: D1 });
    expect(newAllowed(s, 'arabic', D1)).toBe(0);
    expect(newAllowed(s, 'math', D1)).toBe(2);
  });

  it('يتجدد في اليوم التالي', () => {
    let s = createState();
    s = exposeItem(s, { itemId: 'a', garden: 'arabic', dayKey: D1 });
    s = exposeItem(s, { itemId: 'b', garden: 'arabic', dayKey: D1 });
    expect(newAllowed(s, 'arabic', D2)).toBe(DAILY_NEW_CAP);
  });

  it('answerItem تعمل بدون ظهور سابق وتحسب الجديد مرة واحدة', () => {
    let s = answerItem(createState(), { itemId: 'x', garden: 'math', correct: true, dayKey: D1 });
    expect(s.skills.x.box).toBe(1);
    expect(newAllowed(s, 'math', D1)).toBe(DAILY_NEW_CAP - 1);
  });
});

describe('اختيار الجلسة (pickSession)', () => {
  it('حالة جديدة: 8 عناصر، عنصرين من كل حديقة، بالترتيب', () => {
    const plan = pickSession(createState(), CATALOG, D1);
    expect(plan).toHaveLength(8);
    expect(plan.map((p) => p.garden)).toEqual([
      'arabic',
      'arabic',
      'math',
      'math',
      'quran',
      'quran',
      'english',
      'english',
    ]);
    expect(plan.every((p) => p.kind === 'new')).toBe(true);
  });

  it('حدّ الجديد: بعد عنصرين جديدين في العربية لا يظهر جديد عربي آخر في اليوم نفسه', () => {
    let s = createState();
    s = exposeItem(s, { itemId: CATALOG.arabic[0].id, garden: 'arabic', dayKey: D1 });
    s = exposeItem(s, { itemId: CATALOG.arabic[1].id, garden: 'arabic', dayKey: D1 });
    const plan = pickSession(s, CATALOG, D1);
    expect(plan.filter((p) => p.garden === 'arabic')).toHaveLength(0);
    expect(plan.length).toBeGreaterThanOrEqual(SESSION_MIN);
  });

  it('المراجعة المستحقة تأتي قبل الجديد، والعنصر الذي ظهر اليوم لا يتكرر', () => {
    const arabicFirst = CATALOG.arabic[0];
    let s = createState();
    s = answerItem(s, { itemId: arabicFirst.id, garden: 'arabic', correct: true, dayKey: D1 });
    const plan = pickSession(s, CATALOG, D2);
    const arabic = plan.filter((p) => p.garden === 'arabic');
    expect(arabic[0].id).toBe(arabicFirst.id);
    expect(arabic[0].kind).toBe('review');
    expect(plan.filter((p) => p.id === arabicFirst.id)).toHaveLength(1);
    const again = pickSession(s, CATALOG, D1);
    expect(again.some((p) => p.id === arabicFirst.id)).toBe(false);
  });

  it('لا تتجاوز 8 ولا تقل عن 5 عند توفّر المحتوى', () => {
    let s = createState();
    for (let day = 0; day < 12; day++) {
      const dayKey = addDays(D1, day);
      const plan = pickSession(s, CATALOG, dayKey);
      expect(plan.length).toBeLessThanOrEqual(SESSION_MAX);
      expect(plan.length).toBeGreaterThanOrEqual(SESSION_MIN);
      for (const p of plan) {
        s = answerItem(s, { itemId: p.id, garden: p.garden, correct: true, dayKey });
      }
    }
  });
});

describe('الترحيل من v1 إلى v2', () => {
  it('الإصدار الحالي 2', () => {
    expect(SCHEMA_VERSION).toBe(2);
    expect(createState().v).toBe(2);
  });

  it('القصص المكتملة تصبح عناصر متعلَّمة تحتاج مراجعة، وتبقى النجوم والأوسمة', () => {
    const v1 = {
      v: 1,
      stars: 7,
      gardens: { quran: 0, arabic: 5, math: 2, english: 0 },
      doneStories: { 'ar-01-p': true, 'math-1': true },
      learnedSurahs: {},
      streak: { current: 2, best: 2, last: D1 },
      visits: 1,
      gifts: ['gift-star'],
      badges: { 'first-star': true },
    };
    const s = normalizeState(v1);
    expect(s.v).toBe(2);
    expect(s.stars).toBe(7);
    expect(s.gardens.arabic).toBe(5);
    expect(s.badges['first-star']).toBe(true);
    expect(s.skills['ar-01-p']).toEqual({ box: 1, days: 1, lastCorrect: null, lastSeen: null, due: null });
    expect(s.skills['math-1']).toBeDefined();
    expect(s.daily).toEqual({ day: null, newByGarden: {} });
  });

  it('الترحيل idempotent: تطبيقه مرتين يعطي النتيجة نفسها', () => {
    const once = normalizeState({ v: 1, doneStories: { 'ar-01-p': true } });
    const twice = normalizeState(JSON.parse(JSON.stringify(once)));
    expect(twice).toEqual(once);
  });

  it('البيانات التالفة في skills تُسقط ولا تكسر التطبيق', () => {
    const s = normalizeState({
      v: 2,
      skills: { good: { box: 2, days: 2, lastSeen: D1 }, bad: { box: 'x' } },
      daily: { day: 'nope' },
    });
    expect(s.skills.good).toBeDefined();
    expect(s.skills.bad).toBeUndefined();
    expect(s.daily).toEqual({ day: null, newByGarden: {} });
  });
});

describe('سورة الفاتحة (بيانات العمل بدون إنترنت)', () => {
  it('سبع آيات، وعددها يطابق بيانات السورة', () => {
    expect(FATIHA.ayahs).toHaveLength(SURAHS[1].ayahs);
    expect(FATIHA.ayahs.every((a) => typeof a === 'string' && a.length > 0)).toBe(true);
    expect(FATIHA.ayahs[0]).toContain('بِسْمِ');
  });

  it('المصدر مذكور مع شرط الترخيص', () => {
    expect(FATIHA.source).toContain('Tanzil');
    expect(FATIHA.source).toContain('CC BY 3.0');
  });
});
