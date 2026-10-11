import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { execSync } from 'node:child_process';

const root = fileURLToPath(new URL('.', import.meta.url));

// رقم الإصدار الظاهر في الغابة: آخر commit (من Vercel أو من git محليًا)، لمعرفة هل الجهاز على آخر نسخة
function appVersion() {
  if (process.env.VERCEL_GIT_COMMIT_SHA) return process.env.VERCEL_GIT_COMMIT_SHA.slice(0, 7);
  try {
    return execSync('git rev-parse --short HEAD', { stdio: ['ignore', 'pipe', 'ignore'] })
      .toString()
      .trim();
  } catch {
    return 'dev';
  }
}

export default defineConfig({
  define: {
    __APP_VERSION__: JSON.stringify(appVersion()),
    __APP_BUILT__: JSON.stringify(new Date().toISOString().slice(0, 10)),
  },
  // موقع واحد: الغابة بحدائقها الأربع على «/». رحلة القرآن داخل حديقة القرآن (#/quran)
  build: {
    rollupOptions: {
      input: {
        main: resolve(root, 'index.html'),
      },
    },
  },
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.svg'],
      manifest: {
        id: '/',
        name: 'غابة سلمان — الحدائق الأربع',
        short_name: 'غابة سلمان',
        description:
          'غابة من أربع حدائق للأطفال: القرآن والحروف والأرقام والإنجليزية، بقصص وألعاب ونجوم — وتشتغل حتى بدون إنترنت.',
        lang: 'ar',
        dir: 'rtl',
        theme_color: '#10b981',
        background_color: '#ecfdf5',
        display: 'standalone',
        orientation: 'portrait',
        start_url: '/',
        scope: '/',
        icons: [
          { src: 'salman/icons/icon-192.png', sizes: '192x192', type: 'image/png' },
          { src: 'salman/icons/icon-512.png', sizes: '512x512', type: 'image/png' },
          { src: 'salman/icons/icon-maskable-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
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
