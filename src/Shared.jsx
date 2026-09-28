import React, { useEffect, useRef, useState } from 'react';
import { sfx } from './sound.js';
// أدوات النص القرآني (معرّفة في text.js — ملف نقي قابل للاختبار)
import { cleanAyah, stripTashkeel, readAyah, matchForm, splitWord, starLabel } from './text.js';
export { cleanAyah, stripTashkeel, readAyah, matchForm, splitWord, starLabel };

export function Modal({ title, onClose, children, wide }) {
  useEffect(() => {
    const onKey = (e) => e.key === 'Escape' && onClose && onClose();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);
  return (
    <div className="overlay" onMouseDown={(e) => e.target === e.currentTarget && onClose && onClose()}>
      <div className="modal" style={wide ? { maxWidth: 620 } : undefined}>
        {onClose && (
          <button className="close-x" onClick={onClose} aria-label="إغلاق">
            ✕
          </button>
        )}
        {title && <h2>{title}</h2>}
        {children}
      </div>
    </div>
  );
}

const COLORS = ['#10b981', '#f59e0b', '#3b82f6', '#ef4444', '#a855f7', '#f97316', '#06b6d4', '#facc15'];

// كونفيتي بلوح ألوان الرحلة (أو اللوحة الافتراضية)
export function Confetti({ show, colors = COLORS }) {
  const [pieces, setPieces] = useState([]);
  useEffect(() => {
    if (!show) return;
    const p = Array.from({ length: 90 }, (_, i) => ({
      id: i,
      left: Math.random() * 100,
      delay: Math.random() * 0.7,
      dur: 2.2 + Math.random() * 1.6,
      color: colors[i % colors.length],
      rot: Math.random() * 360,
      w: 7 + Math.random() * 8,
    }));
    setPieces(p);
    const t = setTimeout(() => setPieces([]), 4200);
    return () => clearTimeout(t);
  }, [show]);
  if (!pieces.length) return null;
  return (
    <div className="confetti-box">
      {pieces.map((p) => (
        <i
          key={p.id}
          className="confetti"
          style={{
            left: p.left + '%',
            background: p.color,
            animationDelay: p.delay + 's',
            animationDuration: p.dur + 's',
            width: p.w,
            transform: `rotate(${p.rot}deg)`,
          }}
        />
      ))}
    </div>
  );
}

export function Avatar({ child, className, style }) {
  const src = child?.avatar || '/assets/hero-standing-t.png';
  return (
    <div className={className} style={style}>
      <img src={src} alt={child?.name || 'بطل'} />
    </div>
  );
}

// مشغل صوت لآية واحدة
export function useAudio() {
  const ref = useRef(null);
  const [playing, setPlaying] = useState(false);
  const [error, setError] = useState(false);

  const play = (url) => {
    setError(false);
    if (!ref.current) {
      ref.current = new Audio();
      ref.current.addEventListener('ended', () => setPlaying(false));
      ref.current.addEventListener('error', () => {
        setPlaying(false);
        setError(true);
      });
    }
    if (playing) {
      ref.current.pause();
      setPlaying(false);
      return;
    }
    ref.current.src = url;
    ref.current
      .play()
      .then(() => setPlaying(true))
      .catch(() => {
        setPlaying(false);
        setError(true);
      });
  };

  const stop = () => {
    if (ref.current) ref.current.pause();
    setPlaying(false);
  };

  return { play, stop, playing, error, audioRef: ref };
}

// تسجيل صوتي (تلاوة الطفل)
export function useRecorder() {
  const [state, setState] = useState('idle'); // idle | recording | done
  const [url, setUrl] = useState(null);
  const recRef = useRef(null);
  const chunksRef = useRef([]);
  const [err, setErr] = useState(null);

  const toggle = async () => {
    setErr(null);
    if (state === 'recording') {
      recRef.current?.stop();
      return;
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mime = MediaRecorder.isTypeSupported('audio/webm') ? 'audio/webm' : '';
      const rec = new MediaRecorder(stream, mime ? { mimeType: mime } : undefined);
      chunksRef.current = [];
      rec.ondataavailable = (e) => chunksRef.current.push(e.data);
      rec.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: mime || 'audio/webm' });
        setUrl(URL.createObjectURL(blob));
        setState('done');
        stream.getTracks().forEach((t) => t.stop());
      };
      rec.start();
      recRef.current = rec;
      setState('recording');
    } catch (e) {
      setErr('تعذّر فتح الميكروفون. راجع إذن التسجيل في المتصفح.');
    }
  };

  const reset = () => {
    setState('idle');
    setUrl(null);
  };

  return { state, url, err, toggle, reset };
}

export function RecorderRow() {
  const rec = useRecorder();
  const [playingBack, setPlayingBack] = useState(false);
  const audioRef = useRef(null);

  const playBack = () => {
    if (!audioRef.current) {
      audioRef.current = new Audio();
      audioRef.current.onended = () => setPlayingBack(false);
    }
    if (playingBack) {
      audioRef.current.pause();
      setPlayingBack(false);
      return;
    }
    audioRef.current.src = rec.url;
    audioRef.current
      .play()
      .then(() => setPlayingBack(true))
      .catch(() => {});
  };

  return (
    <div className="record-row">
      <button className={'rec-btn' + (rec.state === 'recording' ? ' rec' : '')} onClick={rec.toggle}>
        {rec.state === 'recording' ? '⏹ إيقاف التسجيل' : '🎤 سجّل تلاوتك'}
      </button>
      {rec.state === 'done' && (
        <>
          <button className="rec-btn" onClick={playBack}>
            {playingBack ? '⏸' : '▶️ '}استمع لتسجيلك
          </button>
          <button className="rec-btn" onClick={rec.reset} style={{ opacity: 0.7 }}>
            🗑
          </button>
        </>
      )}
      {rec.err && (
        <div className="err-box" style={{ width: '100%' }}>
          {rec.err}
        </div>
      )}
    </div>
  );
}

export function Star({ n }) {
  return (
    <span className="chip star-count">
      ⭐ {n} {starLabel(n)}
    </span>
  );
}

export function Loading() {
  return (
    <div className="loading-row">
      <div className="spinner" />
      جارٍ التحميل…
    </div>
  );
}

// شعار التطبيق: شجرة + اسم بخط العرض
export function Logo({ sub }) {
  return (
    <div className="logo">
      <span className="logo-tree" aria-hidden>
        🌳
      </span>
      <span className="logo-text">
        <span className="logo-name">حديقة القرآن</span>
        {sub && <span className="logo-sub">{sub}</span>}
      </span>
    </div>
  );
}

// حالة فارغة ودّية: أيقونة في دائرة ناعمة + سطر واحد + زر يوصّل
export function EmptyState({ icon, title, sub, actionLabel, onAction }) {
  return (
    <div className="empty-state">
      <div className="empty-icon" aria-hidden>
        {icon}
      </div>
      <div className="empty-title">{title}</div>
      {sub && <div className="empty-sub">{sub}</div>}
      {actionLabel && onAction && (
        <button className="btn small" onClick={onAction}>
          {actionLabel}
        </button>
      )}
    </div>
  );
}

// نجمة "تطير" من مكان الكسب إلى عداد النجوم في الشريط العلوي
export function flyStar(fromEl) {
  try {
    const target = document.querySelector('.star-count');
    if (!fromEl || !target || typeof fromEl.animate !== 'function') return;
    const a = fromEl.getBoundingClientRect();
    const b = target.getBoundingClientRect();
    const star = document.createElement('span');
    star.className = 'fly-star';
    star.textContent = '⭐';
    document.body.appendChild(star);
    const dx = b.left + b.width / 2 - (a.left + a.width / 2);
    const dy = b.top + b.height / 2 - (a.top + a.height / 2);
    star.animate(
      [
        { transform: `translate(${a.left + a.width / 2}px, ${a.top + a.height / 2}px) scale(1)`, opacity: 1 },
        {
          transform: `translate(${a.left + a.width / 2 + dx * 0.5}px, ${a.top + a.height / 2 + dy * 0.5 - 60}px) scale(1.4)`,
          opacity: 1,
          offset: 0.6,
        },
        { transform: `translate(${b.left + b.width / 2}px, ${b.top + b.height / 2}px) scale(0.4)`, opacity: 0.9 },
      ],
      { duration: 700, easing: 'cubic-bezier(0.3, 0.7, 0.4, 1)' }
    ).onfinish = () => {
      star.remove();
      target.classList.add('star-pop');
      setTimeout(() => target.classList.remove('star-pop'), 400);
    };
  } catch (e) {
    /* الحركة اختيارية */
  }
}

export function ErrorBox({ msg, onRetry }) {
  return (
    <div className="err-box">
      {msg}
      {onRetry && (
        <div className="step-actions">
          <button className="btn small" onClick={onRetry}>
            🔄 حاول مرة أخرى
          </button>
        </div>
      )}
    </div>
  );
}

export function tap() {
  sfx.tap();
}

export function downloadJson(filename, obj) {
  const blob = new Blob([JSON.stringify(obj, null, 2)], { type: 'application/json' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = filename;
  a.click();
  setTimeout(() => URL.revokeObjectURL(a.href), 4000);
}
