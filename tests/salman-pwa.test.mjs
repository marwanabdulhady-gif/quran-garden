import { describe, it, expect } from 'vitest';
import { readFileSync, existsSync } from 'node:fs';
import { resolve } from 'node:path';

const root = resolve(import.meta.dirname, '..');
const manifest = JSON.parse(readFileSync(resolve(root, 'public/salman.webmanifest'), 'utf-8'));

describe('Salman PWA manifest', () => {
  it('starts at salman.html, not at the Quran app', () => {
    expect(manifest.start_url).toBe('/salman.html');
    expect(manifest.id).toBe('/salman.html');
    expect(manifest.name).toContain('سلمان');
  });

  it('is RTL Arabic and standalone', () => {
    expect(manifest.lang).toBe('ar');
    expect(manifest.dir).toBe('rtl');
    expect(manifest.display).toBe('standalone');
  });

  it('references icons that exist in public/', () => {
    for (const icon of manifest.icons) {
      expect(existsSync(resolve(root, 'public', icon.src)), icon.src).toBe(true);
    }
    expect(manifest.icons.some((i) => i.purpose === 'maskable')).toBe(true);
  });
});

describe('Salman offline precache wiring', () => {
  const config = readFileSync(resolve(root, 'vite.config.js'), 'utf-8');

  it('precaches mp3 and webmanifest so Salman clips and manifest work offline', () => {
    expect(config).toMatch(/globPatterns:.*mp3/);
    expect(config).toMatch(/globPatterns:.*webmanifest/);
  });

  it('rewrites the manifest link in salman.html to the Salman manifest', () => {
    expect(config).toContain('/salman.webmanifest');
    expect(config).toContain('salman-manifest-link');
  });
});
