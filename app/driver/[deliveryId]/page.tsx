"use client";

import { use } from "react";
import { useRouter } from "next/navigation";
import { useStore } from "@/lib/store";
import { StatusChip } from "@/app/dispatch/components/StatusChip";
import { LifecycleButton } from "../components/LifecycleButton";
import { ProgressBar } from "../components/ProgressBar";
import { EditDetailsPanel } from "../components/EditDetailsPanel";
import type { Delivery } from "@/lib/types";

const DEMO_DRIVER_ID = "d1";

export default function ActiveDeliveryPage({
  params,
}: {
  params: Promise<{ deliveryId: string }>;
}) {
  const { deliveryId } = use(params);
  const router = useRouter();
  const { deliveries, clients, drivers, advanceStatus, updateDelivery } = useStore();

  const delivery = deliveries.find((d) => d.id === deliveryId);
  const client = delivery ? clients.find((c) => c.id === delivery.clientId) : undefined;
  const driver = delivery?.driverId
    ? drivers.find((d) => d.id === delivery.driverId)
    : undefined;

  if (!delivery) {
    return (
      <div
        style={{
          padding: "40px 20px",
          textAlign: "center",
          color: "#2E2E2E",
          fontFamily: "var(--font-plex)",
          fontSize: "12px",
        }}
      >
        DELIVERY NOT FOUND
      </div>
    );
  }

  function handleAdvance() {
    if (!delivery) return;
    if (delivery.status === "delivered") {
      advanceStatus(delivery.id, DEMO_DRIVER_ID);
      router.push("/driver");
    } else {
      advanceStatus(delivery.id, DEMO_DRIVER_ID);
    }
  }

  function handleSaveDetails(patch: Partial<Delivery>) {
    updateDelivery(delivery!.id, patch);
  }

  return (
    <div style={{ padding: "24px 20px 40px", display: "flex", flexDirection: "column", gap: "20px" }}>
      {/* Back nav */}
      <button
        onClick={() => router.push("/driver")}
        style={{
          alignSelf: "flex-start",
          background: "none",
          border: "none",
          color: "#484848",
          fontFamily: "var(--font-plex)",
          fontSize: "11px",
          letterSpacing: "0.06em",
          cursor: "pointer",
          padding: 0,
          display: "flex",
          alignItems: "center",
          gap: "6px",
        }}
      >
        ← OPEN RUNS
      </button>

      {/* Header */}
      <div>
        <div
          style={{
            fontFamily: "var(--font-plex)",
            fontSize: "10px",
            color: "#2E2E2E",
            letterSpacing: "0.08em",
            marginBottom: "6px",
          }}
        >
          {delivery.id}
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "8px" }}>
          <span
            style={{
              fontFamily: "var(--font-barlow)",
              fontWeight: 700,
              fontSize: "11px",
              color: "#484848",
              letterSpacing: "0.1em",
            }}
          >
            ACTIVE RUN
          </span>
          <StatusChip status={delivery.status} size="sm" />
        </div>

        {/* Address */}
        <div
          style={{
            fontFamily: "var(--font-dm)",
            fontSize: "25px",
            fontWeight: 600,
            color: "#F0F0F0",
            lineHeight: 1.25,
            marginBottom: "6px",
          }}
        >
          {delivery.address}
        </div>

        {/* Time + client */}
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <span
            style={{
              fontFamily: "var(--font-plex)",
              fontSize: "13px",
              color: "#F5A623",
            }}
          >
            {delivery.timeWindowStart}–{delivery.timeWindowEnd}
          </span>
          {client && (
            <span
              style={{
                fontFamily: "var(--font-barlow)",
                fontWeight: 600,
                fontSize: "10px",
                color: "#3A3A3A",
                letterSpacing: "0.1em",
                textTransform: "uppercase",
              }}
            >
              {client.name}
            </span>
          )}
        </div>
      </div>

      {/* Contact card */}
      {delivery.contactName && (
        <div
          style={{
            background: "#0D0D0D",
            border: "1px solid #1A1A1A",
            borderRadius: "6px",
            padding: "14px 16px",
            display: "flex",
            flexDirection: "column",
            gap: "4px",
          }}
        >
          <span
            style={{
              fontFamily: "var(--font-plex)",
              fontSize: "9px",
              color: "#2E2E2E",
              letterSpacing: "0.1em",
              textTransform: "uppercase",
            }}
          >
            Contact
          </span>
          <span
            style={{
              fontFamily: "var(--font-dm)",
              fontSize: "15px",
              fontWeight: 500,
              color: "#B0B0B0",
            }}
          >
            {delivery.contactName}
          </span>
          {delivery.contactPhone && (
            <a
              href={`tel:${delivery.contactPhone}`}
              style={{
                fontFamily: "var(--font-plex)",
                fontSize: "13px",
                color: "#F5A623",
                textDecoration: "none",
              }}
            >
              {delivery.contactPhone}
            </a>
          )}
        </div>
      )}

      {/* Notes card */}
      {delivery.deliveryNotes && (
        <div
          style={{
            background: "#0D0D0D",
            border: "1px solid #1A1A1A",
            borderRadius: "6px",
            padding: "14px 16px",
            display: "flex",
            flexDirection: "column",
            gap: "4px",
          }}
        >
          <span
            style={{
              fontFamily: "var(--font-plex)",
              fontSize: "9px",
              color: "#2E2E2E",
              letterSpacing: "0.1em",
              textTransform: "uppercase",
            }}
          >
            Delivery Notes
          </span>
          <span
            style={{
              fontFamily: "var(--font-dm)",
              fontSize: "14px",
              color: "#777",
              lineHeight: 1.5,
            }}
          >
            {delivery.deliveryNotes}
          </span>
        </div>
      )}

      {/* Edit details */}
      <EditDetailsPanel delivery={delivery} onSave={handleSaveDetails} />

      {/* Divider */}
      <div style={{ height: "1px", background: "#1A1A1A" }} />

      {/* Lifecycle button */}
      {delivery.status !== "completed" && (
        <LifecycleButton status={delivery.status} onAdvance={handleAdvance} />
      )}

      {delivery.status === "completed" && (
        <div
          style={{
            textAlign: "center",
            fontFamily: "var(--font-barlow)",
            fontWeight: 700,
            fontSize: "14px",
            color: "#4ADE80",
            letterSpacing: "0.06em",
          }}
        >
          ✓ JOB COMPLETED
        </div>
      )}

      {/* Progress bar */}
      <ProgressBar status={delivery.status} />
    </div>
  );
}
