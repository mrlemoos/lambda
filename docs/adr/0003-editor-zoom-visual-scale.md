# ADR 0003: Editor zoom via visual scale

**Status:** Accepted  
**Date:** 2026-06-20

## Context

Lambda needs **Editor zoom**: ⌘+ / ⌘− / ⌘0 (and View menu equivalents) scale page sheets on the script workspace without changing **Writing shell** chrome or export/print layout. Zoom is a global user preference (50–200% in 10% steps); scroll should stay anchored to the viewport centre when the level changes.

Alternatives:

1. **CSS `transform: scale()`** on a wrapper around page-shaped sheets — canonical pt layout unchanged; presentation scaled.
2. **Typography scale** — increase/decrease element point sizes; **Pagination** must recalculate and export parity drifts from industry layout.
3. **CSS `zoom` property** — scales layout box with content; works in Chromium/Electron but is non-standard and unreliable in Firefox (Lambda Web).

**Pagination** (ADR 0001) is a pure pt-based module. Changing typographic sizes for on-screen comfort would fork the engine from export or require recomputing every break on each zoom step.

## Decision

Implement **Editor zoom** as **visual scale**:

- Wrap page-shaped sheets ( **Title page**, **Script page**, future sheets) in a scale container inside the script workspace.
- Apply `transform: scale(level / 100)` with `transform-origin: top center`; adjust wrapper dimensions so scroll height matches the scaled content.
- After each zoom step, adjust scroll position so the viewport centre stays roughly stable.
- Persist level as a global user preference (not in **Slugline Document Settings**).
- Do not alter theme point sizes, **Pagination** inputs, or export/print pipelines.

## Consequences

**Positive**

- **Pagination** line budgets and break positions stay correct at any zoom level.
- Export and print remain at canonical 100% layout without a “reset zoom before export” step.
- Firefox-compatible (unlike CSS `zoom`).

**Negative**

- Scaled wrapper must reserve correct layout space; incorrect width/height math causes clipped pages or excess scroll gap.
- Line metrics vs rendered pixels can look slightly soft at non-100% scales (acceptable for a comfort feature).

**Out of scope**

- Per-script zoom levels.
- Caret-anchored zoom (viewport-centre anchor only for v1).
- Fit-to-window zoom preset.
