import React, { useCallback, useEffect, useState } from 'react';
import { GARDENS, GARDEN_ORDER } from './data/gardens.js';
import { BACKGROUNDS, MASCOTS, GARDEN_MASCOT } from './data/art.js';
import {
  BADGES,
  dayKeyFrom,
  finishVisit,
  growthStage,
  answerItem,
  exposeItem,
  newAllowed,
  recordStory,
  recordHuroofLevel,
  recordSurah,
  levelDone,
  levelUnlocked,
  GIFTS,
} from './lib/gamify.js';
import { CATALOG, gardenItems, toArabicNumeral } from './lib/catalog.js';
import { QURAN_LEVELS, SURAHS } from './data/quran.js';
import { JUZ30 } from '../juz30.js';
import { FATIHA } from './data/fatiha.js';
import { pickSession } from './lib/session.js';
import { countVisit, riyadhHour, visitGate } from './lib/parent.js';
import ParentArea from './ParentArea.jsx';
import Play from '../huroof/components/Play.jsx';
import '../huroof/huroof.css';
import QuranJourney from '../App.jsx';
import '../styles.css';
import { useGarden, activeChild } from '../store.js';
import { LEVEL_DATA as HUROOF_LEVELS } from '../huroof/data/index.js';
import { ANIMALS } from './data/animals.js';
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
      {item.art && <img className="sg-scene" src={assetUrl(item.art)} alt="" />}
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

// تحية حسب وقت اليوم في الرياض
function greeting() {
  const h = riyadhHour();
  if (h < 12) return 'صباح الخير يا سلمان ☀️';
  if (h < 18) return 'مساء النور يا سلمان 🌤️';
  return 'مساء الخير يا سلمان 🌙';
}

// بطاقة قصة أو تمرين داخل الحديقة
function ItemCard({ item, state, freshLeft, onOpen }) {
  const done = !!state.doneStories[item.id];
  const fresh = !state.skills[item.id];
  const locked = fresh && freshLeft <= 0;
  const cls = ['sg-card', done ? 'is-done' : '', locked ? 'is-locked' : ''].filter(Boolean).join(' ');
  return (
    <li>
      <button type="button" className={cls} disabled={locked} onClick={() => onOpen(item, fresh)}>
        {item.art ? (
          <img className="sg-card-art" src={assetUrl(item.art)} alt="" loading="lazy" />
        ) : item.lang === 'en' ? (
          <span className="sg-card-glyph" lang="en" aria-hidden="true">
            {item.question.answer}
          </span>
        ) : (
          <span className="sg-card-icon" aria-hidden="true">
            {item.source === 'match' ? '🐾' : item.source === 'count' ? '🔢' : item.lang === 'en' ? '🔤' : '📖'}
          </span>
        )}
        <span className="sg-card-title" lang={item.lang || 'ar'}>
          {locked ? 'غدًا 🌙' : item.title}
        </span>
        {done && (
          <span className="sg-card-done" aria-label="مكتملة">
            ✓
          </span>
        )}
      </button>
    </li>
  );
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

// ---------- التنقّل: شريط علوي + شريط حدائق سفلي + زر الرجوع في الهاتف ----------
const TABS = [
  { id: 'home', label: 'الغابة', icon: '🏠' },
  { id: 'arabic', label: 'الحروف', icon: '🌸' },
  { id: 'math', label: 'الأرقام', icon: '🍎' },
  { id: 'quran', label: 'القرآن', icon: '🌴' },
  { id: 'english', label: 'English', icon: '🌻' },
];

// أي تبويب يتبع له كل شاشة
function tabOf(screen) {
  if (screen.name === 'garden') return screen.garden;
  if (['station', 'play', 'letter'].includes(screen.name)) return 'arabic';
  if (screen.name === 'lesson') return screen.garden;
  if (screen.name === 'quran') return 'quran';
  return 'home';
}

// الشاشة الأم (لزر الرجوع عند فتح رابط مباشر)
function parentOf(screen) {
  if (screen.name === 'letter') return screen.level ? { name: 'station', level: screen.level } : ARABIC_HOME;
  if (screen.name === 'station' || screen.name === 'play') return ARABIC_HOME;
  if (screen.name === 'lesson') return screen.from || { name: 'garden', garden: screen.garden };
  return HOME;
}

const HOME = { name: 'home' };
// حديقة القرآن: ثلاثة أقسام في مكان واحد
const QURAN_VIEWS = [
  { id: 'journey', label: '🎧 رحلة القرآن' },
  { id: 'stories', label: '📖 قصص السور' },
  { id: 'levels', label: '📗 المستويات' },
];
const ARABIC_HOME = { name: 'garden', garden: 'arabic' };

function hashOf(screen) {
  switch (screen.name) {
    case 'garden':
      return `#/${screen.garden}`;
    case 'quran':
      return screen.view && screen.view !== 'journey' ? `#/quran/${screen.view}` : '#/quran';
    case 'station':
      return `#/arabic/${screen.level}`;
    case 'play':
      return `#/arabic/${screen.level}/play`;
    case 'letter':
      return `#/arabic/letter/${encodeURIComponent(screen.letter)}`;
    case 'badges':
      return '#/badges';
    default:
      return '#/';
  }
}

export function screenFromHash(hash = '') {
  if (hash.startsWith('#garden=')) return { name: 'quran' }; // رابط استرجاع حديقة القرآن
  const parts = hash.replace(/^#\/?/, '').split('/').filter(Boolean).map(decodeURIComponent);
  const [a, b, c] = parts;
  if (a === 'quran') return { name: 'quran', view: QURAN_VIEWS.some((v) => v.id === b) ? b : 'journey' };
  if (a === 'badges') return { name: 'badges' };
  if (a === 'math' || a === 'english') return { name: 'garden', garden: a };
  if (a === 'arabic') {
    if (b === 'letter' && ANIMALS[c]) return { name: 'letter', letter: c };
    const level = Number(b);
    if (HUROOF_LEVELS.some((l) => l.id === level))
      return c === 'play' ? { name: 'play', level } : { name: 'station', level };
    return ARABIC_HOME;
  }
  return HOME;
}

function TopBar({ title, onBack, state, color }) {
  return (
    <header className="sg-topbar" style={color ? { '--g': color } : undefined}>
      {onBack ? (
        <button type="button" className="sg-icon-btn" onClick={onBack} aria-label="رجوع">
          ➜
        </button>
      ) : (
        <span className="sg-pill" aria-label="أيام متتالية">
          🔥 {toArabicNumeral(state.streak.current)}
        </span>
      )}
      <h1 className="sg-topbar-title">{title}</h1>
      <span className="sg-pill" aria-label="النجوم">
        ⭐ {toArabicNumeral(state.stars)}
      </span>
    </header>
  );
}

function TabBar({ active, onTab }) {
  return (
    <nav className="sg-tabbar" aria-label="الحدائق">
      {TABS.map((t) => (
        <button
          key={t.id}
          type="button"
          className={t.id === active ? 'sg-tab is-active' : 'sg-tab'}
          style={t.id !== 'home' ? { '--g': GARDENS[t.id].color } : undefined}
          aria-current={t.id === active ? 'page' : undefined}
          onClick={() => onTab(t.id)}
        >
          <span className="sg-tab-icon" aria-hidden="true">
            {t.icon}
          </span>
          <span className="sg-tab-label">{t.label}</span>
        </button>
      ))}
    </nav>
  );
}

// نجوم مستوى «مغامرة الحروف» ونجوم قصص الحرف
const stationOf = (letter) => HUROOF_LEVELS.find((l) => l.letters.includes(letter));

export default function SalmanApp() {
  const quranStore = useGarden();
  const [state, setState] = useState(() => loadState());
  const [screen, setScreen] = useState(() => screenFromHash(globalThis.location?.hash));
  const [celebrate, setCelebrate] = useState(null);
  const [openSurah, setOpenSurah] = useState(null);
  const today = dayKeyFrom();

  useEffect(() => {
    saveState(state);
  }, [state]);

  // التاريخ: كل انتقال يُسجَّل، فزر الرجوع في الهاتف والمتصفح يرجع خطوة داخل الغابة
  useEffect(() => {
    try {
      history.replaceState({ sg: screen, depth: 0 }, '');
    } catch {
      /* بيئة بلا history */
    }
    const onPop = (e) => {
      setCelebrate(null);
      setScreen(e.state?.sg || screenFromHash(location.hash));
      window.scrollTo?.(0, 0);
    };
    window.addEventListener('popstate', onPop);
    return () => window.removeEventListener('popstate', onPop);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const go = (next) => {
    setCelebrate(null);
    try {
      history.pushState({ sg: next, depth: (history.state?.depth || 0) + 1 }, '', hashOf(next));
    } catch {
      /* بيئة بلا history */
    }
    setScreen(next);
    window.scrollTo?.(0, 0);
  };
  // تحديث الشاشة الحالية بلا خطوة جديدة في التاريخ (خطوات الزيارة، شاشة الهدية)
  const replace = (next) => {
    try {
      history.replaceState({ sg: next, depth: history.state?.depth || 0 }, '', hashOf(next));
    } catch {
      /* بيئة بلا history */
    }
    setScreen(next);
    window.scrollTo?.(0, 0);
  };
  const back = () => {
    if ((history.state?.depth || 0) > 0) history.back();
    else replace(parentOf(screen));
  };
  const onTab = (id) => go(id === 'home' ? HOME : id === 'quran' ? { name: 'quran' } : { name: 'garden', garden: id });

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

  const openItem = (item, fresh, from) => {
    if (fresh) showItem(item);
    go({ name: 'lesson', garden: item.garden, itemId: item.id, from });
  };

  // ---------- زيارة اليوم ----------
  const startVisit = () => {
    // وضع ولي الأمر: حدّ الزيارات وساعات الهدوء. الرفض لا يُظهر عدّادًا ولا عقوبة
    if (!visitGate(state, { dayKey: today, hour: riyadhHour() }).open) return;
    const plan = pickSession(state, CATALOG, today);
    if (state.streak.current >= 2) playClip('streak');
    setState((s) => countVisit(s, today));
    if (plan[0]) showItem(plan[0]);
    go({ name: 'visit', plan, step: 0, stars: 0, badges: [] });
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
      replace({ ...screen, step: nextStep });
      return;
    }
    const f = finishVisit(state);
    setState(f.state);
    replace({
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

  // نجوم حديقة القرآن = قصص السور في الغابة + نجوم رحلة القرآن للطفل
  const quranChild = activeChild(quranStore);
  const gardenStars = (id) => (state.gardens[id] || 0) + (id === 'quran' ? quranChild?.stars || 0 : 0);

  const celebrateLayer = celebrate ? <Celebrate data={celebrate} onClose={closeCelebrate} /> : null;
  const tab = tabOf(screen);

  // ---------- شاشات التركيز (بلا شريط الحدائق) ----------
  if (screen.name === 'visit') {
    const item = screen.plan[screen.step];
    return (
      <main className="sg-app" dir="rtl">
        {celebrateLayer}
        <TopBar
          title={`زيارة اليوم · ${toArabicNumeral(screen.step + 1)} / ${toArabicNumeral(screen.plan.length)}`}
          onBack={back}
          state={state}
        />
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
        <button type="button" className="sg-btn sg-btn-main" onClick={() => replace(HOME)}>
          رجوع للغابة 🌳
        </button>
      </main>
    );
  }

  if (screen.name === 'lesson') {
    const item = gardenItems(screen.garden).find((it) => it.id === screen.itemId);
    const g = GARDENS[screen.garden];
    return (
      <main className="sg-app" dir="rtl">
        {celebrateLayer}
        <TopBar title={item ? item.title : g.name} onBack={back} state={state} color={g.color} />
        {item && (
          <Lesson
            key={item.id}
            item={item}
            onCorrect={(firstTry) => credit(item, firstTry)}
            onMiss={() => missItem(item)}
            onContinue={back}
            continueLabel="رجوع ➜"
          />
        )}
      </main>
    );
  }

  if (screen.name === 'play') {
    const level = HUROOF_LEVELS.find((l) => l.id === screen.level) || HUROOF_LEVELS[0];
    const next = HUROOF_LEVELS.find((l) => l.id === level.id + 1);
    return (
      <div className="hp-root" dir="rtl">
        <Play
          key={level.id}
          level={level}
          onExit={back}
          onLevelComplete={(levelId, stars) =>
            setState((s) => recordHuroofLevel(s, { levelId, stars, dayKey: today }).state)
          }
          onNext={next ? () => replace({ name: 'play', level: next.id }) : undefined}
        />
      </div>
    );
  }

  if (screen.name === 'parent') {
    return <ParentArea state={state} setState={setState} onBack={back} />;
  }

  // ---------- شاشات الحدائق (مع شريط الحدائق) ----------
  let body;
  if (screen.name === 'quran') {
    // حديقة القرآن: رحلة الاستماع والحفظ + قصص السور + مستويات السور، بأقسام في أعلى الحديقة
    const view = screen.view || 'journey';
    const views = (
      <div className="sg-segments" role="tablist" aria-label="أقسام حديقة القرآن">
        {QURAN_VIEWS.map((v) => (
          <button
            key={v.id}
            type="button"
            role="tab"
            aria-selected={view === v.id}
            className={view === v.id ? 'sg-segment is-active' : 'sg-segment'}
            onClick={() => view !== v.id && replace({ name: 'quran', view: v.id })}
          >
            {v.label}
          </button>
        ))}
      </div>
    );
    if (view === 'journey') {
      body = (
        <div className="sg-quran-tab">
          {views}
          <QuranJourney embedded />
        </div>
      );
    } else if (view === 'stories') {
      const items = gardenItems('quran');
      const freshLeft = newAllowed(state, 'quran', today);
      body = (
        <main className="sg-app" dir="rtl">
          {celebrateLayer}
          {views}
          <section
            className="sg-garden-hero"
            style={{ backgroundImage: `url(${assetUrl(BACKGROUNDS.quran)})`, '--g': GARDENS.quran.color }}
          >
            <img className="sg-hero-mascot" src={assetUrl(MASCOTS[GARDEN_MASCOT.quran])} alt="" />
            <span className="sg-hero-badge">📖 قصص السور · {toArabicNumeral(items.length)}</span>
          </section>
          <ul className="sg-cards">
            {items.map((it) => (
              <ItemCard
                key={it.id}
                item={it}
                state={state}
                freshLeft={freshLeft}
                onOpen={(item, fresh) => openItem(item, fresh, screen)}
              />
            ))}
          </ul>
        </main>
      );
    } else {
      body = (
        <main className="sg-app" dir="rtl">
          {celebrateLayer}
          {views}
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
                  const su = SURAHS[sid];
                  const learned = !!state.learnedSurahs[sid];
                  const open = openSurah === sid;
                  const verses = sid === 1 ? FATIHA.ayahs : JUZ30[sid];
                  return (
                    <article key={sid} className="sg-surah">
                      <button type="button" className="sg-row" onClick={() => setOpenSurah(open ? null : sid)}>
                        <span>{learned ? '✅' : '📜'}</span>
                        <span>
                          سورة {su.name} · {toArabicNumeral(su.ayahs)} آيات
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
                              setCelebrate({
                                emoji: '📗',
                                title: 'مستوى مكتمل!',
                                sub: lvl.title,
                                clip: 'level-unlock',
                              });
                            } else {
                              setCelebrate({
                                emoji: '📜',
                                title: 'سورة محفوظة!',
                                sub: `سورة ${su.name}`,
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
  } else if (screen.name === 'letter') {
    const letter = screen.letter;
    const animal = ANIMALS[letter];
    const items = gardenItems('arabic').filter((it) => it.letter === letter);
    const freshLeft = newAllowed(state, 'arabic', today);
    body = (
      <main className="sg-app" dir="rtl">
        {celebrateLayer}
        <TopBar title={`الحرف ${letter}`} onBack={back} state={state} color={GARDENS.arabic.color} />
        <section className="sg-letter-hero">
          <span className="sg-letter-big">{letter}</span>
          <img className="sg-letter-animal" src={assetUrl(`salman/art/animals/${animal.slug}.png`)} alt="" />
          <p className="sg-letter-word">
            {letter} … {animal.word}
          </p>
        </section>
        <h2 className="sg-section">قصص الحرف</h2>
        <ul className="sg-cards">
          {items.map((it) => (
            <ItemCard
              key={it.id}
              item={it}
              state={state}
              freshLeft={freshLeft}
              onOpen={(item, fresh) => openItem(item, fresh, screen)}
            />
          ))}
        </ul>
      </main>
    );
  } else if (screen.name === 'station') {
    const level = HUROOF_LEVELS.find((l) => l.id === screen.level) || HUROOF_LEVELS[0];
    const best = state.huroof?.[level.id] || 0;
    body = (
      <main className="sg-app" dir="rtl">
        <TopBar title={level.title} onBack={back} state={state} color={GARDENS.arabic.color} />
        <button type="button" className="sg-play-card" onClick={() => go({ name: 'play', level: level.id })}>
          <span className="sg-play-letters" aria-hidden="true">
            {level.letters.join(' ')}
          </span>
          <span className="sg-play-text">
            <strong>🎮 العب: صِل الحرف بصديقه</strong>
            <span>
              اسحب كل حرف إلى الحيوان الذي يبدأ به · ⭐ {toArabicNumeral(best)} /{' '}
              {toArabicNumeral(level.letters.length)}
            </span>
          </span>
        </button>
        <h2 className="sg-section">حروف المحطة</h2>
        <ul className="sg-station-letters">
          {level.pairs.map((p) => {
            const mine = gardenItems('arabic').filter((it) => it.letter === p.letter);
            const done = mine.filter((it) => state.doneStories[it.id]).length;
            return (
              <li key={p.letter}>
                <button
                  type="button"
                  className="sg-letter-card"
                  aria-label={`الحرف ${p.letter}`}
                  onClick={() => go({ name: 'letter', letter: p.letter, level: level.id })}
                >
                  <span className="sg-letter-glyph">{p.letter}</span>
                  <img src={assetUrl(p.image)} alt="" loading="lazy" />
                  <span className="sg-letter-name">{p.word}</span>
                  <span className="sg-letter-progress">
                    📖 {toArabicNumeral(done)} / {toArabicNumeral(mine.length)}
                  </span>
                </button>
              </li>
            );
          })}
        </ul>
      </main>
    );
  } else if (screen.name === 'garden') {
    const id = screen.garden;
    const g = GARDENS[id];
    const items = gardenItems(id);
    const stars = gardenStars(id);
    const stage = growthStage(stars);
    const freshLeft = newAllowed(state, id, today);
    const cards = (list) => (
      <ul className="sg-cards">
        {list.map((it) => (
          <ItemCard
            key={it.id}
            item={it}
            state={state}
            freshLeft={freshLeft}
            onOpen={(item, fresh) => openItem(item, fresh, screen)}
          />
        ))}
      </ul>
    );
    let content;
    if (id === 'arabic') {
      content = (
        <>
          <h2 className="sg-section">رحلة الحروف · ٧ محطات</h2>
          <ol className="sg-path">
            {HUROOF_LEVELS.map((l) => {
              const best = state.huroof?.[l.id] || 0;
              const done = best >= l.letters.length;
              return (
                <li key={l.id}>
                  <button
                    type="button"
                    className={done ? 'sg-station is-done' : 'sg-station'}
                    onClick={() => go({ name: 'station', level: l.id })}
                  >
                    <span className="sg-station-num">{done ? '✓' : toArabicNumeral(l.id)}</span>
                    <span className="sg-station-body">
                      <strong>{l.title}</strong>
                      <span className="sg-station-letters-row">{l.letters.join('  ')}</span>
                    </span>
                    <span className="sg-station-stars">
                      ⭐ {toArabicNumeral(best)}/{toArabicNumeral(l.letters.length)}
                    </span>
                  </button>
                </li>
              );
            })}
          </ol>
        </>
      );
    } else if (id === 'math') {
      content = (
        <>
          <h2 className="sg-section">قصص العدّ</h2>
          {cards(items.filter((it) => it.source !== 'count'))}
          <h2 className="sg-section">نعدّ من ١ إلى ٢٠</h2>
          <ul className="sg-numbers">
            {items
              .filter((it) => it.source === 'count')
              .map((it, i) => {
                const done = !!state.doneStories[it.id];
                const locked = !state.skills[it.id] && freshLeft <= 0;
                return (
                  <li key={it.id}>
                    <button
                      type="button"
                      className={done ? 'sg-number is-done' : 'sg-number'}
                      disabled={locked}
                      aria-label={it.title}
                      onClick={() => openItem(it, !state.skills[it.id], screen)}
                    >
                      {locked ? '🌙' : toArabicNumeral(i + 1)}
                    </button>
                  </li>
                );
              })}
          </ul>
        </>
      );
    } else {
      content = (
        <>
          <h2 className="sg-section">Phonics · الأصوات</h2>
          {cards(items)}
        </>
      );
    }
    body = (
      <main className="sg-app" dir="rtl">
        {celebrateLayer}
        <TopBar title={g.name} state={state} color={g.color} />
        <section
          className="sg-garden-hero"
          style={{ backgroundImage: `url(${assetUrl(BACKGROUNDS[id])})`, '--g': g.color }}
        >
          <img className="sg-hero-plant" src={assetUrl(stage.art)} alt="" />
          <img className="sg-hero-mascot" src={assetUrl(MASCOTS[GARDEN_MASCOT[id]])} alt="" />
          <span className="sg-hero-badge">
            {stage.name} · ⭐ {toArabicNumeral(stars)}
          </span>
        </section>
        {content}
      </main>
    );
  } else if (screen.name === 'badges') {
    body = (
      <main className="sg-app" dir="rtl">
        <TopBar title="🏅 الأوسمة" onBack={back} state={state} />
        <p className="sg-sub">
          🎁 هدايا: {toArabicNumeral(state.gifts.length)}{' '}
          {state.gifts.map((id) => {
            const gift = GIFTS.find((x) => x.id === id);
            return gift?.art ? (
              <img key={id} className="sg-gift-chip" src={assetUrl(gift.art)} alt={gift.name} />
            ) : (
              gift?.emoji
            );
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
  } else {
    // ---------- الغابة الرئيسية ----------
    const gate = visitGate(state, { dayKey: today, hour: riyadhHour() });
    body = (
      <main className="sg-app sg-home" dir="rtl">
        {celebrateLayer}
        <TopBar title="🌳 غابة سلمان" state={state} />
        <section className="sg-welcome">
          <img className="sg-welcome-mascot" src={assetUrl(MASCOTS.salman)} alt="" />
          <div className="sg-welcome-text">
            <p className="sg-hello">{greeting()}</p>
            <p className="sg-sub">أربع حدائق تنمو معك كل يوم</p>
            <button type="button" className="sg-link" onClick={() => playClip('welcome')}>
              🔊 اسمع الترحيب
            </button>
          </div>
        </section>

        {gate.open ? (
          <button type="button" className="sg-btn sg-btn-main sg-visit" onClick={startVisit}>
            ✨ زيارة اليوم (١٠ دقايق)
          </button>
        ) : (
          <p className="sg-gate" role="status">
            {gate.reason === 'quiet' ? '🌙 الغابة نايمة الآن. نرجع الصبح!' : '🎁 خلصت زيارة اليوم. تعال بكرة!'}
          </p>
        )}

        <div className="sg-gardens">
          {GARDEN_ORDER.map((id) => {
            const g = GARDENS[id];
            const stars = gardenStars(id);
            const st = growthStage(stars);
            const pct = st.next ? Math.round(((stars - st.min) / (st.next.min - st.min)) * 100) : 100;
            return (
              <button key={id} type="button" className="sg-garden" style={{ '--g': g.color }} onClick={() => onTab(id)}>
                <span className="sg-garden-scene" style={{ backgroundImage: `url(${assetUrl(BACKGROUNDS[id])})` }}>
                  <img className="sg-garden-art" src={assetUrl(st.art)} alt="" />
                  <span className="sg-garden-emoji" aria-hidden="true">
                    {g.emoji}
                  </span>
                </span>
                <span className="sg-garden-body">
                  <span className="sg-garden-name">{g.name}</span>
                  <span className="sg-garden-meta">
                    {st.name} · ⭐ {toArabicNumeral(stars)}
                  </span>
                  <span className="sg-bar" aria-hidden="true">
                    <span style={{ width: `${pct}%`, background: g.color }} />
                  </span>
                </span>
              </button>
            );
          })}
        </div>

        <div className="sg-home-links">
          <button type="button" className="sg-shortcut" onClick={() => go({ name: 'badges' })}>
            🏅 الأوسمة
          </button>
          <button type="button" className="sg-shortcut" onClick={() => go({ name: 'parent' })}>
            🔒 ولي الأمر
          </button>
        </div>
      </main>
    );
  }

  return (
    <div
      className={screen.name === 'quran' && (screen.view || 'journey') === 'journey' ? 'sg-shell is-quran' : 'sg-shell'}
    >
      {body}
      <TabBar active={tab} onTab={onTab} />
    </div>
  );
}
