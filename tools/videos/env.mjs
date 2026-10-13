// يحضّر بيئة HyperFrames: يجد ffmpeg/ffprobe ويضبط متغيرات المسار.
//
// لماذا: HyperFrames يحتاج ffmpeg و ffprobe و Chrome. الأولى نجدها على PATH
// أو في حزم npm الاختيارية (@ffmpeg-installer / @ffprobe-installer تشحن الثنائي
// داخل الحزمة نفسها، فلا تحتاج تنزيلاً وقت التثبيت). Chrome وحده يحتاج
// `npx hyperframes browser ensure` لأنه يُنزَّل من CDN خارجي.

import { existsSync } from 'node:fs';
import { createRequire } from 'node:module';
import { resolve } from 'node:path';
import { execFileSync } from 'node:child_process';

const ROOT = resolve(import.meta.dirname, '../..');
const require_ = createRequire(import.meta.url);

export const HYPERFRAMES_VERSION = '0.8.149';

/** يبحث عن ثنائي على PATH. يعيد المسار أو null. */
function onPath(bin) {
  try {
    const out = execFileSync(process.platform === 'win32' ? 'where' : 'which', [bin], {
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'ignore'],
    }).trim();
    const first = out.split(/\r?\n/)[0];
    return first && existsSync(first) ? first : null;
  } catch {
    return null;
  }
}

/** يحاول قراءة مسار الثنائي من حزمة npm اختيارية. */
function fromPackage(pkg) {
  try {
    const mod = require_(pkg);
    const p = typeof mod === 'string' ? mod : mod?.path;
    return p && existsSync(p) ? p : null;
  } catch {
    return null;
  }
}

/**
 * يعيد { ffmpeg, ffprobe, missing } — أيهما وجدناه وأين.
 * لا يرمي خطأً؛ القرار للمتصل حتى تبقى رسالة النقص واضحة.
 */
export function resolveMediaTools() {
  const ffmpeg = process.env.HYPERFRAMES_FFMPEG_PATH || onPath('ffmpeg') || fromPackage('@ffmpeg-installer/ffmpeg');
  const ffprobe = process.env.HYPERFRAMES_FFPROBE_PATH || onPath('ffprobe') || fromPackage('@ffprobe-installer/ffprobe');
  const missing = [];
  if (!ffmpeg) missing.push('ffmpeg');
  if (!ffprobe) missing.push('ffprobe');
  return { ffmpeg, ffprobe, missing };
}

/** متغيرات البيئة لتشغيل أوامر HyperFrames (بدون تحديثات/قياس عن بُعد). */
export function hyperframesEnv() {
  const { ffmpeg, ffprobe } = resolveMediaTools();
  return {
    ...process.env,
    HYPERFRAMES_NO_TELEMETRY: '1',
    HYPERFRAMES_NO_UPDATE_CHECK: '1',
    ...(ffmpeg ? { HYPERFRAMES_FFMPEG_PATH: ffmpeg } : {}),
    ...(ffprobe ? { HYPERFRAMES_FFPROBE_PATH: ffprobe } : {}),
  };
}

/** أمر npx المثبَّت محليًا إن وُجد، وإلا npx العادي. */
export function hyperframesBin() {
  const local = resolve(ROOT, 'node_modules/.bin', process.platform === 'win32' ? 'hyperframes.cmd' : 'hyperframes');
  return existsSync(local) ? local : null;
}

export { ROOT, resolve };
