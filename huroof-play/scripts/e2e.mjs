// اختبار النهاية للنهاية في Chromium حقيقي: يشغّل نسخة الإنتاج (dist/) ويلعب مستوى كامل بالسحب والضغط والكيبورد.
// بيحفظ لقطات الشاشة في docs/qa/ وتقرير JSON. الاستخدام: npm run e2e
// المتصفح: متغير CHROME_PATH لو موجود، وإلا Chrome/Chromium الافتراضي على النظام.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import puppeteer from 'puppeteer-core';
import { preview } from 'vite';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const QA_DIR = path.join(ROOT, 'docs', 'qa');
const PORT = Number(process.env.E2E_PORT ?? 4199);
const MOBILE = { width: 390, height: 844, deviceScaleFactor: 1, isMobile: true, hasTouch: false };
const DESKTOP = { width: 1280, height: 800, deviceScaleFactor: 1 };

function findChrome() {
  const candidates = [
    process.env.CHROME_PATH,
    '/usr/bin/google-chrome',
    '/usr/bin/google-chrome-stable',
    '/usr/bin/chromium',
    '/usr/bin/chromium-browser',
  ].filter(Boolean);
  const found = candidates.find((p) => fs.existsSync(p));
  if (!found) throw new Error('لم يُعثر على Chrome — اضبط CHROME_PATH');
  return found;
}

const results = [];
const check = (name, ok, detail = '') => {
  results.push({ name, ok, detail });
  console.log(`${ok ? '✔' : '✘'} ${name}${detail ? ` — ${detail}` : ''}`);
};

const server = await preview({
  root: ROOT,
  logLevel: 'error',
  preview: { port: PORT, strictPort: true, host: '127.0.0.1' },
});
const base = `http://127.0.0.1:${PORT}/`;

const browser = await puppeteer.launch({
  executablePath: findChrome(),
  headless: true,
  args: ['--no-sandbox', '--disable-dev-shm-usage', '--disable-gpu'],
});

let failed = 0;
try {
  fs.mkdirSync(QA_DIR, { recursive: true });
  const page = await browser.newPage();
  const consoleErrors = [];
  const failedRequests = [];
  const externalRequests = [];
  page.on('console', (m) => {
    if (m.type() === 'error') consoleErrors.push(m.text());
  });
  page.on('pageerror', (e) => consoleErrors.push(`pageerror: ${e.message}`));
  page.on('requestfailed', (r) => failedRequests.push(r.url()));
  page.on('request', (r) => {
    const u = new URL(r.url());
    if (!['127.0.0.1', 'localhost', 'data:', 'blob:'].includes(u.hostname) && u.protocol !== 'data:') {
      externalRequests.push(r.url());
    }
  });

  await page.setViewport(MOBILE);
  await page.goto(base, { waitUntil: 'networkidle0' });
  const title = await page.title();
  check('العنوان العربي موجود', title.includes('مغامرة الحروف'), title);
  const dir = await page.$eval('html', (h) => `${h.getAttribute('dir')}/${h.getAttribute('lang')}`);
  check('RTL و lang=ar', dir === 'rtl/ar', dir);
  await page.screenshot({ path: path.join(QA_DIR, '01-welcome-mobile.png') });

  // ---- الترحيب ← الخريطة ----
  await page.type('#player-name', 'ليلى');
  await page.click('button[type="submit"]');
  await page.waitForSelector('.level-list');
  const unlocked = await page.$$eval('.level-card', (els) => els.filter((e) => !e.disabled).length);
  check('خريطة المستويات: المستوى 1 مفتوح فقط', unlocked === 1, `${unlocked} مفتوح`);
  await page.screenshot({ path: path.join(QA_DIR, '02-map-mobile.png') });

  // ---- المستوى 1: ضغط (اختيار ثم حيوان) ----
  await page.click('.level-card:not([disabled])');
  await page.waitForSelector('.board');
  await page.click('[data-letter="ب"]');
  const pressed = await page.$eval('[data-letter="ب"]', (e) => e.getAttribute('aria-pressed'));
  check('الضغط على الحرف بيختاره (aria-pressed)', pressed === 'true');
  await page.screenshot({ path: path.join(QA_DIR, '03-play-selected-mobile.png') });

  // غلطة: ب على ت
  await page.click('[data-target="ت"]');
  const live1 = await page.$eval('[role="status"]', (e) => e.textContent);
  check('الغلطة بتظهر رسالة مشجعة', live1.includes('لا بأس'), live1);
  await page.click('[data-target="ب"]');
  const bPlaced = await page.$eval('[data-letter="ب"]', (e) => e.disabled);
  check('الضغط على الحيوان الصح بيحط الحرف', bPlaced === true);

  // ---- السحب بالمؤشر (ت → تمساح) ----
  const letterBox = await (await page.$('[data-letter="ت"]')).boundingBox();
  const targetBox = await (await page.$('[data-target="ت"]')).boundingBox();
  await page.mouse.move(letterBox.x + letterBox.width / 2, letterBox.y + letterBox.height / 2);
  await page.mouse.down();
  await page.mouse.move(targetBox.x + targetBox.width / 2, targetBox.y + targetBox.height / 2, { steps: 12 });
  const ghostWhileDragging = await page.$('.drag-ghost');
  check('أثناء السحب يظهر الشبح', ghostWhileDragging !== null);
  await page.mouse.up();
  const tPlaced = await page.$eval('[data-letter="ت"]', (e) => e.disabled);
  check('السحب والإفلات على الحيوان الصح بيحط الحرف', tPlaced === true);

  // ---- لوحة المفاتيح: Tab + Enter ----
  await page.focus('[data-letter="أ"]');
  await page.keyboard.press('Enter');
  const kbSelected = await page.$eval('[data-letter="أ"]', (e) => e.getAttribute('aria-pressed'));
  check('لوحة المفاتيح: Enter على الحرف بيختاره', kbSelected === 'true');
  await page.focus('[data-target="أ"]');
  await page.keyboard.press('Enter');
  const aPlaced = await page.$eval('[data-letter="أ"]', (e) => e.disabled);
  check('لوحة المفاتيح: Enter على الحيوان بيحط الحرف', aPlaced === true);

  // ---- آخر حرف بالسحب ----
  const thLetter = await (await page.$('[data-letter="ث"]')).boundingBox();
  const thTarget = await (await page.$('[data-target="ث"]')).boundingBox();
  await page.mouse.move(thLetter.x + 20, thLetter.y + 20);
  await page.mouse.down();
  await page.mouse.move(thTarget.x + 30, thTarget.y + 30, { steps: 10 });
  await page.mouse.up();
  await page.waitForSelector('.done-card', { timeout: 3000 });
  check('إكمال المستوى بيظهر شاشة النهاية', true);
  await page.screenshot({ path: path.join(QA_DIR, '04-level-done-mobile.png') });

  // ---- المستوى التالي مفتوح ----
  await page.click('.done-actions .btn.primary');
  await page.waitForSelector('.board');
  const level2Title = await page.$eval('#play-title', (e) => e.textContent);
  check('المستوى التالي بيفتح', level2Title === 'مزرعة الحروف', level2Title);

  // ---- شاشة كاملة ----
  await page.setViewport(DESKTOP);
  await page.screenshot({ path: path.join(QA_DIR, '05-play-desktop.png') });
  await page.setViewport(MOBILE);

  // ---- فحوص عامة ----
  const fontOk = await page.evaluate(() => document.fonts.check('900 20px Cairo'));
  check('الخط العربي (Cairo) متاح محليًا', fontOk);
  check('مفيش أخطاء في الكونسول', consoleErrors.length === 0, consoleErrors.slice(0, 3).join(' | '));
  check('مفيش طلبات فاشلة', failedRequests.length === 0, failedRequests.slice(0, 3).join(' | '));
  check('مفيش طلبات لخارج الموقع (خصوصية)', externalRequests.length === 0, externalRequests.slice(0, 3).join(' | '));
} catch (err) {
  failed += 1;
  check('تشغيل الاختبار', false, err.stack ?? String(err));
} finally {
  await browser.close();
  await server.httpServer.close();
}

failed += results.filter((r) => !r.ok).length;
fs.writeFileSync(
  path.join(QA_DIR, 'e2e-report.json'),
  JSON.stringify(
    {
      generatedAt: new Date().toISOString(),
      passed: results.filter((r) => r.ok).length,
      total: results.length,
      results,
    },
    null,
    2
  )
);
console.log(`\n${results.length - failed} / ${results.length} فحص نجح`);
process.exit(failed > 0 ? 1 : 0);
