"use client";

import { useState } from "react";
import type { Delivery, Client, Driver } from "@/lib/types";
import { StatusChip } from "./StatusChip";

interface Props {
  delivery:   Delivery;
  client:     Client | undefined;
  driver:     Driver | undefined;
  onAssign:   (deliveryId: string) => void;
  onRowClick: (deliveryId: string) => void;
  grid:       string;
}

export function DeliveryRow({ delivery, client, driver, onAssign, onRowClick, grid }: Props) {
  const [hovered, setHovered] = useState(false);

  const scheduleDisplay = delivery.proposedPulloutSchedule
    ? delivery.proposedPulloutSchedule.replace("T", " ").slice(0, 16)
    : "—";

  const hasActual = delivery.actualQuantity != null;

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
      {/* SR Number */}
      <span style={{ fontFamily: "var(--font-plex)", fontWeight: 500, fontSize: "12px", color: "#F5A623" }}>
        {delivery.id}
      </span>

      {/* Date */}
      <span style={{ fontFamily: "var(--font-plex)", fontSize: "11px", color: "#484848" }}>
        {delivery.date || "—"}
      </span>

      {/* Customer */}
      <span style={{ fontFamily: "var(--font-dm)", fontSize: "13px", color: "#B0B0B0", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", paddingRight: "8px" }}>
        {delivery.customerName}
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

      {/* Declared qty → actual qty */}
      <div>
        {hasActual ? (
          <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
            <span style={{ fontFamily: "var(--font-plex)", fontSize: "11px", color: "#484848", textDecoration: "line-through" }}>
              {delivery.declaredQuantity}
            </span>
            <span style={{ fontFamily: "var(--font-plex)", fontSize: "10px", color: "#2E2E2E" }}>→</span>
            <span style={{ fontFamily: "var(--font-plex)", fontSize: "12px", color: "#34D399", fontWeight: 600 }}>
              {delivery.actualQuantity}
            </span>
          </div>
        ) : (
          <span style={{ fontFamily: "var(--font-plex)", fontSize: "12px", color: "#484848" }}>
            {delivery.declaredQuantity}
          </span>
        )}
      </div>

      {/* Status */}
      <div>
        <StatusChip status={delivery.status} />
      </div>

      {/* Schedule */}
      <span style={{ fontFamily: "var(--font-plex)", fontSize: "11px", color: "#484848" }}>
        {scheduleDisplay}
      </span>

      {/* Driver */}
      <span style={{ fontFamily: "var(--font-dm)", fontSize: "13px", color: "#585858" }}>
        {driver?.name ?? "—"}
      </span>

      {/* Action — stop propagation so clicking ASSIGN doesn't open the detail panel */}
      <div onClick={(e) => e.stopPropagation()}>
        {delivery.status === "open" && (
          <AssignButton onClick={() => onAssign(delivery.id)} />
        )}
      </div>
    </div>
  );
}

function AssignButton({ onClick }: { onClick: () => void }) {
  const [hov, setHov] = useState(false);
  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        fontFamily: "var(--font-barlow)", fontWeight: 700, fontSize: "10px", letterSpacing: "0.08em",
        color: hov ? "#F5A623" : "#555",
        background: "transparent",
        border: `1px solid ${hov ? "#F5A623" : "#282828"}`,
        borderRadius: "2px", padding: "3px 10px", cursor: "pointer",
        transition: "border-color 0.15s, color 0.15s",
      }}
    >
      ASSIGN
    </button>
  );
}
