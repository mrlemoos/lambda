# ADR 0008: Account identity on Neon Postgres

**Account** users and sessions persist in **Neon** (Lakebase Postgres), provisioned through the **Vercel Marketplace** (`vercel integration add neon`). **Lambda Web** is the Next.js host (ADR 0009) and talks to this store; Cloudflare Pages is not the identity database. Desktop uses the same store over HTTPS. **Stored script** schema is out of this ADR.

Neon **Auth** (managed Better Auth flag on the Marketplace resource) is **off**. Credentials stay **email and password** in `@lambda/auth` (better-auth) per ADR 0006.

**Status:** Accepted  
**Date:** 2026-08-18
