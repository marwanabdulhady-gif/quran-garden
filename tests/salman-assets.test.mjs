// اختبارات الأصول البصرية والصوتية لحديقة سلمان
import { describe, it, expect } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { CLIPS, CLIP_KEYS } from '../src/salman/lib/clips.js';
import { BACKGROUNDS, MASCOTS, GARDEN_MASCOT } from '../src/salman/data/art.js';
import { GARDEN_ORDER } from '../src/salman/data/gardens.js';
import { GROWTH, BADGES } from '../src/salman/lib/gamify.js';
import { sfx, SFX_NAMES } from '../src/salman/lib/sfx.js';
import { playClip, clipUrl } from '../src/salman/lib/voice.js';

const PUBLIC = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../public');

describe('المقاطع الصوتية', () => {
  it('كل مقطع له ملف MP3 غير فارغ في public/salman/audio', () => {
    for (const key of CLIP_KEYS) {
      const file = path.join(PUBLIC, 'salman/audio', CLIPS[key].file);
      expect(fs.existsSync(file), `ملف ${key}`).toBe(true);
      expect(fs.statSync(file).size).toBeGreaterThan(1000);
    }
  });

  it('لكل مقطع نص عربي يُنطق عند تعذّر الملف', () => {
    for (const key of CLIP_KEYS) {
      expect(CLIPS[key].text.length).toBeGreaterThan(10);
    }
  });

  it('مفتاح غير معروف لا يشغّل شيئًا ويعيد false', () => {
    expect(playClip('unknown-key')).toBe(false);
    expect(clipUrl('unknown-key')).toBeNull();
  });

  it('مسار المقطع يتضمن مجلد salman/audio', () => {
    expect(clipUrl('welcome')).toContain('salman/audio/welcome.mp3');
  });
});

describe('الصور والشخصيات', () => {
  it('كل خلفية وشخصية موجودة وغير فارغة', () => {
    for (const rel of [...Object.values(BACKGROUNDS), ...Object.values(MASCOTS)]) {
      const file = path.join(PUBLIC, rel);
      expect(fs.existsSync(file), rel).toBe(true);
      expect(fs.statSync(file).size).toBeGreaterThan(1000);
    }
  });

  it('لكل حديقة خلفية وشخصية دليلة', () => {
    for (const g of GARDEN_ORDER) {
      expect(BACKGROUNDS[g], `خلفية ${g}`).toBeDefined();
      expect(MASCOTS[GARDEN_MASCOT[g]], `شخصية ${g}`).toBeDefined();
    }
  });
});

describe('المؤثرات الصوتية المُولَّدة', () => {
  it('كل نمط صوتي له اسم، ويصمت بهدوء بلا AudioContext (بيئة Node)', () => {
    expect(SFX_NAMES).toEqual(expect.arrayContaining(['tap', 'correct', 'retry', 'levelUp', 'gift']));
    for (const name of SFX_NAMES) {
      expect(sfx(name)).toBe(false);
    }
    expect(sfx('missing')).toBe(false);
  });
});

describe('صور مراحل النمو', () => {
  it('كل مرحلة لها صورة موجودة وغير فارغة', () => {
    for (const stage of GROWTH) {
      const file = path.join(PUBLIC, stage.art);
      expect(fs.existsSync(file), stage.art).toBe(true);
      expect(fs.statSync(file).size, stage.art).toBeGreaterThan(1000);
    }
  });
});

describe('صور الأوسمة', () => {
  it('كل وسام له صورة موجودة وغير فارغة', () => {
    for (const b of BADGES) {
      const file = path.join(PUBLIC, b.art);
      expect(fs.existsSync(file), b.art).toBe(true);
      expect(fs.statSync(file).size, b.art).toBeGreaterThan(1000);
    }
  });
});
