import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, ArrowUpRight } from "lucide-react";
import { agents, getAgent } from "@/lib/agents";
import { Eyebrow } from "@/components/ui";
import { EventFeed } from "@/components/dashboard";
export function generateStaticParams() {
  return agents.map((a) => ({ slug: a.slug }));
}
export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const a = getAgent((await params).slug);
  return { title: a ? `${a.name} — ${a.title}` : "Agent not found" };
}
export default async function Profile({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const a = getAgent((await params).slug);
  if (!a) notFound();
  return (
    <div className="container page profile-page">
      <Link href="/agents" className="text-link back">
        <ArrowLeft size={14} /> All agents
      </Link>
      <section className="profile-hero">
        <div className={`profile-art ${a.role}`}>
          {a.image ? (
            <img
              src={`/images/${a.image}.webp`}
              alt={`${a.name} actual Minecraft character screenshot`}
            />
          ) : (
            <div className="placeholder-character">
              ?<small>JACOB ART NOT IMPLEMENTED</small>
            </div>
          )}
          <span className="badge">
            {a.image ? "ACTUAL IN-GAME CAPTURE" : "PLANNED PERSONA"}
          </span>
        </div>
        <div className="profile-bio">
          <Eyebrow>
            {a.role === "trader"
              ? "TRADING DESK"
              : a.role === "scanner"
                ? "SOCIAL INTELLIGENCE"
                : "DEVELOPER DESK"}{" "}
            / {a.implemented ? "IMPLEMENTED PERSONA" : "IN DEVELOPMENT"}
          </Eyebrow>
          <h1>{a.name}</h1>
          <h2>{a.title}</h2>
          <p className="lead">{a.description}</p>
          <div className="profile-facts">
            <div>
              <small>SPECIALTY</small>
              <p>{a.specialty}</p>
            </div>
            <div>
              <small>ACTIVITY STATUS</small>
              <p>Live status not verified · see sourced activity below</p>
            </div>
            <div>
              <small>
                {a.strategy ? "RESEARCH STRATEGY" : "CURRENT CAPABILITY"}
              </small>
              <p>
                {a.strategy?.replaceAll("_", " ") ||
                  (a.implemented
                    ? "Read-only observation and diagnostics"
                    : "Existing Byte strategy monitor; JACOB pending")}
              </p>
            </div>
          </div>
        </div>
      </section>
      <section className="profile-story">
        <div>
          <Eyebrow>IN-GAME CHARACTER STORY</Eyebrow>
          <h2>A seat with a purpose.</h2>
          <p>{a.story}</p>
          <blockquote>
            “{a.quote}”
            <cite>FICTIONAL SIGNATURE DIALOGUE · NOT A REAL QUOTATION</cite>
          </blockquote>
          <h3>Across the floor</h3>
          <div className="peer-links">
            {a.peers.map((s) => {
              const p = getAgent(s)!;
              return (
                <Link key={s} href={`/agents/${s}`}>
                  {p.name}
                  <ArrowUpRight size={14} />
                </Link>
              );
            })}
          </div>
        </div>
        <figure>
          <img
            src={`/images/${a.desk}-desk.webp`}
            alt={`${a.implemented ? a.name : "Existing coder"} workstation captured in Minecraft`}
          />
          <figcaption>
            {a.implemented ? a.name : "Existing coder"} workstation · actual
            historical capture
          </figcaption>
        </figure>
      </section>
      <section className="section">
        <Eyebrow>SOURCED HISTORY</Eyebrow>
        <h2>
          {a.role === "trader"
            ? "Recorded research and paper activity"
            : "Recorded activity"}
        </h2>
        <p className="muted">
          Trader pages show the associated isolated strategy; scanner and coder
          pages show explicitly attributed events. Strategy presentation labels
          do not rewrite old receipts.
          {a.role === "coder"
            ? " No autonomous edits, commits or completed builds are claimed."
            : ""}
        </p>
        <EventFeed
          full
          initialAgent={a.role === "trader" ? "" : a.id}
          initialStrategy={a.strategy || ""}
        />
      </section>
      <div className="notice">
        Independent fictional character. No real-world endorsement or
        participation. Character stories and dialogue are separate from recorded
        system activity.
      </div>
    </div>
  );
}
