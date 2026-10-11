// اختبار دخان: يرسم كل الشاشات من السيرفر (بدون متصفح) ويتأكد إنها بتتعمل من غير ما تقع
// وإن المحتوى العربي الأساسي موجود. الاستخدام: npm run test:smoke
import { createServer } from 'vite';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';

const server = await createServer({
  root: process.cwd(),
  logLevel: 'error',
  appType: 'custom',
  server: { middlewareMode: true, hmr: false },
});

let failures = 0;
const check = (name, html, mustContain) => {
  const ok = typeof html === 'string' && html.length > 200 && mustContain.every((s) => html.includes(s));
  console.log(`${ok ? '✔' : '✘'} ${name} (${html?.length ?? 0} chars)`);
  if (!ok) failures += 1;
};

try {
  const { default: Welcome } = await server.ssrLoadModule('/src/components/Welcome.jsx');
  const { default: LevelMap } = await server.ssrLoadModule('/src/components/LevelMap.jsx');
  const { default: Play } = await server.ssrLoadModule('/src/components/Play.jsx');
  const { LEVEL_DATA } = await server.ssrLoadModule('/src/data/index.js');
  const { createLevelState } = await server.ssrLoadModule('/src/game/logic.js');

  const render = (el) => renderToStaticMarkup(el);

  check('Welcome', render(React.createElement(Welcome, { onStart: () => {} })), [
    'مغامرة الحروف',
    'ما اسم البطل أو البطلة؟',
    'هيا نلعب',
  ]);

  check(
    'LevelMap (start)',
    render(
      React.createElement(LevelMap, {
        playerName: 'ليلى',
        completed: {},
        results: {},
        onPlay: () => {},
        onBack: () => {},
      })
    ),
    ['خريطة المستويات', 'غابة الأصدقاء']
  );

  check(
    'LevelMap (all done)',
    render(
      React.createElement(LevelMap, {
        playerName: 'ليلى',
        completed: Object.fromEntries(LEVEL_DATA.map((l) => [l.id, true])),
        results: Object.fromEntries(LEVEL_DATA.map((l) => [l.id, { stars: 4 }])),
        onPlay: () => {},
        onBack: () => {},
      })
    ),
    ['قمة النجوم', '⭐ 28']
  );

  for (const level of LEVEL_DATA) {
    // Play بيبني حالته داخليًا؛ الـ SSR بيرسم الحالة الابتدائية
    check(
      `Play — المستوى ${level.id} (${level.title})`,
      render(React.createElement(Play, { level, onExit: () => {} })),
      [level.title, ...level.pairs.map((p) => p.word)]
    );
  }

  // تأكيد إن الحالة الابتدائية لكل مستوى صالحة
  LEVEL_DATA.forEach((level) => {
    const s = createLevelState(level, () => 0.3);
    if (s.letters.length !== 4 || s.targets.length !== 4 || s.complete) {
      console.log(`✘ حالة المستوى ${level.id} غير صالحة`);
      failures += 1;
    }
  });
  console.log('✔ حالة كل المستويات الابتدائية صالحة');
} finally {
  await server.close();
}

if (failures > 0) {
  console.error(`\n${failures} فشل في اختبار الدخان`);
  process.exit(1);
}
console.log('\nكل شاشات الدخان بتتعمل بنجاح');
