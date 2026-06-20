import { test } from '@playwright/test';

import { expectFountainText, loadFixture, readFixture } from '../helpers';

test('loads parity-structural without fountain loss', async ({ page }) => {
  const fixture = readFixture('parity-structural');

  await loadFixture(page, 'parity-structural');

  await expectFountainText(page, fixture);
});
