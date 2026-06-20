# ADR 0002: Lambda Web shared writing shell

**Status:** Accepted  
**Date:** 2026-06-20

## Context

Lambda ships today as an Electron app (`apps/desktop`) wrapping `@lambda/editor` and `@lambda/fountain`. We want **Lambda Web** — a browser deployment with the closest practical parity to desktop.

Alternatives considered:

1. **Web-only duplicate** of the desktop renderer; extract shared code later.
2. **Shared `@lambda/shell` package** extracted whilst building web; desktop migrates in the same work.
3. **Editor-only web page** without welcome/session/file chrome.

Full parity includes the **Writing shell** (welcome, script workspace, file I/O, **Application menu**, shortcuts, unsaved prompts). Long-term target also covers export settings and desktop-style chrome as they land on desktop. V1 matches desktop **as it exists today** — export settings ship when desktop does, not as a web-only spike.

Web-specific forks: no native OS menu or file paths; offline/PWA; deployment host; how Edit commands reach TipTap without Electron roles.

## Decision

### Architecture

- Extract **`@lambda/shell`**: session (`ScriptSessionContext`), welcome/script pages, shared styles, route tree, **Application menu** definitions, and a **`LambdaApi`** interface (open/save dialogs, read/write, title, file-command listeners).
- **Platform adapters stay thin in each app**: Electron preload/IPC in `apps/desktop`; browser File System Access API with pick-and-download fallback in `apps/web`. Shell has no Electron or FSAA dependencies.
- **Shared routes, platform routers**: shell exports pages and routes; desktop keeps `HashRouter`; web uses `BrowserRouter` with SPA fallback.
- **Shared shell styles** move into `@lambda/shell`; platform overrides remain (e.g. macOS drag region, `data-platform='darwin'` rules). Web adds in-app menu-bar styles.

### Lambda Web behaviour

- **File I/O**: progressive enhancement — File System Access API where supported; `<input type="file">` + programmatic download elsewhere.
- **Application menu**: in-app **File | Edit** bar on web (same labels and shortcuts as desktop); `document.title` mirrors desktop window title (`formatWindowTitle`).
- **Edit commands**: `@lambda/editor` exposes a command bridge (`ScriptEditorCommandsProvider` / `useScriptEditorCommands`) for undo, redo, cut, copy, paste, selectAll. Desktop keeps native Edit roles in v1; web menu uses the bridge.
- **Deploy**: Cloudflare Pages static SPA (`_redirects` or equivalent for client-side routing).
- **Offline**: PWA/service worker deferred until shell parity is stable; v1 is an online SPA.

### Implementation order

1. **PR1** — extract `@lambda/shell`, migrate `apps/desktop` renderer; existing desktop tests stay green.
2. **PR2** — scaffold `apps/web`, browser `LambdaApi`, Cloudflare config, web **Application menu**.

## Consequences

**Positive**

- One source of truth for session, unsaved flows, and shell UI across desktop and web.
- Shell is testable in jsdom with a mock `LambdaApi`; adapters are small and swappable.
- Desktop-first extraction de-risks web work — web becomes a thin composition layer.

**Negative**

- `@lambda/shell` is a new boundary to maintain; desktop renderer moves in PR1 before web exists.
- Web file I/O degrades on Safari/Firefox (re-save requires download); authors need to understand the fallback.
- Edit menu behaviour differs slightly in v1 (Electron roles vs editor command bridge) until optionally unified later.

**Out of scope for v1**

- Export settings dialog (ships with desktop, then shared in shell).
- PWA install and offline caching.
- Cloud sync, auth, preview/print/PDF export.
