import { authenticate } from "@/lib/auth";
import { batchSchema } from "@/lib/schema";
import { configured, database } from "@/lib/store";
export const runtime = "nodejs";
export async function POST(request: Request) {
  if (!configured() || !process.env.PUBLISHER_SECRET)
    return Response.json(
      { error: "Ingestion not configured" },
      { status: 503 },
    );
  if (!request.headers.get("content-type")?.startsWith("application/json"))
    return Response.json({ error: "JSON required" }, { status: 415 });
  if (Number(request.headers.get("content-length") || 0) > 262144)
    return Response.json({ error: "Payload too large" }, { status: 413 });
  const reader = request.body?.getReader();
  if (!reader) return Response.json({ error: "Empty body" }, { status: 400 });
  const chunks: Uint8Array[] = [];
  let bytes = 0;
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    bytes += value.length;
    if (bytes > 262144) {
      await reader.cancel();
      return Response.json({ error: "Payload too large" }, { status: 413 });
    }
    chunks.push(value);
  }
  const body = Buffer.concat(chunks).toString("utf8");
  const auth = authenticate(
    body,
    request.headers,
    process.env.PUBLISHER_SECRET,
  );
  if (!auth) return Response.json({ error: "Unauthorized" }, { status: 401 });
  let json;
  try {
    json = JSON.parse(body);
  } catch {
    return Response.json({ error: "Invalid JSON" }, { status: 400 });
  }
  const parsed = batchSchema.safeParse(json);
  if (!parsed.success)
    return Response.json(
      { error: "Invalid public event schema" },
      { status: 422 },
    );
  if (parsed.data.publisherId !== (process.env.PUBLISHER_ID || "main-hq"))
    return Response.json({ error: "Unauthorized publisher" }, { status: 403 });
  if (
    parsed.data.events.some(
      (e) => Date.parse(e.sourceTimestamp) > Date.now() + 30000,
    ) ||
    (parsed.data.snapshot &&
      Date.parse(parsed.data.snapshot.sourceTimestamp) > Date.now() + 30000)
  )
    return Response.json({ error: "Future source timestamp" }, { status: 422 });
  const { data, error } = await database().rpc("ingest_public_batch", {
    p_publisher: parsed.data.publisherId,
    p_nonce: auth.nonce,
    p_events: parsed.data.events,
    p_snapshot: parsed.data.snapshot || null,
  });
  if (error) {
    const status = error.message.includes("REPLAY")
      ? 409
      : error.message.includes("RATE_LIMIT")
        ? 429
        : 503;
    return Response.json(
      {
        error:
          status === 409
            ? "Replay rejected"
            : status === 429
              ? "Rate limited"
              : "Ingestion unavailable",
      },
      { status, headers: status === 429 ? { "Retry-After": "60" } : {} },
    );
  }
  return Response.json({ accepted: true, inserted: data });
}
