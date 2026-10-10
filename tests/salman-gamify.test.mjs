// اختبارات منطق التلعيب لحديقة سلمان (دوال نقية، بلا DOM)
import { describe, it, expect } from 'vitest';
import {
  createState,
  normalizeState,
  growthStage,
  updateStreak,
  diffDays,
  recordStory,
  recordSurah,
  finishVisit,
  levelUnlocked,
  levelDone,
  giftFor,
  GIFTS,
  BADGES,
} from '../src/salman/lib/gamify.js';

describe('مراحل نمو الحديقة', () => {
  it('تبدأ ببذرة وتتقدم حسب النجوم', () => {
    expect(growthStage(0).emoji).toBe('🌱');
    expect(growthStage(2).emoji).toBe('🌱');
    expect(growthStage(3).emoji).toBe('🌿');
    expect(growthStage(8).emoji).toBe('🌳');
    expect(growthStage(25).emoji).toBe('🌺');
  });

  it('تحسب ما يتبقى للمرحلة التالية، وتكون النهاية بلا تالٍ', () => {
    const s = growthStage(5);
    expect(s.next.min).toBe(8);
    expect(s.toNext).toBe(3);
    expect(growthStage(999).next).toBeNull();
  });
});

describe('السلسلة اليومية (streak)', () => {
  it('يوم جديد متتالٍ يزيد السلسلة، ويوم متخطى يعيدها إلى 1 بلا عقاب على النجوم', () => {
    let st = updateStreak(null, '2026-10-10');
    expect(st.current).toBe(1);
    st = updateStreak(st, '2026-10-11');
    expect(st.current).toBe(2);
    expect(st.best).toBe(2);
    st = updateStreak(st, '2026-10-13');
    expect(st.current).toBe(1);
    expect(st.best).toBe(2);
  });

  it('نفس اليوم لا يغيّر السلسلة', () => {
    const st = updateStreak({ current: 4, best: 4, last: '2026-10-11' }, '2026-10-11');
    expect(st.current).toBe(4);
  });

  it('حساب الفرق بين الأيام يعمل عبر نهاية الشهر', () => {
    expect(diffDays('2026-10-31', '2026-11-01')).toBe(1);
    expect(diffDays('2026-02-28', '2026-03-01')).toBe(1);
  });
});

describe('تسجيل القصص والنجوم', () => {
  it('الإجابة الصحيحة من أول محاولة تعطي نجمتين، وبعد محاولات تعطي نجمة', () => {
    const base = createState();
    const first = recordStory(base, { storyId: 'a', garden: 'arabic', firstTry: true, dayKey: '2026-10-11' });
    expect(first.earned).toBe(2);
    expect(first.state.stars).toBe(2);
    expect(first.state.gardens.arabic).toBe(2);
    const later = recordStory(base, { storyId: 'b', garden: 'arabic', firstTry: false, dayKey: '2026-10-11' });
    expect(later.earned).toBe(1);
  });

  it('إعادة نفس القصة لا تعطي نجومًا إضافية', () => {
    const once = recordStory(createState(), { storyId: 'a', garden: 'math', firstTry: true, dayKey: '2026-10-11' });
    const twice = recordStory(once.state, { storyId: 'a', garden: 'math', firstTry: true, dayKey: '2026-10-11' });
    expect(twice.earned).toBe(0);
    expect(twice.state.stars).toBe(2);
  });

  it('الحالة الأصلية لا تتغير (دوال نقية)', () => {
    const base = createState();
    recordStory(base, { storyId: 'a', garden: 'quran', firstTry: true, dayKey: '2026-10-11' });
    expect(base.stars).toBe(0);
    expect(base.doneStories).toEqual({});
  });
});

describe('السور والمستويات', () => {
  it('المستوى الثاني مقفل حتى تُكمل كل سور المستوى الأول', () => {
    let st = createState();
    expect(levelUnlocked(st, 2)).toBe(false);
    for (const sid of [1, 114, 113]) {
      st = recordSurah(st, { surahId: sid, dayKey: '2026-10-11' }).state;
    }
    expect(levelUnlocked(st, 2)).toBe(false);
    st = recordSurah(st, { surahId: 112, dayKey: '2026-10-11' }).state;
    expect(levelDone(st, 1)).toBe(true);
    expect(levelUnlocked(st, 2)).toBe(true);
    expect(levelUnlocked(st, 3)).toBe(false);
  });

  it('تعلّم السورة يعطي نجمتين مرة واحدة فقط', () => {
    const once = recordSurah(createState(), { surahId: 1, dayKey: '2026-10-11' });
    const twice = recordSurah(once.state, { surahId: 1, dayKey: '2026-10-11' });
    expect(once.earned).toBe(2);
    expect(twice.earned).toBe(0);
    expect(twice.state.stars).toBe(2);
    expect(twice.state.gardens.quran).toBe(2);
  });
});

describe('الأوسمة والهدايا', () => {
  it('شارة أول نجمة تُفتح مرة واحدة وتظهر في newBadges', () => {
    const r = recordStory(createState(), { storyId: 'a', garden: 'arabic', firstTry: true, dayKey: '2026-10-11' });
    expect(r.newBadges).toContain('first-star');
    const again = recordStory(r.state, { storyId: 'b', garden: 'arabic', firstTry: true, dayKey: '2026-10-11' });
    expect(again.newBadges).not.toContain('first-star');
  });

  it('نهاية الزيارة تمنح هدية مرتبة وتفتح شارة أول زيارة', () => {
    const f = finishVisit(createState());
    expect(f.state.visits).toBe(1);
    expect(f.gift.id).toBe(GIFTS[0].id);
    expect(f.state.gifts).toEqual([GIFTS[0].id]);
    expect(f.newBadges).toContain('first-visit');
    expect(giftFor(GIFTS.length + 1).id).toBe(GIFTS[0].id);
  });

  it('كل الأوسمة لها معرّف فريد وعنوان ورمز', () => {
    const ids = BADGES.map((b) => b.id);
    expect(new Set(ids).size).toBe(ids.length);
    for (const b of BADGES) {
      expect(b.title.length).toBeGreaterThan(0);
      expect(b.emoji.length).toBeGreaterThan(0);
    }
  });
});

describe('تحميل الحالة المحفوظة', () => {
  it('يتحمّل بيانات تالفة أو ناقصة بالقيم الافتراضية', () => {
    expect(normalizeState(null)).toEqual(createState());
    expect(normalizeState('نص')).toEqual(createState());
    const st = normalizeState({ stars: -5, gardens: { arabic: 'x', math: 3 }, streak: { current: 2 } });
    expect(st.stars).toBe(0);
    expect(st.gardens.arabic).toBe(0);
    expect(st.gardens.math).toBe(3);
    expect(st.streak.current).toBe(2);
    expect(st.streak.best).toBe(0);
  });
});
