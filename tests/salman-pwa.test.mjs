import { describe, it, expect } from 'vitest';
import { readFileSync, existsSync } from 'node:fs';
import { resolve } from 'node:path';

const root = resolve(import.meta.dirname, '..');
const config = readFileSync(resolve(root, 'vite.config.js'), 'utf-8');

// موقع واحد: الغابة (الحدائق الأربع) على «/» ورحلة القرآن الكاملة على «/quran.html»
describe('one site, one PWA', () => {
  it('builds the forest at / and the Quran journey at /quran.html', () => {
    expect(config).toContain("main: resolve(root, 'index.html')");
    expect(config).toContain("quran: resolve(root, 'quran.html')");
    expect(readFileSync(resolve(root, 'index.html'), 'utf-8')).toContain('/src/salman/main.jsx');
    expect(readFileSync(resolve(root, 'quran.html'), 'utf-8')).toContain('/src/main.jsx');
  });

  it('keeps the old /salman.html address working as a redirect to /', () => {
    const html = readFileSync(resolve(root, 'public/salman.html'), 'utf-8');
    expect(html).toContain("location.replace('/')");
  });

  it('has one manifest that starts at / with Salman icons that exist', () => {
    expect(config).toContain("start_url: '/'");
    expect(config).toContain('غابة سلمان');
    const icons = [...config.matchAll(/src: '(salman\/icons\/[^']+)'/g)].map((m) => m[1]);
    expect(icons.length).toBe(3);
    for (const icon of icons) expect(existsSync(resolve(root, 'public', icon)), icon).toBe(true);
  });

  it('precaches mp3 and webmanifest so clips and the manifest work offline', () => {
    expect(config).toMatch(/globPatterns:.*mp3/);
    expect(config).toMatch(/globPatterns:.*webmanifest/);
  });
});
