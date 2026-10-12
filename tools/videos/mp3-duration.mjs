// مدة ملفات MP3 بدون ffprobe.
//
// لماذا هنا: ffprobe غير متوفر في بيئة البناء، وضبط توقيت الفيديو على طول الصوت
// المسجَّل أدقّ من التخمين. نقرأ ترويسة Xing/Info (عدد الإطارات الذي يعتمده ffmpeg)،
// ونحتاط بعدّ الإطارات يدويًا إن غابت الترويسة.
//
// تنبيه معياري: طبقة Layer III في MPEG-2/2.5 تحمل 576 عيّنة في الإطار (وليس 1152)،
// ومعامل حجم الإطار معها 72 وليس 144 — تجاهُل هذا يرفع المدة بنحو 15%.
import { readFileSync } from 'node:fs';

const SAMPLES_PER_FRAME = {
  // [mpegVersion][layerBits] — layerBits: 3 = I, 2 = II, 1 = III
  1: { 3: 384, 2: 1152, 1: 1152 },
  2: { 3: 384, 2: 1152, 1: 576 },
  3: { 3: 384, 2: 1152, 1: 576 },
};

const BITRATE_V1 = { 1: 32, 2: 40, 3: 48, 4: 56, 5: 64, 6: 80, 7: 96, 8: 112, 9: 128, 10: 160, 11: 192, 12: 224, 13: 256, 14: 320 };
const BITRATE_V2 = { 1: 8, 2: 16, 3: 24, 4: 32, 5: 40, 6: 48, 7: 56, 8: 64, 9: 80, 10: 96, 11: 112, 12: 128, 13: 144, 14: 160 };

// مفاتيحها رقم نسخة MPEG (1/2/3) لا بتّات الترويسة (3/2/0) — خلط المفتاحين
// يُرجع 11025 بدل 44100 فيرفع المدة أربعة أضعاف.
const SAMPLE_RATES = {
  1: { 0: 44100, 1: 48000, 2: 32000 }, // MPEG-1
  2: { 0: 22050, 1: 24000, 2: 16000 }, // MPEG-2
  3: { 0: 11025, 1: 12000, 2: 8000 }, // MPEG-2.5
};

function parseFrameHeader(buf, i) {
  if (buf[i] !== 0xff || (buf[i + 1] & 0xe0) !== 0xe0) return null;
  const versionBits = (buf[i + 1] >> 3) & 0x03;
  const layerBits = (buf[i + 1] >> 1) & 0x03;
  const bitrateIdx = (buf[i + 2] >> 4) & 0x0f;
  const srateIdx = (buf[i + 2] >> 2) & 0x03;
  const padding = (buf[i + 2] >> 1) & 0x01;
  if (versionBits === 1 || layerBits === 0 || bitrateIdx === 0 || bitrateIdx === 15 || srateIdx === 3) return null;

  const mpegVersion = versionBits === 3 ? 1 : versionBits === 2 ? 2 : 3;
  const samples = SAMPLES_PER_FRAME[mpegVersion]?.[layerBits];
  const bitrate = (mpegVersion === 1 ? BITRATE_V1 : BITRATE_V2)[bitrateIdx];
  const sampleRate = SAMPLE_RATES[mpegVersion]?.[srateIdx];
  if (!samples || !bitrate || !sampleRate) return null;

  // Layer I يعمل على كلمات من 32 بت؛ الباقي على بايت
  const coefficient = layerBits === 3 ? (mpegVersion === 1 ? 48 : 24) : mpegVersion === 1 ? 144 : 72;
  const slot = layerBits === 3 ? 4 : 1;
  const size = Math.floor((coefficient * 1000 * bitrate) / sampleRate) + padding * slot;
  if (size <= 0) return null;
  return { size, samples, sampleRate };
}

/** يتخطى ID3v2 ويعيد إزاحة أول إطار صوتي. */
function firstFrameOffset(buf) {
  let start = 0;
  if (buf.length > 10 && buf.toString('latin1', 0, 3) === 'ID3') {
    const size = ((buf[6] & 0x7f) << 21) | ((buf[7] & 0x7f) << 14) | ((buf[8] & 0x7f) << 7) | (buf[9] & 0x7f);
    start = 10 + size;
  }
  const end = Math.min(buf.length - 4, start + 65536);
  for (let i = start; i < end; i++) {
    if (parseFrameHeader(buf, i)) return i;
  }
  return -1;
}

/**
 * عدد الإطارات من ترويسة Xing/Info إن وُجدت (وهي ما يعتمده ffmpeg).
 * موضع الترويسة يختلف بحجم المعلومات الجانبية (النسخة، الطبقة، وضع القنوات)،
 * فبدل جدول هشّ نبحث عن العلامة في أول الإطار — وهي لا تظهر مصادفةً في بيانات صوتية صالحة.
 */
function xingFrameCount(buf, offset) {
  const end = Math.min(buf.length - 12, offset + 4 + 64);
  for (let at = offset + 4; at <= end; at++) {
    const tag = buf.toString('latin1', at, at + 4);
    if (tag !== 'Xing' && tag !== 'Info') continue;
    const flags = buf.readUInt32BE(at + 4);
    if (!(flags & 1)) return null;
    const frames = buf.readUInt32BE(at + 8);
    return Number.isFinite(frames) && frames > 0 ? frames : null;
  }
  return null;
}

/** يعيد المدة بالثواني، أو null إذا تعذّر القراءة. */
export function mp3DurationSeconds(file) {
  let buf;
  try {
    buf = readFileSync(file);
  } catch {
    return null;
  }
  const offset = firstFrameOffset(buf);
  if (offset < 0) return null;
  const head = parseFrameHeader(buf, offset);
  if (!head) return null;

  const declared = xingFrameCount(buf, offset);
  if (declared) return Math.round(((declared * head.samples) / head.sampleRate) * 100) / 100;

  // لا ترويسة: نعدّ الإطارات، ونحتاط بتقدير الحجم عند أول إطار تالف
  let pos = offset;
  let frames = 0;
  while (pos + 4 <= buf.length && frames < 2_000_000) {
    const f = parseFrameHeader(buf, pos);
    if (!f) break;
    pos += f.size;
    frames++;
  }
  if (frames > 16) return Math.round(((frames * head.samples) / head.sampleRate) * 100) / 100;

  const approx = (buf.length - offset) / ((head.size / head.samples) * head.sampleRate);
  return Number.isFinite(approx) && approx > 0 ? Math.round(approx * 100) / 100 : null;
}
