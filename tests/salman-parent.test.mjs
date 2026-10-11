// اختبارات وضع ولي الأمر (المرحلة G): PIN، وحدّ الزيارات، وساعات الهدوء، والتقرير، والترحيل.
import { describe, it, expect } from 'vitest';
import {
  PARENT_DEFAULTS,
  STATUS_LABEL,
  sanitizeParent,
  hashPin,
  isValidPin,
  makePinRecord,
  hasPin,
  verifyPin,
  riyadhHour,
  inQuietHours,
  visitsToday,
  visitGate,
  countVisit,
  gardenReport,
} from '../src/salman/lib/parent.js';
import { createState, normalizeState, SCHEMA_VERSION, answerItem } from '../src/salman/lib/gamify.js';
import { CATALOG } from '../src/salman/lib/catalog.js';
import { addDays } from '../src/salman/lib/leitner.js';

const D1 = '2026-10-11';
const D2 = addDays(D1, 1);
const D3 = addDays(D1, 2);

describe('إعدادات ولي الأمر', () => {
  it('الافتراضي: زيارة واحدة، وهدوء من 20 إلى 7، وبلا PIN', () => {
    expect(PARENT_DEFAULTS).toEqual({ pinHash: null, pinSalt: null, maxVisits: 1, quietFrom: 20, quietTo: 7 });
    expect(createState().parent).toEqual(PARENT_DEFAULTS);
    expect(createState().visitLog).toEqual({ day: null, count: 0 });
  });

  it('القيم التالفة تعود إلى الافتراضي', () => {
    const p = sanitizeParent({ maxVisits: 9, quietFrom: 25, quietTo: 'x', pinHash: 'zz', pinSalt: 'abc' });
    expect(p.maxVisits).toBe(1);
    expect(p.quietFrom).toBe(20);
    expect(p.quietTo).toBe(7);
    expect(p.pinHash).toBeNull();
    expect(p.pinSalt).toBeNull();
    expect(sanitizeParent(null)).toEqual(PARENT_DEFAULTS);
  });

  it('حدّ الزيارات يقبل 1 إلى 3 فقط', () => {
    expect(sanitizeParent({ maxVisits: 3 }).maxVisits).toBe(3);
    expect(sanitizeParent({ maxVisits: 0 }).maxVisits).toBe(1);
    expect(sanitizeParent({ maxVisits: 1.5 }).maxVisits).toBe(1);
  });
});

describe('الرمز PIN', () => {
  it('الرمز يجب أن يكون 4 أرقام بالضبط', () => {
    expect(isValidPin('1234')).toBe(true);
    expect(isValidPin('0000')).toBe(true);
    expect(isValidPin('123')).toBe(false);
    expect(isValidPin('12345')).toBe(false);
    expect(isValidPin('12a4')).toBe(false);
    expect(isValidPin(1234)).toBe(false);
  });

  it('التجزئة ثابتة لنفس الرمز والملح، ومختلفة بملح مختلف', () => {
    expect(hashPin('1234', 'salt')).toBe(hashPin('1234', 'salt'));
    expect(hashPin('1234', 'salt')).not.toBe(hashPin('1235', 'salt'));
    expect(hashPin('1234', 'salt')).not.toBe(hashPin('1234', 'other'));
    expect(hashPin('1234', 'salt')).toMatch(/^[0-9a-f]{8}$/);
  });

  it('التحقق يقبل الرمز الصحيح فقط، ولا يقبل شيئًا قبل ضبط الرمز', () => {
    const rec = makePinRecord('4821', 'sa1t');
    const parent = { ...PARENT_DEFAULTS, ...rec };
    expect(hasPin(parent)).toBe(true);
    expect(verifyPin(parent, '4821')).toBe(true);
    expect(verifyPin(parent, '4822')).toBe(false);
    expect(verifyPin(parent, '482')).toBe(false);
    expect(verifyPin(PARENT_DEFAULTS, '4821')).toBe(false);
  });

  it('لا يُحفظ الرمز نفسه، بل تجزئته فقط', () => {
    const rec = makePinRecord('4821', 'sa1t');
    expect(JSON.stringify(rec)).not.toContain('4821');
  });

  it('رمز غير صالح عند الضبط يرمي خطأ', () => {
    expect(() => makePinRecord('12')).toThrow();
  });
});

describe('ساعات الهدوء (توقيت الرياض)', () => {
  it('الساعة تُحسب بتوقيت الرياض (UTC+3)', () => {
    expect(riyadhHour(new Date('2026-10-11T18:00:00Z'))).toBe(21);
    expect(riyadhHour(new Date('2026-10-11T04:30:00Z'))).toBe(7);
    expect(riyadhHour(new Date('2026-10-11T21:30:00Z'))).toBe(0);
  });

  it('النافذة التي تعبر منتصف الليل (20 → 7)', () => {
    expect(inQuietHours(20, 20, 7)).toBe(true);
    expect(inQuietHours(23, 20, 7)).toBe(true);
    expect(inQuietHours(3, 20, 7)).toBe(true);
    expect(inQuietHours(6, 20, 7)).toBe(true);
    expect(inQuietHours(7, 20, 7)).toBe(false);
    expect(inQuietHours(12, 20, 7)).toBe(false);
    expect(inQuietHours(19, 20, 7)).toBe(false);
  });

  it('نافذة لا تعبر منتصف الليل، ونافذة فارغة (من = إلى) لا تمنع شيئًا', () => {
    expect(inQuietHours(14, 13, 15)).toBe(true);
    expect(inQuietHours(15, 13, 15)).toBe(false);
    expect(inQuietHours(2, 5, 5)).toBe(false);
  });
});

describe('بوابة الزيارة', () => {
  it('تُسمح الزيارة الأولى في وقت النهار', () => {
    const s = createState();
    expect(visitGate(s, { dayKey: D1, hour: 10 })).toEqual({ open: true, reason: null });
  });

  it('بعد الحدّ اليومي (زيارة واحدة) تُمنع، والسبب cap', () => {
    let s = createState();
    s = countVisit(s, D1);
    expect(visitsToday(s, D1)).toBe(1);
    expect(visitGate(s, { dayKey: D1, hour: 10 })).toEqual({ open: false, reason: 'cap' });
  });

  it('الحدّ اليومي يتجدد في يوم جديد', () => {
    let s = countVisit(createState(), D1);
    expect(visitGate(s, { dayKey: D2, hour: 10 }).open).toBe(true);
    s = countVisit(s, D2);
    expect(visitsToday(s, D2)).toBe(1);
  });

  it('الولي يرفع الحدّ إلى زيارتين فتُسمح الثانية', () => {
    let s = { ...createState(), parent: { ...PARENT_DEFAULTS, maxVisits: 2 } };
    s = countVisit(s, D1);
    expect(visitGate(s, { dayKey: D1, hour: 10 }).open).toBe(true);
    s = countVisit(s, D1);
    expect(visitGate(s, { dayKey: D1, hour: 10 }).open).toBe(false);
  });

  it('وقت الهدوء يمنع الزيارة بسبب quiet حتى مع توفّر الحدّ', () => {
    const s = createState();
    expect(visitGate(s, { dayKey: D1, hour: 22 })).toEqual({ open: false, reason: 'quiet' });
  });
});

describe('تقرير ولي الأمر', () => {
  it('حالة جديدة: كل الحدائق «لم تبدأ»', () => {
    const rep = gardenReport(createState(), CATALOG);
    expect(rep).toHaveLength(4);
    expect(rep.every((r) => r.status === 'not-started')).toBe(true);
    expect(rep.every((r) => r.total > 0)).toBe(true);
    expect(STATUS_LABEL['not-started']).toBeTruthy();
  });

  it('عنصر أُتقن (3 أيام صحيحة) يظهر ضمن المتقن، والحديقة «يتعلّم» إن كان أقل من النصف', () => {
    const item = CATALOG.arabic[0];
    let s = createState();
    for (const d of [D1, D2, D3]) {
      s = answerItem(s, { itemId: item.id, garden: 'arabic', correct: true, dayKey: d });
    }
    const arabic = gardenReport(s, CATALOG).find((r) => r.garden === 'arabic');
    expect(arabic.mastered).toBe(1);
    expect(arabic.status).toBe('learning');
    expect(arabic.touched).toBeGreaterThan(0);
  });

  it('أربعة عناصر أُخطئ فيها ولم يُتقن شيء: «يحتاج مساعدة»', () => {
    let s = createState();
    for (const it of CATALOG.math.slice(0, 4)) {
      s = answerItem(s, { itemId: it.id, garden: 'math', correct: false, dayKey: D1 });
    }
    const math = gardenReport(s, CATALOG).find((r) => r.garden === 'math');
    expect(math.status).toBe('help');
  });

  it('حديقة فيها نصف العناصر متقنة: «متقن»', () => {
    const items = CATALOG.english;
    const half = Math.ceil(items.length / 2);
    let s = createState();
    for (const it of items.slice(0, half)) {
      for (const d of [D1, D2, D3]) {
        s = answerItem(s, { itemId: it.id, garden: 'english', correct: true, dayKey: d });
      }
    }
    const eng = gardenReport(s, CATALOG).find((r) => r.garden === 'english');
    expect(eng.mastered).toBe(half);
    expect(eng.status).toBe('mastered');
  });
});

describe('الترحيل إلى v3', () => {
  it('الإصدار الحالي 3', () => {
    expect(SCHEMA_VERSION).toBe(3);
  });

  it('حالة v2 بلا visitLog ولا parent تُحمَّل بالافتراضي، والنجوم لا تتغيّر', () => {
    const v2 = {
      v: 2,
      stars: 9,
      gardens: { quran: 0, arabic: 4, math: 3, english: 2 },
      doneStories: {},
      learnedSurahs: {},
      streak: { current: 3, best: 3, last: D1 },
      visits: 2,
      gifts: ['gift-star', 'gift-butterfly'],
      badges: { 'first-star': true },
      skills: {},
      daily: { day: D1, newByGarden: { arabic: 1 } },
    };
    const s = normalizeState(v2);
    expect(s.v).toBe(3);
    expect(s.stars).toBe(9);
    expect(s.visitLog).toEqual({ day: null, count: 0 });
    expect(s.parent).toEqual(PARENT_DEFAULTS);
  });

  it('حالة تالفة في visitLog لا تكسر التطبيق', () => {
    const s = normalizeState({ visitLog: { day: 'nope', count: 'x' }, parent: 'bad' });
    expect(s.visitLog).toEqual({ day: null, count: 0 });
    expect(s.parent).toEqual(PARENT_DEFAULTS);
  });
});
