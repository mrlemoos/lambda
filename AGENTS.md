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

## Learned User Preferences

- Planned web app (`apps/web`) should target full desktop parity: welcome/script workspace, keyboard shortcuts, export settings, and desktop-style chrome.
- Web app file I/O should use progressive enhancement: File System Access API where supported, pick-and-download fallback elsewhere.
- When committing, put unrelated changes (e.g. `CONTEXT.md`, IDE settings, `.cursor/plans`, hooks, lockfile) in separate commits rather than bundling with feature work or amending.
- Playwright e2e runs as a separate required PR check, not in the local `typecheck,lint,test` quality gate.
- New modals in `@lambda/shell` should use the shared `ModalDialog` wrapper (`@base-ui/react/dialog`), not bespoke per-screen dialog styling.
- Title page metadata is edited via the Title Page dialog, not inline Fountain key lines in the editor.
- Fountain force prefixes (`!`, `@`, `>`, `.`, `~`, etc.) must not appear in preview or PDF output.
- Preview workspace should show white script sheets on the light grey editor canvas (`#e8e8ec`), regardless of system dark mode.

## Learned Workspace Facts

- `apps/web` and `apps/desktop` compose `@lambda/shell`; root `pnpm dev` serves web, `pnpm desktop` serves desktop.
- `@lambda/desktop` dev unsets `ELECTRON_RUN_AS_NODE` in its Nx command; Electron startup fails if this env var is set in the shell.
- `apps/web` deploys to Cloudflare Pages via wrangler (`pnpm nx deploy @lambda/web`); static build output is `apps/web/dist/`.
- Playwright e2e lives in `@lambda/web-e2e`; bootstrap routes and APIs are gated with `VITE_E2E=1` and excluded from production builds.
- `@lambda/print` owns preview/PDF sheet assembly; `@lambda/editor` owns pagination (ADR 0005).
- Script session `pageFormat` and `typeface` drive editor metrics, preview, and export; defaults load from Slugline Document Settings in the `.fountain` file.
- Preview renders at 100% canonical layout; editor zoom does not carry over (ADR 0003/0005).
- Desktop PDF export uses Electron `printToPDF`; web uses `window.print()` with print `@page` CSS.
- Import `@lambda/print/styles.css` from `@lambda/shell/src/styles.css` so Tailwind emits preview/print utilities; component-only CSS imports do not reach the shell bundle.
- `(CONT'D)` and `(MORE)` are display-only enrichments from two-pass pagination (`paginate` → `enrichBlocks` → `paginate`); strip stale `(CONT'D)` from authored character cues before re-applying rules.
- Scene-continuity `(CONT'D)` applies only when the same character returns after non-empty action with no other speaker in between (per `CONTEXT.md`).
- Fountain paragraph spacing is stored as empty `action` blocks; pagination and preview must preserve their 12pt line height.
