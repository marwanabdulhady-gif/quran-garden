import React, { useEffect, useMemo, useState } from 'react';
import {
  useGarden,
  activeChild,
  markWord,
  wordState,
  awardStars,
  awardBadge,
  addGift,
  discoveredCount,
  updateChild,
} from './store.js';
import { WORDS, WORDS_R2, TRIPS, TRIPS_R2, BADGES, LEVELS, SURAH_NAMES_FALLBACK } from './data.js';
import { getSurah } from './api.js';
import {
  Modal,
  Confetti,
  useAudio,
  RecorderRow,
  Loading,
  ErrorBox,
  splitWord,
  readAyah,
  EmptyState,
  flyStar,
} from './Shared.jsx';
import { sfx } from './sound.js';

const ALL_WORDS = [...WORDS, ...WORDS_R2]; // كل كلمات الجولتين
const byId = (id) => ALL_WORDS.find((w) => w.id === id);
const tripWords = (trip) => trip.words.map(byId);
const doneInTrip = (child, trip) => trip.words.filter((w) => wordState(child, w).done).length;

function bridgeAyah(child, word, set) {
  return getSurah(word.surah, child.reciter)
    .then((surah) => set(surah.ayahs.find((a) => a.numberInSurah === word.ayahNum)))
    .catch((e) => set({ error: true }));
}

export function Quiz({ options, onPick, picked, correctId, disabled, reveal = false }) {
  const letters = ['أ', 'ب', 'ج'];
  return (
    <div className="quiz">
      {options.map((o, i) => {
        // picked = فهرس الاختيار، و correctId = معرّف — لازم نوغلطش نقيس الفهرس بالمعرّف
        const isCorrect = o.id === correctId;
        let cls = 'q-opt';
        if (picked === i) cls += isCorrect ? ' correct' : ' wrong';
        // لا تُكشف الإجابة الصحيحة إلا عند السماح (بعد محاولتين أو بطلب مساعدة)
        else if (picked !== null && reveal && isCorrect) cls += ' correct';
        return (
          <button key={o.id} className={cls} disabled={disabled} onClick={(e) => onPick(i, o.id, e.currentTarget)}>
            <span className="letter">{letters[i]}</span>
            <span>{o.text}</span>
          </button>
        );
      })}
    </div>
  );
}

export function StepScreen({ trip, go }) {
  const s = useGarden();
  const child = activeChild(s);
  const words = useMemo(() => tripWords(trip), [trip]);
  const [idx, setIdx] = useState(() => {
    const i = words.findIndex((w) => !wordState(child, w.id).done);
    return i === -1 ? words.length - 1 : i;
  });
  const word = words[Math.min(idx, words.length - 1)];
  const ws = wordState(child, word.id);

  const [ayah, setAyah] = useState(null);
  const [ayahErr, setAyahErr] = useState(false);
  const au = useAudio();
  const [phase, setPhase] = useState(ws.done ? 'reveal' : 'listen'); // listen | quiz | reveal
  const [picked, setPicked] = useState(null);
  const [help, setHelp] = useState(false);
  const [misses, setMisses] = useState(0);
  const [feedback, setFeedback] = useState(null);
  const [confetti, setConfetti] = useState(false);
  const [celebrate, setCelebrate] = useState(null); // {badgeKey}

  const level = LEVELS.find((l) => l.id === child.bridge.level) || LEVELS[0];

  useEffect(() => {
    setAyah(null);
    setAyahErr(false);
    setPicked(null);
    setHelp(false);
    setMisses(0);
    setFeedback(null);
    setPhase(wordState(child, word.id).done ? 'reveal' : 'listen');
  }, [word.id]); // eslint-disable-line

  const loadAyah = () => {
    setAyahErr(false);
    bridgeAyah(child, word, (a) => (a.error ? (setAyahErr(true), setAyah(null)) : setAyah(a)));
  };
  useEffect(loadAyah, [word.id, child.reciter]); // eslint-disable-line

  const options = useMemo(() => {
    const all = [
      { id: 'ok', text: word.meaning },
      { id: 'w1', text: word.wrong[0] },
      { id: 'w2', text: word.wrong[1] },
    ];
    return all.sort(() => Math.random() - 0.5);
  }, [word.id]); // eslint-disable-line

  const onPick = (i, id, el) => {
    setPicked(i);
    if (id === 'ok') {
      sfx.ok();
      flyStar(el);
      setFeedback({ good: true, text: 'إجابة صحيحة! أحسنت يا بطل 🌟' });
      markWord(child.id, word.id, { done: true, discovered: true });
      awardStars(child.id, level.stars);
      const before = discoveredCount(child);
      if (before < 10 && 1 + before >= 10) awardBadge(child.id, 'persist');
      if (before + 1 === WORDS.length + WORDS_R2.length) awardBadge(child.id, 'round2');
      setConfetti(true);
      setTimeout(() => setConfetti(false), 4200);
      const doneNow = doneInTrip(child, trip) + 1;
      if (doneNow >= trip.words.length) {
        awardBadge(child.id, 'trip' + trip.id);
        addGift(child.id);
        setCelebrate({ badgeKey: 'trip' + trip.id, name: trip.name, final: true });
      } else if (before === 0) {
        awardBadge(child.id, 'start');
        setCelebrate({ badgeKey: 'start', name: '' });
      }
    } else {
      sfx.wrong();
      setMisses((m) => m + 1);
      setFeedback({ good: false, text: 'حاول تاني يا بطل 🤍' });
    }
  };

  const next = () => {
    setCelebrate(null);
    if (idx + 1 < words.length) setIdx(idx + 1);
    else go('bridge');
  };

  const hl = splitWord(word.ayah, word.word, child.reading?.plain === true);
  const doneCount = doneInTrip(child, trip);
  const tripComplete = doneCount >= words.length;
  const heroPos = (doneCount / trip.words.length) * 100;

  return (
    <div className="step-screen" style={{ '--acc': trip.accent, '--acc-soft': trip.soft }}>
      <div className="topbar">
        <button
          className="icon-btn"
          onClick={() => {
            sfx.tap();
            go('bridge');
          }}
          aria-label="العودة"
        >
          ←
        </button>
        <div className="title">
          {trip.emoji} {trip.name} · الخطوة {Math.min(idx + 1, 5)} من 5
        </div>
        <span className="chip trip-chip">⭐ {child.stars}</span>
      </div>

      {/* شريط الجسر */}
      <div className="bridge-strip">
        <span className="bank r">🏞️</span>
        <span className="bank l">🌉</span>
        <div className="plank" />
        {words.map((_, i) => (
          <span key={i} className={'step-dot' + (i < doneCount ? ' on' : '')} style={{ right: (i / 5) * 100 + '%' }} />
        ))}
        <span className="step-dot on" style={{ right: '100%' }} />
        <div className="mini-hero" style={{ right: heroPos + '%' }}>
          <img src={child.avatar || '/assets/hero-standing-t.png'} alt="شخصيتك" />
        </div>
        <div style={{ textAlign: 'center', fontSize: 12, fontWeight: 800, color: '#334155', marginTop: 34 }}>
          شخصيتك على جسر الحديقة، تقدّمت {doneCount} من {trip.words.length} خطوات
        </div>
      </div>

      <div className="step-body">
        <div className="ayah-card">
          <span className="ref">
            سورة {SURAH_NAMES_FALLBACK[word.surah] || word.surah} · الآية {word.ayahNum}
          </span>
          <div className={`text quran sz-${child.reading?.size || 'm'}`}>
            {ayahErr ? (
              <ErrorBox msg="تعذّر تحميل التلاوة. تأكد من الإنترنت واضغط للتشغيل مرة تانية." onRetry={loadAyah} />
            ) : ayah ? (
              <>
                {hl.found ? (
                  <>
                    {hl.before}
                    <span className="hl">{hl.mid}</span>
                    {hl.after}
                  </>
                ) : (
                  readAyah(word.ayah, child)
                )}
              </>
            ) : (
              <Loading />
            )}
          </div>
        </div>

        <div className="center">
          <button
            className={'play-big' + (au.playing ? ' playing' : '')}
            disabled={!ayah || ayahErr || !ayah.audio}
            onClick={() => {
              au.play(ayah.audio);
            }}
          >
            {au.playing ? '⏸' : '▶️'}
          </button>
          <div className="muted">{au.playing ? 'إيقاف الآية' : 'اضغط واسمع الآية...'}</div>
          {au.error && <div className="err-box mt-10">تعذّر تشغيل التلاوة. تأكد من اتصال الإنترنت.</div>}
          {ayah && !ayah.audio && (
            <div className="err-box mt-10" style={{ background: '#fffbeb', borderColor: '#fde68a', color: '#92400e' }}>
              📴 التلاوة الصوتية تحتاج إنترنت — النص ظاهر من النسخة المحفوظة على جهازك.
            </div>
          )}
        </div>

        <RecorderRow />

        {tripComplete && (
          <>
            <div className="meaning-reveal">
              <div className="m-word">{word.word}</div>
              <p>{word.meaning}</p>
              <a href={`https://quran.com/${word.surah}/${word.ayahNum}`} target="_blank" rel="noreferrer">
                قراءة التفسير الميسّر — المصدر ↗
              </a>
            </div>
            <div className="step-actions">
              <span className="chip">✓ اكتملت الرحلة — وصلت الضفة الأُخرى</span>
            </div>
            <div className="step-actions">
              <button className="btn" onClick={() => go('bridge')}>
                🏁 العودة إلى الرحلات
              </button>
              <button className="btn ghost" onClick={() => go('garden')}>
                🌳 العودة للحديقة
              </button>
            </div>
          </>
        )}

        {phase !== 'reveal' && (
          <>
            <div className="quiz">
              <div className="q-title">
                ما معنى <b>{word.word}</b> في هذه الآية؟
              </div>
            </div>
            <Quiz
              options={options}
              onPick={onPick}
              picked={picked}
              correctId="ok"
              disabled={picked !== null && picked === options.findIndex((o) => o.id === 'ok')}
              reveal={help || misses >= 2}
            />
            <div className={'feedback ' + (feedback ? (feedback.good ? 'good' : 'bad') : '')}>
              {phase === 'listen' && picked === null ? 'جاهز… نَعبر الجسر!' : feedback ? feedback.text : ''}
            </div>
            {!feedback?.good && !help && misses < 2 && (
              <div className="step-actions">
                <button
                  className="btn ghost"
                  onClick={() => {
                    setHelp(true);
                    setPicked(null);
                  }}
                >
                  ساعدني أفهم الكلمة
                </button>
              </div>
            )}
          </>
        )}

        {(help || misses >= 2) && !feedback?.good && (
          <div className="meaning-reveal">
            <div className="m-word">{word.word}</div>
            <p>{word.meaning}</p>
            <a href={`https://quran.com/${word.surah}/${word.ayahNum}`} target="_blank" rel="noreferrer">
              قراءة التفسير الميسّر — المصدر ↗
            </a>
            {!feedback?.good && (
              <div className="step-actions">
                <button className="btn" onClick={() => setPicked(null)}>
                  عرفت المعنى… أحاول مرة أخرى
                </button>
              </div>
            )}
          </div>
        )}

        {feedback?.good && !tripComplete && (
          <div className="meaning-reveal">
            <div className="m-word">{word.word}</div>
            <p>{word.meaning}</p>
            <a href={`https://quran.com/${word.surah}/${word.ayahNum}`} target="_blank" rel="noreferrer">
              قراءة التفسير الميسّر — المصدر ↗
            </a>
          </div>
        )}

        {feedback?.good && !tripComplete && (
          <div className="step-actions">
            <button className="btn big" onClick={next}>
              {idx + 1 < words.length ? 'نكمل إلى الخطوة التالية 🌱' : 'وصلنا! افتح وسام الرحلة 🏅'}
            </button>
          </div>
        )}
      </div>

      <Confetti show={confetti} colors={trip.confetti} />
      {celebrate && (
        <Celebration
          badgeKey={celebrate.badgeKey}
          final={celebrate.final}
          tripName={celebrate.name}
          accent={trip.accent}
          confettiColors={trip.confetti}
          go={go}
          onPrimary={() => {
            setCelebrate(null);
            if (celebrate.final) go('bridge');
          }}
        />
      )}
    </div>
  );
}

function Celebration({ badgeKey, final, tripName, accent, confettiColors, go, onPrimary }) {
  const badge = BADGES[badgeKey] || { emoji: '✨', name: 'خطوة جديدة' };
  const isTrip = badgeKey.startsWith('trip');
  return (
    <>
      <Confetti show colors={confettiColors} />
      <div className="overlay" style={{ zIndex: 55 }}>
        <div className="modal" style={{ textAlign: 'center', borderTop: `6px solid ${accent || '#10b981'}` }}>
          <img className="celebrate-hero" src="/assets/hero-celebrate-t.png" alt="" aria-hidden="true" />
          <div className="badge-medal">{badge.emoji}</div>
          <h2 style={{ fontSize: 24 }}>{isTrip ? 'عبرت الجسر… أحسنت!' : 'بداية جميلة 🌱'}</h2>
          <p className="muted" style={{ fontWeight: 800, marginTop: 6 }}>
            {isTrip ? `${tripName} اكتملت واستلمت ${badge.name}` : `استلمت ${badge.name}`}
          </p>
          <p className="muted" style={{ marginTop: 10, fontSize: 13, lineHeight: 2 }}>
            {isTrip ? 'كل معنى خطوة جميلة، وعندك هدية جديدة في حديقتك 🎁' : 'مع كل معنى، تفتح خطوة على الجسر'}
          </p>
          <div className="step-actions">
            <button className="btn big" onClick={onPrimary}>
              {isTrip ? 'العودة إلى الرحلات' : 'نكمل الرحلة 🌱'}
            </button>
            <button
              className="btn ghost"
              onClick={() => {
                onPrimary();
                go('garden');
              }}
            >
              🌳 العودة للحديقة
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

function ReviewScreen({ go }) {
  const s = useGarden();
  const child = activeChild(s);
  const doneWords = [...WORDS, ...WORDS_R2].filter((w) => wordState(child, w.id).done);
  const [round, setRound] = useState(() => makeRound(doneWords, child));
  const [picked, setPicked] = useState(null);
  const au = useAudio();
  const [confetti, setConfetti] = useState(false);

  function makeRound(pool, c) {
    if (!pool.length) return null;
    const w = pool[Math.floor(Math.random() * pool.length)];
    const others = [...WORDS, ...WORDS_R2]
      .filter((x) => x.surah !== w.surah && x.id !== w.id)
      .map((x) => x.surah)
      .filter((v, i, a) => a.indexOf(v) === i);
    const opts = [
      { id: w.surah, text: SURAH_NAMES_FALLBACK[w.surah] || 'سورة ' + w.surah },
      ...others
        .sort(() => Math.random() - 0.5)
        .slice(0, 2)
        .map((sn) => ({ id: sn, text: SURAH_NAMES_FALLBACK[sn] || 'سورة ' + sn })),
    ].sort(() => Math.random() - 0.5);
    return { word: w, opts, audio: null };
  }

  useEffect(() => {
    setPicked(null);
    if (!round) return;
    getSurah(round.word.surah, child.reciter)
      .then((sur) => {
        const a = sur.ayahs.find((x) => x.numberInSurah === round.word.ayahNum);
        setRound((r) => (r ? { ...r, audio: a } : r));
      })
      .catch(() => {});
  }, [round && round.word.id]); // eslint-disable-line

  if (!doneWords.length) {
    return (
      <div className="screen bridge-screen">
        <div className="topbar">
          <button
            className="icon-btn"
            onClick={() => {
              sfx.tap();
              go('bridge');
            }}
            aria-label="العودة"
          >
            ←
          </button>
          <div className="title">🔁 نراجع المعاني</div>
          <span />
        </div>
        <div className="center mt-16" style={{ padding: 20 }}>
          <EmptyState
            icon="🌉"
            title="لسه ما فيه كلمات نراجعها"
            sub="اعبر الجسر وتعلم أول خمس كلمات، وبعدين نرجع نراجعها هنا."
            actionLabel="نبدأ الرحلة"
            onAction={() => go('bridge')}
          />
        </div>
      </div>
    );
  }

  const totalReviewed = doneWords.reduce((a, w) => a + (wordState(child, w.id).reviewed || 0), 0);

  const onPick = (i, id, el) => {
    if (id === round.word.surah) {
      sfx.ok();
      flyStar(el);
      setConfetti(true);
      setTimeout(() => setConfetti(false), 4200);
      setPicked(i);
      markWord(child.id, round.word.id, {
        reviewed: (wordState(child, round.word.id).reviewed || 0) + 1,
        discovered: true,
      });
      awardStars(child.id, 1);
      if (totalReviewed + 1 >= 10) awardBadge(child.id, 'reviewer');
    } else {
      sfx.wrong();
      setPicked(i);
    }
  };

  return (
    <div className="screen bridge-screen">
      <div className="topbar">
        <button
          className="icon-btn"
          onClick={() => {
            sfx.tap();
            go('bridge');
          }}
          aria-label="العودة"
        >
          ←
        </button>
        <div className="title">🔁 نراجع المعاني</div>
        <span className="chip star-count">⭐ {child.stars}</span>
      </div>
      <div className="journey-stats">
        <div className="stat-card">
          <div className="num">{totalReviewed}</div>
          <div className="lbl">مراجعة تمت</div>
        </div>
        <div className="stat-card">
          <div className="num">{doneWords.length}</div>
          <div className="lbl">كلمات مكتشفة</div>
        </div>
      </div>
      <div className="step-body">
        <div className="ayah-card">
          <span className="ref">آية من كلماتي</span>
          <div className={`text quran sz-${child.reading?.size || 'm'}`}>{readAyah(round.word.ayah, child)}</div>
        </div>
        <div className="center">
          <button
            className={'play-big' + (au.playing ? ' playing' : '')}
            disabled={!round.audio}
            onClick={() => au.play(round.audio.audio)}
          >
            {au.playing ? '⏸' : '▶️'}
          </button>
          <div className="muted">🎧 أو نراجع بالسماع: الآية من أي سورة؟</div>
        </div>
        <Quiz
          options={round.opts}
          onPick={onPick}
          picked={picked}
          correctId={round.word.surah}
          disabled={picked !== null && picked === round.opts.findIndex((o) => o.id === round.word.surah)}
        />
        <div
          className={
            'feedback ' +
            (picked === null ? '' : picked === round.opts.findIndex((o) => o.id === round.word.surah) ? 'good' : 'bad')
          }
        >
          {picked === null
            ? ''
            : picked === round.opts.findIndex((o) => o.id === round.word.surah)
              ? 'راجعت معنى جميلًا، وأضفت خطوة لرحلتك 🌟'
              : 'ركز واسمع كويس! جرب تاني 💪'}
        </div>
        <div className="step-actions">
          <button
            className="btn"
            onClick={() => {
              au.stop();
              setRound(makeRound(doneWords, child));
            }}
          >
            {picked !== null ? 'سؤال جديد 🌱' : 'سؤال جديد 🌱'}
          </button>
          <button className="btn ghost" onClick={() => go('bridge')}>
            الرجوع إلى الجسور
          </button>
        </div>
      </div>
      <Confetti show={confetti} />
    </div>
  );
}

export default function Bridge({ go, initialView = 'list' }) {
  const s = useGarden();
  const child = activeChild(s);
  const [view, setView] = useState(initialView); // list | trip | review
  const [tripId, setTripId] = useState(null);

  const disc = discoveredCount(child);
  const allTrips = [...TRIPS, ...TRIPS_R2];
  const tripsDone = allTrips.filter((t) => doneInTrip(child, t) >= t.words.length).length;
  const r1Complete = TRIPS.every((t) => doneInTrip(child, t) >= t.words.length);
  const level = LEVELS.find((l) => l.id === child.bridge.level) || LEVELS[0];
  const trip = allTrips.find((t) => t.id === tripId);

  if (view === 'trip' && trip) {
    return <StepScreen trip={trip} go={go} />;
  }
  if (view === 'review') {
    return <ReviewScreen go={go} />;
  }

  return (
    <div className="screen bridge-screen">
      <div className="topbar">
        <button
          className="icon-btn"
          onClick={() => {
            sfx.tap();
            go('garden');
          }}
          aria-label="العودة"
        >
          ←
        </button>
        <div className="title">🌉 جسر المعاني</div>
        <span className="chip star-count">⭐ {child.stars}</span>
      </div>

      <div className="journey-head">
        <span className="kicker">جزء عمّ · ٣٠ كلمة · ٦ رحلات</span>
        <h1>كل كلمة… اكتشاف جديد</h1>
        <p>تعلّم الكلمة، اكتشف معناها، واعبر بشخصيتك إلى الضفة الأُخرى. مغامرة صغيرة، ومعانٍ تكبر معك.</p>
      </div>

      <div className="journey-stats">
        <div className="stat-card">
          <div className="num">{disc} / ٣٠</div>
          <div className="lbl">🌱 الكلمات المكتشفة</div>
        </div>
        <div className="stat-card">
          <div className="num">{tripsDone} / ٦</div>
          <div className="lbl">🌉 رحلات جسر المعاني</div>
        </div>
        <button
          className="stat-card clickable"
          onClick={() => {
            sfx.tap();
            go('badges');
          }}
          aria-label="افتح جدار الأوسمة"
        >
          <div className="num">{child.badges.length}</div>
          <div className="lbl">🏅 الأوسمة</div>
        </button>
      </div>

      <div className="level-row">
        <span className="muted">المستوى:</span>
        {LEVELS.map((l) => (
          <button
            key={l.id}
            className={child.bridge.level === l.id ? 'on' : ''}
            onClick={() => {
              sfx.tap();
              updateChild(child.id, { bridge: { ...child.bridge, level: l.id } });
            }}
          >
            {l.name}
          </button>
        ))}
      </div>

      <div className="trips-list">
        {TRIPS.map((t) => {
          const d = doneInTrip(child, t);
          const complete = d >= t.words.length;
          return (
            <button
              key={t.id}
              className={'trip-card' + (complete ? ' done' : '')}
              style={{ '--acc': t.accent, '--acc-soft': t.soft }}
              onClick={() => {
                sfx.tap();
                setTripId(t.id);
                setView('trip');
              }}
            >
              <span className="t-emoji">{t.emoji}</span>
              <span className="t-body">
                <span className="t-name">{t.name}</span>
                <br />
                <span className="t-desc">{t.desc}</span>
                <span className="t-progress">
                  <i style={{ width: (d / t.words.length) * 100 + '%' }} />
                </span>
              </span>
              <span className="t-badge">
                {complete ? '✓ ' : ''}
                {t.badge}
              </span>
              <span className="go">{complete ? '🏅' : '›'}</span>
            </button>
          );
        })}
      </div>

      {/* الجولة الثانية: بتتفتح لما تكتمل الجولة الأولى */}
      <div className="round2-head">
        <span className="kicker">{r1Complete ? '🌠 الجولة الثانية فتحت!' : '🔒 الجولة الثانية — مقفلة'}</span>
        <p className="r2-sub">
          {r1Complete
            ? 'ما شاء الله! اكتملت الجولة الأولى — دلوقتي عندك رحلتين جديدتين.'
            : `اكتمل الجولة الأولى (${TRIPS.filter((t) => doneInTrip(child, t) >= t.words.length).length} من ٤ رحلات) وبنفتحلك العشرة الجديدة.`}
        </p>
      </div>

      <div className={'trips-list r2' + (r1Complete ? '' : ' locked')}>
        {TRIPS_R2.map((t) => {
          const d = r1Complete ? doneInTrip(child, t) : 0;
          const complete = d >= t.words.length;
          return (
            <button
              key={t.id}
              className={'trip-card' + (complete ? ' done' : '') + (r1Complete ? '' : ' locked')}
              style={{ '--acc': t.accent, '--acc-soft': t.soft }}
              disabled={!r1Complete}
              onClick={() => {
                if (!r1Complete) return;
                sfx.tap();
                setTripId(t.id);
                setView('trip');
              }}
            >
              <span className="t-emoji">{r1Complete ? t.emoji : '🔒'}</span>
              <span className="t-body">
                <span className="t-name">{t.name}</span>
                <br />
                <span className="t-desc">{t.desc}</span>
                <span className="t-progress">
                  <i style={{ width: (d / t.words.length) * 100 + '%' }} />
                </span>
              </span>
              <span className="t-badge">
                {complete ? '✓ ' : ''}
                {t.badge}
              </span>
              <span className="go">{complete ? '🏅' : r1Complete ? '›' : ''}</span>
            </button>
          );
        })}
      </div>

      <div className="step-actions" style={{ justifyContent: 'center' }}>
        {disc > 0 && (
          <button
            className="btn warm"
            onClick={() => {
              sfx.tap();
              setView('review');
            }}
          >
            🔁 نراجع المعاني
          </button>
        )}
        <button
          className="btn"
          onClick={() => {
            sfx.tap();
            go('words');
          }}
        >
          📖 افتح مجموعة كلماتي
        </button>
      </div>

      <p className="center muted mt-16" style={{ maxWidth: 460, margin: '16px auto 0', lineHeight: 2 }}>
        نتعلّم بهدوء، ونتقدم خطوة خطوة. تقدمك محفوظ مع رحلتك في هذا المتصفح.
      </p>
    </div>
  );
}
