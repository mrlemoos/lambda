# ADR 0014: Thirty-day sliding Account session

**Account** session is a 30-day **sliding** cookie on the **Lambda Web** origin. No remember-me control — sessions persist until expiry or sign-out. Electron uses a persistent partition so it is the same cookie, not a second session store.

**Status:** Accepted  
**Date:** 2026-08-18
