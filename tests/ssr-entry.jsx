// مدخل اختبار الدخان — يُبنى بـ esbuild (لا يُشغَّل في vite)
async function main() {
  const store = {};
  globalThis.localStorage = {
    getItem: (k) => (k in store ? store[k] : null),
    setItem: (k, v) => {
      store[k] = String(v);
    },
    removeItem: (k) => delete store[k],
  };
  globalThis.location = { origin: 'http://x', pathname: '/', href: 'http://x/' };
  globalThis.history = { replaceState: () => {} };
  globalThis.navigator = {};
  globalThis.fetch = () => Promise.reject(new Error('offline smoke'));
  globalThis.Audio = class {
    constructor() {
      this.playbackRate = 1;
    }
    play() {
      return Promise.reject(new Error('no audio in ssr'));
    }
    pause() {}
  };
  globalThis.window = globalThis;

  const { default: React } = await import('react');
  const { renderToString } = await import('react-dom/server');
  const { default: Home } = await import('../src/Home.jsx');
  const { default: Garden } = await import('../src/Garden.jsx');
  const { default: Bridge } = await import('../src/Bridge.jsx');
  const { default: Words } = await import('../src/Words.jsx');
  const { default: JourneyMap } = await import('../src/JourneyMap.jsx');
  const { default: Listening, ListenReview } = await import('../src/Listening.jsx');
  const { default: Daily } = await import('../src/Daily.jsx');
  const { default: Settings } = await import('../src/Settings.jsx');
  const { default: Badges } = await import('../src/Badges.jsx');
  const { default: RestoreDialog } = await import('../src/RestoreDialog.jsx');
  const { GATES } = await import('../src/data.js');
  const { defaultChild } = await import('../src/store.js');

  let failed = 0;
  const check = (name, html, mustContain) => {
    const ok = html && html.length > 100 && mustContain.every((m) => html.includes(m));
    if (ok) console.log('ok  -', name, `(${html.length}b)`);
    else {
      console.error('FAIL:', name, 'missing:', mustContain.filter((m) => !(html || '').includes(m)).join(' | '));
      console.error('HTML:', (html || '').slice(0, 1200));
      failed++;
    }
  };

  const go = () => {};

  check('home', renderToString(React.createElement(Home, { go })), ['حديقة القرآن', 'انطلق']);
  check('garden', renderToString(React.createElement(Garden, { go })), ['جسر المعاني', '🏅']);
  check('bridge', renderToString(React.createElement(Bridge, { go })), ['كل كلمة… اكتشاف جديد', 'الأوسمة']);
  check('words', renderToString(React.createElement(Words, { go })), ['كلماتي من القرآن', 'سُبَاتًا']);
  check('journey', renderToString(React.createElement(JourneyMap, { go })), ['رحلة حفظ القرآن', 'سورة الملك']);
  check('gate-list', renderToString(React.createElement(Listening, { gateId: 'tabarak', go })), ['ادخل البوابة']);
  check('player', renderToString(React.createElement(Listening, { gateId: 'tabarak', surahNum: 78, go })), [
    'سورة النبأ',
  ]);
  check('listen-review', renderToString(React.createElement(ListenReview, { gate: GATES[0], go })), ['مراجعة بالسماع']);
  check('daily', renderToString(React.createElement(Daily, { go })), ['آية جديدة كل يوم']);
  check('settings', renderToString(React.createElement(Settings, { go })), ['إعدادات الرحلة', 'مفتاح حديقة أسرتك']);
  check('badges', renderToString(React.createElement(Badges, { go })), [
    'جدار الأوسمة',
    'بداية جميلة',
    'وسام جسر المعاني',
    'اكتشف معنى أول كلمة',
  ]);

  // مودال الاسترجاع: طفل متعارض (سلمان عنده تقدم هنا وفي الرابط)
  const KEY = 'quran-garden-family-v1';
  const base = defaultChild('سلمان');
  const local = {
    familyKey: 'local-key',
    version: 1,
    children: [
      { ...base, id: 'cA', stars: 5, listening: { 78: { heard: 3, completed: false } } },
      { ...defaultChild('سلمى'), id: 'cS', stars: 1 },
    ],
    activeChildId: 'cA',
    updatedAt: Date.now(),
  };
  store[KEY] = JSON.stringify(local);
  const S = await import('../src/store.js');
  S.setState(local); // مزامنة المتجر مع "الجهاز"
  const family = {
    familyKey: 'link-key',
    version: 1,
    children: [
      {
        ...base,
        id: 'cA',
        stars: 9,
        badges: [{ id: 'start', at: 123 }],
        listening: { 79: { heard: 2, completed: false } },
      },
      { ...defaultChild('نورة'), id: 'cN' },
    ],
    activeChildId: 'cA',
  };
  const dialogHtml = renderToString(
    React.createElement(RestoreDialog, { family, onClose: () => {}, onApplied: () => {} })
  );
  check('restore-dialog', dialogHtml, [
    'يوجد تقدم مختلف',
    'احتفظ بهذا الجهاز',
    'خذ من الرابط',
    'ادمج الاثنين',
    'نورة',
    'سلمى',
  ]);

  console.log(failed ? `--- SSR FAILED (${failed}) ---` : '--- SSR ALL PASSED (12) ---');
  process.exit(failed ? 1 : 0);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
