import { test } from '@playwright/test';

import { expectFountainText, loadFixture, readFixture } from '../helpers';

test('loads parity-scene-elements without fountain loss', async ({ page }) => {
  const fixture = readFixture('parity-scene-elements');

  await loadFixture(page, 'parity-scene-elements');

  await expectFountainText(page, fixture);
});
