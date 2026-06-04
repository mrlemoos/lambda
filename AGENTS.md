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
