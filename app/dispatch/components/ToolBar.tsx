"use client";

import type { DeliveryStatus } from "@/lib/types";
import type { Client, Driver } from "@/lib/types";
import { STATUS_CONFIG } from "./StatusChip";
import { DateRangePicker } from "./DateRangePicker";

const ALL_STATUSES: DeliveryStatus[] = [
  "open",
  "claimed",
  "picked_up",
  "delivered",
  "completed",
];


interface Props {
  activeStatus:   DeliveryStatus | "all";
  onStatusChange: (s: DeliveryStatus | "all") => void;
  view:           "list" | "map";
  onViewChange:   (v: "list" | "map") => void;
  clientFilter:   string;
  onClientChange: (id: string) => void;
  driverFilter:   string;
  onDriverChange: (id: string) => void;
  dateFrom:       string;
  onDateFromChange: (v: string) => void;
  dateTo:         string;
  onDateToChange: (v: string) => void;
  clients:        Client[];
  drivers:        Driver[];
  onExport:       () => void;
  onNewDelivery:  () => void;
}

export function ToolBar({
  activeStatus,
  onStatusChange,
  view,
  onViewChange,
  clientFilter,
  onClientChange,
  driverFilter,
  onDriverChange,
  dateFrom,
  onDateFromChange,
  dateTo,
  onDateToChange,
  clients,
  drivers,
  onExport,
  onNewDelivery,
}: Props) {
  return (
    <div
      style={{
        height: "46px",
        background: "#0F0F0F",
        borderBottom: "1px solid #1A1A1A",
        display: "flex",
        alignItems: "center",
        gap: "8px",
        padding: "0 20px",
        flexShrink: 0,
      }}
    >
      {/* Status filter chips */}
      <div style={{ display: "flex", gap: "6px", alignItems: "center" }}>
        {ALL_STATUSES.map((s) => {
          const cfg = STATUS_CONFIG[s];
          const isActive = activeStatus === s;
          return (
            <button
              key={s}
              onClick={() => onStatusChange(isActive ? "all" : s)}
              style={{
                display: "inline-flex",
                alignItems: "center",
                padding: "3px 9px",
                borderRadius: "2px",
                border: `1px solid ${isActive ? cfg.color : "#1E1E1E"}`,
                background: isActive ? cfg.bg : "transparent",
                color: isActive ? cfg.color : "#555",
                fontFamily: "var(--font-barlow)",
                fontWeight: 700,
                fontSize: "10px",
                letterSpacing: "0.06em",
                cursor: "pointer",
                whiteSpace: "nowrap",
                transition: "border-color 0.15s, color 0.15s, background 0.15s",
              }}
            >
              {cfg.label}
            </button>
          );
        })}
      </div>

      {/* Divider */}
      <div style={{ width: "1px", height: "20px", background: "#1E1E1E", margin: "0 4px" }} />

      {/* List / Map toggle */}
      <div style={{ display: "flex", alignItems: "center", height: "28px", border: "1px solid #1E1E1E", borderRadius: "2px", overflow: "hidden" }}>
        {(["list", "map"] as const).map((v) => (
          <button
            key={v}
            onClick={() => onViewChange(v)}
            style={{
              padding: "0 10px", height: "100%",
              background: view === v ? "#1E1E1E" : "transparent",
              color: view === v ? "#D0D0D0" : "#555",
              fontFamily: "var(--font-barlow)", fontWeight: 700, fontSize: "10px",
              letterSpacing: "0.08em", border: "none", cursor: "pointer",
              transition: "background 0.15s, color 0.15s",
            }}
          >
            {v.toUpperCase()}
          </button>
        ))}
      </div>

      {/* Client dropdown */}
      <select value={clientFilter} onChange={(e) => onClientChange(e.target.value)}
        style={{ background: "transparent", border: "1px solid #1E1E1E", borderRadius: "2px", color: "#7A7A7A", fontFamily: "var(--font-barlow)", fontWeight: 700, fontSize: "12px", padding: "0 8px", height: "28px", cursor: "pointer", outline: "none", appearance: "none" }}
      >
        <option value="">ALL CLIENTS</option>
        {clients.map((c) => <option key={c.id} value={c.id}>{c.name.toUpperCase()}</option>)}
      </select>

      {/* Driver dropdown */}
      <select value={driverFilter} onChange={(e) => onDriverChange(e.target.value)}
        style={{ background: "transparent", border: "1px solid #1E1E1E", borderRadius: "2px", color: "#7A7A7A", fontFamily: "var(--font-barlow)", fontWeight: 700, fontSize: "12px", padding: "0 8px", height: "28px", cursor: "pointer", outline: "none", appearance: "none" }}
      >
        <option value="">ALL DRIVERS</option>
        {drivers.map((d) => <option key={d.id} value={d.id}>{d.name.toUpperCase()}</option>)}
      </select>

      {/* Date range picker */}
      <DateRangePicker
        from={dateFrom}
        to={dateTo}
        onChange={(f, t) => { onDateFromChange(f); onDateToChange(t); }}
      />

      {/* Spacer */}
      <div style={{ marginLeft: "auto" }} />

      {/* Export */}
      <button
        onClick={onExport}
        style={{
          background: "transparent", color: "#555",
          fontFamily: "var(--font-barlow)", fontWeight: 700, fontSize: "12px",
          letterSpacing: "0.08em", padding: "0 12px", height: "28px",
          borderRadius: "2px", border: "1px solid #282828", cursor: "pointer",
          display: "flex", alignItems: "center", gap: "6px",
        }}
        onMouseEnter={(e) => { e.currentTarget.style.borderColor = "#484848"; e.currentTarget.style.color = "#B0B0B0"; }}
        onMouseLeave={(e) => { e.currentTarget.style.borderColor = "#282828"; e.currentTarget.style.color = "#555"; }}
      >
        <svg width="11" height="11" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.5">
          <path d="M6 1v7M3 5l3 3 3-3M1 9v1a1 1 0 001 1h8a1 1 0 001-1V9" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
        EXPORT
      </button>

      {/* New delivery */}
      <button
        onClick={onNewDelivery}
        style={{
          background: "#F5A623", color: "#0A0A0A",
          fontFamily: "var(--font-barlow)", fontWeight: 900, fontSize: "12px",
          letterSpacing: "0.08em", padding: "0 14px", height: "28px",
          borderRadius: "2px", border: "none", cursor: "pointer",
        }}
      >
        + NEW DELIVERY
      </button>
    </div>
  );
}
