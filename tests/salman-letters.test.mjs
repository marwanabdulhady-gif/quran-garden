// اختبارات المرحلتين B وC: الحرف ← الحيوان (28 حرفًا)، والأرقام 1–10، وقيود الخيارات (2 في البداية، ولا أكثر من 4).
import { describe, it, expect } from 'vitest';
import { ANIMALS } from '../src/salman/data/animals.js';
import { ARABIC_STORIES } from '../src/salman/data/stories.generated.js';
import { CATALOG, numberItems, toArabicNumeral } from '../src/salman/lib/catalog.js';

const LETTERS = ARABIC_STORIES.map((l) => l.letter);
const matchItems = CATALOG.arabic.filter((i) => i.source === 'match');

describe('المرحلة B: الحرف ← الحيوان', () => {
  it('لكل حرف من الأبجدية (28) حيوان، واسمه يبدأ بالحرف نفسه', () => {
    expect(LETTERS).toHaveLength(28);
    expect(Object.keys(ANIMALS).sort()).toEqual([...LETTERS].sort());
    for (const L of LETTERS) {
      expect(ANIMALS[L].word.startsWith(L), `${L} ← ${ANIMALS[L].word}`).toBe(true);
      expect(ANIMALS[L].emoji).toBeTruthy();
    }
  });

  it('كل حرف له عنصر مطابقة واحد، وخياراته اثنان مختلفان والصحيح بينهما', () => {
    expect(matchItems).toHaveLength(28);
    for (const it of matchItems) {
      const L = it.title.replace('الحرف ', '');
      expect(it.question.choices).toHaveLength(2);
      expect(new Set(it.question.choices).size).toBe(2);
      expect(it.question.choices).toContain(it.question.answer);
      expect(it.question.answer).toBe(`${ANIMALS[L].emoji} ${ANIMALS[L].word}`);
      expect(it.question.prompt).toContain(`«${L}»`);
    }
  });

  it('الخيار الخاطئ حيوان لحرف آخر، فلا يكون اسمه يبدأ بالحرف المطلوب', () => {
    for (const it of matchItems) {
      const L = it.title.replace('الحرف ', '');
      const wrong = it.question.choices.find((c) => c !== it.question.answer);
      const wrongWord = wrong.split(' ').slice(1).join(' ');
      expect(wrongWord.startsWith(L)).toBe(false);
    }
  });

  it('الأرقام الكاملة للعربي: 28 حرفًا × (قصتان + مطابقة) = 84 عنصرًا', () => {
    expect(CATALOG.arabic).toHaveLength(84);
  });
});

describe('المرحلة C: الأرقام 1–10', () => {
  const nums = numberItems();

  it('عشرة عناصر، كل واحد يعدّ رقمه بالضبط', () => {
    expect(nums).toHaveLength(10);
    nums.forEach((it, i) => {
      const n = i + 1;
      expect(it.question.answer).toBe(toArabicNumeral(n));
      const obj = it.paragraphs[0].split(': ')[1].split(' ')[0];
      const count = it.paragraphs[0].split(obj).length - 1;
      expect(count).toBe(n);
    });
  });

  it('خياران فقط، والثاني رقم مجاور مختلف', () => {
    nums.forEach((it) => {
      expect(it.question.choices).toHaveLength(2);
      expect(new Set(it.question.choices).size).toBe(2);
      expect(it.question.choices).toContain(it.question.answer);
    });
  });

  it('الرياضيات تضم القصص الأربع والأرقام العشرة', () => {
    expect(CATALOG.math).toHaveLength(14);
    expect(CATALOG.math.filter((i) => i.source === 'count')).toHaveLength(10);
  });
});

describe('قيود الخيارات لكل العناصر (سلامة عامة)', () => {
  it('كل عنصر بين خيارين و4 خيارات على الأكثر', () => {
    for (const garden of Object.keys(CATALOG)) {
      for (const it of CATALOG[garden]) {
        expect(it.question.choices.length).toBeGreaterThanOrEqual(2);
        expect(it.question.choices.length).toBeLessThanOrEqual(4);
      }
    }
  });
});
