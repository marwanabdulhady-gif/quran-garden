// اختبارات سلسلة ترحيل المخطط (P4-30) + ترحيل عمر→سلمان
import { describe, it, expect } from 'vitest';

const store = {};
globalThis.localStorage = {
  getItem: (k) => (k in store ? store[k] : null),
  setItem: (k, v) => {
    store[k] = String(v);
  },
  removeItem: (k) => delete store[k],
};
globalThis.location = { origin: 'http://x', pathname: '/', href: 'http://x/' };
globalThis.navigator = {};

const S = await import('../src/store.js');

const KEY = 'quran-garden-family-v1';

const legacyV1 = () => ({
  familyKey: 'fam-1',
  children: [
    {
      id: 'c1',
      name: 'عمر',
      stars: 12,
      badges: ['start', 'trip1'],
      gifts: { pending: 1, decor: ['cat'] },
      bridge: { level: 'easy', words: { subatan: { done: true, discovered: true, reviewed: 1 } }, tripsDone: [1] },
      listening: { 67: { heard: 5, completed: false } },
      createdAt: 1700000000000,
    },
    { id: 'c2', name: 'سلمى', stars: 3, badges: [] },
  ],
  activeChildId: 'c1',
  updatedAt: 1700000000000,
});

describe('migrateState (وحدات)', () => {
  it('v1 (بدون version) → v3: عمر→سلمان + أوسمة كائنات + إحصائيات', () => {
    const out = S.migrateState(legacyV1());
    expect(out.version).toBe(S.SCHEMA_VERSION);
    expect(S.SCHEMA_VERSION).toBe(3);
    expect(out.children[0].name).toBe('سلمان');
    expect(out.children[1].name).toBe('سلمى', 'باقي الأطفال ما يتغيروش');
    const badges = out.children[0].badges;
    expect(badges).toHaveLength(2);
    expect(badges.every((b) => typeof b === 'object' && b.id && Number.isFinite(b.at))).toBe(true);
    expect(badges.map((b) => b.id).sort()).toEqual(['start', 'trip1']);
    expect(out.children[0].stars).toBe(12, 'التقدم محفوظ');
  });

  it('idempotent: تطبيقها مرتين نفس النتيجة', () => {
    const once = S.migrateState(legacyV1());
    const twice = S.migrateState(once);
    expect(twice).toEqual(once);
  });

  it('v2 موجود → ما يتغير إلا إن حاجة ناقصة', () => {
    const v2 = S.migrateState(legacyV1());
    const out = S.migrateState(v2);
    expect(out).toEqual(v2);
  });

  it('نسخة مجهولة أعلى من الحالية → تمر كما هي', () => {
    const future = { ...legacyV1(), version: 99, children: legacyV1().children.map((c) => ({ ...c, name: 'عمر' })) };
    const out = S.migrateState(future);
    expect(out.version).toBe(99, 'ما نزلّش نسخة مستقبلية');
    expect(out.children[0].name).toBe('عمر', 'ومش بتتعرض لترحيلات قديمة');
  });

  it('مدخل تالف ما يرميش', () => {
    expect(() => S.migrateState(null)).not.toThrow();
    expect(() => S.migrateState({})).not.toThrow();
    expect(() => S.migrateState({ children: [] })).not.toThrow();
    expect(() => S.migrateState('نص')).not.toThrow();
    expect(S.migrateState(null)).toBeNull();
    expect(S.migrateState({ children: [] })).toEqual({ children: [] });
  });

  it('سلسلة ترحيلات متعددة: حالة ناقصة الحقول → ما ترميش', () => {
    const v = S.migrateState(legacyV1());
    expect(() =>
      S.migrateState({ ...v, children: v.children.map(({ daily: _daily, stats: _s, parent: _p, ...rest }) => rest) })
    ).not.toThrow();
  });
});

describe('ترحيل v2 → v3: إحصائيات + وضع الوالدين', () => {
  const legacyV2 = () => {
    // حالة v2 (قبل P5) — بدون stats/parent
    return {
      familyKey: 'fam-2',
      version: 2,
      children: [
        {
          id: 'c1',
          name: 'سلمان',
          stars: 8,
          badges: [{ id: 'start', at: 1700000000000 }],
          listening: { 114: { heard: 3, completed: false } },
          createdAt: 1700000000000,
        },
      ],
      activeChildId: 'c1',
      updatedAt: 1700000000000,
    };
  };

  it('v2 مخزنة → v3: كل طفل ياخد stats صفري + parent آمن', () => {
    const out = S.migrateState(legacyV2());
    expect(out.version).toBe(3);
    const c = out.children[0];
    expect(c.stats).toEqual({ seconds: 0, weeks: {}, surahs: {}, days: {} });
    expect(c.parent).toEqual({ pin: null, enabled: false, dailyCapMin: 0, quietFrom: null, quietUntil: null });
    expect(c.stars).toBe(8, 'التقدم محفوظ');
  });

  it('v2 فيها stats/parent سليمة → بيتحفظوا زي ما هم', () => {
    const v2 = legacyV2();
    v2.children[0].stats = {
      seconds: 420,
      weeks: { '2026-W38': 420 },
      surahs: { 114: { seconds: 420, ayahs: 9 } },
      days: {},
    };
    v2.children[0].parent = { pin: '7788', enabled: true, dailyCapMin: 30, quietFrom: '21:00', quietUntil: '07:00' };
    const out = S.migrateState(v2);
    expect(out.children[0].stats.seconds).toBe(420);
    expect(out.children[0].parent).toEqual({
      pin: '7788',
      enabled: true,
      dailyCapMin: 30,
      quietFrom: '21:00',
      quietUntil: '07:00',
    });
  });

  it('idempotent: v3 مخزنة → ما تتغيرش', () => {
    const v3 = S.migrateState(legacyV2());
    const out = S.migrateState(v3);
    expect(out).toEqual(v3);
  });
});

describe('load() من التخزين (تكامل)', () => {
  it('بيانات v1 مخزنة → سلمان + النجوم محفوظة + باقي الأطفال سليمة', async () => {
    globalThis.localStorage.setItem(KEY, JSON.stringify(legacyV1()));
    // استيراد متجر جديد (قراءة جديدة) — نعمله عبر import محلي مفصل
    const mod = await import('../src/store.js' + '?fresh=' + Date.now());
    const s = mod.getState();
    expect(s.version).toBe(S.SCHEMA_VERSION);
    expect(s.children[0].name).toBe('سلمان');
    expect(s.children[0].stars).toBe(12);
    expect(s.children[1].name).toBe('سلمى');
    expect(s.activeChildId).toBe('c1');
    // الأوسمة اتحولت لصيغة كائن
    expect(
      mod
        .activeChild(s)
        .badges.map((b) => b.id)
        .sort()
    ).toEqual(['start', 'trip1']);
    // التقدم كله باقٍ
    expect(mod.activeChild(s).bridge.words.subatan.done).toBe(true);
    expect(mod.activeChild(s).listening['67'].heard).toBe(5);
  });

  it('بيانات v2 مخزنة → ما تتكررش الترحيلات', async () => {
    const v2 = S.migrateState(legacyV1());
    globalThis.localStorage.setItem(KEY, JSON.stringify(v2));
    const mod = await import('../src/store.js' + '?fresh=' + Date.now());
    const s = mod.getState();
    expect(s.children[0].name).toBe('سلمان');
    expect(s.children[0].stars).toBe(12);
    expect(s.version).toBe(S.SCHEMA_VERSION);
  });

  it('JSON تالف → حديقة جديدة سليمة', async () => {
    globalThis.localStorage.setItem(KEY, '{oops');
    const mod = await import('../src/store.js' + '?fresh=' + Date.now());
    const s = mod.getState();
    expect(s.children).toHaveLength(1);
    expect(s.children[0].name).toBe('سلمان');
    expect(s.version).toBe(S.SCHEMA_VERSION);
  });
});

describe('روابط قديمة (sanitizeFamily يرحّل)', () => {
  it('رابط v1 فيه «عمر» → يفتح باسم سلمان', () => {
    const cleaned = S.sanitizeFamily(legacyV1());
    expect(cleaned).not.toBeNull();
    expect(cleaned.children[0].name).toBe('سلمان');
    expect(cleaned.version).toBe(S.SCHEMA_VERSION);
    expect(cleaned.children[0].stars).toBe(12);
  });
});
