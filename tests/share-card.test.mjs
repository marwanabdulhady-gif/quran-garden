// بطاقة المشاركة (P5-33): اختبارات جمع الأرقام — الرسم نفسه يحتاج كانفس (متصفح)
import { describe, it, expect } from 'vitest';

const store = {};
globalThis.localStorage = {
  getItem: (k) => (k in store ? store[k] : null),
  setItem: (k, v) => {
    store[k] = String(v);
  },
  removeItem: (k) => delete store[k],
};
globalThis.location = { origin: 'http://x', pathname: '/', href: 'http://x/' };
globalThis.navigator = {};

const S = await import('../src/store.js');
const SC = await import('../src/shareCard.js');

describe('collectShareStats (P5-33)', () => {
  it('يجمع أرقام الطفل الحالي', () => {
    const kid = S.addChild('شارك');
    S.markWord(kid.id, 'subatan', { done: true, discovered: true });
    S.awardStars(kid.id, 5);
    S.awardBadge(kid.id, 'start');
    S.addListening(kid.id, { seconds: 120, surahNum: 114 });
    const ch = S.getState().children.find((x) => x.id === kid.id);
    const st = SC.collectShareStats(ch);
    expect(st.name).toBe('شارك');
    expect(st.stars).toBeGreaterThanOrEqual(5);
    expect(st.words).toBe(1);
    expect(st.wordsTotal).toBe(30);
    expect(st.badgesEarned).toBeGreaterThanOrEqual(1);
    expect(st.badgeEmojis).toContain('🌱');
    expect(st.listeningMin).toBe(2);
    expect(st.dateStr.length).toBeGreaterThan(4);
  });

  it('طفل بدون تقدم → أصفار وما يرميش', () => {
    const st = SC.collectShareStats(S.defaultChild('خاوي'));
    expect(st.words).toBe(0);
    expect(st.stars).toBe(0);
    expect(st.badgesEarned).toBe(0);
    expect(st.badgeEmojis).toEqual([]);
    expect(st.listeningMin).toBe(0);
  });
});
