"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useStore } from "@/lib/store";
import { useAuth } from "@/lib/auth";
import { DriverCard } from "./components/DriverCard";
import type { Delivery } from "@/lib/types";

type DriverTab = "open" | "ongoing" | "completed" | "income";

export default function DriverHomePage() {
  const router           = useRouter();
  const { user, logout } = useAuth();
  const { deliveries, clients, assignDriver } = useStore();

  const [activeTab, setActiveTab] = useState<DriverTab>("open");

  const clientMap = Object.fromEntries(clients.map((c) => [c.id, c]));
  const myId      = user?.driverId ?? null;

  const open      = deliveries.filter((d) => d.status === "open");
  const ongoing   = deliveries.filter((d) => (d.status === "claimed" || d.status === "picked_up") && d.driverId === myId);
  const completed = deliveries.filter((d) => (d.status === "delivered" || d.status === "completed") && d.driverId === myId);

  function handleClaim(deliveryId: string) {
    if (!myId) return;
    assignDriver(deliveryId, myId);
    router.push(`/driver/${deliveryId}`);
  }

  function handleTap(deliveryId: string) {
    router.push(`/driver/${deliveryId}`);
  }

  function handleLogout() {
    logout();
    router.push("/login");
  }

  const TABS: { key: DriverTab; label: string; count?: number }[] = [
    { key: "open",      label: "OPEN",      count: open.length      },
    { key: "ongoing",   label: "ON-GOING",  count: ongoing.length   },
    { key: "completed", label: "COMPLETED", count: completed.length  },
    { key: "income",    label: "INCOME"                              },
  ];

  let content: React.ReactNode;

  if (activeTab === "open") {
    content = open.length === 0
      ? <Empty label="No open runs — check back soon" />
      : open.map((d) => (
          <DriverCard key={d.id} delivery={d} client={clientMap[d.clientId]} onTap={handleTap} onClaim={handleClaim} />
        ));
  } else if (activeTab === "ongoing") {
    content = ongoing.length === 0
      ? <Empty label="No active runs" />
      : ongoing.map((d) => (
          <DriverCard key={d.id} delivery={d} client={clientMap[d.clientId]} showStatus onTap={handleTap} />
        ));
  } else if (activeTab === "completed") {
    content = completed.length === 0
      ? <Empty label="No completed runs yet" />
      : completed.map((d) => (
          <DriverCard key={d.id} delivery={d} client={clientMap[d.clientId]} showStatus onTap={handleTap} />
        ));
  } else {
    content = <IncomeView deliveries={completed} />;
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%" }}>
      {/* Header */}
      <div style={{ padding: "24px 20px 16px", display: "flex", alignItems: "center", justifyContent: "space-between", flexShrink: 0 }}>
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <svg width="14" height="14" viewBox="0 0 16 16">
            <polygon points="8,0 16,8 8,16 0,8" fill="#F5A623" />
          </svg>
          <div>
            <div style={{ fontFamily: "var(--font-plex)", fontSize: "9px", color: "#3A3A3A", letterSpacing: "0.1em" }}>RELAY DRIVER</div>
            {user && <div style={{ fontFamily: "var(--font-dm)", fontSize: "13px", color: "#777", marginTop: "1px" }}>{user.name}</div>}
          </div>
        </div>
        <button
          onClick={handleLogout}
          style={{ background: "transparent", border: "1px solid #1E1E1E", color: "#484848", fontFamily: "var(--font-barlow)", fontWeight: 700, fontSize: "10px", letterSpacing: "0.06em", padding: "4px 10px", borderRadius: "4px", cursor: "pointer" }}
        >
          LOG OUT
        </button>
      </div>

      {/* Tabs */}
      <div style={{ display: "flex", borderBottom: "1px solid #1A1A1A", flexShrink: 0 }}>
        {TABS.map(({ key, label, count }) => {
          const isActive = activeTab === key;
          const isOpen   = key === "open";
          return (
            <button
              key={key}
              onClick={() => setActiveTab(key)}
              style={{
                flex: 1,
                height: "44px",
                background: "transparent",
                border: "none",
                borderBottom: isActive ? "2px solid #F5A623" : "2px solid transparent",
                color: isActive ? "#F0F0F0" : "#484848",
                fontFamily: "var(--font-barlow)",
                fontWeight: 700,
                fontSize: "10px",
                letterSpacing: "0.08em",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "5px",
                transition: "color 0.15s, border-color 0.15s",
              }}
            >
              {label}
              {count !== undefined && count > 0 && (
                <span style={{
                  fontFamily: "var(--font-plex)",
                  fontWeight: 400,
                  fontSize: "10px",
                  background: isActive ? "rgba(245,166,35,0.15)" : "#1A1A1A",
                  color: isActive ? "#F5A623" : "#555",
                  border: `1px solid ${isActive ? "rgba(245,166,35,0.3)" : "#2E2E2E"}`,
                  borderRadius: "2px",
                  padding: "0px 5px",
                  lineHeight: "1.6",
                }}>
                  {count}
                </span>
              )}
              {isOpen && count === 0 && (
                <span style={{ width: "6px", height: "6px", borderRadius: "50%", background: "#2E2E2E" }} />
              )}
              {isOpen && count !== undefined && count > 0 && (
                <span className="animate-pulse-dot" style={{ width: "5px", height: "5px", borderRadius: "50%", background: "#34D399", marginLeft: "-2px" }} />
              )}
            </button>
          );
        })}
      </div>

      {/* Content */}
      <div style={{ flex: 1, overflowY: "auto", paddingBottom: "40px" }}>
        {content}
      </div>
    </div>
  );
}

// ── Income view ───────────────────────────────────────────────────────────────

function IncomeView({ deliveries }: { deliveries: Delivery[] }) {
  const totalJobs     = deliveries.length;
  const totalActual   = deliveries.reduce((s, d) => s + (d.actualQuantity ?? 0), 0);
  const totalDeclared = deliveries.reduce((s, d) => s + d.declaredQuantity, 0);
  const withActual    = deliveries.filter((d) => d.actualQuantity != null).length;

  return (
    <div style={{ padding: "20px" }}>
      <div style={{ fontFamily: "var(--font-plex)", fontSize: "9px", color: "#2E2E2E", letterSpacing: "0.1em", marginBottom: "14px" }}>
        MY STATS
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
        <StatCard label="JOBS COMPLETED"    value={totalJobs}     color="#4ADE80" />
        <StatCard label="ITEMS RETRIEVED"   value={totalActual}   color="#34D399" unit="units" />
        <StatCard label="ITEMS DECLARED"    value={totalDeclared} color="#484848" unit="units" />
        <StatCard label="RUNS RECORDED"     value={withActual}    color="#60A5FA" />
      </div>

      {totalJobs === 0 && (
        <div style={{ marginTop: "32px", textAlign: "center", fontFamily: "var(--font-plex)", fontSize: "11px", color: "#2E2E2E", letterSpacing: "0.06em" }}>
          COMPLETE JOBS TO SEE YOUR STATS
        </div>
      )}
    </div>
  );
}

function StatCard({ label, value, color, unit }: { label: string; value: number; color: string; unit?: string }) {
  return (
    <div style={{ background: "#0F0F0F", border: "1px solid #1A1A1A", borderRadius: "6px", padding: "16px" }}>
      <div style={{ fontFamily: "var(--font-plex)", fontSize: "8px", color: "#2E2E2E", letterSpacing: "0.1em", marginBottom: "8px" }}>
        {label}
      </div>
      <div style={{ display: "flex", alignItems: "baseline", gap: "4px" }}>
        <span style={{ fontFamily: "var(--font-plex)", fontSize: "30px", fontWeight: 600, color, lineHeight: 1 }}>{value}</span>
        {unit && <span style={{ fontFamily: "var(--font-plex)", fontSize: "10px", color: "#2E2E2E" }}>{unit}</span>}
      </div>
    </div>
  );
}

function Empty({ label }: { label: string }) {
  return (
    <div style={{ padding: "48px 20px", textAlign: "center", fontFamily: "var(--font-plex)", fontSize: "11px", color: "#2E2E2E", letterSpacing: "0.06em" }}>
      {label.toUpperCase()}
    </div>
  );
}
