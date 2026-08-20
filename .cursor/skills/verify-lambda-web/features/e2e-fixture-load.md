# E2E fixture load

E2E fixture load injects a known `.fountain` file through `/e2e/load/<fixtureName>` and lands on the editor with matching serialisation.

## Sub-features

- `load-minimal` opens `minimal`.
- `load-parity` opens parity fixtures used by `@lambda/web-e2e`.
- `load-missing` unknown names bounce to welcome.

## How to get to it (user POV)

- This path is not a writer-facing URL in production. It exists only when `NEXT_PUBLIC_E2E=1` (or `VITE_E2E=1`) for Playwright/bootstrap.
- Navigate to `/e2e/load/<fixtureName>` where `<fixtureName>` matches `apps/web-e2e/fixtures/<fixtureName>.fountain`.

## Driving it with control-lambda-web

Preconditions:

- Doctor healthy (E2E write instance).

- **Load.** `node .cursor/skills/verify-lambda-web/scripts/control-lambda-web.mjs drive-e2e-fixture-minimal` (or `browser goto --url /e2e/load/minimal` then wait for `/script`).
- **Read Fountain.** `browser fountain --path /tmp/lambda-verify-default/evidence/e2e-fixture-load/minimal.fountain.txt`.
- **Confirm.** File equals `apps/web-e2e/fixtures/minimal.fountain` unless a spec names an `expected/` file instead.
- **Proof.** Fountain dump plus editor screenshot. Record fixture name in the artifact folder.

## Gotchas

- Loading a fixture is not proof of Welcome `New script` or `Open…`.
- Missing fixture logs `E2E fixture not found` and returns to `/`.
- Production builds exclude this bootstrap; a 404 means you are not on the verify E2E server.
