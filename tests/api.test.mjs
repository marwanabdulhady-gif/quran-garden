// اختبارات تعضيد عميل الـ API (P4-29): مهلة + إعادة محاولة + كاش IndexedDB مُرقّم
import { describe, it, expect, vi } from 'vitest';

// ---------- fake IndexedDB خفيف (مطابق لواجهة الـ API اللي بنستخدمها) ----------
function fakeIDB() {
  const data = new Map();
  const api = {
    _data: data,
    open: () => {
      const req = {};
      queueMicrotask(() => {
        req.result = {
          objectStoreNames: { contains: () => true },
          transaction: () => {
            const tx = { oncomplete: null, onerror: null, onabort: null };
            tx.objectStore = () => store; // نفس الكائن (مش نسخة) عشان الـ callbacks توصل
            const store = {
              // IndexedDB الحقيقي بيخزّن الركن كامل { key, value } (keyPath: key)
              get: (k) => {
                const r = {};
                queueMicrotask(() => {
                  r.result = data.has(k) ? data.get(k) : undefined;
                  r.onsuccess?.();
                });
                return r;
              },
              put: (record) => {
                data.set(record.key, record);
                queueMicrotask(() => tx.oncomplete?.());
              },
            };
            return tx;
          },
        };
        req.onsuccess?.();
      });
      return req;
    },
  };
  return api;
}

const FLUSH = () => new Promise((r) => setTimeout(r, 0));

// الكاش الوهمي لازم يتجهز قبل أول استيراد لـ api.js
const db = fakeIDB();
globalThis.indexedDB = db;
const A = await import('../src/api.js');

// ============================================================
describe('fetchJson: مهلة + إعادة محاولة', () => {
  it('نجاح أول مرة → يرجع JSON ويستهلك استدعاء واحد', async () => {
    globalThis.fetch = vi.fn(async () => ({ ok: true, status: 200, json: async () => ({ hello: 1 }) }));
    const out = await A.fetchJson('https://x.test/a');
    expect(out).toEqual({ hello: 1 });
    expect(globalThis.fetch.mock.calls.length).toBe(1);
  });

  it('4xx → يرمي فورًا بدون إعادة محاولة', async () => {
    globalThis.fetch = vi.fn(async () => ({ ok: false, status: 404, json: async () => ({}) }));
    await expect(A.fetchJson('https://x.test/404')).rejects.toThrow('HTTP 404');
    expect(globalThis.fetch.mock.calls.length).toBe(1);
  });

  it('5xx → يعيد مرة واحدة بعدين يرمي', async () => {
    globalThis.fetch = vi.fn(async () => ({ ok: false, status: 503, json: async () => ({}) }));
    await expect(A.fetchJson('https://x.test/503', { retryDelay: 10 })).rejects.toThrow('HTTP 503');
    expect(globalThis.fetch.mock.calls.length).toBe(2);
  });

  it('خطأ شبكة → يعيد مرة واحدة بعدين يرمي', async () => {
    globalThis.fetch = vi.fn(async () => {
      throw new Error('ECONNRESET');
    });
    await expect(A.fetchJson('https://x.test/down', { retryDelay: 10 })).rejects.toThrow('ECONNRESET');
    expect(globalThis.fetch.mock.calls.length).toBe(2);
  });

  it('تعافى عند المحاولة التانية (500 ثم 200)', async () => {
    let n = 0;
    globalThis.fetch = vi.fn(async () => {
      n++;
      if (n === 1) return { ok: false, status: 500, json: async () => ({}) };
      return { ok: true, status: 200, json: async () => ({ recovered: true }) };
    });
    const out = await A.fetchJson('https://x.test/flaky', { retryDelay: 10 });
    expect(out).toEqual({ recovered: true });
    expect(globalThis.fetch.mock.calls.length).toBe(2);
  });

  it('مهلة: طلب بطيء يتقطع (abort) ويُعاد ثم يرمي', async () => {
    globalThis.fetch = vi.fn(
      (url, { signal }) =>
        new Promise((resolve, reject) => {
          const t = setTimeout(() => resolve({ ok: true, status: 200, json: async () => ({ late: true }) }), 400);
          signal.addEventListener('abort', () => {
            clearTimeout(t);
            reject(new Error('aborted'));
          });
        })
    );
    const t0 = Date.now();
    await expect(A.fetchJson('https://x.test/slow', { timeout: 30, retryDelay: 10 })).rejects.toThrow('aborted');
    expect(globalThis.fetch.mock.calls.length).toBe(2);
    expect(Date.now() - t0).toBeLessThan(400, 'تقطع بالمهلة مش بانتظار النهاية');
  });
});

// ============================================================
describe('كاش IndexedDB المتواصل (مُرقّم) + SWR', () => {
  const netSurah = (n, tag) => ({
    number: n,
    name: 'سورة اختبار',
    englishName: 'Test',
    numberOfAyahs: 3,
    ayahs: [1, 2, 3].map((i) => ({
      number: i,
      numberInSurah: i,
      text: 'آية ' + i,
      audio: `https://cdn.test/${n}/${i}${tag ? '?' + tag : ''}`,
    })),
  });

  it('أول طلب بالنت → يتخزن في الكاش بمفتاح مُرقّم', async () => {
    globalThis.fetch = vi.fn(async () => ({
      ok: true,
      status: 200,
      json: async () => ({ data: [netSurah(101, 'one')] }),
    }));
    const out = await A.getSurah(101, 'ar.alafasy');
    expect(out.numberOfAyahs).toBe(3);
    expect(out.offline).toBeUndefined();
    await FLUSH();
    expect(db._data.has('v1:surah:101:ar.alafasy')).toBe(true, 'مفتاح الكاش مُرقّم');
  });

  it('إعادة فتح التطبيق (موديول جديد) + النت مقطوع → يرجع النسخة المحفوظة مش الأوفلاين', async () => {
    globalThis.fetch = vi.fn(async () => {
      throw new Error('offline');
    });
    const Fresh = await import('../src/api.js' + '?fresh=' + Date.now());
    const out = await Fresh.getSurah(101, 'ar.alafasy');
    expect(out.offline, 'رجع من الكاش المتواصل مش من الجزء المدمج').toBeUndefined();
    expect(out.ayahs[0].audio).toContain('?one');
    // النص المدمج (أوفلاين) ما طلعش
    expect(out.ayahs[0].text).toBe('آية 1');
  });

  it('SWR: محفوظة + النت شغال → يرجح المحفوظ فورًا ويحدّث في الخلفية', async () => {
    let n = 0;
    globalThis.fetch = vi.fn(
      () =>
        new Promise((resolve) => {
          n++;
          setTimeout(
            () => resolve({ ok: true, status: 200, json: async () => ({ data: [netSurah(101, 'refreshed')] }) }),
            n === 1 ? 120 : 10
          );
        })
    );
    const Fresh = await import('../src/api.js' + '?fresh2=' + Date.now());
    const t0 = Date.now();
    const out = await Fresh.getSurah(101, 'ar.alafasy');
    expect(Date.now() - t0).toBeLessThan(100, 'رجع المحفوظ فورًا (ما انتظرش النت)');
    expect(out.ayahs[0].audio).toContain('?one');
    await new Promise((r) => setTimeout(r, 250));
    await FLUSH();
    const saved = db._data.get('v1:surah:101:ar.alafasy');
    expect(saved.value.ayahs[0].audio).toContain('?refreshed', 'التحديث في الخلفية وصل للكاش');
  });

  it('قائمة السور: محفوظة تترجع فورا + أوفلاين 57 سورة لو الكاش والنت فاضيين', async () => {
    // نت شغال: كاش القائمة
    globalThis.fetch = vi.fn(async () => ({
      ok: true,
      status: 200,
      json: async () => ({
        data: [78, 79, 80].map((n) => ({ number: n, name: 'س', englishName: '', numberOfAyahs: 10 })),
      }),
    }));
    const Fresh = await import('../src/api.js' + '?fresh3=' + Date.now());
    const list = await Fresh.getSurahs();
    expect(list).toHaveLength(3, 'القائمة من النت اتخزنت');
    await FLUSH();
    expect(db._data.has('v1:surahs')).toBe(true);

    // إعادة فتح + النت مقطوع → ترجع المحفوظة (3) مش الأوفلاين (57)
    globalThis.fetch = vi.fn(async () => {
      throw new Error('offline');
    });
    const Fresh2 = await import('../src/api.js' + '?fresh4=' + Date.now());
    const list2 = await Fresh2.getSurahs();
    expect(list2).toHaveLength(3, 'قائمة محفوظة من الكاش المتواصل');
  });
});
