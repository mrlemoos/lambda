/// <reference types='vitest' />
import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

import { e2eFixturesPlugin } from './src/e2e/e2eFixturesPlugin.js';

export default defineConfig(() => ({
  root: import.meta.dirname,
  cacheDir: '../../node_modules/.vite/apps/web',
  define: {
    'import.meta.env.VITE_E2E': JSON.stringify(process.env.VITE_E2E ?? ''),
  },
  server: {
    port: 4300,
    host: 'localhost',
    fs: {
      allow: ['../..'],
    },
  },
  preview: {
    port: 4300,
    host: 'localhost',
  },
  plugins: [tailwindcss(), react(), e2eFixturesPlugin()],
  resolve: {
    conditions: ['@org/source', 'import', 'module', 'browser', 'default'],
  },
  build: {
    outDir: './dist',
    emptyOutDir: true,
    reportCompressedSize: true,
    commonjsOptions: {
      transformMixedEsModules: true,
    },
  },
  test: {
    name: '@lambda/web',
    watch: false,
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./src/test-setup.ts'],
    include: ['{src,tests}/**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}'],
    reporters: ['default'],
    coverage: {
      reportsDirectory: './test-output/vitest/coverage',
      provider: 'v8' as const,
    },
  },
}));
