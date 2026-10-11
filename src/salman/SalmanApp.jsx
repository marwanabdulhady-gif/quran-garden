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
  recordStory,
  recordHuroofLevel,
  recordSurah,
  GIFTS,
  recordDay,
} from './lib/gamify.js';
import { CATALOG, gardenItems, toArabicNumeral } from './lib/catalog.js';
import { QURAN_LEVELS, QURAN_TRAILS, SURAHS } from './data/quran.js';
import { JUZ30 } from '../juz30.js';
import { FATIHA } from './data/fatiha.js';
import { pickSession } from './lib/session.js';
import { countVisit, riyadhHour, visitGate } from './lib/parent.js';
import ParentArea from './ParentArea.jsx';
import GardenMap from './GardenMap.jsx';
import { getClient, hasSession, upload } from './lib/cloud.js';
import Play from '../huroof/components/Play.jsx';
import '../huroof/huroof.css';
import QuranJourney from '../App.jsx';
import '../styles.css';
import { useGarden, activeChild } from '../store.js';
import { GATES, SURAH_META, SURAH_NAMES_FALLBACK } from '../data.js';
import { LEVEL_DATA as HUROOF_LEVELS } from '../huroof/data/index.js';
import { ANIMALS } from './data/animals.js';
import { loadState, saveState } from './lib/store.js';
import { canSpeak, speak } from './lib/speech.js';
import { playClip, playStory, assetUrl } from './lib/voice.js';
import LetterDay from './LetterDay.jsx';
import { NOUR_UNITS, NOUR_ORDER, UNIT_BY_LETTER, MATH_STATIONS, gardenUnits } from './data/nour.js';
import { unitCompleted, unitDay, DAY_STEPS } from './lib/letterday.js';
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
// بطاقة مفتوحة دائمًا: لا «غدًا» ولا قفل يومي، والطفل يكمل ما يريد
function ItemCard({ item, state, onOpen }) {
  const done = !!state.doneStories[item.id];
  const fresh = !state.skills[item.id];
  const cls = done ? 'sg-card is-done' : 'sg-card';
  return (
    <li>
      <button type="button" className={cls} onClick={() => onOpen(item, fresh)}>
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
          {item.title}
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
  if (screen.name === 'day' || screen.name === 'dayDone') return screen.garden;
  if (['quran', 'surah', 'qexplore'].includes(screen.name)) return 'quran';
  return 'home';
}

// الشاشة الأم (لزر الرجوع عند فتح رابط مباشر)
function parentOf(screen) {
  if (screen.name === 'letter') return screen.level ? { name: 'station', level: screen.level } : ARABIC_HOME;
  if (screen.name === 'station' || screen.name === 'play') return ARABIC_HOME;
  if (screen.name === 'lesson') return screen.from || { name: 'garden', garden: screen.garden };
  if (screen.name === 'day' || screen.name === 'dayDone') {
    const unit = NOUR_UNITS[screen.unitId];
    if (unit && unit.garden === 'arabic') return { name: 'letter', letter: unit.letter };
    return { name: 'garden', garden: (unit && unit.garden) || 'arabic' };
  }
  if (screen.name === 'surah' || screen.name === 'qexplore') return { name: 'quran' };
  return HOME;
}

const HOME = { name: 'home' };
// يُحقن وقت البناء (vite.config.js)؛ في الاختبارات بلا بناء نعرض «dev»
/* global __APP_VERSION__, __APP_BUILT__ */
const APP_VERSION = typeof __APP_VERSION__ !== 'undefined' ? __APP_VERSION__ : 'dev';
const APP_BUILT = typeof __APP_BUILT__ !== 'undefined' ? __APP_BUILT__ : '';
// رحلة القرآن الواحدة: كل سورة محطة بثلاث خطوات (القصة ← الاستماع والترديد ← الحفظ)
const SURAH_STEPS = [
  { id: 'story', icon: '📖', label: 'القصة' },
  { id: 'listen', icon: '🎧', label: 'استمع وردّد' },
  { id: 'memorize', icon: '🏆', label: 'حفظتها' },
];
// اسم السورة ومعلوماتها: سور المستويات من quran.js، وبقية السور من بيانات تطبيق القرآن
function surahName(sid) {
  return SURAHS[sid]?.name || (SURAH_NAMES_FALLBACK[sid] || '').replace(/^سورة\s+/, '');
}
function surahInfo(sid) {
  return SURAHS[sid] || { id: sid, name: surahName(sid), ayahs: SURAH_META[sid] };
}
// خريطة القرآن الواحدة: المستويات الثلاثة (قصة · استماع · حفظ) ثم بقية جزء عمّ وتبارك وقد سمع (استماع · حفظ)
const QURAN_STATIONS = [
  ...QURAN_LEVELS.map((l) => ({ level: l.level, title: l.title, surahs: l.surahs })),
  ...QURAN_TRAILS.map((t) => ({
    level: t.level,
    title: `${t.part}: ${surahName(t.surahs[0])} ← ${surahName(t.surahs[t.surahs.length - 1])}`,
    surahs: t.surahs,
  })),
];
// السور بترتيب الرحلة (محطة بعد محطة)
const QURAN_PATH = QURAN_STATIONS.flatMap((l) => l.surahs);
const stationOfSurah = (sid) => QURAN_STATIONS.find((l) => l.surahs.includes(sid));
// السور التي لها قصة في الحديقة تبدأ بالقصة، والبقية بالاستماع
const STORY_SURAHS = new Set(gardenItems('quran').map((it) => Number(it.id.slice(2))));
const stepsFor = (sid) => (STORY_SURAHS.has(sid) ? SURAH_STEPS : SURAH_STEPS.filter((st) => st.id !== 'story'));
// كنوز رحلة القرآن: أدوات تطبيق القرآن داخل نفس الرحلة (الخريطة واحدة، فلا «خريطة أجزاء» ثانية)
const QURAN_TREASURES = [
  { route: 'words', icon: '📖', label: 'كلماتي' },
  { route: 'bridge', icon: '🌉', label: 'جسر المعاني' },
  { route: 'daily', icon: '🤍', label: 'آية اليوم' },
];
// تقدّم يوم «حدائق النور» لوحدة واحدة (٠..١)
function unitRatio(state, unitId) {
  if (!unitId) return 0;
  if (unitCompleted(state, unitId)) return 1;
  return Math.min(1, (unitDay(state, unitId)?.done?.length || 0) / DAY_STEPS.length);
}
const gateFor = (sid) => (GATES.find((g) => sid >= g.from && sid <= g.to) || GATES[0]).id;
const ARABIC_HOME = { name: 'garden', garden: 'arabic' };

function hashOf(screen) {
  switch (screen.name) {
    case 'garden':
      return `#/${screen.garden}`;
    case 'quran':
      return '#/quran';
    case 'surah':
      return `#/quran/surah/${screen.sid}`;
    case 'qexplore':
      return `#/quran/explore/${screen.route}`;
    case 'station':
      return `#/arabic/${screen.level}`;
    case 'play':
      return `#/arabic/${screen.level}/play`;
    case 'letter':
      return `#/arabic/letter/${encodeURIComponent(screen.letter)}`;
    case 'day':
      return `#/nour/${screen.garden}/${encodeURIComponent(screen.unitId)}`;
    case 'badges':
      return '#/badges';
    case 'parent':
      return '#/parent';
    default:
      return '#/';
  }
}

export function screenFromHash(hash = '') {
  if (hash.startsWith('#garden=')) return { name: 'quran' }; // رابط استرجاع حديقة القرآن
  const parts = hash.replace(/^#\/?/, '').split('/').filter(Boolean).map(decodeURIComponent);
  const [a, b, c] = parts;
  if (a === 'quran') {
    if (b === 'surah' && QURAN_PATH.includes(Number(c))) return { name: 'surah', sid: Number(c) };
    if (b === 'explore' && QURAN_TREASURES.some((t) => t.route === c)) return { name: 'qexplore', route: c };
    return { name: 'quran' }; // الأقسام القديمة (stories/levels) صارت جزءًا من الرحلة نفسها
  }
  if (a === 'badges') return { name: 'badges' };
  if (a === 'parent') return { name: 'parent' }; // العودة من دخول Google
  if (a === 'nour' && NOUR_UNITS[c]) return { name: 'day', garden: NOUR_UNITS[c].garden, unitId: c };
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

// شريط تقدّم العنصر (حرف · سورة) أعلى صفحته
function ItemProgress({ color, ratio, label }) {
  return (
    <div className="sg-item-progress" style={{ '--g': color }}>
      <span className="sg-gbar" aria-hidden="true">
        <span style={{ width: `${Math.round(ratio * 100)}%` }} />
      </span>
      <span className="sg-item-progress-count">
        {label} — {toArabicNumeral(Math.round(ratio * 100))}٪
      </span>
    </div>
  );
}

// نجوم مستوى «مغامرة الحروف» ونجوم قصص الحرف
const stationOf = (letter) => HUROOF_LEVELS.find((l) => l.letters.includes(letter));

export default function SalmanApp() {
  const quranStore = useGarden();
  const [state, setState] = useState(() => loadState());
  const [screen, setScreen] = useState(() => {
    const first = screenFromHash(globalThis.location?.hash);
    // رابط مباشر إلى سورة: نثبّت خطوة البداية مرة واحدة، حتى لا تقفز الشاشة بعد الإجابة
    if (first.name === 'surah' && !first.step) {
      const saved = loadState();
      first.step =
        STORY_SURAHS.has(first.sid) && !saved.doneStories[`q-${first.sid}`]
          ? 'story'
          : saved.learnedSurahs[first.sid]
            ? 'memorize'
            : 'listen';
    }
    return first;
  });
  const [celebrate, setCelebrate] = useState(null);
  const today = dayKeyFrom();

  useEffect(() => {
    saveState(state);
    // إن دخل ولي الأمر بحساب Google: نرفع نسخة إلى السحابة بعد ثوانٍ من آخر تغيير
    if (!hasSession()) return undefined;
    const t = setTimeout(() => upload().catch(() => {}), 4000);
    return () => clearTimeout(t);
  }, [state]);

  // العودة من دخول Google (?code=…): نُكمل الدخول فورًا حتى لو لم يفتح ولي الأمر صفحته بعد
  useEffect(() => {
    if (/[?&]code=/.test(globalThis.location?.search || '')) getClient().catch(() => {});
  }, []);

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

  // فتح قصة/تمرين. list = ترتيب البطاقات التي فُتح منها، ليعرف زر «التالي» ما بعده
  const openItem = (item, fresh, from, list = []) => {
    if (fresh) showItem(item);
    go({ name: 'lesson', garden: item.garden, itemId: item.id, from, list: list.map((x) => x.id) });
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
    const all = gardenItems(screen.garden);
    const item = all.find((it) => it.id === screen.itemId);
    const g = GARDENS[screen.garden];
    // بعد الإجابة: ننتقل مباشرة إلى البطاقة التالية في نفس القائمة، وفي آخرها نرجع
    const list = screen.list || [];
    const nextId = list[list.indexOf(screen.itemId) + 1];
    const nextItem = list.includes(screen.itemId) && nextId ? all.find((it) => it.id === nextId) : null;
    const goNext = () => {
      setCelebrate(null);
      if (!nextItem) return back();
      if (!state.skills[nextItem.id]) showItem(nextItem);
      replace({ ...screen, itemId: nextItem.id });
    };
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
            onContinue={goNext}
            continueLabel={nextItem ? `التالي: ${nextItem.title} ➜` : 'أحسنت! رجوع للحديقة ➜'}
          />
        )}
      </main>
    );
  }

  // ---------- يوم الوحدة (حدائق النور): سبع خطوات، ثم نجوم ومراجعة ----------
  if (screen.name === 'day') {
    const unit = NOUR_UNITS[screen.unitId];
    if (!unit) return null;
    const g = GARDENS[unit.garden];
    const finishDay = (steps) => {
      const r = recordDay(state, { unitId: unit.id, garden: unit.garden, dayKey: today, steps });
      setState(r.state);
      sfx('levelUp');
      playClip('garden-grow');
      // بعد الإنجاز: شاشة «أحسنت» وفيها زر كبير إلى الوحدة التالية مباشرة
      replace({ name: 'dayDone', garden: unit.garden, unitId: unit.id, earned: r.earned });
    };
    return (
      <>
        {celebrateLayer}
        <LetterDay
          unit={unit}
          color={g.color}
          backdrop={BACKGROUNDS[unit.garden]}
          dayIndex={0}
          onExit={back}
          onDone={finishDay}
        />
      </>
    );
  }

  // ---------- أحسنت! ثم التالي مباشرة ----------
  if (screen.name === 'dayDone') {
    const unit = NOUR_UNITS[screen.unitId];
    if (!unit) return null;
    const g = GARDENS[unit.garden];
    const order = NOUR_ORDER[unit.garden] || [];
    const next = NOUR_UNITS[order[order.indexOf(unit.id) + 1]];
    return (
      <main className="sg-app sg-reward sg-done" dir="rtl" style={{ '--g': g.color }}>
        <Confetti />
        <Mascot name={GARDEN_MASCOT[unit.garden]} className="sg-bounce" bubble="أحسنت يا بطل!" />
        <p className="sg-done-glyph">{unit.glyph}</p>
        <h1 className="sg-title">أكملت «{unit.keyWord}» 🎉</h1>
        {screen.earned > 0 && <p className="sg-sub">+{toArabicNumeral(screen.earned)} ⭐</p>}
        {next ? (
          <button
            type="button"
            className="sg-btn sg-btn-main sg-next-btn"
            onClick={() => replace({ name: 'day', garden: next.garden, unitId: next.id })}
          >
            <span className="sg-next-glyph">{next.glyph}</span>
            <span>التالي: {next.keyWord} ➜</span>
          </button>
        ) : (
          <p className="sg-sub">🏆 أكملت كل وحدات {g.name}!</p>
        )}
        <button type="button" className="sg-btn sg-btn-soft" onClick={() => replace(parentOf(screen))}>
          رجوع إلى {g.name}
        </button>
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
  // حالة كل سورة في الرحلة: 💎 القصة · 🎧 الاستماع · 🪙 الحفظ
  const surahProgress = (sid) => ({
    story: !!state.doneStories[`q-${sid}`],
    listen: !!quranChild?.listening?.[sid]?.completed,
    memorize: !!state.learnedSurahs[sid],
  });
  // نسبة ما أُنجز من خطوات السورة (٠..١) — للحلقة على الخريطة وشريط صفحة السورة
  const surahRatio = (sid) => {
    const p = surahProgress(sid);
    if (p.memorize) return 1;
    const steps = stepsFor(sid);
    return steps.filter((st) => p[st.id]).length / steps.length;
  };
  const firstOpenStep = (sid) => {
    const p = surahProgress(sid);
    return stepsFor(sid).find((st) => !p[st.id])?.id || 'memorize';
  };
  const openSurah = (sid) => go({ name: 'surah', sid, step: firstOpenStep(sid) });
  // تقدّم الحرف: خطوات «يوم الحرف» السبع + قصص الحرف
  const letterProgress = (L) => {
    const mine = gardenItems('arabic').filter((it) => it.letter === L);
    const storiesRead = mine.filter((it) => state.doneStories[it.id]).length;
    const unitId = UNIT_BY_LETTER[L];
    const dayDone = unitCompleted(state, unitId);
    const daySteps = unitId ? (dayDone ? DAY_STEPS.length : unitDay(state, unitId)?.done?.length || 0) : 0;
    const total = (unitId ? DAY_STEPS.length : 0) + mine.length;
    const doneN = daySteps + storiesRead;
    const storiesDone = mine.length > 0 && storiesRead === mine.length;
    return {
      dayDone,
      storiesDone,
      done: total > 0 && doneN >= total,
      ratio: total ? Math.min(1, doneN / total) : 0,
      label: `🌿 يوم الحرف ${toArabicNumeral(daySteps)} من ${toArabicNumeral(unitId ? DAY_STEPS.length : 0)} — 📖 القصص ${toArabicNumeral(storiesRead)} من ${toArabicNumeral(mine.length)}`,
    };
  };

  if (screen.name === 'quran') {
    // رحلة القرآن الواحدة: كل مستوى شجرة على طريق الحديقة، وسوره أزهار حولها
    const memorized = QURAN_PATH.filter((sid) => state.learnedSurahs[sid]).length;
    const nextSid = QURAN_PATH.find((sid) => !state.learnedSurahs[sid]);
    body = (
      <main className="sg-app" dir="rtl">
        {celebrateLayer}
        <TopBar title="🌴 رحلة القرآن" state={state} color={GARDENS.quran.color} />
        <section className="sg-quran-hero" style={{ backgroundImage: `url(${assetUrl(BACKGROUNDS.quran)})` }}>
          <img className="sg-hero-mascot" src={assetUrl(MASCOTS.salman)} alt="" />
          <div className="sg-quran-hero-text">
            <strong>
              حفظتَ {toArabicNumeral(memorized)} من {toArabicNumeral(QURAN_PATH.length)} سورة
            </strong>
            <span className="sg-bar" aria-hidden="true">
              <span style={{ width: `${Math.round((memorized / QURAN_PATH.length) * 100)}%`, background: '#14b8a6' }} />
            </span>
            {nextSid && (
              <button type="button" className="sg-btn sg-btn-main sg-quran-next" onClick={() => openSurah(nextSid)}>
                ▶ تابع: سورة {surahName(nextSid)}
              </button>
            )}
          </div>
        </section>
        <GardenMap
          label="رحلة القرآن"
          color={GARDENS.quran.color}
          guideArt={assetUrl(MASCOTS.salman)}
          stations={QURAN_STATIONS.map((lvl) => ({
            id: lvl.level,
            title: lvl.title,
            onOpen: () => openSurah(lvl.surahs.find((sid) => !state.learnedSurahs[sid]) || lvl.surahs[0]),
            items: lvl.surahs.map((sid) => {
              const p = surahProgress(sid);
              return {
                key: sid,
                label: surahName(sid),
                done: p.memorize,
                progress: surahRatio(sid),
                gems: STORY_SURAHS.has(sid)
                  ? [
                      { icon: '💎', on: p.story },
                      { icon: '🪙', on: p.memorize },
                    ]
                  : [{ icon: '🪙', on: p.memorize }],
              };
            }),
          }))}
          onItem={(st, it) => openSurah(it.key)}
        />
        <h2 className="sg-section">✨ كنوز الرحلة</h2>
        <ul className="sg-treasures">
          {QURAN_TREASURES.map((t) => (
            <li key={t.route}>
              <button type="button" className="sg-treasure" onClick={() => go({ name: 'qexplore', route: t.route })}>
                <span aria-hidden="true">{t.icon}</span>
                {t.label}
              </button>
            </li>
          ))}
        </ul>
      </main>
    );
  } else if (screen.name === 'qexplore') {
    // أداة من تطبيق القرآن داخل الرحلة، والرجوع منها يعيد إلى رحلة القرآن
    body = (
      <div className="sg-quran-tab">
        <QuranJourney embedded initialRoute={{ name: screen.route, params: {} }} onLeave={back} />
      </div>
    );
  } else if (screen.name === 'surah') {
    const sid = screen.sid;
    const su = surahInfo(sid);
    const level = stationOfSurah(sid);
    const prog = surahProgress(sid);
    const steps = stepsFor(sid);
    const step = steps.some((st) => st.id === screen.step) ? screen.step : steps[0].id;
    const item = gardenItems('quran').find((it) => it.id === `q-${sid}`);
    const nextSid = QURAN_PATH[QURAN_PATH.indexOf(sid) + 1];
    const ratio = surahRatio(sid);
    const doneSteps = steps.filter((st) => prog[st.id]).length;
    const toStep = (id) => replace({ ...screen, step: id });
    const stepBar = (
      <ol className="sg-surah-steps" aria-label={`خطوات سورة ${su.name}`}>
        {steps.map((st, i) => (
          <li key={st.id}>
            <button
              type="button"
              className={['sg-surah-step', step === st.id ? 'is-current' : '', prog[st.id] ? 'is-done' : '']
                .filter(Boolean)
                .join(' ')}
              aria-current={step === st.id ? 'step' : undefined}
              onClick={() => toStep(st.id)}
            >
              <span className="sg-surah-step-icon" aria-hidden="true">
                {prog[st.id] ? '✓' : st.icon}
              </span>
              <span>
                {toArabicNumeral(i + 1)}. {st.label}
              </span>
            </button>
          </li>
        ))}
      </ol>
    );
    const head = (
      <>
        <TopBar title={`سورة ${su.name}`} onBack={back} state={state} color={GARDENS.quran.color} />
        <div className="sg-item-progress" style={{ '--g': GARDENS.quran.color }}>
          <span className="sg-item-progress-text">
            {level?.title}
            {su.ayahs ? ` — ${toArabicNumeral(su.ayahs)} آيات` : ''}
          </span>
          <span className="sg-gbar" aria-hidden="true">
            <span style={{ width: `${Math.round(ratio * 100)}%` }} />
          </span>
          <span className="sg-item-progress-count">
            {prog.memorize ? '🪙 محفوظة' : `${toArabicNumeral(doneSteps)} من ${toArabicNumeral(steps.length)} خطوات`}
          </span>
        </div>
        {stepBar}
      </>
    );
    if (step === 'listen') {
      body = (
        <div className="sg-quran-tab sg-surah-listen">
          <div className="sg-app sg-surah-head" dir="rtl">
            {head}
            <button type="button" className="sg-btn sg-btn-soft" onClick={() => toStep('memorize')}>
              {prog.listen ? 'التالي: الحفظ ➜' : 'سمعتها وردّدتها ➜ إلى الحفظ'}
            </button>
          </div>
          <QuranJourney
            key={`player-${sid}`}
            embedded
            initialRoute={{ name: 'player', params: { gate: gateFor(sid), surah: sid } }}
            onLeave={() => toStep('memorize')}
          />
        </div>
      );
    } else if (step === 'story') {
      body = (
        <main className="sg-app" dir="rtl">
          {celebrateLayer}
          {head}
          {item && (
            <Lesson
              key={item.id}
              item={item}
              onCorrect={(firstTry) => credit(item, firstTry)}
              onMiss={() => missItem(item)}
              onContinue={() => toStep('listen')}
              continueLabel="التالي: استمع وردّد 🎧 ➜"
            />
          )}
        </main>
      );
    } else {
      const verses = sid === 1 ? FATIHA.ayahs : JUZ30[sid];
      body = (
        <main className="sg-app" dir="rtl">
          {celebrateLayer}
          {head}
          <section className="sg-memorize">
            <div className="sg-verses" lang="ar">
              {verses ? verses.join(' ۝ ') : 'اقرأها مع التلاوة في خطوة «استمع وردّد» 🎧، ثم اضغط «حفظتها».'}
            </div>
            {!prog.memorize ? (
              <button
                type="button"
                className="sg-btn sg-btn-main"
                onClick={() => {
                  const r = recordSurah(state, { surahId: sid, dayKey: today });
                  setState(r.state);
                  sfx('levelUp');
                  const stationDone = level && level.surahs.every((x) => x === sid || state.learnedSurahs[x]);
                  if (stationDone) {
                    setCelebrate({ emoji: '🌳', title: 'شجرة مكتملة!', sub: level.title, clip: 'level-unlock' });
                  } else {
                    setCelebrate({ emoji: '🪙', title: 'سورة محفوظة!', sub: `سورة ${su.name}`, clip: 'surah-learned' });
                  }
                }}
              >
                حفظتها ✓ (+⭐⭐ 🪙)
              </button>
            ) : (
              <p className="sg-sub">🪙 أحسنت! سورة {su.name} محفوظة.</p>
            )}
            {prog.memorize && nextSid && (
              <button
                type="button"
                className="sg-btn sg-btn-main sg-next-btn"
                onClick={() => replace({ name: 'surah', sid: nextSid, step: firstOpenStep(nextSid) })}
              >
                السورة التالية: {surahName(nextSid)} ➜
              </button>
            )}
            <button type="button" className="sg-btn sg-btn-soft" onClick={() => replace({ name: 'quran' })}>
              🌳 رجوع إلى خريطة الحديقة
            </button>
          </section>
        </main>
      );
    }
  } else if (screen.name === 'letter') {
    const letter = screen.letter;
    const animal = ANIMALS[letter];
    const items = gardenItems('arabic').filter((it) => it.letter === letter);
    body = (
      <main className="sg-app" dir="rtl">
        {celebrateLayer}
        <TopBar title={`الحرف ${letter}`} onBack={back} state={state} color={GARDENS.arabic.color} />
        <ItemProgress color={GARDENS.arabic.color} {...letterProgress(letter)} />
        <section className="sg-letter-hero">
          <span className="sg-letter-big">{letter}</span>
          <img className="sg-letter-animal" src={assetUrl(`salman/art/animals/${animal.slug}.png`)} alt="" />
          <p className="sg-letter-word">
            {letter} … {animal.word}
          </p>
        </section>
        {UNIT_BY_LETTER[letter] && (
          <button
            type="button"
            className="sg-btn sg-btn-main sg-visit"
            style={{ background: GARDENS.arabic.color }}
            onClick={() => go({ name: 'day', garden: 'arabic', unitId: UNIT_BY_LETTER[letter] })}
          >
            🌿 {unitCompleted(state, UNIT_BY_LETTER[letter]) ? 'يوم الحرف (راجعه)' : 'ابدأ يوم الحرف'}
          </button>
        )}
        <h2 className="sg-section">قصص الحرف</h2>
        <ul className="sg-cards">
          {items.map((it) => (
            <ItemCard
              key={it.id}
              item={it}
              state={state}
              onOpen={(item, fresh) => openItem(item, fresh, screen, items)}
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
            const lp = letterProgress(p.letter);
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
                  <span className="sg-letter-progress" style={{ '--g': GARDENS.arabic.color }}>
                    <span className="sg-gbar" aria-hidden="true">
                      <span style={{ width: `${Math.round(lp.ratio * 100)}%` }} />
                    </span>
                    {lp.done ? '⭐ مكتمل' : `${toArabicNumeral(Math.round(lp.ratio * 100))}٪`}
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
    const cards = (list) => (
      <ul className="sg-cards">
        {list.map((it) => (
          <ItemCard key={it.id} item={it} state={state} onOpen={(item, fresh) => openItem(item, fresh, screen, list)} />
        ))}
      </ul>
    );
    let content;
    if (id === 'arabic') {
      content = (
        <>
          <h2 className="sg-section">رحلة الحروف · ٧ محطات</h2>
          <GardenMap
            label="رحلة الحروف"
            color={g.color}
            guideArt={assetUrl(MASCOTS.hoopoe)}
            stations={HUROOF_LEVELS.map((l) => ({
              id: l.id,
              title: l.title,
              onOpen: () => go({ name: 'station', level: l.id }),
              items: l.letters.map((L) => {
                const lp = letterProgress(L);
                return {
                  key: L,
                  label: L,
                  done: lp.done,
                  progress: lp.ratio,
                  gems: [
                    { icon: '💎', on: lp.storiesDone },
                    { icon: '🪙', on: lp.dayDone },
                  ],
                };
              }),
            }))}
            onItem={(st, it) => go({ name: 'letter', letter: it.key, level: st.id })}
          />
        </>
      );
    } else if (id === 'math') {
      content = (
        <>
          <h2 className="sg-section">رحلة الأرقام · ١–٢٠</h2>
          <GardenMap
            label="رحلة الأرقام"
            color={g.color}
            guideArt={assetUrl(MASCOTS.squirrel)}
            stations={MATH_STATIONS.map((st) => {
              const days = st.units.map((uid) => NOUR_UNITS[uid]);
              return {
                id: st.id,
                title: `المحطة ${toArabicNumeral(st.id)} · ${days[0].glyph}–${days[days.length - 1].glyph}`,
                onOpen: () => {
                  const next = days.find((u) => !unitCompleted(state, u.id)) || days[0];
                  go({ name: 'day', garden: 'math', unitId: next.id });
                },
                items: days.map((u) => ({
                  key: u.id,
                  label: u.glyph,
                  done: unitCompleted(state, u.id),
                  progress: unitRatio(state, u.id),
                })),
              };
            })}
            onItem={(st, it) => go({ name: 'day', garden: 'math', unitId: it.key })}
          />
          <h2 className="sg-section">قصص العدّ</h2>
          {cards(items.filter((it) => it.source !== 'count'))}
          <h2 className="sg-section">نعدّ من ١ إلى ٢٠</h2>
          <ul className="sg-numbers">
            {items
              .filter((it) => it.source === 'count')
              .map((it, i) => {
                const done = !!state.doneStories[it.id];
                return (
                  <li key={it.id}>
                    <button
                      type="button"
                      className={done ? 'sg-number is-done' : 'sg-number'}
                      aria-label={it.title}
                      onClick={() =>
                        openItem(
                          it,
                          !state.skills[it.id],
                          screen,
                          items.filter((x) => x.source === 'count')
                        )
                      }
                    >
                      {toArabicNumeral(i + 1)}
                    </button>
                  </li>
                );
              })}
          </ul>
        </>
      );
    } else {
      const days = gardenUnits('english');
      const groups = [...new Set(days.map((u) => u.group ?? 1))];
      content = (
        <>
          <h2 className="sg-section">Letter Days · رحلة الأصوات</h2>
          <GardenMap
            label="رحلة الأصوات"
            color={g.color}
            guideArt={assetUrl(MASCOTS.silkworm)}
            stations={groups.map((grp) => {
              const mine = days.filter((u) => (u.group ?? 1) === grp);
              return {
                id: grp,
                name: `المجموعة ${toArabicNumeral(grp)} · ${mine.map((u) => u.sound).join(' ')}`,
                title: (
                  <>
                    المجموعة {toArabicNumeral(grp)}
                    <bdi className="sg-gsign-sounds" lang="en" dir="ltr">
                      {mine.map((u) => u.sound).join(' ')}
                    </bdi>
                  </>
                ),
                onOpen: () => {
                  const next = mine.find((u) => !unitCompleted(state, u.id)) || mine[0];
                  go({ name: 'day', garden: 'english', unitId: next.id });
                },
                items: mine.map((u) => ({
                  key: u.id,
                  label: u.glyph,
                  lang: 'en',
                  done: unitCompleted(state, u.id),
                  progress: unitRatio(state, u.id),
                })),
              };
            })}
            onItem={(st, it) => go({ name: 'day', garden: 'english', unitId: it.key })}
          />
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
        <p className="sg-version">
          الإصدار {APP_VERSION} · {APP_BUILT}
        </p>
      </main>
    );
  }

  return (
    <div
      className={
        screen.name === 'qexplore' || (screen.name === 'surah' && screen.step === 'listen')
          ? 'sg-shell is-quran'
          : 'sg-shell'
      }
    >
      {body}
      <TabBar active={tab} onTab={onTab} />
    </div>
  );
}
