/// <reference types='vitest' />
import { writeFileSync } from 'node:fs';
import * as path from 'path';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';
import dts from 'vite-plugin-dts';

const componentEntries = [
  'Button',
  'Input',
  'Label',
  'ModalDialog',
  'LiquidMetalButton',
] as const;

export default defineConfig(() => ({
  root: import.meta.dirname,
  cacheDir: '../../node_modules/.vite/packages/design-system',
  plugins: [
    react(),
    dts({
      entryRoot: 'src',
      tsconfigPath: path.join(import.meta.dirname, 'tsconfig.lib.json'),
      afterBuild(emittedFiles) {
        for (const [filePath, content] of emittedFiles) {
          for (const name of componentEntries) {
            const nestedSuffix = `${path.sep}lib${path.sep}${name}.d.ts`;
            if (filePath.endsWith(nestedSuffix)) {
              writeFileSync(
                filePath.slice(0, -nestedSuffix.length) +
                  path.sep +
                  `${name}.d.ts`,
                content.replace(/\n\/\/# sourceMappingURL=.*$/u, ''),
              );
            }
          }
        }
      },
    }),
  ],
  // Uncomment this if you are using workers.
  // worker: {
  //  plugins: [],
  // },
  // Configuration for building your library.
  // See: https://vite.dev/guide/build.html#library-mode
  build: {
    outDir: './dist',
    emptyOutDir: true,
    reportCompressedSize: true,
    commonjsOptions: {
      transformMixedEsModules: true,
    },
    lib: {
      entry: {
        index: 'src/index.ts',
        Button: 'src/lib/Button.tsx',
        Input: 'src/lib/Input.tsx',
        Label: 'src/lib/Label.tsx',
        ModalDialog: 'src/lib/ModalDialog.tsx',
        LiquidMetalButton: 'src/lib/LiquidMetalButton.tsx',
      },
      name: '@lambda/design-system',
      fileName: (_format, entryName) => `${entryName}.js`,
      formats: ['es' as const],
    },
    rollupOptions: {
      // External packages that should not be bundled into your library.
      external: [
        'react',
        'react-dom',
        'react/jsx-runtime',
        /^@base-ui\//,
        /^@lambda\//,
      ],
    },
  },
  test: {
    name: '@lambda/design-system',
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
