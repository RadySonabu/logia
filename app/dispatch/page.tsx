"use client";

import { useState, useMemo, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { StoreProvider, useStore } from "@/lib/store";
import { useAuth } from "@/lib/auth";
import { NavBar } from "./components/NavBar";
import { ToolBar } from "./components/ToolBar";
import { SectionTabs, type Section, type ActiveView } from "./components/SectionTabs";
import { DeliveryTable } from "./components/DeliveryTable";
import { SummaryView } from "./components/SummaryView";
import { AssignModal } from "./components/AssignModal";
import { CreateDeliveryModal } from "./components/CreateDeliveryModal";
import { SRDetailPanel } from "./components/SRDetailPanel";
import type { Delivery } from "@/lib/types";
import { nextSrNumber } from "@/lib/data";
// nextSrNumber generates the display SR label (e.g. "SR-0089"); id is a UUID generated in the store
import { exportToExcel } from "@/lib/exportExcel";

// ── Section filter logic ──────────────────────────────────────────────────────

function filterBySection(deliveries: Delivery[], section: Section): Delivery[] {
  switch (section) {
    case "pending":   return deliveries.filter((d) => d.status === "open");
    case "on-going":  return deliveries.filter((d) => d.status === "claimed" || d.status === "picked_up");
    case "completed": return deliveries.filter((d) => d.status === "delivered" || d.status === "completed");
    case "issues":    return deliveries.filter((d) => d.issueReported);
  }
}

const ALL_SECTIONS: Section[] = ["pending", "on-going", "completed", "issues"];

// ── Page ──────────────────────────────────────────────────────────────────────

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

  const [activeView,   setActiveView]   = useState<ActiveView>("pending");
  const [layoutMode,   setLayoutMode]   = useState<"tabs" | "stacked">("tabs");
  const [view,         setView]         = useState<"list" | "map">("list");
  const [clientFilter, setClientFilter] = useState("");
  const [driverFilter, setDriverFilter] = useState("");
  const [dateFrom,     setDateFrom]     = useState("");
  const [dateTo,       setDateTo]       = useState("");
  const [assignId,     setAssignId]     = useState<string | null>(null);
  const [detailId,     setDetailId]     = useState<string | null>(null);
  const [showCreate,   setShowCreate]   = useState(false);
  const [previewId,    setPreviewId]    = useState("");

  // Load layout preference from localStorage
  useEffect(() => {
    setPreviewId(nextSrNumber());
    const saved = localStorage.getItem("relay_dashboard_layout");
    if (saved === "stacked" || saved === "tabs") setLayoutMode(saved);
  }, []);

  const toggleLayout = useCallback(() => {
    setLayoutMode((m) => {
      const next = m === "tabs" ? "stacked" : "tabs";
      localStorage.setItem("relay_dashboard_layout", next);
      return next;
    });
  }, []);

  // Base filter (client / driver / date) — applied across all sections
  const baseFiltered = useMemo(() => {
    return deliveries.filter((d) => {
      if (clientFilter && d.clientId !== clientFilter) return false;
      if (driverFilter && d.driverId !== driverFilter) return false;
      if (dateFrom && d.date < dateFrom)               return false;
      if (dateTo   && d.date > dateTo)                 return false;
      return true;
    });
  }, [deliveries, clientFilter, driverFilter, dateFrom, dateTo]);

  // Section counts (for tab badges)
  const counts = useMemo(
    () => Object.fromEntries(ALL_SECTIONS.map((s) => [s, filterBySection(baseFiltered, s).length])) as Record<Section, number>,
    [baseFiltered]
  );

  // Active section deliveries (tabs mode)
  const activeDeliveries = useMemo(
    () => (activeView === "summary" ? [] : filterBySection(baseFiltered, activeView as Section)),
    [baseFiltered, activeView]
  );

  const assignDelivery = assignId ? deliveries.find((d) => d.id === assignId) : null;
  const detailDelivery = detailId ? deliveries.find((d) => d.id === detailId) : null;

  function handleLogout() { logout(); router.push("/login"); }

  function handleDetailAssign(deliveryId: string) {
    setDetailId(null);
    setAssignId(deliveryId);
  }

  function handleExport() {
    if (activeView === "summary") {
      exportToExcel(baseFiltered, clients, drivers);
    } else if (layoutMode === "stacked") {
      exportToExcel(baseFiltered, clients, drivers);
    } else {
      exportToExcel(activeDeliveries, clients, drivers);
    }
  }

  return (
    <>
      <NavBar user={user} onLogout={handleLogout} />

      <SectionTabs active={activeView} counts={counts} onChange={setActiveView} />

      <ToolBar
        view={view}
        onViewChange={setView}
        clientFilter={clientFilter}
        onClientChange={setClientFilter}
        driverFilter={driverFilter}
        onDriverChange={setDriverFilter}
        dateFrom={dateFrom}
        onDateFromChange={setDateFrom}
        dateTo={dateTo}
        onDateToChange={setDateTo}
        layoutMode={layoutMode}
        onLayoutToggle={toggleLayout}
        clients={clients}
        drivers={drivers}
        onExport={handleExport}
        onNewDelivery={() => { setPreviewId(nextSrNumber()); setShowCreate(true); }}
      />

      {/* Content area */}
      <div style={{ flex: 1, overflow: "hidden", background: "#0A0A0A", display: "flex", flexDirection: "column" }}>
        {activeView === "summary" ? (
          <SummaryView deliveries={baseFiltered} />
        ) : view === "map" ? (
          <MapPlaceholder />
        ) : layoutMode === "tabs" ? (
          <DeliveryTable
            deliveries={activeDeliveries}
            clients={clients}
            drivers={drivers}
            onRowClick={(id) => setDetailId(id)}
          />
        ) : (
          <StackedView
            baseFiltered={baseFiltered}
            clients={clients}
            drivers={drivers}
            onRowClick={(id) => setDetailId(id)}
          />
        )}
      </div>

      {/* Detail panel */}
      {detailDelivery && (
        <SRDetailPanel
          delivery={detailDelivery}
          client={clients.find((c) => c.id === detailDelivery.clientId)}
          driver={drivers.find((d) => d.id === detailDelivery.driverId)}
          drivers={drivers}
          onClose={() => setDetailId(null)}
          onAssign={handleDetailAssign}
        />
      )}

      {/* Assign modal */}
      {assignDelivery && (
        <AssignModal
          delivery={assignDelivery}
          client={clients.find((c) => c.id === assignDelivery.clientId)}
          drivers={drivers}
          onConfirm={(driverId) => { assignDriver(assignDelivery.id, driverId); setAssignId(null); }}
          onClose={() => setAssignId(null)}
        />
      )}

      {/* Create modal */}
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

// ── Stacked layout ────────────────────────────────────────────────────────────

function StackedView({
  baseFiltered, clients, drivers, onRowClick,
}: {
  baseFiltered: Delivery[];
  clients: ReturnType<typeof useStore>["clients"];
  drivers: ReturnType<typeof useStore>["drivers"];
  onRowClick: (id: string) => void;
}) {
  const [collapsed, setCollapsed] = useState<Record<Section, boolean>>({
    "pending": false, "on-going": false, "completed": false, "issues": false,
  });

  const LABELS: Record<Section, string> = {
    "pending": "PENDING", "on-going": "ON-GOING", "completed": "COMPLETED", "issues": "ISSUES",
  };
  const COLORS: Record<Section, string> = {
    "pending": "#94A3B8", "on-going": "#60A5FA", "completed": "#34D399", "issues": "#F87171",
  };

  return (
    <div style={{ overflowY: "auto", flex: 1, padding: "16px 0" }}>
      {ALL_SECTIONS.map((section) => {
        const rows  = filterBySection(baseFiltered, section);
        const isOpen = !collapsed[section];
        return (
          <div key={section} style={{ marginBottom: "12px" }}>
            {/* Section header */}
            <button
              onClick={() => setCollapsed((c) => ({ ...c, [section]: !c[section] }))}
              style={{
                width: "100%", background: "transparent", border: "none",
                borderTop: `1px solid #1A1A1A`, borderBottom: isOpen ? "none" : "1px solid #1A1A1A",
                padding: "10px 20px",
                display: "flex", alignItems: "center", gap: "10px",
                cursor: "pointer",
              }}
            >
              <span style={{ fontFamily: "var(--font-barlow)", fontWeight: 900, fontSize: "11px", letterSpacing: "0.1em", color: COLORS[section] }}>
                {LABELS[section]}
              </span>
              <span style={{ fontFamily: "var(--font-plex)", fontSize: "10px", color: "#2E2E2E", background: "#1A1A1A", padding: "1px 7px", borderRadius: "2px" }}>
                {rows.length}
              </span>
              <span style={{ marginLeft: "auto", fontFamily: "var(--font-plex)", fontSize: "11px", color: "#2E2E2E" }}>
                {isOpen ? "▲" : "▼"}
              </span>
            </button>

            {/* Table */}
            {isOpen && (
              <DeliveryTable
                deliveries={rows}
                clients={clients}
                drivers={drivers}
                onRowClick={onRowClick}
                emptyLabel={`NO ${LABELS[section]} SRs`}
              />
            )}
          </div>
        );
      })}
    </div>
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
