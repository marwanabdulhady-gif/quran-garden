import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    include: ['tests/**/*.test.{mjs,jsx}'],
    environment: 'node',
    testTimeout: 20000,
    hookTimeout: 20000,
    // كل ملف اختبارات بيبقي في بيئة معزولة — مهم عشان الـ stubs (localStorage/fetch)
    isolate: true,
  },
});
