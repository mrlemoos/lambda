# Lambda (ƛ)

Screenwriting software built on [Fountain](https://fountain.io) plain-text markup. The editor is powered by [TipTap](https://tiptap.dev); a prior [react-fountain](https://github.com/mrlemoos/react-fountain) proof of concept validated Fountain + TipTap together. This repo is an Nx monorepo (`pnpm nx …`); application and library projects will live under `apps/` and `libs/` as they are added.

## Editor parity target

**Slugline 2 editor parity**:
Lambda’s `@lambda/editor` should support everything a writer can type and format in [Slugline 2](https://www.slugline.co/)’s writing surface — the Fountain inference, element types, inline markup, and script-page layout described in Slugline’s [basics](https://www.slugline.co/basics) and [writing guide](https://www.slugline.co/writing). This is the bar for “good enough” on the editor.

**In scope** (typing & formatting in the editor):

- **Screenplay elements** — scene heading, action, character, parenthetical, dialogue, transition (Slugline’s six paragraph types).
- **Structural elements** — section, synopsis, note, title page (typed in the script; omitted from print by default, like Slugline).
- **Script page** — US Letter and A4 page formats (Slugline 2 added A4).
- **Fountain inline & forced syntax** — emphasis (bold, italic, underline); centered text (`>…<`); dual dialogue (`^`); lyrics (`~`); manual page breaks (`===`); omission / boneyard (visible while writing, omitted from print); optional scene numbers on scene headings; forced scene heading (leading `.`), transition (leading `>`), character (`@`), and action (`!`) per [Fountain syntax](https://fountain.io/syntax).
- **Slugline 2 note tags** — prefix-style tagged notes (e.g. coloured `Todo:` notes); parity with Slugline 2’s note-tag feature, not plain `[[notes]]` alone.

**Out of scope** (Slugline features that are not the writing surface):

- Outline Navigator, drag-and-drop outline reordering, and outline-only views.
- Timeline or other non-editor navigation chrome.
- Preview, Print, PDF export, and Live Compare (export/review tools, not element typing).
- Autocomplete pop-up, full-screen mode, and cloud sync (may follow later).

Implementation order still follows TDD: per-element `is*` predicates first, then `<ScriptEditor />` integration — not all parity items need to land in the first tracer bullet.

## Language

### Product

**Lambda**:
The product name. Use “Lambda” in prose; the glyph **ƛ** is acceptable in branding or UI where space is tight.
_Avoid_: λ (lowercase lambda), “the app”, “the editor” when you mean the product as a whole.

**Script**:
The screenplay document the author works on — one Fountain source, one narrative work in progress.
_Avoid_: Document, file, project (unless you mean a separate product concept like a folder of scripts).

### Fountain structure

Fountain is the authoritative interchange format. Elements are typed blocks in plain text; domain discussion stays in Fountain terms, not editor internals.

**Element**:
One typed block in a script (scene heading, action, character, etc.). In the editor, each element type maps to its own TipTap node (e.g. Scene heading → `sceneHeading` node). Not a generic paragraph or unnamed block.
_Avoid_: Block, node, paragraph (unless discussing generic editor behaviour).

**Scene heading**:
A slugline that establishes where and when a scene occurs (e.g. `INT. KITCHEN - DAY`). Fountain lines starting with `INT`, `EXT`, `INT/EXT`, or `I/E` (case-insensitive). Canonical name for theme tokens, editor modules, and TipTap element types.
_Avoid_: Slugline (POC/code name — use Scene heading), header, scene title.

**Action**:
Narrative description of what the audience sees or hears — everything that is not dialogue, a scene heading, or another specialised element. Canonical name for theme tokens and editor modules (not “action line”).
_Avoid_: Action line, stage direction (theatre term — use Parenthetical for inline actor direction).

**Character**:
The speaking role name on its own line, centred in formatted output, immediately above dialogue.
_Avoid_: Actor, cast member, speaker.

**Dialogue**:
Speech lines following a character cue.
_Avoid_: Lines, speech (too vague).

**Parenthetical**:
An inline direction for how a line is delivered, wrapped in parentheses on the line below the character cue and above the dialogue.
_Avoid_: Wryly, modifier, stage direction.

**Transition**:
An edit cue between scenes (e.g. `CUT TO:`, `FADE OUT.`), often right-aligned in formatted output.
_Avoid_: Cut (alone), fade (alone).

**Section**:
A hierarchical marker in Fountain (`#`, `##`, …) used to outline acts, sequences, or beats — not the same as a scene heading. In scope for the editor (own element type and TipTap node).
_Avoid_: Heading, chapter (unless the product explicitly adopts “chapter” in UI).

**Synopsis**:
A Fountain summary line prefixed with `=`; used for outlining, not rendered as script body in standard screenplay layout. In scope for the editor (own element type and TipTap node).
_Avoid_: Summary, note (use Note for `[[…]]` comments).

**Note**:
A Fountain comment in `[[double brackets]]`; production or author notes, not part of the performed script. In scope for the editor (own element type and TipTap node).
_Avoid_: Comment, annotation.

**Title page**:
Fountain metadata at the top of a file (`Title:`, `Author:`, `Draft date:`, etc.) before the first scene. In scope for the editor (own element type and TipTap node).
_Avoid_: Front matter, metadata block.

**Script page**:
The on-screen page container that defines margins and printable area for formatted script output. Implemented as editor chrome around the TipTap surface, not as a Fountain element or TipTap node. Page dimensions come from a **page format** (US Letter or A4), not from the element name.
_Avoid_: Us letter paper, page wrapper (vague), canvas.

**Page format**:
Which standard page size the script page uses: US Letter or A4. Set via `<ScriptEditor pageFormat="…" />`; theme CSS defines measurements for each format (e.g. `data-page-format` on the editor root). Defaults to US Letter when omitted.
_Avoid_: Paper size (alone), locale.

**Emphasis**:
Inline character styling within an element — italic (`*…*`), bold (`**…**`), underline (`_…_`), combinable per Fountain. Shown with muted cue characters while editing, like Slugline.
_Avoid_: Rich text (generic), formatting (vague).

**Centered text**:
A line of action text centred on the page, bracketed with `>` and `<` in Fountain. Distinct from a forced transition (transition also uses `>` at line start).
_Avoid_: Centred action (verbose).

**Dual dialogue**:
Two characters speaking simultaneously; the second character line ends with `^` in Fountain.
_Avoid_: Parallel dialogue, split dialogue.

**Lyrics**:
A line of song or sung text, forced in Fountain with a leading `~` on the line.
_Avoid_: Song line, music.

**Page break**:
A manual break between script pages — a line containing three or more `=` characters (Fountain). Used for act breaks and similar.
_Avoid_: Pagination (automatic page layout), form feed.

**Omission**:
Text that remains visible while writing but is excluded from printed/PDF output — Slugline’s “Omit” and Fountain’s boneyard (`/* … */`) and related omit syntax.
_Avoid_: Cut, deleted scene (unless permanently removed from the file).

**Scene number**:
An optional alphanumeric marker appended to a scene heading in Fountain (wrapped in `#`), e.g. `#1A#`. Part of the scene heading element, not a separate paragraph type.
_Avoid_: Scene index, scene ID (unless referring to product navigation).

**Note tag**:
A Slugline 2 extension to notes — a recognisable prefix on a note (often with a colour in Slugline) used for batch tagging (e.g. `Todo:`). Editor parity includes note tags as well as plain Fountain notes.
_Avoid_: Tag (alone), label (alone).

### Screenwriting (general)

**Screenplay**:
The industry-standard formatted script (what Fountain describes and what Lambda helps authors produce).
_Avoid_: Screen play (two words), script file (when you mean the art form or format).

**Beat**:
A story unit — a moment that changes something. In outlining, beats may align with sections or synopses; do not confuse with a “beat sheet” product feature unless one exists.
_Avoid_: Scene (a beat may span or sit inside scenes).

**Scene**:
A continuous unit of action in one time and place, usually opened by a scene heading.
_Avoid_: Shot, sequence (sequence is a larger story unit).

### Editor (implementation terms)

**Classify**:
Given a line of Fountain plain text (and optional context such as the line above), determine which element type it is. Each element module exports its own predicate (e.g. `isSceneHeading`). Priority order is fixed in the editor (not a public API). Pure functions; no TipTap or DOM.
_Avoid_: Parse (implies full document AST), detect (vague), classifyElement (exported orchestrator — not used).

### Engineering workflow (this repo)

**Feature** (issue tracker):
A body of work tracked under `.scratch/<feature-slug>/` (PRD plus numbered issue files). See `docs/agents/issue-tracker.md`.
_Avoid_: Epic, ticket (unless quoting an external tracker).

**Triage status**:
One of `needs-triage`, `needs-info`, `ready-for-agent`, `ready-for-human`, `wontfix` on a local issue file. See `docs/agents/triage-labels.md`.
_Avoid_: Label, state (alone — be explicit which role).
