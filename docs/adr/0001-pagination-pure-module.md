# ADR 0001: Pure-module pagination

**Status:** Accepted  
**Date:** 2026-06-04

## Context

Lambda's script editor needs Slugline 2–grade **Pagination**: automatic **Page boundary** placement, **Page number** display, line-weight rules (outline elements, split-dialogue continuation cues, title page slot, manual `===` breaks, dual-dialogue blocks), and continuous scroll on a single writing surface.

Pagination logic could live in:

1. A **pure module** over a document snapshot and theme-derived line metrics.
2. A **DOM-measured** TipTap/ProseMirror plugin that reads rendered node heights.
3. A **hybrid** of both.

Writers will rely on page breaks for pacing and industry page count. Break positions are costly to change once shipped.

## Decision

Implement pagination as a **pure module** that:

- Accepts a stable document snapshot (element types, text, structure).
- Applies screenplay layout rules and line-weight policy from `CONTEXT.md`.
- Derives line metrics from theme tokens (page format, font size, margins) — not from live DOM measurement in v1.
- Returns boundary positions consumed by a thin rendering layer (TipTap plugin or React overlay) for grey rules and top-right **Page number** labels.

Unit tests target the pure module directly; the first tracer ships engine + chrome together.

## Consequences

**Positive**

- Deterministic, fast unit tests for line weights and break positions (no font/layout flake in CI).
- Clear separation: pagination rules vs TipTap/DOM rendering.
- Aligns with existing pattern of pure `is*` classify predicates.

**Negative**

- Line metrics must be kept in sync with theme CSS; drift between computed and rendered layout is possible until validated.
- May need a follow-up calibration pass (visual regression or optional DOM audit) if print parity diverges.

**Out of scope for this tracer**

- Bottom-left current/total page status readout (separate issue).
- Preview/Print/PDF export pagination (export tools are out of scope for editor parity).
