# Preview

Preview shows paginated white script sheets on the light grey canvas from an open script, without carrying editor zoom.

## Sub-features

- `preview-open` navigates to `/script/preview` from `Preview…`.
- `preview-sheets` renders `ScriptPreviewView` pages (`[data-page-format]`).
- `preview-back` returns to `/script` via `← Back`.

## How to get to it (user POV)

- With a script open, choose `Preview…` in the script toolbar.
- Open `/script/preview` directly only after a script is already in session; empty session renders nothing.

## Driving it with control-lambda-web

Preconditions:

- Doctor healthy.
- Script open (welcome new script or fixture load).

- **Open preview.** Click `button` name `Preview…`. URL contains `/script/preview`. Capture screenshot of white sheets on grey canvas.
- **Confirm format.** For fixture `parity-a4`, `locator('[data-page-format="a4"]')` count is 1.
- **Return.** Click `link` name `← Back`. URL is `/script` and `.ProseMirror` is visible.
- **Proof.** Screenshots of editor and preview, ARIA snapshot including `Export PDF` and `Export settings…`.

## Gotchas

- Preview is 100% canonical layout; editor zoom readout must not be treated as preview scale.
- Dark system theme must not turn preview sheets dark (product rule: light grey canvas `#e8e8ec`, white sheets).
- `WritingGate` hides preview when access is not `write`.
