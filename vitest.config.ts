import { configDefaults, defineConfig } from 'vitest/config';
import path from 'path';

export default defineConfig({
  test: {
    globals: true,
    exclude: [...configDefaults.exclude, 'superpowers/**', '.superpowers/**'],
    environment: 'jsdom',
    setupFiles: ['./src/__tests__/setupTests.ts'],
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'),
    },
  },
});
