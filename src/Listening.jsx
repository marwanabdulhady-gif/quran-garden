import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  useGarden,
  activeChild,
  updateChild,
  awardStars,
  awardBadge,
  addGift,
  getState,
  addListening,
  parentBlock,
  weekKey,
} from './store.js';
import { GATES, SURAH_NAMES_FALLBACK } from './data.js';
import { getSurah, getSurahs } from './api.js';
import { Modal, Confetti, Loading, ErrorBox, cleanAyah, readAyah } from './Shared.jsx';
import { sfx } from './sound.js';

// إحصائيات الاستماع (P5-32): إجمالي + أسبوعي + لكل سورة + رسم أسبوعي
function StatsPanel({ child }) {
  const st = child.stats || {};
  const canvasRef = useRef(null);
  const totalMin = Math.round((st.seconds || 0) / 60);
  const weekMin = Math.round((st.weeks?.[weekKey()] || 0) / 60);
  const surahsN = Object.keys(st.surahs || {}).length;

  const weeksData = useMemo(() => {
    const out = [];
    const now = new Date();
    for (let i = 7; i >= 0; i--) {
      const d = new Date(now.getTime() - i * 7 * 86400000);
      const k = weekKey(d);
      out.push({ key: k, min: Math.round((st.weeks?.[k] || 0) / 60), label: 'W' + k.slice(-2) });
    }
    return out;
  }, [st.weeks]);

  useEffect(() => {
    const cv = canvasRef.current;
    if (!cv || !cv.getContext) return;
    const ctx = cv.getContext('2d');
    const W = cv.width;
    const H = cv.height;
    ctx.clearRect(0, 0, W, H);
    const max = Math.max(1, ...weeksData.map((w) => w.min));
    const bw = W / weeksData.length;
    weeksData.forEach((w, i) => {
      const h = Math.max(4, (w.min / max) * (H - 34));
      const x = i * bw + bw * 0.22;
      ctx.fillStyle = i === weeksData.length - 1 ? '#059669' : '#a7f3d0';
      ctx.fillRect(x, H - 26 - h, bw * 0.56, h);
      ctx.fillStyle = '#475569';
      ctx.font = '700 15px sans-serif';
      ctx.textAlign = 'center';
      if (w.min > 0) ctx.fillText(String(w.min), x + bw * 0.28, H - 30 - h);
      ctx.fillText(w.label, x + bw * 0.28, H - 8);
    });
  }, [weeksData]);

  if (!totalMin && !surahsN) return null;
  return (
    <div className="stats-panel">
      <div className="sp-title">📈 إحصائيات الاستماع</div>
      <div className="sp-row">
        <div className="sp-cell">
          <div className="num">{totalMin}</div>
          <div className="lbl">🎧 دقيقة إجمالي</div>
        </div>
        <div className="sp-cell">
          <div className="num">{weekMin}</div>
          <div className="lbl">📅 دقيقة الأسبوع</div>
        </div>
        <div className="sp-cell">
          <div className="num">{surahsN}</div>
          <div className="lbl">📖 سورة استُؤصلت</div>
        </div>
      </div>
      <canvas ref={canvasRef} className="sp-chart" width={600} height={90} />
      <p className="sp-sub">الدقائق تقدر تقريبا من عدد كلمات كل آية — لأ نعرف نتقدم قد إيه.</p>
    </div>
  );
}

function GateList({ gate, go }) {
  const s = useGarden();
  const child = activeChild(s);
  const [surahs, setSurahs] = useState(null);
  const [err, setErr] = useState(false);
  const [q, setQ] = useState('');
  const [armed, setArmed] = useState(false);
  const [inside, setInside] = useState(false);

  useEffect(() => {
    getSurahs()
      .then(setSurahs)
      .catch(() => setErr(true));
  }, []);

  const list = useMemo(() => {
    if (!surahs) return null;
    let arr = surahs.filter((x) => x.number >= gate.from && x.number <= gate.to);
    if (q.trim()) arr = arr.filter((x) => cleanAyah(x.name).includes(q.trim()) || String(x.number) === q.trim());
    return arr;
  }, [surahs, gate, q]);

  const total = gate.to - gate.from + 1;
  const completed = Object.keys(child.listening).filter(
    (k) => +k >= gate.from && +k <= gate.to && child.listening[k].completed
  ).length;

  const block = parentBlock(child);
  const blocked = block.quiet || block.over;

  const onEnter = () => {
    if (!armed) {
      setArmed(true);
      sfx.tap();
      setTimeout(() => setArmed(false), 3000);
    } else {
      sfx.ok();
      setInside(true);
    }
  };

  if (!inside) {
    return (
      <div
        className="screen gate-screen"
        style={{ alignItems: 'center', justifyContent: 'center', textAlign: 'center' }}
      >
        <div style={{ padding: 20 }}>
          <div className="gate-banner" aria-hidden="true">
            <img src={gate.img} alt="" />
          </div>
          <h1 style={{ fontSize: 28, fontWeight: 900, margin: '10px 0 4px' }}>{gate.title}</h1>
          <p className="muted" style={{ fontWeight: 800 }}>
            {gate.sub}
          </p>
          <p className="muted" style={{ margin: '14px auto 24px', maxWidth: 420, lineHeight: 2 }}>
            هنا بتسمع السورة كاملة ببطء وبتركيز، وكل آية بترفع خطوة في تقدمك. سمعت {completed} من {total} سورة لحد
            دلوقتي.
          </p>
          <button className={'btn big ' + (armed ? 'warm' : '')} onClick={onEnter}>
            {armed ? 'اضغط مرة أخرى للدخول' : 'ادخل البوابة'}
          </button>
          <div className="step-actions">
            <button className="btn ghost" onClick={() => go('garden')}>
              🌳 العودة للحديقة
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="screen gate-screen">
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
        <div className="title">{gate.title}</div>
        <span className="chip star-count">⭐ {child.stars}</span>
      </div>
      <div className="gate-head">
        <div className="gate-banner" aria-hidden="true">
          <img src={gate.img} alt="" />
        </div>
        <p>
          {completed} من {total} سورة تمّت ✓
        </p>
      </div>

      <div className="search-box">
        <input placeholder="🔍 انتقال سريع..." value={q} onChange={(e) => setQ(e.target.value)} />
      </div>

      <StatsPanel child={child} />

      {blocked && (
        <div className="parent-banner">
          🔒{' '}
          {block.quiet
            ? 'وقت السكون دلوقتي — التلاوة متوقفة مؤقتًا بأمر ماما وبابا.'
            : `خلصت استماع النهارده (${block.capMin} دقيقة) — نسمع تاني بعد ما يديونا الضوء الأخضر.`}
        </div>
      )}

      {err && <ErrorBox msg="تعذّر جلب قائمة السور. تأكد من الإنترنت." />}
      {!list && !err && <Loading />}
      <div className="surah-list">
        {list?.map((x) => {
          const p = child.listening[x.number] || {};
          const prog = p.heard ? Math.min(100, (p.heard / x.numberOfAyahs) * 100) : 0;
          return (
            <button
              key={x.number}
              className={'surah-row' + (p.completed ? ' completed' : '')}
              onClick={() => {
                sfx.tap();
                go('player', { gate: gate.id, surah: x.number });
              }}
            >
              <span className="s-num">{x.number}</span>
              <span className="s-body">
                <span className="s-name">{cleanAyah(x.name)}</span>
                <span className="s-meta" style={{ display: 'block' }}>
                  {x.numberOfAyahs} آية{p.heard ? ` · سمعت ${p.heard}` : ''}
                </span>
                <span className="s-progress">
                  <i style={{ width: prog + '%' }} />
                </span>
              </span>
              <span className="s-go">{p.completed ? '✓' : '▶'}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

export function Player({ gate, surahNum, go }) {
  const s = useGarden();
  const child = activeChild(s);
  const [surah, setSurah] = useState(null);
  const [err, setErr] = useState(false);
  // استئناف من آخر آية سمعها الطفل (وليس من أول السورة)
  const [cur, setCur] = useState(() => {
    const p0 = child.listening[surahNum];
    return p0?.heard && !p0.completed ? Math.min(p0.heard, 300) : 0;
  });
  const [playing, setPlaying] = useState(false);
  const [finished, setFinished] = useState(false);
  const [confetti, setConfetti] = useState(false);
  const audioRef = useRef(null);
  const curRef = useRef(0);
  const completedRef = useRef(!!child.listening[surahNum]?.completed);
  // تكرار الآية وسرعة التلاوة — بتتحفظ مع رحلة الطفل
  const [repeat, setRepeat] = useState(() => ([1, 2, 4].includes(child.playback?.repeat) ? child.playback.repeat : 1));
  const [speed, setSpeed] = useState(() =>
    [0.75, 1, 1.25].includes(child.playback?.speed) ? child.playback.speed : 1
  );
  const repeatRef = useRef(repeat);
  const speedRef = useRef(speed);
  const playsRef = useRef(0); // كم مرة لعبت الآية الحالية
  const playedRef = useRef(-1); // آخر آية اتلعبت
  repeatRef.current = repeat;
  speedRef.current = speed;

  const p = child.listening[surahNum] || { heard: 0 };
  const miniAyahsRef = useRef(null);

  // سكرول تلقائي للآية الحالية في شريط الأرقام
  useEffect(() => {
    const el = miniAyahsRef.current?.querySelector('.cur');
    if (el && el.scrollIntoView) el.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
  }, [cur]);

  const load = () => {
    setErr(false);
    getSurah(surahNum, child.reciter)
      .then((sur) => {
        setSurah(sur);
        setCur((c) => Math.min(c, sur.numberOfAyahs - 1));
      })
      .catch(() => setErr(true));
  };
  useEffect(load, [surahNum, child.reciter]); // eslint-disable-line

  const mark = (i, isEnd, totalN) => {
    updateChild(child.id, (c) => {
      const prev = c.listening[surahNum] || { heard: 0 };
      const heard = Math.max(prev.heard || 0, i + 1);
      const done = isEnd || i + 1 >= totalN;
      return { ...c, listening: { ...c.listening, [surahNum]: { heard, completed: done } } };
    });
    // إحصائيات الاستماع (P5-32): تقدير وقت الآية من كلماتها (مع مراعاة السرعة)
    const a = surah?.ayahs?.[i];
    if (a && a.text) {
      const words = cleanAyah(a.text).split(/\s+/).filter(Boolean).length;
      const rate = speedRef.current || 1;
      const secs = Math.min(120, Math.max(3, Math.round((words * 1.1) / rate)));
      addListening(child.id, { seconds: secs, surahNum, ayahs: 1 });
    }
    const done = isEnd || i + 1 >= totalN;
    if (done && !completedRef.current) {
      completedRef.current = true;
      awardStars(child.id, 2);
      addGift(child.id);
      const after = getState().children.find((c) => c.id === child.id);
      const count = Object.values(after.listening).filter((l) => l.completed).length;
      if (count >= 3) awardBadge(child.id, 'listener');
      setConfetti(true);
      setTimeout(() => setConfetti(false), 4200);
      setFinished(true);
    }
  };

  const playAt = (i) => {
    if (!surah) return;
    if (playedRef.current !== i) playsRef.current = 0;
    playedRef.current = i;
    curRef.current = i;
    if (!audioRef.current) {
      audioRef.current = new Audio();
      audioRef.current.onended = () => {
        const idx = curRef.current;
        const totalN = surah.numberOfAyahs;
        mark(idx, false, totalN);
        playsRef.current += 1;
        if (playsRef.current < repeatRef.current) {
          // كرّر نفس الآية كذا مرة قبل الانتقال (جوهر الحفظ)
          playAtRef.current(idx);
        } else if (idx + 1 < totalN) {
          setCur(idx + 1);
          playAtRef.current(idx + 1);
        } else {
          setPlaying(false);
          mark(idx, true, totalN);
        }
      };
      audioRef.current.onerror = () => setPlaying(false);
    }
    const a = surah.ayahs[i];
    if (!a || !a.audio) {
      setPlaying(false);
      return;
    }
    const el = audioRef.current;
    el.playbackRate = speedRef.current;
    el.src = a.audio;
    setPlaying(true);
    el.play().catch(() => setPlaying(false));
  };
  const playAtRef = useRef(playAt);
  playAtRef.current = playAt;

  const stop = () => {
    audioRef.current?.pause();
    setPlaying(false);
  };

  // الآية التالية / السابقة
  const step = (delta) => {
    if (!surah) return;
    stop();
    const n = Math.max(0, Math.min(surah.numberOfAyahs - 1, cur + delta));
    setCur(n);
    playAt(n);
  };

  const setRepeatV = (v) => {
    setRepeat(v);
    updateChild(child.id, (c) => ({ ...c, playback: { repeat: v, speed: c.playback?.speed ?? speed } }));
  };
  const setSpeedV = (v) => {
    setSpeed(v);
    if (audioRef.current) audioRef.current.playbackRate = v;
    updateChild(child.id, (c) => ({ ...c, playback: { repeat: c.playback?.repeat ?? repeat, speed: v } }));
  };

  // اختصارات الكيبورد: مسافة = تشغيل/إيقاف، ←/→ = الآية السابقة/التالية
  const keyRef = useRef(null);
  keyRef.current = (e) => {
    const t = e.target;
    if (t && (t.tagName === 'INPUT' || t.tagName === 'TEXTAREA' || t.tagName === 'SELECT')) return;
    if (e.code === 'Space') {
      e.preventDefault();
      if (playing) stop();
      else {
        playsRef.current = 0;
        playAt(cur);
      }
    } else if (e.key === 'ArrowLeft') {
      e.preventDefault();
      step(-1);
    } else if (e.key === 'ArrowRight') {
      e.preventDefault();
      step(1);
    }
  };
  useEffect(() => {
    const h = (e) => keyRef.current && keyRef.current(e);
    window.addEventListener('keydown', h);
    return () => window.removeEventListener('keydown', h);
  }, []);

  useEffect(() => () => audioRef.current?.pause(), []);

  // وضع الوالدين (P5-35): وقت السكون أو حدّ النهارده → نوقف التشغيل بوجه ودود
  const block = parentBlock(child);
  const blocked = block.quiet || block.over;

  if (blocked) {
    return (
      <div className="screen player">
        <Top
          go={go}
          title={cleanAyah(SURAH_NAMES_FALLBACK[surahNum] || '...')}
          avatar={child.avatarReading || '/assets/hero-reading-t.png'}
        />
        <div className="parent-gate">
          <div className="pg-emoji">🔒</div>
          <h2>{block.quiet ? 'وقت السكون دلوقتي' : 'خلصت استماع النهارده'}</h2>
          <p>
            {block.quiet
              ? 'ماما وبابا قالوا الوقت ده وقت هدوء — نسمع تاني بعد ما يخلص بإذنهم.'
              : `وصلت لحد استماع النهارده (${block.capMin} دقيقة) — برافو عليك! نكمل تاني بعد ما يديونا الضوء الأخضر.`}
          </p>
          <button className="btn" onClick={() => go('gate', { gate: gate.id })}>
            ارجع لقائمة السور 🌿
          </button>
        </div>
      </div>
    );
  }

  if (err) {
    return (
      <div className="screen player">
        <Top
          go={go}
          title={cleanAyah(SURAH_NAMES_FALLBACK[surahNum])}
          avatar={child.avatarReading || '/assets/hero-reading-t.png'}
        />
        <div className="player-ayah">
          <ErrorBox msg="تعذّر تحميل التلاوة. تأكد من الإنترنت واضغط للتشغيل مرة تانية." onRetry={load} />
        </div>
      </div>
    );
  }

  if (!surah) {
    return (
      <div className="screen player">
        <Top
          go={go}
          title={cleanAyah(SURAH_NAMES_FALLBACK[surahNum] || '...')}
          avatar={child.avatarReading || '/assets/hero-reading-t.png'}
        />
        <div className="player-ayah">
          <Loading />
        </div>
      </div>
    );
  }

  const ayah = surah.ayahs[cur];
  const canPlay = !!(ayah && ayah.audio);

  return (
    <div className="screen player">
      <div className="player-deco" aria-hidden="true" />
      <Top
        go={go}
        title={cleanAyah(surah.name)}
        sub={`${gate.title} · الآية ${cur + 1} من ${surah.numberOfAyahs}`}
        avatar={child.avatarReading || '/assets/hero-reading-t.png'}
      />
      <div className="player-ayah">
        <div className="ayah-frame">
          <span className="ref">
            {cleanAyah(surah.name)} · {cur + 1}
          </span>
          <div className={`text quran sz-${child.reading?.size || 'm'}`}>{readAyah(ayah.text, child)}</div>
        </div>
      </div>
      {surah.offline && (
        <div className="offline-note">
          📴 لستَ متصلًا بالإنترنت — الآيات تظهر من النسخة المحفوظة على جهازك، والتلاوة الصوتية تحتاج اتصالًا.
        </div>
      )}
      {!canPlay && (
        <div className="err-box">📴 التلاوة الصوتية غير متاحة حاليًا. تأكد من الإنترنت ثم اضغط للتشغيل.</div>
      )}
      <div className="player-ctrl">
        <div className="player-nav">
          <button className="nav-step" onClick={() => step(-1)} aria-label="الآية السابقة">
            ⏮
          </button>
          <div className="play-wrap">
            <svg className="play-ring" viewBox="0 0 100 100" aria-hidden="true">
              <circle className="pr-bg" cx="50" cy="50" r="46" />
              <circle
                className="pr-fg"
                cx="50"
                cy="50"
                r="46"
                strokeDasharray={`${(((cur + (playing ? 1 : 0)) / surah.numberOfAyahs) * 289.03).toFixed(1)} 289.03`}
              />
            </svg>
            <button
              className="play-big"
              disabled={!canPlay}
              onClick={() => {
                if (playing) stop();
                else {
                  playsRef.current = 0;
                  playAt(cur);
                }
              }}
            >
              {playing ? '⏸' : '▶️'}
            </button>
          </div>
          <button className="nav-step" onClick={() => step(1)} aria-label="الآية التالية">
            ⏭
          </button>
        </div>
        <div className="count">
          {playing
            ? `نسمع الآية... (${playsRef.current || 0 || 1}/${repeat})`
            : canPlay
              ? 'اضغط واسمع الآية'
              : 'النص فقط (بدون إنترنت)'}
        </div>
        <div className="track">
          <i style={{ width: ((cur + (playing ? 1 : 0)) / surah.numberOfAyahs) * 100 + '%' }} />
        </div>
      </div>
      <div className="player-more">
        <div className="chip-group">
          <span className="chip-lbl">🔁 التكرار</span>
          {[1, 2, 4].map((r) => (
            <button
              key={r}
              className={'chip-btn' + (repeat === r ? ' on' : '')}
              onClick={() => setRepeatV(r)}
              aria-label={`كرر الآية ${r} ${r === 1 ? 'مرة' : 'مرات'} ثم انتقل`}
            >
              {r}×
            </button>
          ))}
        </div>
        <div className="chip-group">
          <span className="chip-lbl">🐢 السرعة</span>
          {[0.75, 1, 1.25].map((v) => (
            <button
              key={v}
              className={'chip-btn' + (speed === v ? ' on' : '')}
              onClick={() => setSpeedV(v)}
              aria-label={`سرعة التلاوة ${v}`}
            >
              {v}×
            </button>
          ))}
        </div>
      </div>
      <div className="ayahs-mini" ref={miniAyahsRef} style={{ marginTop: 14 }}>
        {surah.ayahs.map((a, i) => (
          <button
            key={a.number}
            className={(i < p.heard ? 'heard ' : '') + (i === cur ? 'cur' : '')}
            onClick={() => {
              stop();
              setCur(i);
            }}
          >
            {i + 1}
          </button>
        ))}
      </div>
      <div className="step-actions" style={{ marginTop: 16 }}>
        <button
          className="btn ghost"
          onClick={() => {
            stop();
            setCur(0);
            setFinished(false);
            playsRef.current = 0;
            playAt(0);
          }}
        >
          🔄 إعادة السورة
        </button>
        <button
          className="btn"
          onClick={() => {
            stop();
            go('garden');
          }}
        >
          🌳 العودة للحديقة
        </button>
        <button
          className="btn warm"
          onClick={() => {
            stop();
            go('listen-review', { gate: gate.id });
          }}
        >
          🔁 مراجعة بالسماع
        </button>
      </div>

      <Confetti show={confetti} />
      {finished && (
        <Modal title="أحسنت في الاستماع! 🎉" onClose={() => setFinished(false)}>
          <div className="center">
            <div style={{ fontSize: 64 }}>🌟</div>
            <p style={{ fontWeight: 800, lineHeight: 2, marginTop: 8 }}>
              انتهت زيارة السورة {cleanAyah(surah.name)}.
              <br />
              +2 نجوم وعندك هدية في الحديقة 🎁
            </p>
            <div className="step-actions">
              <button className="btn" onClick={() => setFinished(false)}>
                متابعة
              </button>
              <button
                className="btn ghost"
                onClick={() => {
                  setFinished(false);
                  go('garden');
                }}
              >
                العودة للحديقة
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}

function Top({ go, title, sub, avatar }) {
  return (
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
      <div className="title" style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        {avatar && (
          <img
            src={avatar}
            alt=""
            style={{
              width: 46,
              height: 46,
              borderRadius: '50%',
              objectFit: 'cover',
              background: '#d1fae5',
              boxShadow: '0 4px 10px rgba(0,0,0,0.25)',
            }}
          />
        )}
        <span>
          {title}
          {sub && <div style={{ fontSize: 12, fontWeight: 700, opacity: 0.8 }}>{sub}</div>}
        </span>
      </div>
      <span />
    </div>
  );
}

export function ListenReview({ gate, go }) {
  const s = useGarden();
  const child = activeChild(s);
  const completed = [];
  for (let n = gate.from; n <= gate.to; n++) {
    if (child.listening[n]?.completed) completed.push(n);
  }
  const [round, setRound] = useState(null);
  const [picked, setPicked] = useState(null);
  const [confetti, setConfetti] = useState(false);

  const makeRound = () => {
    if (!completed.length) return Promise.resolve(null);
    const sn = completed[Math.floor(Math.random() * completed.length)];
    return getSurah(sn, child.reciter)
      .then((sur) => {
        const a = sur.ayahs[Math.floor(Math.random() * sur.ayahs.length)];
        const others = Object.keys(SURAH_NAMES_FALLBACK)
          .map((k) => +k)
          .filter((k) => k >= 58 && k <= 77 && k !== sn)
          .sort(() => Math.random() - 0.5)
          .slice(0, 2);
        const opts = [
          { id: sn, text: cleanAyah(SURAH_NAMES_FALLBACK[sn]) },
          ...others.map((k) => ({ id: k, text: cleanAyah(SURAH_NAMES_FALLBACK[k]) })),
        ].sort(() => Math.random() - 0.5);
        return { surah: sur, ayah: a, opts };
      })
      .catch(() => null);
  };

  useEffect(() => {
    setPicked(null);
    let alive = true;
    makeRound().then((r) => alive && setRound(r));
    return () => {
      alive = false;
    };
  }, []); // eslint-disable-line

  const onPick = (i, id) => {
    if (id === round.surah.number) {
      sfx.ok();
      setConfetti(true);
      setTimeout(() => setConfetti(false), 4200);
      awardStars(child.id, 1);
    } else sfx.wrong();
    setPicked(i);
  };

  const correctIdx = round ? round.opts.findIndex((o) => o.id === round.surah.number) : -1;

  return (
    <div className="screen gate-screen">
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
        <div className="title">🔁 مراجعة بالسماع</div>
        <span className="chip star-count">⭐ {child.stars}</span>
      </div>
      <div className="gate-head">
        <p>الآية دي من سورة إيه؟</p>
      </div>
      {!completed.length ? (
        <div className="center mt-16">
          <p className="muted">لسه ما تخلصت أي سورة في هالبوابة. ابدأ الاستماع أولًا 🌿</p>
          <div className="step-actions">
            <button className="btn" onClick={() => go('gate', { gate: gate.id })}>
              ادخل البوابة
            </button>
          </div>
        </div>
      ) : !round ? (
        <Loading />
      ) : (
        <div className="step-body" style={{ flex: 'none', padding: '10px 16px 40px' }}>
          <div className="ayah-card">
            <span className="ref">اسمع أو اقرأ</span>
            <div className={`text quran sz-${child.reading?.size || 'm'}`}>{readAyah(round.ayah.text, child)}</div>
          </div>
          <div className="quiz">
            {round.opts.map((o, i) => (
              <button
                key={o.id}
                className={'q-opt' + (picked === i ? (o.id === round.surah.number ? ' correct' : ' wrong') : '')}
                onClick={() => onPick(i, o.id)}
              >
                <span className="letter">{['أ', 'ب', 'ج'][i]}</span>
                <span>{o.text}</span>
              </button>
            ))}
          </div>
          <div className={'feedback ' + (picked === null ? '' : picked === correctIdx ? 'good' : 'bad')}>
            {picked === null ? '' : picked === correctIdx ? 'إجابة صحيحة! أحسنت يا بطل 🌟' : 'حاول تاني يا بطل 🤍'}
          </div>
          <div className="step-actions">
            <button
              className="btn"
              onClick={() => {
                setPicked(null);
                makeRound().then(setRound);
              }}
            >
              آية جديدة 🌱
            </button>
            <button className="btn ghost" onClick={() => go('garden')}>
              العودة للحديقة
            </button>
          </div>
        </div>
      )}
      <Confetti show={confetti} />
    </div>
  );
}

export default function Listening({ gateId, surahNum, go }) {
  const gate = GATES.find((g) => g.id === gateId) || GATES[0];
  if (surahNum) return <Player gate={gate} surahNum={surahNum} go={go} />;
  return <GateList gate={gate} go={go} />;
}
