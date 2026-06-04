/// <reference types='vitest' />
import tailwindcss from '@tailwindcss/vite';
import { defineConfig } from 'vite';

export default defineConfig(() => ({
  root: import.meta.dirname,
  cacheDir: '../../node_modules/.vite/packages/theme',
  plugins: [tailwindcss()],
  build: {
    outDir: './dist',
    emptyOutDir: true,
    cssCodeSplit: true,
    lib: {
      entry: 'src/index.ts',
      name: 'theme',
      formats: ['es'],
      fileName: 'index',
    },
    rollupOptions: {
      output: {
        assetFileNames: 'styles[extname]',
      },
    },
  },
}));
