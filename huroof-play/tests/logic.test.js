import { describe, it, expect } from 'vitest';
import {
  createLevelState,
  hintTarget,
  initialLetter,
  isCorrectMatch,
  isLevelUnlocked,
  levelReducer,
  placedCount,
  shuffle,
  starsEarned,
  HINT_AFTER_MISSES,
} from '../src/game/logic.js';
import { LEVEL_DATA } from '../src/data/index.js';

const level1 = LEVEL_DATA[0]; // أ ب ت ث → أسد بطة تمساح ثعلب
const fresh = () => createLevelState(level1, () => 0.5);
const place = (s, letter, target) => levelReducer(s, { type: 'place', letter, target });

describe('initialLetter / isCorrectMatch', () => {
  it('الحرف الأول من الكلمة', () => {
    expect(initialLetter('أسد')).toBe('أ');
    expect(initialLetter('')).toBe('');
  });
  it('المطابقة صح لو الحرف هو بداية الحيوان بس', () => {
    expect(isCorrectMatch('ب', { letter: 'ب', word: 'بطة' })).toBe(true);
    expect(isCorrectMatch('ت', { letter: 'ب', word: 'بطة' })).toBe(false);
    expect(isCorrectMatch('ب', undefined)).toBe(false);
  });
});

describe('shuffle', () => {
  it('ما بيغيرش الأصل ويحتفظ بكل العناصر', () => {
    const src = [1, 2, 3, 4, 5];
    const out = shuffle(src, () => 0.1);
    expect(src).toEqual([1, 2, 3, 4, 5]);
    expect([...out].sort()).toEqual([1, 2, 3, 4, 5]);
  });
  it('حتمي مع rng ثابت', () => {
    const seq = [0.9, 0.2, 0.7, 0.4];
    let i = 0;
    const rng = () => seq[i++ % seq.length];
    const a = shuffle(['a', 'b', 'c', 'd'], rng);
    i = 0;
    expect(shuffle(['a', 'b', 'c', 'd'], rng)).toEqual(a);
  });
});

describe('createLevelState', () => {
  it('يبدأ بكل الحروف غير موضوعة ومفيش نجوم', () => {
    const s = fresh();
    expect(s.letters.sort()).toEqual(['أ', 'ب', 'ت', 'ث']);
    expect(s.targets.sort()).toEqual(['أ', 'ب', 'ت', 'ث']);
    expect(placedCount(s)).toBe(0);
    expect(starsEarned(s)).toBe(0);
    expect(s.complete).toBe(false);
  });
});

describe('levelReducer', () => {
  it('select يختار ويلغي الاختيار بالتبديل', () => {
    let s = levelReducer(fresh(), { type: 'select', letter: 'أ' });
    expect(s.selected).toBe('أ');
    s = levelReducer(s, { type: 'select', letter: 'أ' });
    expect(s.selected).toBeNull();
  });

  it('clear يلغي الاختيار', () => {
    const s = levelReducer(fresh(), { type: 'select', letter: 'ب' });
    expect(levelReducer(s, { type: 'clear' }).selected).toBeNull();
  });

  it('مطابقة صح بتحط الحرف وبتدي نجمة من أول محاولة', () => {
    const s = place(fresh(), 'ب', 'ب');
    expect(s.placements).toEqual({ ب: 'ب' });
    expect(s.firstTry.ب).toBe(true);
    expect(starsEarned(s)).toBe(1);
    expect(s.feedback.kind).toBe('correct');
  });

  it('غلطة الأولى ثم الصح ما بيدّيش نجمة', () => {
    let s = place(fresh(), 'ب', 'ت');
    expect(s.mistakes.ب).toBe(1);
    expect(s.feedback.kind).toBe('wrong');
    s = place(s, 'ب', 'ب');
    expect(s.firstTry.ب).toBe(false);
    expect(starsEarned(s)).toBe(0);
    expect(placedCount(s)).toBe(1);
  });

  it('مفيش نجمة لو الغلط ومصححتش', () => {
    const s = place(fresh(), 'ث', 'أ');
    expect(starsEarned(s)).toBe(0);
    expect(s.placements).toEqual({});
  });

  it('الحيوان اللي اتملى ما يتقبلش حرف تاني', () => {
    const s = place(fresh(), 'ب', 'ب');
    const again = place(s, 'ت', 'ب');
    expect(again).toBe(s);
  });

  it('الحرف المتحط ما يتحطش تاني', () => {
    const s = place(fresh(), 'ب', 'ب');
    expect(place(s, 'ب', 'ت')).toBe(s);
  });

  it('بيستخدم الحرف المختار لو ما اتبعتش letter (مسار الضغط)', () => {
    let s = levelReducer(fresh(), { type: 'select', letter: 'ت' });
    s = levelReducer(s, { type: 'place', target: 'ت' });
    expect(s.placements).toEqual({ ت: 'ت' });
    expect(s.selected).toBeNull();
  });

  it('مفيش حاجة تحصل لو مفيش حرف مختار ولا letter', () => {
    const s = fresh();
    expect(levelReducer(s, { type: 'place', target: 'ت' })).toBe(s);
  });

  it('حرف مش موجود أو هدف مش موجود بيتجاهلهم', () => {
    const s = fresh();
    expect(levelReducer(s, { type: 'select', letter: 'ز' })).toBe(s);
    expect(place(s, 'ب', 'ز')).toBe(s);
  });

  it(`التلميح بيظهر بعد ${HINT_AFTER_MISSES} غلطات على نفس الحرف`, () => {
    let s = place(fresh(), 'ب', 'ت');
    expect(hintTarget(s)).toBeNull();
    s = place(s, 'ب', 'ث');
    expect(hintTarget(s)).toBe('ب');
    s = place(s, 'ب', 'ب');
    expect(hintTarget(s)).toBeNull();
  });

  it('الاكتمال بيتعلم لما كل الحروف تتحط', () => {
    let s = fresh();
    s = place(s, 'أ', 'أ');
    s = place(s, 'ب', 'ب');
    s = place(s, 'ت', 'ت');
    expect(s.complete).toBe(false);
    s = place(s, 'ث', 'ث');
    expect(s.complete).toBe(true);
    expect(starsEarned(s)).toBe(4);
  });

  it('غلطة على حرف واحد بتشيل نجمته بس، والباقي بيفضل محسوب', () => {
    let s = place(fresh(), 'أ', 'ب'); // غلطة على أ
    s = place(s, 'ب', 'ب');
    s = place(s, 'أ', 'أ');
    s = place(s, 'ت', 'ت');
    s = place(s, 'ث', 'ث');
    expect(s.complete).toBe(true);
    expect(starsEarned(s)).toBe(3);
  });

  it('action مجهول بيرجع نفس الحالة', () => {
    const s = fresh();
    expect(levelReducer(s, { type: 'unknown' })).toBe(s);
  });
});

describe('isLevelUnlocked', () => {
  it('المستوى 1 دايمًا مفتوح', () => {
    expect(isLevelUnlocked(1, [])).toBe(true);
  });
  it('كل مستوى بيتفتح بعد إكمال اللي قبله بس', () => {
    expect(isLevelUnlocked(2, [])).toBe(false);
    expect(isLevelUnlocked(2, [1])).toBe(true);
    expect(isLevelUnlocked(3, [1])).toBe(false);
    expect(isLevelUnlocked(3, [1, 2])).toBe(true);
  });
});
