import { getStatus, configured } from "@/lib/store";
export async function GET() {
  try {
    await getStatus();
    return Response.json(
      {
        app: "up",
        execution: "PAPER ONLY",
        database: configured() ? "connected" : "not configured",
        historicalFallback: !configured(),
      },
      { headers: { "Cache-Control": "no-store" } },
    );
  } catch {
    return Response.json(
      { app: "degraded", execution: "PAPER ONLY", database: "unavailable" },
      { status: 503 },
    );
  }
}
