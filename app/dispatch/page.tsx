"use client";

import { useState, useMemo, useEffect } from "react";
import { useRouter } from "next/navigation";
import { StoreProvider, useStore } from "@/lib/store";
import { useAuth } from "@/lib/auth";
import { NavBar } from "./components/NavBar";
import { ToolBar } from "./components/ToolBar";
import { DeliveryTable } from "./components/DeliveryTable";
import { AssignModal } from "./components/AssignModal";
import { CreateDeliveryModal } from "./components/CreateDeliveryModal";
import { SRDetailPanel } from "./components/SRDetailPanel";
import type { DeliveryStatus } from "@/lib/types";
import { nextOrderId } from "@/lib/data";
import { exportToExcel } from "@/lib/exportExcel";

export default function DispatchPage() {
  return (
    <StoreProvider>
      <AuthGuard>
        <DispatchDashboard />
      </AuthGuard>
    </StoreProvider>
  );
}

function AuthGuard({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) router.replace("/login");
    if (!loading && user && user.role !== "dispatcher") router.replace("/driver");
  }, [user, loading, router]);

  if (loading || !user || user.role !== "dispatcher") return null;
  return <>{children}</>;
}

function DispatchDashboard() {
  const { clients, drivers, deliveries, vehicleTypes, assignDriver, createDelivery } = useStore();
  const { user, logout } = useAuth();
  const router = useRouter();

  const [activeStatus, setActiveStatus] = useState<DeliveryStatus | "all">("all");
  const [view,         setView]         = useState<"list" | "map">("list");
  const [clientFilter, setClientFilter] = useState("");
  const [driverFilter, setDriverFilter] = useState("");
  const [assignId,     setAssignId]     = useState<string | null>(null);
  const [detailId,     setDetailId]     = useState<string | null>(null);
  const [showCreate,   setShowCreate]   = useState(false);
  const [previewId,    setPreviewId]    = useState("");

  useEffect(() => { setPreviewId(nextOrderId()); }, []);

  const filtered = useMemo(() => {
    return deliveries.filter((d) => {
      if (activeStatus !== "all" && d.status !== activeStatus) return false;
      if (clientFilter && d.clientId !== clientFilter)         return false;
      if (driverFilter && d.driverId !== driverFilter)         return false;
      return true;
    });
  }, [deliveries, activeStatus, clientFilter, driverFilter]);

  const assignDelivery = assignId  ? deliveries.find((d) => d.id === assignId)  : null;
  const detailDelivery = detailId  ? deliveries.find((d) => d.id === detailId)  : null;

  function handleLogout() { logout(); router.push("/login"); }

  return (
    <>
      <NavBar user={user} onLogout={handleLogout} />

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
        onExport={() => exportToExcel(deliveries, clients, drivers)}
        onNewDelivery={() => { setPreviewId(nextOrderId()); setShowCreate(true); }}
      />

      <div style={{ flex: 1, overflow: "hidden", background: "#0A0A0A" }}>
        {view === "list" ? (
          <DeliveryTable
            deliveries={filtered}
            clients={clients}
            drivers={drivers}
            onAssign={(id) => setAssignId(id)}
            onRowClick={(id) => setDetailId(id)}
          />
        ) : (
          <MapPlaceholder />
        )}
      </div>

      {detailDelivery && (
        <SRDetailPanel
          delivery={detailDelivery}
          client={clients.find((c) => c.id === detailDelivery.clientId)}
          driver={drivers.find((d) => d.id === detailDelivery.driverId)}
          onClose={() => setDetailId(null)}
        />
      )}

      {assignDelivery && (
        <AssignModal
          delivery={assignDelivery}
          client={clients.find((c) => c.id === assignDelivery.clientId)}
          drivers={drivers}
          onConfirm={(driverId) => { assignDriver(assignDelivery.id, driverId); setAssignId(null); }}
          onClose={() => setAssignId(null)}
        />
      )}
      {showCreate && (
        <CreateDeliveryModal
          clients={clients}
          drivers={drivers}
          vehicleTypes={vehicleTypes}
          previewId={previewId}
          onConfirm={(payload) => { createDelivery(payload); setShowCreate(false); }}
          onClose={() => setShowCreate(false)}
        />
      )}
    </>
  );
}

function MapPlaceholder() {
  return (
    <div style={{ height: "100%", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: "12px", color: "#2E2E2E" }}>
      <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#2E2E2E" strokeWidth="1.5">
        <polygon points="3,6 9,3 15,6 21,3 21,18 15,21 9,18 3,21" />
        <line x1="9" y1="3" x2="9" y2="18" />
        <line x1="15" y1="6" x2="15" y2="21" />
      </svg>
      <span style={{ fontFamily: "var(--font-plex)", fontSize: "11px", letterSpacing: "0.08em", textTransform: "uppercase" }}>
        Map view — coming soon
      </span>
    </div>
  );
}
