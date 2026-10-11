// «حدائق النور»: سلامة المحتوى ومنطق يوم الوحدة (سبع خطوات) وتسجيل النجوم.
import { describe, it, expect } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { NOUR_UNITS, NOUR_ORDER, DAY_STEPS, REVIEW, gardenUnits, nourUnit } from '../src/salman/data/nour.js';
import {
  dayPlan,
  storyFor,
  huntTargets,
  huntDone,
  huntTap,
  trainCorrect,
  trainComplete,
  boxesCorrect,
  scramble,
  dayFinished,
  dayProgress,
  nextStep,
  unitCompleted,
  completedCount,
  nextUnit,
} from '../src/salman/lib/letterday.js';
import { createState, normalizeState, recordDay, SCHEMA_VERSION } from '../src/salman/lib/gamify.js';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const PUBLIC = path.join(ROOT, 'public');
const UNITS = Object.values(NOUR_UNITS);

describe('حدائق النور — المحتوى', () => {
  it('المحطة الأولى 4 وحدات لكل حديقة، وحروف P3 تُضاف بترتيب الألفباء', () => {
    // الألفباء: الدفعة الأولى (أ ب) ثم P3 (ت ث ج ح) ثم بقية الطيار (د م)
    expect(gardenUnits('arabic').map((u) => u.letter)).toEqual(['أ', 'ب', 'ت', 'ث', 'ج', 'ح', 'د', 'م']);
    expect(gardenUnits('math').map((u) => u.n)).toEqual([1, 2, 3, 4]);
    expect(gardenUnits('english').map((u) => u.sound)).toEqual(['s', 'a', 't', 'i']);
    expect(UNITS).toHaveLength(16);
    expect(NOUR_ORDER.arabic).toHaveLength(8);
    // ترتيب «اليوم التالي» يتبع الألفباء دائمًا
    const seq = 'أبتثجحخدذرزسشصضطظعغفقكلمنهوي';
    const letters = gardenUnits('arabic').map((u) => u.letter);
    expect(letters).toEqual([...letters].sort((a, b) => seq.indexOf(a) - seq.indexOf(b)));
  });

  it('كل وحدة فيها عناصر الطريقة السبعة: قصة، حركة، نشيد، صيد، تتبّع، لعبة، عمل', () => {
    for (const u of UNITS) {
      expect(u.id, 'id').toBeTruthy();
      expect(['arabic', 'math', 'english']).toContain(u.garden);
      expect(u.keyWord, u.id).toBeTruthy();
      expect(u.action?.text, u.id).toBeTruthy();
      expect(u.chant?.lines?.length, u.id).toBe(2);
      expect(u.chant?.text, u.id).toBeTruthy();
      expect(u.trace?.glyph, u.id).toBeTruthy();
      expect(['ar', 'en', 'num']).toContain(u.trace.script);
      expect(u.hunt?.items?.length, u.id).toBeGreaterThanOrEqual(4);
      expect(u.train?.tiles?.length, u.id).toBeGreaterThanOrEqual(2);
      expect(u.boxes?.tiles?.length, u.id).toBeGreaterThanOrEqual(1);
      expect(['train', 'boxes']).toContain(u.play);
      expect(u.deed?.text, u.id).toBeTruthy();
      expect(u.stories?.length, u.id).toBeGreaterThanOrEqual(1);
    }
  });

  it('العربية: لكل حرف قصتان (النبي ﷺ والصحابة) إلا ما هو موثّق', () => {
    for (const u of gardenUnits('arabic')) {
      expect(u.stories, u.id).toHaveLength(2);
      expect(u.stories[0].from).toBe('prophet');
      expect(u.stories[1].from).toBe('companions');
    }
  });

  it('كل قصة لها مصدر، وحالة مراجعة من القاموس', () => {
    for (const u of UNITS) {
      for (const s of u.stories) {
        expect(s.id, u.id).toBeTruthy();
        expect(s.text.length, s.id).toBeGreaterThan(80);
        expect(s.ref, s.id).toBeTruthy();
        expect(Object.values(REVIEW)).toContain(s.review);
      }
    }
  });

  it('صيد الصوت: في كل جولة أهداف صحيحة ومشتّتات، والعدد معقول', () => {
    for (const u of UNITS) {
      const items = u.hunt.items;
      const correct = items.filter((i) => i.correct).length;
      expect(correct, u.id).toBeGreaterThanOrEqual(2);
      expect(items.length - correct, u.id).toBeGreaterThanOrEqual(1);
      expect(huntTargets(u.hunt), u.id).toBe(correct);
    }
  });

  it('كل قراءة بلا تشكيل كامل تُوسَم، والقصص العربية مشكولة', () => {
    for (const u of gardenUnits('arabic')) {
      for (const s of u.stories) {
        // اختبار خفيف للتشكيل: وجود حركة واحدة على الأقل في أكثر من نصف الكلمات
        const words = s.text.split(/\s+/).filter((w) => w.length > 2);
        const withHaraka = words.filter((w) => /[\u064B-\u0652]/.test(w));
        expect(withHaraka.length / words.length, s.id).toBeGreaterThan(0.5);
      }
    }
  });

  it('اتساق الحدائق: كل حديقة بلغتها وبأدواتها', () => {
    for (const u of gardenUnits('english')) {
      expect(u.chant.lang, u.id).toBe('en');
      expect(u.hunt.lang, u.id).toBe('en');
      for (const item of u.hunt.items) {
        expect(/^[\x20-\x7E]+$/.test(item.label), `${u.id}: ${item.label}`).toBe(true);
      }
      expect(u.trace.script, u.id).toBe('en');
      expect(u.keyWord, u.id).toMatch(/^[a-z]+$/);
    }
    for (const u of gardenUnits('math')) {
      expect(u.trace.script, u.id).toBe('num');
      expect(/^[١٢٣٤٥٦٧٨٩٠]+$/.test(u.glyph), `${u.id}: ${u.glyph}`).toBe(true);
      expect(u.n, u.id).toBeGreaterThanOrEqual(1);
    }
    for (const u of gardenUnits('arabic')) {
      expect(u.trace.script, u.id).toBe('ar');
      expect(u.trace.glyph, u.id).toBe(u.letter);
      expect(u.clip, u.id).toBeTruthy();
    }
    // الصور: إما رسمة الموجودة في المكتبة (animals) أو صورة مقصودة في nour
    const arts = UNITS.map((u) => u.art || '');
    const own = new Set(arts.filter((a) => a.includes('/nour/')).map((a) => a.split('/').pop()));
    expect([...own].sort()).toEqual([
      'dates.png',
      'door.png',
      'garment.png',
      'mosque.png',
      'mountain.png',
      'rooster.png',
      'rope.png',
    ]);
    // الحدائق الثلاث تستخدم صورًا مُعلَنة فقط
    for (const u of gardenUnits('arabic')) {
      expect(
        ['salman/art/nour/', 'salman/art/animals/'].some((p) => u.art.startsWith(p)),
        u.id + ': ' + u.art
      ).toBe(true);
    }
  });

  it('كل ملف صورة أو صوت مُعلَن في الوحدات موجود في public/', () => {
    const problems = [];
    for (const u of UNITS) {
      if (u.art && !fs.existsSync(path.join(PUBLIC, u.art))) problems.push(u.art);
      if (u.letterAudio && !fs.existsSync(path.join(PUBLIC, u.letterAudio))) problems.push(u.letterAudio);
      for (const s of u.stories)
        if (s.voiced && !fs.existsSync(path.join(PUBLIC, `salman/audio/nour/${s.id}.mp3`)))
          problems.push(`${s.id}.mp3`);
      if (u.chant.voiced && !fs.existsSync(path.join(PUBLIC, `salman/audio/nour/${u.clip || u.id}-chant.mp3`)))
        problems.push(`${u.id}-chant.mp3`);
    }
    expect(problems).toEqual([]);
  });
});

describe('حدائق النور — منطق يوم الوحدة', () => {
  const unit = nourUnit('ar-ب');

  it('خطة اليوم سبع خطوات بنفس ترتيب الخطة', () => {
    expect(DAY_STEPS).toHaveLength(7);
    expect(DAY_STEPS.map((s) => s.id)).toEqual(['door', 'story', 'sound', 'hunt', 'trace', 'play', 'deed']);
    const plan = dayPlan(unit);
    expect(plan.map((s) => s.id)).toEqual(DAY_STEPS.map((s) => s.id));
    expect(plan.find((s) => s.id === 'story').story).toBe(unit.stories[0]);
    expect(plan.find((s) => s.id === 'play').engine).toBe('train');
  });

  it('اليوم الثاني: قصة الصحابي', () => {
    expect(storyFor(unit, 1).from).toBe('companions');
    expect(storyFor(unit, 0).from).toBe('prophet');
    expect(storyFor({ stories: [unit.stories[0]] }, 1)).toBe(unit.stories[0]);
  });

  it('صيد الصوت: النقرة الصحيحة تُحسب مرة واحدة', () => {
    const hunt = unit.hunt;
    const first = hunt.items.findIndex((i) => i.correct);
    const wrong = hunt.items.findIndex((i) => !i.correct);
    expect(huntTap(hunt, [], first)).toBe('hit');
    expect(huntTap(hunt, [first], first)).toBe('again');
    expect(huntTap(hunt, [], wrong)).toBe('miss');
    const all = hunt.items.map((_, i) => i).filter((i) => hunt.items[i].correct);
    expect(huntDone(hunt, all)).toBe(true);
    expect(huntDone(hunt, all.slice(0, -1))).toBe(false);
  });

  it('القطار وصناديق الأصوات: الترتيب هو الحكم', () => {
    expect(trainCorrect([0, 1, 2])).toBe(true);
    expect(trainCorrect([1, 0, 2])).toBe(false);
    expect(boxesCorrect([0, 1])).toBe(true);
    expect(boxesCorrect([1, 0])).toBe(false);
    expect(trainComplete([0, 1, 2], [0, 1])).toBe(false);
    expect(trainComplete([0, 1], [0, 1])).toBe(true);
  });

  it('عرض البلاطات مبعثر بشكل ثابت (ليس من اليسار إلى اليمين)', () => {
    expect(scramble(['ب', 'ا', 'ب'])).toEqual([1, 2, 0]);
    expect(scramble(['أ'])).toEqual([0]);
    expect([...scramble(['a', 'b', 'c', 'd'])].sort()).toEqual([0, 1, 2, 3]);
  });

  it('تقدّم اليوم والخطوة التالية', () => {
    expect(nextStep([]).id).toBe('door');
    expect(nextStep(['door', 'story']).id).toBe('sound');
    expect(dayFinished(DAY_STEPS.map((s) => s.id))).toBe(true);
    expect(dayFinished(['door'])).toBe(false);
    expect(dayProgress(['door', 'story'])).toMatchObject({ done: 2, total: 7 });
  });

  it('الوحدة التالية = أول وحدة غير مكتملة في ترتيب الحديقة', () => {
    const units = gardenUnits('arabic');
    expect(nextUnit(units, createState()).id).toBe('ar-أ');
    const s = recordDay(createState(), { unitId: 'ar-أ', garden: 'arabic', dayKey: '2026-10-11', steps: [] }).state;
    expect(nextUnit(units, s).id).toBe('ar-ب');
    expect(completedCount(s, units)).toBe(1);
    expect(unitCompleted(s, 'ar-أ')).toBe(true);
  });
});

describe('حدائق النور — التخزين والنجوم', () => {
  it('المخطط صار 4 والحالة القديمة (بلا nour) تُقبل', () => {
    expect(SCHEMA_VERSION).toBe(4);
    const old = { v: 3, stars: 5, gardens: { arabic: 5 }, doneStories: { x: true } };
    const s = normalizeState(old);
    expect(s.nour).toEqual({});
    expect(s.stars).toBe(5);
    expect(s.doneStories).toEqual({ x: true });
  });

  it('أول إكمال يعطي نجمتين، والإعادة لا تعطي شيئًا، والتقدّم يُحفظ', () => {
    const start = createState();
    const first = recordDay(start, { unitId: 'ar-أ', garden: 'arabic', dayKey: '2026-10-11', steps: ['door', 'deed'] });
    expect(first.earned).toBe(2);
    expect(first.state.stars).toBe(2);
    expect(first.state.gardens.arabic).toBe(2);
    expect(first.state.nour['ar-أ']).toMatchObject({ day: '2026-10-11', completed: true });
    const again = recordDay(first.state, { unitId: 'ar-أ', garden: 'arabic', dayKey: '2026-10-12', steps: [] });
    expect(again.earned).toBe(0);
    expect(again.state.stars).toBe(2);
  });

  it('معرّفات تالفة في nour تُنظَّف ولا تُسقط الحالة', () => {
    const dirty = {
      v: 4,
      nour: {
        'ar-أ': { day: '2026-10-11', done: ['door', 5], completed: 1 },
        '../../etc/passwd': { completed: true },
        'num-1': { day: 'bad', done: [], completed: false },
      },
    };
    const s = normalizeState(dirty);
    expect(Object.keys(s.nour)).toEqual(['ar-أ', 'num-1']);
    expect(s.nour['ar-أ']).toEqual({ day: '2026-10-11', done: ['door'], completed: true });
    expect(s.nour['num-1']).toEqual({ day: null, done: [], completed: false });
  });
});
