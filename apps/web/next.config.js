const { composePlugins, withNx } = require('@nx/next');
const { readdirSync, readFileSync } = require('node:fs');
const { join } = require('node:path');

const {
  applyWorkspacePackageConditions,
} = require('./src/lib/workspacePackageResolve.cjs');

const packageJson = require('./package.json');
const dependencies = packageJson.dependencies;
const devDependencies = packageJson.devDependencies;
const allDependencies = { ...dependencies, ...devDependencies };

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
  distDir: process.env.LAMBDA_VERIFY_DIST_DIR || '.next',
  eslint: {
    ignoreDuringBuilds: true,
  },
  transpilePackages: Object.keys(allDependencies),
  env: {
    NEXT_PUBLIC_E2E: isE2eEnabled() ? '1' : '',
    NEXT_PUBLIC_E2E_FIXTURES: JSON.stringify(loadE2eFixtures()),
  },
  webpack: (config) => applyWorkspacePackageConditions(config),
};

const plugins = [withNx];

module.exports = composePlugins(...plugins)(nextConfig);
