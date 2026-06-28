"use client";

import type { Client, Driver } from "@/lib/types";
import { DateRangePicker } from "./DateRangePicker";

interface Props {
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
  layoutMode:     "tabs" | "stacked";
  onLayoutToggle: () => void;
  clients:        Client[];
  drivers:        Driver[];
  onExport:       () => void;
  onNewDelivery:  () => void;
}

export function ToolBar({
  view, onViewChange,
  clientFilter, onClientChange,
  driverFilter, onDriverChange,
  dateFrom, onDateFromChange, dateTo, onDateToChange,
  layoutMode, onLayoutToggle,
  clients, drivers,
  onExport, onNewDelivery,
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

      {/* Layout toggle */}
      <button
        onClick={onLayoutToggle}
        title={layoutMode === "tabs" ? "Switch to stacked view" : "Switch to tab view"}
        style={{
          background: "transparent",
          border: "1px solid #282828",
          color: "#555",
          height: "28px",
          width: "32px",
          borderRadius: "2px",
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          transition: "border-color 0.15s, color 0.15s",
        }}
        onMouseEnter={(e) => { e.currentTarget.style.borderColor = "#484848"; e.currentTarget.style.color = "#B0B0B0"; }}
        onMouseLeave={(e) => { e.currentTarget.style.borderColor = "#282828"; e.currentTarget.style.color = "#555"; }}
      >
        {layoutMode === "tabs" ? (
          /* stacked icon */
          <svg width="13" height="13" viewBox="0 0 13 13" fill="none" stroke="currentColor" strokeWidth="1.4">
            <rect x="1" y="1"  width="11" height="3" rx="0.5" />
            <rect x="1" y="5"  width="11" height="3" rx="0.5" />
            <rect x="1" y="9"  width="11" height="3" rx="0.5" />
          </svg>
        ) : (
          /* tabs icon */
          <svg width="13" height="13" viewBox="0 0 13 13" fill="none" stroke="currentColor" strokeWidth="1.4">
            <rect x="1" y="4"  width="11" height="8" rx="0.5" />
            <path d="M1 4 V2.5 Q1 1 2.5 1 H5 Q6.5 1 6.5 2.5 V4" />
          </svg>
        )}
      </button>

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
          <path d="M6 1v7M3 5l3 3 3-3M1 9v1a1 1 0 001 1h8a1 1 0 001-1V9" strokeLinecap="round" strokeLinejoin="round" />
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
        + NEW SR
      </button>
    </div>
  );
}
