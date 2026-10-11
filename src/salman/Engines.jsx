// محرّكات الألعاب المشتركة لحدائق النور: صيد الصوت · التتبّع · القطار · صناديق الأصوات.
// محرّك واحد لكل لعبة يخدم العربية والرياضيات والإنجليزية (البيانات هي التي تختلف) — انظر الخطة §6.
import React, { useEffect, useRef, useState } from 'react';
import { assetUrl, playStory } from './lib/voice.js';
import { speak } from './lib/speech.js';
import { sfx } from './lib/sfx.js';
import { huntTap, huntTargets, trainCorrect, boxesCorrect, scramble } from './lib/letterday.js';

// نطق نص قصير: مقطع مسجّل إن وُجد، وإلا صوت المتصفح
function say(text, lang = 'ar') {
  speak(text, lang);
}

const dirOf = (lang, fallback) => ((lang || fallback) === 'en' ? 'ltr' : 'rtl');

// ---------- 1) صيد الصوت: انقر كل ما يبدأ بالصوت ----------
export function Hunt({ hunt, lang = 'ar', color, onDone }) {
  const [found, setFound] = useState([]);
  const [message, setMessage] = useState('');
  const total = huntTargets(hunt);

  const tap = (item, i) => {
    const result = huntTap(hunt, found, i);
    if (result === 'hit') {
      const next = [...found, i];
      setFound(next);
      sfx('tap');
      say(item.label, item.lang || lang);
      setMessage('أحسنت! 🎯');
      if (found.length + 1 >= total) {
        sfx('correct');
        onDone?.();
      }
    } else if (result === 'again') {
      say(item.label, item.lang || lang);
    } else {
      sfx('retry');
      setMessage('هذا لا يبدأ بالصوت… جرّب غيره 🤗');
    }
  };

  return (
    <div className="sg-hunt">
      <p className="sg-prompt" lang={hunt.lang || lang} dir={dirOf(hunt.lang, lang)}>
        {hunt.prompt}
      </p>
      <div className="sg-hunt-grid">
        {hunt.items.map((item, i) => (
          <button
            key={item.label}
            type="button"
            className={found.includes(i) ? 'sg-hunt-item is-found' : 'sg-hunt-item'}
            style={{ '--g': color }}
            onClick={() => tap(item, i)}
            aria-pressed={found.includes(i)}
          >
            <span className="sg-hunt-emoji" aria-hidden="true">
              {item.emoji}
            </span>
            <span className="sg-hunt-label" lang={item.lang || lang} dir={dirOf(item.lang, lang)}>
              {item.label}
            </span>
            {found.includes(i) && <span className="sg-hunt-check">✓</span>}
          </button>
        ))}
      </div>
      <p className="sg-hunt-progress">
        🎯 {found.length} / {total}
      </p>
      <p className="sg-message" role="status" aria-live="polite">
        {message}
      </p>
    </div>
  );
}

// ---------- 2) التتبّع: يرسم الطفل بإصبعه فوق الحرف المرسوم (SVG مرشد) ----------
export function TracePad({ trace, color, onDone }) {
  const ref = useRef(null);
  const drawing = useRef(false);
  const [strokes, setStrokes] = useState([]);
  const [current, setCurrent] = useState([]);
  const isArabic = trace.script === 'ar';
  const font = isArabic ? 'Amiri, serif' : 'Cairo, sans-serif';
  const startDot = trace.dot || (isArabic ? { x: 100, y: 34 } : { x: 62, y: 44 });

  const pointFrom = (e) => {
    const rect = ref.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 200;
    const y = ((e.clientY - rect.top) / rect.height) * 200;
    return [Math.round(x), Math.round(y)];
  };

  const down = (e) => {
    if (!ref.current) return;
    drawing.current = true;
    ref.current.setPointerCapture?.(e.pointerId);
    setCurrent([pointFrom(e)]);
  };
  const move = (e) => {
    if (!drawing.current) return;
    setCurrent((pts) => [...pts, pointFrom(e)]);
  };
  const up = () => {
    if (!drawing.current) return;
    drawing.current = false;
    setCurrent((pts) => {
      if (pts.length > 1) setStrokes((all) => [...all, pts]);
      return [];
    });
  };

  const clear = () => {
    setStrokes([]);
    setCurrent([]);
  };

  return (
    <div className="sg-trace">
      <p className="sg-prompt">{trace.hint}</p>
      <svg
        ref={ref}
        className="sg-trace-canvas"
        viewBox="0 0 200 200"
        style={{ '--g': color }}
        onPointerDown={down}
        onPointerMove={move}
        onPointerUp={up}
        onPointerLeave={up}
        role="img"
        aria-label={`تتبّع ${trace.glyph}`}
      >
        <text
          x="100"
          y={isArabic ? 112 : 108}
          textAnchor="middle"
          fontSize={isArabic ? 150 : 132}
          fontFamily={font}
          fill="none"
          stroke="#cbd5e1"
          strokeWidth="3"
          strokeDasharray="7 9"
        >
          {trace.glyph}
        </text>
        {strokes.map((pts, i) => (
          <polyline
            key={i}
            points={pts.map((p) => p.join(',')).join(' ')}
            fill="none"
            stroke={color}
            strokeWidth="9"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        ))}
        {current.length > 1 && (
          <polyline
            points={current.map((p) => p.join(',')).join(' ')}
            fill="none"
            stroke={color}
            strokeWidth="9"
            strokeLinecap="round"
          />
        )}
        <circle cx={startDot.x} cy={startDot.y} r="7" fill={color} opacity="0.85" />
        <text x={startDot.x} y={startDot.y - 14} textAnchor="middle" fontSize="16" fill={color}>
          ابدأ
        </text>
      </svg>
      <div className="sg-trace-actions">
        <button type="button" className="sg-btn sg-btn-soft" onClick={clear}>
          امسح 🧽
        </button>
        <button
          type="button"
          className="sg-btn sg-btn-main"
          style={{ background: color, boxShadow: `0 4px 0 ${color}` }}
          onClick={() => {
            clear();
            onDone?.();
          }}
        >
          رسمتها ✓
        </button>
      </div>
    </div>
  );
}

// ---------- 3) القطار وصناديق الأصوات: رتّب البلاطات ----------
export function OrderGame({ round, variant = 'train', lang = 'ar', color, onDone }) {
  const tiles = round.tiles || [];
  const order = scramble(tiles);
  const [picked, setPicked] = useState([]);
  const [state, setState] = useState('idle'); // idle | right | wrong
  const [message, setMessage] = useState('');
  const slotCount = tiles.length;
  const check = variant === 'boxes' ? boxesCorrect : trainCorrect;

  useEffect(() => {
    if (picked.length !== slotCount) return;
    const ok = check(picked);
    setState(ok ? 'right' : 'wrong');
    if (ok) {
      sfx('correct');
      setMessage('🎉 أحسنت!');
      if (round.result) playStory(null, round.result, lang);
      onDone?.();
    } else {
      sfx('retry');
      setMessage('قريب! جرّب ترتيبًا آخر 🤗');
      const t = setTimeout(() => {
        setPicked([]);
        setState('idle');
      }, 900);
      return () => clearTimeout(t);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [picked]);

  return (
    <div className={`sg-order sg-order-${variant}`}>
      <p className="sg-prompt" lang={round.lang || lang} dir={dirOf(round.lang, lang)}>
        {round.prompt}
      </p>
      <div className="sg-order-slots" aria-label="الترتيب">
        {Array.from({ length: slotCount }, (_, i) => (
          <span key={i} className={picked[i] === undefined ? 'sg-order-slot' : 'sg-order-slot is-full'}>
            {picked[i] === undefined ? '' : tiles[picked[i]]}
          </span>
        ))}
      </div>
      <div className="sg-order-tiles">
        {order.map((tileIndex) => {
          const used = picked.includes(tileIndex);
          return (
            <button
              key={tileIndex}
              type="button"
              className={used ? 'sg-order-tile is-used' : 'sg-order-tile'}
              style={{ '--g': color }}
              disabled={used || state === 'right'}
              onClick={() => {
                sfx('tap');
                say(tiles[tileIndex], lang);
                setPicked((p) => [...p, tileIndex]);
              }}
            >
              {tiles[tileIndex]}
            </button>
          );
        })}
      </div>
      {round.result && state === 'right' && (
        <p className="sg-order-result" lang={lang} dir={dirOf(null, lang)}>
          {round.result}
        </p>
      )}
      <p className="sg-message" role="status" aria-live="polite">
        {message}
      </p>
      <button type="button" className="sg-btn sg-btn-soft" onClick={() => setPicked([])} disabled={!picked.length}>
        من جديد ↩️
      </button>
    </div>
  );
}

// ---------- مشهد القصة: خلفية الحديقة + موضوع (صورة أو إيموجي) ----------
export function StoryScene({ unit, backdrop, subject, color }) {
  const [failed, setFailed] = useState(false);
  const art = subject || unit.art;
  return (
    <div className="sg-scene-composed" style={{ backgroundImage: `url(${assetUrl(backdrop)})` }} aria-hidden="true">
      <div className="sg-scene-veil" />
      {art && !failed ? (
        <img className="sg-scene-subject sg-float" src={assetUrl(art)} alt="" onError={() => setFailed(true)} />
      ) : (
        <span className="sg-scene-emoji">{unit.keyEmoji}</span>
      )}
      <span className="sg-scene-key" style={{ background: color }}>
        {unit.keyWord}
      </span>
    </div>
  );
}
