import { readdirSync, readFileSync } from 'node:fs';
import { join, resolve } from 'node:path';

import type { Plugin } from 'vite';

const virtualModuleId = 'virtual:lambda-e2e-fixtures';
const resolvedVirtualModuleId = `\0${virtualModuleId}`;

export function e2eFixturesPlugin(): Plugin {
  const fixturesDir = resolve(import.meta.dirname, '../../../web-e2e/fixtures');

  return {
    name: 'lambda-e2e-fixtures',
    resolveId(id) {
      if (id === virtualModuleId) {
        return resolvedVirtualModuleId;
      }

      return undefined;
    },
    load(id) {
      if (id !== resolvedVirtualModuleId) {
        return undefined;
      }

      if (process.env.VITE_E2E !== '1') {
        return 'export const e2eFixtures = {};';
      }

      const files = readdirSync(fixturesDir).filter((file) =>
        file.endsWith('.fountain'),
      );

      const fixtures = Object.fromEntries(
        files.map((file) => {
          const name = file.replace(/\.fountain$/, '');
          const text = readFileSync(join(fixturesDir, file), 'utf8');

          return [name, text];
        }),
      );

      return `export const e2eFixtures = ${JSON.stringify(fixtures)};`;
    },
  };
}
