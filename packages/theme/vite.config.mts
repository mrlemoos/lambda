/// <reference types='vitest' />
import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

export default defineConfig(() => ({
  root: import.meta.dirname,
  cacheDir: '../../node_modules/.vite/packages/theme',
  plugins: [tailwindcss(), react()],
  build: {
    outDir: './dist',
    emptyOutDir: true,
    cssCodeSplit: true,
    lib: {
      entry: 'src/index.ts',
      name: 'theme',
      formats: ['es' as const],
      fileName: 'index',
    },
    rollupOptions: {
      external: ['react', 'react-dom', 'react/jsx-runtime', 'next-themes'],
      output: {
        assetFileNames: 'styles[extname]',
      },
    },
  },
  test: {
    name: '@lambda/theme',
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
