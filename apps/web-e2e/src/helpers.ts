import { readFileSync } from 'node:fs';
import { join } from 'node:path';

import type { Page } from '@playwright/test';

const projectRoot = join(import.meta.dirname, '..');

export function readFixture(name: string): string {
  return readFileSync(
    join(projectRoot, 'fixtures', `${name}.fountain`),
    'utf8',
  );
}

export function readExpected(name: string): string {
  return readFileSync(
    join(projectRoot, 'expected', `${name}.fountain`),
    'utf8',
  );
}

export async function waitForEditor(page: Page): Promise<void> {
  await page.locator('.ProseMirror').waitFor({ state: 'visible' });
  await page.waitForFunction(() => window.__lambdaE2e?.getFountainText);
}

export async function getFountainText(page: Page): Promise<string> {
  await waitForEditor(page);

  return page.evaluate(() => window.__lambdaE2e!.getFountainText());
}

export async function expectFountainText(
  page: Page,
  expected: string,
): Promise<void> {
  const actual = await getFountainText(page);

  if (actual !== expected) {
    throw new Error(
      `Fountain text mismatch.\n--- expected ---\n${expected}\n--- actual ---\n${actual}`,
    );
  }
}

export async function loadFixture(
  page: Page,
  fixtureName: string,
): Promise<void> {
  await page.goto(`/e2e/load/${fixtureName}`);
  await page.waitForURL('**/script');
  await waitForEditor(page);
}

export async function startNewScript(page: Page): Promise<void> {
  await page.goto('/');
  await page.getByRole('button', { name: 'New script' }).click();
  await page.waitForURL('**/script');
  await waitForEditor(page);
}

export async function clickFileMenuItem(
  page: Page,
  label: string,
): Promise<void> {
  await page.getByRole('button', { name: 'File', exact: true }).click();
  await page
    .getByRole('menuitem')
    .filter({ has: page.getByText(label, { exact: true }) })
    .click();
}

export async function clickEditMenuItem(
  page: Page,
  label: string,
): Promise<void> {
  await page.getByRole('button', { name: 'Edit', exact: true }).click();
  const item = page
    .getByRole('menuitem')
    .filter({ has: page.getByText(label, { exact: true }) });

  await item.waitFor({ state: 'visible' });
  await item.click();
}

export function pressEnter(page: Page): Promise<void> {
  return page.keyboard.press('Enter');
}
