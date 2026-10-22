"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { Radio, ArrowUpRight } from "lucide-react";
export function Player() {
  const [config, setConfig] = useState<{
    url: string | null;
    configured: boolean;
    provider: string;
  } | null>(null);
  useEffect(() => {
    fetch("/api/stream")
      .then((r) => (r.ok ? r.json() : null))
      .then(setConfig)
      .catch(() => setConfig(null));
  }, []);
  return (
    <>
      <div className="player">
        {config?.url ? (
          <>
            <iframe
              title="AgentCraft broadcast player"
              src={config.url}
              allow="autoplay; encrypted-media; picture-in-picture; fullscreen"
              allowFullScreen
            />
            <a
              className="mobile-stream"
              href={config.url}
              target="_blank"
              rel="noreferrer"
            >
              Open broadcast player <ArrowUpRight size={15} />
            </a>
          </>
        ) : (
          <>
            <img
              src="/images/hq.webp"
              alt="Latest available AgentCraft headquarters evidence screenshot"
            />
            <div className="offline-overlay">
              <span className="offline-icon">
                <Radio size={30} />
              </span>
              <span className="badge">BROADCAST OFFLINE</span>
              <h2>The floor will be back.</h2>
              <p>
                No public stream is configured yet.
                <br />
                Explore the headquarters and its recorded activity below.
              </p>
              <Link href="/agents" className="button secondary">
                Meet the agents <ArrowUpRight size={15} />
              </Link>
            </div>
          </>
        )}
      </div>
      <div className="player-caption">
        <span>
          {config?.configured
            ? "BROADCAST CONFIGURED · LIVE STATUS UNVERIFIED"
            : "ACTUAL HQ CAPTURE · NOT A LIVE VIDEO"}
        </span>
        <span>PAPER TRADING ONLY</span>
      </div>
    </>
  );
}
