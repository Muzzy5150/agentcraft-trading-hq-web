import type { Metadata } from "next";
import {
  Monitor,
  Terminal,
  ArrowUpRight,
  Check,
  Package,
  ShieldCheck,
} from "lucide-react";
import { Eyebrow, SectionTitle } from "@/components/ui";
export const metadata: Metadata = { title: "Run Your Own HQ" };
const requirements = [
  ["Minecraft", "Java Edition 26.3 · legitimate installation required"],
  ["Fabric Loader", "0.19.5"],
  ["Fabric API", "0.161.0+26.3"],
  ["Java", "25 in the verified source runtime"],
  ["Node.js", "22 or later for the engine; 22.13+ for this publisher"],
  [
    "Platforms",
    "Source runtime verified on Apple Silicon macOS; Windows validation pending",
  ],
];
export default function Deploy() {
  return (
    <div className="container page">
      <div className="deploy-hero">
        <div>
          <Eyebrow>BUILD YOUR OWN CORNER OF THE WORLD</Eyebrow>
          <h1>
            Your machine.
            <br />
            Your agents.
            <br />
            <span className="gold">Your headquarters.</span>
          </h1>
          <p>
            Bring AgentCraft’s research floor to a Minecraft Java Edition
            installation you own. Paper capital, local settings, and a fresh
            start.
          </p>
          <span className="badge gold">
            SELF-HOSTING RELEASE IN PREPARATION
          </span>
        </div>
        <img src="/images/hq.webp" alt="AgentCraft Minecraft headquarters" />
      </div>
      <div className="download-grid">
        <div className="download-card">
          <Monitor size={30} />
          <h2>AgentCraft for Windows</h2>
          <p>PowerShell setup and launch path.</p>
          <button className="button secondary" disabled>
            Download for Windows · Pending
          </button>
          <small>Fresh installation and package verification required.</small>
        </div>
        <div className="download-card">
          <Terminal size={30} />
          <h2>AgentCraft for macOS</h2>
          <p>Shell-based setup and diagnostics.</p>
          <button className="button secondary" disabled>
            Download for macOS · Pending
          </button>
          <small>
            No verified redistributable HQ package is published yet.
          </small>
        </div>
      </div>
      <section className="section requirements">
        <div>
          <SectionTitle
            label="FROM THE ACTUAL RUNTIME"
            title="Know what you’re running."
            description="These are inspected source requirements, not guessed compatibility promises."
          />
          <p className="muted">
            Minecraft game files, saved accounts, private ledgers and character
            likeness assets are excluded from distribution. Download buttons
            activate only after a versioned package passes licensing and
            fresh-install checks.
          </p>
          <a
            href="https://github.com/Muzzy5150/agentcraft-trading-hq-web"
            className="text-link"
          >
            Website source & documentation <ArrowUpRight size={16} />
          </a>
        </div>
        <dl>
          {requirements.map(([k, v]) => (
            <div key={k}>
              <dt>{k}</dt>
              <dd>{v}</dd>
            </div>
          ))}
        </dl>
      </section>
      <section className="section">
        <SectionTitle label="LOCAL FIRST, PAPER ONLY" title="The setup path" />
        <div className="steps-grid">
          {[
            [
              "01",
              "Install your Minecraft runtime",
              "Use your own licensed Java Edition installation. The verified source uses Minecraft 26.3, Java 25 and the Fabric versions above.",
            ],
            [
              "02",
              "Configure your instance locally",
              "Use a fresh paper ledger, generic identities and your own configuration. API credentials stay on your machine.",
            ],
            [
              "03",
              "Start the HQ and verify the feed",
              "Check the local health endpoint, market freshness and risk limits before observing paper activity.",
            ],
            [
              "04",
              "Publish only what you choose",
              "The optional read-only publisher sends allowlisted public records outbound over HTTPS. No game control ports are exposed.",
            ],
          ].map(([n, title, copy]) => (
            <article className="panel" key={n}>
              <span className="step-number">{n}</span>
              <h3>{title}</h3>
              <p>{copy}</p>
            </article>
          ))}
        </div>
      </section>
      <section className="section">
        <SectionTitle
          label="CONFIGURATION REFERENCE"
          title="Safe by default."
        />
        <div className="config-grid">
          <div className="code-window">
            <div>
              <span />
              <span />
              <span />
              <b>local paper settings</b>
            </div>
            <pre>{`# Existing engine defaults\nSTARTING_PAPER_USD=1000\nPAPER_TRADE_USD=40\nMAX_OPEN_POSITIONS=3\nMIN_LIQUIDITY_USD=50000\nMIN_24H_VOLUME_USD=25000\nPOLL_SECONDS=30\n\n# Always local. Never upload secrets.\n# Signing / live execution: unsupported`}</pre>
          </div>
          <div className="config-copy">
            <h3>Real data. Simulated execution.</h3>
            <p>
              The engine uses public DEX Screener data. Available public X
              evidence and GeckoTerminal swap observations support research and
              display; they do not replace the paper execution quote source.
            </p>
            <ul>
              <li>
                <Check size={16} />
                5% entry cap / 15% portfolio exposure cap
              </li>
              <li>
                <Check size={16} />
                10% daily realized loss stop
              </li>
              <li>
                <Check size={16} />
                0.5% fees / 0.75% slippage assumptions
              </li>
              <li>
                <Check size={16} />
                No AI-provider execution or wallet signing configured
              </li>
            </ul>
          </div>
        </div>
      </section>
      <section className="section">
        <SectionTitle
          label="HELP AT YOUR DESK"
          title="Good questions. Straight answers."
        />
        <div className="faq">
          {[
            [
              "Why are the downloads unavailable?",
              "The original HQ includes local runtime dependencies and custom likeness assets. A verified, generic-character redistribution package and clean Windows/macOS installation tests are still required. The website and publisher source are available separately.",
            ],
            [
              "What if the engine or market feed goes offline?",
              "The website remains available with recorded history. Source timestamps determine LIVE, STALE or OFFLINE state. Missing fresh prices never become invented current performance.",
            ],
            [
              "Where do I put provider credentials?",
              "Only in your own local configuration or secure hosting provider settings. This public website has no wallet-key or provider-secret collection form.",
            ],
            [
              "Can I change risk limits or agent identities?",
              "The inspected engine exposes starting paper capital, trade size, maximum positions and liquidity/volume settings. Its hard risk caps and roster are source-defined. The website does not edit them.",
            ],
            [
              "Does the system autonomously write code?",
              "The current coding desks show deterministic diagnostics and source views. They do not prove autonomous commits, builds or completed engineering work.",
            ],
            [
              "Will this trade on mainnet?",
              "This release has no real-money execution or signing path. Future live execution remains a separate proposal requiring explicit opt-in and independent platform-policy, security and legal review.",
            ],
          ].map(([q, a]) => (
            <details key={q}>
              <summary>
                {q}
                <span>+</span>
              </summary>
              <p>{a}</p>
            </details>
          ))}
        </div>
      </section>
      <div className="release-note">
        <Package />
        <div>
          <h3>Website & publisher v0.1.0</h3>
          <p>
            Public reporting interface, source-verified agent catalog,
            historical paper receipts, authenticated ingestion and outbound
            publisher. Full HQ game distribution is not yet released.
          </p>
        </div>
        <ShieldCheck className="gold" />
      </div>
      <p className="legal-note">
        Not an official Minecraft product. Not approved by or associated with
        Mojang or Microsoft. Minecraft is not included. Read the{" "}
        <a href="https://www.minecraft.net/en-us/eula">Minecraft EULA</a> and{" "}
        <a href="https://www.minecraft.net/en-us/usage-guidelines">
          Usage Guidelines
        </a>
        . Real-world earning mechanics are not part of this project.
      </p>
    </div>
  );
}
