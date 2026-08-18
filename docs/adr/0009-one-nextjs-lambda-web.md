# ADR 0009: One Next.js app for Lambda Web

Cloudflare Pages + Vite SPA (`apps/web` as a static client) cannot host better-auth. A second Next.js app for marketing/auth would split **Lambda Web**. **Lambda Web** is **one** Next.js App Router app on **Vercel**: marketing, `auth-forms`, better-auth HTTP (`@lambda/auth` + Neon), and the writing shell composed at `layout.tsx`. Keep the Nx name `@lambda/web`. Do not add `@lambda/www` or a marketing-only app. Electron loads this app in a window ([ADR 0010](./0010-electron-loads-lambda-web.md)). Connect the existing Vercel Marketplace Neon resource `lambda` to this project on execute.

**Status:** Accepted  
**Date:** 2026-08-18
