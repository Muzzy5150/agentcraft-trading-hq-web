# Hosting and stream operations

## Dedicated Supabase

Use only a new project named `agentcraft-trading-hq`; never reuse another project's database. Apply `supabase/migrations/001_public_reporting.sql`. Store `SUPABASE_URL`, `SUPABASE_SECRET_KEY` and `PUBLISHER_SECRET` as sensitive Vercel environment variables, scoped independently to preview and production. `PUBLISHER_ID=main-hq` is non-secret. Supabase's secret/service-role credential must never receive a `NEXT_PUBLIC_` prefix. No spectator account/auth flow is needed; publisher HMAC is the only website write authentication.

Optionally configure `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` for Broadcast. Use a publishable browser key, never a secret. Public events are still read through the API; Broadcast contains invalidation only. Without these optional values, polling works. This version uses a dedicated table/RPC access model, not direct public table reads.

After migration, start the publisher with durable source paths to backfill current history. First verify `/api/health`, `/api/status`, signed ingestion and record counts on preview. Set `SITE_URL` to the verified production origin for metadata. Do not put secrets in command arguments, commits or chat. HTTPS is mandatory for public publisher delivery. Vercel's edge protections should rate-limit unauthenticated abuse; the database-backed per-publisher limit governs authenticated writes across server instances.

## Streams

Set provider environment variables without changing frontend code:

- Twitch: `STREAM_PROVIDER=twitch`, `STREAM_CHANNEL=your_actual_channel`, `TWITCH_PARENT=the-deployed-hostname`.
- YouTube: `STREAM_PROVIDER=youtube`, `STREAM_VIDEO_ID=the_actual_11_character_video_id`.
- Disabled: `STREAM_PROVIDER=none`.

Official iframe integrations are used. Twitch requires the embedding hostname in `parent`; previews need their own exact parent. Mobile widths below Twitch's 400px minimum get an external-player link. A configured player is labeled “live status unverified.” Configuration is not proof of broadcasting. The provider's player displays its actual state; no fabricated LIVE badge exists. No channel is configured in this delivery, and no OBS/game lifecycle is changed.

References: https://dev.twitch.tv/docs/embed/video-and-clips/ and https://developers.google.com/youtube/player_parameters .

## Recovery

Database outage returns 503 with a public-safe error, never a raw database exception. UI explicitly marks failed reads and retains last displayed rows as potentially outdated. No silent transition from database failure to an apparently current historical account. Freshness checks continue as time advances. Queue recovery, immutable event IDs and source timestamp comparison prevent duplicate receipts or stale snapshot replacement.

No automated data deletion, database reset, engine restart or release promotion is part of recovery.
