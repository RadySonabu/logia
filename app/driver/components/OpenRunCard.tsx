"use client";

import { useState } from "react";
import type { Delivery, Client } from "@/lib/types";

interface Props {
  delivery: Delivery;
  client: Client | undefined;
  onClaim: (deliveryId: string) => void;
}

export function OpenRunCard({ delivery, client, onClaim }: Props) {
  const [claiming, setClaiming] = useState(false);

  function handleClaim() {
    setClaiming(true);
    onClaim(delivery.id);
  }

  return (
    <div
      style={{
        borderTop: "1px solid #161616",
        padding: "18px 20px",
      }}
    >
      {/* Order ID */}
      <div
        style={{
          fontFamily: "var(--font-plex)",
          fontSize: "10px",
          color: "#2E2E2E",
          marginBottom: "6px",
          letterSpacing: "0.06em",
        }}
      >
        {delivery.id}
      </div>

      {/* Address */}
      <div
        style={{
          fontFamily: "var(--font-dm)",
          fontSize: "19px",
          fontWeight: 600,
          color: "#F0F0F0",
          marginBottom: "6px",
          lineHeight: 1.25,
        }}
      >
        {delivery.address}
      </div>

      {/* Time + client */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: "14px",
        }}
      >
        <span
          style={{
            fontFamily: "var(--font-plex)",
            fontSize: "13px",
            color: "#F5A623",
          }}
        >
          {delivery.timeWindowStart}–{delivery.timeWindowEnd}
        </span>
        <span
          style={{
            fontFamily: "var(--font-plex)",
            fontSize: "12px",
            color: "#3A3A3A",
          }}
        >
          {client?.name ?? ""}
        </span>
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
