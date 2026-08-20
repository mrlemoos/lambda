# Sign-in wall

Sign-in wall is the welcome a writer sees without an Account session when E2E write bypass is off: Sign in and Create account instead of New script.

## Sub-features

- `wall-buttons` shows `Sign in` and `Create account`.
- `sign-in-route` opens `/sign-in` with heading `Sign in`.
- `sign-up-route` opens sign-up from `Create account`.

## How to get to it (user POV)

- Open Lambda Web **without** `NEXT_PUBLIC_E2E=1` (normal `pnpm nx dev @lambda/web` on 4300, or a production-like start).
- Choose `Sign in` or `Create account`.

## Driving it with control-lambda-web

Preconditions:

- **Do not use the verify E2E instance.** Doctor on 4319 must show `New script` and will fail this feature on purpose.
- Drive a separate non-E2E server if this feature is in scope. Default developer port 4300 is the user's session — refuse unless they explicitly hand you a disposable non-E2E port.

- **See wall.** Welcome snapshot includes `Sign in` and `Create account`, not `New script`.
- **Open sign-in.** Click `Sign in`. Heading `Sign in` is visible (`SignInForm`).
- **Proof.** Screenshots of welcome wall and sign-in form. Do not submit credentials unless the user provides a disposable test account.

## Gotchas

- Mixing this feature with the E2E verify instance invalidates both proofs.
- `WritingGate` renders nothing on `/script` until access is `write`.
- Desktop uses the same Account; do not assume Electron chrome is part of this path.
