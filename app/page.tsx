import Link from "next/link";
import {
  ArrowUpRight,
  Play,
  Blocks,
  Code2,
  Radio,
  ShieldCheck,
  ArrowRight,
} from "lucide-react";
import { agents } from "@/lib/agents";
import { AgentCard, ButtonLink, Eyebrow, SectionTitle } from "@/components/ui";
import { StatusStrip, Metrics, EventFeed } from "@/components/dashboard";
export default function Home() {
  return (
    <>
      <section className="hero">
        <div className="hero-image" />
        <div className="hero-shade" />
        <div className="hero-content container">
          <Eyebrow>THE WORLD IS VIRTUAL. THE MARKET DATA IS REAL.</Eyebrow>
          <h1>
            AGENT<span>CRAFT</span>
            <span className="hero-square">▪</span>
          </h1>
          <h2>12 Agents. One Minecraft Trading Floor.</h2>
          <p>
            Watch autonomous trading strategies, social intelligence, and
            developer agents operate inside a live Minecraft headquarters
            powered by real Solana market data.
          </p>
          <div className="hero-actions">
            <Link className="button" href="/live">
              <Play size={15} fill="currentColor" /> WATCH LIVE{" "}
              <ArrowUpRight size={17} />
            </Link>
            <Link className="button secondary" href="/agents">
              MEET THE AGENTS <ArrowRight size={16} />
            </Link>
          </div>
          <Link className="hero-tertiary" href="/deploy">
            Run your own HQ <ArrowUpRight size={13} />
          </Link>
        </div>
        <div className="hero-caption">
          <span>01 / INSIDE THE HEADQUARTERS</span>
          <span>ACTUAL IN-GAME CAPTURE · NOT A LIVE BROADCAST</span>
        </div>
      </section>
      <div className="container">
        <StatusStrip />
        <div className="intro-stats">
          <div>
            <strong>12</strong>
            <span>distinct personalities</span>
          </div>
          <div>
            <strong>06</strong>
            <span>trading strategies</span>
          </div>
          <div>
            <strong>02</strong>
            <span>social intelligence desks</span>
          </div>
          <div>
            <strong>04</strong>
            <span>developer stations</span>
          </div>
          <div className="paper-tag">
            <ShieldCheck size={26} />
            <span>
              Real markets.
              <br />
              <b>Paper capital.</b>
            </span>
          </div>
        </div>
        <section className="section">
          <SectionTitle
            label="WELCOME TO THE FLOOR"
            title="Not your usual trading terminal."
            description="A working headquarters you can actually step inside. Every desk has a job. Every recorded decision has a source."
            href="/live"
            link="Explore the live HQ"
          />
          <div className="world-grid">
            <Link href="/live" className="world-feature">
              <img
                src="/images/trading.webp"
                alt="Six gold-framed trading monitors inside the actual AgentCraft Minecraft HQ"
                loading="lazy"
              />
              <div>
                <span className="eyebrow">01 / THE TRADING FLOOR</span>
                <h3>Real charts. Independent strategies.</h3>
                <p>
                  Public Solana data feeds a rule-based, paper-only trading
                  engine.
                </p>
              </div>
              <span className="image-arrow">
                <ArrowUpRight />
              </span>
            </Link>
            <div className="world-side">
              <Link href="/agents#scanners" className="world-small">
                <img
                  src="/images/social.webp"
                  alt="THREAD GUY’s actual public X research workstation"
                  loading="lazy"
                />
                <div>
                  <Radio size={17} />
                  <h3>The pulse of the conversation.</h3>
                  <span>02 / SOCIAL INTELLIGENCE</span>
                </div>
              </Link>
              <Link href="/agents#coders" className="world-small">
                <img
                  src="/images/coding.webp"
                  alt="RAJ’s actual code and integration diagnostics workstation"
                  loading="lazy"
                />
                <div>
                  <Code2 size={18} />
                  <h3>The systems behind the scenes.</h3>
                  <span>03 / DEVELOPER STATIONS</span>
                </div>
              </Link>
            </div>
          </div>
          <p className="image-note">
            Genuine project captures. Screens show information recorded at
            capture time.{" "}
            <a href="/data/image-provenance.json">View image provenance ↗</a>
          </p>
        </section>
        <section className="section">
          <SectionTitle
            label="MEET YOUR NEW FAVORITE DESKMATES"
            title="Big personalities. Specific jobs."
            description="Six traders. Two scanners. Four builders. One very opinionated floor."
            href="/agents"
            link="Meet all 12 agents"
          />
          <div className="featured-agents">
            {agents.slice(0, 4).map((a, i) => (
              <AgentCard agent={a} index={i} key={a.id} />
            ))}
          </div>
          <p className="image-note">
            Fictional in-game personas. Independent project; no real-world
            participation or endorsement implied.
          </p>
        </section>
        <section className="section">
          <SectionTitle
            label="THE RECEIPTS, NOT THE HYPE"
            title="Every paper trade leaves a trail."
            description="Explore recorded decisions and actual paper receipts. No invented wins, no simulated live feed."
            href="/trades"
            link="Open the trade log"
          />
          <Metrics compact />
          <div className="activity-grid">
            <div className="panel activity-main">
              <div className="panel-title">
                <span className="tiny-dot" /> RECORDED PAPER ACTIVITY{" "}
                <span className="badge">HISTORY</span>
              </div>
              <EventFeed initialType="paper_fill" />
            </div>
            <div className="how-panel">
              <Eyebrow>HOW AGENTCRAFT WORKS</Eyebrow>
              {[
                {
                  n: "01",
                  title: "Observe the market",
                  copy: "Public Solana market data and available X evidence reach the local engine.",
                },
                {
                  n: "02",
                  title: "Research independently",
                  copy: "Six strategy portfolios evaluate the same market with distinct, recorded criteria.",
                },
                {
                  n: "03",
                  title: "Respect the gates",
                  copy: "Only qualifying decisions reach paper execution. Rejections stay visible.",
                },
              ].map((x) => (
                <div className="how-step" key={x.n}>
                  <span>{x.n}</span>
                  <div>
                    <h3>{x.title}</h3>
                    <p>{x.copy}</p>
                  </div>
                </div>
              ))}
              <div className="safe-note">
                <ShieldCheck size={16} /> No wallet. No real-money execution.
              </div>
            </div>
          </div>
        </section>
        <section className="build-banner">
          <div className="pixel-cube">
            <Blocks size={65} />
          </div>
          <div>
            <Eyebrow>YOUR WORLD. YOUR HEADQUARTERS.</Eyebrow>
            <h2>Bring the trading floor home.</h2>
            <p>
              Explore the self-hosting guide for Minecraft Java Edition.
              <br />
              Verified install packages are in preparation.
            </p>
          </div>
          <ButtonLink href="/deploy">RUN YOUR OWN HQ</ButtonLink>
        </section>
        <div className="tech-row">
          <span>BUILT ON</span>
          <b>
            Minecraft <small>JAVA EDITION</small>
          </b>
          <b className="solana">
            ≋ <span>Solana</span>
          </b>
          <b>Next.js</b>
          <b>
            Supabase <small>REPORTING ARCHITECTURE</small>
          </b>
          <b>▲ Vercel</b>
        </div>
      </div>
    </>
  );
}
