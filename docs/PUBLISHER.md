# Read-only outbound publisher

This is a reporting add-on for an existing AgentCraft Solana Tradecast installation. It never starts, stops, modifies or writes into the game/engine directory. It only performs GET on the loopback `/api/state` endpoint and optionally opens the explicitly configured durable JSON records for reading. No localhost service is tunneled to the public internet.

## Setup

Requires Node 22.13+ (Node 24 recommended, built-in SQLite). From a clean reporting-kit extraction run `bash scripts/setup.sh` on macOS, or `powershell -File scripts/setup.ps1` on Windows. Edit the generated `.env.local` using your local editor. Never paste secrets in chat or a Git issue.

Set `PUBLISH_URL` to your website's HTTPS `/api/ingest`; `PUBLISHER_ID=main-hq`; `SOURCE_INSTANCE_ID` to a stable unique identity for this source ledger. The original website history uses `main-hq-original`. A **new** ledger must have a new identity, or old receipt IDs could collide. Do not change identity on routine restarts.

Set `PUBLISHER_SECRET` to a cryptographically random secret of at least 32 characters, shared only with the server-side Vercel setting. `ENGINE_URL` defaults to `http://127.0.0.1:8787`; other hosts are rejected. Optionally set `ENGINE_LEDGER_PATH` and `ENGINE_EVALUATIONS_PATH` to the existing `data/state.json` and `data/state.evaluations.json`. These files are read, never copied or edited. Use only a verified LIVE-mode source ledger; fixture files are not acceptable inputs. The evaluator's persisted mode and API mode are checked. The shared ledger format itself contains no mode field, so explicit operator selection of the real ledger is required.

Launch using `bash scripts/launch-publisher.sh` or `powershell -File scripts/launch-publisher.ps1`. These start only the publisher. The existing game lifecycle remains under its own operator. A foreground process is intentional; no OS service is installed silently.

## Delivery guarantees and health

The publisher uses a private SQLite WAL database in `.publisher/`. Stable event IDs deduplicate API receipts against durable receipts. It persists the queue before sending and acknowledges only successful HTTP responses. Restart after a failed response safely retries the same event IDs. SQLite transactions protect acknowledgement and the seen-ID index. Queue capacity is 10,000 events, batches are 100, retries back off to 60 seconds. Overflow fails closed and reports retrying; full durable ledgers can be reread. The source remains untouched.

Every request is HMAC-SHA256 signed over `timestamp.nonce.body`; the server accepts a 60-second timestamp window, stores nonces transactionally and rejects replay. A rate limit of 30 authenticated batches/minute/publisher is enforced in Postgres under an advisory transaction lock. The HTTP body is capped at 256 KiB and must match the strict schema. Unknown fields, fixture mode, missing fill receipts, private paths and common credential patterns are rejected. Fields are allowlisted; arbitrary console output, raw display payloads, local paths, wallets and provider keys are never copied.

Health output contains only pending count, connection status and last successful synchronization. No request body, secret or raw exception is logged. Continuous polling resumes after transient source or backend failures. Engine-offline fallbacks preserve historical timestamps; they do not invent fresh market observations.

## Important retention limitations

The engine API exposes only the latest 25 shared receipts and 45 events. A disconnected publisher may miss older ephemeral speech; it must never claim full dialogue coverage. Configure the durable ledger to recover all shared fills. Each evaluator retains at most 100 decisions; older decisions may already have rolled off before publisher startup. This website's baseline import is an honest retained-history snapshot, not a complete research archive. Future ingestion persists records indefinitely until an explicit retention policy is implemented.

Historical receipts do not include agent attribution. The adapter keeps `agentId=null`; current strategy-to-character labels do not rewrite this. Character speech becomes `dialogue`, never a fill or factual strategy decision. Actual API trading strings are skipped because the durable receipt is authoritative. Financial source fields are preserved; missing fields remain null. Price changes, signal scores and prose are never synthesized into transactions.

## Troubleshooting

- `No valid source`: run the existing engine normally or configure the approved durable paths. Do not start a fixture engine for production reporting.
- HTTP 401/403: check matching publisher ID and secret through secure local/provider settings; confirm system clock accuracy.
- HTTP 409: replay was rejected. Subsequent retry uses a new signed nonce; event IDs remain unchanged.
- HTTP 429: bounded backoff handles the rate window. Check that a second publisher is not sharing the same identity.
- HTTP 503: migration/credentials may be missing or database unavailable. Queue remains durable.
- Unknown quote freshness or equity: this is intentional. The publisher never generates a current price from an old mark.

The reporting kit contains no Minecraft installation, world, models or fresh paper engine. Full HQ packaging is separately gated on runtime dependency provenance, generic character assets, licenses and clean Mac/Windows installation verification.
