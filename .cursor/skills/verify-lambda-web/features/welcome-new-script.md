# Welcome new script

Welcome new script lets a writer start a blank Fountain document from the welcome screen, land in the editor, and see the canonical new-script stub.

## Sub-features

- `welcome-visible` shows the Lambda welcome with write actions.
- `new-script-click` opens `/script` from `New script`.
- `new-script-stub` serialises to `apps/web-e2e/expected/new-script.fountain`.

## How to get to it (user POV)

- Open Lambda Web welcome (`/`).
- Choose the `New script` button.
- Command palette item `New script` (same session action; separate entry).

## Driving it with control-lambda-web

Preconditions:

- Doctor is healthy at `http://127.0.0.1:4319`.
- No script needs saving (fresh instance).

- **See welcome.** Open `/`. Run `node .cursor/skills/verify-lambda-web/scripts/control-lambda-web.mjs browser snapshot --path /tmp/lambda-verify-default/evidence/welcome-new-script/welcome.aria.yml`. Snapshot includes heading `Lambda` and button `New script`.
- **Start script.** Choose `New script`. Run `node .cursor/skills/verify-lambda-web/scripts/control-lambda-web.mjs drive-welcome-new-script`. URL is `/script`, `.ProseMirror` is visible, toolbar shows `← Welcome`.
- **Confirm stub.** Compare written `after-new.fountain.txt` to `apps/web-e2e/expected/new-script.fountain`. They must match exactly.
- **Proof.** Keep `welcome.png`, `script.png`, both ARIA snapshots, and `after-new.fountain.txt`.

## Gotchas

- Next.js dev overlay (`N`) sits on the welcome canvas. Prefer `drive-e2e-fixture-minimal` for harness smoke; welcome click can no-op while Fast Refresh rebuilds or while both write and sign-in actions are in the DOM.
- Without `NEXT_PUBLIC_E2E=1` the welcome shows `Sign in` instead. Doctor must fail that instance.
- `__lambdaE2e.getFountainText()` throws if no script is open; do not call it on welcome.
