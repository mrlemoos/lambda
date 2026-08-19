import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

import { describe, expect, it } from 'vitest';

const packageJsonPath = join(
  dirname(fileURLToPath(import.meta.url)),
  '../package.json',
);

const subpaths = [
  'Button',
  'Input',
  'Label',
  'ModalDialog',
  'LiquidMetalButton',
] as const;

describe('design-system package exports', () => {
  it.each(subpaths)(
    'exposes a %s subpath with source and built conditions',
    (name) => {
      const pkg = JSON.parse(readFileSync(packageJsonPath, 'utf8')) as {
        exports: Record<string, Record<string, string>>;
      };

      const result = pkg.exports[`./${name}`];

      expect(result['@lambda/source']).toBe(`./src/lib/${name}.tsx`);
      expect(result.types).toBe(`./dist/${name}.d.ts`);
      expect(result.import).toBe(`./dist/${name}.js`);
      expect(result.default).toBe(`./dist/${name}.js`);
    },
  );
});
