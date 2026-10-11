import { describe, it, expect } from 'vitest';
import { LEVELS, LEVEL_DATA, ANIMALS, ALL_LETTERS } from '../src/data/index.js';
import { initialLetter } from '../src/game/logic.js';

// الأبجدية العربية (28 حرفًا) — الشكل المنفرد الذي يُعرض للطفل
const ARABIC_ALPHABET = [
  'أ',
  'ب',
  'ت',
  'ث',
  'ج',
  'ح',
  'خ',
  'د',
  'ذ',
  'ر',
  'ز',
  'س',
  'ش',
  'ص',
  'ض',
  'ط',
  'ظ',
  'ع',
  'غ',
  'ف',
  'ق',
  'ك',
  'ل',
  'م',
  'ن',
  'ه',
  'و',
  'ي',
];

describe('محتوى اللعبة', () => {
  it('7 مستويات بالظبط', () => {
    expect(LEVELS).toHaveLength(7);
    expect(LEVEL_DATA.map((l) => l.id)).toEqual([1, 2, 3, 4, 5, 6, 7]);
  });

  it('كل مستوى فيه 4 أزواج بالظبط', () => {
    LEVEL_DATA.forEach((level) => {
      expect(level.letters).toHaveLength(4);
      expect(level.pairs).toHaveLength(4);
    });
  });

  it('الـ 28 حرف كلهم موجودين مرة واحدة بالظبط (الأبجدية كاملة)', () => {
    expect(ALL_LETTERS).toHaveLength(28);
    expect(new Set(ALL_LETTERS).size).toBe(28);
    expect([...ALL_LETTERS].sort()).toEqual([...ARABIC_ALPHABET].sort());
  });

  it('كل اسم حيوان بيبدأ بنفس الحرف اللي اتحط معاه (تحقق آلي)', () => {
    LEVEL_DATA.forEach((level) => {
      level.pairs.forEach((pair) => {
        expect(initialLetter(pair.word), `${pair.word} لازم يبدأ بـ ${pair.letter}`).toBe(pair.letter);
      });
    });
  });

  it('أسماء الحيوانات مختلفة ومفيش اسم فاضي', () => {
    const words = Object.values(ANIMALS).map((a) => a.word);
    expect(new Set(words).size).toBe(words.length);
    words.forEach((w) => expect(w.trim().length).toBeGreaterThan(1));
  });

  it('كل حيوان ليه إيموجي احتياطي', () => {
    Object.values(ANIMALS).forEach((a) => expect(a.emoji.length).toBeGreaterThan(0));
  });

  it('الكلمات من غير تشكيل (عشان المطابقة بالحرف الأول تبقى صح)', () => {
    Object.values(ANIMALS).forEach((a) => {
      expect(a.word).not.toMatch(/[\u064B-\u065F\u0670]/);
    });
  });

  it('عنوان ووصف كل مستوى موجودين', () => {
    LEVELS.forEach((l) => {
      expect(l.title.length).toBeGreaterThan(3);
      expect(l.goal.length).toBeGreaterThan(3);
    });
  });
});

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { ILLUSTRATED, artPathFor } from '../src/data/levels.js';

const PUBLIC_DIR = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', 'public');

describe('الرسومات المولّدة', () => {
  it('كل حيوان ليه slug فريد (اسم الملف)', () => {
    const slugs = Object.values(ANIMALS).map((a) => a.slug);
    expect(slugs.every((s) => /^[a-z]+$/.test(s))).toBe(true);
    expect(new Set(slugs).size).toBe(slugs.length);
  });

  it('كل رسمة مسجلة في ILLUSTRATED موجودة فعلًا كـ PNG شفاف 384px', () => {
    ILLUSTRATED.forEach((slug) => {
      const file = path.join(PUBLIC_DIR, 'media', 'animals', `${slug}.png`);
      expect(fs.existsSync(file), `${file} مفقود`).toBe(true);
      const head = fs.readFileSync(file).subarray(0, 24);
      // PNG signature + IHDR width/height (big-endian)
      expect(head.subarray(1, 4).toString('ascii')).toBe('PNG');
      expect(head.readUInt32BE(16)).toBe(384);
      expect(head.readUInt32BE(20)).toBe(384);
    });
  });

  it('الحيوانات اللي ليس لها رسمة بتاخد image=null (fallback للإيموجي)', () => {
    LEVEL_DATA.flatMap((l) => l.pairs).forEach((p) => {
      const slug = Object.values(ANIMALS).find((a) => a.word === p.word).slug;
      expect(p.image).toBe(artPathFor(slug));
      if (!ILLUSTRATED.has(slug)) expect(p.image).toBeNull();
    });
  });
});
