import { resolve } from 'node:path';

import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import { defineConfig, externalizeDepsPlugin } from 'electron-vite';

const workspaceRoot = resolve(__dirname, '../..');

export default defineConfig({
  main: {
    plugins: [externalizeDepsPlugin()],
  },
  preload: {
    plugins: [externalizeDepsPlugin()],
  },
  renderer: {
    resolve: {
      alias: {
        '@renderer': resolve(__dirname, 'src/renderer'),
        '@lambda/editor/styles.css': resolve(
          workspaceRoot,
          'packages/editor/src/lib/styles.css',
        ),
        '@lambda/editor': resolve(
          workspaceRoot,
          'packages/editor/src/index.ts',
        ),
        '@lambda/fountain': resolve(
          workspaceRoot,
          'packages/fountain/src/index.ts',
        ),
      },
      conditions: ['@org/source', 'import', 'module', 'browser', 'default'],
    },
    optimizeDeps: {
      exclude: ['@lambda/editor', '@lambda/fountain'],
    },
    server: {
      port: 5173,
      strictPort: true,
    },
    plugins: [react(), tailwindcss()],
  },
});
