# ADR 0011: Stored scripts use Yjs from v1

**Paid storage** is sold for **Collaboration**. Whole-document replace would not be a product. **Stored script** updates are **Yjs** operations from v1. Persist Yjs updates plus periodic snapshots in **Neon**. Sync over a Hocuspocus-class WebSocket on **Lambda Web**. Offline: local Yjs persistence, then replay. Fountain remains export/interchange. Unpaid writing uses the **Local script library** only (Fountain). **Store** (paid) promotes that Script in place: the Y.Doc becomes the only home; IndexedDB is cache, not a second document. No silent dual-write. `@lambda/collab` owns the Yjs document/provider; `@lambda/editor` stays the TipTap surface.

**Status:** Accepted  
**Date:** 2026-08-18
