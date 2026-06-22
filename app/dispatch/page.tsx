"use client";

import { useState, useMemo, useEffect } from "react";
import { StoreProvider, useStore } from "@/lib/store";
import { ToolBar } from "./components/ToolBar";
import { DeliveryTable } from "./components/DeliveryTable";
import { AssignModal } from "./components/AssignModal";
import { CreateDeliveryModal } from "./components/CreateDeliveryModal";
import type { DeliveryStatus, Delivery } from "@/lib/types";
import { nextOrderId } from "@/lib/data";

export default function DispatchPage() {
  return (
    <StoreProvider>
      <DispatchDashboard />
    </StoreProvider>
  );
}

function DispatchDashboard() {
  const { clients, drivers, deliveries, assignDriver, createDelivery } = useStore();

  const [activeStatus, setActiveStatus] = useState<DeliveryStatus | "all">("all");
  const [view, setView] = useState<"list" | "map">("list");
  const [clientFilter, setClientFilter] = useState("");
  const [driverFilter, setDriverFilter] = useState("");
  const [assignDeliveryId, setAssignDeliveryId] = useState<string | null>(null);
  const [showCreate, setShowCreate] = useState(false);
  const [previewId, setPreviewId] = useState("");
  const [time, setTime] = useState("");

  useEffect(() => {
    setPreviewId(nextOrderId());
    const tick = () => {
      const now = new Date();
      setTime(
        now.toLocaleTimeString("en-US", {
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
          hour12: false,
        })
      );
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);

  const filtered = useMemo(() => {
    return deliveries.filter((d) => {
      if (activeStatus !== "all" && d.status !== activeStatus) return false;
      if (clientFilter && d.clientId !== clientFilter) return false;
      if (driverFilter && d.driverId !== driverFilter) return false;
      return true;
    });
  }, [deliveries, activeStatus, clientFilter, driverFilter]);

  const assignDelivery = assignDeliveryId
    ? deliveries.find((d) => d.id === assignDeliveryId)
    : null;

  return (
    <>
      {/* Top nav */}
      <nav
        style={{
          height: "52px",
          background: "#111",
          borderBottom: "2px solid #1A1A1A",
          display: "flex",
          alignItems: "center",
          padding: "0 20px",
          gap: "0",
          flexShrink: 0,
          zIndex: 10,
        }}
      >
        {/* Logo + wordmark */}
        <div style={{ display: "flex", alignItems: "center", gap: "10px", marginRight: "8px" }}>
          <svg width="15" height="15" viewBox="0 0 16 16">
            <polygon points="8,0 16,8 8,16 0,8" fill="#F5A623" />
          </svg>
          <span
            style={{
              fontFamily: "var(--font-barlow)",
              fontWeight: 900,
              fontSize: "20px",
              color: "#F0F0F0",
              letterSpacing: "0.14em",
            }}
          >
            RELAY
          </span>
        </div>

        {/* Nav tabs */}
        <NavTab label="DISPATCH" active />
        <NavTab label="DRIVERS" active={false} />
        <NavTab label="REPORTS" active={false} />

        {/* Live indicator */}
        <div
          style={{
            marginLeft: "auto",
            display: "flex",
            alignItems: "center",
            gap: "7px",
          }}
        >
          <div
            className="animate-pulse-dot"
            style={{
              width: "6px",
              height: "6px",
              borderRadius: "50%",
              background: "#34D399",
            }}
          />
          <span
            style={{
              fontFamily: "var(--font-plex)",
              fontSize: "11px",
              color: "#333",
            }}
          >
            {time}
          </span>
        </div>
      </nav>

      {/* Toolbar */}
      <ToolBar
        activeStatus={activeStatus}
        onStatusChange={setActiveStatus}
        view={view}
        onViewChange={setView}
        clientFilter={clientFilter}
        onClientChange={setClientFilter}
        driverFilter={driverFilter}
        onDriverChange={setDriverFilter}
        clients={clients}
        drivers={drivers}
        onNewDelivery={() => {
          setPreviewId(nextOrderId());
          setShowCreate(true);
        }}
      />

      {/* Content */}
      <div style={{ flex: 1, overflow: "hidden", background: "#0A0A0A" }}>
        {view === "list" ? (
          <DeliveryTable
            deliveries={filtered}
            clients={clients}
            drivers={drivers}
            onAssign={(id) => setAssignDeliveryId(id)}
          />
        ) : (
          <MapPlaceholder />
        )}
      </div>

      {/* Modals */}
      {assignDelivery && (
        <AssignModal
          delivery={assignDelivery}
          client={clients.find((c) => c.id === assignDelivery.clientId)}
          drivers={drivers}
          onConfirm={(driverId) => {
            assignDriver(assignDelivery.id, driverId);
            setAssignDeliveryId(null);
          }}
          onClose={() => setAssignDeliveryId(null)}
        />
      )}

      {showCreate && (
        <CreateDeliveryModal
          clients={clients}
          drivers={drivers}
          previewId={previewId}
          onConfirm={(payload) => {
            createDelivery(payload);
            setShowCreate(false);
          }}
          onClose={() => setShowCreate(false)}
        />
      )}
    </>
  );
}

function NavTab({ label, active }: { label: string; active: boolean }) {
  return (
    <div
      style={{
        height: "52px",
        padding: "0 18px",
        display: "flex",
        alignItems: "center",
        background: active ? "#F5A623" : "transparent",
        color: active ? "#0A0A0A" : "#555",
        fontFamily: "var(--font-barlow)",
        fontWeight: 700,
        fontSize: "12px",
        letterSpacing: "0.08em",
        cursor: "pointer",
      }}
    >
      {label}
    </div>
  );
}

function MapPlaceholder() {
  return (
    <div
      style={{
        height: "100%",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: "12px",
        color: "#2E2E2E",
        background: "#0A0A0A",
      }}
    >
      <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#2E2E2E" strokeWidth="1.5">
        <polygon points="3,6 9,3 15,6 21,3 21,18 15,21 9,18 3,21" />
        <line x1="9" y1="3" x2="9" y2="18" />
        <line x1="15" y1="6" x2="15" y2="21" />
      </svg>
      <span
        style={{
          fontFamily: "var(--font-plex)",
          fontSize: "11px",
          letterSpacing: "0.08em",
          textTransform: "uppercase",
        }}
      >
        Map view — coming soon
      </span>
    </div>
  );
}
