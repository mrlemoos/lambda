import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

import { describe, expect, it } from 'vitest';

describe('design-system vite lib entries', () => {
  it('maps each package subpath to a flat JS file', () => {
    const config = readFileSync(
      join(dirname(fileURLToPath(import.meta.url)), '../vite.config.mts'),
      'utf8',
    );

    const result = config;

    expect(result).toContain("index: 'src/index.ts'");
    expect(result).toContain("Button: 'src/lib/Button.tsx'");
    expect(result).toContain("Input: 'src/lib/Input.tsx'");
    expect(result).toContain("Label: 'src/lib/Label.tsx'");
    expect(result).toContain("ModalDialog: 'src/lib/ModalDialog.tsx'");
    expect(result).toContain(
      "LiquidMetalButton: 'src/lib/LiquidMetalButton.tsx'",
    );
    expect(result).toMatch(
      /fileName: \(_format, entryName\) => `\$\{entryName\}\.js`/,
    );
  });
});
