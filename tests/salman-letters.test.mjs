// اختبارات المرحلتين B وC: الحرف ← الحيوان (28 حرفًا)، والأرقام 1–10، وقيود الخيارات (2 في البداية، ولا أكثر من 4).
import { existsSync } from 'node:fs';
import { join } from 'node:path';
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

describe('المرحلة C: الأرقام 1–20', () => {
  const nums = numberItems();

  it('عشرون عنصرًا، كل واحد يعدّ رقمه بالضبط', () => {
    expect(nums).toHaveLength(20);
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
    expect(CATALOG.math).toHaveLength(24);
    expect(CATALOG.math.filter((i) => i.source === 'count')).toHaveLength(20);
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

describe('أصول الحروف الجاهزة (رسوم ومقاطع)', () => {
  const pub = (rel) => join(process.cwd(), 'public', rel);

  it('الصورة على الخيار إذا وُجد حيوانه بعلم الرسم، ويجب أن يكون الملف موجودًا', () => {
    const artLetters = Object.keys(ANIMALS).filter((k) => ANIMALS[k].art);
    for (const it of matchItems) {
      const art = it.question.choiceArt || {};
      for (const choice of it.question.choices) {
        const letter = Object.keys(ANIMALS).find((k) => `${ANIMALS[k].emoji} ${ANIMALS[k].word}` === choice);
        if (artLetters.includes(letter)) {
          expect(art[choice], `${letter} art`).toBeTruthy();
          expect(existsSync(pub(art[choice])), art[choice]).toBe(true);
        } else {
          expect(art[choice], `${letter} no art`).toBeUndefined();
        }
      }
    }
  });

  it('كل حرف معلَّم بالمقطع يملك ملف المقطع، وغيره بلا مقطع', () => {
    for (const it of matchItems) {
      const L = it.title.replace('الحرف ', '');
      if (ANIMALS[L].clip) {
        expect(it.audio, `${L} audio`).toMatch(/^letters\/letter-\d{2}$/);
        expect(existsSync(pub(`salman/audio/${it.audio}.mp3`)), it.audio).toBe(true);
      } else {
        expect(it.audio).toBeUndefined();
      }
    }
  });

  it('كل الحروف الـ 28 معلَّمة بالرسم والمقطع، وكل ملفات الرسوم والمقاطع موجودة', () => {
    const ready = Object.keys(ANIMALS).filter((k) => ANIMALS[k].art && ANIMALS[k].clip);
    expect(ready).toHaveLength(28);
    for (const L of ready) {
      expect(existsSync(pub(`salman/art/animals/${ANIMALS[L].slug}.png`)), ANIMALS[L].slug).toBe(true);
      expect(
        existsSync(pub(`salman/audio/letters/letter-${String(LETTERS.indexOf(L) + 1).padStart(2, '0')}.mp3`)),
        L
      ).toBe(true);
    }
  });
});
