"use client";

import type { Delivery, Client, Driver } from "@/lib/types";
import { DeliveryRow } from "./DeliveryRow";

const COLUMNS = [
  { label: "ORDER ID",  width: "108px" },
  { label: "CLIENT",    width: "150px" },
  { label: "STATUS",    width: "130px" },
  { label: "ADDRESS",   width: "1fr"   },
  { label: "WINDOW",    width: "116px" },
  { label: "DRIVER",    width: "120px" },
  { label: "ACTION",    width: "72px"  },
];

interface Props {
  deliveries: Delivery[];
  clients: Client[];
  drivers: Driver[];
  onAssign: (deliveryId: string) => void;
}

export function DeliveryTable({ deliveries, clients, drivers, onAssign }: Props) {
  const clientMap = Object.fromEntries(clients.map((c) => [c.id, c]));
  const driverMap = Object.fromEntries(drivers.map((d) => [d.id, d]));

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%" }}>
      {/* Sticky header */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: COLUMNS.map((c) => c.width).join(" "),
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
              fontWeight: 400,
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
            NO DELIVERIES
          </div>
        ) : (
          deliveries.map((delivery) => (
            <DeliveryRow
              key={delivery.id}
              delivery={delivery}
              client={clientMap[delivery.clientId]}
              driver={delivery.driverId ? driverMap[delivery.driverId] : undefined}
              onAssign={onAssign}
            />
          ))
        )}
      </div>
    </div>
  );
}
