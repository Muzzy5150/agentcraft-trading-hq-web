# Verification — 2026-10-22

## Completed checks

- TypeScript strict check: passed.
- ESLint: passed after correcting hook scheduling and form labels.
- Production Next.js build: passed, including all 12 statically generated profiles and server API routes.
- Unit and database tests: 11 passed. Embedded Postgres applies the actual migration, with only the Supabase Broadcast function stubbed. Signed route-to-SQL tests cover authentication, strict validation, duplicate immutability, nonce replay, delayed snapshots, rate limits and denial of anonymous SQL/RPC access. This is not a claim of hosted Supabase validation.
- Browser suite: 12 passed across desktop Chromium and mobile Chromium emulation. Includes home/navigation, all profiles, 6/2/4 grouping, pagination, token/type filtering, receipt details, API outage/recovery, no horizontal document overflow, offline labeling and download gates. Test-only failure interception never enters public data.
- Visual review: actual desktop and mobile screenshots inspected. Replaced blurry skin thumbnails with center-cropped genuine in-game front captures. Screenshot originals remain untouched. Updated provenance records describe the crop.
- Reporting-kit packaging: allowlisted 17-file manifest, ZIP and SHA-256 checksum created. Clean macOS extraction and `setup.sh` installation succeeded; adapter loads; queue starts empty; no game ledger exists in the extraction. Windows installation and full HQ installation are not verified.
- Production dependency audit: zero known vulnerabilities reported by `npm audit --omit=dev`. Full development dependency audit reports five high-severity transitive findings through ESLint's glob/braces dependency. The registry offers no compatible patched braces release; the automated suggested downgrade of Next's lint config was not applied. These tools process developer-controlled globs, are not included in public runtime routes, and need follow-up when an upstream patch is available.
- Credential-pattern scan of code, docs and public JSON: no credential signatures found. `.env.local`, `.vercel`, `.publisher`, runtime queues and release staging are ignored. No source-project secrets or unrestricted logs are included.

## Honest data state

Historical import: 10 shared-account paper receipts, 600 retained evaluation decisions, 0 isolated evaluation fills. Realized shared P&L from recorded exits is -$16.97. No fresh marked equity, rank, win rate or hypothetical profits are invented. Original shared receipts have no agent ID and remain unattributed. Source timestamp is preserved in the imported snapshot; timestamps are UTC.

The game API did not respond at inspection. The existing game was neither started nor stopped. Durable history was opened read-only. No command wrote into the source project or runtime, reset a ledger, altered a strategy, touched a world or configured a wallet. Other ongoing user work may change that project independently; no claim of a frozen source working tree is made.

## Deployment and external limits

Dedicated Vercel project: `agentcraft-trading-hq-web`, team `muzzy5150s-projects`, Node 24. Connector creation was denied; the mapped CLI fallback succeeded. Vercel assigned the first deployment to production automatically; it used the wrong “Other” framework preset and returned 404. Explicit Next.js configuration and project settings corrected this; a new explicit preview was built for verification before a replacement production deployment.

Supabase project creation is pending provider terms acceptance. The attempt used only the requested new name `agentcraft-trading-hq`, region sfo1; no other project's database was reused. No hosted database, hosted real-time subscription or source-to-cloud continuous publisher has been claimed as connected. Ingestion fails closed with 503 until configured. Public pages remain useful through their genuine historical fallback.

No real stream was configured or started. Official Twitch/YouTube embed configuration and offline fallback are implemented. Configured means configured, never automatically LIVE.

Full Windows/macOS Minecraft HQ packages remain unavailable pending runtime redistribution provenance, generic models and clean installation verification. Only the standalone reporting kit has been locally packaged and installed. JACOB's requested persona remains a planned website profile; source Byte was not changed.

Corrected preview verified: `https://agentcraft-trading-hq-dxwomt5um-muzzy5150s-projects.vercel.app` returned HTTP 200 for `/`, `/agents/alon`, `/api/health` and `/api/events?type=paper_fill`. Health truthfully reports database not configured, and events report 10 historical fills. Preview protection was accessed through the authenticated Vercel CLI, not disabled.

Final public deployment verified without authentication: https://agentcraft-trading-hq-web.vercel.app . Production deployment `dpl_7yXVwaiVuFfvWjuWdFNAjPYvBXw1`. Public `/api/health` returned HTTP 200 with `PAPER ONLY`, `database: not configured` and `historicalFallback: true`. All 12 Playwright tests then passed against the public production URL (desktop and mobile), including every agent profile and actual API/filter interactions. Final production screenshots are in `docs/screenshots/`.
