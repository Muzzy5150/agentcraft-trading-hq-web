"use client";
import { useCallback, useEffect, useState } from "react";
import { createClient } from "@supabase/supabase-js";
import Link from "next/link";
import {
  Activity,
  ArrowUpRight,
  ChevronLeft,
  ChevronRight,
  Radio,
  RefreshCw,
  Search,
  ShieldCheck,
} from "lucide-react";
import { agents, getAgent } from "@/lib/agents";
import { freshness, type PublicEvent, type Snapshot } from "@/lib/schema";
import { AgentName, Empty, money } from "./ui";
type Status = {
  snapshot: Snapshot;
  ingestedAt: string | null;
  storage: string;
  connection: string;
};
export function useStatus() {
  const [data, setData] = useState<Status | null>(null),
    [failed, setFailed] = useState(false),
    [now, setNow] = useState(0);
  const refresh = useCallback(async () => {
    try {
      const r = await fetch("/api/status", { cache: "no-store" });
      if (!r.ok) throw Error();
      setData(await r.json());
      setNow(Date.now());
      setFailed(false);
    } catch {
      setFailed(true);
    }
  }, []);
  useEffect(() => {
    const initial = setTimeout(() => void refresh(), 0);
    const id = setInterval(() => {
      setNow(Date.now());
      void refresh();
    }, 15000);
    return () => {
      clearTimeout(initial);
      clearInterval(id);
    };
  }, [refresh]);
  const engine = failed
    ? "OFFLINE"
    : freshness(
        data?.snapshot.sourceTimestamp,
        data?.snapshot.engineOnline,
        now,
      );
  return { data, failed, engine, refresh, now };
}
export function StatusStrip() {
  const { data, engine, failed } = useStatus();
  return (
    <div className="status-strip">
      <span>
        <i className={`status-dot ${engine.toLowerCase()}`} />
        ENGINE {engine}
      </span>
      <span>
        <ShieldCheck size={13} /> PAPER TRADING ONLY
      </span>
      <span className="muted">
        {failed
          ? "REPORTING CONNECTION LOST"
          : data?.storage === "historical"
            ? "RECORDED HISTORY · LIVE SYNC NOT CONNECTED"
            : data
              ? "REAL SOLANA MARKET DATA"
              : "CHECKING PUBLIC REPORTING"}
      </span>
      <Link href="/live">
        Inside the HQ <ArrowUpRight size={13} />
      </Link>
    </div>
  );
}
export function Metrics({ compact = false }: { compact?: boolean }) {
  const { data, engine, now } = useStatus();
  const s = data?.snapshot;
  return (
    <div className={`metrics ${compact ? "compact" : ""}`}>
      <Metric
        label="Shared paper equity"
        value={money(engine === "LIVE" ? s?.equityUsd : null)}
        note={
          engine === "LIVE"
            ? "Latest reported mark"
            : "Current mark unavailable"
        }
      />
      <Metric
        label="Recorded realized P&L"
        value={money(s?.realizedUsd)}
        note="Shared account · historical receipts"
      />
      <Metric
        label="Open paper positions"
        value={s?.openPositions?.toString() || "—"}
        note="At last recorded snapshot"
      />
      <Metric
        label="Market data"
        value={
          s?.marketTimestamp
            ? freshness(s.marketTimestamp, s.marketState !== "OFFLINE", now)
            : "UNKNOWN"
        }
        note={
          s?.marketTimestamp
            ? new Date(s.marketTimestamp).toLocaleString()
            : "No fresh public market snapshot"
        }
      />
    </div>
  );
}
function Metric({
  label,
  value,
  note,
}: {
  label: string;
  value: string;
  note: string;
}) {
  return (
    <div className="metric">
      <div>{label}</div>
      <strong className={value.startsWith("-") ? "negative" : ""}>
        {value}
      </strong>
      <small>{note}</small>
    </div>
  );
}
export function Leaderboard() {
  const { data, engine } = useStatus();
  return (
    <div className="table-wrap">
      <table>
        <thead>
          <tr>
            <th>Trader / presentation label</th>
            <th>Isolated strategy</th>
            <th>Net P&L</th>
            <th>Win rate</th>
            <th>Closed trades</th>
            <th>Drawdown</th>
          </tr>
        </thead>
        <tbody>
          {agents
            .filter((a) => a.role === "trader")
            .map((a) => {
              const p = data?.snapshot.performance.find(
                (p) => p.strategy === a.strategy,
              );
              return (
                <tr key={a.id}>
                  <td>
                    <Link href={`/agents/${a.slug}`} className="trader-cell">
                      {a.image && (
                        <img src={`/images/${a.image}.webp`} alt="" />
                      )}
                      <span>
                        {a.name}
                        <small>
                          {!p || p.receipts === 0
                            ? "No qualified paper fills"
                            : p.status === "UNPRICED"
                              ? "Current equity unpriced"
                              : "Isolated paper evaluation"}
                        </small>
                      </span>
                    </Link>
                  </td>
                  <td>{a.strategy?.replaceAll("_", " ")}</td>
                  <td>{money(engine === "LIVE" ? p?.pnlUsd : null)}</td>
                  <td>
                    {p?.winRatePct == null
                      ? "—"
                      : `${p.winRatePct.toFixed(1)}%`}
                  </td>
                  <td>{p?.tradeCount ?? "—"}</td>
                  <td>
                    {p?.drawdownPct == null
                      ? "—"
                      : `${p.drawdownPct.toFixed(2)}%`}
                  </td>
                </tr>
              );
            })}
        </tbody>
      </table>
    </div>
  );
}
export function EventFeed({
  full = false,
  initialAgent = "",
  initialType = "",
  initialStrategy = "",
}: {
  full?: boolean;
  initialAgent?: string;
  initialType?: string;
  initialStrategy?: string;
}) {
  const [agent, setAgent] = useState(initialAgent),
    [type, setType] = useState(initialType),
    [token, setToken] = useState(""),
    [strategy, setStrategy] = useState(initialStrategy),
    [account, setAccount] = useState(""),
    [outcome, setOutcome] = useState(""),
    [from, setFrom] = useState(""),
    [to, setTo] = useState(""),
    [page, setPage] = useState(1),
    [events, setEvents] = useState<PublicEvent[]>([]),
    [total, setTotal] = useState(0),
    [loading, setLoading] = useState(true),
    [failed, setFailed] = useState(false),
    [nonce, setNonce] = useState(0),
    [selected, setSelected] = useState<PublicEvent | null>(null);
  useEffect(() => {
    const id = setInterval(() => setNonce((x) => x + 1), 15000);
    return () => clearInterval(id);
  }, []);
  useEffect(() => {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL,
      key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
    if (!url || !key) return;
    const client = createClient(url, key, { auth: { persistSession: false } }),
      channel = client
        .channel("agentcraft:public")
        .on("broadcast", { event: "refresh" }, () => setNonce((n) => n + 1))
        .subscribe((status) => {
          if (status === "SUBSCRIBED") setNonce((n) => n + 1);
        });
    return () => {
      void client.removeChannel(channel);
    };
  }, []);
  useEffect(() => {
    const controller = new AbortController();
    const params = new URLSearchParams({ page: String(page) });
    Object.entries({
      agent,
      type,
      token,
      strategy,
      account,
      outcome,
      from: from ? `${from}T00:00:00.000Z` : "",
      to: to ? `${to}T23:59:59.999Z` : "",
    }).forEach(([k, v]) => {
      if (v) params.set(k, v);
    });
    const timer = setTimeout(async () => {
      try {
        const r = await fetch(`/api/events?${params}`, {
          signal: controller.signal,
          cache: "no-store",
        });
        if (!r.ok) throw Error();
        const body = await r.json();
        setEvents(body.events);
        setTotal(body.total);
        setFailed(false);
      } catch {
        if (!controller.signal.aborted) setFailed(true);
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    }, 200);
    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [agent, type, token, strategy, account, outcome, from, to, page, nonce]);
  const change =
    (setter: (s: string) => void) =>
    (e: React.ChangeEvent<HTMLSelectElement | HTMLInputElement>) => {
      setter(e.target.value);
      setPage(1);
      setLoading(true);
    };
  return (
    <div className="feed">
      <div className="feed-controls">
        <div className="filter-row">
          <label>
            <span>Agent attribution</span>
            <select
              aria-label="Agent attribution"
              value={agent}
              onChange={change(setAgent)}
            >
              <option value="">All agents / unrecorded</option>
              {agents.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.name}
                </option>
              ))}
            </select>
          </label>
          <label>
            <span>Event type</span>
            <select
              aria-label="Event type"
              value={type}
              onChange={change(setType)}
            >
              <option value="">All event types</option>
              <option value="paper_fill">Paper fills</option>
              <option value="research">Research signals</option>
              <option value="rejection">Risk rejections</option>
              <option value="dialogue">Fictional dialogue</option>
              <option value="activity">Activity</option>
            </select>
          </label>
          {full && (
            <label className="search">
              <span>Token symbol or mint</span>
              <div>
                <Search size={14} />
                <input
                  aria-label="Token symbol or mint"
                  placeholder="Search tokens…"
                  value={token}
                  onChange={change(setToken)}
                />
              </div>
            </label>
          )}
        </div>
        {full && (
          <div className="filter-row extra-filters">
            <label>
              <span>Portfolio</span>
              <select
                aria-label="Portfolio"
                value={account}
                onChange={change(setAccount)}
              >
                <option value="">All portfolios</option>
                <option value="shared">Original shared account</option>
                <option value="evaluation">Isolated evaluations</option>
              </select>
            </label>
            <label>
              <span>Strategy</span>
              <select
                aria-label="Strategy"
                value={strategy}
                onChange={change(setStrategy)}
              >
                <option value="">All strategies</option>
                {agents
                  .filter((a) => a.strategy)
                  .map((a) => (
                    <option key={a.id} value={a.strategy}>
                      {a.strategy?.replaceAll("_", " ")}
                    </option>
                  ))}
              </select>
            </label>
            <label>
              <span>Outcome</span>
              <select
                aria-label="Outcome"
                value={outcome}
                onChange={change(setOutcome)}
              >
                <option value="">All outcomes</option>
                <option value="win">Realized gain</option>
                <option value="loss">Realized loss</option>
                <option value="entry">Buy receipt</option>
              </select>
            </label>
            <label>
              <span>From (UTC)</span>
              <input
                aria-label="From date"
                type="date"
                value={from}
                onChange={change(setFrom)}
              />
            </label>
            <label>
              <span>To (UTC)</span>
              <input
                aria-label="To date"
                type="date"
                value={to}
                onChange={change(setTo)}
              />
            </label>
            <button
              className="reset"
              onClick={() => {
                setAgent("");
                setType(initialType);
                setToken("");
                setStrategy("");
                setAccount("");
                setOutcome("");
                setFrom("");
                setTo("");
                setPage(1);
              }}
            >
              Reset filters
            </button>
          </div>
        )}
      </div>
      {failed && (
        <div role="alert" className="notice">
          Connection interrupted. Retained rows may be out of date.{" "}
          <button onClick={() => setNonce((n) => n + 1)}>
            Retry connection
          </button>
        </div>
      )}
      <div className="feed-caption">
        <span>
          <Activity size={13} />{" "}
          {loading ? "Loading recorded activity…" : `${total} matching records`}
        </span>
        <span>UTC · PAPER ONLY</span>
      </div>
      {loading && !events.length ? (
        <div className="skeleton" />
      ) : events.length === 0 ? (
        <Empty
          title="No matching records"
          description="Try another filter. Unrecorded activity and unqualified signals are never shown as fills."
        />
      ) : full ? (
        <div className="table-wrap">
          <table className="trade-table">
            <thead>
              <tr>
                <th>Time / receipt</th>
                <th>Event</th>
                <th>Token</th>
                <th>Agent</th>
                <th>Portfolio / strategy</th>
                <th>Fill price</th>
                <th>Realized P&L</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {events.map((e) => (
                <tr key={e.id}>
                  <td>
                    <time dateTime={e.sourceTimestamp}>
                      {new Date(e.sourceTimestamp).toLocaleString("en-US", {
                        timeZone: "UTC",
                        month: "short",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </time>
                    <small>{e.receiptId || "Research record"}</small>
                  </td>
                  <td>
                    <span className={`event-type ${e.type}`}>
                      {e.type === "paper_fill"
                        ? `PAPER ${e.action.toUpperCase()}`
                        : e.type.toUpperCase()}
                    </span>
                  </td>
                  <td>
                    <strong>{e.symbol || "—"}</strong>
                    {e.mint && (
                      <small title={e.mint}>
                        {e.mint.slice(0, 5)}…{e.mint.slice(-4)}
                      </small>
                    )}
                  </td>
                  <td>
                    <AgentName id={e.agentId} />
                  </td>
                  <td>
                    {e.account === "shared"
                      ? "Shared account"
                      : "Isolated evaluation"}
                    <small>
                      {e.strategy?.replaceAll("_", " ") ||
                        "Original shared strategy"}
                    </small>
                  </td>
                  <td>
                    {e.priceUsd == null ? "—" : `$${e.priceUsd.toPrecision(5)}`}
                  </td>
                  <td
                    className={
                      e.realizedUsd !== null && e.realizedUsd < 0
                        ? "negative"
                        : ""
                    }
                  >
                    {money(e.realizedUsd)}
                  </td>
                  <td>
                    <button
                      className="icon-button"
                      aria-label={`View record ${e.receiptId || e.symbol}`}
                      onClick={() => setSelected(e)}
                    >
                      <ArrowUpRight size={17} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="event-list">
          {events.slice(0, 6).map((e) => (
            <button
              className="event-row"
              key={e.id}
              onClick={() => setSelected(e)}
            >
              <span className={`event-icon ${e.type}`}>
                {e.type === "paper_fill" ? "↗" : "◇"}
              </span>
              <span>
                <b>
                  {e.symbol || "HQ"}{" "}
                  <span className="muted">/ {e.type.replaceAll("_", " ")}</span>
                </b>
                <p>{e.reason || "No reasoning recorded"}</p>
                <small>
                  {e.agentId
                    ? getAgent(e.agentId)?.name
                    : "Attribution not recorded"}{" "}
                  ·{" "}
                  {e.account === "evaluation"
                    ? "Isolated evaluation"
                    : "Shared account"}
                </small>
              </span>
              <time>
                {new Date(e.sourceTimestamp).toLocaleTimeString("en-US", {
                  timeZone: "UTC",
                  hour: "2-digit",
                  minute: "2-digit",
                  hour12: false,
                })}
              </time>
            </button>
          ))}
        </div>
      )}
      {full && (
        <div className="pagination">
          <span>
            Page {page} of {Math.max(1, Math.ceil(total / 25))}
          </span>
          <div>
            <button
              disabled={page === 1}
              aria-label="Previous page"
              onClick={() => setPage((p) => p - 1)}
            >
              <ChevronLeft size={17} />
            </button>
            <button
              disabled={page * 25 >= total}
              aria-label="Next page"
              onClick={() => setPage((p) => p + 1)}
            >
              <ChevronRight size={17} />
            </button>
          </div>
        </div>
      )}
      {selected && (
        <RecordDialog event={selected} close={() => setSelected(null)} />
      )}
    </div>
  );
}
function RecordDialog({
  event: e,
  close,
}: {
  event: PublicEvent;
  close: () => void;
}) {
  useEffect(() => {
    const old = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = old;
    };
  }, []);
  return (
    <dialog
      className="record-dialog"
      ref={(node) => {
        if (node && !node.open) node.showModal();
      }}
      onCancel={close}
      onClick={(ev) => {
        if (ev.target === ev.currentTarget) close();
      }}
    >
      <button className="dialog-close" onClick={close} autoFocus>
        Close ×
      </button>
      <p className="eyebrow">RECORDED {e.type.replaceAll("_", " ")}</p>
      <h2>{e.symbol || "Agent activity"}</h2>
      <p>{e.reason || "Reasoning was not recorded."}</p>
      <dl>
        {[
          ["Receipt", e.receiptId],
          ["Source time", e.sourceTimestamp],
          [
            "Agent attribution",
            e.agentId ? getAgent(e.agentId)?.name : "Not recorded in receipt",
          ],
          ["Portfolio", e.account],
          ["Strategy", e.strategy || "Not assigned"],
          ["Mint", e.mint],
          ["Venue", e.venue || "Not recorded"],
          [
            "Fill price",
            e.priceUsd === null ? "Not applicable" : `$${e.priceUsd}`,
          ],
          ["Quantity", e.quantity],
          ["Position notional", money(e.notionalUsd)],
          ["Fees", money(e.feeUsd)],
          [
            "Slippage assumption",
            e.slippageRate === null
              ? "Not applicable"
              : `${e.slippageRate * 100}%`,
          ],
          ["Realized P&L", money(e.realizedUsd)],
          ["Risk result", e.risk],
          ["Provenance", e.provenance],
        ].map(([k, v]) => (
          <div key={String(k)}>
            <dt>{k}</dt>
            <dd>{v ?? "Not recorded"}</dd>
          </div>
        ))}
      </dl>
      {e.mint && (
        <a
          className="text-link"
          href={`https://dexscreener.com/solana/${e.mint}`}
          target="_blank"
          rel="noreferrer"
        >
          Research token on DEX Screener ↗
        </a>
      )}
      <p className="muted">
        Paper receipt only. A signal or fictional dialogue is never a completed
        trade.
      </p>
    </dialog>
  );
}
export function LivePanels() {
  const { data, engine, failed, refresh } = useStatus();
  return (
    <aside className="live-panels">
      <div className="panel">
        <div className="panel-title">
          <Radio size={16} /> SOURCE STATUS{" "}
          <button
            className="icon-button"
            aria-label="Refresh source status"
            onClick={() => void refresh()}
          >
            <RefreshCw size={13} />
          </button>
        </div>
        <dl>
          <div>
            <dt>Engine</dt>
            <dd>{engine}</dd>
          </div>
          <div>
            <dt>Public reporting</dt>
            <dd>
              {failed
                ? "Disconnected"
                : data?.storage === "historical"
                  ? "Historical only"
                  : data?.connection || "Connecting"}
            </dd>
          </div>
          <div>
            <dt>Execution</dt>
            <dd className="gold">PAPER ONLY</dd>
          </div>
          <div>
            <dt>Last public sync</dt>
            <dd>
              {data?.ingestedAt
                ? new Date(data.ingestedAt).toLocaleString()
                : "Not connected"}
            </dd>
          </div>
        </dl>
      </div>
      <div className="panel">
        <div className="panel-title">
          <Activity size={16} /> AGENT ACTIVITY
        </div>
        {data?.snapshot.agents.length ? (
          data.snapshot.agents.map((a) => (
            <div className="activity" key={a.id}>
              <AgentName id={a.id} />
              <p>{a.activity}</p>
              <small>
                {engine === "LIVE" ? a.state : "Historical · " + a.state}
              </small>
            </div>
          ))
        ) : (
          <p className="muted">
            Live activity will appear when the read-only publisher connects.
            Browse the retained paper records below.
          </p>
        )}
      </div>
      <div className="panel">
        <ShieldCheck className="gold" />
        <h3>Research ≠ execution</h3>
        <p className="muted">
          Risk rejections and independent evaluations stay separate from the
          original shared paper account.
        </p>
      </div>
    </aside>
  );
}
export function OpenPositions() {
  const { data } = useStatus();
  const positions = data?.snapshot.positions || [];
  return positions.length ? (
    <div className="table-wrap">
      <table>
        <thead>
          <tr>
            <th>Token</th>
            <th>Portfolio</th>
            <th>Entry</th>
            <th>Quantity</th>
            <th>Opened (UTC)</th>
          </tr>
        </thead>
        <tbody>
          {positions.map((p, i) => (
            <tr key={`${p.mint}-${i}`}>
              <td>
                {p.symbol}
                <small>{p.mint}</small>
              </td>
              <td>
                {p.account} / {p.strategy || "original"}
              </td>
              <td>${p.entryUsd.toPrecision(5)}</td>
              <td>{p.quantity.toPrecision(6)}</td>
              <td>{p.openedAt}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  ) : (
    <Empty
      title="No open positions in the latest record"
      description="This reflects the last available snapshot, not a live account claim."
    />
  );
}
