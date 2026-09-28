// اختبارات منطق المتجر — Vitest
//   npm test   (أو: npx vitest run)
import { describe, it, expect } from 'vitest';

// ---------- بيئة وهمية (قبل استيراد المتجر) ----------
const store = {};
let quotaFail = false;
globalThis.localStorage = {
  getItem: (k) => (k in store ? store[k] : null),
  setItem: (k, v) => {
    if (quotaFail) throw new Error('QuotaExceededError');
    store[k] = String(v);
  },
  removeItem: (k) => delete store[k],
};
globalThis.location = { origin: 'http://x', pathname: '/', href: 'http://x/' };
globalThis.navigator = {};

const S = await import('../src/store.js');
const D = await import('../src/data.js');

const assert = (cond, msg) => expect(cond, msg).toBeTruthy();

let state = S.getState();
let c = S.activeChild(state);

describe('الحالة الافتراضية', () => {
  it('طفل افتراضي واحد باسم سلمان', () => {
    state = S.getState();
    c = S.activeChild(state);
    assert(state.children.length === 1, 'طفل افتراضي واحد');
    assert(c.name === 'سلمان', 'الاسم الافتراضي سلمان');
  });
});

describe('كلمات الجسر والنجوم', () => {
  it('رحلة كاملة: 5 كلمات + 5 نجوم', () => {
    const trip1 = D.TRIPS[0];
    for (const wid of trip1.words) {
      S.markWord(c.id, wid, { done: true, discovered: true });
      S.awardStars(c.id, 1);
    }
    let ch = S.activeChild(S.getState());
    assert(S.discoveredCount(ch) === 5, 'المكتشفات = 5 بعد رحلة');
    assert(ch.stars === 5, 'النجوم = 5');
  });

  it('الأوسمة: مرة واحدة فقط، كائن { id, at }، والمجهول مبيتضيفش', () => {
    S.awardBadge(c.id, 'start');
    S.awardBadge(c.id, 'start');
    let ch = S.activeChild(S.getState());
    assert(ch.badges.filter((b) => b.id === 'start').length === 1, 'وسام البداية مرة واحدة فقط');
    assert(ch.badges[0].id === 'start' && ch.badges[0].at > 0, 'الوسام كائن { id, at } بتاريخه');
    S.awardBadge(c.id, 'badge-غير-موجود');
    assert(S.activeChild(S.getState()).badges.length === 1, 'وسام مجهول ما يتضيفش');
  });

  it('الهدايا المعلقة والسماع', () => {
    S.addGift(c.id);
    S.addGift(c.id);
    let ch = S.activeChild(S.getState());
    assert(ch.gifts.pending === 2, 'هدايتان معلقان');

    S.updateChild(c.id, (x) => ({ ...x, listening: { ...x.listening, 67: { heard: 30, completed: true } } }));
    S.awardStars(c.id, 2);
    ch = S.activeChild(S.getState());
    assert(ch.listening[67].completed === true, 'سورة الملك مكتملة');
    assert(ch.stars === 7, 'النجوم 7 بعد +2');

    S.awardBadge(c.id, 'trip1');
    assert(
      S.activeChild(S.getState()).badges.some((b) => b.id === 'trip1'),
      'وسام الرحلة 1'
    );
  });
});

describe('أطفال متعددون', () => {
  it('رحلة مستقلة لكل طفل', () => {
    const c2 = S.addChild('سلمى', {});
    S.setChild(c2.id);
    let ch = S.activeChild(S.getState());
    assert(ch.id === c2.id && ch.name === 'سلمى' && ch.stars === 0, 'الطفل الثاني برحلة مستقلة');
    S.setChild(c.id);
    ch = S.activeChild(S.getState());
    assert(ch.stars === 7, 'سلمان لم يتأثر');
  });
});

describe('P0-1: الرابط لا يحمل الصور', () => {
  it('رابط صغير بدون dataURLs', () => {
    const fakePhoto = 'data:image/png;base64,' + 'A'.repeat(50000);
    S.updateChild(c.id, { avatar: fakePhoto, avatarReading: fakePhoto });
    const link = S.gardenLink();
    assert(!link.includes('data:image'), 'الرابط لا يحتوي أي dataURL للصور');
    assert(link.length < 6000, `الرابط صغير (${link.length} محرف) رغم وجود صورتين`);
    const parsed = S.parseGardenLink(link);
    assert(parsed && parsed.children.length === 2, 'الرابط يفتح بيانات طفلين');
    assert(
      parsed.children.every((x) => x.avatar === undefined),
      'الصور محذوفة من بيانات الرابط'
    );
  });
});

describe('P0-3: تطهير البيانات الوافدة', () => {
  it('مدخل مشوه → كيان صالح بمواصفات مقيدة', () => {
    const evil = {
      familyKey: { obj: true },
      children: [
        'not-an-object',
        null,
        {
          name: 123,
          stars: -50,
          badges: ['start', 'start', 'evil-badge'],
          reciter: 'javascript:alert(1)',
          listening: { 67: 'x', 9999: { heard: 1 } },
          bridge: { words: { evil: { done: 1 } }, level: 'hard-core' },
        },
        {
          name: 'طفل صالح',
          stars: 4,
          badges: ['listener'],
          reciter: 'ar.husary',
          listening: { 58: { heard: 3, completed: false } },
          daily: { waterStreak: 'xx' },
        },
        ...Array.from({ length: 30 }, () => ({ name: 'زائد' })),
      ],
      activeChildId: 'does-not-exist',
    };
    const cleaned = S.sanitizeFamily(evil);
    assert(cleaned !== null, 'sanitizeFamily تعيد كيانًا صالحًا من مدخل مشوه');
    assert(cleaned.children.length === 8, 'عدد الأطفال مقيد بـ 8');
    assert(cleaned.children[0].name.length <= 20, 'أسماء مقيدة بالطول');
    assert(
      cleaned.children.every((x) => Number.isFinite(x.stars) && x.stars >= 0),
      'نجوم أعداد سليمة'
    );
    assert(
      cleaned.children.every((x) => D.RECIERS.some((r) => r.id === x.reciter)),
      'القارئ من القائمة المعروفة فقط'
    );
    assert(
      cleaned.children.every((x) => x.badges.every((b) => D.BADGES[b.id])),
      'أوسمة معروفة فقط (صيغة كائن)'
    );
    assert(
      cleaned.children.some((x) => x.badges.length === 1 && x.badges[0].id === 'start'),
      'أوسمة مكررة تتنظف لواحد'
    );
    assert(
      cleaned.children.every((x) => Object.keys(x.listening).every((k) => +k >= 1 && +k <= 114)),
      'أرقام السور ضمن 1..114'
    );
    assert(
      cleaned.children.every((x) => Object.keys(x.bridge.words).every((k) => D.WORDS.some((w) => w.id === k))),
      'كلمات الجسر معروفة فقط'
    );
    assert(cleaned.activeChildId === cleaned.children[0].id, 'الطفل النشط غير موجود → الأول');
  });

  it('مدخلات فاضية → null', () => {
    assert(S.sanitizeFamily(null) === null, 'sanitizeFamily(null) → null');
    assert(S.sanitizeFamily({}) === null, 'sanitizeFamily({}) → null');
    assert(S.sanitizeFamily({ children: [] }) === null, 'sanitizeFamily(آطفال فارغة) → null');
  });

  it('استرجاع: التالف يلمسش الحالة، والصالح يحفظ التقدم', () => {
    const before = JSON.stringify(S.getState());
    assert(S.restoreFamily(null) === false, 'restoreFamily(null) → false');
    assert(JSON.stringify(S.getState()) === before, 'الحالة لم تتغير بعد فشل الاسترجاع');

    const link2 = S.gardenLink();
    assert(S.restoreFamily(S.parseGardenLink(link2)) === true, 'استرجاع صالح → true');
    assert(S.activeChild(S.getState()).stars === 7, 'النجوم محفوظة بعد الاسترجاع');
  });
});

describe('P0-2: خطأ مساحة التخزين يُبلَّغ', () => {
  it('فشل الحفظ يرفع العلم ورجوعه ينزله', () => {
    quotaFail = true;
    S.awardStars(c.id, 1);
    assert(S.getStorageError() === true, 'فشل الحفظ يرفع علم storageError');
    quotaFail = false;
    S.awardStars(c.id, 1);
    assert(S.getStorageError() === false, 'عاد الحفظ فينزل العلم');
  });
});

describe('P2-13/16: أدوات النص', () => {
  it('تصحيح تظليل الكلمة + خط واضح', async () => {
    const T = await import('../src/text.js');
    const r = T.splitWord('وَجَعَلْنَا نَوْمَكُمْ سُبَاتًا', 'سُبَاتًا');
    assert(r.found && r.mid === 'سُبَاتًا', 'splitWord: الكلمة المظللة هي الكلمة نفسها');
    assert(
      r.before + r.mid + r.after === T.cleanAyah('وَجَعَلْنَا نَوْمَكُمْ سُبَاتًا'),
      'splitWord: الأجزاء بتتجمّع للآية كاملة'
    );
    const r2 = T.splitWord('وَزَرَابِيٌّ مَبْثُوثَةٌ', 'زَرَابِيٌّ');
    assert(r2.found && r2.mid === 'زَرَابِيٌّ', 'splitWord: زَرَابِيٌّ مظلمة صح');
    const r3 = T.splitWord('وَتَكُونُ الْجِبَالُ كَالْعِهْنِ الْمَنفُوشِ', 'الْمَنفُوشِ');
    assert(r3.found && r3.mid === 'الْمَنفُوشِ', 'splitWord: آخر كلمة في الآية');

    const plain = { reading: { plain: true } };
    assert(
      !T.readAyah('وَجَعَلْنَا نَوْمَكُمْ سُبَاتًا', plain).match(/[\u064B-\u065F]/),
      'readAyah plain: من غير تشكيل'
    );
    assert(T.readAyah('وَجَعَلْنَا نَوْمَكُمْ سُبَاتًا', {}).includes('ج'), 'readAyah عادي: تشكيل موجود');
    const rp = T.splitWord('وَجَعَلْنَا نَوْمَكُمْ سُبَاتًا', 'سُبَاتًا', true);
    assert(rp.found && rp.mid === 'سباتا', 'splitWord plain: مظلمة من غير تشكيل');

    let all = 0;
    for (const w of D.WORDS) {
      if (T.splitWord(w.ayah, w.word).found && T.splitWord(w.ayah, w.word, true).found) all++;
    }
    assert(all === D.WORDS.length, `كل كلمات الجسر مظلمة صح (عادي + واضح) ${all}/20`);

    const ok = S.sanitizeChild({ reading: { size: 'l', plain: true } });
    assert(ok.reading.size === 'l' && ok.reading.plain === true, 'reading سليم بيتقبل');
    const bad = S.sanitizeChild({ reading: { size: 'xx', plain: 'yes' } });
    assert(bad.reading.size === 'm' && bad.reading.plain === false, 'reading مش معروف بيتطهر');
  });
});

describe('P1-9: سلسلة النشاط (touchDaily)', () => {
  it('قواعد السلسلة كاملة', () => {
    const t1 = '2026-09-24',
      t2 = '2026-09-25',
      t3 = '2026-09-26',
      t5 = '2026-09-28';
    let d = null;
    d = S.touchDaily(d, t1, '2026-09-23');
    assert(d.streak === 1 && d.lastActive === t1, 'أول نشاط → سلسلة 1');
    d = S.touchDaily(d, t1, '2026-09-23');
    assert(d.streak === 1, 'نشاط ثانٍ في نفس اليوم ما يزيدش العداد');
    d = S.touchDaily(d, t2, t1);
    assert(d.streak === 2, 'يوم متصل → 2');
    d = S.touchDaily(d, t3, t2);
    assert(d.streak === 3, 'يوم متصل تاني → 3');
    d = S.touchDaily(d, t5, '2026-09-27');
    assert(d.streak === 1, 'فجوة يومين → ترجع 1');

    const st0 = S.getState();
    const active = S.activeChild(st0);
    S.awardStars(active.id, 1);
    const st1 = S.activeChild(S.getState());
    assert((st1.daily.streak || 0) >= 1 && st1.daily.lastActive, 'awardStars يلمس سلسلة النشاط');
    S.awardStars(active.id, 1);
    assert(S.activeChild(S.getState()).daily.streak === st1.daily.streak, 'نفس اليوم: الاستمرار ما يضاعفش');
    assert(S.streakOf(st1) >= 1, 'streakOf يعيد السلسلة لما آخر نشاط اليوم');
  });
});

describe('P1-6: تفضيلات المشغل (تكرار/سرعة)', () => {
  it('التطهير والحفظ', () => {
    const ok = S.sanitizeChild({ playback: { repeat: 2, speed: 0.75 } });
    assert(ok.playback.repeat === 2 && ok.playback.speed === 0.75, 'playback سليم بيتقبل');
    const bad = S.sanitizeChild({ playback: { repeat: 3, speed: 9 } });
    assert(bad.playback.repeat === 1 && bad.playback.speed === 1, 'playback مش معروف بيتطهر للافتراضي');
    const none = S.sanitizeChild({});
    assert(none.playback.repeat === 1 && none.playback.speed === 1, 'بدون playback → افتراضي');

    const active = S.activeChild(S.getState());
    S.updateChild(active.id, (x) => ({ ...x, playback: { repeat: 4, speed: 1.25 } }));
    assert(S.activeChild(S.getState()).playback.repeat === 4, 'تغيير التكرار بيتحفظ للطفل');
  });
});

describe('P1-10: الدمج والاسترجاع بحسمات', () => {
  it('mergeChild: أكبر قيمة لكل جانب + حتمي', () => {
    const A = S.sanitizeChild({
      id: 'cA',
      name: 'سلمان',
      stars: 5,
      badges: [{ id: 'start', at: 100 }],
      bridge: { words: { subatan: { done: true, discovered: true, reviewed: 2 } } },
      listening: { 78: { heard: 4, completed: false }, 79: { heard: 12, completed: true } },
      gifts: { pending: 1, decor: ['cat'] },
      daily: { lastActive: '2026-09-20', streak: 3, lastAyah: '2026-09-19' },
    });
    const B = S.sanitizeChild({
      id: 'cA',
      name: 'سلمان',
      stars: 9,
      badges: [{ id: 'trip1', at: 200 }],
      bridge: { words: { wahhaja: { done: true, discovered: true, reviewed: 1 } } },
      listening: { 78: { heard: 6, completed: false }, 80: { heard: 1, completed: false } },
      gifts: { pending: 0, decor: ['bird'] },
      daily: { lastActive: '2026-09-22', streak: 2, lastAyah: '2026-09-21' },
    });
    const M = S.mergeChild(A, B);
    assert(M.stars === 9, 'الدمج: النجوم = الأكبر');
    assert(M.badges.length === 2 && M.badges.every((b) => ['start', 'trip1'].includes(b.id)), 'الدمج: الأوسمة اتنين');
    assert(M.listening['78'].heard === 6 && !M.listening['78'].completed, 'الدمج: أعلى heard لكل سورة');
    assert(M.listening['79'].completed === true, 'الدمج: completed بالـ OR');
    assert(M.listening['80'].heard === 1, 'الدمج: السور الجديدة من الجانبين');
    assert(M.bridge.words.subatan.done && M.bridge.words.subatan.reviewed === 2, 'الدمج: كلمة من الجهاز');
    assert(M.bridge.words.wahhaja.done, 'الدمج: كلمة من الرابط');
    assert(M.gifts.pending === 1 && M.gifts.decor.length === 2, 'الدمج: الهدايا والزينة اتنين');
    assert(M.daily.lastActive === '2026-09-20' && M.daily.streak === 3, 'الدمج: أعلى سلسلة هي اللي تاخد آخر نشاطها');
    assert(M.daily.lastAyah === '2026-09-21', 'الدمج: آخر آية = الأحدث');
    assert(M.name === 'سلمان' && M.id === 'cA', 'الدمج: هوية من هذا الجهاز');

    const M2 = S.mergeChild(S.sanitizeChild({ ...B }), S.sanitizeChild({ ...A }));
    const byKey = (o) => JSON.stringify(Object.fromEntries(Object.entries(o).sort(([a], [b]) => (a < b ? -1 : 1))));
    assert(byKey(M.listening) === byKey(M2.listening), 'الدمج حتمي (listening)');
    assert(byKey(M.bridge.words) === byKey(M2.bridge.words), 'الدمج حتمي (words)');
  });

  it('hasProgress', () => {
    const A = S.sanitizeChild({ stars: 5 });
    const B = S.sanitizeChild({ badges: [{ id: 'start', at: 1 }] });
    assert(S.hasProgress(A) && S.hasProgress(B), 'hasProgress على طفلين عندهم تقدم');
    assert(!S.hasProgress(S.sanitizeChild({ id: 'c0' })), 'hasProgress على طفل فارغ → false');
  });

  it('pairChildren + applyRestore بكل الحسمات', () => {
    const local = S.sanitizeFamily({
      children: [
        S.sanitizeChild({ id: 'cA', name: 'سلمان', stars: 5 }),
        S.sanitizeChild({ id: 'cS', name: 'سلمي', stars: 2 }),
      ],
      activeChildId: 'cA',
    });
    const inc = S.sanitizeFamily({
      children: [
        S.sanitizeChild({ id: 'cA', name: 'سلمان', stars: 9 }),
        S.sanitizeChild({ id: 'cN', name: 'نورة', stars: 1 }),
      ],
      activeChildId: 'cN',
    });
    const { pairs, extra } = S.pairChildren(local.children, inc.children);
    assert(pairs.length === 2 && pairs[0].conflict === true, 'pairChildren: سلمان متعارض');
    assert(pairs[1].conflict === false && pairs[1].inc === null, 'pairChildren: سلمي موجودة هنا فقط');
    assert(extra.length === 1 && extra[0].name === 'نورة', 'pairChildren: نورة إضافية من الرابط');

    const rMerge = S.applyRestore(local, inc, { cA: 'merge' });
    assert(rMerge.children.length === 3, 'applyRestore: 3 أطفال بعد الدمج');
    assert(rMerge.children.find((x) => x.id === 'cA').stars === 9, 'applyRestore: هدمج سلمان');
    assert(rMerge.children.find((x) => x.id === 'cS').stars === 2, 'applyRestore: سلمي اتحفظت');
    assert(
      rMerge.children.find((x) => x.id === 'cN'),
      'applyRestore: نورة اتضافت'
    );
    assert(rMerge.activeChildId === 'cA', 'applyRestore: الطفل النشط اتحافظ عليه');

    const rKeep = S.applyRestore(local, inc, { cA: 'local' });
    assert(rKeep.children.find((x) => x.id === 'cA').stars === 5, 'applyRestore: "احتفظ" = تقدم الجهاز مش مستبدل');
    const rLink = S.applyRestore(local, inc, { cA: 'link' });
    assert(rLink.children.find((x) => x.id === 'cA').stars === 9, 'applyRestore: "خذ من الرابط" = تقدم الرابط');
    const rAuto = S.applyRestore(local, inc, {});
    assert(rAuto.children.find((x) => x.id === 'cA').stars === 5, 'بدون حسم: المتعارض مبيستبدلش تلقائيًا');
  });
});

describe('P1-7: نص جزء عمّ المدمج + المشغل أوفلاين', () => {
  it('564 آية + كل الكلمات اتلقت', async () => {
    const J = (await import('../src/juz30.js')).JUZ30;
    let total = 0;
    for (let n = 78; n <= 114; n++) {
      assert(Array.isArray(J[n]) && J[n].length >= 3, `جزء عمّ: سورة ${n} موجودة (${J[n]?.length} آية)`);
      total += J[n].length;
    }
    assert(total === 564, `جزء عمّ الكامل مدمج (${total} آية)`);
    const mf = (x) =>
      (x || '')
        .replace(/[\u064B-\u065F\u0670\u0640\u06D5-\u06ED\u06E5-\u06E9]/g, '')
        .replace(/\u0671/g, '\u0627')
        .replace(/\u0649/g, '\u064A');
    let okWords = 0;
    for (const w of D.WORDS) {
      if (mf(w.word).length && mf(J[w.surah][w.ayahNum - 1]).includes(mf(w.word))) okWords++;
    }
    assert(okWords === D.WORDS.length, `كل كلمات الجسر (20) اتلقت في نص الجزء المدمج (${okWords}/20)`);
  });

  it('أوفلاين: السورة المدمجة + قائمة 58–114', async () => {
    const J = (await import('../src/juz30.js')).JUZ30;
    globalThis.fetch = () => Promise.reject(new Error('offline test'));
    const A = await import('../src/api.js');
    const off = await A.getSurah(78, 'ar.alafasy');
    assert(off.offline === true && off.numberOfAyahs === J[78].length, 'getSurah أوفلاين يرجع السورة المدمجة');
    assert(
      off.ayahs.every((a) => a.audio === null && a.text.length > 0),
      'أوفلاين: نص موجود وتلاوة null'
    );
    const offList = await A.getSurahs();
    assert(
      offList.length === 57 && offList[0].number === 58 && offList[0].numberOfAyahs === 22,
      'قائمة السور أوفلاين (58–114)'
    );
  });
});

describe('الحذف', () => {
  it('ينقل النشاط ويولّد حديقة جديدة عند حذف الأخير', () => {
    S.removeChild(S.getState().children[0].id);
    const afterDel = S.getState();
    assert(afterDel.children.length >= 1 && afterDel.activeChildId === afterDel.children[0].id, 'الحذف ينقل النشاط');
    while (S.getState().children.length > 1) S.removeChild(S.getState().children[0].id);
    S.removeChild(S.getState().children[0].id);
    assert(S.getState().children.length === 1, 'حذف الأخير يولد حديقة جديدة');
  });
});

// ---------- P5-32: إحصائيات الاستماع ----------
describe('إحصائيات الاستماع (P5-32)', () => {
  it('defaultChild فيها stats صفري + parent متوقف', () => {
    const c0 = S.defaultChild();
    expect(c0.stats.seconds).toBe(0);
    expect(c0.stats.weeks).toEqual({});
    expect(c0.stats.surahs).toEqual({});
    expect(c0.stats.days).toEqual({});
    expect(c0.parent).toEqual({ pin: null, enabled: false, dailyCapMin: 0, quietFrom: null, quietUntil: null });
  });

  it('weekKey / dayKey بصيغة ثابتة', () => {
    expect(S.weekKey(new Date('2026-09-27T10:00'))).toBe('2026-W39');
    expect(S.dayKey(new Date('2026-09-27T23:00'))).toBe('2026-09-27');
  });

  it('addListening يجمع: إجمالي + أسبوعي + يومي + لكل سورة', () => {
    const kid = S.addChild('إحصاء');
    S.addListening(kid.id, { seconds: 60, surahNum: 112, ayahs: 2 });
    S.addListening(kid.id, { seconds: 90, surahNum: 112, ayahs: 3 });
    S.addListening(kid.id, { seconds: 30, surahNum: 113, ayahs: 1 });
    const ch = S.getState().children.find((x) => x.id === kid.id);
    expect(ch.stats.seconds).toBe(180);
    expect(ch.stats.weeks[S.weekKey()]).toBe(180);
    expect(ch.stats.days[S.dayKey()]).toBe(180);
    expect(ch.stats.surahs['112']).toEqual({ seconds: 150, ayahs: 5 });
    expect(ch.stats.surahs['113']).toEqual({ seconds: 30, ayahs: 1 });
  });

  it('مدخلات تالفة ما تكسرش الإحصائيات', () => {
    const kid = S.addChild('أرقام');
    S.addListening(kid.id, { seconds: '120', surahNum: 9999, ayahs: -5 });
    S.addListening(kid.id, null);
    S.addListening(kid.id, {});
    const ch = S.getState().children.find((x) => x.id === kid.id);
    expect(ch.stats.seconds).toBe(120, 'نص رقمي بيتحول');
    expect(ch.stats.surahs['114'], 'سورة خارج النطاق → 114').toBeTruthy();
    expect(ch.stats.surahs['114'].ayahs).toBe(1, 'ayahs سالب → 1');
  });
});

// ---------- P5-35: وضع الوالدين ----------
describe('وضع الوالدين (P5-35)', () => {
  const mk = (name, parent, todaySecs = 0) => {
    const kid = S.addChild(name);
    S.updateChild(kid.id, (c) => ({ ...c, parent }));
    if (todaySecs) S.addListening(kid.id, { seconds: Math.min(todaySecs, 3600), surahNum: 114 });
    return S.getState().children.find((x) => x.id === kid.id);
  };

  it('متوقف → ما فيش منع حتى لو الوقت كله سكون', () => {
    const ch = mk(
      'والد1',
      { pin: '1234', enabled: false, dailyCapMin: 1, quietFrom: '00:00', quietUntil: '23:59' },
      3600
    );
    const b = S.parentBlock(ch);
    expect(b.quiet).toBe(false);
    expect(b.over).toBe(false);
    expect(b.capMin).toBe(1);
  });

  it('حدّ يومي: وقت النهارده ≥ الحد → over', () => {
    const over = mk('والد2', { pin: '1234', enabled: true, dailyCapMin: 5, quietFrom: null, quietUntil: null }, 300);
    expect(S.parentBlock(over, new Date()).over).toBe(true);
    const under = mk('والد3', { pin: '1234', enabled: true, dailyCapMin: 5, quietFrom: null, quietUntil: null }, 10);
    expect(S.parentBlock(under, new Date()).over).toBe(false);
  });

  it('ساعات سكون: داخل النافذة (ومع تجاوز منتصف الليل) → quiet', () => {
    const ch = mk('والد4', { pin: '1234', enabled: true, dailyCapMin: 0, quietFrom: '22:00', quietUntil: '06:00' });
    expect(S.parentBlock(ch, new Date('2026-09-27T23:30')).quiet).toBe(true, '23:30 في السكون');
    expect(S.parentBlock(ch, new Date('2026-09-27T03:00')).quiet).toBe(true, '03:00 بعد منتصف الليل');
    expect(S.parentBlock(ch, new Date('2026-09-27T12:00')).quiet).toBe(false, '12:00 حرة');
    expect(S.parentBlock(ch, new Date('2026-09-27T06:00')).quiet).toBe(false, '06:00 نهاية السكون');
  });

  it('sanitizeChild: parent/stats تالفين بيتنضفوا', () => {
    const c0 = S.defaultChild();
    const cleaned = S.sanitizeChild({
      ...c0,
      stats: { seconds: -5, weeks: { x: 10, bad: 'نص' }, surahs: { 999: { seconds: 5 } }, days: { '2026-01-01': 5 } },
      parent: { pin: '12a4', enabled: true, dailyCapMin: 13.5, quietFrom: '25:99', quietUntil: 'x' },
    });
    expect(cleaned.stats.seconds).toBe(0);
    expect(Object.keys(cleaned.stats.weeks)).toEqual(['x']);
    expect(cleaned.stats.surahs['999']).toBeUndefined();
    expect(cleaned.parent.pin).toBeNull();
    expect(cleaned.parent.enabled).toBe(false);
    expect(cleaned.parent.quietFrom).toBeNull();
    const ok = S.sanitizeChild({
      ...c0,
      parent: { pin: '4321', enabled: true, dailyCapMin: 30, quietFrom: '21:00', quietUntil: '07:30' },
    });
    expect(ok.parent).toEqual({ pin: '4321', enabled: true, dailyCapMin: 30, quietFrom: '21:00', quietUntil: '07:30' });
  });
});
