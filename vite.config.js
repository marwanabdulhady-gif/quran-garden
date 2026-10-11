import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

import { resolve } from 'node:path';
import { readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('.', import.meta.url));

// صفحة سلمان تستخدم manifest خاص بها (تبدأ من salman.html، لا من حديقة القرآن).
// يُعدَّل الملف المبني بعد كل الحقن الذي يضيفه PWA plugin.
const salmanManifest = {
  name: 'salman-manifest-link',
  apply: 'build',
  writeBundle(options) {
    const dir = options.dir ?? resolve(root, 'dist');
    const file = resolve(dir, 'salman.html');
    const html = readFileSync(file, 'utf-8');
    const next = html.replace(
      /<link rel="manifest" href="[^"]*">/,
      '<link rel="manifest" href="/salman.webmanifest">',
    );
    if (next === html) throw new Error('salman-manifest-link: manifest tag not found in salman.html');
    writeFileSync(file, next, 'utf-8');
  },
};

export default defineConfig({
  // نقطتا دخول: التطبيق الأصلي (index.html) وحديقة سلمان (salman.html) — كل واحد مستقل
  build: {
    rollupOptions: {
      input: {
        main: resolve(root, 'index.html'),
        salman: resolve(root, 'salman.html'),
      },
    },
  },
  plugins: [
    react(),
    salmanManifest,
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.svg'],
      manifest: {
        id: '/',
        name: 'حديقة القرآن — رحلة أبطال القرآن',
        short_name: 'حديقة القرآن',
        description:
          'رحلة تفاعلية للأطفال للاستماع إلى القرآن والتدرّب على الحفظ، مع التكرار والمراجعة والأوسمة — وتشتغل حتى بدون إنترنت.',
        lang: 'ar',
        dir: 'rtl',
        theme_color: '#10b981',
        background_color: '#ecfdf5',
        display: 'standalone',
        orientation: 'portrait',
        start_url: '/',
        scope: '/',
        icons: [
          { src: 'pwa-192.png', sizes: '192x192', type: 'image/png' },
          { src: 'pwa-512.png', sizes: '512x512', type: 'image/png' },
          { src: 'pwa-maskable-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
        ],
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,svg,png,jpg,webp,woff2,mp3,webmanifest}'],
        navigateFallback: '/index.html',
        runtimeCaching: [
          {
            // استجابات واجهة القرآن (نص + روابط تلاوة) — يبقى آخر 60 استجابة شهرة كاملة
            urlPattern: /^https:\/\/api\.alquran\.cloud\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'alquran-json',
              expiration: { maxEntries: 60, maxAgeSeconds: 60 * 60 * 24 * 30, purgeOnQuotaError: true },
              cacheableResponse: { statuses: [0, 200] },
            },
          },
          // ملفات التلاوة (cdn.islamic.network) مقصود إنها ما تعديش على الـ SW:
          // السيرفر ما بيبعتش CORS، فالاستجابة بتبقى opaque والـ SW ما يقدرش يرد على
          // طلبات Range اللي عنصر <audio> بيبعتها — Safari والموبايل بيرفضوا التشغيل.
        ],
        cleanupOutdatedCaches: true,
      },
    }),
  ],
  server: {
    host: true,
    port: 5173,
    strictPort: false,
    allowedHosts: true,
  },
  preview: {
    host: true,
    port: 5173,
    allowedHosts: true,
  },
});
