# Editor save

Editor save lets a writer change Fountain in the page, mark the document dirty, and persist via File → Save so last-written contents match the editor.

## Sub-features

- `edit-type` types into `.ProseMirror` and shows `Edited` (`aria-label` `Unsaved changes`).
- `menu-save` runs File → Save.
- `written-match` matches `getLastWrittenContents()` to `getFountainText()`.

## How to get to it (user POV)

- From an open script, type in the editor body.
- Choose application menu `File`, then `Save`.

## Driving it with control-lambda-web

Preconditions:

- Doctor healthy.
- A script is open (run welcome new script or `/e2e/load/minimal` first). Prefer `minimal` so the recipe matches `@lambda/web-e2e` S3.

- **Load script.** `node .cursor/skills/verify-lambda-web/scripts/control-lambda-web.mjs browser goto --url /e2e/load/minimal` then wait until URL is `/script`.
- **Type.** Click `.ProseMirror`, move to end of last paragraph, type a unique line. Capture screenshot showing `Edited`.
- **Save.** Click `button` name `File` (exact), then `menuitem` whose text is `Save`.
- **Confirm.** `getLastWrittenContents()` equals `getFountainText()` and includes the typed line.
- **Proof.** Store fountain before save, last-written after save, ARIA snapshot with `Unsaved changes` gone or still present according to dirty flag, plus screenshots of edit and post-save.

There is no one-shot `drive-editor-save` yet; use Playwright in a throwaway node snippet that follows `apps/web-e2e/src/helpers.ts` (`clickFileMenuItem`, `waitForEditor`) if `browser click` cannot reach a menuitem filter. Prefer copying that helper sequence over inventing selectors.

## Gotchas

- Save on a non-E2E build has no `__lambdaE2e`; last-written proof is E2E-only.
- Chromium only for some Edit menu smokes (`Undo` in shell.spec).
- Dirty badge is `Edited` with `aria-label="Unsaved changes"`.
