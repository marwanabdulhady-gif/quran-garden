// سلامة بيانات جسر المعاني (P4-27):
// لو اتعدّل data.js أو juz30.js وانفصلوا عن بعض — الاختبار بيفشل فورًا
import { describe, it, expect } from 'vitest';

const D = await import('../src/data.js');
const T = await import('../src/text.js');
const J = (await import('../src/juz30.js')).JUZ30;

// الجولة الثانية (P5-31): الجولتين مع بعض — 30 كلمة في 6 رحلات
const ALL = [...D.WORDS, ...(D.WORDS_R2 || [])];
const ALL_TRIPS = [...D.TRIPS, ...(D.TRIPS_R2 || [])];

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
  it('30 كلمة بدون تكرار id (الجولتين)', () => {
    expect(ALL).toHaveLength(30);
    expect(new Set(ALL.map((w) => w.id)).size).toBe(30);
    expect(D.WORDS).toHaveLength(20);
    expect(D.WORDS_R2).toHaveLength(10);
  });

  it('6 رحلات × 5 كلمات = كل الكلمات مرة واحدة (الجولتين)', () => {
    const ids = ALL_TRIPS.flatMap((t) => t.words);
    expect(ids).toHaveLength(30);
    expect(new Set(ids).size).toBe(30);
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

  it('كل سورة في السور 78–114 (جزء عمّ)', () => {
    for (const w of ALL) {
      expect(w.surah, w.id).toBeGreaterThanOrEqual(78);
      expect(w.surah, w.id).toBeLessThanOrEqual(114);
      expect(w.ayahNum, w.id).toBeGreaterThanOrEqual(1);
      expect(w.ayahNum, w.id).toBeLessThanOrEqual(J[w.surah].length);
    }
  });
});
