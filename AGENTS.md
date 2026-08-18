<!-- nx configuration start-->
<!-- Leave the start & end comments to automatically receive updates. -->

# General Guidelines for working with Nx

- For navigating/exploring the workspace, invoke the `nx-workspace` skill first - it has patterns for querying projects, targets, and dependencies
- When running tasks (for example build, lint, test, e2e, etc.), always prefer running the task through `nx` (i.e. `nx run`, `nx run-many`, `nx affected`) instead of using the underlying tooling directly
- Prefix nx commands with the workspace's package manager (e.g., `pnpm nx build`, `npm exec nx test`) - avoids using globally installed CLI
- You have access to the Nx MCP server and its tools, use them to help the user
- For Nx plugin best practices, check `node_modules/@nx/<plugin>/PLUGIN.md`. Not all plugins have this file - proceed without it if unavailable.
- NEVER guess CLI flags - always check nx_docs or `--help` first when unsure

## Scaffolding & Generators

- For scaffolding tasks (creating apps, libs, project structure, setup), ALWAYS invoke the `nx-generate` skill FIRST before exploring or calling MCP tools

## When to use nx_docs

- USE for: advanced config options, unfamiliar flags, migration guides, plugin configuration, edge cases
- DON'T USE for: basic generator syntax (`nx g @nx/react:app`), standard commands, things you already know
- The `nx-generate` skill handles generator discovery internally - don't call nx_docs just to look up generator syntax

<!-- nx configuration end-->

## Git commits

Use [Conventional Commits](https://www.conventionalcommits.org/) for every commit.

- Format: `<type>(<scope>): <imperative summary>` — scope optional; no trailing period on subject
- Types: `feat`, `fix`, `refactor`, `perf`, `docs`, `test`, `chore`, `build`, `ci`, `style`, `revert`
- Subject: imperative mood (`add`, `fix`, `remove`), ≤72 characters
- Body: only when the _why_ is not obvious from the subject (breaking changes, migrations, issue links)
- Examples: `feat(editor): add scene heading node`, `chore: add pre-commit hooks`, `docs: update CONTEXT glossary`

Do not use prose subjects like `Add …` or `Update …` without a type prefix.

## Test-driven development

Use **red–green–refactor** TDD when adding or changing behaviour (see the `tdd` skill):

1. **Red** — one failing test for one behaviour, via the public interface.
2. **Green** — minimal code to pass that test only.
3. **Refactor** — clean up while tests stay green; never refactor on red.

Work in **vertical slices** (one test → one implementation), not horizontal batches of tests then code.

Tests must follow **Arrange–Act–Assert** (see `.cursor/rules/test-aaa-format.mdc`): separate Arrange, Act, and Assert blocks with a blank line between each; one Act per test; name the outcome (`result`, `output`, etc.) before asserting.

## Tests and Storybook

- Every source file except barrel `index` files must have a corresponding unit test file (same stem, `.spec.ts` / `.spec.tsx` / `.test.ts` / `.test.tsx`).
- Every visual component (design-system or otherwise) must have a corresponding Storybook file (`.stories.tsx`).

## Lint

Oxlint owns code-quality rules (React, a11y, import, Vitest, TypeScript). ESLint stays only for `@nx/enforce-module-boundaries` and `@nx/dependency-checks`. Do not delete ESLint. Do not enable oxfmt (Prettier formats). Root `.oxlintrc.json` + `.vscode` (`oxc.oxc-vscode`, `oxc.enable.oxfmt: false`) are specified in the auth/design-system map; apply on execute, not before.

## CSS

Do not add custom classes in raw CSS when Tailwind utilities (or existing `@lambda/theme` `@utility` classes) can express the same thing. Raw CSS is allowed only when the need cannot be solved with Tailwind — for example canvas/print layout math, third-party element styling you do not control, or `@font-face` / `@page`.

## Nx module boundaries

Do **not** recreate `@lambda/shell` or a catch-all `Shell` component. Apps compose providers and routes at the composition root (`App.tsx`, or `layout.tsx` when that app uses Next).

One package, one job. If a lib is growing a second job, split it. Do not dump session, chrome, auth, and routes into one module “for convenience.”

Canonical packages (see ADR 0007):

- `@lambda/auth` — better-auth config and client helpers. No screens.
- `@lambda/auth-forms` — sign-in and sign-up screens.
- `@lambda/form` — headless form abstraction (react-hook-form + Zod `useForm({ schema })`, Planria-shaped `Form` / `FormField`). Visual field chrome lives in `@lambda/design-system`.
- `@lambda/design-system` — React primitives (including **liquid-metal buttons** — prototype variant A: full-rim chrome, pill + circle, no glass/ghost `.ui-button`). Depends on `@lambda/theme` and `@lambda/form`.
- `@lambda/theme` — CSS tokens (oklch `:root` / `.dark`), **Nunito** for UI heading and body, and `ThemeProvider` (shadcn/next-themes: `attribute="class"`, system, `disableTransitionOnChange`).
- `@lambda/lambda-api` — `LambdaApi` contract + provider.
- `@lambda/script-session` — script open/save/library session.
- `@lambda/editor-zoom` — zoom math, storage, surface.
- `@lambda/welcome` — welcome screen.
- `@lambda/script-workspace` — script page, toolbar, title-page and export dialogs.
- `@lambda/preview-workspace` — preview page (uses `@lambda/print`).
- `@lambda/command-palette` — command palette.
- `@lambda/application-menu` — File/Edit/View definitions and accelerators.
- `@lambda/collab` — Yjs document, provider, Neon persistence, awareness (cursors/presence), comment-range model for **Stored scripts**. No editor UI.
- `@lambda/editor`, `@lambda/print`, `@lambda/fountain` — unchanged jobs.

**Account** identity tables live on **Neon Postgres** (ADR 0008). `@lambda/auth` runs in **Lambda Web** (Next.js on Vercel, ADR 0009). Do not add a second web app. Do not deploy web to Cloudflare Pages.

`auth-forms` may depend on `auth`, `form`, `design-system`, `theme`. `auth` must not depend on `auth-forms`, `design-system`, or feature packages. `WindowDragRegion` stays in Electron window chrome. Do not compose welcome/workspace/auth-forms in an Electron renderer (ADR 0010).

Screenplay typefaces and preview sheet canvas stay with editor/print; they do not inherit Nunito or the magenta primary unless a later decision says so.

## Learned User Preferences

- Planned **Lambda Web** (`@lambda/web`, Next.js) should target full desktop writing parity plus marketing and auth: welcome/script workspace, keyboard shortcuts, export settings, and desktop-style chrome.
- Web app file I/O should use progressive enhancement: File System Access API where supported, pick-and-download fallback elsewhere.
- When committing, put unrelated changes (e.g. `CONTEXT.md`, IDE settings, `.cursor/plans`, hooks, lockfile) in separate commits rather than bundling with feature work or amending.
- Playwright e2e runs as a separate required PR check, not in the local `typecheck,lint,test` quality gate.
- New modals should use the shared `ModalDialog` in `@lambda/design-system` (`@base-ui/react/dialog`), not bespoke per-screen dialog styling.
- Title page metadata is edited via the Title Page dialog, not inline Fountain key lines in the editor.
- Fountain force prefixes (`!`, `@`, `>`, `.`, `~`, etc.) must not appear in preview or PDF output.
- Preview workspace should show white script sheets on the light grey editor canvas (`#e8e8ec`), regardless of system dark mode.

## Learned Workspace Facts

- `apps/web` is **Lambda Web** (Next.js, ADR 0009 — Vite SPA until that migrate). `apps/desktop` is a thin Electron window that `loadURL`s that origin (`http://localhost:4300` unpackaged; `LAMBDA_WEB_ORIGIN` when packaged) and caches it in `persist:lambda-web` (ADR 0010). **Do not ship the Next.js build inside the macOS app.**
- `@lambda/desktop` dev unsets `ELECTRON_RUN_AS_NODE` in its Nx command; Electron startup fails if this env var is set in the shell.
- `apps/web` deploys to **Vercel** (Next.js). Cloudflare Pages / wrangler for web is withdrawn (ADR 0009).
- Playwright e2e lives in `@lambda/web-e2e`; bootstrap routes and APIs are gated with `VITE_E2E=1` and excluded from production builds.
- `@lambda/print` owns preview/PDF sheet assembly; `@lambda/editor` owns pagination (ADR 0005).
- Script session `pageFormat` and `typeface` drive editor metrics, preview, and export; defaults load from Slugline Document Settings in the `.fountain` file.
- Preview renders at 100% canonical layout; editor zoom does not carry over (ADR 0003/0005).
- Desktop PDF export may still use Electron `printToPDF` on the loaded **Lambda Web** contents; the in-page path is `window.print()` with print `@page` CSS.
- Import `@lambda/print/styles.css` from the app composition root (or `@lambda/theme`) so Tailwind emits preview/print utilities; component-only CSS imports do not reach the app bundle.
- `(CONT'D)` and `(MORE)` are display-only enrichments from two-pass pagination (`paginate` → `enrichBlocks` → `paginate`); strip stale `(CONT'D)` from authored character cues before re-applying rules.
- Scene-continuity `(CONT'D)` applies only when the same character returns after non-empty action with no other speaker in between (per `CONTEXT.md`).
- Fountain paragraph spacing is stored as empty `action` blocks; pagination and preview must preserve their 12pt line height.
