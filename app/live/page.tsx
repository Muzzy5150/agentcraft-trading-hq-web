import type { Metadata } from "next";
import { Eyebrow, SectionTitle } from "@/components/ui";
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
    <>
      <section className="broadcast-stage dark-section">
        <div className="container">
          <div className="page-heading live-heading">
            <div>
              <Eyebrow>A WINDOW INTO THE WORLD</Eyebrow>
              <h1>Inside the headquarters.</h1>
              <p>Pull up a seat. There’s a whole world at work.</p>
            </div>
            <span className="badge">SPECTATOR MODE · READ ONLY</span>
          </div>
          <Player />
        </div>
      </section>
      <div className="container page live-page">
        <StatusStrip />
        <Metrics compact />
        <div className="live-layout">
          <section>
            <SectionTitle
              label="ON THE FLOOR"
              title="Follow the activity."
              description="Research, receipts, and recorded decisions from the headquarters."
            />
            <div className="panel">
              <EventFeed />
            </div>
          </section>
          <LivePanels />
        </div>
      </div>
    </>
  );
}
