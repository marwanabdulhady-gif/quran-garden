#!/usr/bin/env node
// يعرض كل فيديوهات القصص (أو مجموعة منها) إلى MP4 عبر HyperFrames.
//
// الاستعمال:
//   npm run videos:render                       # الكل (قد يستغرق ساعات)
//   npm run videos:render -- --garden=english   # حديقة واحدة
//   npm run videos:render -- --only=en-01,ar-01-p
//   npm run videos:render -- --garden=arabic --offset=19 --limit=19  # شريحة (دفعة 2/3)
//   npm run videos:render -- --quality=draft --fps=24
//   npm run videos:render -- --force            # تجاهل الملفات المعروضة سابقًا
//
// المتطلبات: ffmpeg + ffprobe + Chrome. الأوليان تُحلّان تلقائيًا (PATH أو حزم npm)،
// وChrome يحتاج مرة واحدة: npx hyperframes browser ensure
//
// ملاحظة عن الزمن: كل فيديو يُعرض إطارًا إطارًا في Chrome ثم يُرمَّز بـ ffmpeg،
// فالمجموع الكلي (~ساعتان من الفيديو) يستغرق ساعات على جهاز عادي. ابدأ بمجموعة صغيرة.

import { spawn, execFileSync } from 'node:child_process';
import { existsSync, mkdirSync, readFileSync, statSync, writeFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { HYPERFRAMES_VERSION, hyperframesEnv, hyperframesBin, resolveMediaTools } from './env.mjs';

const ROOT = resolve(import.meta.dirname, '../..');
const PROJECT = resolve(ROOT, 'videos');

const args = process.argv.slice(2);
const flag = (name, fallback) => {
  const hit = args.find((a) => a.startsWith(`--${name}=`));
  return hit ? hit.slice(name.length + 3) : fallback;
};
const bool = (name) => args.includes(`--${name}`);

const ONLY = flag('only', '').split(',').map((s) => s.trim()).filter(Boolean);
const GARDEN = flag('garden', '').split(',').map((s) => s.trim()).filter(Boolean);
const QUALITY = flag('quality', 'looks'); // draft | looks | delivery
const FPS = flag('fps', '');
const WORKERS = flag('workers', '');
const LIMIT = Number(flag('limit', '0')) || 0;
const OFFSET = Number(flag('offset', '0')) || 0;
const FORCE = bool('force');
const NO_VERIFY = bool('no-verify');

const MANIFEST_PATH = resolve(PROJECT, 'manifest.json');
if (!existsSync(MANIFEST_PATH)) {
  console.error('✗ لا يوجد videos/manifest.json — نفِّذ أولًا:  npm run videos:build');
  process.exit(1);
}
const manifest = JSON.parse(readFileSync(MANIFEST_PATH, 'utf8'));
const format = manifest.format?.name ?? 'portrait';

let videos = manifest.videos ?? [];
if (GARDEN.length) videos = videos.filter((v) => GARDEN.includes(v.garden));
if (ONLY.length) videos = videos.filter((v) => ONLY.includes(v.id));
if (OFFSET || LIMIT) videos = videos.slice(OFFSET, LIMIT ? OFFSET + LIMIT : undefined);

if (!videos.length) {
  console.error('✗ لا فيديوهات مطابقة للفلاتر.');
  process.exit(1);
}

// ── فحص المتطلبات قبل بدء ساعات من العمل ──────────────────────────────────────

const { ffmpeg, ffprobe, missing } = resolveMediaTools();
if (missing.length) {
  console.error(`✗ ناقص: ${missing.join(', ')}`);
  console.error('  على أوبونتو/دبيان:  sudo apt-get install -y ffmpeg');
  console.error('  أو من npm:          npm i -O @ffmpeg-installer/ffmpeg @ffprobe-installer/ffprobe');
  process.exit(1);
}

const hf = hyperframesBin();
const hfCmd = hf ? [hf] : ['npx', '--yes', `hyperframes@${HYPERFRAMES_VERSION}`];

function run(cmd, cmdArgs, opts = {}) {
  return new Promise((res) => {
    const child = spawn(cmd, cmdArgs, { cwd: opts.cwd ?? PROJECT, env: hyperframesEnv(), stdio: ['ignore', 'pipe', 'pipe'] });
    let out = '';
    let err = '';
    child.stdout.on('data', (d) => (out += d));
    child.stderr.on('data', (d) => (err += d));
    child.on('close', (code) => res({ code, out, err }));
    child.on('error', (e) => res({ code: -1, out, err: err + String(e.message) }));
  });
}

/** مدة ملف وسائط بالثواني عبر ffprobe، أو null. */
function probeDuration(file) {
  try {
    const out = execFileSync(ffprobe, ['-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', file], {
      encoding: 'utf8',
    }).trim();
    const n = Number(out);
    return Number.isFinite(n) ? n : null;
  } catch {
    return null;
  }
}
// فحص Chrome مرة واحدة بدل الفشل ١١٤ مرة
console.log('\n— فحص المتصفح —');
const doctor = await run(hfCmd[0], [...hfCmd.slice(1), 'doctor', '--json']);
let chromeOk = false;
try {
  const j = JSON.parse(doctor.out);
  chromeOk = Boolean((j.checks || []).find((c) => /chrome/i.test(c.name))?.ok);
} catch {
  /* تجاهل: سنكتشف الفشل عند أول عرض */
}
if (!chromeOk) {
  console.error('✗ Chrome Headless Shell غير متوفر، والعرض المحلي يحتاجه.');
  console.error('  ثبِّته مرة واحدة:  npx hyperframes browser ensure');
  console.error('  أو وجِّه الأمر إلى Chrome موجود:  export HYPERFRAMES_BROWSER_PATH=/usr/bin/google-chrome');
  console.error('  أو اعرض في CI (عدّاءات GitHub تنزّل Chrome تلقائيًا):');
  console.error('    • يدويًا: Actions → Videos → Run workflow (يتطلب دمج videos.yml إلى main أولًا)');
  console.error('    • أو بدفع commit يحمل [render-videos] في رسالته إلى فرع arena/*');
  process.exit(1);
}
console.log('✓ المتصفح جاهز · ffmpeg و ffprobe جاهزان\n');

// ── العرض ────────────────────────────────────────────────────────────────────

const outDir = resolve(PROJECT, 'renders', format);
mkdirSync(outDir, { recursive: true });

const results = [];
let done = 0;
const skipped = [];
const t0 = Date.now();

for (const v of videos) {
  const outFile = resolve(PROJECT, v.output);
  if (!FORCE && existsSync(outFile) && statSync(outFile).size > 0) {
    skipped.push(v.id);
    results.push({ id: v.id, status: 'skipped', file: v.output, expected: v.duration });
    continue;
  }
  mkdirSync(dirname(outFile), { recursive: true });

  const renderArgs = ['render', '.', '--composition', v.composition, '--output', outFile, '--quality', QUALITY];
  if (FPS) renderArgs.push('--fps', FPS);
  if (WORKERS) renderArgs.push('--workers', WORKERS);

  done++;
  const label = `[${done}/${videos.length - skipped.length}] ${v.id}`;
  process.stdout.write(`${label} — ${v.duration}s … `);
  const started = Date.now();

  const r = await run(hfCmd[0], [...hfCmd.slice(1), ...renderArgs]);
  const secs = ((Date.now() - started) / 1000).toFixed(1);

  if (r.code !== 0 || !existsSync(outFile) || statSync(outFile).size === 0) {
    console.log(`✗ فشل (${secs}s)`);
    const tail = (r.err || r.out || '').split('\n').filter(Boolean).slice(-6).join('\n    ');
    if (tail) console.log(`    ${tail}`);
    results.push({ id: v.id, status: 'failed', error: (r.err || r.out || '').slice(-800), seconds: Number(secs) });
    continue;
  }

  let verdict = 'ok';
  let actual = null;
  if (!NO_VERIFY) {
    actual = probeDuration(outFile);
    // تفاوت مقبول: إطاران عند كل طرف
    const tol = 2 / (Number(FPS) || 30) + 0.25;
    if (actual == null) verdict = 'unverified';
    else if (Math.abs(actual - v.duration) > tol) verdict = 'duration-mismatch';
  }

  const sizeMb = (statSync(outFile).size / 1048576).toFixed(2);
  console.log(`${verdict === 'ok' ? '✓' : '⚠'} ${secs}s · ${sizeMb} MB${actual != null ? ` · ${actual.toFixed(2)}s` : ''}`);
  results.push({
    id: v.id,
    garden: v.garden,
    status: verdict,
    file: v.output,
    expected: v.duration,
    actual,
    sizeBytes: statSync(outFile).size,
    renderSeconds: Number(secs),
  });
}

// ── التقرير ──────────────────────────────────────────────────────────────────

const reportPath = resolve(outDir, 'render-report.json');
const failed = results.filter((r) => r.status === 'failed');
const mismatched = results.filter((r) => r.status === 'duration-mismatch');
const rendered = results.filter((r) => r.status === 'ok');
const report = {
  generatedAt: new Date().toISOString(),
  format,
  quality: QUALITY,
  fps: FPS || null,
  totals: {
    requested: videos.length,
    rendered: rendered.length,
    skipped: skipped.length,
    failed: failed.length,
    durationMismatch: mismatched.length,
    minutes: Number(((Date.now() - t0) / 60000).toFixed(1)),
    sizeMb: Number((rendered.reduce((a, r) => a + (r.sizeBytes || 0), 0) / 1048576).toFixed(2)),
  },
  results,
};
writeFileSync(reportPath, JSON.stringify(report, null, 2) + '\n', 'utf8');

console.log(`\n— الملخّص —`);
console.log(`  معروض: ${rendered.length} · متخطّى: ${skipped.length} · فشل: ${failed.length} · طول مخالف: ${mismatched.length}`);
console.log(`  الحجم: ${report.totals.sizeMb} MB · الزمن: ${report.totals.minutes} دقيقة`);
console.log(`  التقرير: ${reportPath.replace(ROOT + '/', '')}`);
if (failed.length) console.log(`  الفاشلة: ${failed.map((f) => f.id).join(', ')}`);
console.log();
process.exitCode = failed.length ? 1 : 0;
