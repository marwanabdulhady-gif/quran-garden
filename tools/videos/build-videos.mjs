#!/usr/bin/env node
// يولّد مشروع HyperFrames كاملًا: فيديو واحد لكل قصة في «حدائق سلمان».
//
// لماذا مولِّد وليس ١١٤ ملف HTML مكتوبًا يدويًا؟
//   القصص تتحدّث في src/salman/data، والفيديو مشتقّ منها. إعادة التوليد بعد أي
//   تحديث نصّي تعطي فيديو متزامنًا دون لمس HTML.
//
// الاستعمال:
//   node tools/videos/build-videos.mjs                 # كل القصص
//   node tools/videos/build-videos.mjs --garden=english,math
//   node tools/videos/build-videos.mjs --only=en-01,ar-01-p
//   node tools/videos/build-videos.mjs --format=landscape
//   node tools/videos/build-videos.mjs --dry-run       # يطبع الملخّص دون كتابة

import { mkdirSync, rmSync, copyFileSync, writeFileSync, existsSync, readdirSync } from 'node:fs';
import { resolve, dirname, relative, join } from 'node:path';
import { collectStories, chunkText, GARDENS } from './story-manifest.mjs';
import { mp3DurationSeconds } from './mp3-duration.mjs';

const ROOT = resolve(import.meta.dirname, '../..');
const OUT = resolve(ROOT, 'videos');
const PUBLIC = resolve(ROOT, 'public');
const HYPERFRAMES_VERSION = '0.8.149';

// ── الوسائط ──────────────────────────────────────────────────────────────────

const args = process.argv.slice(2);
const flag = (name, fallback) => {
  const hit = args.find((a) => a.startsWith(`--${name}=`));
  return hit ? hit.slice(name.length + 3) : fallback;
};
const has = (name) => args.includes(`--${name}`);

const ONLY = flag('only', '').split(',').map((s) => s.trim()).filter(Boolean);
const GARDEN_FILTER = flag('garden', '').split(',').map((s) => s.trim()).filter(Boolean);
const FORMAT = flag('format', 'portrait');
const CPS = Number(flag('cps', '0')) || null; // حرف/ثانية للقراءة
const DRY = has('dry-run');

// سرعات القراءة: العربية المشكولة تُقرأ أبطأ، والنص القرآني أبطأ ما يكون
const CHARS_PER_SECOND = { ar: 15, en: 16, quran: 11 };

// ── مقاسات الإطار ────────────────────────────────────────────────────────────
// الرسم الفني 800×450 دائمًا، فالمقاسات ثابتة ومحسوبة يدويًا لكل صيغة.

const FORMATS = {
  portrait: {
    name: 'portrait',
    w: 1080,
    h: 1920,
    art: { top: 352, left: 60, w: 960, h: 540 },
    titleBlock: { top: 960 },
    panel: { top: 960, left: 72, w: 936 },
    chipTop: 244,
    kicker: { top: 96, right: 60 },
    badge: { top: 96, left: 60 },
    progress: { top: 1896, h: 24 },
    sizes: { kicker: 30, badge: 40, title: 66, body: 46, qPrompt: 46, answer: 62, outroBig: 84, outroSmall: 34, letter: 200 },
  },
  landscape: {
    name: 'landscape',
    w: 1920,
    h: 1080,
    art: { top: 196, left: 480, w: 960, h: 540 },
    titleBlock: { top: 792 },
    panel: { top: 196, left: 96, w: 340 },
    chipTop: 150,
    kicker: { top: 56, right: 72 },
    badge: { top: 56, left: 72 },
    progress: { top: 1056, h: 24 },
    sizes: { kicker: 26, badge: 32, title: 54, body: 34, qPrompt: 36, answer: 48, outroBig: 68, outroSmall: 28, letter: 150 },
  },
  square: {
    name: 'square',
    w: 1080,
    h: 1080,
    art: { top: 176, left: 90, w: 900, h: 506 },
    titleBlock: { top: 736 },
    panel: { top: 720, left: 72, w: 936 },
    chipTop: 120,
    kicker: { top: 44, right: 56 },
    badge: { top: 44, left: 56 },
    progress: { top: 1056, h: 24 },
    sizes: { kicker: 26, badge: 32, title: 52, body: 38, qPrompt: 38, answer: 50, outroBig: 68, outroSmall: 28, letter: 150 },
  },
};

// ── ألوان التطبيق (من src/styles.css) ────────────────────────────────────────
const C = {
  green: '#10b981',
  greenDeep: '#059669',
  teal: '#134e4a',
  cream: '#fffbeb',
  ink: '#1f2937',
  card: '#ffffff',
  night: '#07231b',
  nightDeep: '#04150f',
};

const esc = (s) =>
  String(s ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');

const cssUrl = (s) => String(s).replace(/"/g, '\\"');

const round2 = (n) => Math.round(n * 100) / 100;

// ── بناء المشاهد ─────────────────────────────────────────────────────────────

/**
 * يحسب مدة كل مشهد.
 * إن وُجد تسجيل سردي فمدة الفيديو لا تقلّ عن طول الصوت + ذيل قصير.
 */
function buildScenes(story, opts) {
  const cps = opts.cps || CHARS_PER_SECOND[story.garden === 'quran' ? 'quran' : story.lang] || 15;
  const text = story.paragraphs.join(' ');
  const chunks = chunkText(text, { maxChars: opts.maxChars, minChars: opts.minChars });

  const introDur = story.garden === 'arabic' ? 3.2 : 2.6;
  const titleDur = 3.4;
  const questionDur = story.question ? 5.2 : 0;
  const outroDur = 3.4;

  const textScenes = chunks.map((c) => ({
    kind: 'text',
    text: c,
    dur: round2(Math.max(opts.minSceneSec, c.length / cps + opts.padSec)),
  }));

  let t = 0;
  const scenes = [];
  const push = (s) => {
    scenes.push({ ...s, start: round2(t) });
    t = round2(t + s.dur);
  };

  push({ kind: 'intro', dur: introDur });
  push({ kind: 'title', dur: titleDur });
  for (const s of textScenes) push(s);
  if (questionDur) push({ kind: 'question', dur: questionDur });
  push({ kind: 'outro', dur: outroDur });

  let duration = t;
  let audioStart = 0;
  let audioDur = 0;

  if (story.audioSeconds) {
    audioStart = introDur; // يبدأ السرد عند ظهور الرسم
    audioDur = story.audioSeconds;
    const needed = round2(audioStart + audioDur + 1.6);
    if (needed > duration) {
      // نوزّع الفرق على مشاهد النص فقط، فلا يتمدد المشهد الافتتاحي ولا الختامي
      const gap = needed - duration;
      const total = textScenes.reduce((a, s) => a + s.dur, 0) || 1;
      let acc = 0;
      for (const s of scenes) {
        if (s.kind !== 'text') continue;
        const share = gap * (s.dur / total);
        s.dur = round2(s.dur + share);
        acc += share;
      }
      // إعادة حساب المواضع بعد التمديد
      let rt = 0;
      for (const s of scenes) {
        s.start = round2(rt);
        rt = round2(rt + s.dur);
      }
      duration = rt;
    }
  }

  return { scenes, duration, audioStart, audioDur, chunks };
}

// ── HTML ─────────────────────────────────────────────────────────────────────

/**
 * @param {string} prefix بادئة مسار مجلد الخطوط نسبيًا للملف المولَّد.
 *   التركيبات في compositions/ فتحتاج ../assets/fonts/، بينما index.html
 *   في جذر المشروع فيكفيه assets/fonts/ — والخطأ هنا يُسقط الخط صامتًا.
 */
function fontFaces(prefix = 'assets/fonts/') {
  const faces = [
    ['Cairo', 400], ['Cairo', 600], ['Cairo', 700], ['Cairo', 800],
    ['Amiri', 400], ['Amiri', 700],
    ['Lalezar', 400],
  ];
  return faces
    .map(
      ([fam, w]) => `      @font-face {
        font-family: "${fam}";
        src: url("${prefix}${fam}-${w}-arabic.woff2") format("woff2");
        font-weight: ${w};
        font-style: normal;
        font-display: block;
      }
      @font-face {
        font-family: "${fam}";
        src: url("${prefix}${fam}-${w}-latin.woff2") format("woff2");
        font-weight: ${w};
        font-style: normal;
        font-display: block;
        unicode-range: U+0000-024F, U+2000-206F;
      }`,
    )
    .join('\n');
}

function stylesheet(F, story, artRel, fontPrefix = '../assets/fonts/') {
  const rtl = story.dir === 'rtl';
  const ui = rtl ? '"Cairo", system-ui, sans-serif' : '"Cairo", system-ui, sans-serif';
  const s = F.sizes;
  return `
${fontFaces(fontPrefix)}

      * { margin: 0; padding: 0; box-sizing: border-box; }
      html, body {
        width: ${F.w}px;
        height: ${F.h}px;
        overflow: hidden;
        background: ${C.nightDeep};
        font-family: ${ui};
        -webkit-font-smoothing: antialiased;
      }
      #root { position: relative; width: ${F.w}px; height: ${F.h}px; overflow: hidden; background: ${C.nightDeep}; }

      .clip { position: absolute; top: 0; left: 0; width: ${F.w}px; height: ${F.h}px; }

      /* الخلفية: نفس الرسم مضبَّبًا يملأ الإطار، فلا يظهر شريط أسود في العمودي */
      #bg {
        background-image: url("${cssUrl(artRel)}");
        background-size: cover;
        background-position: center;
        filter: blur(46px) saturate(1.2) brightness(0.42);
        transform: scale(1.18);
      }
      #scrim {
        background:
          radial-gradient(120% 70% at 50% 12%, rgba(4, 21, 15, 0.25) 0%, rgba(4, 21, 15, 0.78) 62%, rgba(4, 21, 15, 0.94) 100%),
          linear-gradient(to bottom, rgba(4, 21, 15, 0.55) 0%, rgba(4, 21, 15, 0) 26%, rgba(4, 21, 15, 0) 52%, rgba(4, 21, 15, 0.9) 88%);
      }

      /* شرائح علوية */
      /*
        اتجاه النص: لا نضع dir على <html> — ذلك يكسر العرض الصامت في HyperFrames
        (lint: html_dir_attribute_breaks_render). نضع direction على كل عنصر نصّي بدلًا منه،
        فيبقى التنسيق العربي صحيحًا ويعمل العرض.
      */
      #kicker {
        top: ${F.kicker.top}px; ${rtl ? 'right' : 'left'}: ${F.kicker.right ?? F.kicker.left}px; left: auto;
        width: auto; height: 62px; padding: 0 26px;
        display: flex; align-items: center; justify-content: center;
        background: rgba(16, 185, 129, 0.16);
        border: 2px solid rgba(16, 185, 129, 0.55);
        border-radius: 999px;
        color: #a7f3d0; font-size: ${s.kicker}px; font-weight: 700; letter-spacing: 0.04em;
        direction: ${story.dir};
        white-space: nowrap;
      }
      .badge {
        top: ${F.badge.top}px; left: ${F.badge.left}px;
        width: auto; height: 62px; padding: 0 26px;
        display: flex; align-items: center; justify-content: center;
        background: rgba(255, 251, 235, 0.94);
        border-radius: 999px;
        color: ${C.teal}; font-size: ${s.badge}px; font-weight: 800;
        box-shadow: 0 10px 26px rgba(0, 0, 0, 0.3);
        direction: ${story.dir};
        white-space: nowrap;
      }

      /* البطاقة الفنية */
      #art {
        top: ${F.art.top}px; left: ${F.art.left}px; width: ${F.art.w}px; height: ${F.art.h}px;
        object-fit: cover;
        border-radius: 34px;
        border: 5px solid rgba(255, 251, 235, 0.92);
        box-shadow: 0 40px 100px rgba(0, 0, 0, 0.62);
        overflow: hidden;
      }

      /* العنوان */
      #title-rule {
        top: ${F.titleBlock.top}px; left: ${F.w / 2 - 54}px; width: 108px; height: 8px;
        border-radius: 999px;
        background: linear-gradient(90deg, ${C.green}, #6ee7b7);
      }
      #title {
        top: ${F.titleBlock.top + 30}px; width: ${F.w}px; padding: 0 60px;
        text-align: center; color: ${C.cream};
        font-size: ${s.title}px; font-weight: 800; line-height: 1.32;
        direction: ${story.dir};
        text-shadow: 0 6px 26px rgba(0, 0, 0, 0.6);
      }

      /* لوحة النص */
      .panel {
        top: ${F.panel.top}px; left: ${F.panel.left}px; width: ${F.panel.w}px;
        padding: 40px 44px;
        background: rgba(255, 251, 235, 0.96);
        border-radius: 30px;
        border-${rtl ? 'right' : 'left'}: 12px solid ${C.green};
        box-shadow: 0 30px 70px rgba(0, 0, 0, 0.45);
      }
      .panel-body {
        position: absolute; top: 40px; left: 44px; right: 44px;
        color: ${C.ink}; font-size: ${s.body}px; font-weight: 600; line-height: 1.85;
        text-align: ${rtl ? 'right' : 'left'};
        direction: ${story.dir};
      }
      .panel-quran {
        font-family: "Amiri", "Cairo", serif;
        font-size: ${round2(s.body * 1.12)}px;
        line-height: 2.1;
        color: ${C.teal};
      }
      .scene-chip {
        top: ${F.chipTop}px; left: ${F.w / 2 - 90}px; width: 180px; height: 52px;
        display: flex; align-items: center; justify-content: center;
        background: rgba(4, 21, 15, 0.62);
        border: 2px solid rgba(167, 243, 208, 0.5);
        border-radius: 999px;
        color: #a7f3d0; font-size: ${round2(s.kicker * 0.92)}px; font-weight: 700;
        direction: ${story.dir};
      }

      /* الحرف الكبير في المشهد الافتتاحي */
      #intro-letter {
        top: ${F.h / 2 - F.sizes.letter * 0.85}px; width: ${F.w}px;
        text-align: center;
        font-family: "Lalezar", "Cairo", sans-serif;
        font-size: ${F.sizes.letter}px; line-height: 1;
        direction: ${story.dir};
        color: ${C.cream};
        text-shadow: 0 0 60px rgba(16, 185, 129, 0.6), 0 10px 30px rgba(0, 0, 0, 0.5);
      }
      #intro-word {
        top: ${F.h / 2 + F.sizes.letter * 0.34}px; width: ${F.w}px;
        text-align: center;
        font-size: ${round2(s.title * 1.05)}px; font-weight: 800;
        direction: ${story.dir};
        color: #6ee7b7;
      }
      #intro-kicker {
        top: ${F.h / 2 - F.sizes.letter * 1.55}px; width: ${F.w}px;
        text-align: center;
        font-size: ${s.kicker}px; font-weight: 700; letter-spacing: 0.24em;
        color: rgba(167, 243, 208, 0.85); text-transform: uppercase;
      }
      #intro-ring {
        top: ${F.h / 2 - 250}px; left: ${F.w / 2 - 250}px; width: 500px; height: 500px;
        border-radius: 50%;
        border: 3px solid rgba(16, 185, 129, 0.35);
        box-shadow: 0 0 90px rgba(16, 185, 129, 0.22) inset;
      }

      /* بطاقة السؤال */
      #q-prompt {
        top: ${F.panel.top}px; left: ${F.panel.left}px; width: ${F.panel.w}px;
        text-align: center; color: ${C.cream};
        font-size: ${s.qPrompt}px; font-weight: 800; line-height: 1.6;
        direction: ${story.dir};
      }
      #q-answer {
        top: ${F.panel.top + 170}px; left: ${F.w / 2 - 240}px; width: 480px; height: 132px;
        display: flex; align-items: center; justify-content: center;
        background: linear-gradient(135deg, ${C.green}, ${C.greenDeep});
        border-radius: 28px;
        color: #ffffff; font-size: ${s.answer}px; font-weight: 800;
        box-shadow: 0 24px 60px rgba(16, 185, 129, 0.4);
      }

      /* الختام */
      #outro-big {
        top: ${F.h / 2 - 120}px; width: ${F.w}px; text-align: center;
        font-family: "Lalezar", "Cairo", sans-serif;
        font-size: ${s.outroBig}px; color: ${C.cream};
        direction: ${story.dir};
        text-shadow: 0 8px 30px rgba(0, 0, 0, 0.55);
      }
      #outro-small {
        top: ${F.h / 2 + 26}px; width: ${F.w}px; text-align: center;
        font-size: ${s.outroSmall}px; font-weight: 700; letter-spacing: 0.14em;
        direction: ${story.dir};
        color: rgba(167, 243, 208, 0.9);
      }
      #outro-rule {
        top: ${F.h / 2 - 8}px; left: ${F.w / 2 - 70}px; width: 140px; height: 6px;
        border-radius: 999px; background: ${C.green};
      }

      #progress {
        top: ${F.progress.top}px; left: 0; width: ${F.w}px; height: ${F.progress.h}px;
        background: linear-gradient(90deg, ${C.green}, #6ee7b7);
        transform-origin: ${rtl ? 'right' : 'left'} center;
        transform: scaleX(0);
      }
`;
}

/**
 * يولّد HTML القصة.
 * القاعدة الحاكمة من HyperFrames: كل عنصر مُوقَّت في المستوى الأعلى له id و class="clip"
 * و data-start و data-duration، وخطّ زمن GSAP واحد متوقف مسجَّل على window.__timelines.
 */
export function buildComposition(story, opts) {
  const F = FORMATS[opts.format];
  const { scenes, duration, audioStart, audioDur } = buildScenes(story, opts);

  const artRel = `../assets/stories/${story.id}.jpg`;
  const rtl = story.dir === 'rtl';

  // عناصر ثابتة طوال الفيديو
  const els = [];
  const tweens = [];
  const add = (html) => els.push(html);
  const at = (code) => tweens.push(code);

  let track = 0;
  const t = () => track++;

  add(`      <div id="bg" class="clip" data-start="0" data-duration="${duration}" data-track-index="${t()}"></div>`);
  at(`      tl.fromTo("#bg", { scale: 1.16 }, { scale: 1.26, duration: ${duration}, ease: "none" }, 0);`);

  add(`      <div id="scrim" class="clip" data-start="0" data-duration="${duration}" data-track-index="${t()}"></div>`);

  add(`      <img id="art" class="clip" src="${artRel}" alt="${esc(story.title)}" data-start="0" data-duration="${duration}" data-track-index="${t()}" />`);
  at(`      tl.fromTo("#art", { scale: 1.0 }, { scale: 1.085, duration: ${duration}, ease: "none" }, 0);`);

  // شريط التقدّم
  add(`      <div id="progress" class="clip" data-start="0" data-duration="${duration}" data-track-index="${t()}"></div>`);
  at(`      tl.fromTo("#progress", { scaleX: 0 }, { scaleX: 1, duration: ${duration}, ease: "none" }, 0);`);

  // ── المشاهد ──
  let sceneIdx = 0;
  for (const sc of scenes) {
    sceneIdx++;
    const st = sc.start;
    const du = sc.dur;
    const end = round2(st + du);
    const inDur = 0.62;
    const outDur = 0.42;
    const outAt = round2(end - outDur - 0.08);

    if (sc.kind === 'intro') {
      add(`      <div id="intro-ring" class="clip" data-start="${st}" data-duration="${du}" data-track-index="${t()}"></div>`);
      at(`      tl.fromTo("#intro-ring", { opacity: 0, scale: 0.72 }, { opacity: 1, scale: 1, duration: 0.9, ease: "power3.out" }, ${st});`);
      at(`      tl.to("#intro-ring", { opacity: 0, scale: 1.16, duration: ${outDur + 0.2}, ease: "power2.in" }, ${outAt});`);

      add(`      <div id="intro-kicker" class="clip" data-start="${st}" data-duration="${du}" data-track-index="${t()}">${esc(story.kicker)}</div>`);
      at(`      tl.fromTo("#intro-kicker", { opacity: 0, y: -18 }, { opacity: 1, y: 0, duration: 0.5, ease: "power2.out" }, ${round2(st + 0.12)});`);
      at(`      tl.to("#intro-kicker", { opacity: 0, duration: ${outDur} }, ${outAt});`);

      if (story.letter) {
        add(`      <div id="intro-letter" class="clip" data-start="${st}" data-duration="${du}" data-track-index="${t()}">${esc(story.letter)}</div>`);
        at(`      tl.fromTo("#intro-letter", { opacity: 0, scale: 0.6, y: 26 }, { opacity: 1, scale: 1, y: 0, duration: 0.85, ease: "back.out(1.5)" }, ${round2(st + 0.2)});`);
        at(`      tl.to("#intro-letter", { opacity: 0, scale: 1.12, duration: ${outDur} }, ${outAt});`);

        add(`      <div id="intro-word" class="clip" data-start="${st}" data-duration="${du}" data-track-index="${t()}">${esc(story.word)}</div>`);
        at(`      tl.fromTo("#intro-word", { opacity: 0, y: 24 }, { opacity: 1, y: 0, duration: 0.6, ease: "power2.out" }, ${round2(st + 0.55)});`);
        at(`      tl.to("#intro-word", { opacity: 0, y: -14, duration: ${outDur} }, ${outAt});`);
      } else {
        // بلا حرف كبير: العنوان نفسه يتصدّر المشهد الافتتاحي
        // الحرف الكبير: حرف القصة الإنجليزية، أو رقم العدّ، أو اسم الحديقة
        const big = story.sound ?? (story.count != null ? story.count : story.chips[0] ?? story.gardenLabel);
        add(`      <div id="intro-letter" class="clip" data-start="${st}" data-duration="${du}" data-track-index="${t()}">${esc(big)}</div>`);
        at(`      tl.fromTo("#intro-letter", { opacity: 0, scale: 0.82 }, { opacity: 1, scale: 1, duration: 0.8, ease: "back.out(1.4)" }, ${round2(st + 0.2)});`);
        at(`      tl.to("#intro-letter", { opacity: 0, duration: ${outDur} }, ${outAt});`);

        add(`      <div id="intro-word" class="clip" data-start="${st}" data-duration="${du}" data-track-index="${t()}">${esc(story.title)}</div>`);
        at(`      tl.fromTo("#intro-word", { opacity: 0, y: 24 }, { opacity: 1, y: 0, duration: 0.6, ease: "power2.out" }, ${round2(st + 0.5)});`);
        at(`      tl.to("#intro-word", { opacity: 0, y: -14, duration: ${outDur} }, ${outAt});`);
      }
    }

    if (sc.kind === 'title') {
      add(`      <div id="kicker" class="clip" data-start="${st}" data-duration="${du}" data-track-index="${t()}">${esc(story.kicker)}</div>`);
      at(`      tl.fromTo("#kicker", { opacity: 0, ${rtl ? 'x: 44' : 'x: -44'} }, { opacity: 1, x: 0, duration: ${inDur}, ease: "power2.out" }, ${round2(st + 0.06)});`);
      at(`      tl.to("#kicker", { opacity: 0, duration: ${outDur} }, ${outAt});`);

      story.chips.slice(0, 2).forEach((chip, i) => {
        const id = `badge-${i + 1}`;
        const shift = i === 1 ? 'style="top:' + (F.badge.top + 78) + 'px"' : '';
        add(`      <div id="${id}" class="clip badge" data-start="${round2(st + i * 0.18)}" data-duration="${round2(du - i * 0.18)}" data-track-index="${t()}" ${shift}>${esc(chip)}</div>`);
        at(`      tl.fromTo("#${id}", { opacity: 0, x: -46 }, { opacity: 1, x: 0, duration: ${inDur}, ease: "power2.out" }, ${round2(st + 0.16 + i * 0.18)});`);
        at(`      tl.to("#${id}", { opacity: 0, duration: ${outDur} }, ${outAt});`);
      });

      add(`      <div id="title-rule" class="clip" data-start="${st}" data-duration="${du}" data-track-index="${t()}"></div>`);
      at(`      tl.fromTo("#title-rule", { opacity: 0, scaleX: 0 }, { opacity: 1, scaleX: 1, duration: 0.55, ease: "power2.out" }, ${round2(st + 0.24)});`);
      at(`      tl.to("#title-rule", { opacity: 0, duration: ${outDur} }, ${outAt});`);

      add(`      <h1 id="title" class="clip" data-start="${st}" data-duration="${du}" data-track-index="${t()}">${esc(story.title)}</h1>`);
      at(`      tl.fromTo("#title", { opacity: 0, y: 40 }, { opacity: 1, y: 0, duration: 0.72, ease: "power3.out" }, ${round2(st + 0.34)});`);
      at(`      tl.to("#title", { opacity: 0, y: -18, duration: ${outDur} }, ${outAt});`);
    }

    if (sc.kind === 'text') {
      const n = scenes.filter((x) => x.kind === 'text').indexOf(sc) + 1;
      const total = scenes.filter((x) => x.kind === 'text').length;
      const pid = `panel-${n}`;
      const quran = story.garden === 'quran';
      add(`      <div id="${pid}" class="clip panel" data-start="${st}" data-duration="${du}" data-track-index="${t()}"></div>`);
      at(`      tl.fromTo("#${pid}", { opacity: 0, y: 54, scale: 0.975 }, { opacity: 1, y: 0, scale: 1, duration: ${inDur}, ease: "power3.out" }, ${st});`);
      at(`      tl.to("#${pid}", { opacity: 0, y: -30, duration: ${outDur}, ease: "power2.in" }, ${outAt});`);

      add(`      <div id="${pid}-text" class="clip panel-body${quran ? ' panel-quran' : ''}" data-start="${st}" data-duration="${du}" data-track-index="${t()}">${esc(sc.text)}</div>`);
      at(`      tl.fromTo("#${pid}-text", { opacity: 0, y: 22 }, { opacity: 1, y: 0, duration: 0.58, ease: "power2.out" }, ${round2(st + 0.18)});`);
      at(`      tl.to("#${pid}-text", { opacity: 0, duration: ${outDur} }, ${outAt});`);

      if (total > 1) {
        add(`      <div id="${pid}-chip" class="clip scene-chip" data-start="${st}" data-duration="${du}" data-track-index="${t()}">${n} / ${total}</div>`);
        at(`      tl.fromTo("#${pid}-chip", { opacity: 0, scale: 0.8 }, { opacity: 1, scale: 1, duration: 0.42, ease: "back.out(2)" }, ${round2(st + 0.3)});`);
        at(`      tl.to("#${pid}-chip", { opacity: 0, duration: 0.3 }, ${outAt});`);
      }
    }

    if (sc.kind === 'question') {
      add(`      <div id="q-prompt" class="clip" data-start="${st}" data-duration="${du}" data-track-index="${t()}">${esc(story.question.prompt)}</div>`);
      at(`      tl.fromTo("#q-prompt", { opacity: 0, y: 34 }, { opacity: 1, y: 0, duration: 0.6, ease: "power3.out" }, ${round2(st + 0.1)});`);
      at(`      tl.to("#q-prompt", { opacity: 0, duration: ${outDur} }, ${outAt});`);

      add(`      <div id="q-answer" class="clip" data-start="${round2(st + 1.5)}" data-duration="${round2(du - 1.5)}" data-track-index="${t()}">${esc(story.question.answer)}</div>`);
      at(`      tl.fromTo("#q-answer", { opacity: 0, scale: 0.72 }, { opacity: 1, scale: 1, duration: 0.7, ease: "back.out(1.8)" }, ${round2(st + 1.6)});`);
      at(`      tl.to("#q-answer", { opacity: 0, scale: 0.94, duration: ${outDur} }, ${outAt});`);
    }

    if (sc.kind === 'outro') {
      add(`      <div id="outro-rule" class="clip" data-start="${st}" data-duration="${du}" data-track-index="${t()}"></div>`);
      at(`      tl.fromTo("#outro-rule", { opacity: 0, scaleX: 0 }, { opacity: 1, scaleX: 1, duration: 0.5, ease: "power2.out" }, ${round2(st + 0.2)});`);

      add(`      <div id="outro-big" class="clip" data-start="${st}" data-duration="${du}" data-track-index="${t()}">حدائق سلمان</div>`);
      at(`      tl.fromTo("#outro-big", { opacity: 0, y: 30 }, { opacity: 1, y: 0, duration: 0.66, ease: "power3.out" }, ${round2(st + 0.34)});`);

      add(`      <div id="outro-small" class="clip" data-start="${st}" data-duration="${du}" data-track-index="${t()}">${esc(story.garden === 'english' ? "SALMAN'S GARDEN" : 'حديقة الطفل المسلم')}</div>`);
      at(`      tl.fromTo("#outro-small", { opacity: 0, y: 18 }, { opacity: 1, y: 0, duration: 0.55, ease: "power2.out" }, ${round2(st + 0.62)});`);

      at(`      tl.to("#art", { opacity: 0.28, duration: 0.8, ease: "power2.inOut" }, ${round2(st + 0.1)});`);
    }
  }

  // ── الصوت ──
  let audioEl = '';
  if (story.audio) {
    audioEl = `      <audio id="narration" src="../assets/audio/${story.id}.mp3" data-start="${audioStart}" data-duration="${audioDur}" data-volume="1" data-hf-media-start-basis="local"></audio>\n`;
  }

  const html = `<!doctype html>
<html lang="${story.lang}">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=${F.w}, height=${F.h}" />
    <title>${esc(story.title)} — حدائق سلمان</title>
    <script src="../vendor/gsap.min.js"></script>
    <style>${stylesheet(F, story, artRel)}</style>
  </head>
  <body>
    <div
      id="root"
      data-composition-id="${story.id}"
      data-start="0"
      data-duration="${duration}"
      data-width="${F.w}"
      data-height="${F.h}"
    >
${els.join('\n')}
${audioEl}    </div>

    <script>
      window.__timelines = window.__timelines || {};
      const tl = gsap.timeline({ paused: true });

${tweens.join('\n')}

      window.__timelines["${story.id}"] = tl;
      tl.seek(0);
    </script>
  </body>
</html>
`;
  return { html, scenes, duration, track };
}

// ── ملفات المشروع ────────────────────────────────────────────────────────────

const ROOT_INDEX = (F, count, duration) => `<!doctype html>
<html lang="ar">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=${F.w}, height=${F.h}" />
    <title>حدائق سلمان — بطاقات القصص</title>
    <script src="vendor/gsap.min.js"></script>
    <style>
${fontFaces()}
      * { margin: 0; padding: 0; box-sizing: border-box; }
      html, body { width: ${F.w}px; height: ${F.h}px; overflow: hidden; background: ${C.nightDeep}; font-family: "Cairo", system-ui, sans-serif; }
      #root { position: relative; width: ${F.w}px; height: ${F.h}px; overflow: hidden; }
      .clip { position: absolute; top: 0; left: 0; width: ${F.w}px; height: ${F.h}px; }
      #glow { background: radial-gradient(70% 46% at 50% 40%, rgba(16,185,129,0.3) 0%, rgba(4,21,15,0) 70%); }
      #ring { top: ${F.h / 2 - 270}px; left: ${F.w / 2 - 270}px; width: 540px; height: 540px; border-radius: 50%; border: 3px solid rgba(16,185,129,0.4); }
      #big { top: ${F.h / 2 - 150}px; width: ${F.w}px; text-align: center; direction: rtl; font-family: "Lalezar","Cairo",sans-serif; font-size: ${F.sizes.outroBig}px; color: ${C.cream}; }
      #rule { top: ${F.h / 2 - 6}px; left: ${F.w / 2 - 70}px; width: 140px; height: 6px; border-radius: 999px; background: ${C.green}; }
      #count { top: ${F.h / 2 + 44}px; width: ${F.w}px; text-align: center; direction: rtl; font-size: ${F.sizes.body}px; font-weight: 700; color: #6ee7b7; }
      #small { top: ${F.h / 2 + 132}px; width: ${F.w}px; text-align: center; font-size: ${F.sizes.outroSmall}px; font-weight: 700; letter-spacing: 0.16em; color: rgba(167,243,208,0.8); }
    </style>
  </head>
  <body>
    <div id="root" data-composition-id="main" data-start="0" data-duration="${duration}" data-width="${F.w}" data-height="${F.h}">
      <div id="glow" class="clip" data-start="0" data-duration="${duration}" data-track-index="0"></div>
      <div id="ring" class="clip" data-start="0" data-duration="${duration}" data-track-index="1"></div>
      <div id="big" class="clip" data-start="0" data-duration="${duration}" data-track-index="2">حدائق سلمان</div>
      <div id="rule" class="clip" data-start="0" data-duration="${duration}" data-track-index="3"></div>
      <div id="count" class="clip" data-start="0" data-duration="${duration}" data-track-index="4">${count} قصة مصوَّرة</div>
      <div id="small" class="clip" data-start="0" data-duration="${duration}" data-track-index="5">SALMAN'S GARDEN · STORY CARDS</div>
    </div>
    <script>
      window.__timelines = window.__timelines || {};
      const tl = gsap.timeline({ paused: true });
      tl.fromTo("#ring", { opacity: 0, scale: 0.7 }, { opacity: 1, scale: 1, duration: 1.1, ease: "power3.out" }, 0);
      tl.fromTo("#big", { opacity: 0, y: 34 }, { opacity: 1, y: 0, duration: 0.8, ease: "power3.out" }, 0.25);
      tl.fromTo("#rule", { opacity: 0, scaleX: 0 }, { opacity: 1, scaleX: 1, duration: 0.6, ease: "power2.out" }, 0.55);
      tl.fromTo("#count", { opacity: 0, y: 22 }, { opacity: 1, y: 0, duration: 0.6, ease: "power2.out" }, 0.75);
      tl.fromTo("#small", { opacity: 0, y: 18 }, { opacity: 1, y: 0, duration: 0.6, ease: "power2.out" }, 0.95);
      tl.to("#ring", { scale: 1.1, duration: ${round2(duration - 1.2)}, ease: "none" }, 1.2);
      tl.to("#glow", { opacity: 0, duration: 1.0, ease: "power2.inOut" }, ${round2(duration - 1.1)});
      tl.to("#big", { opacity: 0, duration: 0.8 }, ${round2(duration - 1.0)});
      tl.to("#count", { opacity: 0, duration: 0.6 }, ${round2(duration - 0.9)});
      tl.to("#small", { opacity: 0, duration: 0.6 }, ${round2(duration - 0.9)});
      window.__timelines["main"] = tl;
      tl.seek(0);
    </script>
  </body>
</html>
`;

const PACKAGE_JSON = {
  name: 'quran-garden-videos',
  private: true,
  type: 'module',
  description: 'فيديوهات قصص «حدائق سلمان» — مشروع HyperFrames مولَّد من src/salman/data',
  scripts: {
    generate: 'node ../tools/videos/build-videos.mjs',
    dev: `npx --yes hyperframes@${HYPERFRAMES_VERSION} preview`,
    check: `npx --yes hyperframes@${HYPERFRAMES_VERSION} check`,
    lint: `npx --yes hyperframes@${HYPERFRAMES_VERSION} lint`,
    'render:all': 'node ../tools/videos/render-all.mjs',
    publish: `npx --yes hyperframes@${HYPERFRAMES_VERSION} publish`,
  },
};

const HYPERFRAMES_JSON = {
  $schema: 'https://hyperframes.heygen.com/schema/hyperframes.json',
  registry: 'https://raw.githubusercontent.com/heygen-com/hyperframes/main/registry',
  paths: { blocks: 'compositions', components: 'compositions/components', assets: 'assets' },
  media: { autoProxy: true },
};

// ── نسخ الأصول ───────────────────────────────────────────────────────────────

function copyAssets(stories) {
  const artDir = join(OUT, 'assets/stories');
  const audioDirAbs = join(OUT, 'assets/audio');
  const fontDir = join(OUT, 'assets/fonts');
  const vendorDir = join(OUT, 'vendor');
  for (const d of [artDir, audioDirAbs, fontDir, vendorDir]) mkdirSync(d, { recursive: true });

  const copied = { art: 0, audio: 0, fonts: 0 };
  for (const s of stories) {
    if (s.art?.exists) {
      copyFileSync(s.art.abs, join(artDir, `${s.id}.jpg`));
      copied.art++;
    }
    if (s.audio?.exists) {
      copyFileSync(s.audio.abs, join(audioDirAbs, `${s.id}.mp3`));
      copied.audio++;
    }
  }
  for (const f of readdirSync(join(PUBLIC, 'fonts'))) {
    if (!f.endsWith('.woff2')) continue;
    copyFileSync(join(PUBLIC, 'fonts', f), join(fontDir, f));
    copied.fonts++;
  }

  // GSAP محليًا: التركيبات لا تعتمد على CDN وقت العرض (لا شبكة في العارض)
  const gsapCandidates = [
    resolve(ROOT, 'node_modules/gsap/dist/gsap.min.js'),
    resolve(ROOT, 'videos/node_modules/gsap/dist/gsap.min.js'),
  ];
  const gsap = gsapCandidates.find((p) => existsSync(p));
  if (gsap) {
    copyFileSync(gsap, join(vendorDir, 'gsap.min.js'));
  } else {
    throw new Error(
      'لم نجد gsap.min.js. ثبِّت الحزمة أولًا:\n  npm i -D gsap\nثم أعد التوليد.',
    );
  }
  return { ...copied, gsap: gsap ? relative(OUT, gsap) : null };
}

// ── الرئيسي ──────────────────────────────────────────────────────────────────

async function main() {
  const F = FORMATS[FORMAT];
  if (!F) throw new Error(`صيغة غير معروفة: ${FORMAT} (المسموح: ${Object.keys(FORMATS).join(', ')})`);

  const stories = await collectStories({ only: GARDEN_FILTER });
  const selected = ONLY.length ? stories.filter((s) => ONLY.includes(s.id)) : stories;
  if (!selected.length) throw new Error('لا توجد قصص مطابقة للفلاتر المعطاة.');

  // طول التسجيل السردي إن وُجد
  for (const s of selected) {
    s.audioSeconds = s.audio?.exists ? mp3DurationSeconds(s.audio.abs) : null;
    if (s.audio?.exists && !s.audioSeconds) {
      console.warn(`  تحذير: تعذّرت قراءة مدة ${s.id}.mp3 — سيُحسب التوقيت من طول النص.`);
    }
  }

  const opts = {
    format: FORMAT,
    cps: CPS,
    maxChars: FORMAT === 'portrait' ? 190 : 150,
    minChars: 55,
    padSec: 1.15,
    minSceneSec: 3.2,
  };

  if (DRY) {
    let total = 0;
    const perGarden = {};
    for (const s of selected) {
      const { duration, scenes } = buildScenes(s, opts);
      total += duration;
      const g = (perGarden[s.garden] ||= { n: 0, sec: 0, scenes: 0 });
      g.n++;
      g.sec += duration;
      g.scenes += scenes.length;
    }
    console.log(`\n[dry-run] ${selected.length} فيديو · صيغة ${FORMAT} ${F.w}×${F.h}`);
    for (const [k, v] of Object.entries(perGarden)) {
      console.log(`  ${k.padEnd(8)} ${String(v.n).padStart(3)} فيديو · ${(v.sec / 60).toFixed(1)} دقيقة إجمالًا · ${(v.sec / v.n).toFixed(0)}ث للفيديو · ${(v.scenes / v.n).toFixed(1)} مشهد`);
    }
    console.log(`  المجموع ${(total / 60).toFixed(1)} دقيقة (${(total / 3600).toFixed(2)} ساعة) من الفيديو\n`);
    return;
  }

  // تنظيف المخرجات القديمة لتفادي بقايا قصص حُذفت
  rmSync(join(OUT, 'compositions'), { recursive: true, force: true });
  mkdirSync(join(OUT, 'compositions'), { recursive: true });

  const copied = copyAssets(selected);

  const manifest = [];
  let totalSec = 0;
  for (const s of selected) {
    const { html, duration, scenes } = buildComposition(s, opts);
    writeFileSync(join(OUT, 'compositions', `${s.id}.html`), html, 'utf8');
    manifest.push({
      id: s.id,
      garden: s.garden,
      lang: s.lang,
      title: s.title,
      composition: `compositions/${s.id}.html`,
      output: `renders/${FORMAT}/${s.id}.mp4`,
      duration,
      scenes: scenes.length,
      hasArt: Boolean(s.art?.exists),
      hasAudio: Boolean(s.audio?.exists),
      narrationSeconds: s.audioSeconds ?? null,
    });
    totalSec += duration;
  }

  writeFileSync(join(OUT, 'index.html'), ROOT_INDEX(F, manifest.length, 8), 'utf8');
  writeFileSync(join(OUT, 'package.json'), JSON.stringify(PACKAGE_JSON, null, 2) + '\n', 'utf8');
  writeFileSync(join(OUT, 'hyperframes.json'), JSON.stringify(HYPERFRAMES_JSON, null, 2) + '\n', 'utf8');
  writeFileSync(
    join(OUT, 'meta.json'),
    JSON.stringify({ id: 'salman-story-videos', name: "Salman's Garden — Story Videos", createdAt: new Date().toISOString() }, null, 2) + '\n',
    'utf8',
  );

  const summary = {
    generatedAt: new Date().toISOString(),
    format: { name: FORMAT, width: F.w, height: F.h },
    hyperframes: HYPERFRAMES_VERSION,
    totals: {
      videos: manifest.length,
      runtimeSeconds: round2(totalSec),
      runtimeMinutes: round2(totalSec / 60),
      withNarration: manifest.filter((m) => m.hasAudio).length,
      byGarden: manifest.reduce((acc, m) => ((acc[m.garden] = (acc[m.garden] || 0) + 1), acc), {}),
    },
    videos: manifest,
  };
  writeFileSync(join(OUT, 'manifest.json'), JSON.stringify(summary, null, 2) + '\n', 'utf8');

  console.log(`\n✓ ولَّدنا ${manifest.length} تركيبًا في videos/compositions/  (${FORMAT} ${F.w}×${F.h})`);
  console.log(`  الأصول: ${copied.art} رسم · ${copied.audio} مقطع سردي · ${copied.fonts} خط`);
  console.log(`  إجمالي مدة الفيديوهات: ${(totalSec / 60).toFixed(1)} دقيقة`);
  console.log(`  البيان: videos/manifest.json\n`);
}

main().catch((err) => {
  console.error('\n✗ فشل التوليد:', err.message);
  process.exitCode = 1;
});
