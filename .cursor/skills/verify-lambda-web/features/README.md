# Lambda Web verification map

This directory is the maintained source for verifying user-facing behaviour of Lambda Web. Read the index before driving the app, then use the matching feature file as the recipe.

## Baseline preconditions

- Launch a disposable E2E instance with `node .cursor/skills/verify-lambda-web/scripts/control-lambda-web.mjs launch` (`NEXT_PUBLIC_E2E=1`, port **4319** unless `LAMBDA_VERIFY_PORT` is set to another non-4300 port).
- Run `doctor` and require origin `http://127.0.0.1:$PORT`, live pid, `New script` visible, `Sign in` absent.
- Never drive `http://localhost:4300` or an Electron window the user already has open.
- Evidence lands in `/tmp/lambda-verify-$LAMBDA_VERIFY_RUN_ID/evidence/` (default run id `default`).

## Driving conventions

- Start every recipe from doctor-healthy welcome unless the feature file says otherwise.
- Prefer ARIA roles and accessible names over CSS selectors. `.ProseMirror` is the editor exception (no accessible name).
- Treat every command as literal. Keep quoted names and flags unchanged.
- Run browser actions through `control-lambda-web.mjs browser` or the named `drive-*` command.
- Restore no shared DB; library state is in-browser. Do not delete proof artifacts during cleanup.

## Proof and skip reporting

- Capture the user action and the resulting state, not only the final screen.
- UI proof includes an ARIA snapshot and a screenshot with the Lambda heading or script toolbar visible.
- Fountain proof is `window.__lambdaE2e.getFountainText()` written to a `.fountain.txt` file.
- Mutation proof for Save includes `getLastWrittenContents()` as a second view.
- Record the feature ID and entry point used with every artifact.
- Report an unreachable path with the attempted command and the unmet precondition.
- Do not report a skipped entry point as verified through a different path.

## Feature entry contract

Each feature file starts with an H1 title and one paragraph describing the user-visible behaviour. It then uses exactly four H2 sections in this order.

1. `Sub-features`
2. `How to get to it (user POV)`
3. `Driving it with control-lambda-web`
4. `Gotchas`

## Features

- [Welcome new script](./welcome-new-script.md) covers New script from welcome, editor landing, and new-script Fountain stub.
- [Editor save](./editor-save.md) covers typing, File → Save, and last-written contents.
- [Preview](./preview.md) covers Preview… from the script toolbar and the preview sheet.
- [E2E fixture load](./e2e-fixture-load.md) covers `/e2e/load/<fixture>` bootstrap (E2E instance only). This is the smoke proof for the harness.
- [Sign-in wall](./sign-in-wall.md) covers the non-E2E welcome (do not mix with the verify instance).
