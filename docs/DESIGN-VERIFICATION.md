# AgentCraft editorial redesign — 22 October 2026

The redesign takes presentation principles from the current [Minecraft website](https://www.minecraft.net/en-us): expansive game imagery, a strong wordmark, block-inspired headings, rectangular actions, spacious editorial sections, and distinct promotional chapters. No Minecraft.net layouts, logos, artwork, or assets were copied. AgentCraft uses its existing actual HQ captures and character images, with an original parchment, forest green, charcoal, warm gold, lavender and teal palette.

## What changed

- Homepage: prominent actual headquarters capture and AGENTCRAFT wordmark; four primary actions; world introduction; six large trading-character cards; separate X research and developer features; spectator promotion; real paper activity; self-hosting promotion.
- Agents: large character gallery, personality summaries, role filtering, game-capture montage and detailed profiles. All 12 profiles remain available; the existing JACOB placeholder remains explicitly planned.
- Watch: full-width cinematic broadcast stage with the unchanged player integration, followed by light spectator metrics and recorded activity.
- Trades: parchment journal, larger filters and table typography, actual HQ imagery, preserved receipts, pagination, modal detail and strategy tables. Wide tables scroll horizontally on mobile.
- Deploy: promotional game imagery, prominent Windows/macOS sections, requirements, setup guide, configuration and FAQs. Both full-HQ downloads remain disabled.

## Preservation checks

No changes to API routes, publisher code, authentication, event normalization, Supabase schema, historical JSON, stream configuration, agent data or source images. No files in the local Minecraft project were modified. Supabase remains pending at the user's direction. Historical-only/offline labels remain visible. Real paper receipts remain unattributed when the source lacks an agent ID.

## Preview gate

Preview: https://agentcraft-trading-hq-e7tu28ucc-muzzy5150s-projects.vercel.app

Deployment ID: `dpl_Cs8sKSLdYo7p2ab3fNGEze9sF1xh` — READY, preview environment. Production was not updated before this preview completed visual review.

The preview was tested through the caller's existing Vercel authentication with a short-lived development OIDC header. Deployment protection was not disabled. Authenticated Playwright traces were disabled; credentials were not written into screenshots or source code.

- TypeScript and ESLint: passed.
- Backend unit/integration suite: 11 passed, including real SQL/RLS and publisher durability checks.
- Optimized Next.js build: passed, 27 generated routes.
- Existing functional browser tests: 12 passed locally and on the preview.
- Visual route tests: 34 passed locally and on the preview (all 17 pages × desktop/mobile).
- Preview total: 46 browser tests passed. Images decoded successfully, real records loaded, and no page-level horizontal overflow occurred at the tested viewport sizes.
- Visually inspected desktop and mobile screenshots for homepage, gallery, watch, trades, deploy and all 12 profiles. Reviewed full main pages and profile composition, including data tables and empty states. Tables retain intentional internal horizontal scrolling.
- React review: retained server-rendered editorial pages; no new client fetching effects, interactive libraries, or runtime dependencies. Existing stateful filters, player and feed remain isolated client components. Image alt text, native controls, visible focus, reduced-motion preferences, and responsive navigation remain supported.

[Browse all actual preview screenshots](screenshots/redesign/README.md).

## Operational limits retained

Live Supabase persistence is not configured, the broadcast remains unconfigured, and full-HQ installer verification remains pending. These are existing operational states, not regressions introduced by this visual change. No real-money execution is offered.

## Production verification

Production: https://agentcraft-trading-hq-web.vercel.app

Deployment ID: `dpl_6Z1xd4mtq5WbUFhN9dv9vz3XNXVh` — READY, production environment. Deployed application source commit: `08ad3e25ebfd67ac56a4560d7b38101415168449`; subsequent commits add screenshot evidence and this report only.

All 46 browser tests passed against the public production alias without authentication headers. The post-deployment Vercel error-log query returned zero records for its 15-minute window. [Desktop/mobile production proof](screenshots/redesign/production-overview.webp) shows actual browser captures. Full-resolution production captures for all 17 routes remain in the local ignored `docs/screenshots/redesign-production/` directory. Preview screenshot copies are indexed above.

GitHub Actions was also triggered by the source push; it was still queued when local and production verification completed. No CI success is assumed from a queued run.
