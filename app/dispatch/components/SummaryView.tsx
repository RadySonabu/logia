"use client";

import type { Delivery } from "@/lib/types";

interface Props {
  deliveries: Delivery[];
}

export function SummaryView({ deliveries }: Props) {
  const total     = deliveries.length;
  const pending   = deliveries.filter((d) => d.status === "open").length;
  const ongoing   = deliveries.filter((d) => d.status === "claimed" || d.status === "picked_up").length;
  const completed = deliveries.filter((d) => d.status === "delivered" || d.status === "completed").length;
  const issues    = deliveries.filter((d) => d.issueReported).length;

  const declaredTotal = deliveries.reduce((s, d) => s + d.declaredQuantity, 0);
  const actualTotal   = deliveries.filter((d) => d.actualQuantity != null).reduce((s, d) => s + (d.actualQuantity ?? 0), 0);
  const recordedCount = deliveries.filter((d) => d.actualQuantity != null).length;
  const variance      = actualTotal - deliveries.filter((d) => d.actualQuantity != null).reduce((s, d) => s + d.declaredQuantity, 0);

  return (
    <div
      style={{
        flex: 1,
        overflowY: "auto",
        padding: "28px",
        background: "#0A0A0A",
      }}
    >
      <div
        style={{
          fontFamily: "var(--font-barlow)",
          fontWeight: 900,
          fontSize: "14px",
          letterSpacing: "0.1em",
          color: "#2E2E2E",
          marginBottom: "20px",
        }}
      >
        SUMMARY
      </div>

      {/* Status cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: "12px", marginBottom: "24px" }}>
        <StatCard label="TOTAL SRs"  value={total}     color="#F0F0F0" />
        <StatCard label="PENDING"    value={pending}   color="#94A3B8" />
        <StatCard label="ON-GOING"   value={ongoing}   color="#60A5FA" />
        <StatCard label="COMPLETED"  value={completed} color="#34D399" />
        <StatCard label="ISSUES"     value={issues}    color={issues > 0 ? "#F87171" : "#484848"} />
      </div>

      {/* Quantity section */}
      <div
        style={{
          fontFamily: "var(--font-plex)",
          fontSize: "9px",
          color: "#2E2E2E",
          letterSpacing: "0.1em",
          textTransform: "uppercase",
          marginBottom: "10px",
        }}
      >
        Quantity Summary ({recordedCount} of {total} SRs with actual recorded)
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: "12px" }}>
        <StatCard label="DECLARED TOTAL" value={declaredTotal} color="#484848" unit="units" />
        <StatCard label="ACTUAL TOTAL"   value={actualTotal}   color={recordedCount > 0 ? "#34D399" : "#2E2E2E"} unit="units" />
        <VarianceCard variance={variance} recorded={recordedCount} />
      </div>
    </div>
  );
}

function StatCard({ label, value, color, unit }: { label: string; value: number; color: string; unit?: string }) {
  return (
    <div
      style={{
        background: "#0F0F0F",
        border: "1px solid #1A1A1A",
        borderRadius: "3px",
        padding: "18px 20px",
      }}
    >
      <div style={{ fontFamily: "var(--font-plex)", fontSize: "9px", color: "#2E2E2E", letterSpacing: "0.1em", marginBottom: "10px" }}>
        {label}
      </div>
      <div style={{ display: "flex", alignItems: "baseline", gap: "6px" }}>
        <span style={{ fontFamily: "var(--font-plex)", fontSize: "36px", fontWeight: 600, color, lineHeight: 1 }}>
          {value}
        </span>
        {unit && (
          <span style={{ fontFamily: "var(--font-plex)", fontSize: "11px", color: "#2E2E2E" }}>{unit}</span>
        )}
      </div>
    </div>
  );
}

function VarianceCard({ variance, recorded }: { variance: number; recorded: number }) {
  const color  = recorded === 0 ? "#2E2E2E" : variance === 0 ? "#34D399" : variance > 0 ? "#60A5FA" : "#F59E0B";
  const prefix = variance > 0 ? "+" : "";
  const label  = recorded === 0 ? "—" : `${prefix}${variance}`;

  return (
    <div
      style={{
        background: "#0F0F0F",
        border: `1px solid ${recorded > 0 && variance !== 0 ? color + "33" : "#1A1A1A"}`,
        borderRadius: "3px",
        padding: "18px 20px",
      }}
    >
      <div style={{ fontFamily: "var(--font-plex)", fontSize: "9px", color: "#2E2E2E", letterSpacing: "0.1em", marginBottom: "10px" }}>
        NET VARIANCE
      </div>
      <div style={{ display: "flex", alignItems: "baseline", gap: "6px" }}>
        <span style={{ fontFamily: "var(--font-plex)", fontSize: "36px", fontWeight: 600, color, lineHeight: 1 }}>
          {label}
        </span>
        {recorded > 0 && (
          <span style={{ fontFamily: "var(--font-plex)", fontSize: "11px", color: "#2E2E2E" }}>units</span>
        )}
      </div>
    </div>
  );
}
