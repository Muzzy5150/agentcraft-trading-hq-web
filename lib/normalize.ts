import { createHash } from "node:crypto";
import {
  eventSchema,
  snapshotSchema,
  type PublicEvent,
  type Snapshot,
  safeText,
} from "./schema";
import { agents } from "./agents";
type RecordLike = Record<string, unknown>;
const obj = (x: unknown): RecordLike =>
  x && typeof x === "object" && !Array.isArray(x) ? (x as RecordLike) : {};
const rows = (x: unknown): RecordLike[] => (Array.isArray(x) ? x.map(obj) : []);
const num = (x: unknown) =>
  typeof x === "number" && Number.isFinite(x) ? x : null;
const date = (x: unknown) =>
  typeof x === "number" && Number.isFinite(x)
    ? new Date(x).toISOString()
    : null;
const text = (x: unknown, max = 600) =>
  typeof x === "string" && safeText.max(max).safeParse(x).success ? x : null;
const hash = (s: string) => createHash("sha256").update(s).digest("hex");
export const strategyAgents: Record<string, string> = {
  new_launch: "alon",
  relative_strength: "wren",
  volume: "juniper",
  trend: "kit",
  momentum: "rowan",
  breakout: "tove",
};
export function normalizeLedger(
  raw: unknown,
  instance: string,
  account: "shared" | "evaluation" = "shared",
  strategy: string | null = null,
): PublicEvent[] {
  const b = obj(raw);
  return rows(b.ledger).flatMap((t) => {
    const candidate = {
      id: `${instance}:${account}:${strategy || "original"}:${String(t.id)}`,
      sourceTimestamp: date(t.ts),
      agentId: typeof t.agentId === "string" ? t.agentId : null,
      type: "paper_fill",
      account,
      strategy,
      action: t.side === "BUY" ? "buy" : t.side === "SELL" ? "sell" : "system",
      symbol: text(t.symbol, 40),
      mint: t.address ?? null,
      pool: null,
      venue: null,
      reason: text(t.reason),
      risk: "unknown",
      receiptId: t.id,
      priceUsd: num(t.priceUsd),
      quantity: num(t.qty),
      notionalUsd: num(t.notionalUsd),
      feeUsd: num(t.feeUsd),
      slippageRate: 0.0075,
      realizedUsd: t.side === "SELL" ? num(t.realizedUsd) : null,
      provenance: account === "shared" ? "shared-ledger" : "evaluation-ledger",
      sourceMode: "LIVE",
    };
    const r = eventSchema.safeParse(candidate);
    return r.success ? [r.data] : [];
  });
}
export function normalizeEvaluations(
  raw: unknown,
  instance: string,
): PublicEvent[] {
  const root = obj(raw);
  if (root.mode !== "LIVE") return [];
  return Object.entries(obj(root.strategies)).flatMap(([strategy, value]) => {
    if (!strategyAgents[strategy]) return [];
    const row = obj(value);
    return [
      ...normalizeLedger(row.book, instance, "evaluation", strategy),
      ...rows(row.decisions).flatMap((d) => {
        const reasons = Array.isArray(d.reasons)
          ? d.reasons.filter((x) => typeof x === "string").join("; ")
          : "";
        const rejection = reasons.length > 0;
        const timestamp = date(d.at);
        if (!timestamp) return [];
        const r = eventSchema.safeParse({
          id: `${instance}:decision:${hash(JSON.stringify([strategy, d.at, d.mint, d.signal, reasons]))}`,
          sourceTimestamp: timestamp,
          agentId: null,
          type: rejection ? "rejection" : "research",
          account: "evaluation",
          strategy,
          action: rejection ? "reject" : "research",
          symbol: text(d.symbol, 40),
          mint: d.mint ?? null,
          pool: null,
          venue: null,
          reason: text(reasons) || null,
          risk: rejection ? "rejected" : "unknown",
          receiptId: null,
          priceUsd: null,
          quantity: null,
          notionalUsd: null,
          feeUsd: null,
          slippageRate: null,
          realizedUsd: null,
          provenance: "evaluation-decision",
          sourceMode: "LIVE",
        });
        return r.success ? [r.data] : [];
      }),
    ];
  });
}
export function historicalSnapshot(
  ledger: unknown,
  evaluations: unknown,
  sourceTimestamp: string,
): Snapshot {
  const b = obj(ledger),
    strategies = obj(obj(evaluations).strategies);
  const sales = rows(b.ledger).filter((t) => t.side === "SELL");
  return snapshotSchema.parse({
    sourceTimestamp,
    engineOnline: false,
    marketTimestamp: null,
    marketState: "UNKNOWN",
    source: "historical-ledger",
    equityUsd: null,
    pnlUsd: null,
    realizedUsd: sales.reduce((s, t) => s + (num(t.realizedUsd) || 0), 0),
    cashUsd: num(b.cashUsd),
    openPositions: rows(b.positions).length,
    agents: [],
    positions: [
      ...positions(b, "shared", null),
      ...Object.entries(strategies).flatMap(([s, v]) =>
        positions(obj(v).book, "evaluation", s),
      ),
    ],
    performance: Object.entries(strategyAgents).map(([strategy, agentId]) => {
      const row = obj(strategies[strategy]),
        book = obj(row.book),
        ledger = rows(book.ledger),
        sales = ledger.filter((t) => t.side === "SELL");
      return {
        strategy,
        agentId,
        status: ledger.length ? "UNPRICED" : "INSUFFICIENT_DATA",
        pnlUsd: null,
        netReturnPct: null,
        winRatePct: sales.length
          ? (100 * sales.filter((t) => (num(t.realizedUsd) || 0) > 0).length) /
            sales.length
          : null,
        tradeCount: sales.length,
        receipts: ledger.length,
        drawdownPct: ledger.length ? num(row.maxDrawdownPct) : null,
      };
    }),
  });
}
function positions(
  raw: unknown,
  account: "shared" | "evaluation",
  strategy: string | null,
) {
  return rows(obj(raw).positions).map((p) => ({
    mint: p.address,
    symbol: text(p.symbol, 40) || "Unknown",
    entryUsd: p.entryUsd,
    quantity: p.qty,
    openedAt: date(p.openedAt),
    account,
    strategy,
  }));
}
export function normalizeState(
  raw: unknown,
  instance: string,
): { events: PublicEvent[]; snapshot: Snapshot } {
  const s = obj(raw),
    market = obj(s.market);
  if (
    s.product !== "AgentCraft Solana Tradecast" ||
    s.execution !== "PAPER ONLY" ||
    market.mode !== "LIVE"
  )
    throw Error("Unsupported source contract or fixture mode");
  const portfolio = obj(s.portfolio);
  const timestamp = date(s.ts);
  if (!timestamp) throw Error("Missing source timestamp");
  const events = normalizeLedger(portfolio, instance);
  // Speech is fictional presentation. Never reinterpret it as a decision or fill.
  for (const e of rows(s.events)) {
    if (e.kind === "trade" || e.kind === "error") continue;
    const reason = text(e.text);
    if (!reason) continue;
    const r = eventSchema.safeParse({
      id: `${instance}:dialogue:${hash(JSON.stringify([e.ts, e.agentId, reason]))}`,
      sourceTimestamp: date(e.ts),
      agentId: e.agentId,
      type: "dialogue",
      account: "none",
      strategy: null,
      action: "monitor",
      symbol: null,
      mint: null,
      pool: null,
      venue: null,
      reason,
      risk: "unknown",
      receiptId: null,
      priceUsd: null,
      quantity: null,
      notionalUsd: null,
      feeUsd: null,
      slippageRate: null,
      realizedUsd: null,
      provenance: "engine-api",
      sourceMode: "LIVE",
    });
    if (r.success) events.push(r.data);
  }
  const snapshot = snapshotSchema.parse({
    sourceTimestamp: timestamp,
    engineOnline: true,
    marketTimestamp: date(market.lastSuccessAt),
    marketState: ["LIVE", "STALE", "OFFLINE"].includes(
      String(market.connection),
    )
      ? market.connection
      : "UNKNOWN",
    source: "engine-api",
    equityUsd: num(portfolio.equityUsd),
    pnlUsd: num(portfolio.pnlUsd),
    realizedUsd: num(portfolio.realizedUsd),
    cashUsd: num(portfolio.cashUsd),
    openPositions: num(portfolio.openPositions),
    positions: positions(portfolio, "shared", null),
    agents: rows(s.agents)
      .filter((a) => agents.some((x) => x.id === a.id))
      .map((a) => ({
        id: a.id,
        activity: text(a.activity) || "Activity unavailable",
        state: text(a.state, 30) || "unknown",
      })),
    performance: rows(obj(s.leaderboard).rows)
      .filter((r) => strategyAgents[String(r.id)])
      .map((r) => ({
        strategy: r.id,
        agentId: strategyAgents[String(r.id)],
        status: r.status,
        pnlUsd: num(r.pnlUsd),
        netReturnPct: num(r.netReturnPct),
        winRatePct: num(r.winRatePct),
        tradeCount: r.tradeCount,
        receipts: r.paperReceipts,
        drawdownPct: num(r.maxDrawdownPct),
      })),
  });
  return { events, snapshot };
}
