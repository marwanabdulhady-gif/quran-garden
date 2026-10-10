import React, { useEffect, useState } from 'react';
import { GARDENS, GARDEN_ORDER } from './data/gardens.js';
import { QURAN_LEVELS, SURAHS } from './data/quran.js';
import { JUZ30 } from '../juz30.js';
import {
  BADGES,
  dayKeyFrom,
  finishVisit,
  growthStage,
  levelDone,
  levelUnlocked,
  recordStory,
  recordSurah,
  GIFTS,
} from './lib/gamify.js';
import { gardenItems, visitPlan, toArabicNumeral } from './lib/catalog.js';
import { loadState, saveState } from './lib/store.js';
import { speak, canSpeak } from './lib/speech.js';

// درس واحد: قصة + سؤال من خيارين. الخطأ لا يعاقب، وبعد محاولتين يظهر الجواب الصحيح بلون مميز.
function Lesson({ item, onCorrect, onContinue, continueLabel }) {
  const [tries, setTries] = useState(0);
  const [solved, setSolved] = useState(false);
  const [message, setMessage] = useState('');
  const garden = GARDENS[item.garden];
  const lang = item.lang || 'ar';

  const pick = (choice) => {
    if (solved) return;
    if (choice === item.question.answer) {
      setSolved(true);
      setMessage('أحسنت! ⭐');
      onCorrect(tries === 0);
    } else {
      setTries((t) => t + 1);
      setMessage('قريب! جرّب مرة ثانية 🤗');
    }
  };

  return (
    <section className="sg-lesson" aria-label={item.title}>
      <p className="sg-chip" style={{ background: garden.color }}>
        {garden.emoji} {garden.name} · {garden.guide}
      </p>
      <h2 className="sg-title" lang={lang}>
        {item.title}
      </h2>
      <div className="sg-story" lang={lang}>
        {item.paragraphs.map((p, i) => (
          <p key={i}>{p}</p>
        ))}
      </div>
      {canSpeak() && (
        <button type="button" className="sg-btn sg-btn-soft" onClick={() => speak(item.paragraphs.join(' '), lang)}>
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
            <button key={c} type="button" className={cls} onClick={() => pick(c)} disabled={solved}>
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

export default function SalmanApp() {
  const [state, setState] = useState(() => loadState());
  const [screen, setScreen] = useState({ name: 'home' });
  const [openSurah, setOpenSurah] = useState(null);
  const today = dayKeyFrom();

  useEffect(() => {
    saveState(state);
  }, [state]);

  const credit = (item, firstTry) => {
    const r = recordStory(state, { storyId: item.id, garden: item.garden, firstTry, dayKey: today });
    setState(r.state);
    return r;
  };

  // ---------- زيارة اليوم ----------
  const startVisit = () => {
    const plan = visitPlan(state.doneStories);
    setScreen({ name: 'visit', plan, step: 0, stars: 0, badges: [] });
  };

  const visitCorrect = (item, firstTry) => {
    const r = credit(item, firstTry);
    setScreen((s) => ({ ...s, stars: s.stars + r.earned, badges: [...s.badges, ...r.newBadges] }));
  };

  const visitNext = () => {
    const nextStep = screen.step + 1;
    if (nextStep < screen.plan.length) {
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

  // ---------- الحديقة ----------
  if (screen.name === 'visit') {
    const item = screen.plan[screen.step];
    return (
      <main className="sg-app" dir="rtl">
        <p className="sg-progress" aria-label="تقدّم الزيارة">
          زيارة اليوم · {toArabicNumeral(screen.step + 1)} / {toArabicNumeral(screen.plan.length)}
        </p>
        <Lesson
          key={item.id}
          item={item}
          onCorrect={(firstTry) => visitCorrect(item, firstTry)}
          onContinue={visitNext}
          continueLabel={screen.step + 1 < screen.plan.length ? 'التالي ➜' : 'انتهت الزيارة 🎁'}
        />
      </main>
    );
  }

  if (screen.name === 'reward') {
    return (
      <main className="sg-app sg-reward" dir="rtl">
        <h1 className="sg-title">🎉 أحسنت يا بطل!</h1>
        <p className="sg-big">{screen.gift.emoji}</p>
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
        <Back onClick={() => setScreen({ name: 'garden', garden: screen.garden })} label="رجوع للحديقة" />
        <Lesson
          key={item.id}
          item={item}
          onCorrect={(firstTry) => credit(item, firstTry)}
          onContinue={() => setScreen({ name: 'garden', garden: screen.garden })}
          continueLabel="القصة التالية ➜"
        />
      </main>
    );
  }

  if (screen.name === 'garden') {
    const g = GARDENS[screen.garden];
    const items = gardenItems(screen.garden);
    const stage = growthStage(state.gardens[screen.garden] || 0);
    return (
      <main className="sg-app" dir="rtl">
        <Back onClick={() => setScreen({ name: 'home' })} />
        <h1 className="sg-title" style={{ color: g.color }}>
          {g.emoji} {g.name}
        </h1>
        <p className="sg-sub">
          {stage.emoji} {stage.name} · ⭐ {toArabicNumeral(state.gardens[screen.garden] || 0)}
        </p>
        <ul className="sg-list">
          {items.map((it) => {
            const done = !!state.doneStories[it.id];
            return (
              <li key={it.id}>
                <button
                  type="button"
                  className={done ? 'sg-row is-done' : 'sg-row'}
                  onClick={() => setScreen({ name: 'lesson', garden: screen.garden, itemId: it.id })}
                >
                  <span>{done ? '✅' : '📖'}</span>
                  <span lang={it.lang || 'ar'}>{it.title}</span>
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

  if (screen.name === 'quran') {
    return (
      <main className="sg-app" dir="rtl">
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
                const verses = JUZ30[sid];
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
                        {verses ? verses.join(' ۝ ') : 'نص الفاتحة يُضاف قريبًا (يعمل بدون إنترنت بعد الإضافة).'}
                      </div>
                    )}
                    {unlocked && !learned && (
                      <button
                        type="button"
                        className="sg-btn sg-btn-main"
                        onClick={() => setState(recordSurah(state, { surahId: sid, dayKey: today }).state)}
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
          {state.gifts.map((id) => GIFTS.find((g) => g.id === id)?.emoji).join(' ')}
        </p>
        <div className="sg-badges">
          {BADGES.map((b) => {
            const got = !!state.badges[b.id];
            return (
              <div key={b.id} className={got ? 'sg-badge-card' : 'sg-badge-card is-locked'}>
                <span className="sg-big">{got ? b.emoji : '🔒'}</span>
                <span>{b.title}</span>
              </div>
            );
          })}
        </div>
      </main>
    );
  }

  // ---------- الغابة الرئيسية ----------
  return (
    <main className="sg-app" dir="rtl">
      <Header state={state} />
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
              <span className="sg-big">{st.emoji}</span>
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

      <button type="button" className="sg-btn sg-btn-main sg-visit" onClick={startVisit}>
        ✨ زيارة اليوم (١٠ دقايق)
      </button>
      <div className="sg-row-buttons">
        <button type="button" className="sg-btn sg-btn-soft" onClick={() => setScreen({ name: 'quran' })}>
          📗 مستويات السور
        </button>
        <button type="button" className="sg-btn sg-btn-soft" onClick={() => setScreen({ name: 'badges' })}>
          🏅 الأوسمة
        </button>
      </div>
    </main>
  );
}
