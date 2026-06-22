"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import type { AuthUser } from "@/lib/types";

const TABS = [
  { label: "DISPATCH", href: "/dispatch" },
  { label: "ADMIN",    href: "/dispatch/admin" },
] as const;

interface Props {
  user:     AuthUser | null;
  onLogout: () => void;
}

export function NavBar({ user, onLogout }: Props) {
  const pathname = usePathname();
  const [time, setTime] = useState("");

  useEffect(() => {
    const tick = () => {
      const now = new Date();
      setTime(now.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", second: "2-digit", hour12: false }));
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);

  return (
    <nav
      style={{
        height: "52px",
        background: "#111",
        borderBottom: "2px solid #1A1A1A",
        display: "flex",
        alignItems: "center",
        padding: "0 20px",
        flexShrink: 0,
        zIndex: 10,
      }}
    >
      {/* Logo */}
      <div style={{ display: "flex", alignItems: "center", gap: "10px", marginRight: "8px" }}>
        <svg width="15" height="15" viewBox="0 0 16 16">
          <polygon points="8,0 16,8 8,16 0,8" fill="#F5A623" />
        </svg>
        <span style={{ fontFamily: "var(--font-barlow)", fontWeight: 900, fontSize: "20px", color: "#F0F0F0", letterSpacing: "0.14em" }}>
          RELAY
        </span>
      </div>

      {/* Tabs */}
      {TABS.map(({ label, href }) => {
        const active = pathname === href || (href !== "/dispatch" && pathname.startsWith(href));
        return (
          <Link
            key={href}
            href={href}
            style={{
              height: "52px",
              padding: "0 18px",
              display: "flex",
              alignItems: "center",
              textDecoration: "none",
              background: active ? "#F5A623" : "transparent",
              color: active ? "#0A0A0A" : "#555",
              fontFamily: "var(--font-barlow)",
              fontWeight: 700,
              fontSize: "12px",
              letterSpacing: "0.08em",
              transition: "background 0.15s, color 0.15s",
            }}
          >
            {label}
          </Link>
        );
      })}

      {/* Right side */}
      <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: "16px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "7px" }}>
          <div className="animate-pulse-dot" style={{ width: "6px", height: "6px", borderRadius: "50%", background: "#34D399" }} />
          <span style={{ fontFamily: "var(--font-plex)", fontSize: "11px", color: "#333" }}>{time}</span>
        </div>
        <span style={{ fontFamily: "var(--font-dm)", fontSize: "12px", color: "#484848" }}>
          {user?.name}
        </span>
        <button
          onClick={onLogout}
          style={{
            background: "transparent",
            border: "1px solid #282828",
            color: "#555",
            fontFamily: "var(--font-barlow)",
            fontWeight: 700,
            fontSize: "10px",
            letterSpacing: "0.08em",
            padding: "4px 10px",
            borderRadius: "2px",
            cursor: "pointer",
          }}
        >
          LOG OUT
        </button>
      </div>
    </nav>
  );
}
