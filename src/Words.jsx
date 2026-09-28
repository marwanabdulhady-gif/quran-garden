import React, { useEffect, useMemo, useState } from 'react';
import { useGarden, activeChild, markWord, wordState, awardStars, discoveredCount } from './store.js';
import { WORDS, WORDS_R2, TRIPS, SURAH_NAMES_FALLBACK } from './data.js';
import { getSurah } from './api.js';
import { Modal, Confetti, useAudio, Loading, ErrorBox, readAyah, EmptyState, flyStar } from './Shared.jsx';
import { sfx } from './sound.js';

function WordCard({ word, child, onOpen, style, locked = false }) {
  const ws = wordState(child, word.id);
  return (
    <button
      className={'word-card' + (ws.done ? ' done' : '') + (locked ? ' locked' : '')}
      style={style}
      disabled={locked}
      onClick={() => !locked && onOpen(word)}
    >
      <div className="w">{locked ? '🔒' : word.word}</div>
      <div className="w-ref">
        {SURAH_NAMES_FALLBACK[word.surah]} · {word.ayahNum}
      </div>
      <div className="w-status">
        {locked ? 'بتتفتح بعد الجولة الأولى' : ws.done ? 'اكتشفت معناها ✓' : 'اكتشف معناها'}
      </div>
    </button>
  );
}

function WordDetail({ word, child, onClose }) {
  const [ayah, setAyah] = useState(null);
  const [err, setErr] = useState(false);
  const au = useAudio();
  const ws = wordState(child, word.id);
  const [picked, setPicked] = useState(null);
  const [help, setHelp] = useState(false);
  const [confetti, setConfetti] = useState(false);

  const load = () => {
    setErr(false);
    getSurah(word.surah, child.reciter)
      .then((sur) => setAyah(sur.ayahs.find((a) => a.numberInSurah === word.ayahNum)))
      .catch(() => setErr(true));
  };
  useEffect(load, [word.id, child.reciter]); // eslint-disable-line

  const options = useMemo(
    () =>
      [
        { id: 'ok', text: word.meaning },
        { id: 'w1', text: word.wrong[0] },
        { id: 'w2', text: word.wrong[1] },
      ].sort(() => Math.random() - 0.5),
    [word.id]
  );

  const revealed = ws.done || help || (picked !== null && picked === options.findIndex((o) => o.id === 'ok'));

  const onPick = (i, id) => {
    if (id === 'ok') {
      sfx.ok();
      setPicked(i);
      setConfetti(true);
      setTimeout(() => setConfetti(false), 4200);
      if (!ws.done) {
        markWord(child.id, word.id, { done: true, discovered: true });
        awardStars(child.id, 1);
      }
    } else {
      sfx.wrong();
      setPicked(i);
    }
  };

  return (
    <Modal title="كلمة من القرآن" onClose={onClose}>
      <div className="word-detail">
        <div className="w-big">{word.word}</div>
        <div className={`quran ayah-line sz-${child.reading?.size || 'm'}`}>«{readAyah(word.ayah, child)}»</div>
        <div className="center">
          <button className="btn small" disabled={!ayah || err || !ayah.audio} onClick={() => au.play(ayah.audio)}>
            {err ? '🔄 إعادة' : au.playing ? '⏸ إيقاف الآية' : '🔊 أستمع إلى الآية'}
          </button>
          {err && <div className="err-box mt-10">تعذّر تشغيل التلاوة. جرّب مرة أخرى عند اتصال الإنترنت.</div>}
          {ayah && !ayah.audio && (
            <div className="err-box mt-10" style={{ background: '#fffbeb', borderColor: '#fde68a', color: '#92400e' }}>
              📴 التلاوة الصوتية تحتاج إنترنت.
            </div>
          )}
          {!ayah && !err && <Loading />}
        </div>

        {revealed ? (
          <>
            <div className="meaning-box">{word.meaning}</div>
            <a
              className="src"
              href={`https://quran.com/${word.surah}/${word.ayahNum}`}
              target="_blank"
              rel="noreferrer"
            >
              من التفسير الميسّر — المصدر ↗
            </a>
          </>
        ) : (
          <>
            <p className="center muted" style={{ margin: '12px 0 4px', fontWeight: 900, fontSize: 15 }}>
              ما معنى {word.word} في هذه الآية؟
            </p>
            {options.map((o, i) => {
              let cls = 'q-opt';
              if (picked === i) cls += picked === i && o.id === 'ok' ? ' correct' : ' wrong';
              return (
                <button
                  key={o.id}
                  className={cls}
                  style={{ margin: '8px auto 0', maxWidth: 440, width: '100%' }}
                  onClick={() => onPick(i, o.id)}
                >
                  <span className="letter">{['أ', 'ب', 'ج'][i]}</span>
                  <span>{o.text}</span>
                </button>
              );
            })}
            <div className="step-actions">
              <button className="btn ghost small" onClick={() => setHelp(true)}>
                ساعدني أفهم الكلمة
              </button>
            </div>
          </>
        )}
      </div>
      <Confetti show={confetti} />
    </Modal>
  );
}

export default function Words({ go }) {
  const s = useGarden();
  const child = activeChild(s);
  const [open, setOpen] = useState(null);
  const disc = discoveredCount(child);
  const r1Complete = WORDS.every((w) => wordState(child, w.id).done);
  const reviewed = [...WORDS, ...WORDS_R2].filter((w) => wordState(child, w.id).done).length;

  return (
    <div className="screen words-screen">
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
        <div className="title">📖 كلماتي من القرآن</div>
        <span className="chip star-count">⭐ {child.stars}</span>
      </div>
      {disc === 0 ? (
        <EmptyState
          icon="📖"
          title="هنا بتتجمع كلماتك المكتشفة"
          sub="اعبر جسر المعاني واكتشف أول كلمة، وهتلاقيها هنا مع معناها ومصدره."
          actionLabel="نمشي الجسر دلوقتي 🌉"
          onAction={() => go('bridge')}
        />
      ) : (
        <>
          <div className="words-head">
            <h1>مجموعة صغيرة تكبر معك 🌿</h1>
            <p>راجعت {reviewed} من أصل ٣٠. افتح أي بطاقة لتتعلّم معناها ومصدره.</p>
          </div>

          <div className="journey-stats">
            <div className="stat-card">
              <div className="num">{disc} / ٣٠</div>
              <div className="lbl">🌱 الكلمات المكتشفة</div>
            </div>
          </div>

          <div className="review-banner">
            <button
              className="btn warm"
              onClick={() => {
                sfx.tap();
                go('bridge', { review: true });
              }}
            >
              🔁 نراجع المعاني دلوقتي 🌱
            </button>
          </div>
        </>
      )}

      <div className="words-grid">
        {WORDS.map((w, i) => (
          <WordCard
            key={w.id}
            word={w}
            child={child}
            style={{ '--i': i }}
            onOpen={(word) => {
              sfx.tap();
              setOpen(word);
            }}
          />
        ))}
        {WORDS_R2.map((w, i) => (
          <WordCard
            key={w.id}
            word={w}
            child={child}
            locked={!r1Complete}
            style={{ '--i': i }}
            onOpen={(word) => {
              sfx.tap();
              setOpen(word);
            }}
          />
        ))}
      </div>
      {!r1Complete && (
        <p className="center muted r2-note">🔒 الجولات العشر الجديدة بتتفتح لما تكتمل الجولة الأولى على جسر المعاني</p>
      )}

      {open && <WordDetail word={open} child={child} onClose={() => setOpen(null)} />}
    </div>
  );
}
