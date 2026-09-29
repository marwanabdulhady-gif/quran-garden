// سلامة بيانات جسر المعاني (P4-27):
// لو اتعدّل data.js أو juz30.js وانفصلوا عن بعض — الاختبار بيفشل فورًا
import { describe, it, expect } from 'vitest';

const D = await import('../src/data.js');
const T = await import('../src/text.js');
// النص المدمج الموحد: جزء قد سمع + تبارك (juz28-29) + جزء عمّ (juz30) — ٥٨–١١٤
const J = { ...(await import('../src/juz28-29.js')).JUZ28_29, ...(await import('../src/juz30.js')).JUZ30 };

// الجولات الأربع (P8): عمّ (جولتان) + تبارك + قد سمع — 50 كلمة في 10 رحلات
const ALL = [...D.WORDS, ...(D.WORDS_R2 || []), ...(D.WORDS_R3 || []), ...(D.WORDS_R4 || [])];
const ALL_TRIPS = [...D.TRIPS, ...(D.TRIPS_R2 || []), ...(D.TRIPS_R3 || []), ...(D.TRIPS_R4 || [])];

describe('كل كلمات الجسر (30 في الجولتين) اتلقت في آيتها بالضبط', () => {
  for (const w of ALL) {
    it(`${w.id} (${w.word}) موجودة في سورة ${w.surah}:${w.ayahNum}`, () => {
      const ayah = J[w.surah]?.[w.ayahNum - 1];
      expect(ayah, `سورة ${w.surah} الآية ${w.ayahNum} موجودة في الجزء المدمج`).toBeTruthy();
      // مطابقة كاملة: الكلمة (بعد تطبيع التشكيل) جزء من الآية + التظليل بيلاقيها
      expect(T.matchForm(ayah).includes(T.matchForm(w.word)), 'نص الآية فيه الكلمة (بعد التطبيع)').toBe(true);
      expect(T.splitWord(ayah, w.word).found, 'splitWord بيلاقي الكلمة في الآية').toBe(true);
    });
  }

  it('كل كلمة مظلمة تظليلًا صحيحًا (عادي + خط واضح)', () => {
    let all = 0;
    for (const w of ALL) {
      if (T.splitWord(w.ayah, w.word).found && T.splitWord(w.ayah, w.word, true).found) all++;
    }
    expect(all).toBe(ALL.length);
  });

  it('كلمة الآية نفسها هي اللي في data.js (بعد تطبيع التشكيل/الإملاء)', () => {
    for (const w of ALL) {
      const ayah = J[w.surah][w.ayahNum - 1];
      const r = T.splitWord(ayah, w.word);
      expect(r.found, w.id).toBe(true);
      // النص العثماني ليتهجئات (إ/ى، ا/ٱ، آ/ائ) — التطبيع بيظبطها
      expect(T.matchForm(r.mid), w.id).toBe(T.matchForm(w.word));
    }
  });
});

describe('بنية بيانات الجسر', () => {
  it('50 كلمة بدون تكرار id (الجولات الأربع)', () => {
    expect(ALL).toHaveLength(50);
    expect(new Set(ALL.map((w) => w.id)).size).toBe(50);
    expect(D.WORDS).toHaveLength(20);
    expect(D.WORDS_R2).toHaveLength(10);
    expect(D.WORDS_R3).toHaveLength(10);
    expect(D.WORDS_R4).toHaveLength(10);
  });

  it('10 رحلات × 5 كلمات = كل الكلمات مرة واحدة (الجولات الأربع)', () => {
    const ids = ALL_TRIPS.flatMap((t) => t.words);
    expect(ids).toHaveLength(50);
    expect(new Set(ids).size).toBe(50);
    expect(ALL_TRIPS).toHaveLength(10);
    for (const t of ALL_TRIPS) {
      expect(t.words, `الرحلة ${t.id}`).toHaveLength(5);
      expect(t.accent, `الرحلة ${t.id} عندها accent`).toMatch(/^#/);
      expect(t.soft, `الرحلة ${t.id} عندها soft`).toMatch(/^#/);
      expect(t.confetti, `الرحلة ${t.id} عندها ألوان قصاصات`).toBeInstanceOf(Array);
    }
  });

  it('كل كلمة ليها معنى + خطاين غلطان مختلفين', () => {
    for (const w of ALL) {
      expect(w.meaning.length, w.id).toBeGreaterThan(3);
      expect(w.wrong, w.id).toHaveLength(2);
      expect(w.wrong[0]).not.toBe(w.wrong[1]);
      expect(w.wrong[0]).not.toBe(w.meaning);
      expect(w.wrong[1]).not.toBe(w.meaning);
    }
  });

  it('بطاقات التأمل الأربع سليمة (P5-34)', () => {
    expect(D.TAFAKKUR).toHaveLength(4);
    expect(new Set(D.TAFAKKUR.map((c) => c.id)).size).toBe(4);
    for (const c of D.TAFAKKUR) {
      expect(c.surah).toBeGreaterThanOrEqual(1);
      expect(c.surah).toBeLessThanOrEqual(114);
      expect(c.ayahNum).toBeGreaterThanOrEqual(1);
      expect(c.title.length).toBeGreaterThan(3);
      expect(c.question.length).toBeGreaterThan(5);
      expect(c.meaning.length).toBeGreaterThan(10);
    }
  });

  it('pickTafakkur: ثابتة طول الأسبوع وبتتبدّل بين الأسابيع', () => {
    const week = D.pickTafakkur(new Date('2026-09-21')); // أسبوع 39
    expect(D.pickTafakkur(new Date('2026-09-25'))).toBe(week); // نفس الأسبوع
    expect(D.pickTafakkur(new Date('2026-09-28'))).not.toBe(week); // أسبوع 40
    const today = D.pickTafakkur(new Date());
    expect(D.TAFAKKUR.map((c) => c.id)).toContain(today.id);
  });

  it('كلمات الجولات الأربع من الأجزاء الصح: عمّ (78–114) وتبارك (67–77) وقد سمع (58–66)', () => {
    expect(D.WORDS_R3.every((w) => w.surah >= 67 && w.surah <= 77)).toBe(true); // تبارك
    expect(D.WORDS_R4.every((w) => w.surah >= 58 && w.surah <= 66)).toBe(true); // قد سمع
    for (const w of ALL) {
      expect(w.surah, w.id).toBeGreaterThanOrEqual(58);
      expect(w.surah, w.id).toBeLessThanOrEqual(114);
      expect(w.ayahNum, w.id).toBeGreaterThanOrEqual(1);
      expect(w.ayahNum, w.id).toBeLessThanOrEqual(J[w.surah].length);
    }
  });

  it('كل رحلة من العشر ليها مشهد مرسوم (img)', () => {
    for (const t of ALL_TRIPS) expect(t.img, `الرحلة ${t.id}`).toMatch(/^\/assets\/trip-.*\.jpg$/);
  });

  it('زينة الحديقة: ٨ قطع ليها صور مرسومة شفافة (P6-41)', () => {
    expect(D.DECOR).toHaveLength(8);
    expect(new Set(D.DECOR.map((x) => x.id)).size).toBe(8);
    for (const x of D.DECOR) {
      expect(x.img, x.id).toMatch(/^\/assets\/decor-[a-z]+-t\.png$/);
      expect(x.name.length, x.id).toBeGreaterThan(2);
      expect(x.desc.length, x.id).toBeGreaterThan(5);
    }
  });

  it('ترتيب البوابات: عمّ أولًا ثم تبارك ثم قد سمع (ترتيب الرحلة)', () => {
    expect(D.GATES[0].id).toBe('amma');
    expect(D.GATES[1].id).toBe('tabarak');
    expect(D.GATES[2].id).toBe('qadsama');
  });

  it('البوابات الثلاث بتغطي ٥٨–١١٤ متصلة بدون فجوات أو تداخل (بوابة جزء عمّ)', () => {
    expect(D.GATES.length).toBeGreaterThanOrEqual(3);
    const amma = D.GATES.find((g) => g.id === 'amma');
    expect(amma).toBeTruthy();
    expect(amma.from).toBe(78);
    expect(amma.to).toBe(114);
    // المدى مرتب ومتصلة: من أول from لآخر to ما فيش رقم سورة برّه بوابة
    const ranges = [...D.GATES].sort((a, b) => a.from - b.from);
    let expected = ranges[0].from;
    for (const g of ranges) {
      expect(g.from, g.id).toBe(expected);
      expect(g.to, g.id).toBeGreaterThanOrEqual(g.from);
      expected = g.to + 1;
    }
    expect(expected).toBe(115); // ٥٨ → ١١٤ كاملة
    // كل بوابة ليها لافتة مرسومة
    for (const g of D.GATES) expect(g.img).toMatch(/^\/assets\/gate-.*\.(jpg|png)$/);
  });

  it('SURAH_META مطابقة للنص المدمج لجزء عمّ (عدد آيات كل سورة ٧٨–١١٤)', () => {
    for (const n of Object.keys(J).map(Number)) {
      expect(D.SURAH_META[n], 'سورة ' + n).toBe(J[n].length);
    }
    expect(Object.keys(D.SURAH_META).length).toBe(57); // ٥٨–١١٤
    expect(D.JOURNEY_TOTAL_AYAHS).toBe(1132); // ٥٦٨ (تبارك+قد سمع) + ٥٦٤ (عمّ)
  });
});
