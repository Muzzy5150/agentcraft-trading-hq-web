import Link from "next/link";
import { ArrowUpRight, ArrowRight } from "lucide-react";
import { getAgent, type Agent } from "@/lib/agents";
export function Eyebrow({ children }: { children: React.ReactNode }) {
  return (
    <div className="eyebrow">
      <span /> {children}
    </div>
  );
}
export function SectionTitle({
  label,
  title,
  description,
  href,
  link,
}: {
  label: string;
  title: string;
  description?: string;
  href?: string;
  link?: string;
}) {
  return (
    <div className="section-heading">
      <div>
        <Eyebrow>{label}</Eyebrow>
        <h2>{title}</h2>
        {description && <p>{description}</p>}
      </div>
      {href && (
        <Link className="text-link" href={href}>
          {link}
          <ArrowUpRight size={17} />
        </Link>
      )}
    </div>
  );
}
export function AgentCard({
  agent,
  index = 0,
}: {
  agent: Agent;
  index?: number;
}) {
  return (
    <Link className={`agent-card ${agent.role}`} href={`/agents/${agent.slug}`}>
      <div className="agent-art">
        {agent.image ? (
          <img
            src={`/images/${agent.image}.webp`}
            alt={`${agent.name} — actual Minecraft screenshot`}
            loading="lazy"
          />
        ) : (
          <div className="placeholder-character">
            ?<small>PERSONA IN DEVELOPMENT</small>
          </div>
        )}
        <span className="agent-number">
          {String(index + 1).padStart(2, "0")}
        </span>
        <span className="agent-role">
          {agent.role === "trader"
            ? "TRADER"
            : agent.role === "scanner"
              ? "X SCANNER"
              : "CODER"}
        </span>
      </div>
      <div className="agent-info">
        <h3>
          {agent.name}
          <ArrowUpRight size={16} />
        </h3>
        <p className="agent-title">{agent.title}</p>
        <p className="agent-description">{agent.description}</p>
        <div className="agent-specialty">
          {agent.strategy?.replaceAll("_", " ") ||
            agent.specialty.split(" · ")[0]}
        </div>
      </div>
    </Link>
  );
}
export function Empty({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <div className="empty">
      <span>◇</span>
      <h3>{title}</h3>
      <p>{description}</p>
    </div>
  );
}
export function AgentName({ id }: { id: string | null }) {
  const a = id ? getAgent(id) : null;
  return a ? (
    <Link href={`/agents/${a.slug}`} className="agent-name">
      {a.name}
    </Link>
  ) : (
    <span className="muted">Not recorded</span>
  );
}
export function ButtonLink({
  href,
  children,
  secondary = false,
}: {
  href: string;
  children: React.ReactNode;
  secondary?: boolean;
}) {
  return (
    <Link href={href} className={`button ${secondary ? "secondary" : ""}`}>
      {children}
      <ArrowRight size={16} />
    </Link>
  );
}
export const money = (x: number | null | undefined) =>
  x === null || x === undefined
    ? "—"
    : new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD",
        maximumFractionDigits: 2,
      }).format(x);
