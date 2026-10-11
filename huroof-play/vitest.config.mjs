import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    include: ['tests/**/*.test.{js,mjs,jsx}'],
    environment: 'happy-dom',
    testTimeout: 20000,
    isolate: true,
  },
});
