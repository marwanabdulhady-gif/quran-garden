import { describe, it, expect } from 'vitest';
import { readFileSync, existsSync } from 'node:fs';
import { resolve } from 'node:path';

const root = resolve(import.meta.dirname, '..');
const config = readFileSync(resolve(root, 'vite.config.js'), 'utf-8');

// موقع واحد: الغابة بحدائقها الأربع على «/»، ورحلة القرآن داخل حديقة القرآن
describe('one site, one PWA', () => {
  it('builds one page: the forest at /, with the Quran journey inside the Quran garden', () => {
    expect(config).toContain("main: resolve(root, 'index.html')");
    expect(config).not.toContain('quran.html');
    expect(readFileSync(resolve(root, 'index.html'), 'utf-8')).toContain('/src/salman/main.jsx');
  });

  it('sends the old /quran.html address to the Quran garden and keeps restore links', () => {
    const html = readFileSync(resolve(root, 'public/quran.html'), 'utf-8');
    expect(html).toContain('#/quran');
    expect(html).toContain('#garden=');
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
