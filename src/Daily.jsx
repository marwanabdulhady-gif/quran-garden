import React, { useEffect, useRef, useState } from 'react';
import { useGarden, activeChild, updateChild, awardStars, today } from './store.js';
import { pickTafakkur, SURAH_NAMES_FALLBACK } from './data.js';
import { getSurah } from './api.js';
import { Loading, readAyah } from './Shared.jsx';
import { sfx } from './sound.js';

function useTodayAyah(child) {
  const d = new Date();
  const seed = d.getFullYear() * 10000 + (d.getMonth() + 1) * 100 + d.getDate();
  const [data, setData] = useState(null);
  const [err, setErr] = useState(false);

  useEffect(() => {
    let alive = true;
    setData(null);
    setErr(false);
    const surahNum = 78 + ((seed * 7) % 37);
    getSurah(surahNum, child.reciter)
      .then((sur) => {
        if (!alive) return;
        const ayahNum = 1 + ((seed * 31) % sur.numberOfAyahs);
        setData({ surah: sur, ayahNum, ayah: sur.ayahs[ayahNum - 1] });
      })
      .catch(() => alive && setErr(true));
    return () => {
      alive = false;
    };
  }, [child.reciter]); // eslint-disable-line

  return { data, err };
}

function AudioBtn({ audio, label = '🔊 أستمع إلى الآية', small, onFirstPlay }) {
  const [playing, setPlaying] = useState(false);
  const ref = useRef(null);
  const [err, setErr] = useState(false);
  const firstRef = useRef(true);
  const toggle = () => {
    if (!ref.current) {
      ref.current = new Audio();
      ref.current.onended = () => setPlaying(false);
      ref.current.onerror = () => {
        setPlaying(false);
        setErr(true);
      };
    }
    if (playing) {
      ref.current.pause();
      setPlaying(false);
      return;
    }
    ref.current.src = audio;
    ref.current
      .play()
      .then(() => {
        setPlaying(true);
        if (firstRef.current && onFirstPlay) {
          firstRef.current = false;
          onFirstPlay();
        }
      })
      .catch(() => setErr(true));
  };
  return (
    <>
      <button className={'btn ' + (small ? 'small ' : '') + (playing ? 'warm' : '')} onClick={toggle} disabled={!audio}>
        {playing ? '⏸ إيقاف' : audio ? label : '📴 التلاوة تحتاج إنترنت'}
      </button>
      {err && <div className="err-box mt-10">تعذّر تشغيل التلاوة. جرّب مرة أخرى عند اتصال الإنترنت.</div>}
      {!audio && <div className="err-box mt-10">الآية تظهر من النسخة المحفوظة على جهازك — الصوت يحتاج اتصالًا.</div>}
    </>
  );
}

export default function Daily({ go }) {
  const s = useGarden();
  const child = activeChild(s);
  const { data, err } = useTodayAyah(child);
  const tCard = pickTafakkur(); // بطاقة التأمل بتتبدّل كل أسبوع (P5-34)
  const [tafa, setTafa] = useState(null);
  const [tafaErr, setTafaErr] = useState(false);
  const firstToday = child.daily.lastAyah !== today();

  useEffect(() => {
    let alive = true;
    getSurah(tCard.surah, child.reciter)
      .then((sur) => alive && setTafa(sur.ayahs.find((a) => a.numberInSurah === tCard.ayahNum)))
      .catch(() => alive && setTafaErr(true));
    return () => {
      alive = false;
    };
  }, [tCard.surah, child.reciter]); // eslint-disable-line

  const onFirstListen = () => {
    awardStars(child.id, 1);
    updateChild(child.id, (c) => ({ ...c, daily: { ...c.daily, lastAyah: today() } }));
  };

  return (
    <div className="screen daily-screen">
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
        <div className="title">🤍 آية اليوم</div>
        <span className="chip star-count">⭐ {child.stars}</span>
      </div>

      <div className="daily-card">
        <div className="d-heart">🤍</div>
        <h1>آية جديدة كل يوم</h1>
        {!data && !err && <Loading />}
        {data && (
          <>
            <div className={`ayah quran sz-${child.reading?.size || 'm'}`}>{readAyah(data.ayah.text, child)}</div>
            <div className="ref">
              {SURAH_NAMES_FALLBACK[data.surah.number]} · الآية {data.ayahNum} · جزء عمّ
            </div>
            <div className="step-actions">
              <AudioBtn audio={data.ayah.audio} onFirstPlay={onFirstListen} />
            </div>
            {firstToday && <p className="muted mt-10">اسمع الآية النهارده واكسب ⭐ +1 · بداية جميلة 🌱</p>}
          </>
        )}
        {err && <p className="muted">تعذّر تحميل الآية. تأكد من الإنترنت ورجّع الصفحة.</p>}
      </div>

      <div className="tafakkur">
        <span className="t-card-kicker">📅 تأمل الأسبوع</span>
        {tCard.img && (
          <div className="tafa-img" aria-hidden="true">
            <img src={tCard.img} alt="" loading="lazy" />
          </div>
        )}
        <h3>
          {tCard.emoji} {tCard.title} — {tCard.question}
        </h3>
        <p className="q">{tCard.meaning}</p>
        {tafaErr && <p className="muted">تعذّر تحميل الآية. تأكد من الإنترنت.</p>}
        {tafa && (
          <>
            <div className={`ayah quran tafakkur-ayah sz-${child.reading?.size || 'm'}`}>
              {readAyah(tafa.text, child)}
            </div>
            <div className="ref" style={{ fontSize: 12, color: '#64748b', fontWeight: 800 }}>
              {SURAH_NAMES_FALLBACK[tCard.surah]} · الآية {tCard.ayahNum}
            </div>
            <div className="step-actions">
              <AudioBtn audio={tafa.audio} small />
            </div>
            <div className="step-actions">
              <button className="btn ghost small" onClick={() => go('garden')}>
                سبحان الله · أعود لحديقتي 🌿
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
