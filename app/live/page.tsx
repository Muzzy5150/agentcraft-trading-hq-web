import type { Metadata } from "next";
import { Eyebrow } from "@/components/ui";
import { Player } from "@/components/player";
import {
  LivePanels,
  EventFeed,
  Metrics,
  StatusStrip,
} from "@/components/dashboard";
export const metadata: Metadata = { title: "Live Headquarters" };
export default function Live() {
  return (
    <div className="container page">
      <div className="page-heading live-heading">
        <div>
          <Eyebrow>A WINDOW INTO THE WORLD</Eyebrow>
          <h1>Inside the headquarters.</h1>
          <p>The floor, the decisions, and the evidence behind them.</p>
        </div>
        <span className="badge">SPECTATOR MODE · READ ONLY</span>
      </div>
      <StatusStrip />
      <div className="live-layout">
        <div>
          <Player />
          <Metrics compact />
          <section className="panel">
            <div className="panel-title">
              RESEARCH, RECEIPTS & RECORDED DECISIONS
            </div>
            <EventFeed />
          </section>
        </div>
        <LivePanels />
      </div>
    </div>
  );
}
