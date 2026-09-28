// أصوات واجهة خفيفة عبر WebAudio
let ctx = null;
let muted = false;

export function setMuted(m) {
  muted = m;
}

function ac() {
  if (!ctx) {
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return null;
    ctx = new AC();
  }
  if (ctx.state === 'suspended') ctx.resume();
  return ctx;
}

// اهتزاز خفيف (موبايل) — محكوم بإعداد الصوت نفسه
function buzz(pattern) {
  if (muted) return;
  try {
    if (typeof navigator !== 'undefined' && typeof navigator.vibrate === 'function') navigator.vibrate(pattern);
  } catch (e) {
    /* غير مدعوم */
  }
}

function tone(freq, start, dur, type = 'sine', gain = 0.12) {
  const c = ac();
  if (!c) return;
  const o = c.createOscillator();
  const g = c.createGain();
  o.type = type;
  o.frequency.value = freq;
  g.gain.setValueAtTime(0, c.currentTime + start);
  g.gain.linearRampToValueAtTime(gain, c.currentTime + start + 0.02);
  g.gain.exponentialRampToValueAtTime(0.0001, c.currentTime + start + dur);
  o.connect(g).connect(c.destination);
  o.start(c.currentTime + start);
  o.stop(c.currentTime + start + dur + 0.05);
}

export const sfx = {
  tap() {
    if (muted) return;
    tone(520, 0, 0.08, 'triangle', 0.08);
  },
  ok() {
    if (muted) return;
    buzz(30);
    tone(523.25, 0, 0.12);
    tone(659.25, 0.1, 0.12);
    tone(783.99, 0.2, 0.2);
  },
  wrong() {
    if (muted) return;
    buzz([80, 40, 80]);
    tone(196, 0, 0.18, 'sawtooth', 0.05);
    tone(155, 0.12, 0.22, 'sawtooth', 0.05);
  },
  gift() {
    if (muted) return;
    [659.25, 783.99, 987.77, 1318.5].forEach((f, i) => tone(f, i * 0.09, 0.18, 'triangle', 0.1));
  },
  swing() {
    if (muted) return;
    tone(392, 0, 0.3, 'sine', 0.06);
    tone(494, 0.15, 0.35, 'sine', 0.05);
  },
  water() {
    if (muted) return;
    tone(880, 0, 0.06, 'sine', 0.05);
    tone(660, 0.08, 0.06, 'sine', 0.05);
    tone(988, 0.16, 0.08, 'sine', 0.05);
  },
  slide() {
    if (muted) return;
    const c = ac();
    if (!c) return;
    const o = c.createOscillator();
    const g = c.createGain();
    o.type = 'sine';
    o.frequency.setValueAtTime(1200, c.currentTime);
    o.frequency.exponentialRampToValueAtTime(300, c.currentTime + 0.5);
    g.gain.setValueAtTime(0.08, c.currentTime);
    g.gain.exponentialRampToValueAtTime(0.0001, c.currentTime + 0.55);
    o.connect(g).connect(c.destination);
    o.start();
    o.stop(c.currentTime + 0.6);
  },
};
