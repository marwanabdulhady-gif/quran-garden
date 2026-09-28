// واجهة api.alquran.cloud — نص عثماني + تلاوات لكل آية
// مع نسخة احتياطية بدون إنترنت: جزء عمّ (٧٨–١١٤) مدمج في التطبيق (نص فقط)
// P4: مهلة fetch + إعادة محاولة واحدة، وكاش متواصل في IndexedDB (مُرقّم)
import { JUZ30 } from './juz30.js';
import { SURAH_NAMES_FALLBACK, SURAH_META } from './data.js';

const BASE = 'https://api.alquran.cloud/v1';
const cache = new Map();

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

/**
 * fetch بمهلة (AbortController) + إعادة محاولة واحدة مع backoff.
 * الأخطاء 4xx ما تتعادش (مشكلة في الطلب نفسه)، و5xx/شبكة/مهلة تعاد مرة.
 * تُصدَّر للاختبار المباشر.
 */
export async function fetchJson(url, { timeout = 10000, retryDelay = 600 } = {}) {
  let lastErr;
  for (let attempt = 0; attempt < 2; attempt++) {
    const ctrl = new AbortController();
    const t = setTimeout(() => ctrl.abort(), timeout);
    try {
      const res = await fetch(url, { signal: ctrl.signal });
      if (!res.ok) {
        const err = new Error('HTTP ' + res.status);
        err.status = res.status;
        if (res.status < 500) throw err; // 4xx: ما يستاهلش إعادة
        lastErr = err;
      } else {
        return await res.json();
      }
    } catch (e) {
      if (e && e.status && e.status < 500) throw e;
      lastErr = e;
    } finally {
      clearTimeout(t);
    }
    if (attempt === 0) await sleep(retryDelay + Math.random() * 300);
  }
  throw lastErr;
}

/* ---------- كاش متواصل (IndexedDB) — نسخة مرقّمة ---------- */
export const CACHE_VERSION = 'v1';
const DB_NAME = 'quran-garden-cache';
let dbPromise = null;

function openCacheDb() {
  if (typeof indexedDB === 'undefined') return Promise.resolve(null);
  return new Promise((resolve) => {
    try {
      const req = indexedDB.open(DB_NAME, 1);
      req.onupgradeneeded = () => {
        const db = req.result;
        if (!db.objectStoreNames.contains('cache')) db.createObjectStore('cache', { keyPath: 'key' });
      };
      req.onsuccess = () => resolve(req.result);
      req.onerror = () => resolve(null);
      req.onblocked = () => resolve(null);
    } catch (e) {
      resolve(null); // بيروم-مود / بيستريبوت — الكاش المتواصل يتعطل برقي
    }
  });
}
const getDb = () => (dbPromise ??= openCacheDb());

export async function idbGet(key) {
  const db = await getDb();
  if (!db) return undefined;
  return new Promise((resolve) => {
    try {
      const r = db.transaction('cache', 'readonly').objectStore('cache').get(key);
      r.onsuccess = () => resolve(r.result ? r.result.value : undefined);
      r.onerror = () => resolve(undefined);
    } catch (e) {
      resolve(undefined);
    }
  });
}

export async function idbSet(key, value) {
  const db = await getDb();
  if (!db) return false;
  return new Promise((resolve) => {
    try {
      const tx = db.transaction('cache', 'readwrite');
      tx.objectStore('cache').put({ key, value });
      tx.oncomplete = () => resolve(true);
      tx.onerror = () => resolve(false);
      tx.onabort = () => resolve(false);
    } catch (e) {
      resolve(false);
    }
  });
}

const keyOf = (name, ...parts) => [CACHE_VERSION, name, ...parts].join(':');

// تحديث في الخلفية: نجح → نوصله للمتوالين، فشل → الكاش القديم بيقف
function refreshInBackground(key, fn) {
  fn()
    .then((out) => {
      cache.set(key, out);
      idbSet(key, out);
    })
    .catch(() => {});
}

// سورة من النسخة المدمجة (بدون تلاوة صوتية)
function offlineSurah(n) {
  const texts = JUZ30[n];
  if (!texts) return null;
  return {
    number: n,
    name: SURAH_NAMES_FALLBACK[n] || 'سورة ' + n,
    englishName: '',
    numberOfAyahs: texts.length,
    offline: true,
    ayahs: texts.map((text, i) => ({ number: i + 1, numberInSurah: i + 1, text, audio: null })),
  };
}

async function fetchSurah(n, edition) {
  const d = await fetchJson(`${BASE}/surah/${n}/editions/quran-uthmani,${edition}`);
  const data = d.data[0];
  return {
    number: data.number,
    name: data.name,
    englishName: data.englishName,
    numberOfAyahs: data.numberOfAyahs,
    ayahs: data.ayahs.map((a) => ({
      number: a.number,
      numberInSurah: a.numberInSurah,
      text: a.text.replace(/\n$/, ''),
      audio: a.audio,
    })),
  };
}

export async function getSurah(number, edition = 'ar.alafasy') {
  const n = Number(number);
  const key = keyOf('surah', n, edition);
  if (cache.has(key)) return cache.get(key);

  // نسخة محفوظة من قبل؟ نرجّحها فورًا ونحدّثها في الخلفية (SWR)
  const persisted = await idbGet(key);
  if (persisted) {
    cache.set(key, persisted);
    refreshInBackground(key, () => fetchSurah(n, edition));
    return persisted;
  }

  try {
    const out = await fetchSurah(n, edition);
    cache.set(key, out);
    idbSet(key, out);
    return out;
  } catch (e) {
    // بدون إنترنت: جزء عمّ متاح من النسخة المدمجة (نص فقط)
    // ما نتخزنهش في الكاش عشان "إعادة" تجرب النت تاني
    const off = offlineSurah(n);
    if (off) return off;
    throw e;
  }
}

let surahsList = null;
export async function getSurahs() {
  if (surahsList) return surahsList;
  const key = keyOf('surahs');

  const persisted = await idbGet(key);
  if (persisted) {
    surahsList = persisted;
    refreshInBackground(key, async () => {
      const d = await fetchJson(`${BASE}/surah`);
      return d.data.map((s) => ({
        number: s.number,
        name: s.name,
        englishName: s.englishName,
        numberOfAyahs: s.numberOfAyahs,
      }));
    });
    return surahsList;
  }

  try {
    const d = await fetchJson(`${BASE}/surah`);
    surahsList = d.data.map((s) => ({
      number: s.number,
      name: s.name,
      englishName: s.englishName,
      numberOfAyahs: s.numberOfAyahs,
    }));
    idbSet(key, surahsList);
  } catch (e) {
    // بدون إنترنت: قائمة رحلة الحفظ (٥٨–١١٤) من البيانات المدمجة
    const offline = [];
    for (let n = 58; n <= 114; n++) {
      offline.push({
        number: n,
        name: SURAH_NAMES_FALLBACK[n] || 'سورة ' + n,
        englishName: '',
        numberOfAyahs: SURAH_META[n] || (JUZ30[n] || []).length,
      });
    }
    surahsList = offline;
  }
  return surahsList;
}

// الاسم المختصر للسورة (بدون "سورة")
export function shortName(name) {
  return (name || '')
    .replace(/^سُورَةُ\s*/, '')
    .replace(/ُ/g, '')
    .replace(/َ/g, '')
    .replace(/ِ/g, '')
    .replace(/ً/g, '');
}
