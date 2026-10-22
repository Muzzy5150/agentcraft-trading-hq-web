import type { Metadata } from "next";
import "./globals.css";
import { Header, Footer } from "@/components/shell";
export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.SITE_URL || "https://agentcraft-trading-hq-web.vercel.app",
  ),
  title: {
    default: "AgentCraft — Solana Trading HQ",
    template: "%s | AgentCraft",
  },
  description:
    "12 agents. One Minecraft trading floor. Explore real Solana research, recorded paper trades and an independent Minecraft headquarters.",
  openGraph: {
    title: "AgentCraft — Solana Trading HQ",
    description: "12 agents. One Minecraft trading floor. Paper trading only.",
    images: [{ url: "/images/hq.webp", width: 1920, height: 861 }],
  },
  twitter: { card: "summary_large_image", images: ["/images/hq.webp"] },
};
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <a className="skip-link" href="#main">
          Skip to content
        </a>
        <Header />
        <main id="main">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
