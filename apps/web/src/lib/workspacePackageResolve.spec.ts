import { describe, expect, it } from 'vitest';

import { applyWorkspacePackageConditions } from './workspacePackageResolve.cjs';

describe('applyWorkspacePackageConditions', () => {
  it('prefers the workspace source export over package dist', () => {
    const config = { resolve: {} };

    const result = applyWorkspacePackageConditions(config);

    expect(result.resolve.conditionNames[0]).toBe('@lambda/source');
    expect(result.resolve.conditionNames).toContain('...');
  });

  it('maps .js specifiers to TypeScript source files', () => {
    const config = { resolve: {} };

    const result = applyWorkspacePackageConditions(config);

    expect(result.resolve.extensionAlias['.js']).toEqual([
      '.ts',
      '.tsx',
      '.js',
    ]);
  });
});
