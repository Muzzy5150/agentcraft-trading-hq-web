"use client";
import { useState } from "react";
import { agents } from "@/lib/agents";
import { AgentCard } from "./ui";
export function Gallery() {
  const [role, setRole] = useState("all");
  return (
    <>
      <div className="tabs" aria-label="Filter agents">
        {[
          ["all", "All agents", "12"],
          ["trader", "Traders", "06"],
          ["scanner", "X scanners", "02"],
          ["coder", "Coders", "04"],
        ].map(([id, label, n]) => (
          <button
            key={id}
            aria-pressed={role === id}
            className={role === id ? "selected" : ""}
            onClick={() => setRole(id)}
          >
            {label}
            <span>{n}</span>
          </button>
        ))}
      </div>
      {[
        ["trader", "The trading floor", "traders"],
        ["scanner", "Social intelligence", "scanners"],
        ["coder", "The builder desks", "coders"],
      ]
        .filter(([id]) => role === "all" || role === id)
        .map(([id, title, anchor]) => (
          <section key={id} id={anchor} className="agent-group">
            <div className="group-title">
              <h2>{title}</h2>
              <span>
                {id === "trader"
                  ? "RESEARCH / PAPER STRATEGIES"
                  : id === "scanner"
                    ? "PUBLIC X / OBSERVED EVIDENCE"
                    : "DIAGNOSTICS / INTEGRATION"}
              </span>
            </div>
            <div className="agent-grid">
              {agents
                .filter((a) => a.role === id)
                .map((a) => (
                  <AgentCard key={a.id} agent={a} index={agents.indexOf(a)} />
                ))}
            </div>
          </section>
        ))}
    </>
  );
}
