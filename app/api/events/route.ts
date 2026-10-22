import { z } from "zod";
import { getEvents } from "@/lib/store";
const filters = z
  .object({
    agent: z.string().max(40).optional(),
    token: z.string().max(60).optional(),
    strategy: z.string().max(40).optional(),
    outcome: z.enum(["win", "loss", "entry"]).optional(),
    from: z.iso.datetime().optional(),
    to: z.iso.datetime().optional(),
    type: z
      .enum([
        "paper_fill",
        "research",
        "rejection",
        "activity",
        "dialogue",
        "system",
      ])
      .optional(),
    account: z.enum(["shared", "evaluation", "none"]).optional(),
    page: z.coerce.number().int().min(1).max(10000).default(1),
  })
  .strict();
export async function GET(req: Request) {
  const f = filters.safeParse(
    Object.fromEntries(new URL(req.url).searchParams),
  );
  if (!f.success)
    return Response.json({ error: "Invalid filters" }, { status: 400 });
  try {
    return Response.json(await getEvents(f.data), {
      headers: { "Cache-Control": "no-store" },
    });
  } catch {
    return Response.json(
      { error: "History temporarily unavailable" },
      { status: 503 },
    );
  }
}
