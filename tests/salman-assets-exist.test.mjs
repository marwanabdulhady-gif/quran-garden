// كل صورة وصوت تشير إليه حديقة سلمان موجود في المستودع وغير فارغ.
// يجمع الإحالات من البيانات نفسها (لا من قائمة يدوية) حتى لا تنحرف الاختبارات عن الكود.
import { describe, it, expect } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { CLIPS } from '../src/salman/lib/clips.js';
import * as ART from '../src/salman/data/art.js';
import { ANIMALS } from '../src/salman/data/animals.js';
import { MATH_STORIES, ENGLISH_STORIES } from '../src/salman/data/gardens.js';
import { GROWTH, BADGES, GIFTS } from '../src/salman/lib/gamify.js';
import { CATALOG } from '../src/salman/lib/catalog.js';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const PUBLIC = path.join(ROOT, 'public');

// كل الإحالات إلى ملفات الصور والصوت، بالمسار داخل public/
function collectReferences() {
  const refs = new Set();
  const walk = (value) => {
    if (typeof value === 'string') {
      if (/\.(png|jpg|mp3)$/.test(value)) refs.add(value.replace(/^\//, ''));
    } else if (Array.isArray(value)) value.forEach(walk);
    else if (value && typeof value === 'object') Object.values(value).forEach(walk);
  };
  walk(ART);
  walk(GROWTH);
  walk(BADGES);
  walk(GIFTS);
  for (const clip of Object.values(CLIPS)) refs.add(`salman/audio/${clip.file}`);
  for (const a of Object.values(ANIMALS)) refs.add(`salman/art/animals/${a.slug}.png`);
  for (let i = 1; i <= 28; i++) refs.add(`salman/audio/letters/letter-${String(i).padStart(2, '0')}.mp3`);
  for (const m of MATH_STORIES) if (m.clip) refs.add(`salman/audio/stories/${m.id}.mp3`);
  for (const e of ENGLISH_STORIES) if (e.clip) refs.add(`salman/audio/stories/${e.id}.mp3`);
  for (const item of CATALOG.math) if (item.countArt) refs.add(`salman/art/count/${item.countArt.object}.png`);
  for (const item of CATALOG.math) if (item.art) refs.add(item.art);
  for (const item of [...CATALOG.arabic, ...CATALOG.math, ...CATALOG.english]) {
    if (item.audio) refs.add(`salman/audio/${item.audio}.mp3`);
  }
  // أيقونات التطبيق المثبّت (manifest الموقع في vite.config.js)
  const config = fs.readFileSync(path.join(PUBLIC, '..', 'vite.config.js'), 'utf8');
  for (const m of config.matchAll(/src: '(salman\/icons\/[^']+)'/g)) refs.add(m[1]);
  // صوت لعبة «مغامرة الحروف»
  for (const f of fs.readdirSync(path.join(PUBLIC, 'huroof', 'audio'))) refs.add(`huroof/audio/${f}`);
  return [...refs].sort();
}

describe('كل أصول حديقة سلمان المُشار إليها موجودة', () => {
  const refs = collectReferences();

  it('عدد الإحالات معقول (لا قائمة فارغة بسبب خطأ في الجمع)', () => {
    expect(refs.length).toBeGreaterThan(140);
  });

  it('كل ملف مُشار إليه موجود في public/ وحجمه أكبر من 1 KB', () => {
    const problems = [];
    for (const ref of refs) {
      const file = path.join(PUBLIC, ref);
      if (!fs.existsSync(file)) problems.push(`مفقود: ${ref}`);
      else if (fs.statSync(file).size < 1000) problems.push(`فارغ أو صغير جدًا: ${ref}`);
    }
    expect(problems).toEqual([]);
  });

  it('الحروف الـ28 لكل منها صورة ومقطع', () => {
    expect(Object.keys(ANIMALS)).toHaveLength(28);
    for (const a of Object.values(ANIMALS)) {
      expect(a.art).toBe(true);
      expect(a.clip).toBe(true);
    }
  });
});
