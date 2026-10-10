// تشغيل مقاطع المعلّق. إذا تعذّر المقطع (غير موجود أو المتصفح يمنع الصوت) نطق النص بصوت المتصفح.
import { CLIPS } from './clips.js';
import { speak } from './speech.js';

let current = null;

// مسار أصل الملفات يحترم base الخاص بالبناء (يعمل على / وعلى مسار فرعي)
export function assetUrl(path) {
  const base = (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.BASE_URL) || '/';
  return `${base}${path.replace(/^\/+/, '')}`;
}

export function clipUrl(key) {
  const clip = CLIPS[key];
  return clip ? assetUrl(`salman/audio/${clip.file}`) : null;
}

export function playClip(key) {
  const clip = CLIPS[key];
  if (!clip) return false;
  if (typeof Audio === 'undefined') return speak(clip.text);
  try {
    if (current) current.pause();
    current = new Audio(clipUrl(key));
    current.onerror = () => speak(clip.text);
    const p = current.play();
    if (p && typeof p.catch === 'function') p.catch(() => speak(clip.text));
    return true;
  } catch {
    return speak(clip.text);
  }
}
