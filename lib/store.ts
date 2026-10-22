import { createClient } from "@supabase/supabase-js";
import history from "@/public/data/history.json";
import { eventSchema, snapshotSchema, type PublicEvent } from "./schema";
export const configured = () =>
  !!(process.env.SUPABASE_URL && process.env.SUPABASE_SECRET_KEY);
export function database() {
  if (!configured()) throw Error("Database not configured");
  return createClient(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_SECRET_KEY!,
    { auth: { persistSession: false, autoRefreshToken: false } },
  );
}
export const historicalEvents: PublicEvent[] = history.events.map((x) =>
  eventSchema.parse(x),
);
export const historicalSnapshot = snapshotSchema.parse(history.snapshot);
export type Filters = {
  agent?: string;
  token?: string;
  strategy?: string;
  outcome?: string;
  from?: string;
  to?: string;
  type?: string;
  account?: string;
  page?: number;
};
export function filterEvents(events: PublicEvent[], f: Filters) {
  return events
    .filter(
      (e) =>
        (!f.agent || e.agentId === f.agent) &&
        (!f.token ||
          `${e.symbol} ${e.mint}`
            .toLowerCase()
            .includes(f.token.toLowerCase())) &&
        (!f.strategy || e.strategy === f.strategy) &&
        (!f.type || e.type === f.type) &&
        (!f.account || e.account === f.account) &&
        (!f.from || e.sourceTimestamp >= f.from) &&
        (!f.to || e.sourceTimestamp <= f.to) &&
        (!f.outcome ||
          (f.outcome === "win" &&
            e.realizedUsd !== null &&
            e.realizedUsd > 0) ||
          (f.outcome === "loss" &&
            e.realizedUsd !== null &&
            e.realizedUsd < 0) ||
          (f.outcome === "entry" && e.action === "buy")),
    )
    .sort(
      (a, b) =>
        b.sourceTimestamp.localeCompare(a.sourceTimestamp) ||
        b.id.localeCompare(a.id),
    );
}
export async function getEvents(f: Filters) {
  const page = Math.max(1, Math.min(10000, f.page || 1)),
    size = 25;
  if (!configured()) {
    const rows = filterEvents(historicalEvents, f);
    return {
      events: rows.slice((page - 1) * size, page * size),
      total: rows.length,
      page,
      size,
      storage: "historical" as const,
    };
  }
  let query = database()
    .from("public_events")
    .select("payload", { count: "exact" })
    .order("source_timestamp", { ascending: false })
    .order("id", { ascending: false });
  if (f.agent) query = query.eq("payload->>agentId", f.agent);
  if (f.token)
    query = query.ilike("search_text", `%${f.token.replace(/[%_\\]/g, "")}%`);
  if (f.strategy) query = query.eq("payload->>strategy", f.strategy);
  if (f.type) query = query.eq("payload->>type", f.type);
  if (f.account) query = query.eq("payload->>account", f.account);
  if (f.from) query = query.gte("source_timestamp", f.from);
  if (f.to) query = query.lte("source_timestamp", f.to);
  if (f.outcome === "win") query = query.gt("realized_usd", 0);
  if (f.outcome === "loss") query = query.lt("realized_usd", 0);
  if (f.outcome === "entry") query = query.eq("payload->>action", "buy");
  const { data, error, count } = await query.range(
    (page - 1) * size,
    page * size - 1,
  );
  if (error) throw Error("Public history unavailable");
  return {
    events: (data || []).map((r) => eventSchema.parse(r.payload)),
    total: count || 0,
    page,
    size,
    storage: "database" as const,
  };
}
export async function getStatus() {
  if (!configured())
    return {
      snapshot: historicalSnapshot,
      ingestedAt: null,
      storage: "historical",
      connection: "OFFLINE",
    };
  const { data, error } = await database()
    .from("publisher_status")
    .select("payload,ingested_at")
    .eq("publisher_id", process.env.PUBLISHER_ID || "main-hq")
    .maybeSingle();
  if (error) throw Error("Status unavailable");
  return {
    snapshot: data ? snapshotSchema.parse(data.payload) : historicalSnapshot,
    ingestedAt: data?.ingested_at || null,
    storage: "database",
    connection: data ? "CONNECTED" : "WAITING",
  };
}
