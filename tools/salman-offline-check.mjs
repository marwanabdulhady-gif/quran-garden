// فحص دون إنترنت لحديقة سلمان (المرحلة F).
// التشغيل:
//   1) npm run build && npx vite preview --host 127.0.0.1 --port 4173   (في الخلفية)
//   2) في مجلد خارج المستودع: npm i @sparticuz/chromium@131 puppeteer-core@23
//      ثم فكّ ضغط al2023.tar.br و al2.tar.br من node_modules/@sparticuz/chromium/bin إلى مجلد libs
//   3) LD_LIBRARY_PATH=<libs>/lib BASE=http://127.0.0.1:4173 node tools/salman-offline-check.mjs
// النتيجة: JSON، وخروج 0 عند النجاح. لا يُضاف هذا الفحص إلى تبعيات المستودع.
// فحص دون إنترنت لحديقة سلمان: يحمّل التطبيق، ينتظر Service Worker والكاش، ثم يقطع الشبكة ويعيد التحميل.
import chromium from '@sparticuz/chromium';
import puppeteer from 'puppeteer-core';

const BASE = process.env.BASE || 'http://127.0.0.1:4173';
const browser = await puppeteer.launch({
  executablePath: await chromium.executablePath(),
  args: chromium.args,
  headless: true,
  defaultViewport: { width: 420, height: 860 },
});
const page = await browser.newPage();
const pageErrors = [];
page.on('pageerror', (e) => pageErrors.push(e.message));
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const result = { checks: {} };

await page.goto(`${BASE}/salman.html`, { waitUntil: 'networkidle0', timeout: 60000 });
result.checks.swRegistered = await page.evaluate(async () => {
  const reg = await navigator.serviceWorker.ready;
  return !!reg.active;
});
// الانتظار حتى يتحكم الـ SW في الصفحة ثم إعادة التحميل ليُخزَّن كل شيء
await page.waitForFunction(() => !!navigator.serviceWorker.controller, { timeout: 60000 }).catch(() => {});
await page.reload({ waitUntil: 'networkidle0' });
await sleep(1500);
result.checks.controlled = await page.evaluate(() => !!navigator.serviceWorker.controller);
result.checks.cacheEntries = await page.evaluate(async () => {
  let n = 0;
  for (const name of await caches.keys()) n += (await (await caches.open(name)).keys()).length;
  return n;
});

// ملفات مختارة يجب أن تكون في الكاش (صوت، صور، أوسمة، هدايا، فاتحة، manifest)
const SAMPLE = [
  '/salman/audio/stories/en-01.mp3',
  '/salman/audio/stories/math-01.mp3',
  '/salman/art/badges/first-star.png',
  '/salman/art/gifts/star.png',
  '/salman/art/growth-1.png',
  '/salman/icons/icon-192.png',
  '/salman.webmanifest',
];
result.checks.samplesCached = await page.evaluate(async (urls) => {
  const out = {};
  const keys = [];
  for (const name of await caches.keys()) for (const r of await (await caches.open(name)).keys()) keys.push(r.url.split('?')[0]);
  for (const u of urls) out[u] = keys.includes(new URL(u, location.origin).href);
  return out;
}, SAMPLE);

// قطع الشبكة ثم فتح التطبيق من الكاش
await page.setOfflineMode(true);
await page.goto(`${BASE}/salman.html`, { waitUntil: 'domcontentloaded', timeout: 60000 });
await page.waitForFunction(() => document.body.innerText.includes('غابة سلمان'), { timeout: 30000 }).then(
  () => (result.checks.offlineHome = true),
  () => (result.checks.offlineHome = false),
);
// فتح حديقة الحروف
const opened = await page.evaluate(() => {
  const b = [...document.querySelectorAll('button')].find((x) => x.textContent.includes('حديقة الحروف'));
  if (b) b.click();
  return !!b;
});
await sleep(500);
result.checks.offlineGardenOpens = opened && (await page.evaluate(() => document.body.innerText.includes('حديقة الحروف')));
// الأصول من الكاش وهي دون إنترنت
result.checks.offlineAssetsOk = await page.evaluate(async (urls) => {
  const out = {};
  for (const u of urls) {
    try {
      const r = await fetch(u);
      out[u] = r.ok;
    } catch {
      out[u] = false;
    }
  }
  return out;
}, SAMPLE);
result.pageErrors = pageErrors;

const allOk =
  result.checks.swRegistered &&
  result.checks.controlled &&
  result.checks.cacheEntries > 0 &&
  Object.values(result.checks.samplesCached).every(Boolean) &&
  result.checks.offlineHome &&
  result.checks.offlineGardenOpens &&
  Object.values(result.checks.offlineAssetsOk).every(Boolean) &&
  pageErrors.length === 0;
result.passed = allOk;
console.log(JSON.stringify(result, null, 1));
await browser.close();
process.exit(allOk ? 0 : 1);
