import { expect, test } from '@playwright/test';

import { expectFountainText, loadFixture, readFixture } from '../helpers';

test('loads parity-forced-syntax without fountain loss', async ({ page }) => {
  const fixture = readFixture('parity-forced-syntax');

  await loadFixture(page, 'parity-forced-syntax');

  await expectFountainText(page, fixture);
});

test('shows forced-prefix styling for forced syntax lines', async ({
  page,
}) => {
  await loadFixture(page, 'parity-forced-syntax');

  await expect(page.locator('.forced-prefix')).not.toHaveCount(0);
});
