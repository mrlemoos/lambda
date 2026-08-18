# ADR 0007: Kill `@lambda/shell`; compose small packages at the app root

`@lambda/shell` is a mega-module (session, zoom, welcome, script workspace, preview, palette, menus, dialogs). This effort splits it and **deletes the package**. **Lambda Web** composes providers and routes at the Next.js `layout.tsx` (ADR 0009). Desktop does **not** compose those packages again — it loads Lambda Web (ADR 0010). Do not recreate a `Shell` component or `@lambda/shell` lib. Auth, forms, theme, and design system are separate packages (`@lambda/auth`, `@lambda/auth-forms`, `@lambda/form`, `@lambda/design-system`, `@lambda/theme` with `ThemeProvider` + the oklch token set + Nunito). Feature chrome from the old shell lands in `@lambda/lambda-api`, `@lambda/script-session`, `@lambda/editor-zoom`, `@lambda/welcome`, `@lambda/script-workspace`, `@lambda/preview-workspace`, `@lambda/command-palette`, `@lambda/application-menu`. `ModalDialog` and other primitives go to `@lambda/design-system`. `WindowDragRegion` stays in the desktop **window chrome**, not a second app tree.

**Status:** Accepted  
**Date:** 2026-08-18
