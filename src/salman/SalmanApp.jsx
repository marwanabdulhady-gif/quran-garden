import React, { useCallback, useEffect, useState } from 'react';
import { GARDENS, GARDEN_ORDER } from './data/gardens.js';
import { QURAN_LEVELS, SURAHS } from './data/quran.js';
import { BACKGROUNDS, MASCOTS, GARDEN_MASCOT } from './data/art.js';
import { JUZ30 } from '../juz30.js';
import { FATIHA } from './data/fatiha.js';
import {
  BADGES,
  dayKeyFrom,
  finishVisit,
  growthStage,
  levelDone,
  levelUnlocked,
  answerItem,
  exposeItem,
  newAllowed,
  recordStory,
  recordSurah,
  GIFTS,
} from './lib/gamify.js';
import { CATALOG, gardenItems, toArabicNumeral } from './lib/catalog.js';
import { pickSession } from './lib/session.js';
import { countVisit, riyadhHour, visitGate } from './lib/parent.js';
import ParentArea from './ParentArea.jsx';
import { loadState, saveState } from './lib/store.js';
import { canSpeak, speak } from './lib/speech.js';
import { playClip, playStory, assetUrl } from './lib/voice.js';
import { sfx } from './lib/sfx.js';

const CONFETTI_COLORS = ['#f43f5e', '#fbbf24', '#10b981', '#38bdf8', '#a78bfa', '#fb923c'];

// قطع ملوّنة متساقطة للاحتفال (تُعطَّل تلقائيًا عند تفضيل تقليل الحركة في CSS)
function Confetti() {
  return (
    <div className="sg-confetti" aria-hidden="true">
      {Array.from({ length: 24 }, (_, i) => (
        <span
          key={i}
          style={{
            left: `${(i * 37) % 100}%`,
            animationDelay: `${(i % 6) * 0.12}s`,
            background: CONFETTI_COLORS[i % CONFETTI_COLORS.length],
          }}
        />
      ))}
    </div>
  );
}

// نافذة احتفال تظهر ثم تختفي (أو تُغلق بلمسة)
function Celebrate({ data, onClose }) {
  useEffect(() => {
    const t = setTimeout(onClose, 3800);
    return () => clearTimeout(t);
  }, [onClose]);
  return (
    <div className="sg-celebrate" role="dialog" aria-label={data.title} onClick={onClose}>
      <Confetti />
      <div className="sg-celebrate-card">
        {data.art ? (
          <img className="sg-celebrate-art sg-bounce" src={assetUrl(data.art)} alt="" />
        ) : (
          <span className="sg-big sg-bounce">{data.emoji}</span>
        )}
        <h2 className="sg-title">{data.title}</h2>
        {data.sub && <p className="sg-sub">{data.sub}</p>}
        <p className="sg-tap-hint">اضغط للمتابعة</p>
      </div>
    </div>
  );
}

// درس واحد: قصة + سؤال من خيارين. الخطأ لا يعاقب، وبعد محاولتين يظهر الجواب الصحيح بلون مميز.
function Lesson({ item, onCorrect, onMiss, onContinue, continueLabel }) {
  const [tries, setTries] = useState(0);
  const [solved, setSolved] = useState(false);
  const [message, setMessage] = useState('');
  const garden = GARDENS[item.garden];
  const lang = item.lang || 'ar';

  const pick = (choice) => {
    if (solved) return;
    sfx('tap');
    if (choice === item.question.answer) {
      setSolved(true);
      setMessage('أحسنت! ⭐');
      onCorrect(tries === 0);
    } else {
      if (tries === 0) onMiss?.();
      const nextTries = tries + 1;
      setTries(nextTries);
      setMessage('قريب! جرّب مرة ثانية 🤗');
      sfx('retry');
      if (nextTries === 2) playClip('hint');
      else playClip('retry');
    }
  };

  return (
    <section className="sg-lesson" aria-label={item.title}>
      <div className="sg-hero sg-hero-small" style={{ backgroundImage: `url(${assetUrl(BACKGROUNDS[item.garden])})` }}>
        <img className="sg-mascot-small" src={assetUrl(MASCOTS[GARDEN_MASCOT[item.garden]])} alt="" />
      </div>
      <p className="sg-chip" style={{ background: garden.color }}>
        {garden.emoji} {garden.name} · {garden.guide}
      </p>
      <h2 className="sg-title" lang={lang}>
        {item.title}
      </h2>
      {item.draft && (
        <p className="sg-draft-note" lang="ar">
          📝 مسودة: قيد المراجعة قبل أن تُسمع بصوت المعلّم
        </p>
      )}
      {item.countArt && <CountPicture {...item.countArt} />}
      <div className={item.countArt ? 'sg-story sg-story-hidden' : 'sg-story'} lang={lang}>
        {item.paragraphs.map((p, i) => (
          <p key={i}>{p}</p>
        ))}
      </div>
      {canSpeak() && (
        <button
          type="button"
          className="sg-btn sg-btn-soft"
          onClick={() => playStory(item.audio, item.paragraphs.join(' '), lang)}
        >
          🔊 اسمع القصة
        </button>
      )}
      <p className="sg-prompt" lang={item.question.prompt.match(/[A-Za-z]/) ? 'en' : 'ar'}>
        {item.question.prompt}
      </p>
      <div className="sg-choices">
        {item.question.choices.map((c) => {
          const hinted = !solved && tries >= 2 && c === item.question.answer;
          const cls = ['sg-choice', solved && c === item.question.answer ? 'is-right' : '', hinted ? 'is-hint' : '']
            .filter(Boolean)
            .join(' ');
          return (
            <button
              key={c}
              type="button"
              className={item.question.choiceArt?.[c] ? `${cls} has-art` : cls}
              onClick={() => pick(c)}
              disabled={solved}
            >
              {item.question.choiceArt?.[c] && (
                <img className="sg-choice-art" src={assetUrl(item.question.choiceArt[c])} alt="" />
              )}
              <span lang={lang}>{c}</span>
            </button>
          );
        })}
      </div>
      <p className="sg-message" role="status" aria-live="polite">
        {message}
      </p>
      {solved && (
        <button type="button" className="sg-btn sg-btn-main" onClick={onContinue}>
          {continueLabel}
        </button>
      )}
    </section>
  );
}

function Header({ state }) {
  return (
    <header className="sg-top">
      <span className="sg-pill" aria-label="أيام متتالية">
        🔥 {toArabicNumeral(state.streak.current)} يوم
      </span>
      <span className="sg-pill" aria-label="النجوم">
        ⭐ {toArabicNumeral(state.stars)}
      </span>
    </header>
  );
}

function Back({ onClick, label = 'رجوع للغابة' }) {
  return (
    <button type="button" className="sg-btn sg-btn-soft sg-back" onClick={onClick}>
      ➡ {label}
    </button>
  );
}

function Mascot({ name, bubble, className = '' }) {
  return (
    <div className={`sg-guide ${className}`}>
      <img className="sg-mascot" src={assetUrl(MASCOTS[name])} alt="" />
      {bubble && <p className="sg-bubble">{bubble}</p>}
    </div>
  );
}

function gardenStageIndex(state, garden) {
  return growthStage(state.gardens[garden] || 0).index;
}

// الأشياء المعدودة (مرحلة C): صورة لكل شيء. إن تعذّر تحميلها يُعرض الإيموجي بدلها
function CountPicture({ n, object, emoji }) {
  const [failed, setFailed] = useState(false);
  if (failed) {
    return (
      <p className="sg-count-emoji" aria-hidden="true">
        {Array(n).fill(emoji).join(' ')}
      </p>
    );
  }
  return (
    <div className="sg-count-row" aria-hidden="true">
      {Array.from({ length: n }, (_, i) => (
        <img
          key={i}
          className="sg-count-art"
          src={assetUrl(`salman/art/count/${object}.png`)}
          alt=""
          onError={() => setFailed(true)}
        />
      ))}
    </div>
  );
}

export default function SalmanApp() {
  const [state, setState] = useState(() => loadState());
  const [screen, setScreen] = useState({ name: 'home' });
  const [openSurah, setOpenSurah] = useState(null);
  const [celebrate, setCelebrate] = useState(null);
  const today = dayKeyFrom();

  useEffect(() => {
    saveState(state);
  }, [state]);

  const closeCelebrate = useCallback(() => setCelebrate(null), []);

  // كل إجابة صحيحة: نجوم + صوت + احتفال إن نمت شجرة أو فُتح وسام
  const credit = (item, firstTry) => {
    const before = gardenStageIndex(state, item.garden);
    const r = recordStory(state, { storyId: item.id, garden: item.garden, firstTry, dayKey: today });
    // Leitner: الإجابة الأولى فقط، والخطأ الأول يُسجَّل في onMiss
    const next = firstTry
      ? answerItem(r.state, { itemId: item.id, garden: item.garden, correct: true, dayKey: today })
      : r.state;
    setState(next);
    sfx('correct');
    const after = gardenStageIndex(next, item.garden);
    if (after > before) {
      setCelebrate({
        emoji: GARDENS[item.garden].emoji,
        title: 'شجرة جديدة!',
        sub: `${GARDENS[item.garden].name} تكبر معك`,
        clip: 'garden-grow',
      });
    } else if (r.newBadges.length) {
      const badge = BADGES.find((b) => b.id === r.newBadges[0]);
      setCelebrate({ emoji: badge.emoji, art: badge.art, title: 'وسام جديد!', sub: badge.title, clip: 'badge' });
    } else {
      playClip('correct');
    }
    return r;
  };

  // خطأ أول محاولة: يُسجَّل غلطًا في Leitner (بدون أي عقوبة ظاهرة)
  const missItem = (item) => {
    setState((s) => answerItem(s, { itemId: item.id, garden: item.garden, correct: false, dayKey: today }));
  };

  // أول ظهور للعنصر: يصبح «شُوهد» ويُحسب ضمن حدّ الجديد اليومي
  const showItem = (item) => {
    setState((s) => exposeItem(s, { itemId: item.id, garden: item.garden, dayKey: today }));
  };

  // ---------- زيارة اليوم ----------
  const startVisit = () => {
    // وضع ولي الأمر: حدّ الزيارات وساعات الهدوء. الرفض لا يُظهر عدّادًا ولا عقوبة
    if (!visitGate(state, { dayKey: today, hour: riyadhHour() }).open) return;
    const plan = pickSession(state, CATALOG, today);
    if (state.streak.current >= 2) playClip('streak');
    setState((s) => countVisit(s, today));
    if (plan[0]) showItem(plan[0]);
    setScreen({ name: 'visit', plan, step: 0, stars: 0, badges: [] });
  };

  const visitCorrect = (item, firstTry) => {
    const r = credit(item, firstTry);
    setScreen((s) => ({ ...s, stars: s.stars + r.earned, badges: [...s.badges, ...r.newBadges] }));
  };

  const visitNext = () => {
    setCelebrate(null);
    const nextStep = screen.step + 1;
    if (nextStep < screen.plan.length) {
      showItem(screen.plan[nextStep]);
      setScreen({ ...screen, step: nextStep });
      return;
    }
    const f = finishVisit(state);
    setState(f.state);
    setScreen({
      name: 'reward',
      stars: screen.stars,
      badges: [...screen.badges, ...f.newBadges],
      gift: f.gift,
      streak: f.state.streak.current,
    });
  };

  // صوت وتأثير عند الوصول إلى شاشة الهدية
  useEffect(() => {
    if (screen.name === 'reward') {
      sfx('gift');
      playClip('visit-done');
    }
  }, [screen.name]);

  const celebrateLayer = celebrate ? <Celebrate data={celebrate} onClose={closeCelebrate} /> : null;

  if (screen.name === 'visit') {
    const item = screen.plan[screen.step];
    return (
      <main className="sg-app" dir="rtl">
        {celebrateLayer}
        <p className="sg-progress" aria-label="تقدّم الزيارة">
          زيارة اليوم · {toArabicNumeral(screen.step + 1)} / {toArabicNumeral(screen.plan.length)}
        </p>
        <Lesson
          key={item.id}
          item={item}
          onCorrect={(firstTry) => visitCorrect(item, firstTry)}
          onMiss={() => missItem(item)}
          onContinue={visitNext}
          continueLabel={screen.step + 1 < screen.plan.length ? 'التالي ➜' : 'انتهت الزيارة 🎁'}
        />
      </main>
    );
  }

  if (screen.name === 'reward') {
    return (
      <main className="sg-app sg-reward" dir="rtl">
        <Mascot name="salman" className="sg-bounce" bubble="أحسنت يا بطل!" />
        <h1 className="sg-title">🎉 أحسنت يا بطل!</h1>
        {screen.gift.art ? (
          <img className="sg-gift-art" src={assetUrl(screen.gift.art)} alt="" />
        ) : (
          <p className="sg-big">{screen.gift.emoji}</p>
        )}
        <p>هدية اليوم: {screen.gift.name}</p>
        <p>
          ⭐ {toArabicNumeral(screen.stars)} نجوم في هذه الزيارة · 🔥 {toArabicNumeral(screen.streak)} يوم متتالي
        </p>
        {screen.badges.length > 0 && (
          <div className="sg-new-badges">
            <p>أوسمة جديدة:</p>
            {screen.badges.map((id) => {
              const b = BADGES.find((x) => x.id === id);
              return (
                <span key={id} className="sg-badge">
                  {b ? `${b.emoji} ${b.title}` : id}
                </span>
              );
            })}
          </div>
        )}
        <button type="button" className="sg-btn sg-btn-main" onClick={() => setScreen({ name: 'home' })}>
          رجوع للغابة 🌳
        </button>
      </main>
    );
  }

  if (screen.name === 'lesson') {
    const item = gardenItems(screen.garden).find((it) => it.id === screen.itemId);
    if (!item) {
      return (
        <main className="sg-app" dir="rtl">
          <Back onClick={() => setScreen({ name: 'home' })} />
        </main>
      );
    }
    return (
      <main className="sg-app" dir="rtl">
        {celebrateLayer}
        <Back onClick={() => setScreen({ name: 'garden', garden: screen.garden })} label="رجوع للحديقة" />
        <Lesson
          key={item.id}
          item={item}
          onCorrect={(firstTry) => credit(item, firstTry)}
          onMiss={() => missItem(item)}
          onContinue={() => {
            setCelebrate(null);
            setScreen({ name: 'garden', garden: screen.garden });
          }}
          continueLabel="القصة التالية ➜"
        />
      </main>
    );
  }

  if (screen.name === 'garden') {
    const g = GARDENS[screen.garden];
    const items = gardenItems(screen.garden);
    const stage = growthStage(state.gardens[screen.garden] || 0);
    const freshLeft = newAllowed(state, screen.garden, today);
    return (
      <main className="sg-app" dir="rtl">
        <Back onClick={() => setScreen({ name: 'home' })} />
        <div className="sg-hero" style={{ backgroundImage: `url(${assetUrl(BACKGROUNDS[screen.garden])})` }}>
          <img className="sg-hero-plant" src={assetUrl(stage.art)} alt="" />
        </div>
        <h1 className="sg-title" style={{ color: g.color }}>
          {g.emoji} {g.name}
        </h1>
        <p className="sg-sub">
          {stage.name} · ⭐ {toArabicNumeral(state.gardens[screen.garden] || 0)}
        </p>
        <Mascot name={GARDEN_MASCOT[screen.garden]} bubble={`أهلًا! أنا ${g.guide}، هيا نتعلّم معًا`} />
        <ul className="sg-list">
          {items.map((it) => {
            const done = !!state.doneStories[it.id];
            const fresh = !state.skills[it.id];
            const locked = fresh && freshLeft <= 0;
            return (
              <li key={it.id}>
                <button
                  type="button"
                  className={done ? 'sg-row is-done' : locked ? 'sg-row is-locked' : 'sg-row'}
                  disabled={locked}
                  onClick={() => {
                    if (fresh) showItem(it);
                    setScreen({ name: 'lesson', garden: screen.garden, itemId: it.id });
                  }}
                >
                  <span>{done ? '✅' : locked ? '🌙' : '📖'}</span>
                  <span lang={it.lang || 'ar'}>{locked ? 'غدًا' : it.title}</span>
                </button>
              </li>
            );
          })}
        </ul>
        {screen.garden === 'quran' && (
          <button type="button" className="sg-btn sg-btn-soft" onClick={() => setScreen({ name: 'quran' })}>
            📗 مستويات السور
          </button>
        )}
      </main>
    );
  }

  if (screen.name === 'parent') {
    return <ParentArea state={state} setState={setState} onBack={() => setScreen({ name: 'home' })} />;
  }

  if (screen.name === 'quran') {
    return (
      <main className="sg-app" dir="rtl">
        {celebrateLayer}
        <Back onClick={() => setScreen({ name: 'home' })} />
        <h1 className="sg-title">📗 مستويات السور</h1>
        {QURAN_LEVELS.map((lvl) => {
          const unlocked = levelUnlocked(state, lvl.level);
          const done = levelDone(state, lvl.level);
          return (
            <section key={lvl.level} className={unlocked ? 'sg-level' : 'sg-level is-locked'}>
              <h2 className="sg-level-title">
                {done ? '🏆 ' : unlocked ? '✨ ' : '🔒 '}
                {lvl.title}
              </h2>
              {!unlocked && <p className="sg-sub">افتح المستوى السابق أولًا 🌱</p>}
              {lvl.surahs.map((sid) => {
                const s = SURAHS[sid];
                const learned = !!state.learnedSurahs[sid];
                const open = openSurah === sid;
                const verses = sid === 1 ? FATIHA.ayahs : JUZ30[sid];
                return (
                  <article key={sid} className="sg-surah">
                    <button type="button" className="sg-row" onClick={() => setOpenSurah(open ? null : sid)}>
                      <span>{learned ? '✅' : '📜'}</span>
                      <span>
                        سورة {s.name} · {toArabicNumeral(s.ayahs)} آيات
                      </span>
                    </button>
                    {open && (
                      <div className="sg-verses" lang="ar">
                        {verses ? verses.join(' ۝ ') : 'النص يُضاف قريبًا.'}
                      </div>
                    )}
                    {unlocked && !learned && (
                      <button
                        type="button"
                        className="sg-btn sg-btn-main"
                        onClick={() => {
                          const wasDone = levelDone(state, lvl.level);
                          const r = recordSurah(state, { surahId: sid, dayKey: today });
                          setState(r.state);
                          sfx('levelUp');
                          if (!wasDone && levelDone(r.state, lvl.level)) {
                            setCelebrate({ emoji: '📗', title: 'مستوى مكتمل!', sub: lvl.title, clip: 'level-unlock' });
                          } else {
                            setCelebrate({
                              emoji: '📜',
                              title: 'سورة محفوظة!',
                              sub: `سورة ${s.name}`,
                              clip: 'surah-learned',
                            });
                          }
                        }}
                      >
                        حفظتها ✓ (+⭐⭐)
                      </button>
                    )}
                  </article>
                );
              })}
            </section>
          );
        })}
      </main>
    );
  }

  if (screen.name === 'badges') {
    return (
      <main className="sg-app" dir="rtl">
        <Back onClick={() => setScreen({ name: 'home' })} />
        <h1 className="sg-title">🏅 الأوسمة</h1>
        <p className="sg-sub">
          🎁 هدايا: {toArabicNumeral(state.gifts.length)}{' '}
          {state.gifts.map((id) => {
            const g = GIFTS.find((x) => x.id === id);
            return g?.art ? <img key={id} className="sg-gift-chip" src={assetUrl(g.art)} alt={g.name} /> : g?.emoji;
          })}
        </p>
        <div className="sg-badges">
          {BADGES.map((b) => {
            const got = !!state.badges[b.id];
            return (
              <div key={b.id} className={got ? 'sg-badge-card' : 'sg-badge-card is-locked'}>
                {got ? (
                  <img className="sg-badge-art" src={assetUrl(b.art)} alt="" />
                ) : (
                  <span className="sg-big">🔒</span>
                )}
                <span>{b.title}</span>
              </div>
            );
          })}
        </div>
      </main>
    );
  }

  // ---------- الغابة الرئيسية ----------
  const gate = visitGate(state, { dayKey: today, hour: riyadhHour() });
  return (
    <main className="sg-app" dir="rtl">
      <Header state={state} />
      <Mascot
        name="salman"
        bubble={
          <>
            <button type="button" className="sg-link" onClick={() => playClip('welcome')}>
              🔊 اسمع الترحيب
            </button>
          </>
        }
      />
      <h1 className="sg-title">🌳 غابة سلمان</h1>
      <p className="sg-sub">أربع حدائق تنمو معك كل يوم</p>

      <div className="sg-gardens">
        {GARDEN_ORDER.map((id) => {
          const g = GARDENS[id];
          const stars = state.gardens[id] || 0;
          const st = growthStage(stars);
          const pct = st.next ? Math.round(((stars - st.min) / (st.next.min - st.min)) * 100) : 100;
          return (
            <button
              key={id}
              type="button"
              className="sg-garden"
              style={{ borderColor: g.color }}
              onClick={() => setScreen({ name: 'garden', garden: id })}
            >
              <img className="sg-garden-art" src={assetUrl(st.art)} alt="" />
              <span className="sg-garden-name">{g.name}</span>
              <span className="sg-sub">
                {st.name} · ⭐ {toArabicNumeral(stars)}
              </span>
              <span className="sg-bar" aria-hidden="true">
                <span style={{ width: `${pct}%`, background: g.color }} />
              </span>
            </button>
          );
        })}
      </div>

      {gate.open ? (
        <button type="button" className="sg-btn sg-btn-main sg-visit" onClick={startVisit}>
          ✨ زيارة اليوم (١٠ دقايق)
        </button>
      ) : (
        <p className="sg-gate" role="status">
          {gate.reason === 'quiet' ? '🌙 الغابة نايمة الآن. نرجع الصبح!' : '🎁 خلصت زيارة اليوم. تعال بكرة!'}
        </p>
      )}
      <div className="sg-row-buttons">
        <button type="button" className="sg-btn sg-btn-soft" onClick={() => setScreen({ name: 'quran' })}>
          📗 مستويات السور
        </button>
        <button type="button" className="sg-btn sg-btn-soft" onClick={() => setScreen({ name: 'badges' })}>
          🏅 الأوسمة
        </button>
      </div>
      <button type="button" className="sg-btn sg-btn-soft sg-parent-link" onClick={() => setScreen({ name: 'parent' })}>
        🔒 ولي الأمر
      </button>
    </main>
  );
}
