# Issue tracker: Local Markdown

Issues and PRDs for this repo live as markdown files in `.scratch/`.

## Conventions

- One feature per directory: `.scratch/<feature-slug>/`
- The PRD is `.scratch/<feature-slug>/PRD.md`
- Implementation issues are `.scratch/<feature-slug>/issues/<NN>-<slug>.md`, numbered from `01`
- Triage state is recorded as a `Status:` line near the top of each issue file (see `triage-labels.md` for the role strings)
- Comments and conversation history append to the bottom of the file under a `## Comments` heading

## When a skill says "publish to the issue tracker"

Create a new file under `.scratch/<feature-slug>/` (creating the directory if needed).

## When a skill says "fetch the relevant ticket"

Read the file at the referenced path. The user will normally pass the path or the issue number directly.

## Wayfinding operations

Maps and tickets live under `.scratch/<feature-slug>/`.

- **Map:** `.scratch/<feature-slug>/MAP.md`. YAML `labels` includes `wayfinder:map`.
- **Tickets:** `.scratch/<feature-slug>/issues/<NN>-<slug>.md`. YAML `labels` includes one of `wayfinder:research`, `wayfinder:prototype`, `wayfinder:grilling`, `wayfinder:task`. `parent` is a relative path to `MAP.md`.
- **Identity:** the file path is the issue id. Refer to tickets by **title**, wrapping that path.
- **Claim:** set `assignee` in the ticket YAML before work. Empty `assignee` = unclaimed.
- **Blocking:** this tracker has no native graph. Each ticket has `blocked_by:` — a YAML list of relative paths to other tickets. Empty list = unblocked.
- **Frontier:** open tickets (`status` not `closed`) with empty `blocked_by` (or every listed blocker `status: closed`) and empty `assignee`.
- **Resolution:** append under `## Resolution`, set `status: closed`, then add one gist line to the map's **Decisions so far**.
