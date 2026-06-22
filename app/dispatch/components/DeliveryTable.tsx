"use client";

import type { Delivery, Client, Driver } from "@/lib/types";
import { DeliveryRow } from "./DeliveryRow";

const COLUMNS = [
  { label: "SR NUMBER",  width: "100px" },
  { label: "DATE",       width: "96px"  },
  { label: "CUSTOMER",   width: "170px" },
  { label: "ADDRESS",    width: "1fr"   },
  { label: "QTY",        width: "80px"  },
  { label: "STATUS",     width: "110px" },
  { label: "SCHEDULE",   width: "130px" },
  { label: "DRIVER",     width: "110px" },
  { label: "ACTION",     width: "70px"  },
];

interface Props {
  deliveries:   Delivery[];
  clients:      Client[];
  drivers:      Driver[];
  onAssign:     (deliveryId: string) => void;
  onRowClick:   (deliveryId: string) => void;
}

export function DeliveryTable({ deliveries, clients, drivers, onAssign, onRowClick }: Props) {
  const clientMap = Object.fromEntries(clients.map((c) => [c.id, c]));
  const driverMap = Object.fromEntries(drivers.map((d) => [d.id, d]));
  const grid      = COLUMNS.map((c) => c.width).join(" ");

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%" }}>
      {/* Sticky header */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: grid,
          padding: "0 20px",
          height: "36px",
          alignItems: "center",
          borderBottom: "1px solid #1A1A1A",
          position: "sticky",
          top: 0,
          background: "#0A0A0A",
          zIndex: 1,
        }}
      >
        {COLUMNS.map((col) => (
          <span
            key={col.label}
            style={{
              fontFamily: "var(--font-plex)",
              fontSize: "10px",
              color: "#2E2E2E",
              letterSpacing: "0.06em",
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
              height: "200px",
              color: "#2E2E2E",
              fontFamily: "var(--font-plex)",
              fontSize: "12px",
              letterSpacing: "0.06em",
            }}
          >
            NO SERVICE REQUESTS
          </div>
        ) : (
          deliveries.map((d) => (
            <DeliveryRow
              key={d.id}
              delivery={d}
              client={clientMap[d.clientId]}
              driver={d.driverId ? driverMap[d.driverId] : undefined}
              onAssign={onAssign}
              onRowClick={onRowClick}
              grid={grid}
            />
          ))
        )}
      </div>
    </div>
  );
}
