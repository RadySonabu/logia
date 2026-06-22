"use client";

import { useState } from "react";
import type { Delivery, Client } from "@/lib/types";

interface Props {
  delivery: Delivery;
  client:   Client | undefined;
  onClaim:  (deliveryId: string) => void;
}

export function OpenRunCard({ delivery, client, onClaim }: Props) {
  const [claiming, setClaiming] = useState(false);

  function handleClaim() {
    setClaiming(true);
    onClaim(delivery.id);
  }

  const scheduleDisplay = delivery.proposedPulloutSchedule
    ? delivery.proposedPulloutSchedule.replace("T", " ").slice(0, 16)
    : "—";

  return (
    <div style={{ borderTop: "1px solid #161616", padding: "18px 20px" }}>
      {/* SR Number + client */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "6px" }}>
        <span style={{ fontFamily: "var(--font-plex)", fontSize: "10px", color: "#2E2E2E", letterSpacing: "0.06em" }}>
          {delivery.id}
        </span>
        <span style={{ fontFamily: "var(--font-plex)", fontSize: "10px", color: "#3A3A3A" }}>
          {client?.name ?? ""}
        </span>
      </div>

      {/* Customer name */}
      <div style={{ fontFamily: "var(--font-dm)", fontSize: "19px", fontWeight: 600, color: "#F0F0F0", marginBottom: "4px", lineHeight: 1.25 }}>
        {delivery.customerName}
      </div>

      {/* Address */}
      <div style={{ fontFamily: "var(--font-dm)", fontSize: "13px", color: "#777", marginBottom: "2px" }}>
        {delivery.contactAddressLine1}
      </div>
      {delivery.contactAddressLine2 && (
        <div style={{ fontFamily: "var(--font-dm)", fontSize: "12px", color: "#484848", marginBottom: "2px" }}>
          {delivery.contactAddressLine2}
        </div>
      )}

      {/* Problem summary */}
      <div
        style={{
          fontFamily: "var(--font-dm)",
          fontSize: "12px",
          color: "#555",
          marginBottom: "10px",
          overflow: "hidden",
          display: "-webkit-box",
          WebkitLineClamp: 2,
          WebkitBoxOrient: "vertical",
        }}
      >
        {delivery.srProblemSummary}
      </div>

      {/* Schedule + Qty */}
      <div style={{ display: "flex", gap: "16px", marginBottom: "14px" }}>
        <span style={{ fontFamily: "var(--font-plex)", fontSize: "12px", color: "#F5A623" }}>
          {scheduleDisplay}
        </span>
        <span style={{ fontFamily: "var(--font-plex)", fontSize: "12px", color: "#3A3A3A" }}>
          Qty: {delivery.declaredQuantity}
        </span>
        {delivery.vehicleType && (
          <span style={{ fontFamily: "var(--font-plex)", fontSize: "12px", color: "#3A3A3A" }}>
            {delivery.vehicleType}
          </span>
        )}
      </div>

      {/* Claim button */}
      <button
        onClick={handleClaim}
        disabled={claiming}
        style={{
          width: "100%",
          height: "52px",
          background: claiming ? "#C08010" : "#F5A623",
          color: "#0A0A0A",
          border: "none",
          borderRadius: "6px",
          fontFamily: "var(--font-barlow)",
          fontWeight: 900,
          fontSize: "18px",
          letterSpacing: "0.06em",
          cursor: claiming ? "wait" : "pointer",
          transition: "background 0.15s",
        }}
      >
        {claiming ? "CLAIMING…" : "CLAIM DELIVERY"}
      </button>
    </div>
  );
}
