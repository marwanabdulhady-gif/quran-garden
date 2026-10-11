// قصص حديقة سلمان: تغطية الأرقام 1–20 مرة واحدة، ومعرّفات فريدة، وأصوات الفونيكس ضمن الخيارات،
// وكل قصة مسجّلة (clip: true) لها ملف mp3 فعلًا. القصص غير المسجّلة لا تحمل مفتاح audio فتُقرأ بالتوليد.
import { existsSync } from 'node:fs';
import { join } from 'node:path';
import { describe, it, expect } from 'vitest';
import { MATH_STORIES, ENGLISH_STORIES } from '../src/salman/data/gardens.js';
import { CATALOG } from '../src/salman/lib/catalog.js';

const ROOT = process.cwd();

describe('قصص الرياضيات: الأرقام 1–20', () => {
  it('كل رقم من 1 إلى 20 له قصة واحدة بالضبط', () => {
    const counts = MATH_STORIES.map((m) => m.count).sort((a, b) => a - b);
    expect(counts).toEqual(Array.from({ length: 20 }, (_, i) => i + 1));
  });

  it('معرّفات قصص الرياضيات فريدة', () => {
    const ids = MATH_STORIES.map((m) => m.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('كل قصة رياضيات فيها نص غير فارغ وعنوان', () => {
    for (const m of MATH_STORIES) {
      expect(m.title.trim().length).toBeGreaterThan(0);
      expect(m.text.trim().length).toBeGreaterThan(20);
    }
  });

  it('كل قصة رياضيات مسجّلة لها مقطع mp3 موجود، وغير المسجّلة بلا مفتاح audio', () => {
    for (const m of MATH_STORIES) {
      if (m.clip) {
        expect(existsSync(join(ROOT, 'public/salman/audio/stories', `${m.id}.mp3`))).toBe(true);
      }
    }
    for (const m of MATH_STORIES.filter((x) => !x.clip)) {
      const found = CATALOG.math.find((i) => i.id === m.id);
      expect(found).toBeDefined();
      expect(found.audio).toBeUndefined();
    }
  });
});

describe('قصص الإنجليزية: الفونيكس', () => {
  it('كل صوت مكتوب مرة واحدة فقط', () => {
    const sounds = ENGLISH_STORIES.map((e) => e.sound);
    expect(new Set(sounds).size).toBe(sounds.length);
  });

  it('كل قصة تدرّب صوتًا، والصوت ضمن خيارين بالضبط', () => {
    for (const e of ENGLISH_STORIES) {
      expect(e.choices).toHaveLength(2);
      expect(e.choices).toContain(e.sound);
    }
  });

  it('معرّفات قصص الإنجليزية فريدة', () => {
    const ids = ENGLISH_STORIES.map((e) => e.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('كل قصة إنجليزية مسجّلة لها مقطع mp3 موجود، وغير المسجّلة بلا مفتاح audio', () => {
    for (const e of ENGLISH_STORIES) {
      if (e.clip) {
        expect(existsSync(join(ROOT, 'public/salman/audio/stories', `${e.id}.mp3`))).toBe(true);
      }
    }
    for (const e of ENGLISH_STORIES.filter((x) => !x.clip)) {
      const found = CATALOG.english.find((i) => i.id === e.id);
      expect(found).toBeDefined();
      expect(found.audio).toBeUndefined();
    }
  });
});

describe('قصص الحروف العربية: مسودة حتى التدقيق', () => {
  it('كل قصة حرف عربية مُعلَّمة draft، لأن النصوص لم تُدقَّق بعد', () => {
    const arabicStories = CATALOG.arabic.filter((i) => i.source === 'companions' || i.source === 'prophet');
    expect(arabicStories).toHaveLength(56);
    for (const s of arabicStories) expect(s.draft).toBe(true);
  });
});
