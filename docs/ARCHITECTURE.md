# Architecture and source contract

```text
Existing local Mac (read-only boundary)
 DEX Screener -> research/risk -> shared paper ledger
                              -> six isolated evaluation books
                    | Minecraft bridge (private loopback)
                    | GET /api/state + selected durable records
                    v
 Dedicated publisher -> SQLite outbox -> signed outbound HTTPS
                                          |
                                   Vercel POST /api/ingest
                                          |
                            strict Zod schema + HMAC + size cap
                                          |
                       transactional Supabase RPC: nonce/rate/idempotency
                                          |
                       public_events + latest publisher_status
                                          |
                      bounded GET /api/events and GET /api/status
                                          |
                         Next.js spectator UI + 15-second polling
                          + optional Broadcast invalidations
```

The frontend never receives database secrets. All database tables have RLS and no anon/authenticated table grants. A service role is held only in server provider settings. The ingestion RPC is executable only by the service role. Spectators cannot issue engine commands or write through the website. No wallet, signing or real trade API exists.

Broadcast messages contain only a refresh hint. The browser ignores any claimed event data from a broadcast and refetches authoritative records through the server. This also prevents public-channel spoofed messages from being treated as fills. Subscription/reconnection and a fixed 15-second polling fallback recover missed notifications. Delayed snapshots cannot overwrite newer ones, though delayed event history is accepted. Same event IDs are immutable (`ON CONFLICT DO NOTHING`). Mutated duplicate payloads do not revise old receipts.

`LIVE` requires an engine source timestamp no older than 90 seconds. `STALE` covers 90–300 seconds; older, future or disconnected observations are `OFFLINE`. Market freshness has its own source timestamp. The game can be offline while the site stays accessible. The deployed historical fallback is real sanitized evidence, never generated development data.

## Inspected source

Source commit at inspection: `266fa6f4d6648078a4b0cbc2ffcc8d34aade99cd`, with additional current working-tree changes. Inspected `README.md`, `AGENTS.md`, `src/server.js`, `src/team.js`, `src/paper.js`, `src/config.js`, `src/evaluation.js`, `src/strategies.js`, source evidence images and runtime `gradle.properties`/LICENSE. Documentation is not assumed current when concrete source differs.

`GET /api/state`: product/execution, market.mode/connection/lastSuccessAt, ts, portfolio, leaderboard.rows, agents and events. Raw infrastructure, source excerpts, display objects and internal errors are not public payloads.

`data/state.json`: `version`, `ledger[]`, `positions[]`, `cashUsd`, `startingUsd`. Receipts have `id`, `ts`, `side`, `symbol`, `address`, `qty`, `priceUsd`, `notionalUsd`, `feeUsd`, `realizedUsd`, `reason`, `pairUrl`. The API only exposes 25 of them; reading the durable file recovers the full ledger.

`data/state.evaluations.json`: mode, strategies keyed by the original saved IDs. Each book has its own ledger. Decisions contain `at`, `quoteAt`, `mint`, symbol, signal, reasons and evidence. Do not confuse `at`/`mint` with shared receipt `ts`/`address`.

The source has 12 active seats but only 11 requested personas: `byte` is still Byte. JACOB is presented as planned. TOLY/MERT/RAJ/Byte currently display diagnostics; no autonomous code edits/builds are claimed. The generic publisher retains stable IDs.

## Future execution boundary

Market data, research, decisioning, risk, paper execution and public reporting are separate concepts. The public report schema describes observations, not executable requests. A future live execution adapter must be a separate service with explicit opt-in, local signing, permission isolation, transaction verification and kill switches. No implementation or approval is implied. It must not be bolted onto public event ingestion. The website must never become a wallet custodian.
