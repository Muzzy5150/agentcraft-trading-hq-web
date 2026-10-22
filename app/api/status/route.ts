import { getStatus } from "@/lib/store";
export async function GET() {
  try {
    return Response.json(await getStatus(), {
      headers: { "Cache-Control": "no-store" },
    });
  } catch {
    return Response.json(
      { error: "Status temporarily unavailable" },
      { status: 503 },
    );
  }
}
