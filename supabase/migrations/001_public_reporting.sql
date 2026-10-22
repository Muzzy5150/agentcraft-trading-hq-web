-- Run in a dedicated AgentCraft Supabase project. No connections to the game.
create table if not exists public.public_events (
 id text primary key, publisher_id text not null, source_timestamp timestamptz not null,
 ingested_at timestamptz not null default now(), payload jsonb not null,
 search_text text generated always as (coalesce(payload->>'symbol','')||' '||coalesce(payload->>'mint','')) stored,
 realized_usd numeric generated always as ((payload->>'realizedUsd')::numeric) stored,
 constraint paper_only check (payload->>'sourceMode'='LIVE'),
 constraint valid_type check (payload->>'type' in ('paper_fill','research','rejection','activity','dialogue','system'))
);
create index if not exists public_events_time on public.public_events(source_timestamp desc,id desc);
create index if not exists public_events_account on public.public_events((payload->>'account'),source_timestamp desc);
create table if not exists public.publisher_status(publisher_id text primary key, payload jsonb not null, ingested_at timestamptz not null default now());
create table if not exists public.publisher_nonces(publisher_id text not null, nonce text not null, created_at timestamptz not null default now(),primary key(publisher_id,nonce));
create index if not exists nonce_time on public.publisher_nonces(created_at);
alter table public.public_events enable row level security;
alter table public.publisher_status enable row level security;
alter table public.publisher_nonces enable row level security;
revoke all on public.public_events,public.publisher_status,public.publisher_nonces from anon,authenticated;
-- Read access is through bounded server endpoints only. No browser database write grants.
create or replace function public.ingest_public_batch(p_publisher text,p_nonce text,p_events jsonb,p_snapshot jsonb default null)
returns integer language plpgsql security definer set search_path=public,pg_temp as $$
declare inserted integer;
begin
 perform pg_advisory_xact_lock(hashtext(p_publisher));
 if jsonb_array_length(p_events)>200 then raise exception 'BATCH_LIMIT'; end if;
 if exists(select 1 from publisher_nonces where publisher_id=p_publisher and nonce=p_nonce) then raise exception 'REPLAY';end if;
 if (select count(*) from publisher_nonces where publisher_id=p_publisher and created_at>now()-interval '1 minute')>=30 then raise exception 'RATE_LIMIT';end if;
 insert into publisher_nonces(publisher_id,nonce) values(p_publisher,p_nonce);
 delete from publisher_nonces where created_at<now()-interval '10 minutes';
 insert into public_events(id,publisher_id,source_timestamp,payload)
 select e->>'id',p_publisher,(e->>'sourceTimestamp')::timestamptz,e from jsonb_array_elements(p_events) e
 on conflict(id) do nothing;
 get diagnostics inserted=row_count;
 if p_snapshot is not null then
 insert into publisher_status(publisher_id,payload) values(p_publisher,p_snapshot)
 on conflict(publisher_id) do update set payload=excluded.payload,ingested_at=now()
 where (excluded.payload->>'sourceTimestamp')::timestamptz >= (publisher_status.payload->>'sourceTimestamp')::timestamptz;
 end if;
 -- Broadcast only invalidates reads. Clients always retrieve trusted records through the API.
 perform realtime.send(jsonb_build_object('changed',true),'refresh','agentcraft:public',false);
 return inserted;
end $$;
revoke all on function public.ingest_public_batch(text,text,jsonb,jsonb) from public,anon,authenticated;
grant execute on function public.ingest_public_batch(text,text,jsonb,jsonb) to service_role;
