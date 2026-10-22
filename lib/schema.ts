import { z } from "zod";
export const safeText = z
  .string()
  .max(600)
  .refine(
    (s) =>
      !/(?:\/Users\/|\/home\/|[A-Z]:\\|sk-[A-Za-z0-9]{12}|sb_secret_|Bearer\s|(?:api[_ -]?key|private[_ -]?key|password|token)\s*[:=])/i.test(
        s,
      ),
    "private content",
  );
export const mint = z.string().regex(/^[1-9A-HJ-NP-Za-km-z]{32,44}$/);
export const agentId = z.enum([
  "alon",
  "wren",
  "juniper",
  "kit",
  "rowan",
  "tove",
  "sable",
  "nova",
  "delta",
  "pixel",
  "echo",
  "byte",
]);
const nullableNumber = z.number().finite().nullable();
export const eventSchema = z
  .object({
    id: z.string().regex(/^[a-zA-Z0-9:_-]{1,180}$/),
    sourceTimestamp: z.iso.datetime(),
    agentId: agentId.nullable(),
    type: z.enum([
      "paper_fill",
      "research",
      "rejection",
      "activity",
      "dialogue",
      "system",
    ]),
    account: z.enum(["shared", "evaluation", "none"]),
    strategy: z
      .enum([
        "momentum",
        "breakout",
        "trend",
        "new_launch",
        "volume",
        "relative_strength",
      ])
      .nullable(),
    action: z.enum([
      "monitor",
      "research",
      "reject",
      "buy",
      "sell",
      "close",
      "system",
    ]),
    symbol: safeText.max(40).nullable(),
    mint: mint.nullable(),
    pool: mint.nullable(),
    venue: safeText.max(60).nullable(),
    reason: safeText.nullable(),
    risk: z.enum(["passed", "rejected", "unknown"]),
    receiptId: z
      .string()
      .regex(/^PAPER-\d+$/)
      .nullable(),
    priceUsd: nullableNumber,
    quantity: nullableNumber,
    notionalUsd: nullableNumber,
    feeUsd: nullableNumber,
    slippageRate: nullableNumber,
    realizedUsd: nullableNumber,
    provenance: z.enum([
      "engine-api",
      "shared-ledger",
      "evaluation-ledger",
      "evaluation-decision",
    ]),
    sourceMode: z.literal("LIVE"),
  })
  .strict()
  .superRefine((e, c) => {
    if (
      e.type === "paper_fill" &&
      (!e.receiptId ||
        !e.mint ||
        !["buy", "sell"].includes(e.action) ||
        e.account === "none" ||
        e.priceUsd === null ||
        e.priceUsd <= 0 ||
        e.quantity === null ||
        e.quantity <= 0)
    )
      c.addIssue({
        code: "custom",
        message: "Fill requires a real receipt and price",
      });
    if (e.type !== "paper_fill" && e.receiptId)
      c.addIssue({ code: "custom", message: "Signals cannot have receipts" });
    if (e.account === "shared" && e.strategy)
      c.addIssue({
        code: "custom",
        message: "Do not relabel the shared account as an evaluation strategy",
      });
  });
export type PublicEvent = z.infer<typeof eventSchema>;
export const performanceSchema = z
  .object({
    strategy: z.string(),
    agentId,
    status: z.enum(["INSUFFICIENT_DATA", "PAPER_EVALUATION", "UNPRICED"]),
    pnlUsd: nullableNumber,
    netReturnPct: nullableNumber,
    winRatePct: nullableNumber,
    tradeCount: z.number().int().nonnegative(),
    receipts: z.number().int().nonnegative(),
    drawdownPct: nullableNumber,
  })
  .strict();
export const snapshotSchema = z
  .object({
    sourceTimestamp: z.iso.datetime(),
    engineOnline: z.boolean(),
    marketTimestamp: z.iso.datetime().nullable(),
    marketState: z.enum(["LIVE", "STALE", "OFFLINE", "UNKNOWN"]),
    source: z.enum(["engine-api", "historical-ledger"]),
    equityUsd: nullableNumber,
    pnlUsd: nullableNumber,
    realizedUsd: nullableNumber,
    cashUsd: nullableNumber,
    openPositions: z.number().int().nonnegative().nullable(),
    performance: z.array(performanceSchema).max(6),
    agents: z
      .array(
        z
          .object({ id: agentId, activity: safeText, state: safeText.max(30) })
          .strict(),
      )
      .max(12),
    positions: z
      .array(
        z
          .object({
            mint,
            symbol: safeText.max(40),
            entryUsd: z.number().positive(),
            quantity: z.number().positive(),
            openedAt: z.iso.datetime(),
            account: z.enum(["shared", "evaluation"]),
            strategy: z.string().nullable(),
          })
          .strict(),
      )
      .max(100),
  })
  .strict();
export type Snapshot = z.infer<typeof snapshotSchema>;
export const batchSchema = z
  .object({
    publisherId: z.string().regex(/^[a-z0-9-]{1,40}$/),
    events: z.array(eventSchema).max(200),
    snapshot: snapshotSchema.optional(),
  })
  .strict();
export function freshness(
  timestamp: string | null | undefined,
  online = true,
  now = Date.now(),
): "LIVE" | "STALE" | "OFFLINE" {
  if (!online || !timestamp) return "OFFLINE";
  const age = now - Date.parse(timestamp);
  return age < 0 || age > 300000 ? "OFFLINE" : age > 90000 ? "STALE" : "LIVE";
}
