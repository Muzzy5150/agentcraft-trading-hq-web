import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import { createServer } from "node:http";
import { randomUUID } from "node:crypto";
import { PGlite } from "@electric-sql/pglite";
import { historicalEvents, historicalSnapshot } from "../lib/store";
import { sign } from "../lib/auth";
import { POST } from "../app/api/ingest/route";
test("actual SQL: signed ingestion, replay rejection, idempotency, ordering, rate and access restrictions", async () => {
  const db = new PGlite();
  await db.exec(
    `create role anon;create role authenticated;create role service_role;create schema realtime;create function realtime.send(jsonb,text,text,boolean) returns void language sql as 'select';`,
  );
  await db.exec(
    fs.readFileSync("supabase/migrations/001_public_reporting.sql", "utf8"),
  );
  const rpc = async (p: string, n: string, e: unknown[], s: unknown = null) =>
    (
      await db.query<{ n: number }>(
        "select ingest_public_batch($1,$2,$3::jsonb,$4::jsonb) as n",
        [p, n, JSON.stringify(e), s ? JSON.stringify(s) : null],
      )
    ).rows[0].n;
  const server = createServer(async (req, res) => {
    let body = "";
    for await (const c of req) body += c;
    try {
      const b = JSON.parse(body),
        n = await rpc(b.p_publisher, b.p_nonce, b.p_events, b.p_snapshot);
      res
        .writeHead(200, { "Content-Type": "application/json" })
        .end(JSON.stringify(n));
    } catch (e) {
      res
        .writeHead(400, { "Content-Type": "application/json" })
        .end(
          JSON.stringify({
            message: e instanceof Error ? e.message : "failed",
            code: "P0001",
          }),
        );
    }
  });
  await new Promise<void>((r) => server.listen(0, "127.0.0.1", r));
  const address = server.address();
  assert.ok(address && typeof address === "object");
  const before = { ...process.env };
  process.env.SUPABASE_URL = `http://127.0.0.1:${address.port}`;
  process.env.SUPABASE_SECRET_KEY = "test-only-service-role";
  process.env.PUBLISHER_SECRET = "test-only-signing-secret-".repeat(3);
  process.env.PUBLISHER_ID = "main-hq";
  const request = (
    events: unknown[],
    nonce = randomUUID(),
    signature = true,
  ) => {
    const body = JSON.stringify({
        publisherId: "main-hq",
        events,
        snapshot: historicalSnapshot,
      }),
      timestamp = String(Date.now());
    return new Request("http://localhost/api/ingest", {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "x-publisher-timestamp": timestamp,
        "x-publisher-nonce": nonce,
        "x-publisher-signature": signature
          ? sign(body, timestamp, nonce, process.env.PUBLISHER_SECRET!)
          : "0".repeat(64),
      },
      body,
    });
  };
  try {
    const e = historicalEvents.find((x) => x.type === "paper_fill")!,
      nonce = randomUUID();
    assert.equal((await POST(request([e], nonce, false))).status, 401);
    assert.equal(
      (await POST(request([{ ...e, unknown: "secret" }]))).status,
      422,
    );
    assert.equal((await POST(request([e], nonce))).status, 200);
    assert.equal((await POST(request([e], nonce))).status, 409);
    assert.equal(
      (await POST(request([{ ...e, reason: "attempted historical rewrite" }])))
        .status,
      200,
    );
    const stored = (
      await db.query<{ payload: typeof e }>("select payload from public_events")
    ).rows;
    assert.equal(stored.length, 1);
    assert.equal(stored[0].payload.reason, e.reason);
    const future = {
      ...historicalSnapshot,
      sourceTimestamp: "2099-01-01T00:00:00.000Z",
    };
    await rpc("ordering", randomUUID(), [], future);
    await rpc("ordering", randomUUID(), [], historicalSnapshot);
    assert.equal(
      (
        await db.query<{ payload: typeof future }>(
          "select payload from publisher_status where publisher_id='ordering'",
        )
      ).rows[0].payload.sourceTimestamp,
      future.sourceTimestamp,
    );
    for (let i = 0; i < 30; i++) await rpc("rate-test", randomUUID(), []);
    await assert.rejects(
      () => rpc("rate-test", randomUUID(), []),
      /RATE_LIMIT/,
    );
    await db.exec("set role anon");
    await assert.rejects(
      () => db.query("select * from public_events"),
      /permission denied/,
    );
    await assert.rejects(
      () => rpc("anon", randomUUID(), []),
      /permission denied/,
    );
    await db.exec("reset role");
  } finally {
    for (const key of [
      "SUPABASE_URL",
      "SUPABASE_SECRET_KEY",
      "PUBLISHER_SECRET",
      "PUBLISHER_ID",
    ]) {
      if (before[key] === undefined) delete process.env[key];
      else process.env[key] = before[key];
    }
    await new Promise<void>((r) => server.close(() => r()));
    await db.close();
  }
});
