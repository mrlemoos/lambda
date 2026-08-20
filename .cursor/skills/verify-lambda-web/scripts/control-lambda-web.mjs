#!/usr/bin/env node
import { spawn } from 'node:child_process';
import {
  existsSync,
  mkdirSync,
  openSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium } from 'playwright';

const skillRoot = join(dirname(fileURLToPath(import.meta.url)), '..');
const workspaceRoot = join(skillRoot, '../../..');
const webRoot = join(workspaceRoot, 'apps/web');

const runId = process.env.LAMBDA_VERIFY_RUN_ID ?? 'default';
const runDir = process.env.LAMBDA_VERIFY_DIR ?? `/tmp/lambda-verify-${runId}`;
const evidenceDir = join(runDir, 'evidence');
const port = Number(process.env.LAMBDA_VERIFY_PORT ?? '4319');
const origin = `http://127.0.0.1:${port}`;
const pidPath = join(runDir, 'server.pid');
const originPath = join(runDir, 'origin.txt');
const logPath = join(runDir, 'server.log');

function ensureRunDir() {
  mkdirSync(runDir, { recursive: true });
  mkdirSync(evidenceDir, { recursive: true });
}

function readPid() {
  if (!existsSync(pidPath)) {
    return null;
  }

  const pid = Number(readFileSync(pidPath, 'utf8').trim());

  return Number.isInteger(pid) ? pid : null;
}

function pidAlive(pid) {
  try {
    process.kill(pid, 0);
    return true;
  } catch {
    return false;
  }
}

async function waitForOrigin(timeoutMs = 120_000) {
  const started = Date.now();

  while (Date.now() - started < timeoutMs) {
    try {
      const res = await fetch(origin, { redirect: 'manual' });

      if (res.ok || (res.status >= 300 && res.status < 400)) {
        return;
      }
    } catch {
      // not ready
    }

    await new Promise((resolve) => setTimeout(resolve, 500));
  }

  throw new Error(
    `Lambda Web did not answer at ${origin} within ${timeoutMs}ms`,
  );
}

function die(message) {
  console.error(message);
  process.exit(1);
}

async function launch() {
  ensureRunDir();

  if (port === 4300) {
    die(
      'Refusing port 4300. That is the developer instance. Set LAMBDA_VERIFY_PORT to something else (default 4319).',
    );
  }

  const existing = readPid();

  if (existing && pidAlive(existing)) {
    await waitForOrigin(10_000);
    writeFileSync(originPath, origin);
    console.log(`reused pid ${existing} at ${origin}`);
    return;
  }

  const icons = spawn('pnpm', ['nx', 'run', '@lambda/desktop:generate-icons'], {
    cwd: workspaceRoot,
    stdio: 'inherit',
    env: process.env,
  });

  const iconsCode = await new Promise((resolve) => icons.on('close', resolve));

  if (iconsCode !== 0) {
    die(`generate-icons exited ${iconsCode}`);
  }

  const child = spawn(
    'pnpm',
    ['exec', 'next', 'dev', '--port', String(port), '--hostname', '127.0.0.1'],
    {
      cwd: webRoot,
      env: {
        ...process.env,
        NEXT_PUBLIC_E2E: '1',
        VITE_E2E: '1',
        PORT: String(port),
        NEXT_DISABLE_DEV_INDICATOR: '1',
        LAMBDA_VERIFY_DIST_DIR: '.next-verify',
      },
      detached: true,
      stdio: ['ignore', openSync(logPath, 'a'), openSync(logPath, 'a')],
    },
  );

  writeFileSync(pidPath, String(child.pid));
  writeFileSync(originPath, origin);

  try {
    await waitForOrigin();
  } catch (error) {
    try {
      process.kill(child.pid, 'SIGTERM');
    } catch {
      // already gone
    }
    throw error;
  }

  child.unref();
  console.log(`launched pid ${child.pid} at ${origin}`);
}

async function doctor() {
  ensureRunDir();
  const pid = readPid();

  if (!pid || !pidAlive(pid)) {
    die('doctor fail: no live verify server pid. Run launch first.');
  }

  if (
    !existsSync(originPath) ||
    readFileSync(originPath, 'utf8').trim() !== origin
  ) {
    die(`doctor fail: origin mismatch. expected ${origin}`);
  }

  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();

  try {
    await page.goto(origin, { waitUntil: 'load' });
    await page.getByRole('heading', { name: 'Lambda' }).waitFor({
      state: 'visible',
      timeout: 60_000,
    });
    await page.waitForLoadState('networkidle');
    const newScript = page.getByRole('button', { name: 'New script' });
    const signIn = page.getByRole('button', { name: 'Sign in' });

    if (!(await newScript.isVisible())) {
      die(
        'doctor fail: New script button missing. Instance is not in E2E write mode.',
      );
    }

    if (await signIn.isVisible()) {
      die(
        'doctor fail: Sign in visible. Do not drive a sign-in-walled session as verify.',
      );
    }

    console.log(
      JSON.stringify(
        {
          ok: true,
          origin,
          pid,
          e2eWrite: true,
          port,
        },
        null,
        2,
      ),
    );
  } finally {
    await browser.close();
  }
}

function parseBrowserArgs(argv) {
  const action = argv[0];
  const flags = {};

  for (let i = 1; i < argv.length; i += 1) {
    const token = argv[i];

    if (token.startsWith('--')) {
      const key = token.slice(2);
      const value = argv[i + 1];

      if (!value || value.startsWith('--')) {
        flags[key] = true;
      } else {
        flags[key] = value;
        i += 1;
      }
    }
  }

  return { action, flags };
}

async function withPage(fn) {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();

  try {
    return await fn(page);
  } finally {
    await browser.close();
  }
}

function locator(page, flags) {
  const role = flags.role;
  const name = flags.name;

  if (!role || !name) {
    throw new Error('browser click/fill need --role and --name');
  }

  return page.getByRole(role, { name });
}

async function browserCmd(argv) {
  ensureRunDir();
  const pid = readPid();

  if (!pid || !pidAlive(pid)) {
    die('browser fail: verify server not running');
  }

  const { action, flags } = parseBrowserArgs(argv);

  if (!action) {
    die(
      'browser needs an action: goto | click | fill | snapshot | screenshot | fountain',
    );
  }

  await withPage(async (page) => {
    const startPath = flags.url ?? flags.path ?? '/';
    await page.goto(new URL(startPath, origin).toString(), {
      waitUntil: 'domcontentloaded',
    });

    if (action === 'goto') {
      console.log(page.url());
      return;
    }

    if (action === 'click') {
      await locator(page, flags).click();
      if (flags.waitUrl) {
        await page.waitForURL(flags.waitUrl);
      }
      console.log(page.url());
      return;
    }

    if (action === 'fill') {
      await locator(page, flags).fill(String(flags.value ?? ''));
      return;
    }

    if (action === 'snapshot') {
      const yaml = await page.locator('body').ariaSnapshot();
      const out = flags.path ?? join(evidenceDir, 'snapshot.aria.yml');
      mkdirSync(dirname(out), { recursive: true });
      writeFileSync(out, yaml);
      console.log(out);
      return;
    }

    if (action === 'screenshot') {
      const out = flags.path ?? join(evidenceDir, 'screenshot.png');
      mkdirSync(dirname(out), { recursive: true });
      await page.screenshot({ path: out, fullPage: true });
      console.log(out);
      return;
    }

    if (action === 'fountain') {
      await page.locator('.ProseMirror').waitFor({ state: 'visible' });
      await page.waitForFunction(() => window.__lambdaE2e?.getFountainText);
      const text = await page.evaluate(() =>
        window.__lambdaE2e.getFountainText(),
      );
      const out = flags.path ?? join(evidenceDir, 'fountain.txt');
      mkdirSync(dirname(out), { recursive: true });
      writeFileSync(out, text);
      console.log(out);
      return;
    }

    die(`unknown browser action: ${action}`);
  });
}

async function driveWelcomeNewScript() {
  ensureRunDir();
  const pid = readPid();

  if (!pid || !pidAlive(pid)) {
    die('drive fail: verify server not running');
  }

  const featureDir = join(evidenceDir, 'welcome-new-script');
  mkdirSync(featureDir, { recursive: true });

  await withPage(async (page) => {
    const sessionReady = page
      .waitForResponse(
        (res) => res.url().includes('/api/auth/get-session') && res.ok(),
        { timeout: 20_000 },
      )
      .catch(() => undefined);

    await page.goto(origin, { waitUntil: 'load' });
    await page.getByRole('heading', { name: 'Lambda' }).waitFor({
      state: 'visible',
      timeout: 60_000,
    });
    const newScript = page.getByRole('button', { name: 'New script' });
    await newScript.waitFor({ state: 'visible' });
    await sessionReady;
    await page.waitForLoadState('networkidle');
    writeFileSync(
      join(featureDir, 'welcome.aria.yml'),
      await page.locator('body').ariaSnapshot(),
    );
    await page.screenshot({
      path: join(featureDir, 'welcome.png'),
      fullPage: true,
    });

    await Promise.all([
      page.waitForURL((url) => new URL(url).pathname === '/script', {
        waitUntil: 'commit',
      }),
      newScript.evaluate((el) => {
        if (el instanceof HTMLElement) {
          el.click();
        }
      }),
    ]);
    await page.locator('.ProseMirror').waitFor({ state: 'visible' });
    await page.waitForFunction(() => window.__lambdaE2e?.getFountainText);

    const fountain = await page.evaluate(() =>
      window.__lambdaE2e.getFountainText(),
    );
    writeFileSync(join(featureDir, 'after-new.fountain.txt'), fountain);
    writeFileSync(
      join(featureDir, 'script.aria.yml'),
      await page.locator('body').ariaSnapshot(),
    );
    await page.screenshot({
      path: join(featureDir, 'script.png'),
      fullPage: true,
    });

    const expectedPath = join(
      workspaceRoot,
      'apps/web-e2e/expected/new-script.fountain',
    );
    const expected = readFileSync(expectedPath, 'utf8');

    if (fountain !== expected) {
      die(
        `drive fail: fountain mismatch.\n--- expected ---\n${expected}\n--- actual ---\n${fountain}`,
      );
    }

    console.log(
      JSON.stringify(
        {
          ok: true,
          feature: 'welcome-new-script',
          evidence: featureDir,
          url: page.url(),
        },
        null,
        2,
      ),
    );
  });
}

function cleanup() {
  const pid = readPid();

  if (pid && pidAlive(pid)) {
    try {
      process.kill(-pid, 'SIGTERM');
    } catch {
      process.kill(pid, 'SIGTERM');
    }
  }

  for (const extra of ['chrome-profile']) {
    const target = join(runDir, extra);
    if (existsSync(target)) {
      rmSync(target, { recursive: true, force: true });
    }
  }

  if (existsSync(pidPath)) {
    rmSync(pidPath);
  }

  console.log(`cleaned server. evidence kept at ${evidenceDir}`);
}

const [cmd, ...rest] = process.argv.slice(2);

async function driveE2eFixtureMinimal() {
  ensureRunDir();
  const pid = readPid();

  if (!pid || !pidAlive(pid)) {
    die('drive fail: verify server not running');
  }

  const featureDir = join(evidenceDir, 'e2e-fixture-load');
  mkdirSync(featureDir, { recursive: true });

  await withPage(async (page) => {
    await page.goto(new URL('/e2e/load/minimal', origin).toString(), {
      waitUntil: 'load',
    });
    await page.waitForURL((url) => new URL(url).pathname === '/script', {
      waitUntil: 'commit',
    });
    await page.locator('.ProseMirror').waitFor({ state: 'visible' });
    await page.waitForFunction(() => window.__lambdaE2e?.getFountainText);

    const fountain = await page.evaluate(() =>
      window.__lambdaE2e.getFountainText(),
    );
    writeFileSync(join(featureDir, 'minimal.fountain.txt'), fountain);
    writeFileSync(
      join(featureDir, 'script.aria.yml'),
      await page.locator('body').ariaSnapshot(),
    );
    await page.screenshot({
      path: join(featureDir, 'script.png'),
      fullPage: true,
    });

    const expectedPath = join(
      workspaceRoot,
      'apps/web-e2e/fixtures/minimal.fountain',
    );
    const expected = readFileSync(expectedPath, 'utf8');

    if (fountain !== expected) {
      die(
        `drive fail: fountain mismatch.\n--- expected ---\n${expected}\n--- actual ---\n${fountain}`,
      );
    }

    console.log(
      JSON.stringify(
        {
          ok: true,
          feature: 'e2e-fixture-load',
          evidence: featureDir,
          url: page.url(),
        },
        null,
        2,
      ),
    );
  });
}

const commands = {
  launch,
  doctor,
  cleanup,
  browser: () => browserCmd(rest),
  'drive-welcome-new-script': driveWelcomeNewScript,
  'drive-e2e-fixture-minimal': driveE2eFixtureMinimal,
};

if (!cmd || !commands[cmd]) {
  die(
    `usage: control-lambda-web.mjs <launch|doctor|browser|drive-welcome-new-script|drive-e2e-fixture-minimal|cleanup>\nrunDir=${runDir} origin=${origin}`,
  );
}

Promise.resolve(commands[cmd]()).catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
