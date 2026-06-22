"use client";

import { use } from "react";
import { useRouter } from "next/navigation";
import { useStore } from "@/lib/store";
import { useAuth } from "@/lib/auth";
import { StatusChip } from "@/app/dispatch/components/StatusChip";
import { LifecycleButton } from "../components/LifecycleButton";
import { ProgressBar } from "../components/ProgressBar";
import { EditDetailsPanel } from "../components/EditDetailsPanel";
import type { Delivery } from "@/lib/types";

export default function ActiveDeliveryPage({ params }: { params: Promise<{ deliveryId: string }> }) {
  const { deliveryId } = use(params);
  const router                                                    = useRouter();
  const { user }                                                  = useAuth();
  const { deliveries, clients, drivers, advanceStatus, updateDelivery } = useStore();

  const delivery = deliveries.find((d) => d.id === deliveryId);
  const client   = delivery ? clients.find((c) => c.id === delivery.clientId) : undefined;
  const driver   = delivery?.driverId ? drivers.find((d) => d.id === delivery.driverId) : undefined;

  if (!delivery) {
    return (
      <div style={{ padding: "40px 20px", textAlign: "center", color: "#2E2E2E", fontFamily: "var(--font-plex)", fontSize: "12px" }}>
        SERVICE REQUEST NOT FOUND
      </div>
    );
  }

  const scheduleDisplay = delivery.proposedPulloutSchedule
    ? delivery.proposedPulloutSchedule.replace("T", " ").slice(0, 16)
    : "—";

  function handleAdvance() {
    if (!delivery) return;
    const goBack = delivery.status === "delivered";
    advanceStatus(delivery.id, user?.driverId ?? undefined);
    if (goBack) router.push("/driver");
  }

  function handleSave(patch: Partial<Delivery>) {
    updateDelivery(delivery!.id, patch);
  }

  return (
    <div style={{ padding: "24px 20px 40px", display: "flex", flexDirection: "column", gap: "20px" }}>
      {/* Back nav */}
      <button
        onClick={() => router.push("/driver")}
        style={{ alignSelf: "flex-start", background: "none", border: "none", color: "#484848", fontFamily: "var(--font-plex)", fontSize: "11px", letterSpacing: "0.06em", cursor: "pointer", padding: 0, display: "flex", alignItems: "center", gap: "6px" }}
      >
        ← OPEN RUNS
      </button>

      {/* Header */}
      <div>
        <div style={{ fontFamily: "var(--font-plex)", fontSize: "10px", color: "#2E2E2E", letterSpacing: "0.08em", marginBottom: "6px" }}>
          {delivery.id} · {delivery.date}
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "8px" }}>
          <span style={{ fontFamily: "var(--font-barlow)", fontWeight: 700, fontSize: "11px", color: "#484848", letterSpacing: "0.1em" }}>
            ACTIVE RUN
          </span>
          <StatusChip status={delivery.status} />
        </div>
        <div style={{ fontFamily: "var(--font-dm)", fontSize: "22px", fontWeight: 600, color: "#F0F0F0", lineHeight: 1.25, marginBottom: "4px" }}>
          {delivery.customerName}
        </div>
        {client && (
          <div style={{ fontFamily: "var(--font-barlow)", fontWeight: 600, fontSize: "10px", color: "#3A3A3A", letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: "6px" }}>
            {client.name}
          </div>
        )}
      </div>

      {/* Address card */}
      <InfoCard label="Address">
        <div style={{ fontFamily: "var(--font-dm)", fontSize: "15px", color: "#B0B0B0" }}>
          {delivery.contactAddressLine1}
        </div>
        {delivery.contactAddressLine2 && (
          <div style={{ fontFamily: "var(--font-dm)", fontSize: "13px", color: "#777", marginTop: "2px" }}>
            {delivery.contactAddressLine2}
          </div>
        )}
      </InfoCard>

      {/* SR Problem Summary */}
      <InfoCard label="SR Problem Summary">
        <div style={{ fontFamily: "var(--font-dm)", fontSize: "14px", color: "#777", lineHeight: 1.5 }}>
          {delivery.srProblemSummary}
        </div>
      </InfoCard>

      {/* Schedule + Quantities row */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px" }}>
        <InfoCard label="Proposed Schedule">
          <span style={{ fontFamily: "var(--font-plex)", fontSize: "13px", color: "#F5A623" }}>
            {scheduleDisplay}
          </span>
        </InfoCard>
        <InfoCard label="Declared Qty">
          <span style={{ fontFamily: "var(--font-plex)", fontSize: "18px", color: "#F0F0F0", fontWeight: 600 }}>
            {delivery.declaredQuantity}
          </span>
        </InfoCard>
      </div>

      {/* Vehicle + Driver row */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px" }}>
        {delivery.vehicleType && (
          <InfoCard label="Vehicle Type">
            <span style={{ fontFamily: "var(--font-dm)", fontSize: "13px", color: "#B0B0B0" }}>
              {delivery.vehicleType}
            </span>
          </InfoCard>
        )}
        <InfoCard label="Driver">
          <span style={{ fontFamily: "var(--font-dm)", fontSize: "13px", color: "#B0B0B0" }}>
            {driver?.name ?? user?.name ?? "—"}
          </span>
        </InfoCard>
      </div>

      {/* Actual pullout info (if recorded) */}
      {(delivery.actualDateOfPullout || delivery.actualQuantity != null) && (
        <div style={{ padding: "12px 14px", background: "rgba(52,211,153,0.05)", border: "1px solid rgba(52,211,153,0.15)", borderRadius: "6px", display: "flex", gap: "20px" }}>
          {delivery.actualDateOfPullout && (
            <div>
              <div style={{ fontFamily: "var(--font-plex)", fontSize: "9px", color: "#34D399", letterSpacing: "0.08em", marginBottom: "3px" }}>ACTUAL DATE</div>
              <div style={{ fontFamily: "var(--font-plex)", fontSize: "12px", color: "#B0B0B0" }}>{delivery.actualDateOfPullout}</div>
            </div>
          )}
          {delivery.actualQuantity != null && (
            <div>
              <div style={{ fontFamily: "var(--font-plex)", fontSize: "9px", color: "#34D399", letterSpacing: "0.08em", marginBottom: "3px" }}>ACTUAL QTY</div>
              <div style={{ fontFamily: "var(--font-plex)", fontSize: "12px", color: "#B0B0B0" }}>{delivery.actualQuantity}</div>
            </div>
          )}
        </div>
      )}

      {/* Record pullout details */}
      <EditDetailsPanel delivery={delivery} onSave={handleSave} />

      {/* Divider */}
      <div style={{ height: "1px", background: "#1A1A1A" }} />

      {/* Lifecycle button */}
      {delivery.status !== "completed" && (
        <LifecycleButton status={delivery.status} onAdvance={handleAdvance} />
      )}
      {delivery.status === "completed" && (
        <div style={{ textAlign: "center", fontFamily: "var(--font-barlow)", fontWeight: 700, fontSize: "14px", color: "#4ADE80", letterSpacing: "0.06em" }}>
          ✓ JOB COMPLETED
        </div>
      )}

      {/* Progress bar */}
      <ProgressBar status={delivery.status} />
    </div>
  );
}

function InfoCard({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div style={{ background: "#0D0D0D", border: "1px solid #1A1A1A", borderRadius: "6px", padding: "12px 14px" }}>
      <div style={{ fontFamily: "var(--font-plex)", fontSize: "9px", color: "#2E2E2E", letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: "6px" }}>
        {label}
      </div>
      {children}
    </div>
  );
}
