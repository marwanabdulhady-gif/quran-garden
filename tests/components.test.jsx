// @vitest-environment happy-dom
// اختبارات المكوّنات (P4-27): Quiz (قواعد الكشف) + StepScreen (تدفق صح/غلط/مساعدة) + Player (تكرار/انتقال)
import { describe, it, expect, vi, beforeEach } from 'vitest';
import React from 'react';
import { render, screen, within, cleanup, fireEvent, act } from '@testing-library/react';

// ---------- mocks قبل استيراد المكوّنات ----------
vi.mock('../src/sound.js', () => ({
  sfx: {
    tap() {},
    ok() {},
    wrong() {},
    gift() {},
    swing() {},
    water() {},
    success() {},
  },
}));

vi.mock('../src/api.js', async () => {
  const { JUZ30 } = await import('../src/juz30.js');
  const mk = (n) => {
    const texts = JUZ30[n] || ['آية 1', 'آية 2', 'آية 3'];
    return {
      number: n,
      name: 'سورة اختبار',
      englishName: 'Test',
      numberOfAyahs: texts.length,
      ayahs: texts.map((text, i) => ({
        number: i + 1,
        numberInSurah: i + 1,
        text,
        audio: `https://aud.test/${n}/${i + 1}.mp3`,
      })),
    };
  };
  return {
    getSurah: async (n) => mk(Number(n)),
    getSurahs: async () =>
      Array.from({ length: 57 }, (_, i) => ({ number: 58 + i, name: 'سورة', englishName: '', numberOfAyahs: 5 })),
    shortName: (x) => (x || '').replace(/^سُورَةُ\s*/, ''),
  };
});

// useAudio مموّه (ما ينشئش Audio حقيقي) — للـ StepScreen
vi.mock('../src/Shared.jsx', async (importOriginal) => {
  const actual = await importOriginal();
  return {
    ...actual,
    useAudio: () => ({ play: () => {}, stop: () => {}, playing: false, error: false, audioRef: { current: null } }),
  };
});

const S = await import('../src/store.js');
const D = await import('../src/data.js');
const { Quiz, StepScreen } = await import('../src/Bridge.jsx');

const flush = () => new Promise((r) => setTimeout(r, 0));

// انتظار يدوي (polling) — أأمن من findBy مع نصوص عربية موزعة على عناصر
async function until(fn, what = 'condition') {
  for (let i = 0; i < 100; i++) {
    if (fn()) return;
    await flush();
  }
  throw new Error('timeout waiting for: ' + what);
}

// ============================================================
describe('Quiz: قواعد كشف الإجابة', () => {
  const options = [
    { id: 'ok', text: 'الإجابة الصحيحة' },
    { id: 'w1', text: 'غلط واحد' },
    { id: 'w2', text: 'غلط اتنين' },
  ];

  it('بدون اختيار: مفيش أي كشف حتى لو reveal', () => {
    const { container } = render(<Quiz options={options} onPick={() => {}} picked={null} correctId="ok" reveal />);
    const btns = container.querySelectorAll('.q-opt');
    expect(btns).toHaveLength(3);
    expect([...btns].some((b) => b.className.includes('correct'))).toBe(false, 'ما يتكسفش الصح قبل محاولة');
  });

  it('بعد محاولة غلط + reveal → الصح يظهر مظلومًا', () => {
    const { container } = render(<Quiz options={options} onPick={() => {}} picked={1} correctId="ok" reveal />);
    const btns = [...container.querySelectorAll('.q-opt')];
    expect(btns[1].className).toContain('wrong', 'الاختيار الغلط بيتعلّم غلط');
    expect(btns[0].className).toContain('correct', 'الصحيحة اتكشفت بعد محاولتين/مساعدة');
  });

  it('الاختيار الصحيح → correct، وبعدين الزرار بيتقفل', () => {
    const { container } = render(<Quiz options={options} onPick={() => {}} picked={0} correctId="ok" disabled />);
    const btns = [...container.querySelectorAll('.q-opt')];
    expect(btns[0].className).toContain('correct');
    expect(btns[0].disabled).toBe(true, 'بعد الصح: الاختيار مقفول');
  });

  it('بدون reveal: محاولة غلط ما بتكسفش الصح', () => {
    const { container } = render(<Quiz options={options} onPick={() => {}} picked={1} correctId="ok" reveal={false} />);
    const btns = [...container.querySelectorAll('.q-opt')];
    expect(btns[0].className).not.toContain('correct');
  });

  it('onClick يعدي (الفهرس، الـ id، العنصر)', () => {
    const onPick = vi.fn();
    const { container } = render(<Quiz options={options} onPick={onPick} picked={null} correctId="ok" />);
    fireEvent.click(container.querySelectorAll('.q-opt')[1]);
    expect(onPick).toHaveBeenCalledWith(1, 'w1', expect.anything());
  });
});

// ============================================================
describe('StepScreen: تدفق الإجابات', () => {
  const trip = D.TRIPS[0];
  const word0 = D.WORDS.find((w) => w.id === trip.words[0]); // subatan
  const word1 = D.WORDS.find((w) => w.id === trip.words[1]); // wahhaja
  const go = vi.fn();

  let container = null;

  const resetStore = () => {
    const c = S.sanitizeChild({ id: 'st1', name: 'سلمان', bridge: { level: 'easy', words: {}, tripsDone: [] } });
    S.setState({
      familyKey: 't',
      version: S.SCHEMA_VERSION,
      children: [c],
      activeChildId: c.id,
      updatedAt: Date.now(),
    });
    return c;
  };

  const mount = async () => {
    const r = render(<StepScreen trip={trip} go={go} />);
    container = r.container;
    await until(() => container.querySelector('.quiz'), 'quiz');
    await flush();
  };

  const body = () => container.querySelector('.step-body');
  const quizBtn = (text) => within(body()).getByText(text).closest('button');

  beforeEach(() => {
    cleanup();
    vi.clearAllMocks();
    container = null;
  });

  it('إجابة صحيحة أول مرة: كلمة اتكملت + نجمة + وسام البداية + شاشة احتفال', async () => {
    const c = resetStore();
    await mount();

    fireEvent.click(quizBtn(word0.meaning));
    await until(() => body().textContent.includes('إجابة صحيحة! أحسنت يا بطل'), 'good feedback');

    let st = S.activeChild(S.getState());
    expect(st.bridge.words[word0.id].done).toBe(true);
    expect(st.stars).toBe(1, 'نجمة واحدة على مستوى متوسط');
    expect(st.badges.some((b) => b.id === 'start')).toBe(true, 'وسام أول كلمة');

    // شاشة الاحتفال طلعت
    await until(() => screen.queryByText('بداية جميلة 🌱'), 'celebrate modal');
    // الزر الأساسي يكمل
    fireEvent.click(screen.getByText('نكمل الرحلة 🌱'));
    await flush();
    expect(S.getState().activeChildId).toBe(c.id);
    (expect(screen.queryByText('بداية جميلة 🌱')).toBeNull(), 'الاحتفال اتقفل');
  });

  it('محاولة غلط (1) → «حاول تاني»، (2) → الكشف التلقائي للمعنى', async () => {
    resetStore();
    await mount();

    // محاولة غلط أولى
    fireEvent.click(quizBtn(word0.wrong[0]));
    await until(() => body().textContent.includes('حاول تاني يا بطل'), 'bad feedback');
    expect(S.wordState(S.activeChild(S.getState()), word0.id).done).toBe(false);
    // المعنى لسه في مكان واحد (الخيار فقط)
    expect(body().querySelectorAll(`span`).length).toBeGreaterThan(0);
    let count = [...body().querySelectorAll('span, p')].filter((el) => el.textContent === word0.meaning).length;
    expect(count).toBe(1, 'قبل الكشف: المعنى في الخيار فقط');

    // محاولة غلط تانية (الخيار التاني الغلطان)
    fireEvent.click(quizBtn(word0.wrong[1]));
    await until(() => {
      const n = [...body().querySelectorAll('span, p')].filter((el) => el.textContent === word0.meaning).length;
      return n > 1;
    }, 'auto reveal');
    expect(body().textContent).toContain(word0.meaning, 'بعد محاولتين: المعنى اتكشف تحت الخيارات');
    // زر المساعدة اختفى
    expect(body().textContent).not.toContain('ساعدني أفهم الكلمة');
    // الكلمة لسه مش تمام (الكشف مش دايماً)
    expect(S.wordState(S.activeChild(S.getState()), word0.id).done).toBe(false);
  });

  it('زر «ساعدني» → كشف فوري للمعنى قبل أي محاولة', async () => {
    resetStore();
    await mount();

    fireEvent.click(within(body()).getByText('ساعدني أفهم الكلمة'));
    await until(() => body().textContent.includes('عرفت المعنى… أحاول مرة أخرى'), 'help reveal');
    const count = [...body().querySelectorAll('span, p')].filter((el) => el.textContent === word0.meaning).length;
    expect(count).toBeGreaterThan(1, 'المساعدة بتكشّف المعنى فورًا');
    expect(S.wordState(S.activeChild(S.getState()), word0.id).done).toBe(false, 'الكشف مش بيعلّم الكلمة');
  });

  it('الانتقال للخطوة التالية بعد الصح (الكلمة التانية ظهرت)', async () => {
    resetStore();
    await mount();

    fireEvent.click(quizBtn(word0.meaning));
    await until(() => screen.queryByText('بداية جميلة 🌱'), 'celebrate');
    // زرار المودال بيقفله بس — التقدم بزرار «نكمل» في جسم الخطوة
    fireEvent.click(screen.getByText('نكمل الرحلة 🌱'));
    await flush();
    fireEvent.click(within(body()).getByText('نكمل إلى الخطوة التالية 🌱'));
    await until(() => container.querySelector('.q-title b')?.textContent === word1.word, 'next word title');

    expect(container.querySelector('.q-title').textContent).toContain(word1.word, 'عنوان السؤال اتغير للكلمة التانية');
    expect(container.querySelector('.title').textContent).toContain('الخطوة 2 من 5', 'عداد الخطوات تكبر');
    expect(S.wordState(S.activeChild(S.getState()), word0.id).done).toBe(true, 'الكلمة الأولى عاملة');
  });
});

// ============================================================
describe('Player: تكرار الآية قبل الانتقال + اكتمال السورة', () => {
  // Audio وهمي بنصنع عليه يدويًا
  class FakeAudio {
    constructor() {
      FakeAudio.instances.push(this);
      this.playbackRate = 1;
      this.src = '';
      this.onended = null;
      this.onerror = null;
    }
    play() {
      return Promise.resolve();
    }
    pause() {}
  }
  FakeAudio.instances = [];

  const G = D.GATES[0];
  const go = vi.fn();

  const resetStore = (repeat) => {
    const c = S.sanitizeChild({ id: 'pl1', name: 'سلمان', playback: { repeat, speed: 1 }, listening: {} });
    S.setState({
      familyKey: 't',
      version: S.SCHEMA_VERSION,
      children: [c],
      activeChildId: c.id,
      updatedAt: Date.now(),
    });
    return c;
  };

  const mountPlayer = async (surahNum = 108) => {
    const { Player } = await import('../src/Listening.jsx');
    const r = render(<Player gate={G} surahNum={surahNum} go={go} />);
    await until(() => r.container.textContent.includes('اضغط واسمع الآية'), 'player ready');
    return r;
  };

  const lastAudio = () => FakeAudio.instances[FakeAudio.instances.length - 1];
  const endAudio = () => {
    const a = lastAudio();
    expect(a.onended).toBeTruthy();
    act(() => {
      a.onended();
    });
  };

  beforeEach(() => {
    cleanup();
    FakeAudio.instances = [];
    globalThis.Audio = FakeAudio;
    vi.clearAllMocks();
  });

  it('repeat=2: الآية بتتكرر مرتين قبل الانتقال للتالية', async () => {
    resetStore(2);
    await mountPlayer(108); // 3 آيات

    fireEvent.click(screen.getByRole('button', { name: '▶️' }));
    await flush();
    const url0 = `https://aud.test/108/1.mp3`;
    expect(lastAudio().src).toBe(url0);
    expect(screen.getByText(/نسمع الآية/)).toBeTruthy();

    // النهاية الأولى: تكرار (نفس الآية)
    endAudio();
    await flush();
    expect(lastAudio().src).toBe(url0, 'التكرار: نفس الآية رجعت');
    expect(S.activeChild(S.getState()).listening['108'].heard).toBe(1);

    // النهاية التانية: انتقال للآية 2
    endAudio();
    await flush();
    expect(lastAudio().src).toBe(`https://aud.test/108/2.mp3`, 'بعد التكرارين: الآية التالية');
  });

  it('repeat=1: انتقال فوري + اكتمال السورة يلمس النجوم والهدايا', async () => {
    resetStore(1);
    await mountPlayer(108); // 3 آيات

    fireEvent.click(screen.getByRole('button', { name: '▶️' }));
    await flush();
    endAudio();
    await flush();
    endAudio();
    await flush();
    endAudio(); // الآية 3 (الأخيرة)
    await flush();

    const st = S.activeChild(S.getState());
    expect(st.listening['108'].completed).toBe(true, 'السورة اتكملت');
    expect(st.stars).toBe(2, 'اكتمال سورة = نجمتين');
    expect(st.gifts.pending).toBe(1, 'هدية اتضافت');
    (expect(screen.queryByRole('button', { name: '⏸' })).toBeNull(), 'التشغيل وقف بعد النهاية');
  });

  it('زر الآية التالية/السابقة بيغيّر الآية', async () => {
    resetStore(1);
    await mountPlayer(108);

    fireEvent.click(screen.getByRole('button', { name: 'الآية التالية' }));
    await flush();
    expect(lastAudio().src).toBe(`https://aud.test/108/2.mp3`);
    fireEvent.click(screen.getByRole('button', { name: 'الآية السابقة' }));
    await flush();
    expect(lastAudio().src).toBe(`https://aud.test/108/1.mp3`);
  });

  it('اختصارات الكيبورد: أسهم = السابقة/التالية', async () => {
    resetStore(1);
    await mountPlayer(108);

    fireEvent.keyDown(window, { key: 'ArrowRight' });
    await flush();
    expect(lastAudio().src).toBe(`https://aud.test/108/2.mp3`);
    fireEvent.keyDown(window, { key: 'ArrowLeft' });
    await flush();
    expect(lastAudio().src).toBe(`https://aud.test/108/1.mp3`);
  });
});
