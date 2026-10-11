// فحص الرسوم داخل المتصفح (VISUALS.md): يفتح درس العدّ ويتأكد أن صور الأشياء تحمّلت.
// يزرع حالة محفوظة بقصص الرياضيات «مشاهدة» حتى تنفتح أسئلة العدّ (حدّ الجديد اليومي).
// التشغيل: bash tools/salman-setup-checks.sh (مرة)، ثم:
//   cp tools/salman-visual-check.mjs /home/user/recovery/chrome/ && cd /home/user/recovery/chrome
//   LD_LIBRARY_PATH=/home/user/recovery/libs/lib BASE=http://127.0.0.1:4173 node salman-visual-check.mjs
// النتيجة: JSON، وخروج 0 عند النجاح. اللقطة في /home/user/recovery/count-lesson.png.
import chromium from '@sparticuz/chromium';
import puppeteer from 'puppeteer-core';

const REPO = process.env.REPO || '/home/user/quran-garden';
const BASE = process.env.BASE || 'http://127.0.0.1:4173';
const { createState, dayKeyFrom } = await import(`${REPO}/src/salman/lib/gamify.js`);
const { newRecord } = await import(`${REPO}/src/salman/lib/leitner.js`);
const { MATH_STORIES } = await import(`${REPO}/src/salman/data/gardens.js`);

const day = dayKeyFrom(new Date());
const seed = createState();
for (const m of MATH_STORIES) seed.skills[m.id] = newRecord(day);
seed.daily = { day, newByGarden: {} };

const browser = await puppeteer.launch({
  executablePath: await chromium.executablePath(),
  args: chromium.args,
  headless: true,
  defaultViewport: { width: 420, height: 860 },
});
const page = await browser.newPage();
const pageErrors = [];
page.on('pageerror', (e) => pageErrors.push(e.message));
const wait = (ms) => new Promise((r) => setTimeout(r, ms));

await page.goto(`${BASE}/salman.html`, { waitUntil: 'networkidle0', timeout: 60000 });
await page.evaluate((s) => localStorage.setItem('salman-garden-v1', JSON.stringify(s)), seed);
await page.reload({ waitUntil: 'networkidle0', timeout: 60000 });

const gardenOpened = await page.evaluate(() => {
  const btn = [...document.querySelectorAll('button.sg-garden')].find((b) => b.textContent.includes('الأرقام'));
  if (!btn) return false;
  btn.click();
  return true;
});
await wait(800);
const lessonOpened = await page.evaluate(() => {
  const row = [...document.querySelectorAll('button.sg-row')].find((b) => b.textContent.includes('العدّ حتى'));
  if (!row) return false;
  row.click();
  return true;
});
await page.waitForSelector('.sg-count-row, .sg-count-emoji', { timeout: 15000 }).catch(() => null);
await wait(1500);

const report = await page.evaluate(() => {
  const imgs = [...document.querySelectorAll('img.sg-count-art')];
  return {
    title: document.querySelector('.sg-title')?.textContent ?? null,
    countRows: document.querySelectorAll('.sg-count-row').length,
    emojiFallbacks: document.querySelectorAll('.sg-count-emoji').length,
    pictures: imgs.length,
    loaded: imgs.filter((i) => i.complete && i.naturalWidth > 0).length,
    broken: imgs.filter((i) => i.complete && i.naturalWidth === 0).length,
    choices: [...document.querySelectorAll('.sg-choice')].map((c) => c.textContent.trim()),
  };
});
await page.screenshot({ path: '/home/user/recovery/count-lesson.png' });
await browser.close();

const ok =
  gardenOpened &&
  lessonOpened &&
  pageErrors.length === 0 &&
  report.countRows === 1 &&
  report.emojiFallbacks === 0 &&
  report.pictures > 0 &&
  report.loaded === report.pictures &&
  report.broken === 0 &&
  report.choices.length === 2;
console.log(JSON.stringify({ passed: ok, gardenOpened, lessonOpened, report, pageErrors }, null, 1));
process.exit(ok ? 0 : 1);
