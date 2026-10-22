import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { randomUUID } from "node:crypto";
import { agents } from "../lib/agents";
import { freshness, eventSchema, safeText } from "../lib/schema";
import { authenticate, sign } from "../lib/auth";
import {
  normalizeLedger,
  normalizeState,
  normalizeEvaluations,
} from "../lib/normalize";
import { filterEvents, historicalEvents } from "../lib/store";
import { Queue } from "../publisher/queue";
import { streamConfig } from "../lib/stream";
test("complete roster and honest pending persona", () => {
  assert.equal(agents.length, 12);
  assert.equal(new Set(agents.map((a) => a.id)).size, 12);
  assert.deepEqual(
    ["trader", "scanner", "coder"].map(
      (r) => agents.filter((a) => a.role === r).length,
    ),
    [6, 2, 4],
  );
  assert.equal(agents.find((a) => a.name === "JACOB")?.implemented, false);
});
test("freshness never promotes old or future records to live", () => {
  const now = Date.now();
  assert.equal(
    freshness(new Date(now - 1000).toISOString(), true, now),
    "LIVE",
  );
  assert.equal(
    freshness(new Date(now - 100000).toISOString(), true, now),
    "STALE",
  );
  assert.equal(
    freshness(new Date(now - 400000).toISOString(), true, now),
    "OFFLINE",
  );
  assert.equal(
    freshness(new Date(now + 1000).toISOString(), true, now),
    "OFFLINE",
  );
  assert.equal(freshness(null, true, now), "OFFLINE");
});
test("signed authentication rejects tampering, expired and future requests", () => {
  const body = '{"events":[]}',
    secret = "test-only-".repeat(8),
    t = String(Date.now()),
    nonce = randomUUID();
  const headers = new Headers({
    "x-publisher-timestamp": t,
    "x-publisher-nonce": nonce,
    "x-publisher-signature": sign(body, t, nonce, secret),
  });
  assert.ok(authenticate(body, headers, secret, Number(t)));
  assert.equal(authenticate(body + " ", headers, secret, Number(t)), null);
  assert.equal(authenticate(body, headers, secret, Number(t) + 61000), null);
  assert.equal(authenticate(body, headers, secret, Number(t) - 61000), null);
  assert.equal(authenticate(body, headers, "short"), null);
});
test("schema rejects secrets, private paths, fixture events and invented fills", () => {
  const e = historicalEvents.find((e) => e.type === "paper_fill")!;
  assert.equal(
    eventSchema.safeParse({ ...e, sourceMode: "FIXTURE" }).success,
    false,
  );
  assert.equal(eventSchema.safeParse({ ...e, receiptId: null }).success, false);
  assert.equal(
    eventSchema.safeParse({ ...e, reason: "/Users/test/private" }).success,
    false,
  );
  assert.equal(
    eventSchema.safeParse({ ...e, privateKey: "hidden" }).success,
    false,
  );
  assert.equal(safeText.safeParse("api_key=private").success, false);
  assert.equal(
    eventSchema.safeParse({ ...e, type: "research" }).success,
    false,
  );
});
test("historical records have stable IDs, authentic labels, no fabricated attribution", () => {
  assert.equal(
    new Set(historicalEvents.map((e) => e.id)).size,
    historicalEvents.length,
  );
  assert.equal(
    historicalEvents.filter(
      (e) => e.type === "paper_fill" && e.account === "shared",
    ).length,
    10,
  );
  assert.equal(
    historicalEvents.filter(
      (e) => e.type === "paper_fill" && e.account === "evaluation",
    ).length,
    0,
  );
  assert.ok(
    historicalEvents
      .filter((e) => e.type === "paper_fill")
      .every((e) => e.agentId === null),
  );
});
test("filters isolate portfolio, token, date, outcome, strategy and event type", () => {
  const fills = filterEvents(historicalEvents, {
    type: "paper_fill",
    account: "shared",
  });
  assert.equal(fills.length, 10);
  assert.ok(
    filterEvents(fills, { outcome: "loss" }).every(
      (e) => (e.realizedUsd ?? 0) < 0,
    ),
  );
  const token = fills[0].symbol!;
  assert.ok(
    filterEvents(fills, { token }).every((e) => e.symbol!.includes(token)),
  );
  assert.equal(
    filterEvents(fills, { from: "2999-01-01T00:00:00.000Z" }).length,
    0,
  );
  assert.ok(
    filterEvents(historicalEvents, { strategy: "trend" }).every(
      (e) => e.account === "evaluation",
    ),
  );
  assert.equal(
    filterEvents(historicalEvents, { agent: "alon", type: "paper_fill" })
      .length,
    0,
  );
});
test("publisher reads allowlisted receipt fields only and preserves null attribution", () => {
  const ledger = {
    ledger: [
      {
        id: "PAPER-000001",
        side: "BUY",
        ts: Date.now(),
        symbol: "TEST FIXTURE",
        address: "So11111111111111111111111111111111111111112",
        qty: 1,
        priceUsd: 1,
        notionalUsd: 1,
        feeUsd: 0.005,
        realizedUsd: 0,
        reason: "test only",
        privateKey: "never copied",
      },
    ],
  };
  const [event] = normalizeLedger(ledger, "test-only");
  assert.ok(event);
  assert.equal(event.agentId, null);
  assert.equal(event.realizedUsd, null);
  assert.equal("privateKey" in event, false);
  assert.equal(normalizeLedger(ledger, "test-only")[0].id, event.id);
});
test("synthetic source mode is never normalized as production data", () => {
  assert.throws(() =>
    normalizeState(
      {
        product: "AgentCraft Solana Tradecast",
        execution: "PAPER ONLY",
        market: { mode: "FIXTURE" },
      },
      "test",
    ),
  );
  assert.deepEqual(
    normalizeEvaluations({ mode: "FIXTURE", strategies: {} }, "test"),
    [],
  );
});
test("durable queue survives restart and acknowledgement is idempotent", () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "agentcraft-queue-test-"));
  try {
    let q = new Queue(path.join(dir, "queue.db"));
    q.add(historicalEvents.slice(0, 3));
    q.add(historicalEvents.slice(0, 3));
    assert.equal(q.take().length, 3);
    q.close();
    q = new Queue(path.join(dir, "queue.db"));
    assert.equal(q.take().length, 3);
    q.ack(q.take());
    q.add(historicalEvents.slice(0, 3));
    assert.equal(q.take().length, 0);
    assert.ok(q.health().lastSuccessfulSync);
    q.close();
  } finally {
    fs.rmSync(dir, { recursive: true });
  }
});
test("official stream embeds require explicit valid configuration", () => {
  assert.equal(streamConfig({}).configured, false);
  assert.equal(
    streamConfig({ STREAM_PROVIDER: "youtube", STREAM_VIDEO_ID: "bad" })
      .configured,
    false,
  );
  assert.match(
    streamConfig({
      STREAM_PROVIDER: "twitch",
      STREAM_CHANNEL: "example",
      TWITCH_PARENT: "example.com",
    }).url!,
    /^https:\/\/player.twitch.tv\/\?channel=example&parent=example.com/,
  );
  assert.equal(
    streamConfig({ STREAM_PROVIDER: "youtube", STREAM_VIDEO_ID: "abcdefghijk" })
      .status,
    "UNKNOWN",
  );
});
