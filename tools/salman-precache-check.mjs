#!/usr/bin/env node
// يتحقّق أن كل أصل في `public/salman/` دخل precache الخاص بالـ Service Worker بعد البناء.
//
// الاستخدام:  npm run build && node tools/salman-precache-check.mjs
//
// الفكرة: أي أصل جديد (صورة/صوت) يجب أن يُخزَّن مسبقًا ليعمل التطبيق بلا إنترنت (المرحلة F).
// الفحص لا يحتاج متصفحًا: يقرأ `dist/sw.js` (قائمة precache) ويقارنها بملفات القرص.
// لفحص تجربة الأوفلاين الكاملة (متصل ⇒ SW ⇒ قطع الشبكة ⇒ إعادة تحميل) استخدم
// `tools/salman-offline-check.mjs` كما هو موصوف في رأس الملف.
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join, relative, posix, sep } from 'node:path';

const ROOT = process.cwd();
const SW = join(ROOT, 'dist', 'sw.js');
const SCOPES = ['public/salman', 'public/assets'];

let sw;
try {
  sw = readFileSync(SW, 'utf8');
} catch {
  console.error(`✖ لم أجد ${relative(ROOT, SW)} — شغّل "npm run build" أولًا.`);
  process.exit(2);
}

const walk = (dir) =>
  readdirSync(dir).flatMap((name) => {
    const full = join(dir, name);
    return statSync(full).isDirectory() ? walk(full) : [full];
  });

const urls = [];
for (const scope of SCOPES) {
  try {
    urls.push(...walk(join(ROOT, scope)));
  } catch {
    // مجلد غير موجود: نتجاهله (public/assets موجود في هذا المستودع، لكن نبقى آمنين)
  }
}

const missing = [];
for (const file of urls) {
  const url = relative(join(ROOT, 'public'), file).split(sep).join(posix.sep);
  if (!sw.includes(url)) missing.push(url);
}

const count = (dir) => {
  try {
    return walk(join(ROOT, dir)).length;
  } catch {
    return 0;
  }
};

console.log(`precache: ${urls.length} أصلًا تحت public/salman + public/assets`);
console.log(`  · صور «حدائق النور»: ${count('public/salman/art/nour')}`);
console.log(`  · صوت «حدائق النور»: ${count('public/salman/audio/nour')}`);

if (missing.length) {
  console.error(`✖ ${missing.length} أصلًا خارج precache:`);
  for (const url of missing.slice(0, 20)) console.error(`   - ${url}`);
  if (missing.length > 20) console.error(`   … و${missing.length - 20} غيرها`);
  process.exit(1);
}

console.log('✓ كل الأصول في precache — التطبيق يعمل بلا إنترنت بعد أول تحميل.');
