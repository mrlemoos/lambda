const { composePlugins, withNx } = require('@nx/next');
const { readdirSync, readFileSync } = require('node:fs');
const { join } = require('node:path');

function isE2eEnabled() {
  return process.env.NEXT_PUBLIC_E2E === '1' || process.env.VITE_E2E === '1';
}

function loadE2eFixtures() {
  if (!isE2eEnabled()) {
    return {};
  }

  const fixturesDir = join(__dirname, '../web-e2e/fixtures');
  const files = readdirSync(fixturesDir).filter((file) =>
    file.endsWith('.fountain'),
  );

  return Object.fromEntries(
    files.map((file) => {
      const name = file.replace(/\.fountain$/, '');
      const text = readFileSync(join(fixturesDir, file), 'utf8');

      return [name, text];
    }),
  );
}

/**
 * @type {import('@nx/next/plugins/with-nx').WithNxOptions}
 */
const nextConfig = {
  nx: {},
  eslint: {
    ignoreDuringBuilds: true,
  },
  transpilePackages: [
    '@lambda/auth',
    '@lambda/auth-forms',
    '@lambda/form',
    '@lambda/design-system',
    '@lambda/theme',
    '@lambda/lambda-api',
    '@lambda/script-session',
    '@lambda/editor-zoom',
    '@lambda/welcome',
    '@lambda/script-workspace',
    '@lambda/preview-workspace',
    '@lambda/command-palette',
    '@lambda/application-menu',
    '@lambda/editor',
    '@lambda/print',
    '@lambda/fountain',
  ],
  env: {
    NEXT_PUBLIC_E2E: isE2eEnabled() ? '1' : '',
    NEXT_PUBLIC_E2E_FIXTURES: JSON.stringify(loadE2eFixtures()),
  },
};

const plugins = [withNx];

module.exports = composePlugins(...plugins)(nextConfig);
