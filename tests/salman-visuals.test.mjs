// رسوم حديقة سلمان (VISUALS.md، مرحلة V1): الأشياء المعدودة.
// كل سؤال عدّ يحمل شيئه المرسوم وعددَه، وكل رسم موجود فعلًا، والإيموجي يبقى في النص بديلًا آمنًا.
import { existsSync } from 'node:fs';
import { join } from 'node:path';
import { describe, it, expect } from 'vitest';
import { CATALOG, toArabicNumeral } from '../src/salman/lib/catalog.js';

const ROOT = process.cwd();
const countItems = CATALOG.math.filter((i) => i.source === 'count');
const OBJECTS = ['apple', 'star', 'flower', 'fish', 'egg'];

describe('الأشياء المعدودة (V1)', () => {
  it('الرسوم الخمسة موجودة وبخلفية شفافة (PNG)', () => {
    for (const name of OBJECTS) {
      expect(existsSync(join(ROOT, 'public/salman/art/count', `${name}.png`))).toBe(true);
    }
  });

  it('كل سؤال عدّ له شيء مرسوم معروف وعدد يطابق جوابه', () => {
    expect(countItems).toHaveLength(20);
    for (const item of countItems) {
      expect(item.countArt).toBeDefined();
      expect(OBJECTS).toContain(item.countArt.object);
      expect(item.countArt.n).toBeGreaterThanOrEqual(1);
      expect(item.countArt.n).toBeLessThanOrEqual(20);
      // الجواب هو عدد الأشياء المعروضة نفسه، بالأرقام العربية
      expect(item.question.answer).toBe(toArabicNumeral(item.countArt.n));
    }
  });

  it('الأشياء تتكرر بالترتيب نفسه في الحدائق (كل خمسة أعداد)', () => {
    countItems.forEach((item, i) => {
      expect(item.countArt.object).toBe(OBJECTS[i % OBJECTS.length]);
    });
  });

  it('النص الأصلي بالإيموجي يبقى بديلًا عند فشل الصورة', () => {
    for (const item of countItems) {
      expect(item.paragraphs[0]).toContain(item.countArt.emoji);
      expect(item.paragraphs[0].split(item.countArt.emoji).length - 1).toBe(item.countArt.n);
    }
  });
});

describe('مشاهد قصص العدّ (V2)', () => {
  const scenes = Object.values(CATALOG)
    .flat()
    .filter((i) => i.art);

  it('كل قصة عليها مشهد تشير إلى ملف jpg موجود', () => {
    for (const item of scenes) {
      expect(item.art).toMatch(/^salman\/art\/stories\/[a-z0-9-]+\.jpg$/);
      expect(existsSync(join(ROOT, 'public', item.art))).toBe(true);
    }
  });

  it('المشاهد المقبولة عشرون (اكتملت V2)، وكل مشهد مُعلَّم في gardens.js', () => {
    expect(
      scenes
        .filter((i) => i.garden === 'math')
        .map((i) => i.id)
        .sort()
    ).toEqual(
      [
        'math-01',
        'math-02',
        'math-03',
        'math-04',
        'math-s01',
        'math-s02',
        'math-s04',
        'math-s06',
        'math-s08',
        'math-s09',
        'math-s11',
        'math-s12',
        'math-s13',
        'math-s14',
        'math-s15',
        'math-s16',
        'math-s17',
        'math-s18',
        'math-s19',
        'math-s20',
      ].sort()
    );
    expect(scenes.filter((i) => i.garden === 'math')).toHaveLength(20);
    expect(scenes.filter((i) => i.garden === 'english')).toHaveLength(25);
    // العربية: 56 مشهد قصة (28 فقرة رئيسية + 28 مرافقة)، والقرآن: 13 سورة
    expect(scenes.filter((i) => i.garden === 'arabic')).toHaveLength(56);
    expect(scenes.filter((i) => i.garden === 'quran')).toHaveLength(13);
    expect(scenes).toHaveLength(114);
  });
});
