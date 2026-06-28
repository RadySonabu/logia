"use client";

import { useState } from "react";
import type { Delivery, Client } from "@/lib/types";

interface Props {
  delivery:   Delivery;
  client:     Client | undefined;
  onRowClick: (deliveryId: string) => void;
  grid:       string;
}

export function DeliveryRow({ delivery, client, onRowClick, grid }: Props) {
  const [hovered, setHovered] = useState(false);

  const scheduleDisplay = delivery.proposedPulloutSchedule
    ? delivery.proposedPulloutSchedule.replace("T", " ").slice(0, 16)
    : "—";

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onClick={() => onRowClick(delivery.id)}
      style={{
        display: "grid",
        gridTemplateColumns: grid,
        alignItems: "center",
        minHeight: "52px",
        borderBottom: "1px solid #111",
        background: hovered ? "#0D0D0D" : "transparent",
        padding: "0 20px",
        transition: "background 0.1s",
        cursor: "pointer",
      }}
    >
      {/* SR Number + issue dot */}
      <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
        <span style={{ fontFamily: "var(--font-plex)", fontWeight: 500, fontSize: "12px", color: "#F5A623" }}>
          {delivery.srNumber}
        </span>
        {delivery.issueReported && (
          <span
            title="Issue reported"
            style={{
              width: "6px", height: "6px", borderRadius: "50%",
              background: "#F87171", flexShrink: 0,
            }}
          />
        )}
      </div>

      {/* Customer */}
      <span
        style={{
          fontFamily: "var(--font-dm)",
          fontSize: "13px",
          color: "#B0B0B0",
          overflow: "hidden",
          textOverflow: "ellipsis",
          whiteSpace: "nowrap",
          paddingRight: "12px",
        }}
      >
        {delivery.customerName}
        {client && (
          <span style={{ color: "#3A3A3A", fontSize: "11px", marginLeft: "6px" }}>
            · {client.name}
          </span>
        )}
      </span>

      {/* Address */}
      <div style={{ paddingRight: "12px", overflow: "hidden" }}>
        <div style={{ fontFamily: "var(--font-dm)", fontSize: "13px", color: "#777", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
          {delivery.contactAddressLine1}
        </div>
        {delivery.contactAddressLine2 && (
          <div style={{ fontFamily: "var(--font-dm)", fontSize: "11px", color: "#484848", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
            {delivery.contactAddressLine2}
          </div>
        )}
      </div>

      {/* Schedule */}
      <span style={{ fontFamily: "var(--font-plex)", fontSize: "11px", color: "#484848" }}>
        {scheduleDisplay}
      </span>
    </div>
  );
}
