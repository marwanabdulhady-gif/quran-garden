// مشغّل مقاطع التعليق الصوتي المولّدة (public/huroof/audio/*.mp3).
// لو المقطع ما اشتغلش (متصفح بيمنع التشغيل التلقائي، أو الملف مفقود) بيرجع للنطق بالمتصفح بنفس النص.
import { speak } from './speech.js';

const cache = new Map();

export const CLIPS = {
  intro: 'أهلًا بيك في مغامرة الحروف! اسحب الحرف إلى الحيوان اللي بيبدأ بيه.',
  correct1: 'أحسنت! الحرف في مكانه الصحيح.',
  correct2: 'برافو عليك! استمر هكذا.',
  retry: 'لا بأس، جرّب حيوانًا آخر.',
  hint: 'انظر إلى الحيوان الذي يضيء، فهو يبدأ بهذا الحرف.',
  levelComplete: 'مبروك! أكملت المستوى وكسبت نجومًا جديدة.',
  champion: 'أنت بطل الحروف!',
  select: 'اخترتَ الحرف. الآن اسحبه أو اضغط على الحيوان الذي يبدأ به.',
};

const FILE_BY_CLIP = {
  intro: 'intro',
  correct1: 'correct-1',
  correct2: 'correct-2',
  retry: 'retry',
  hint: 'hint',
  levelComplete: 'level-complete',
  champion: 'champion',
  select: 'select',
};

export function clipUrl(clip) {
  return `${import.meta.env.BASE_URL}huroof/audio/${FILE_BY_CLIP[clip]}.mp3`;
}

export function playClip(clip) {
  if (!FILE_BY_CLIP[clip]) return false;
  try {
    let audio = cache.get(clip);
    if (!audio) {
      audio = new Audio(clipUrl(clip));
      audio.preload = 'auto';
      cache.set(clip, audio);
    }
    audio.currentTime = 0;
    const p = audio.play();
    if (p && typeof p.catch === 'function') {
      p.catch(() => speak(CLIPS[clip], { rate: 0.95 }));
    }
    return true;
  } catch {
    return speak(CLIPS[clip], { rate: 0.95 });
  }
}
