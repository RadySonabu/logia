"use client";

import { useState } from "react";
import type { Delivery, Client, Driver } from "@/lib/types";
import { StatusChip } from "./StatusChip";

interface Props {
  delivery: Delivery;
  client: Client | undefined;
  driver: Driver | undefined;
  onAssign: (deliveryId: string) => void;
}

export function DeliveryRow({ delivery, client, driver, onAssign }: Props) {
  const [hovered, setHovered] = useState(false);

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        display: "grid",
        gridTemplateColumns: "108px 150px 130px 1fr 116px 120px 72px",
        alignItems: "center",
        minHeight: "52px",
        borderBottom: "1px solid #111",
        background: hovered ? "#0D0D0D" : "transparent",
        padding: "0 20px",
        transition: "background 0.1s",
      }}
    >
      {/* Order ID */}
      <span
        style={{
          fontFamily: "var(--font-plex)",
          fontWeight: 500,
          fontSize: "13px",
          color: "#F5A623",
        }}
      >
        {delivery.id}
      </span>

      {/* Client */}
      <span
        style={{
          fontFamily: "var(--font-dm)",
          fontSize: "13px",
          color: "#B0B0B0",
        }}
      >
        {client?.name ?? "—"}
      </span>

      {/* Status */}
      <div>
        <StatusChip status={delivery.status} />
      </div>

      {/* Address */}
      <span
        style={{
          fontFamily: "var(--font-dm)",
          fontSize: "13px",
          color: "#777",
          overflow: "hidden",
          textOverflow: "ellipsis",
          whiteSpace: "nowrap",
          paddingRight: "12px",
        }}
      >
        {delivery.address}
      </span>

      {/* Window */}
      <span
        style={{
          fontFamily: "var(--font-plex)",
          fontSize: "12px",
          color: "#484848",
        }}
      >
        {delivery.timeWindowStart}–{delivery.timeWindowEnd}
      </span>

      {/* Driver */}
      <span
        style={{
          fontFamily: "var(--font-dm)",
          fontSize: "13px",
          color: "#585858",
        }}
      >
        {driver?.name ?? "—"}
      </span>

      {/* Action */}
      <div>
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
        fontFamily: "var(--font-barlow)",
        fontWeight: 700,
        fontSize: "10px",
        letterSpacing: "0.08em",
        color: hov ? "#F5A623" : "#555",
        background: "transparent",
        border: `1px solid ${hov ? "#F5A623" : "#282828"}`,
        borderRadius: "2px",
        padding: "3px 10px",
        cursor: "pointer",
        transition: "border-color 0.15s, color 0.15s",
      }}
    >
      ASSIGN
    </button>
  );
}
