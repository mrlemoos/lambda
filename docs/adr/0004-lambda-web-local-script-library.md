# ADR 0004: Lambda Web local script library

**Status:** Accepted  
**Date:** 2026-06-20

## Context

ADR 0002 established Lambda Web file I/O as progressive enhancement: File System Access API (FSAA) where supported; `<input type="file">` + programmatic download elsewhere. In practice, the download fallback means every **Save** triggers a new file download on Safari/Firefox — unusable for iterative writing. Even on Chromium, a brand-new script has no file handle until **Save As**, and in-memory session state is lost on reload.

Lambda Web’s welcome screen promises “Save locally. Nothing leaves your machine.” Authors need a browser-native workspace where **Scripts** persist across sessions without re-downloading on every edit.

Alternatives considered:

1. **Keep ADR 0002 model; fix download UX only** — debounce downloads, warn authors, or rename files with timestamps. Still treats disk as the write target; does not survive reload without FSAA; poor experience on Safari/Firefox.
2. **FSAA-first with ongoing disk link** — **Open** registers a file handle; **Save** writes back to disk when permitted. Matches desktop mental model on Chromium but reintroduces sync/conflict edge cases and does not help Safari/Firefox authors.
3. **Browser store always canonical; disk is export-only** — **Local script library** in the browser; **Save** never touches disk; **Save As** is explicit export. Disk imports are one-time snapshots, not live links.
4. **Cloud sync backend** — durable multi-device storage. Out of scope (ADR 0002); contradicts local-first positioning for v1.

Desktop (`apps/desktop`) already writes directly to the filesystem via Electron IPC. This ADR applies to **Lambda Web only**.

## Decision

Introduce a **Local script library** — a browser-persisted collection of **Scripts** — as the canonical write target on Lambda Web. Disk remains interchange (import/export), not the live editing surface.

### Storage and scope

- Persist library entries in **IndexedDB** (implementation detail; not exposed in product language).
- Hold untitled in-progress drafts in **session storage** only (same-tab refresh recovery; never listed in the library).
- **Last write wins** across browser tabs; no cross-tab coordination in v1.

### Save semantics (web only)

- **Save** (⌘S): persist silently to the local script library. Never triggers a programmatic download.
- **Save As**: write a `.fountain` file to disk — FSAA where supported, download fallback otherwise. One-way export; no ongoing link to the library entry.
- **Autosave**: debounced writes to the library after a short idle delay; ⌘S flushes immediately.
- **Dirty indicator**: shows whilst an autosave flush is pending; clears when persisted.
- **Navigate away** (Back, New script): flush pending autosave silently; no unsaved-changes prompt unless the write fails.

Desktop **Save** / **Save As** behaviour is unchanged (disk via `LambdaApi`).

### Library lifecycle

- **New script**: editable immediately; enters the library once it has a real title (see naming below).
- **Open…**: imports a snapshot from disk into the library. The library entry and the source file are independent thereafter.
- **Auto-resume**: on return visit, reopen the last open script directly into the script workspace.
- **Welcome screen**: lists the full library (sorted by last edited, most recent first). **New script**, **Open…**, and library pickers coexist. Delete per entry with confirmation; does not remove exported disk files.

### Naming and untitled rules

Display name resolution order:

1. Fountain **Title page** `Title:` metadata (when present and non-empty).
2. Import filename (without extension) for disk imports lacking a title.
3. `"Untitled"`.

A script whose resolved display name is `"Untitled"` — including a title page whose `Title:` is literally `Untitled` or empty — is **not persisted** to the library. It survives only in session storage for the current browser session.

Duplicate display names in the welcome list are distinguished by a relative last-edited timestamp (e.g. `JULIE · 2 hours ago`). Internal IDs are opaque.

### Architecture

- Add a **`ScriptLibrary`** module in `apps/web` (or a small `@lambda/web-storage` package if shell tests need it): CRUD, autosave debounce, session-draft helpers, resume-last-script.
- Extend **`LambdaApi`** usage on web: `readFile` / `writeFile` on the browser adapter become import/export paths; session layer routes **Save** through the library on web.
- **`@lambda/shell`** session (`ScriptSessionContext`) gains a web-specific persistence hook (injected via `LambdaApi` extension or a parallel provider) so desktop code paths stay disk-centric.
- Domain terms live in `CONTEXT.md` (**Local script library**); this ADR records the trade-off, not the glossary.

### Implementation order

1. **IndexedDB store + library CRUD** — unit-tested; no UI.
2. **Web session integration** — Save/autosave/resume; untitled session-storage path.
3. **Welcome screen library list** — open, delete, duplicate-title timestamps.
4. **Save As export** — FSAA + download fallback; decouple from Save.
5. **Remove download-on-Save** from `browserLambdaApi.writeFile` for the Save path.

## Consequences

**Positive**

- Authors can write continuously on Safari/Firefox without a download per edit.
- Scripts survive reload and return visits; welcome screen becomes a useful workspace browser.
- Import/export model is simple: library is the workspace, disk is interchange — no sync conflicts.
- Aligns with “Save locally. Nothing leaves your machine.” without requiring FSAA.

**Negative**

- **Save** on web no longer matches desktop semantics (library vs disk). Authors must learn that **Save As** is how disk files are created/updated.
- ADR 0002’s “FSAA where supported, download elsewhere” applies only to **Save As**, not **Save** — a deliberate narrowing.
- Last-write-wins across tabs can lose edits if the same script is open in two tabs.
- Untitled drafts are ephemeral across browser sessions until the author sets a real title.
- Library data is cleared if the author wipes site data; no cloud backup in v1.

**Out of scope for v1**

- Desktop local library or crash-recovery drafts.
- Cross-tab live sync or single-tab lock.
- Cloud sync, auth, or multi-device access.
- Replace-on-import prompts or duplicate detection on Open.
- PWA offline caching (library works offline once loaded, but no service-worker work in this ADR).
