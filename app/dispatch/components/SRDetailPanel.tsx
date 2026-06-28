"use client";

import { useState } from "react";
import type { Delivery, Client, Driver } from "@/lib/types";
import { StatusChip } from "./StatusChip";

interface Props {
  delivery: Delivery;
  client:   Client  | undefined;
  driver:   Driver  | undefined;
  drivers:  Driver[];
  onClose:  () => void;
  onAssign: (deliveryId: string) => void;
}

export function SRDetailPanel({ delivery, client, driver, drivers, onClose, onAssign }: Props) {
  const [showAssignInline, setShowAssignInline] = useState(false);
  const [selectedDriverId, setSelectedDriverId] = useState("");

  const variance =
    delivery.actualQuantity != null
      ? delivery.actualQuantity - delivery.declaredQuantity
      : null;

  const scheduleDisplay = delivery.proposedPulloutSchedule
    ? delivery.proposedPulloutSchedule.replace("T", " ").slice(0, 16)
    : "—";

  function handleAssignConfirm() {
    if (!selectedDriverId) return;
    onAssign(delivery.id);
    setShowAssignInline(false);
  }

  return (
    <>
      {/* Backdrop */}
      <div onClick={onClose} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", zIndex: 40 }} />

      {/* Slide-in panel */}
      <div
        style={{
          position: "fixed", top: 0, right: 0, bottom: 0,
          width: "420px",
          background: "#111",
          borderLeft: "1px solid #1A1A1A",
          zIndex: 41,
          display: "flex",
          flexDirection: "column",
          overflowY: "auto",
        }}
      >
        {/* Header */}
        <div style={{ padding: "18px 20px", borderBottom: "1px solid #1A1A1A", display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: "12px", flexShrink: 0 }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "4px" }}>
              <span style={{ fontFamily: "var(--font-plex)", fontWeight: 500, fontSize: "14px", color: "#F5A623" }}>
                {delivery.srNumber}
              </span>
              <StatusChip status={delivery.status} />
              {delivery.issueReported && (
                <span style={{ fontFamily: "var(--font-barlow)", fontWeight: 700, fontSize: "9px", color: "#F87171", border: "1px solid rgba(248,113,113,0.4)", borderRadius: "2px", padding: "1px 6px", letterSpacing: "0.06em" }}>
                  ISSUE
                </span>
              )}
            </div>
            <div style={{ fontFamily: "var(--font-plex)", fontSize: "10px", color: "#2E2E2E", letterSpacing: "0.06em" }}>
              {delivery.date} · {client?.name ?? "—"}
            </div>
          </div>
          <button onClick={onClose} style={{ background: "none", border: "none", color: "#555", cursor: "pointer", fontSize: "20px", lineHeight: 1, padding: "0 2px", flexShrink: 0 }}>×</button>
        </div>

        <div style={{ padding: "20px", display: "flex", flexDirection: "column", gap: "20px" }}>

          {/* Issue reported section */}
          {delivery.issueReported && (
            <div style={{ padding: "12px 14px", background: "rgba(248,113,113,0.06)", border: "1px solid rgba(248,113,113,0.2)", borderRadius: "3px" }}>
              <div style={{ fontFamily: "var(--font-plex)", fontSize: "9px", color: "#F87171", letterSpacing: "0.1em", marginBottom: "6px" }}>
                ⚠ ISSUE REPORTED BY DRIVER
              </div>
              <div style={{ fontFamily: "var(--font-dm)", fontSize: "13px", color: "#B0B0B0", lineHeight: 1.5 }}>
                {delivery.issueNote || "No description provided."}
              </div>
            </div>
          )}

          {/* SR Details */}
          <Section title="SR DETAILS">
            <Row label="Customer Name"      value={delivery.customerName} />
            <Row label="Address Line 1"     value={delivery.contactAddressLine1} />
            <Row label="Address Line 2"     value={delivery.contactAddressLine2 ?? "—"} dimIfDash />
            <Row label="SR Problem Summary" value={delivery.srProblemSummary} wrap />
            <Row label="Proposed Schedule"  value={scheduleDisplay} accent />
            <Row label="Vehicle Type"       value={delivery.vehicleType ?? "—"} dimIfDash />
            <Row label="Driver"             value={driver?.name ?? "—"} dimIfDash />
            {delivery.dispatchNotes && <Row label="Dispatch Notes" value={delivery.dispatchNotes} wrap />}
          </Section>

          {/* Pullout Results */}
          <Section
            title="PULLOUT RESULTS"
            badge={delivery.actualQuantity != null ? { label: "RECORDED", color: "#34D399" } : { label: "PENDING", color: "#484848" }}
          >
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px", marginBottom: "4px" }}>
              <QtyCard label="Declared Qty" value={delivery.declaredQuantity} color="#484848" />
              <QtyCard label="Actual Qty"   value={delivery.actualQuantity} color={delivery.actualQuantity != null ? "#34D399" : undefined} empty={delivery.actualQuantity == null} />
            </div>
            {variance != null && <div style={{ marginBottom: "4px" }}><VarianceChip variance={variance} /></div>}
            <Row label="Actual Date of Pullout" value={delivery.actualDateOfPullout ?? "—"} dimIfDash accent={!!delivery.actualDateOfPullout} />
          </Section>

          {/* Assign — only for pending (open) SRs */}
          {delivery.status === "open" && (
            <div>
              {!showAssignInline ? (
                <button
                  onClick={() => setShowAssignInline(true)}
                  style={{
                    width: "100%", height: "38px",
                    background: "transparent",
                    border: "1px solid #282828",
                    borderRadius: "2px",
                    color: "#555",
                    fontFamily: "var(--font-barlow)", fontWeight: 700,
                    fontSize: "11px", letterSpacing: "0.08em",
                    cursor: "pointer",
                    transition: "border-color 0.15s, color 0.15s",
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.borderColor = "#F5A623"; e.currentTarget.style.color = "#F5A623"; }}
                  onMouseLeave={(e) => { e.currentTarget.style.borderColor = "#282828"; e.currentTarget.style.color = "#555"; }}
                >
                  ASSIGN DRIVER
                </button>
              ) : (
                <div className="animate-slide-up" style={{ background: "#0D0D0D", border: "1px solid #1E1E1E", borderRadius: "3px", padding: "14px" }}>
                  <select
                    value={selectedDriverId}
                    onChange={(e) => setSelectedDriverId(e.target.value)}
                    style={{ width: "100%", background: "#111", border: "1px solid #252525", borderRadius: "2px", color: selectedDriverId ? "#F0F0F0" : "#555", fontFamily: "var(--font-dm)", fontSize: "13px", height: "38px", padding: "0 10px", outline: "none", appearance: "none", marginBottom: "10px" }}
                  >
                    <option value="">Select driver…</option>
                    {drivers.map((d) => (
                      <option key={d.id} value={d.id}>{d.name} — {d.vehicle}</option>
                    ))}
                  </select>
                  <div style={{ display: "flex", gap: "8px" }}>
                    <button onClick={() => setShowAssignInline(false)} style={{ flex: 1, height: "34px", background: "transparent", border: "1px solid #282828", color: "#555", fontFamily: "var(--font-barlow)", fontWeight: 700, fontSize: "10px", letterSpacing: "0.06em", borderRadius: "2px", cursor: "pointer" }}>
                      CANCEL
                    </button>
                    <button
                      disabled={!selectedDriverId}
                      onClick={handleAssignConfirm}
                      style={{ flex: 2, height: "34px", background: selectedDriverId ? "#F5A623" : "#1E1E1E", border: "none", color: selectedDriverId ? "#0A0A0A" : "#3A3A3A", fontFamily: "var(--font-barlow)", fontWeight: 900, fontSize: "10px", letterSpacing: "0.08em", borderRadius: "2px", cursor: selectedDriverId ? "pointer" : "not-allowed" }}
                    >
                      CONFIRM
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </>
  );
}

// ── Sub-components ────────────────────────────────────────────────────────────

function Section({ title, badge, children }: { title: string; badge?: { label: string; color: string }; children: React.ReactNode }) {
  return (
    <div>
      <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "10px" }}>
        <span style={{ fontFamily: "var(--font-plex)", fontSize: "9px", color: "#2E2E2E", letterSpacing: "0.1em", textTransform: "uppercase" }}>{title}</span>
        {badge && <span style={{ fontFamily: "var(--font-barlow)", fontWeight: 700, fontSize: "9px", letterSpacing: "0.08em", color: badge.color, border: `1px solid ${badge.color}`, padding: "1px 6px", borderRadius: "2px" }}>{badge.label}</span>}
      </div>
      <div style={{ background: "#0D0D0D", border: "1px solid #1A1A1A", borderRadius: "3px", overflow: "hidden" }}>{children}</div>
    </div>
  );
}

function Row({ label, value, wrap, accent, dimIfDash }: { label: string; value: string; wrap?: boolean; accent?: boolean; dimIfDash?: boolean }) {
  const isDash  = value === "—";
  const textCol = accent && !isDash ? "#F5A623" : dimIfDash && isDash ? "#2E2E2E" : "#B0B0B0";
  return (
    <div style={{ display: "flex", alignItems: wrap ? "flex-start" : "center", justifyContent: "space-between", gap: "12px", padding: "9px 14px", borderBottom: "1px solid #141414" }}>
      <span style={{ fontFamily: "var(--font-plex)", fontSize: "10px", color: "#484848", letterSpacing: "0.04em", whiteSpace: "nowrap", flexShrink: 0 }}>{label}</span>
      <span style={{ fontFamily: "var(--font-dm)", fontSize: "13px", color: textCol, textAlign: "right", lineHeight: wrap ? 1.4 : undefined }}>{value}</span>
    </div>
  );
}

function QtyCard({ label, value, color, empty }: { label: string; value: number | null; color?: string; empty?: boolean }) {
  return (
    <div style={{ padding: "12px 14px", background: "#111", border: `1px solid ${color ? color + "33" : "#1A1A1A"}`, borderRadius: "3px" }}>
      <div style={{ fontFamily: "var(--font-plex)", fontSize: "9px", color: "#2E2E2E", letterSpacing: "0.08em", marginBottom: "6px" }}>{label.toUpperCase()}</div>
      <div style={{ fontFamily: "var(--font-plex)", fontSize: "22px", fontWeight: 600, color: empty ? "#2E2E2E" : (color ?? "#F0F0F0") }}>{empty ? "—" : value}</div>
    </div>
  );
}

function VarianceChip({ variance }: { variance: number }) {
  const color  = variance === 0 ? "#34D399" : variance > 0 ? "#60A5FA" : "#F59E0B";
  const label  = variance === 0 ? "No variance" : variance > 0 ? `+${variance} over declared` : `${variance} under declared`;
  const prefix = variance > 0 ? "▲" : variance < 0 ? "▼" : "●";
  return (
    <div style={{ display: "inline-flex", alignItems: "center", gap: "6px", padding: "4px 10px", background: color + "15", border: `1px solid ${color}44`, borderRadius: "2px" }}>
      <span style={{ fontFamily: "var(--font-plex)", fontSize: "11px", color }}>{prefix}</span>
      <span style={{ fontFamily: "var(--font-plex)", fontSize: "11px", color }}>{label}</span>
    </div>
  );
}
