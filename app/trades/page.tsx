import type { Metadata } from "next";
import { Eyebrow, SectionTitle } from "@/components/ui";
import {
  Metrics,
  EventFeed,
  Leaderboard,
  OpenPositions,
  StatusStrip,
} from "@/components/dashboard";
export const metadata: Metadata = { title: "Paper Trade Log" };
export default function Trades() {
  return (
    <div className="container page">
      <div className="page-heading">
        <Eyebrow>THE PUBLIC PAPER LEDGER</Eyebrow>
        <h1>
          Show the work.
          <br />
          <span className="gold">Keep the receipts.</span>
        </h1>
        <p>
          Actual recorded paper trades and research decisions.
          <br />
          Shared capital and isolated evaluations, clearly separated.
        </p>
        <span className="badge gold">PAPER TRADING ONLY · NO REAL ORDERS</span>
      </div>
      <StatusStrip />
      <Metrics />
      <section className="section">
        <SectionTitle
          label="ORIGINAL ACCOUNT + RESEARCH BOOKS"
          title="The trade log"
        />
        <div className="notice compact-notice">
          Historical receipts retain their original attribution. “Not recorded”
          means the source receipt does not identify an agent. Research signals
          and rejections are not completed trades.
        </div>
        <EventFeed full initialType="paper_fill" />
      </section>
      <section className="section">
        <SectionTitle
          label="LAST RECORDED SNAPSHOT"
          title="Open paper positions"
        />
        <OpenPositions />
      </section>
      <section className="section">
        <SectionTitle
          label="SIX INDEPENDENT RESEARCH PORTFOLIOS"
          title="Strategy performance"
          description="These books are separate from the shared paper account. Character names are presentation labels, not historical execution attribution."
        />
        <Leaderboard />
        <p className="image-note">
          No ranking without qualified fills. Net performance requires fresh
          marks; win rate requires recorded exits. Drawdown is the source
          engine’s sampled equity drawdown, when available.
        </p>
      </section>
    </div>
  );
}
