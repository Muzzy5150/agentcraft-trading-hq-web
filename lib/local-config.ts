import { z } from "zod";
// Documents the existing source without changing or weakening its policies.
export const localConfigSchema = z
  .object({
    minecraft: z
      .object({
        runtimePath: z.string().min(1),
        version: z.literal("26.3"),
        fabricLoader: z.literal("0.19.5"),
        fabricApi: z.literal("0.161.0+26.3"),
        javaMajor: z.literal(25),
      })
      .strict(),
    nodeMajor: z.number().int().min(22),
    agents: z
      .array(
        z
          .object({
            id: z.string().regex(/^[a-z0-9_-]+$/),
            displayName: z.string().min(1).max(40),
          })
          .strict(),
      )
      .length(12),
    paper: z
      .object({
        startingUsd: z.number().positive().max(1e9).default(1000),
        tradeUsd: z.number().positive().max(1e6).default(40),
        maxOpen: z.number().int().min(1).max(10).default(3),
        perEntryMaxPct: z.literal(5),
        portfolioMaxExposurePct: z.literal(15),
        dailyLossStopPct: z.literal(10),
      })
      .strict(),
    providers: z
      .object({
        market: z.literal("dexscreener-public"),
        swapsDisplayOnly: z.literal("geckoterminal-public"),
        social: z.literal("public-evidence-only"),
      })
      .strict(),
    ai: z.object({ enabled: z.literal(false) }).strict(),
    execution: z.literal("paper"),
    liveExecution: z.object({ enabled: z.literal(false) }).strict(),
  })
  .strict();
