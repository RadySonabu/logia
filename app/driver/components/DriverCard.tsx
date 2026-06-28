"use client";

import { useState } from "react";
import type { Delivery, Client } from "@/lib/types";
import { StatusChip } from "@/app/dispatch/components/StatusChip";

interface Props {
  delivery:    Delivery;
  client:      Client | undefined;
  showStatus?: boolean;
  onTap:       (deliveryId: string) => void;
  onClaim?:    (deliveryId: string) => void; // only for Open tab
}

export function DriverCard({ delivery, client, showStatus, onTap, onClaim }: Props) {
  const [claiming, setClaiming] = useState(false);
  const [hovered,  setHovered]  = useState(false);

  const scheduleDisplay = delivery.proposedPulloutSchedule
    ? delivery.proposedPulloutSchedule.replace("T", " ").slice(0, 16)
    : "—";

  function handleClaim(e: React.MouseEvent) {
    e.stopPropagation();
    if (!onClaim) return;
    setClaiming(true);
    onClaim(delivery.id);
  }

  return (
    <div
      onClick={() => onTap(delivery.id)}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        borderTop: "1px solid #161616",
        padding: "14px 20px",
        background: hovered ? "#0D0D0D" : "transparent",
        cursor: "pointer",
        transition: "background 0.1s",
      }}
    >
      {/* Top row: SR number + status / client */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "6px" }}>
        <span style={{ fontFamily: "var(--font-plex)", fontSize: "10px", color: "#2E2E2E", letterSpacing: "0.06em" }}>
          {delivery.srNumber}
        </span>
        {showStatus ? (
          <StatusChip status={delivery.status} size="sm" />
        ) : (
          <span style={{ fontFamily: "var(--font-plex)", fontSize: "10px", color: "#3A3A3A" }}>
            {client?.name ?? ""}
          </span>
        )}
      </div>

      {/* Customer name */}
      <div style={{ fontFamily: "var(--font-dm)", fontSize: "17px", fontWeight: 600, color: "#F0F0F0", marginBottom: "3px", lineHeight: 1.25 }}>
        {delivery.customerName}
      </div>

      {/* Address */}
      <div style={{ fontFamily: "var(--font-dm)", fontSize: "12px", color: "#777", marginBottom: "1px" }}>
        {delivery.contactAddressLine1}
      </div>

      {/* Schedule */}
      <div style={{ marginTop: "8px", display: "flex", alignItems: "center", gap: "12px" }}>
        <span style={{ fontFamily: "var(--font-plex)", fontSize: "11px", color: "#F5A623" }}>
          {scheduleDisplay}
        </span>
        {delivery.issueReported && (
          <span style={{ fontFamily: "var(--font-barlow)", fontWeight: 700, fontSize: "9px", color: "#F87171", border: "1px solid rgba(248,113,113,0.35)", borderRadius: "2px", padding: "1px 5px", letterSpacing: "0.06em" }}>
            ISSUE
          </span>
        )}
      </div>

      {/* Claim button — Open tab only */}
      {onClaim && (
        <button
          onClick={handleClaim}
          disabled={claiming}
          style={{
            marginTop: "12px",
            width: "100%",
            height: "48px",
            background: claiming ? "#C08010" : "#F5A623",
            color: "#0A0A0A",
            border: "none",
            borderRadius: "6px",
            fontFamily: "var(--font-barlow)",
            fontWeight: 900,
            fontSize: "17px",
            letterSpacing: "0.06em",
            cursor: claiming ? "wait" : "pointer",
            transition: "background 0.15s",
          }}
        >
          {claiming ? "CLAIMING…" : "CLAIM DELIVERY"}
        </button>
      )}
    </div>
  );
}
