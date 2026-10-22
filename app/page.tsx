import Link from "next/link";
import { ArrowUpRight, Play, ArrowRight, ShieldCheck } from "lucide-react";
import { agents } from "@/lib/agents";
import { AgentCard, ButtonLink, Eyebrow, SectionTitle } from "@/components/ui";
import { StatusStrip, Metrics, EventFeed } from "@/components/dashboard";

export default function Home() {
  return (
    <>
      <section className="hero">
        <img
          className="hero-image"
          src="/images/hq.webp"
          alt="The actual AgentCraft Minecraft headquarters: timber beams, lanterns, trading desks and its custom characters"
          fetchPriority="high"
        />
        <div className="hero-shade" />
        <div className="hero-content container">
          <Eyebrow>WELCOME TO OUR CORNER OF MINECRAFT</Eyebrow>
          <h1>
            AGENT<span>CRAFT</span>
          </h1>
          <div className="hero-subtitle">SOLANA TRADING HQ</div>
          <p>12 agents. One world. A market that never sleeps.</p>
        </div>
        <div className="hero-caption">
          <span>THE ORIGINAL HEADQUARTERS</span>
          <span>ACTUAL GAME CAPTURE · NOT A LIVE BROADCAST</span>
        </div>
      </section>
      <nav className="world-actions" aria-label="Explore AgentCraft">
        <Link className="button" href="/live">
          <Play size={18} fill="currentColor" /> WATCH THE HQ
        </Link>
        <Link className="button secondary" href="/agents">
          MEET THE AGENTS <ArrowRight size={18} />
        </Link>
        <Link className="button secondary" href="/trades">
          EXPLORE TRADES <ArrowRight size={18} />
        </Link>
        <Link className="button secondary" href="/deploy">
          BUILD YOUR OWN <ArrowRight size={18} />
        </Link>
      </nav>
      <div className="status-band">
        <div className="container">
          <StatusStrip />
        </div>
      </div>

      <section className="section welcome-section container">
        <div className="center-heading">
          <Eyebrow>A WORLD WITH A PURPOSE</Eyebrow>
          <h2>
            A little world.
            <br />A lot of intelligence.
          </h2>
          <p>
            A Minecraft headquarters where distinct personalities meet real
            Solana market data. Explore the desks, follow the research, and
            watch every paper trade leave a trail.
          </p>
        </div>
        <div className="intro-stats">
          {[
            ["06", "Trading agents"],
            ["02", "X researchers"],
            ["04", "Developer agents"],
          ].map(([n, label]) => (
            <div key={label}>
              <strong>{n}</strong>
              <span>{label}</span>
            </div>
          ))}
          <div className="paper-tag">
            <ShieldCheck size={30} />
            <span>
              Real markets.
              <br />
              <b>Paper capital.</b>
            </span>
          </div>
        </div>
      </section>

      <section className="world-story">
        <div className="world-story-image">
          <img
            src="/images/trading.webp"
            alt="Gold-framed market monitors on the real Minecraft trading floor"
            loading="lazy"
          />
          <span className="capture-label">01 / THE TRADING FLOOR</span>
        </div>
        <div className="world-story-copy">
          <div className="voxel-mark" aria-hidden="true">
            <i />
            <i />
            <i />
          </div>
          <Eyebrow>STEP INSIDE AGENTCRAFT</Eyebrow>
          <h2>
            Built block by block.
            <br />
            Thinking tick by tick.
          </h2>
          <p>
            Timber beams. Glowing monitors. A very opinionated crew. This is a
            working Minecraft world with six independent research strategies and
            a paper-only trading engine.
          </p>
          <ButtonLink href="/live">EXPLORE THE HEADQUARTERS</ButtonLink>
          <span className="image-note">
            Real project imagery. Every screen reflects its capture time.
          </span>
        </div>
      </section>

      <section className="section roster-preview container">
        <SectionTitle
          label="SIX DESKS. SIX DIFFERENT INSTINCTS."
          title="Meet the trading crew."
          description="From launch hunters to patient breakout watchers. Get to know the personalities behind the research."
          href="/agents#traders"
          link="EXPLORE ALL AGENTS"
        />
        <div className="featured-agents">
          {agents
            .filter((a) => a.role === "trader")
            .map((a, i) => (
              <AgentCard agent={a} index={i} key={a.id} />
            ))}
        </div>
        <p className="image-note">
          Fictional in-game personas. No real-world participation or endorsement
          implied.
        </p>
      </section>

      <section className="department-section research-section">
        <div className="container editorial-split">
          <div className="editorial-copy">
            <Eyebrow>02 / SOCIAL INTELLIGENCE</Eyebrow>
            <h2>
              The conversation
              <br />
              has a home.
            </h2>
            <p>
              Two research agents keep an eye on public X evidence. RASMR
              follows attention. THREAD GUY follows the story. The sources stay
              visible, and unknowns stay unknown.
            </p>
            <div className="cast-links">
              {agents
                .filter((a) => a.role === "scanner")
                .map((a) => (
                  <Link href={`/agents/${a.slug}`} key={a.id}>
                    {a.name}
                    <ArrowUpRight size={16} />
                  </Link>
                ))}
            </div>
            <ButtonLink href="/agents#scanners">
              MEET THE RESEARCHERS
            </ButtonLink>
          </div>
          <figure className="editorial-image">
            <img
              src="/images/social.webp"
              alt="THREAD GUY at the actual X research workstation in AgentCraft"
              loading="lazy"
            />
            <figcaption>PUBLIC CONVERSATIONS. RECORDED EVIDENCE.</figcaption>
          </figure>
        </div>
      </section>
      <section className="department-section builder-section">
        <div className="container editorial-split reverse">
          <div className="editorial-copy">
            <Eyebrow>04 / DEVELOPER AGENTS</Eyebrow>
            <h2>
              Behind every world,
              <br />
              there are builders.
            </h2>
            <p>
              Meet the crew at the code desks: TOLY, MERT, RAJ, and the planned
              JACOB persona. Their stations reveal the diagnostics and
              integrations that keep the HQ understandable.
            </p>
            <div className="cast-links">
              {agents
                .filter((a) => a.role === "coder")
                .map((a) => (
                  <Link href={`/agents/${a.slug}`} key={a.id}>
                    {a.name}
                    <ArrowUpRight size={16} />
                  </Link>
                ))}
            </div>
            <ButtonLink href="/agents#coders">MEET THE BUILDERS</ButtonLink>
          </div>
          <figure className="editorial-image">
            <img
              src="/images/coding.webp"
              alt="RAJ’s Minecraft workstation showing real source and integration diagnostics"
              loading="lazy"
            />
            <figcaption>THE SYSTEMS BEHIND THE SCENES.</figcaption>
          </figure>
        </div>
      </section>

      <section className="watch-promo dark-section">
        <img
          src="/images/hq.webp"
          alt="A wide view down the lantern-lit AgentCraft headquarters"
          loading="lazy"
        />
        <div className="container">
          <div className="watch-copy">
            <Eyebrow>THE BEST SEAT IN THE HOUSE</Eyebrow>
            <h2>
              Take a break.
              <br />
              Watch the floor.
            </h2>
            <p>
              Your window into the HQ, with a dedicated broadcast player, source
              status, and recorded agent activity.
            </p>
            <ButtonLink href="/live">ENTER SPECTATOR MODE</ButtonLink>
            <span className="image-note">
              Stream availability is shown on the Watch page.
            </span>
          </div>
        </div>
      </section>

      <section className="section receipts-section container">
        <SectionTitle
          label="REAL MARKETS. AN OPEN PAPER JOURNAL."
          title="The world is virtual. The receipts are real."
          description="Follow the decisions, inspect the risk gates, and explore genuine historical paper activity."
          href="/trades"
          link="EXPLORE TRADES"
        />
        <Metrics compact />
        <div className="activity-grid">
          <div className="panel activity-main">
            <div className="panel-title">
              RECORDED PAPER ACTIVITY <span className="badge">HISTORY</span>
            </div>
            <EventFeed initialType="paper_fill" />
          </div>
          <div className="how-panel">
            <Eyebrow>FROM MARKET TO MINECRAFT</Eyebrow>
            {[
              [
                "01",
                "Observe the market",
                "Public Solana data and available X evidence reach the local engine.",
              ],
              [
                "02",
                "Research independently",
                "Six strategy books evaluate the market with their own recorded criteria.",
              ],
              [
                "03",
                "Respect the gates",
                "Qualifying decisions reach paper execution. Rejections stay visible.",
              ],
            ].map(([n, title, copy]) => (
              <div className="how-step" key={n}>
                <span>{n}</span>
                <div>
                  <h3>{title}</h3>
                  <p>{copy}</p>
                </div>
              </div>
            ))}
            <div className="safe-note">
              <ShieldCheck size={20} /> No wallet. No real-money execution.
            </div>
          </div>
        </div>
      </section>
      <section className="build-promo">
        <div className="container editorial-split">
          <div className="editorial-copy">
            <Eyebrow>YOUR NEXT BUILD STARTS HERE</Eyebrow>
            <h2>
              Your world.
              <br />
              Your headquarters.
            </h2>
            <p>
              Explore the setup guide for your own Minecraft Java Edition
              installation. Check platform requirements and follow progress
              toward verified Windows and macOS packages.
            </p>
            <ButtonLink href="/deploy">BUILD YOUR OWN</ButtonLink>
            <span className="image-note">
              Full HQ downloads are in preparation.
            </span>
          </div>
          <figure className="editorial-image">
            <img
              src="/images/raj-desk.webp"
              alt="The real AgentCraft builder station, with a Minecraft character at its desk"
              loading="lazy"
            />
            <figcaption>LOCAL FIRST. PAPER ONLY. YOURS TO EXPLORE.</figcaption>
          </figure>
        </div>
      </section>
    </>
  );
}
