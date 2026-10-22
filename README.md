# AgentCraft — Solana Trading HQ web

Standalone Next.js App Router website and read-only reporting publisher for the existing Minecraft HQ. The original game, paper ledger, strategies, world and wallet configuration are outside this repository and are never written by it.

## Run locally

Node 22.13+ (24 recommended).

```sh
npm ci
npm run dev
```

Open http://127.0.0.1:3000. No credentials are required to explore the sanitized real historical record snapshot. It is explicitly labeled historical/offline, not development fixtures or live performance. The import contains 10 original shared paper receipts, 600 retained evaluation decisions and no isolated strategy fills.

Routes: `/`, `/live`, `/agents`, all 12 `/agents/[slug]` profiles, `/trades`, `/deploy`. Spectator routes are read-only. The current source still has Byte in the planned JACOB seat; the site discloses this. No channel or real-money execution is configured.

## Verify

```sh
npm run typecheck
npm run lint
npm test
npm run build
npm start
# In another shell:
npx playwright install chromium
npm run test:e2e
```

The browser suite covers desktop/mobile, every profile, filtering, pagination, offline state, failures, recovery, modal details, navigation and disabled unverified downloads. The database suite executes the migration against isolated embedded Postgres with a test-only Broadcast stub; it is not proof of deployed Supabase connectivity.

## Operate and distribute

- [Architecture and exact source contract](docs/ARCHITECTURE.md)
- [Publisher setup, queue and limitations](docs/PUBLISHER.md)
- [Dedicated database, secure environments and streams](docs/OPERATIONS.md)
- [Distribution gates](docs/DISTRIBUTION.md)
- [Minecraft policy review](docs/POLICY-REVIEW.md)
- [Verification report](docs/VERIFICATION.md)
- [Third-party notices](THIRD_PARTY_NOTICES.md)

`npm run package:release` produces only a reporting-kit review ZIP. It is not a full Minecraft HQ installer. A full HQ package is intentionally unavailable pending license/provenance review, generic assets and clean installation verification. No personal ledger or custom likeness art is included in the reporting kit.

Website assets are web-optimized copies of genuine source evidence; originals remain untouched. Image provenance hashes are published in `public/data/image-provenance.json`. Source artwork and screenshots are not included under the code's MIT license.
