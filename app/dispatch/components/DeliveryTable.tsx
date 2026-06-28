"use client";

import type { Delivery, Client, Driver } from "@/lib/types";
import { DeliveryRow } from "./DeliveryRow";

const COLUMNS = [
  { label: "SR NUMBER", width: "110px" },
  { label: "CUSTOMER",  width: "220px" },
  { label: "ADDRESS",   width: "1fr"   },
  { label: "SCHEDULE",  width: "160px" },
];

const grid = COLUMNS.map((c) => c.width).join(" ");

interface Props {
  deliveries:  Delivery[];
  clients:     Client[];
  drivers:     Driver[];
  onRowClick:  (deliveryId: string) => void;
  emptyLabel?: string;
}

export function DeliveryTable({ deliveries, clients, onRowClick, emptyLabel }: Props) {
  const clientMap = Object.fromEntries(clients.map((c) => [c.id, c]));

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%" }}>
      {/* Sticky header */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: grid,
          padding: "0 20px",
          height: "34px",
          alignItems: "center",
          borderBottom: "1px solid #1A1A1A",
          position: "sticky",
          top: 0,
          background: "#0A0A0A",
          zIndex: 1,
          flexShrink: 0,
        }}
      >
        {COLUMNS.map((col) => (
          <span
            key={col.label}
            style={{
              fontFamily: "var(--font-plex)",
              fontSize: "9px",
              color: "#2E2E2E",
              letterSpacing: "0.08em",
              textTransform: "uppercase",
            }}
          >
            {col.label}
          </span>
        ))}
      </div>

      {/* Rows */}
      <div style={{ overflowY: "auto", flex: 1 }}>
        {deliveries.length === 0 ? (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              height: "120px",
              color: "#2E2E2E",
              fontFamily: "var(--font-plex)",
              fontSize: "11px",
              letterSpacing: "0.06em",
            }}
          >
            {emptyLabel ?? "NO SERVICE REQUESTS"}
          </div>
        ) : (
          deliveries.map((d) => (
            <DeliveryRow
              key={d.id}
              delivery={d}
              client={clientMap[d.clientId]}
              onRowClick={onRowClick}
              grid={grid}
            />
          ))
        )}
      </div>
    </div>
  );
}
