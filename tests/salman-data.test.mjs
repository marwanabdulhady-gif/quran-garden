// سلامة بيانات حديقة سلمان: السور والمستويات، القصص، الأسئلة
import { describe, it, expect } from 'vitest';
import { JUZ30 } from '../src/juz30.js';
import { SURAHS, QURAN_LEVELS, SURAH_STORIES } from '../src/salman/data/quran.js';
import { ARABIC_STORIES } from '../src/salman/data/stories.generated.js';
import { MATH_STORIES, ENGLISH_STORIES, GARDEN_ORDER } from '../src/salman/data/gardens.js';
import { CATALOG } from '../src/salman/lib/catalog.js';

describe('السور والمستويات (الاقتراح §3)', () => {
  it('المستويات الثلاثة تغطي الفاتحة و103–114 مرة واحدة بالضبط', () => {
    const all = QURAN_LEVELS.flatMap((l) => l.surahs);
    expect(all.length).toBe(13);
    expect(new Set(all).size).toBe(13);
    const expected = [1, ...Array.from({ length: 12 }, (_, i) => 103 + i)].sort((a, b) => a - b);
    expect([...all].sort((a, b) => a - b)).toEqual(expected);
  });

  it('عدد الآيات لكل سورة مطابق لـ src/juz30.js (والفاتحة 7 آيات)', () => {
    for (const sid of Object.keys(SURAHS).map(Number)) {
      const s = SURAHS[sid];
      if (sid === 1) {
        expect(s.ayahs).toBe(7);
        continue;
      }
      expect(JUZ30[sid], `juz30 يحتوي السورة ${sid}`).toBeDefined();
      expect(JUZ30[sid].length, `آيات السورة ${sid}`).toBe(s.ayahs);
    }
  });

  it('لكل سورة قصة قصيرة غير فارغة', () => {
    for (const sid of Object.keys(SURAHS).map(Number)) {
      expect(SURAH_STORIES[sid].length).toBeGreaterThan(40);
    }
  });
});

describe('قصص العربية (من الكتابين)', () => {
  it('28 حرفًا بالترتيب الهجائي، ولكل حرف قصة واحدة على الأقل', () => {
    expect(ARABIC_STORIES.length).toBe(28);
    for (const L of ARABIC_STORIES) {
      expect(L.stories.length, `قصص ${L.letter}`).toBeGreaterThanOrEqual(1);
    }
  });

  it('معرّفات القصص فريدة، وكل قصة فيها فقرات نصية', () => {
    const ids = ARABIC_STORIES.flatMap((L) => L.stories.map((s) => s.id));
    expect(new Set(ids).size).toBe(ids.length);
    for (const L of ARABIC_STORIES) {
      for (const st of L.stories) {
        expect(st.paragraphs.length).toBeGreaterThan(0);
        expect(st.paragraphs.join(' ').length).toBeGreaterThan(200);
      }
    }
  });
});

describe('قصص الرياضيات والإنجليزية', () => {
  it('كل قصة رياضيات عدّها ضمن 1–20 وسؤالها له خياران صحيحان', () => {
    for (const m of MATH_STORIES) {
      expect(m.count).toBeGreaterThanOrEqual(1);
      expect(m.count).toBeLessThanOrEqual(20);
    }
    for (const item of CATALOG.math) {
      expect(item.question.choices).toHaveLength(2);
      expect(item.question.choices).toContain(item.question.answer);
    }
  });

  it('كل قصة إنجليزية تدرّب صوتًا، والصوت ضمن الخيارات', () => {
    expect(ENGLISH_STORIES.length).toBeGreaterThanOrEqual(6);
    for (const e of ENGLISH_STORIES) {
      expect(e.choices).toContain(e.sound);
      expect(e.choices).toHaveLength(2);
    }
  });
});

describe('الكتالوج وزيارة اليوم', () => {
  it('كل عنصر له خياران (لا أكثر من 4) وجوابه بين الخيارات', () => {
    for (const garden of GARDEN_ORDER) {
      for (const item of CATALOG[garden]) {
        expect(item.question.choices.length).toBeGreaterThanOrEqual(2);
        expect(item.question.choices.length).toBeLessThanOrEqual(4);
        expect(item.question.choices).toContain(item.question.answer);
      }
    }
  });

  it('معرّفات كل العناصر فريدة عبر الحدائق', () => {
    const ids = GARDEN_ORDER.flatMap((g) => CATALOG[g].map((i) => i.id));
    expect(new Set(ids).size).toBe(ids.length);
  });
});
