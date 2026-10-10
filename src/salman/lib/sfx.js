// مؤثرات صوتية مُولَّدة بالكود (Web Audio) — لا تحتاج ملفات. تصمت بهدوء إن لم تتوفر.
let ctx = null;

function getContext() {
  if (typeof window === 'undefined') return null;
  const AC = window.AudioContext || window.webkitAudioContext;
  if (!AC) return null;
  if (!ctx) ctx = new AC();
  return ctx;
}

// [تردد بالهرتز، زمن البداية بالثانية، المدة، نوع الموجة]
const PATTERNS = {
  tap: [[660, 0, 0.06, 'sine']],
  correct: [
    [523, 0, 0.12, 'triangle'],
    [659, 0.1, 0.12, 'triangle'],
    [784, 0.2, 0.22, 'triangle'],
  ],
  retry: [
    [330, 0, 0.18, 'sine'],
    [294, 0.15, 0.22, 'sine'],
  ],
  levelUp: [
    [523, 0, 0.12, 'triangle'],
    [659, 0.12, 0.12, 'triangle'],
    [784, 0.24, 0.12, 'triangle'],
    [1047, 0.36, 0.32, 'triangle'],
  ],
  gift: [
    [988, 0, 0.1, 'sine'],
    [1319, 0.08, 0.1, 'sine'],
    [1760, 0.16, 0.26, 'sine'],
  ],
};

export function sfx(name) {
  const c = getContext();
  const pattern = PATTERNS[name];
  if (!c || !pattern) return false;
  if (c.state === 'suspended' && c.resume) c.resume();
  const t0 = c.currentTime;
  for (const [freq, start, dur, type] of pattern) {
    const osc = c.createOscillator();
    const gain = c.createGain();
    osc.type = type;
    osc.frequency.value = freq;
    gain.gain.setValueAtTime(0.0001, t0 + start);
    gain.gain.exponentialRampToValueAtTime(0.18, t0 + start + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.0001, t0 + start + dur);
    osc.connect(gain);
    gain.connect(c.destination);
    osc.start(t0 + start);
    osc.stop(t0 + start + dur + 0.02);
  }
  return true;
}

export const SFX_NAMES = Object.keys(PATTERNS);
