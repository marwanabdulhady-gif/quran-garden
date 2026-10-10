import { createWorker } from 'tesseract.js';
import fs from 'fs';
import path from 'path';
const base = '/home/user/.qa-tools/pages';
const w = await createWorker('ara', 1, { langPath: '/home/user/.qa-tools/ocr/node_modules/@tesseract.js-data/ara/4.0.0_best_int', gzip: true, cachePath: '/tmp/tcache', logger: () => {} });
await w.setParameters({ preserve_interword_spaces: '1', tessedit_pageseg_mode: '4' });
for (const tag of ['prophet', 'comp']) {
  const outDir = `/home/user/.qa-tools/ocr/out/${tag}`;
  fs.mkdirSync(outDir, { recursive: true });
  const files = fs.readdirSync(`${base}/${tag}`).filter(f => f.endsWith('.png')).sort();
  for (const f of files) {
    const out = path.join(outDir, f.replace('.png', '.txt'));
    if (fs.existsSync(out)) continue;
    const { data } = await w.recognize(path.join(base, tag, f));
    fs.writeFileSync(out, data.text);
    console.log(tag, f, 'conf', Math.round(data.confidence));
  }
}
await w.terminate();
console.log('DONE');
