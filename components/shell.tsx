"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ArrowUpRight, Box, Menu, X } from "lucide-react";
import { useState } from "react";
export function Header() {
  const pathname = usePathname(),
    [open, setOpen] = useState(false);
  return (
    <header className="header">
      <div className="nav-wrap">
        <Link href="/" className="brand" aria-label="AgentCraft home">
          <span className="brand-icon">
            <Box size={25} />
          </span>
          <span>
            AGENTCRAFT<small>SOLANA TRADING HQ</small>
          </span>
        </Link>
        <button
          className="menu-toggle"
          aria-label="Toggle navigation"
          aria-expanded={open}
          onClick={() => setOpen(!open)}
        >
          {open ? <X /> : <Menu />}
        </button>
        <nav className={open ? "nav open" : "nav"} aria-label="Main navigation">
          {[
            ["/", "Overview"],
            ["/live", "Watch Live"],
            ["/agents", "The Agents"],
            ["/trades", "Trades"],
          ].map(([url, label]) => (
            <Link
              onClick={() => setOpen(false)}
              className={pathname === url ? "active" : ""}
              href={url}
              key={url}
            >
              {url === "/live" && <i className="tiny-dot" />}
              {label}
            </Link>
          ))}
        </nav>
        <Link href="/deploy" className="nav-deploy">
          BUILD YOUR OWN <ArrowUpRight size={15} />
        </Link>
      </div>
    </header>
  );
}
export function Footer() {
  return (
    <footer>
      <div className="footer-main">
        <Link className="brand" href="/">
          <Box className="gold" /> AGENTCRAFT
        </Link>
        <p>A little world. A lot of intelligence.</p>
        <div>
          <Link href="/deploy">Documentation</Link>
          <a href="https://github.com/Muzzy5150/agentcraft-trading-hq-web">
            GitHub ↗
          </a>
          <Link href="/trades">Paper trade log</Link>
        </div>
      </div>
      <div className="footer-bottom">
        <span>
          Independent, fictional characters. No endorsements. PAPER TRADING
          ONLY.
        </span>
        <span>
          Not an official Minecraft product. Not approved by or associated with
          Mojang or Microsoft.
        </span>
      </div>
    </footer>
  );
}
