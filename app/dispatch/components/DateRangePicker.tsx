"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { DayPicker } from "react-day-picker";
import type { DateRange } from "react-day-picker";
import "react-day-picker/src/style.css";

interface Props {
  from:     string;
  to:       string;
  onChange: (from: string, to: string) => void;
}

// ── Date helpers ─────────────────────────────────────────────────────────────

function toDate(s: string): Date | undefined {
  return s ? new Date(s + "T00:00:00") : undefined;
}

function toStr(d: Date | undefined): string {
  if (!d) return "";
  const y  = d.getFullYear();
  const m  = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${dd}`;
}

function fmt(s: string): string {
  if (!s) return "";
  const [y, m, d] = s.split("-");
  return `${m}/${d}/${y}`;
}

// ── FROM / TO indicator ───────────────────────────────────────────────────────

function DateSlots({ draft }: { draft: DateRange | undefined }) {
  const fromStr = toStr(draft?.from);
  const toStr_  = toStr(draft?.to);
  const pickingFrom = !draft?.from;
  const pickingTo   = !!draft?.from && !draft?.to;

  return (
    <div style={{ display: "flex", gap: "6px", padding: "8px 10px 0" }}>
      <Slot
        label="FROM"
        value={fromStr ? fmt(fromStr) : ""}
        active={pickingFrom}
        filled={!!fromStr}
      />
      <div style={{ display: "flex", alignItems: "center", color: "#2E2E2E", fontSize: "12px", paddingTop: "14px" }}>→</div>
      <Slot
        label="TO"
        value={toStr_ ? fmt(toStr_) : ""}
        active={pickingTo}
        filled={!!toStr_}
      />
    </div>
  );
}

function Slot({ label, value, active, filled }: { label: string; value: string; active: boolean; filled: boolean }) {
  return (
    <div style={{ flex: 1 }}>
      <div style={{
        fontFamily: "var(--font-plex)",
        fontSize: "8px",
        letterSpacing: "0.1em",
        marginBottom: "4px",
        color: active ? "#F5A623" : filled ? "#484848" : "#2E2E2E",
        transition: "color 0.15s",
      }}>
        {label}
        {active && <span style={{ marginLeft: "4px" }}>●</span>}
      </div>
      <div style={{
        height: "30px",
        border: `1px solid ${active ? "#F5A623" : filled ? "#252525" : "#1A1A1A"}`,
        borderRadius: "2px",
        background: active ? "rgba(245,166,35,0.05)" : "#0D0D0D",
        display: "flex",
        alignItems: "center",
        padding: "0 8px",
        fontFamily: "var(--font-plex)",
        fontSize: "11px",
        color: filled ? "#F0F0F0" : active ? "rgba(245,166,35,0.4)" : "#2E2E2E",
        transition: "border-color 0.15s, background 0.15s, color 0.15s",
        boxShadow: active ? "0 0 0 1px rgba(245,166,35,0.2)" : "none",
      }}>
        {value || (active ? "Select…" : "—")}
      </div>
    </div>
  );
}

function startOf(d: Date): Date { return new Date(d.getFullYear(), d.getMonth(), d.getDate()); }
function addDays(d: Date, n: number): Date { const r = new Date(d); r.setDate(r.getDate() + n); return r; }
function startOfMonth(d: Date): Date { return new Date(d.getFullYear(), d.getMonth(), 1); }
function endOfMonth(d: Date): Date   { return new Date(d.getFullYear(), d.getMonth() + 1, 0); }
function startOfYear(d: Date): Date  { return new Date(d.getFullYear(), 0, 1); }
function endOfYear(d: Date): Date    { return new Date(d.getFullYear(), 11, 31); }

// ── Presets ───────────────────────────────────────────────────────────────────

interface Preset { label: string; from: () => Date; to: () => Date }

const PRESETS: Preset[] = [
  { label: "Today",      from: () => startOf(new Date()), to: () => startOf(new Date()) },
  { label: "Last 7d",   from: () => addDays(startOf(new Date()), -6), to: () => startOf(new Date()) },
  { label: "Last 30d",  from: () => addDays(startOf(new Date()), -29), to: () => startOf(new Date()) },
  { label: "This Month", from: () => startOfMonth(new Date()), to: () => endOfMonth(new Date()) },
  { label: "Last Month", from: () => startOfMonth(addDays(startOfMonth(new Date()), -1)), to: () => endOfMonth(addDays(startOfMonth(new Date()), -1)) },
  { label: "This Year",  from: () => startOfYear(new Date()), to: () => endOfYear(new Date()) },
  { label: "Last Year",  from: () => startOfYear(addDays(startOfYear(new Date()), -1)), to: () => endOfYear(addDays(startOfYear(new Date()), -1)) },
];

// ── Component ─────────────────────────────────────────────────────────────────

export function DateRangePicker({ from, to, onChange }: Props) {
  const [open,  setOpen]  = useState(false);
  const [draft, setDraft] = useState<DateRange | undefined>(undefined);
  const ref = useRef<HTMLDivElement>(null);

  const hasRange  = !!from || !!to;
  const sameDay   = from && to && from === to;
  const label = hasRange
    ? from && to && !sameDay
      ? `${fmt(from)} — ${fmt(to)}`
      : from ? `From ${fmt(from)}` : `To ${fmt(to)}`
    : "DATE RANGE";

  useEffect(() => {
    if (open) {
      setDraft(from || to ? { from: toDate(from), to: toDate(to) } : undefined);
    }
  }, [open]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (!open) return;
    function handler(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  const applyPreset = useCallback(
    (preset: Preset) => {
      const f = toStr(preset.from());
      const t = toStr(preset.to());
      onChange(f, t);
      setOpen(false);
    },
    [onChange]
  );

  const handleSelect = useCallback(
    (range: DateRange | undefined) => {
      const f = toStr(range?.from);
      const t = toStr(range?.to);

      if (f && t && f === t) {
        // react-day-picker sets from === to on the first click.
        // Strip `to` so DayPicker stays in "pick end date" mode.
        setDraft({ from: range!.from, to: undefined });
      } else if (f && t && f !== t) {
        // Full range selected — write to parent and close.
        setDraft(range);
        onChange(f, t);
        setOpen(false);
      } else {
        setDraft(range);
      }
    },
    [onChange]
  );

  const handleClear = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      onChange("", "");
      setDraft(undefined);
      setOpen(false);
    },
    [onChange]
  );

  const currentYear = new Date().getFullYear();

  return (
    <div ref={ref} style={{ position: "relative" }}>
      {/* Trigger */}
      <button
        onClick={() => setOpen((o) => !o)}
        style={{
          height: "28px", padding: "0 10px",
          background: open ? "#1A1A1A" : "transparent",
          border: `1px solid ${hasRange ? "#484848" : open ? "#484848" : "#1E1E1E"}`,
          borderRadius: "2px",
          color: hasRange ? "#B0B0B0" : "#3A3A3A",
          fontFamily: "var(--font-plex)", fontSize: "10px", letterSpacing: "0.04em",
          cursor: "pointer", display: "flex", alignItems: "center", gap: "6px",
          whiteSpace: "nowrap", transition: "border-color 0.15s, color 0.15s",
          minWidth: "110px",
        }}
      >
        <svg width="11" height="11" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.4">
          <rect x="1" y="2" width="10" height="9" rx="1" />
          <line x1="1" y1="5" x2="11" y2="5" />
          <line x1="4" y1="1" x2="4" y2="3" />
          <line x1="8" y1="1" x2="8" y2="3" />
        </svg>
        {label}
        {hasRange && (
          <span onClick={handleClear} style={{ marginLeft: "2px", color: "#555", fontSize: "13px", lineHeight: 1, cursor: "pointer", padding: "0 2px" }}>×</span>
        )}
      </button>

      {/* Dropdown */}
      {open && (
        <div
          style={{
            position: "absolute", top: "calc(100% + 6px)", left: 0, zIndex: 100,
            background: "#111", border: "1px solid #1E1E1E", borderRadius: "4px",
            boxShadow: "0 12px 40px rgba(0,0,0,0.8)",

            "--rdp-accent-color":                      "#F5A623",
            "--rdp-accent-background-color":           "rgba(245,166,35,0.15)",
            "--rdp-day-height":                        "34px",
            "--rdp-day-width":                         "34px",
            "--rdp-day_button-height":                 "32px",
            "--rdp-day_button-width":                  "32px",
            "--rdp-day_button-border-radius":          "2px",
            "--rdp-selected-border":                   "2px solid #F5A623",
            "--rdp-range_start-color":                 "#0A0A0A",
            "--rdp-range_end-color":                   "#0A0A0A",
            "--rdp-range_start-date-background-color": "#F5A623",
            "--rdp-range_end-date-background-color":   "#F5A623",
            "--rdp-range_middle-background-color":     "rgba(245,166,35,0.12)",
            "--rdp-range_middle-color":                "#F0F0F0",
            "--rdp-today-color":                       "#F5A623",
            "--rdp-nav_button-height":                 "28px",
            "--rdp-nav_button-width":                  "28px",
          } as React.CSSProperties}
        >
          <style>{`
            .relay-rdp .rdp-root { color: #B0B0B0; background: transparent; font-family: var(--font-dm), sans-serif; font-size: 12px; }
            .relay-rdp .rdp-caption_label { color: #F0F0F0; font-family: var(--font-barlow); font-weight: 700; font-size: 13px; letter-spacing: 0.06em; }
            .relay-rdp .rdp-nav button { color: #555; background: transparent; border: 1px solid #1E1E1E; border-radius: 2px; }
            .relay-rdp .rdp-nav button:hover { border-color: #484848; color: #B0B0B0; }
            .relay-rdp .rdp-weekday { color: #3A3A3A; font-family: var(--font-plex); font-size: 9px; letter-spacing: 0.06em; }
            .relay-rdp .rdp-day_button { color: #777; }
            .relay-rdp .rdp-day_button:hover { background: #1A1A1A !important; color: #F0F0F0; }
            .relay-rdp .rdp-day--outside .rdp-day_button { color: #2E2E2E; }
            .relay-rdp .rdp-day--today .rdp-day_button { color: #F5A623; font-weight: 600; }
            .relay-rdp .rdp-day--selected .rdp-day_button,
            .relay-rdp .rdp-day--range_start .rdp-day_button,
            .relay-rdp .rdp-day--range_end .rdp-day_button { color: #0A0A0A; }
            /* Dropdown selects in caption */
            .relay-rdp select {
              background: #0D0D0D; border: 1px solid #252525; border-radius: 2px;
              color: #F0F0F0; font-family: var(--font-plex); font-size: 11px;
              padding: 2px 4px; cursor: pointer; outline: none;
            }
            .relay-rdp select:focus { border-color: #F5A623; }
          `}</style>

          {/* Preset chips */}
          <div style={{ padding: "10px 10px 0", display: "flex", flexWrap: "wrap", gap: "4px" }}>
            {PRESETS.map((p) => (
              <button
                key={p.label}
                onClick={() => applyPreset(p)}
                style={{
                  background: "transparent", border: "1px solid #1E1E1E",
                  borderRadius: "2px", color: "#555",
                  fontFamily: "var(--font-barlow)", fontWeight: 700,
                  fontSize: "9px", letterSpacing: "0.06em",
                  padding: "3px 8px", cursor: "pointer",
                  transition: "border-color 0.12s, color 0.12s",
                }}
                onMouseEnter={(e) => { e.currentTarget.style.borderColor = "#F5A623"; e.currentTarget.style.color = "#F5A623"; }}
                onMouseLeave={(e) => { e.currentTarget.style.borderColor = "#1E1E1E"; e.currentTarget.style.color = "#555"; }}
              >
                {p.label}
              </button>
            ))}
          </div>

          {/* Divider */}
          <div style={{ margin: "8px 10px 0", height: "1px", background: "#1A1A1A" }} />

          {/* FROM / TO indicator */}
          <DateSlots draft={draft} />

          {/* Calendar with month + year dropdowns */}
          <div className="relay-rdp" style={{ padding: "4px 6px 8px" }}>
            <DayPicker
              mode="range"
              selected={draft}
              onSelect={handleSelect}
              captionLayout="dropdown"
              startMonth={new Date(2020, 0, 1)}
              endMonth={new Date(currentYear + 1, 11, 31)}
            />
          </div>
        </div>
      )}
    </div>
  );
}
