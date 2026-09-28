// اختبار دخان (SSR): كل الشاشات لازم تورّد HTML من غير ما تنفجر
//   npm run test:ssr
// نبني باندول esbuild (cjs) ونشغّله في node مع ستوبات للمتصفح.

import esbuild from 'esbuild';
import { execSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const entry = path.join(root, 'tests', 'ssr-entry.jsx');
const out = path.join(root, 'node_modules', '.ssr-smoke-bundle.cjs');

await esbuild.build({
  entryPoints: [entry],
  bundle: true,
  platform: 'node',
  format: 'cjs',
  outfile: out,
  loader: { '.css': 'empty' },
  logLevel: 'silent',
  absWorkingDir: root,
});

execSync(`node "${out}"`, { stdio: 'inherit', cwd: root });
