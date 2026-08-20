---
name: verify-lambda-web
description: Drive Lambda Web (Next.js welcome/script/preview on 127.0.0.1) the way a writer does. Use when proving UI behaviour, editor serialisation, preview, or e2e fixture load — not unit tests.
---

# Verify Lambda Web

Primary user surface is **Lambda Web** (`@lambda/web`, Next.js). Desktop Electron (`@lambda/desktop`) only `loadURL`s that origin; do not drive the user's Electron window for proof. `@lambda/web-e2e` Playwright specs are the regression suite; this skill is the agent harness for a disposable E2E instance.

Never drive `http://localhost:4300`. That port is the developer app (`pnpm nx dev @lambda/web`). Verification binds **4319** (override with `LAMBDA_VERIFY_PORT`, never 4300).

Control helper (from repo root):

```bash
node .cursor/skills/verify-lambda-web/scripts/control-lambda-web.mjs <command>
```

State: `/tmp/lambda-verify-$LAMBDA_VERIFY_RUN_ID` (default id `default`). Evidence: `$RUN_DIR/evidence/`. Cleanup must not delete evidence.

## Launch

1. Optional isolation: `export LAMBDA_VERIFY_RUN_ID=$$` and `export LAMBDA_VERIFY_PORT=4319`.
2. `pnpm nx run @lambda/desktop:generate-icons` runs as part of launch (web `dev` depends on it).
3. Launch runs `pnpm exec next dev --port $PORT --hostname 127.0.0.1` from `apps/web` after `generate-icons`, with `NEXT_PUBLIC_E2E=1` and `VITE_E2E=1` on that process (do not rely on `nx run @lambda/web:dev` to forward those vars). `composeWritingAccess` then returns `write` and `window.__lambdaE2e` mounts. `withNx` plus webpack `conditionNames` / `extensionAlias` still apply via `next.config.js`.
4. Ready when `GET http://127.0.0.1:$PORT` answers and doctor sees the `New script` button.

```bash
node .cursor/skills/verify-lambda-web/scripts/control-lambda-web.mjs launch
```

Launch sets `LAMBDA_VERIFY_DIST_DIR=.next-verify` so Next writes a separate cache from the developer `.next` on port 4300.

Two verify instances: different `LAMBDA_VERIFY_RUN_ID` **and** different `LAMBDA_VERIFY_PORT`. Same port = refuse.

## Doctor

Read-only. Fail the run if this is not our E2E write instance.

```bash
node .cursor/skills/verify-lambda-web/scripts/control-lambda-web.mjs doctor
```

Require: live pid we started, origin file matches, welcome shows heading `Lambda`, role `button` name `New script` visible, role `button` name `Sign in` **not** visible.

Playwright Chromium must be installed (`pnpm exec playwright install chromium` from the repo root). Doctor launches headless Chromium.

If doctor sees Sign in, stop. That is a production-shaped session; writing routes are gated by `WritingGate`.

## Drive

Harness is Playwright Chromium via the control script. Prefer roles and names from this repo:

| Handle                                        | Meaning                                                             |
| --------------------------------------------- | ------------------------------------------------------------------- |
| `button` / `New script`                       | Welcome → `/script`                                                 |
| `button` / `Open…`                            | File picker (FSA); skip unless a test file is already granted       |
| `button` / `← Welcome`                        | Script toolbar back (unsaved modal if dirty)                        |
| `button` / `File` then `menuitem` text `Save` | Application menu save                                               |
| `button` / `Edit` then `menuitem` text `Undo` | Undo                                                                |
| `button` / `Title Page…`                      | Title page dialog                                                   |
| `button` / `Preview…`                         | `/script/preview`                                                   |
| `link` / `← Back`                             | Preview → `/script`                                                 |
| `.ProseMirror`                                | Fountain editor surface                                             |
| `window.__lambdaE2e.getFountainText()`        | Serialised Fountain (E2E only)                                      |
| `GET /e2e/load/<fixtureName>`                 | Load `apps/web-e2e/fixtures/<name>.fountain` then land on `/script` |

```bash
node .cursor/skills/verify-lambda-web/scripts/control-lambda-web.mjs browser click --role button --name "New script" --waitUrl "**/script"
node .cursor/skills/verify-lambda-web/scripts/control-lambda-web.mjs browser fountain --path /tmp/lambda-verify-default/evidence/fountain.txt
node .cursor/skills/verify-lambda-web/scripts/control-lambda-web.mjs browser snapshot --path /tmp/lambda-verify-default/evidence/script.aria.yml
node .cursor/skills/verify-lambda-web/scripts/control-lambda-web.mjs browser screenshot --path /tmp/lambda-verify-default/evidence/script.png
```

Mapped one-shots:

```bash
node .cursor/skills/verify-lambda-web/scripts/control-lambda-web.mjs drive-e2e-fixture-minimal
node .cursor/skills/verify-lambda-web/scripts/control-lambda-web.mjs drive-welcome-new-script
```

The generated-skill smoke proof is `drive-e2e-fixture-minimal` (`/e2e/load/minimal`). Welcome `New script` is a second mapped path; Next dev can paint both write and sign-in welcome actions — do not treat that as a passing welcome proof.

Read `features/` before improvising a path. A proof that uses only `/e2e/load/...` does not verify Welcome.

Do not treat Vitest, Storybook, or internal session setters as user proof.

## Evidence

Directory: `/tmp/lambda-verify-$RUN_ID/evidence/<feature-id>/`.

Proof standard:

- Exercise the real control (click `New script`, type in `.ProseMirror`, open Preview).
- Capture **before and after** (ARIA snapshot + screenshot) and the serialised Fountain (or preview sheet) as the resulting state.
- For save: compare `window.__lambdaE2e.getLastWrittenContents()` to the editor Fountain after File → Save.
- Fixture load: Fountain must match `apps/web-e2e/fixtures/<name>.fountain` (or the matching `expected/` file when the spec says so).
- Record feature id and entry point on every artifact.
- Mocks: none for writing UI. Auth network stays out of the E2E write instance by design (`isE2e` → `write`).

Server log (not proof, debug): `$RUN_DIR/server.log`.

## Cleanup

```bash
node .cursor/skills/verify-lambda-web/scripts/control-lambda-web.mjs cleanup
```

Kills only the pid written by launch. Does not `pkill next`. Leaves `$RUN_DIR/evidence/`.

## Helpers

All invocations are from the repo root with the `node .cursor/skills/verify-lambda-web/scripts/control-lambda-web.mjs` prefix shown above: `launch`, `doctor`, `browser …`, `drive-welcome-new-script`, `cleanup`.
