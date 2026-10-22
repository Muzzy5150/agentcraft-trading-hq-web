import type { MetadataRoute } from "next";
import { agents } from "@/lib/agents";
export default function sitemap(): MetadataRoute.Sitemap {
  const base =
    process.env.SITE_URL || "https://agentcraft-trading-hq-web.vercel.app";
  return [
    "",
    "/live",
    "/trades",
    "/agents",
    "/deploy",
    ...agents.map((a) => `/agents/${a.slug}`),
  ].map((route) => ({
    url: base + route,
    changeFrequency: "weekly",
    priority: route === "" ? 1 : 0.7,
  }));
}
