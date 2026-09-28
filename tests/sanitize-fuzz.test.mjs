// fuzz على تطهير البيانات الوافدة (P4-27):
// مدخلات عشوائية/معادية → ما يرميش + الإخراج دايمًا في الشكل الآمن
import { describe, it, expect } from 'vitest';

const S = await import('../src/store.js');
const D = await import('../src/data.js');

const rnd = (n) => Math.floor(Math.random() * n);
const pick = (a) => a[rnd(a.length)];
const RND_STR = ['x', 'أهلاً', 'script alert(1)', '  '.repeat(500), '\u0000', 'data:image/png;base64,AAAA'];

// مولّد مدخلات عشوائية "شريرة" (lazy — يختار النوع الأول عشان ما يتكررش بلا حدود)
function randomGarbage(depth = 0) {
  if (depth >= 3) return pick([...RND_STR, null, undefined, true, 0, -1e9, 1e9, NaN, Infinity]);
  const kinds = ['scalar', 'string', 'array', 'object', 'scalar', 'object']; // أوزان
  switch (pick(kinds)) {
    case 'string':
      return pick(RND_STR);
    case 'scalar':
      return pick([null, undefined, true, 0, -1e9, 1e9, NaN, Infinity]);
    case 'array':
      return [randomGarbage(depth + 1), ...Array.from({ length: rnd(4) }, () => rnd(100))];
    default:
      return Object.fromEntries(
        Array.from({ length: rnd(6) }, () => [
          pick([
            'name',
            'id',
            'stars',
            'badges',
            'listening',
            'bridge',
            'gifts',
            'playback',
            'reading',
            'daily',
            '__proto__',
            'constructor',
            'toString',
          ]),
          randomGarbage(depth + 1),
        ])
      );
  }
}

const invariants = (out) => {
  // شكل الطفل الآمن
  expect(typeof out.name).toBe('string');
  expect(out.name.length).toBeLessThanOrEqual(20);
  expect(Number.isFinite(out.stars)).toBe(true);
  expect(out.stars).toBeGreaterThanOrEqual(0);
  expect(out.badges).toBeInstanceOf(Array);
  expect(out.badges.length).toBeLessThanOrEqual(40);
  expect(
    out.badges.every(
      (b) => typeof b === 'object' && typeof b.id === 'string' && D.BADGES[b.id] && Number.isFinite(b.at)
    )
  ).toBe(true);
  if (out.avatar !== null) expect(String(out.avatar).startsWith('data:image/')).toBe(true);
  if (out.avatarReading !== null) expect(String(out.avatarReading).startsWith('data:image/')).toBe(true);
  expect(D.RECIERS.some((r) => r.id === out.reciter)).toBe(true);
  expect(out.gifts.pending).toBeGreaterThanOrEqual(0);
  expect(out.gifts.decor.every((x) => D.DECOR.some((d) => d.id === x))).toBe(true);
  expect(Object.keys(out.bridge.words).every((k) => D.WORDS.some((w) => w.id === k))).toBe(true);
  expect(Object.keys(out.listening).every((k) => +k >= 1 && +k <= 114)).toBe(true);
  expect([1, 2, 4]).toContain(out.playback.repeat);
  expect([0.75, 1, 1.25]).toContain(out.playback.speed);
  expect(['s', 'm', 'l']).toContain(out.reading.size);
  expect(typeof out.reading.plain).toBe('boolean');
};

describe('sanitizeChild fuzz (200 مدخل عشوائي)', () => {
  for (let i = 0; i < 200; i++) {
    it(`مدخل عشوائي #${i + 1} ما يرميش وإخراج آمن`, () => {
      const out = S.sanitizeChild(randomGarbage());
      invariants(out);
    });
  }
});

describe('sanitizeFamily fuzz (60 مدخل عشوائي)', () => {
  for (let i = 0; i < 60; i++) {
    it(`عائلة عشوائية #${i + 1}`, () => {
      const raw = { children: Array.from({ length: rnd(12) }, () => randomGarbage()) };
      const out = S.sanitizeFamily(raw);
      // ممكن ترجع null (لو كله انطهر لغير صالح) — بس لازم ترجع null أو كيانًا آمنًا
      if (out === null) return;
      expect(out.children.length).toBeGreaterThanOrEqual(1);
      expect(out.children.length).toBeLessThanOrEqual(8);
      for (const c of out.children) invariants(c);
      expect(out.children.some((c) => c.id === out.activeChildId)).toBe(true);
    });
  }
});

describe('حالات معروفة معادية', () => {
  it('prototype pollution: __proto__ و constructor ما ينفذوش', () => {
    const raw = {
      children: [
        {
          name: { __proto__: { admin: true } },
          __proto__: { hacked: true },
          constructor: { prototype: { pwned: 1 } },
          toString: 'function toString(){ return "hacked" }',
        },
      ],
    };
    const out = S.sanitizeFamily(raw);
    expect(out).not.toBeNull();
    expect(out.children[0].name).not.toBe('hacked');
    expect(out.children[0].name.length).toBeLessThanOrEqual(20);
    // الكائن الحقيقي ما اتلوثش
    expect({}.__proto__.hacked).toBeUndefined();
    expect(Object.prototype.hacked).toBeUndefined();
  });

  it('مصفوفات طويلة مقيدة', () => {
    const deep = Array.from({ length: 500 }, () => ({}));
    expect(() => S.sanitizeChild({ badges: deep })).not.toThrow();
    const huge = { children: Array.from({ length: 5000 }, (_, i) => ({ name: 'c' + i })) };
    const out = S.sanitizeFamily(huge);
    expect(out.children.length).toBeLessThanOrEqual(8);
  });

  it('نص ضخم (1MB) في الاسم بيتقصر', () => {
    const out = S.sanitizeChild({ name: 'أ'.repeat(1_000_000) });
    expect(out.name.length).toBe(20);
  });

  it('dataURL ضخم بيتقطع للسقف', () => {
    const out = S.sanitizeChild({ avatar: 'data:image/png;base64,' + 'B'.repeat(2_000_000) });
    expect(out.avatar.length).toBeLessThanOrEqual(1_500_000 + 21);
  });

  it('أوسمة: مكررة / مجهولة / كائنات بدون id → تنظف', () => {
    const out = S.sanitizeChild({
      badges: ['start', 'start', { id: 'trip1', at: 5 }, { noId: 1 }, 'unknown-badge', null, 42],
    });
    expect(out.badges.map((b) => b.id)).toEqual(['start', 'trip1']);
    expect(out.badges[1].at).toBe(5);
  });
});
