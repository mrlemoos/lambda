# Lambda (ƛ)

Screenwriting software built on [Fountain](https://fountain.io) plain-text markup. The editor is powered by [TipTap](https://tiptap.dev); a prior [react-fountain](https://github.com/mrlemoos/react-fountain) proof of concept validated Fountain + TipTap together. This repo is an Nx monorepo (`pnpm nx …`); application and library projects will live under `apps/` and `libs/` as they are added.

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
One typed block in a script (scene heading, action, character, etc.). Not a DOM node or React component.
_Avoid_: Block, node, paragraph (unless discussing generic editor behaviour).

**Scene heading**:
A slugline that establishes where and when a scene occurs (e.g. `INT. KITCHEN - DAY`). Fountain lines starting with `INT`, `EXT`, `INT/EXT`, or `I/E` (case-insensitive).
_Avoid_: Slugline alone in user-facing copy (slugline is fine in technical docs), header, scene title.

**Action**:
Narrative description of what the audience sees or hears — everything that is not dialogue, a scene heading, or another specialised element.
_Avoid_: Stage direction (that term is theatre; use parenthetical for inline actor direction).

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
A hierarchical marker in Fountain (`#`, `##`, …) used to outline acts, sequences, or beats — not the same as a scene heading.
_Avoid_: Heading, chapter (unless the product explicitly adopts “chapter” in UI).

**Synopsis**:
A Fountain summary line prefixed with `=`; used for outlining, not rendered as script body in standard screenplay layout.
_Avoid_: Summary, note.

**Note**:
A Fountain comment in `[[double brackets]]`; production or author notes, not part of the performed script.
_Avoid_: Comment, annotation.

**Title page**:
Fountain metadata at the top of a file (`Title:`, `Author:`, `Draft date:`, etc.) before the first scene.
_Avoid_: Front matter, metadata block.

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

### Engineering workflow (this repo)

**Feature** (issue tracker):
A body of work tracked under `.scratch/<feature-slug>/` (PRD plus numbered issue files). See `docs/agents/issue-tracker.md`.
_Avoid_: Epic, ticket (unless quoting an external tracker).

**Triage status**:
One of `needs-triage`, `needs-info`, `ready-for-agent`, `ready-for-human`, `wontfix` on a local issue file. See `docs/agents/triage-labels.md`.
_Avoid_: Label, state (alone — be explicit which role).
