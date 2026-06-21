# ADR 0005: PDF preview and export

**Status:** Accepted  
**Date:** 2026-06-20

## Context

Lambda ships editor **Pagination** (ADR 0001): pure-module break placement, Slugline-grade keep-clusters, mid-block splits for action and dialogue, title-page slot, manual `===` breaks, and dual-dialogue blocks. ADR 0001 explicitly deferred Preview/Print/PDF export. ADR 0002 deferred the **Export settings dialog** until desktop had a home for it in `@lambda/shell`.

Authors now need **PDF preview** and **PDF export** with Slugline parity: formatted title page from Fountain metadata, US Letter / A4 **Page format**, typeface choice, **CONT'D** annotations, mid-sentence page breaks, and page numbers matching the writing surface.

Alternatives considered:

1. **Separate PDF layout engine** — pdfkit / `@react-pdf/renderer` builds PDF from pagination data. Full control over bytes; risks drift from editor breaks and duplicates theme work.
2. **DOM-measured pagination for export only** — live browser layout drives breaks. Flaky in CI; forks ADR 0001.
3. **HTML page stack + platform print APIs** — one React render tree for on-screen preview and PDF generation; shared pure-module pagination from ADR 0001.
4. **Preview-only first slice** — ship HTML preview; defer PDF bytes. Rejected: preview and export share one renderer; shipping both avoids a second integration pass.

## Decision

### Architecture

- **One pagination brain (extends ADR 0001).** `@lambda/editor` remains the source of pagination rules. Preview and export consume the same `PaginationResult` as the editor — no preview-only or export-only break overrides.
- **Two-pass CONT'D enrichment** in `@lambda/editor`:
  1. `paginateScript(rawBlocks)` — detect dialogue splits (`pageStarts`) and scene-continuity CONT'D candidates.
  2. `enrichBlocks(...)` — inject virtual blocks (e.g. `splitDialogueCharacter` with `(CONT'D)`); annotate character cues for same-scene re-entry per `CONTEXT.md`.
  3. `paginateScript(enrichedBlocks)` — final placements; split-continuation cues are zero line weight.
- **New `@lambda/print` package** — sheet assembly and preview UI. Depends on `@lambda/editor` (pagination, serialisation, `TitlePageView`) and `@lambda/theme`. `@lambda/shell` wires File menu, preview workspace route/mode, and **Export settings dialog**.
- **HTML page stack.** `@lambda/print` maps `PaginationResult` to discrete page DOM: title sheet (when present), body pages with top-right **Page number** labels, element styling from theme CSS. Mid-block splits slice plain text at `pageStarts[].textOffset` into separate styled fragments (action, dialogue, etc.); continuation fragments use placement `marginTopPt`.
- **Filter at render (not at paginate).** Pagination runs on the full document (including **Outline elements** and **Omission**, which affect vertical space). Preview/PDF DOM omits outline elements and **Omission** per first-slice rules in `CONTEXT.md`; break positions stay identical to the editor.

### Session settings (page format and typeface)

- **`pageFormat`** and **`typeface`** live in script session state — single source for editor, pagination metrics, preview, and PDF.
- Load defaults from **Slugline Document Settings** in the `.fountain` file when present; otherwise US Letter and Courier Prime (or product default).
- **Export settings dialog** edits session values; preview live-updates. Persist to the Document Settings block on script **Save** (alongside other document metadata).
- Typeface applies to theme CSS **and** the pica metrics table in `elementMetrics` (Courier Prime, Courier New, Monospace — no live DOM measurement).

### Title page

- Source: session **`titlePageLines`** (same as pagination and **Title Page…** dialog). Unsaved edits appear in preview/export.
- Render: `TitlePageView` / `parseTitlePageBlock` for known Fountain keys (Title, Credit, Author, Source, Draft date, Contact, Notes, Copyright). **Unknown keys** stay in the file but are omitted from the formatted title sheet in v1.
- No title metadata → no title sheet; body **Page number** starts at **`1.`** on the first body page. Title sheet is unnumbered.

### Preview workspace (`@lambda/shell`)

- **File → Preview…** replaces the script workspace with a full-screen page stack (Back returns to the editor).
- Preview toolbar: **Back**, **Export settings…**, **Export PDF**.
- Preview always renders at **100%** canonical layout (ADR 0003 — editor zoom does not carry over).
- On enter: serialise live session **`ScriptDocument`** (TipTap JSON) + `titlePageLines` + session settings; no save required.

### PDF export

- **Same HTML tree** as on-screen preview.
- **Desktop (Electron):** `webContents.printToPDF()` on the preview render (or equivalent offscreen render of the same component tree).
- **Lambda Web:** `window.print()` with print `@page` CSS matching **Page format** (`size: letter` / `A4`); author saves via the browser print dialog. Silent auto-download is out of scope for v1; document the platform asymmetry.

### Page breaking (normative reference)

Preview and PDF inherit all rules already implemented in `paginateScript` and specified in `CONTEXT.md`, including:

- Mid-sentence splits for **action** and **dialogue** (minimum two lines per fragment).
- Keep-clusters: scene heading + first body line; character + parenthetical(s) + dialogue; section + outline run + first body line; transition with previous beat; dual-dialogue block as one unit.
- Manual **Page break** (`===`) honoured.
- **Split dialogue** continuation: repeated character cue + **CONT'D annotation**, zero line weight (enrichment pass).
- **Scene continuity CONT'D:** same character after intervening action in the same **Scene** — display `(CONT'D)`, counts toward line budget.

Unit tests in `@lambda/editor` remain the contract; `@lambda/print` adds renderer tests and parity fixtures (e.g. `parity-split-dialogue.fountain`).

### Out of scope (v1)

- Custom / unknown title-page keys on the formatted sheet.
- Inline **Emphasis** in preview fragments (plain-text splits first; rich marks follow).
- Web silent PDF download without the print dialog.
- Outline elements in preview/PDF output (first slice).
- Live Compare, system Print menu item separate from Export PDF.
- Per-script zoom in preview.

## Consequences

**Positive**

- Editor page boundaries, preview pages, and PDF breaks stay aligned — one pagination module, one HTML renderer.
- `@lambda/print` isolates export/preview from TipTap without forking layout rules.
- Two-pass enrichment is testable in pure functions before any PDF adapter lands.
- Desktop gets one-click PDF; web gets a workable path without bundling Chromium.

**Negative**

- Theme CSS and `elementMetrics` must stay in sync for each typeface (ADR 0001 drift risk applies to export too).
- Web export UX differs from desktop until a headless or WASM PDF path is added.
- Two-pass pagination adds CPU on large scripts; acceptable for v1; optimise later if needed.
- Unknown title-page keys invisible on formatted sheet until a follow-up.

**Follow-ups**

- Custom title-page keys in footer block.
- Emphasis-aware fragment rendering (offset maps from TipTap marks).
- Web auto-download PDF parity with desktop.
- Optional visual regression between preview DOM and `printToPDF` output.

## Related

- ADR 0001 — pure-module pagination (extended, not replaced).
- ADR 0002 — `@lambda/shell`, Export settings dialog placement.
- ADR 0003 — preview at canonical 100%; editor zoom excluded.
