# ADR 0010: Desktop is a thin Electron window on Lambda Web

Do not maintain a second React renderer in `apps/desktop`. Do **not** put the Next.js build in the macOS/Electron app bundle. Electron only `loadURL`s **Lambda Web** (ADR 0009). After a successful load, persist that origin (service worker / Cache Storage in a durable Chromium session partition) so later launches work **offline**. First launch with no network and empty cache cannot write. Native window chrome only (frame, drag region, maybe OS menu / `printToPDF` of that webContents). Dev `loadURL`s the local Next origin; production `loadURL`s the deployed origin.

**Status:** Accepted  
**Date:** 2026-08-18
