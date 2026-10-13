#!/usr/bin/env node
// بوابة التحقّق: تشغّل lint على مشروع الفيديوهات وتفحص اتساق المولَّدات.
//
// لماذا بوابة ثابتة: lint يفحص عقد HyperFrames (ids، clips، GSAP، الوسائط، dir)،
// لكنه لا يعرف نيّتنا. هنا نتحقق أيضًا أن كل تركيب يطابق البيان، وأن أصوله موجودة،
// وأن المشهد الأخير لا يتجاوز مدة الجذر، وأن التوقيتات متزايدة بلا فجوات.
//
// الاستعمال:
//   npm run videos:check
//   npm run videos:check -- --strict   # يعتبر التحذيرات أخطاءً

import { spawnSync } from 'node:child_process';
import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { resolve, join } from 'node:path';
import { HYPERFRAMES_VERSION, hyperframesEnv, hyperframesBin } from './env.mjs';

const ROOT = resolve(import.meta.dirname, '../..');
const PROJECT = resolve(ROOT, 'videos');
const STRICT = process.argv.includes('--strict');

const problems = [];
const notes = [];
const fail = (file, msg) => problems.push({ file, msg });

// ── 1) lint من HyperFrames ───────────────────────────────────────────────────

const hf = hyperframesBin();
const hfCmd = hf ? [hf] : ['npx', '--yes', `hyperframes@${HYPERFRAMES_VERSION}`];
const lintArgs = [...hfCmd.slice(1), 'lint', '--json'];
if (STRICT) lintArgs.push('--strict');

console.log('— lint —');
const lint = spawnSync(hfCmd[0], lintArgs, { cwd: PROJECT, env: hyperframesEnv(), encoding: 'utf8', maxBuffer: 64 * 1024 * 1024 });
let lintOk = false;
try {
  const j = JSON.parse(lint.stdout || '{}');
  lintOk = Boolean(j.ok);
  console.log(`  ملفات مفحوصة: ${j.filesScanned} · أخطاء: ${j.errorCount} · تحذيرات: ${j.warningCount}`);
  for (const f of j.findings || []) {
    const where = f.file ? f.file.replace(ROOT + '/', '') : 'project';
    const line = `${f.severity === 'error' ? '✗' : '⚠'} ${where}${f.line ? ':' + f.line : ''} ${f.code}`;
    console.log(`  ${line}`);
    if (f.severity === 'error' || STRICT) fail(where, `${f.code}: ${f.message}`);
    else notes.push(line);
  }
} catch {
  console.log((lint.stderr || lint.stdout || '').slice(-2000));
  fail('videos/', 'lint لم يُخرج JSON صالحًا');
}
if (lint.status !== 0 && lintOk) {
  // lint قد يخرج بـ 1 بسبب تحذيرات في وضع --strict فقط
  notes.push('lint خرج برمز غير صفري رغم ok=true');
}

// ── 2) اتساق البيان مع الملفات ───────────────────────────────────────────────

console.log('\n— اتساق المولَّدات —');
const manifestPath = join(PROJECT, 'manifest.json');
if (!existsSync(manifestPath)) {
  fail('videos/manifest.json', 'مفقود — نفِّذ npm run videos:build');
} else {
  const manifest = JSON.parse(readFileSync(manifestPath, 'utf8'));
  const videos = manifest.videos ?? [];
  console.log(`  البيان: ${videos.length} فيديو · الصيغة: ${manifest.format?.name} ${manifest.format?.width}×${manifest.format?.height}`);

  const attr = (html, name) => {
    const m = html.match(new RegExp(`data-${name}="([^"]+)"`));
    return m ? m[1] : null;
  };
  // src="…" و url("…") — والأخيرة قد يتبعها format("woff2")، فلا نشترط القوس بعدها
  const srcs = (html) => [
    ...html.matchAll(/\ssrc="([^"]+)"/g),
    ...html.matchAll(/url\(\s*"([^"]+)"\s*\)/g),
  ].map((m) => m[1]);

  let checked = 0;
  for (const v of videos) {
    const file = join(PROJECT, v.composition);
    const rel = v.composition;
    if (!existsSync(file)) {
      fail(rel, 'التركيب غير موجود');
      continue;
    }
    const html = readFileSync(file, 'utf8');

    // مدة الجذر تطابق البيان
    const rootDur = Number(attr(html, 'duration'));
    if (!Number.isFinite(rootDur) || Math.abs(rootDur - v.duration) > 0.011) {
      fail(rel, `مدة الجذر ${rootDur} ≠ البيان ${v.duration}`);
    }

    // معرّف التركيب يطابق اسم القصة (يعتمد عليه window.__timelines)
    const cid = attr(html, 'composition-id');
    if (cid !== v.id) fail(rel, `data-composition-id="${cid}" ≠ "${v.id}"`);
    if (!html.includes(`window.__timelines["${v.id}"]`)) fail(rel, 'الخط الزمني غير مسجَّل على window.__timelines');
    if (!html.includes('gsap.timeline({ paused: true })')) fail(rel, 'الخط الزمني ليس متوقفًا (paused)');

    // dir على <html> يكسر العرض صامتًا — نفحصه هنا أيضًا لا اعتمادًا على lint وحده
    if (/<html[^>]*\sdir=/i.test(html)) fail(rel, '<html dir=…> يكسر العرض (ينتج فيديو فارغًا)');

    // كل عنصر مُوقَّت له id و class="clip" — عدا جذر التركيب نفسه
    for (const m of html.matchAll(/<(\w+)([^>]*data-start="[^"]+"[^>]*)>/g)) {
      const [, tag, attrs] = m;
      if (tag === 'audio' || tag === 'video') continue;
      if (/data-composition-id=/.test(attrs)) continue; // الجذر: حاوية التركيب لا مشهد فيه
      const id = (attrs.match(/\sid="([^"]+)"/) || [])[1];
      if (!id) fail(rel, `<${tag}> مُوقَّت بلا id`);
      else if (!/class="[^"]*\bclip\b/.test(attrs)) fail(rel, `<${tag} id="${id}"> بلا class="clip"`);
    }

    // الأصول موجودة نسبيًا لمجلد التركيب
    for (const s of srcs(html)) {
      if (/^https?:|^data:|^#/.test(s)) {
        if (/^https?:/.test(s)) fail(rel, `مرجع خارجي ${s} — العرض يعمل بلا شبكة`);
        continue;
      }
      const abs = resolve(join(PROJECT, v.composition, '..'), s);
      if (!existsSync(abs)) fail(rel, `أصل مفقود: ${s}`);
    }

    // التوقيتات: لا مشهد يبدأ بعد نهاية الجذر، ولا مشهد بمدّة صفرية
    const starts = [...html.matchAll(/data-start="([\d.]+)"\s+data-duration="([\d.]+)"/g)].map((m) => [Number(m[1]), Number(m[2])]);
    for (const [st, du] of starts) {
      if (du <= 0) fail(rel, `عنصر بمدّة ${du}`);
      if (st + du > rootDur + 0.02) fail(rel, `عنصر ينتهي ${st + du} بعد مدة الجذر ${rootDur}`);
    }
    if (!starts.length) fail(rel, 'لا عناصر مُوقَّتة');

    // السرد: إن أعلن البيان صوتًا فالتركيب يحمله، والعكس
    const hasAudioEl = /<audio\s/.test(html);
    if (Boolean(v.hasAudio) !== hasAudioEl) {
      fail(rel, v.hasAudio ? 'البيان يعلن سردًا ولا <audio> في التركيب' : '<audio> في التركيب والبيان لا يعلن سردًا');
    }
    if (hasAudioEl && v.narrationSeconds) {
      const aStart = Number((html.match(/<audio[^>]*data-start="([\d.]+)"/) || [])[1]);
      const aDur = Number((html.match(/<audio[^>]*data-duration="([\d.]+)"/) || [])[1]);
      if (Math.abs(aDur - v.narrationSeconds) > 0.02) fail(rel, `مدة السرد ${aDur} ≠ طول الملف ${v.narrationSeconds}`);
      if (aStart + aDur > rootDur + 0.02) fail(rel, `السرد ينتهي ${aStart + aDur} بعد مدة الجذر ${rootDur}`);
    }

    checked++;
  }
  console.log(`  تركيبات مفحوصة: ${checked}/${videos.length}`);

  // لا قصص في المجلد خارج البيان (بقايا توليد سابق)
  const declared = new Set(videos.map((v) => `${v.id}.html`));
  const onDisk = existsSync(join(PROJECT, 'compositions'))
    ? readdirSync(join(PROJECT, 'compositions')).filter((f) => f.endsWith('.html'))
    : [];
  const stray = onDisk.filter((f) => !declared.has(f));
  if (stray.length) fail('videos/compositions/', `ملفات خارج البيان: ${stray.slice(0, 5).join(', ')}${stray.length > 5 ? ' …' : ''}`);
}

// ── النتيجة ──────────────────────────────────────────────────────────────────

console.log('');
if (problems.length) {
  console.log(`✗ ${problems.length} مشكلة:`);
  // نجمع المشاكل المتطابقة الرسالة حتى لا يطغى تكرارها على الأنواع الأخرى
  const groups = new Map();
  for (const p of problems) {
    const g = groups.get(p.msg) || { files: [] };
    g.files.push(p.file);
    groups.set(p.msg, g);
  }
  const sorted = [...groups.entries()].sort((a, b) => b[1].files.length - a[1].files.length);
  for (const [msg, g] of sorted) {
    const shown = g.files.slice(0, 4).join(', ');
    const more = g.files.length > 4 ? ` +${g.files.length - 4} غيرهما` : '';
    console.log(`  · (${g.files.length}) ${msg}`);
    console.log(`      ${shown}${more}`);
  }
  console.log('');
  process.exit(1);
}
console.log(`✓ كل الفحوص نظيفة${notes.length ? ` (${notes.length} ملاحظة غير حاجبة)` : ''}\n`);
