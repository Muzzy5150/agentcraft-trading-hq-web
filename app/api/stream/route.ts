import { streamConfig } from "@/lib/stream";
export async function GET() {
  return Response.json(streamConfig(process.env), {
    headers: { "Cache-Control": "no-store" },
  });
}
