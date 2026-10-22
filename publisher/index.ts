import fs from "node:fs";
import path from "node:path";
import { randomUUID } from "node:crypto";
import { Queue } from "./queue";
import {
  normalizeLedger,
  normalizeEvaluations,
  normalizeState,
  historicalSnapshot,
} from "../lib/normalize";
import { sign } from "../lib/auth";
import { batchSchema, type Snapshot } from "../lib/schema";
const env = process.env;
const instance = env.SOURCE_INSTANCE_ID;
if (!instance || !/^[-a-z0-9]{1,60}$/.test(instance))
  throw Error("Set a stable SOURCE_INSTANCE_ID");
const secret = env.PUBLISHER_SECRET || "";
if (secret.length < 32)
  throw Error("PUBLISHER_SECRET must be at least 32 characters");
const endpoint = new URL(env.PUBLISH_URL || "");
if (
  endpoint.protocol !== "https:" &&
  !(
    ["127.0.0.1", "localhost"].includes(endpoint.hostname) &&
    env.NODE_ENV !== "production"
  )
)
  throw Error("Publisher requires HTTPS");
const engine = new URL(env.ENGINE_URL || "http://127.0.0.1:8787");
if (
  !["127.0.0.1", "localhost", "[::1]"].includes(engine.hostname) ||
  engine.protocol !== "http:" ||
  engine.username ||
  engine.password
)
  throw Error("Engine must be loopback HTTP");
const stateDir = path.resolve(env.PUBLISHER_STATE_DIR || ".publisher");
fs.mkdirSync(stateDir, { recursive: true, mode: 0o700 });
const queue = new Queue(path.join(stateDir, "queue.sqlite"));
fs.chmodSync(path.join(stateDir, "queue.sqlite"), 0o600);
let stopping = false,
  failures = 0;
process.on("SIGINT", () => (stopping = true));
process.on("SIGTERM", () => (stopping = true));
while (!stopping) {
  let snapshot: Snapshot | undefined;
  try {
    let ledger: unknown, evaluations: unknown;
    let modified = 0;
    if (env.ENGINE_LEDGER_PATH) {
      ledger = JSON.parse(fs.readFileSync(env.ENGINE_LEDGER_PATH, "utf8"));
      modified = fs.statSync(env.ENGINE_LEDGER_PATH).mtimeMs;
      queue.add(normalizeLedger(ledger, instance));
    }
    if (env.ENGINE_EVALUATIONS_PATH) {
      evaluations = JSON.parse(
        fs.readFileSync(env.ENGINE_EVALUATIONS_PATH, "utf8"),
      );
      queue.add(normalizeEvaluations(evaluations, instance));
      modified = Math.max(
        modified,
        fs.statSync(env.ENGINE_EVALUATIONS_PATH).mtimeMs,
      );
    }
    if (ledger && modified)
      snapshot = historicalSnapshot(
        ledger,
        evaluations,
        new Date(modified).toISOString(),
      );
    try {
      const response = await fetch(new URL("/api/state", engine), {
        signal: AbortSignal.timeout(5000),
        redirect: "error",
      });
      if (!response.ok) throw Error("Source unavailable");
      const normalized = normalizeState(await response.json(), instance);
      queue.add(normalized.events);
      snapshot = normalized.snapshot;
    } catch {
      /* Offline is represented by historical source timestamps, never a fresh heartbeat. */
    }
    const events = queue.take();
    if (!events.length && !snapshot) throw Error("No valid source available");
    const body = JSON.stringify(
      batchSchema.parse({
        publisherId: env.PUBLISHER_ID || "main-hq",
        events,
        ...(snapshot ? { snapshot } : {}),
      }),
    );
    const timestamp = String(Date.now()),
      nonce = randomUUID();
    const result = await fetch(endpoint, {
      method: "POST",
      redirect: "error",
      signal: AbortSignal.timeout(15000),
      headers: {
        "Content-Type": "application/json",
        "x-publisher-timestamp": timestamp,
        "x-publisher-nonce": nonce,
        "x-publisher-signature": sign(body, timestamp, nonce, secret),
      },
      body,
    });
    if (!result.ok) throw Error(`Ingestion HTTP ${result.status}`);
    queue.ack(events);
    failures = 0;
    console.log(JSON.stringify({ status: "synchronized", ...queue.health() }));
  } catch {
    failures++;
    console.error(JSON.stringify({ status: "retrying", ...queue.health() }));
  }
  const delay = Math.min(
    60000,
    failures
      ? 2000 * 2 ** Math.min(failures, 5)
      : queue.take().length
        ? 2500
        : 15000,
  );
  for (let n = 0; n < delay && !stopping; n += 500)
    await new Promise((r) => setTimeout(r, 500));
}
queue.close();
