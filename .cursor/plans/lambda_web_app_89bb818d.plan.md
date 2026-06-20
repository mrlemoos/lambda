---
name: Lambda Web App
overview: Scaffold `apps/web` as a thin Vite SPA composing `@lambda/shell`, implement a browser `LambdaApi` adapter (FSAA + fallback), add the missing editor command bridge for Edit menu parity, and wire Cloudflare Pages SPA routing so `pnpm dev` works.
todos:
  - id: scaffold-web
    content: Scaffold apps/web with Nx Vite React app, wire @lambda/shell composition, stub browserLambdaApi, smoke test
    status: completed
  - id: browser-lambda-api
    content: Implement browserLambdaApi (FSAA + file-input/download fallback) with Vitest coverage
    status: completed
  - id: editor-commands
    content: Add ScriptEditorCommandsProvider/useScriptEditorCommands to @lambda/editor via ScriptEditorSurface
    status: completed
  - id: application-menu
    content: Build ApplicationMenuBar with File/Edit menus, shortcuts, and web menu styles
    status: completed
  - id: cloudflare-deploy
    content: Add public/_redirects SPA fallback and confirm Nx build output for Cloudflare Pages
    status: completed
  - id: quality-gate
    content: Run full typecheck/lint/test gate; verify pnpm dev and pnpm desktop
    status: completed
isProject: false
---

# Lambda Web (`apps/web`) — PR2 plan

Per [ADR 0002](docs/adr/0002-lambda-web-shared-shell.md), PR1 is done: [`@lambda/shell`](packages/shell/src/index.ts) owns session, pages, routes, styles, and `LambdaApi` types. PR2 adds the browser app as a thin composition layer — same writing shell as desktop, different platform adapter and chrome.

Root [`package.json`](package.json) already expects `pnpm dev` → `@lambda/web`; this plan makes that real.

## Target architecture

```mermaid
flowchart TB
  subgraph web [apps/web]
    BrowserApi[browserLambdaApi]
    MenuBar[ApplicationMenuBar]
    App[BrowserRouter App]
  end
  subgraph shell [@lambda/shell]
    Provider[LambdaApiProvider]
    Session[ScriptSessionProvider]
    Routes[ShellRoutes]
  end
  subgraph editor [@lambda/editor]
    Commands[ScriptEditorCommandsProvider]
    Surface[ScriptEditorSurface]
  end
  App --> Provider
  Provider --> BrowserApi
  App --> MenuBar
  App --> Session
  Session --> Routes
  Routes --> Surface
  Surface --> Commands
  MenuBar -->|"File cmds"| BrowserApi
  MenuBar -->|"Edit cmds"| Commands
```

**Desktop contrast** ([`apps/desktop/src/renderer/app/App.tsx`](apps/desktop/src/renderer/app/App.tsx)): `HashRouter`, `window.lambda` preload, native OS menu, `WindowDragRegion`. Web drops drag region; adds in-app menu bar; uses `BrowserRouter`.

## Vertical slices (TDD)

Work one behaviour at a time: failing test → minimal implementation → refactor. Run `pnpm nx affected -t typecheck,lint,test --nxBail` after each slice.

---

### Slice 1 — Scaffold `@lambda/web`

**Generator** (via `nx-generate` skill):

```bash
pnpm nx g @nx/react:application \
  --directory=apps/web \
  --name=@lambda/web \
  --bundler=vite \
  --unitTestRunner=vitest \
  --linter=eslint \
  --e2eTestRunner=none \
  --routing=false \
  --style=css \
  --no-interactive
```

**Post-scaffold adjustments:**

| File                                                   | Purpose                                                                                                                                                              |
| ------------------------------------------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| [`apps/web/project.json`](apps/web/project.json)       | `"name": "@lambda/web"` (parity with package.json)                                                                                                                   |
| [`apps/web/package.json`](apps/web/package.json)       | `"name": "@lambda/web"`, deps: `@lambda/shell`, `@lambda/editor`, `@lambda/theme`; devDeps: `@tailwindcss/vite`, `tailwindcss`                                       |
| [`apps/web/vite.config.mts`](apps/web/vite.config.mts) | `@tailwindcss/vite` + `@vitejs/plugin-react`; **port `4300`** (desktop test vite uses `4200`); `build.outDir` → `dist/apps/web` or generator default                 |
| [`tsconfig.json`](tsconfig.json)                       | Add project reference to `apps/web`                                                                                                                                  |
| ESLint                                                 | Reuse desktop/shell pattern: filter incompatible `react/` rules from `nx.configs['flat/react']` ([`apps/desktop/eslint.config.mjs`](apps/desktop/eslint.config.mjs)) |

**Minimal app** (`apps/web/src/main.tsx`, `apps/web/src/app/App.tsx`):

- Import `@lambda/shell/styles.css`
- Set `document.documentElement.dataset.platform = 'web'`
- Compose:

```tsx
<BrowserRouter>
  <LambdaApiProvider api={browserLambdaApi}>
    <ScriptSessionProvider>
      <ShellRoutes />
    </ScriptSessionProvider>
  </LambdaApiProvider>
</BrowserRouter>
```

**Red:** smoke test that `App` renders welcome heading with mocked `browserLambdaApi`.

**Green:** scaffold + stub `browserLambdaApi` (no-op promises, `platform: 'web'`) so `pnpm dev` serves the welcome screen.

---

### Slice 2 — Browser `LambdaApi` adapter

Implement `apps/web/src/lib/browserLambdaApi.ts` implementing [`LambdaApi`](packages/shell/src/lib/api.ts).

**Internal model** (not exposed to shell):

- `Map<string, FileSystemFileHandle>` keyed by `file.name` for FSAA re-save
- `fallbackMode: boolean` when `window.showOpenFilePicker` is unavailable
- `fileCommandListeners: Set<...>` for `onFileCommand` (menu + keyboard shortcuts dispatch here, same as Electron IPC)

**Methods:**

| Method                  | FSAA (Chrome/Edge)                                                                     | Fallback (Safari/Firefox)                     |
| ----------------------- | -------------------------------------------------------------------------------------- | --------------------------------------------- |
| `showOpenDialog`        | `showOpenFilePicker({ types: [{ accept: { 'text/plain': ['.fountain', '.txt'] } }] })` | Hidden `<input type="file">` click            |
| `readFile(path)`        | Lookup handle by name → `getFile()` → `text()`                                         | Read from last-selected `File` blob           |
| `showSaveDialog(name)`  | `showSaveFilePicker(...)` or re-use open handle                                        | Return synthetic name; save triggers download |
| `writeFile(path, text)` | Write via `createWritable()` on stored handle                                          | `Blob` + `<a download>` programmatic save     |
| `setWindowTitle(title)` | `document.title = title`                                                               | same                                          |
| `onFileCommand`         | Subscribe/unsubscribe pattern                                                          | same                                          |

**Red tests** (`apps/web/src/lib/browserLambdaApi.spec.ts`):

- `setWindowTitle` sets `document.title`
- FSAA open → read returns file text; write persists via mock handle
- Fallback when `showOpenFilePicker` undefined → open uses file input; save triggers download link
- `onFileCommand` notifies listeners

**Note:** Shell uses `filePath` as display/save key ([`ScriptSessionContext`](packages/shell/src/session/ScriptSessionContext.tsx)); web adapter uses **file name** as the path string (ADR: no native paths). Document this in a one-line comment on the adapter.

---

### Slice 3 — Editor command bridge (prerequisite for Edit menu)

**Gap:** ADR references `ScriptEditorCommandsProvider` / `useScriptEditorCommands` but they **do not exist** in [`@lambda/editor`](packages/editor/src/index.ts) yet.

**Add to `@lambda/editor`:**

- `ScriptEditorCommandsContext` created inside [`ScriptEditorSurface`](packages/editor/src/lib/tiptap/ScriptEditorSurface.tsx) once `useScriptEditor` resolves
- `useScriptEditorCommands()` returns `{ undo, redo, cut, copy, paste, selectAll }` — each calls `editor.chain().focus().<cmd>().run()` (TipTap history + default clipboard commands)
- Export from [`packages/editor/src/index.ts`](packages/editor/src/index.ts)

**Red tests** (`packages/editor/src/lib/tiptap/scriptEditorCommands.spec.tsx`):

- Render `ScriptEditorSurface` with initial content, type/edit, assert `undo()` restores prior state
- Assert hook throws outside provider

No shell changes required — [`ScriptPage`](packages/shell/src/pages/ScriptPage.tsx) already renders `ScriptEditorSurface`, so the provider wraps automatically.

---

### Slice 4 — In-app Application menu bar

Web-only component: `apps/web/src/components/ApplicationMenuBar.tsx`.

**File menu:** iterate [`FILE_MENU_ITEMS`](packages/shell/src/lib/applicationMenu.ts); on click, invoke `onFileCommand` listeners on `browserLambdaApi` (same path Electron menu uses via preload).

**Edit menu:** map [`EDIT_MENU_NATIVE_ROLES`](packages/shell/src/lib/applicationMenu.ts) to labels; call `useScriptEditorCommands()` (graceful no-op when not on script page / editor not mounted).

**Keyboard shortcuts:** parse `CmdOrCtrl` from accelerators; `useEffect` on `document` for `keydown` — prevent default when matched; dispatch file commands via api or edit via hook.

**Styles:** add web menu-bar rules to a new `apps/web/src/styles.css` imported after shell styles (ADR: _"Web adds in-app menu-bar styles"_). Suggested classes: `.application-menu`, `.application-menu-bar`, `[data-platform='web']` overrides so macOS drag-region rules stay inert.

**Red tests:** menu renders File/Edit labels; clicking "New" fires file command listener; shortcut `metaKey+N` dispatches `new`.

**Layout:** render `ApplicationMenuBar` above `ShellRoutes` in `App.tsx`.

---

### Slice 5 — Cloudflare Pages deploy config

V1 is an online SPA (no PWA).

- [`apps/web/public/_redirects`](apps/web/public/_redirects):

```
/*    /index.html   200
```

- Ensure Vite `base: '/'` (default)
- Nx `build` target produces static assets suitable for Cloudflare Pages (`dist/apps/web` or inferred output)
- Optional: brief note in app README or comment — deploy directory is the Nx build output path

No Wrangler required for static hosting in v1.

---

### Slice 6 — Quality gate & verify dev scripts

```bash
pnpm nx run-many -t typecheck,lint,test --nxBail
pnpm dev          # → nx dev @lambda/web on :4300
pnpm desktop      # → nx dev @lambda/desktop (unchanged)
```

Manual smoke: New script → edit → save (FSAA browser) / download (fallback); File menu shortcuts; Edit undo/redo on script page; `document.title` shows `formatWindowTitle` output.

---

## Out of scope (ADR v1)

- PWA / service worker
- Export settings dialog
- Cloud sync, auth, preview/print/PDF
- Playwright e2e for web (can follow later)

## Key files to create/modify

**Create:** `apps/web/**` (generator + adapter, menu, tests, `_redirects`)

**Modify:** [`packages/editor/src/lib/tiptap/ScriptEditorSurface.tsx`](packages/editor/src/lib/tiptap/ScriptEditorSurface.tsx), [`packages/editor/src/index.ts`](packages/editor/src/index.ts), [`tsconfig.json`](tsconfig.json)

**Unchanged:** Shell session/pages/routes — web consumes them as-is.
