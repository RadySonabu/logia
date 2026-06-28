"use client";

import { useState, useId } from "react";
import type { Client, Driver, Delivery } from "@/lib/types";

interface Props {
  clients:      Client[];
  drivers:      Driver[];
  vehicleTypes: string[];
  previewId:    string;
  onConfirm:    (payload: Omit<Delivery, "id" | "srNumber" | "createdAt" | "updatedAt">) => void;
  onClose:      () => void;
}

// ── Excel column order (from lib/exportExcel.ts) ──────────────────────────────
// [0]SR Number [1]Date [2]Status [3]Client [4]Customer Name [5]SR Problem Summary
// [6]Declared Quantity [7]Actual Quantity [8]Addr Line 1 [9]Addr Line 2
// [10]Proposed Pullout Schedule [11]Actual Date [12]Vehicle Type [13]Driver Name [14]Dispatch Notes

const HEADER_MAP: Record<string, number> = {
  "sr number": 0, "date": 1, "status": 2, "client": 3,
  "customer name": 4, "sr problem summary": 5,
  "declared quantity": 6, "actual quantity": 7,
  "contact address line 1": 8, "contact address line 2": 9,
  "proposed pullout schedule": 10, "actual date of pullout": 11,
  "vehicle type": 12, "driver name": 13, "dispatch notes": 14,
};

interface ParsedRow {
  date?:            string;
  clientName?:      string;
  customerName?:    string;
  srProblemSummary?: string;
  declaredQuantity?: string;
  addressLine1?:    string;
  addressLine2?:    string;
  schedule?:        string;
  vehicleType?:     string;
  driverName?:      string;
  dispatchNotes?:   string;
}

function parseExcelPaste(raw: string): ParsedRow | null {
  if (!raw.includes("\t")) return null;
  const lines = raw.trim().split(/\r?\n/).filter(Boolean);
  if (lines.length === 0) return null;

  let cols: string[];
  let indexMap: number[] | null = null;

  const firstLower = lines[0].toLowerCase();
  if (firstLower.includes("customer name") || firstLower.includes("sr number")) {
    const headers = lines[0].split("\t").map((h) => h.trim().toLowerCase());
    indexMap = headers.map((h) => HEADER_MAP[h] ?? -1);
    cols = (lines[1] ?? "").split("\t").map((c) => c.trim());
  } else {
    cols = lines[0].split("\t").map((c) => c.trim());
  }

  const get = (i: number) => {
    if (indexMap) { const ci = indexMap.findIndex((v) => v === i); return ci >= 0 ? (cols[ci] ?? "") : ""; }
    return cols[i] ?? "";
  };

  return {
    date:             get(1)  || undefined,
    clientName:       get(3)  || undefined,
    customerName:     get(4)  || undefined,
    srProblemSummary: get(5)  || undefined,
    declaredQuantity: get(6)  || undefined,
    addressLine1:     get(8)  || undefined,
    addressLine2:     get(9)  || undefined,
    schedule:         get(10) ? get(10).replace(" ", "T").slice(0, 16) : undefined,
    vehicleType:      get(12) || undefined,
    driverName:       get(13) || undefined,
    dispatchNotes:    get(14) || undefined,
  };
}

type Phase = "paste" | "preview" | "edit";

// ── Component ─────────────────────────────────────────────────────────────────

export function CreateDeliveryModal({ clients, drivers, vehicleTypes, previewId, onConfirm, onClose }: Props) {
  const uid   = useId();
  const today = new Date().toISOString().slice(0, 10);

  const [phase,            setPhase]            = useState<Phase>("paste");
  const [clientId,         setClientId]         = useState(clients[0]?.id ?? "");
  const [date,             setDate]             = useState(today);
  const [srProblemSummary, setSrProblemSummary] = useState("");
  const [declaredQuantity, setDeclaredQuantity] = useState("");
  const [customerName,     setCustomerName]     = useState("");
  const [addressLine1,     setAddressLine1]     = useState("");
  const [addressLine2,     setAddressLine2]     = useState("");
  const [schedule,         setSchedule]         = useState(`${today}T09:00`);
  const [vehicleType,      setVehicleType]      = useState("");
  const [driverId,         setDriverId]         = useState("");
  const [dispatchNotes,    setDispatchNotes]    = useState("");

  const canSubmit =
    customerName.trim().length > 0 &&
    addressLine1.trim().length > 0 &&
    srProblemSummary.trim().length > 0 &&
    declaredQuantity.trim().length > 0;

  function applyParsed(p: ParsedRow) {
    if (p.date)             setDate(p.date);
    if (p.customerName)     setCustomerName(p.customerName);
    if (p.srProblemSummary) setSrProblemSummary(p.srProblemSummary);
    if (p.declaredQuantity) setDeclaredQuantity(p.declaredQuantity);
    if (p.addressLine1)     setAddressLine1(p.addressLine1);
    if (p.addressLine2)     setAddressLine2(p.addressLine2);
    if (p.schedule)         setSchedule(p.schedule);
    if (p.dispatchNotes)    setDispatchNotes(p.dispatchNotes);

    if (p.clientName) {
      const found = clients.find((c) => c.name.toLowerCase() === p.clientName!.toLowerCase());
      if (found) setClientId(found.id);
    }
    if (p.vehicleType) {
      const found = vehicleTypes.find((v) => v.toLowerCase() === p.vehicleType!.toLowerCase());
      setVehicleType(found ?? p.vehicleType);
    }
    if (p.driverName) {
      const found = drivers.find((d) => d.name.toLowerCase() === p.driverName!.toLowerCase());
      if (found) setDriverId(found.id);
    }

    setPhase("preview");
  }

  function handlePaste(e: React.ClipboardEvent<HTMLTextAreaElement>) {
    e.preventDefault();
    const text = e.clipboardData.getData("text");
    const parsed = parseExcelPaste(text);
    if (parsed) applyParsed(parsed);
  }

  function handleSubmit() {
    if (!canSubmit) return;
    onConfirm({
      date, clientId,
      status: driverId ? "claimed" : "open",
      srProblemSummary: srProblemSummary.trim(),
      declaredQuantity: Number(declaredQuantity) || 0,
      customerName:     customerName.trim(),
      contactAddressLine1: addressLine1.trim(),
      contactAddressLine2: addressLine2.trim() || null,
      proposedPulloutSchedule: schedule,
      actualDateOfPullout: null,
      vehicleType: vehicleType || null,
      driverId: driverId || null,
      actualQuantity: null,
      dispatchNotes: dispatchNotes.trim() || null,
      issueReported: false,
      issueNote: null,
    });
  }

  const clientName = clients.find((c) => c.id === clientId)?.name ?? "—";
  const driverName = driverId ? (drivers.find((d) => d.id === driverId)?.name ?? "—") : "—";
  const scheduleDisplay = schedule ? schedule.replace("T", " ") : "—";

  return (
    <Backdrop onClose={onClose}>
      <div
        className="animate-modal-in"
        onClick={(e) => e.stopPropagation()}
        style={{
          width: "600px",
          maxHeight: "90vh",
          overflowY: "auto",
          background: "#141414",
          border: "1px solid #242424",
          borderRadius: "3px",
          boxShadow: "0 24px 90px rgba(0,0,0,0.95)",
        }}
      >
        {/* Header */}
        <div style={headerStyle}>
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <span style={headingStyle}>NEW SERVICE REQUEST</span>
            {phase !== "paste" && (
              <span style={{ fontFamily: "var(--font-plex)", fontSize: "9px", color: "#484848", letterSpacing: "0.08em", background: "#1A1A1A", padding: "2px 8px", borderRadius: "2px" }}>
                {phase === "preview" ? "REVIEW" : "EDITING"}
              </span>
            )}
          </div>
          <button onClick={onClose} style={closeBtn}>×</button>
        </div>

        {/* ── PHASE 1: PASTE ──────────────────────────────────────────────────── */}
        {phase === "paste" && (
          <div style={{ padding: "32px 24px 40px", display: "flex", flexDirection: "column", alignItems: "center", gap: "0" }}>
            {/* Paste box */}
            <div style={{
              width: "100%",
              border: "1px solid #252525",
              borderLeft: "3px solid #F5A623",
              borderRadius: "3px",
              background: "#0D0D0D",
              overflow: "hidden",
            }}>
              <div style={{ padding: "14px 18px 10px", display: "flex", alignItems: "center", gap: "10px" }}>
                <svg width="16" height="16" viewBox="0 0 18 18" fill="none" stroke="#F5A623" strokeWidth="1.6">
                  <rect x="4" y="1" width="10" height="3" rx="1" />
                  <rect x="1" y="3" width="16" height="13" rx="1.5" />
                  <line x1="5" y1="8"  x2="13" y2="8"  strokeLinecap="round" />
                  <line x1="5" y1="11" x2="11" y2="11" strokeLinecap="round" />
                </svg>
                <div>
                  <div style={{ fontFamily: "var(--font-barlow)", fontWeight: 900, fontSize: "13px", color: "#F5A623", letterSpacing: "0.08em" }}>
                    PASTE FROM EXCEL
                  </div>
                  <div style={{ fontFamily: "var(--font-dm)", fontSize: "11px", color: "#555", marginTop: "1px" }}>
                    Copy a row from the spreadsheet export, click below, then Ctrl+V / ⌘V
                  </div>
                </div>
              </div>
              <textarea
                placeholder="Click here and paste…"
                onPaste={handlePaste}
                readOnly
                onClick={(e) => (e.target as HTMLTextAreaElement).removeAttribute("readonly")}
                rows={3}
                style={{
                  width: "100%", background: "#111", border: "none",
                  borderTop: "1px solid #1A1A1A", padding: "10px 18px",
                  fontFamily: "var(--font-plex)", fontSize: "11px", color: "#484848",
                  resize: "none", outline: "none", boxSizing: "border-box",
                }}
              />
            </div>

            {/* Manual entry link */}
            <button
              onClick={() => setPhase("edit")}
              style={{
                marginTop: "16px",
                background: "none", border: "none",
                fontFamily: "var(--font-dm)", fontSize: "12px", color: "#484848",
                cursor: "pointer", padding: "4px 8px",
                textDecoration: "underline",
                textUnderlineOffset: "2px",
              }}
            >
              or fill in manually →
            </button>
          </div>
        )}

        {/* ── PHASE 2: PREVIEW (read-only) ────────────────────────────────────── */}
        {phase === "preview" && (
          <>
            <div style={{ padding: "20px 24px", display: "flex", flexDirection: "column", gap: "2px" }}>
              <KV label="SR Number"                value={previewId} accent />
              <KV label="Date"                     value={date} />
              <KV label="Client"                   value={clientName} />
              <KV label="Customer Name"            value={customerName} highlight={!customerName} />
              <KV label="SR Problem Summary"       value={srProblemSummary} wrap highlight={!srProblemSummary} />
              <KV label="Declared Quantity"        value={declaredQuantity || "—"} highlight={!declaredQuantity} />
              <KV label="Contact Address Line 1"   value={addressLine1} highlight={!addressLine1} />
              <KV label="Contact Address Line 2"   value={addressLine2 || "—"} />
              <KV label="Proposed Pullout Schedule" value={scheduleDisplay} />
              <KV label="Vehicle Type"             value={vehicleType || "—"} />
              <KV label="Driver"                   value={driverName} />
              <KV label="Dispatch Notes"           value={dispatchNotes || "—"} />
            </div>

            {/* Missing required fields warning */}
            {!canSubmit && (
              <div style={{ margin: "0 24px 16px", padding: "8px 12px", background: "rgba(245,166,35,0.06)", border: "1px solid rgba(245,166,35,0.2)", borderRadius: "2px" }}>
                <span style={{ fontFamily: "var(--font-plex)", fontSize: "10px", color: "#F5A623", letterSpacing: "0.06em" }}>
                  ⚠ Some required fields are empty — click Edit to fill them in
                </span>
              </div>
            )}

            <div style={{ ...footerStyle, justifyContent: "space-between" }}>
              <button
                onClick={() => setPhase("edit")}
                style={{ ...cancelBtn, color: "#B0B0B0", borderColor: "#484848" }}
              >
                ✎ EDIT
              </button>
              <button
                disabled={!canSubmit}
                onClick={handleSubmit}
                style={{
                  background: canSubmit ? "#F5A623" : "#252525",
                  border: "none",
                  color: canSubmit ? "#0A0A0A" : "#4A4A4A",
                  fontFamily: "var(--font-barlow)", fontWeight: 900,
                  fontSize: "11px", letterSpacing: "0.08em",
                  padding: "0 24px", height: "36px", borderRadius: "2px",
                  cursor: canSubmit ? "pointer" : "not-allowed",
                  transition: "background 0.15s, color 0.15s",
                }}
              >
                CREATE SR
              </button>
            </div>
          </>
        )}

        {/* ── PHASE 3: EDIT (full form) ────────────────────────────────────────── */}
        {phase === "edit" && (
          <>
            <div style={{ padding: "16px 20px 20px", display: "flex", flexDirection: "column", gap: "14px" }}>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "12px" }}>
                <Field label="SR NUMBER" htmlFor={`${uid}-sr`}>
                  <div style={{ ...inputStyle, color: "#555", userSelect: "none" as const }}>{previewId}</div>
                </Field>
                <Field label="DATE" htmlFor={`${uid}-date`} required>
                  <input id={`${uid}-date`} type="date" value={date} onChange={(e) => setDate(e.target.value)} style={{ ...inputStyle, color: "#F0F0F0" }} />
                </Field>
                <Field label="CLIENT" htmlFor={`${uid}-client`}>
                  <select id={`${uid}-client`} value={clientId} onChange={(e) => setClientId(e.target.value)} style={selectStyle}>
                    {clients.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </Field>
              </div>

              <Field label="SR PROBLEM SUMMARY" htmlFor={`${uid}-summary`} required>
                <textarea id={`${uid}-summary`} value={srProblemSummary} onChange={(e) => setSrProblemSummary(e.target.value)} placeholder="Describe the issue or reason for pullout…" style={{ ...inputStyle, height: "72px", resize: "none", paddingTop: "10px" }} />
              </Field>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 140px", gap: "12px" }}>
                <Field label="CUSTOMER NAME" htmlFor={`${uid}-customer`} required>
                  <input id={`${uid}-customer`} type="text" value={customerName} onChange={(e) => setCustomerName(e.target.value)} placeholder="Company or contact name" style={{ ...inputStyle, color: "#F0F0F0" }} />
                </Field>
                <Field label="DECLARED QUANTITY" htmlFor={`${uid}-qty`} required>
                  <input id={`${uid}-qty`} type="number" min="1" value={declaredQuantity} onChange={(e) => setDeclaredQuantity(e.target.value)} placeholder="0" style={{ ...inputStyle, color: "#F0F0F0" }} />
                </Field>
              </div>

              <Field label="CONTACT ADDRESS LINE 1" htmlFor={`${uid}-addr1`} required>
                <input id={`${uid}-addr1`} type="text" value={addressLine1} onChange={(e) => setAddressLine1(e.target.value)} placeholder="Street address" style={{ ...inputStyle, color: "#F0F0F0" }} />
              </Field>

              <Field label="CONTACT ADDRESS LINE 2" htmlFor={`${uid}-addr2`}>
                <input id={`${uid}-addr2`} type="text" value={addressLine2} onChange={(e) => setAddressLine2(e.target.value)} placeholder="City, State, ZIP" style={{ ...inputStyle, color: "#F0F0F0" }} />
              </Field>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                <Field label="PROPOSED PULLOUT SCHEDULE" htmlFor={`${uid}-schedule`} required>
                  <input id={`${uid}-schedule`} type="datetime-local" value={schedule} onChange={(e) => setSchedule(e.target.value)} style={{ ...inputStyle, color: "#F0F0F0" }} />
                </Field>
                <Field label="VEHICLE TYPE" htmlFor={`${uid}-vehicle`}>
                  <select id={`${uid}-vehicle`} value={vehicleType} onChange={(e) => setVehicleType(e.target.value)} style={selectStyle}>
                    <option value="">— Select —</option>
                    {vehicleTypes.map((v: string) => <option key={v} value={v}>{v}</option>)}
                  </select>
                </Field>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                <Field label="DRIVER NAME" htmlFor={`${uid}-driver`}>
                  <select id={`${uid}-driver`} value={driverId} onChange={(e) => setDriverId(e.target.value)} style={selectStyle}>
                    <option value="">No assignment</option>
                    {drivers.map((d) => <option key={d.id} value={d.id}>{d.name}</option>)}
                  </select>
                </Field>
                <Field label="DISPATCH NOTES" htmlFor={`${uid}-notes`}>
                  <input id={`${uid}-notes`} type="text" value={dispatchNotes} onChange={(e) => setDispatchNotes(e.target.value)} placeholder="Internal note…" style={{ ...inputStyle, color: "#F0F0F0" }} />
                </Field>
              </div>
            </div>

            <div style={footerStyle}>
              <button onClick={onClose} style={cancelBtn}>CANCEL</button>
              <button
                disabled={!canSubmit}
                onClick={handleSubmit}
                style={{
                  background: canSubmit ? "#F5A623" : "#252525",
                  border: "none",
                  color: canSubmit ? "#0A0A0A" : "#4A4A4A",
                  fontFamily: "var(--font-barlow)", fontWeight: 900,
                  fontSize: "11px", letterSpacing: "0.08em",
                  padding: "0 20px", height: "36px", borderRadius: "2px",
                  cursor: canSubmit ? "pointer" : "not-allowed",
                  transition: "background 0.15s, color 0.15s",
                }}
              >
                CREATE SR
              </button>
            </div>
          </>
        )}
      </div>
    </Backdrop>
  );
}

// ── Sub-components ────────────────────────────────────────────────────────────

function KV({ label, value, accent, highlight, wrap }: { label: string; value: string; accent?: boolean; highlight?: boolean; wrap?: boolean }) {
  return (
    <div style={{
      display: "grid",
      gridTemplateColumns: "180px 1fr",
      gap: "12px",
      padding: "7px 0",
      borderBottom: "1px solid #1A1A1A",
      alignItems: wrap ? "flex-start" : "center",
    }}>
      <span style={{ fontFamily: "var(--font-plex)", fontSize: "9px", color: "#2E2E2E", letterSpacing: "0.08em", textTransform: "uppercase" }}>
        {label}
      </span>
      <span style={{
        fontFamily: "var(--font-dm)",
        fontSize: "13px",
        color: accent ? "#F5A623" : highlight ? "#484848" : "#B0B0B0",
        lineHeight: wrap ? 1.5 : undefined,
        fontStyle: highlight ? "italic" : undefined,
      }}>
        {value || "—"}
      </span>
    </div>
  );
}

function Field({ label, htmlFor, required, children }: { label: string; htmlFor: string; required?: boolean; children: React.ReactNode }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "5px" }}>
      <label htmlFor={htmlFor} style={{ fontFamily: "var(--font-plex)", fontSize: "9px", color: "#484848", letterSpacing: "0.08em", textTransform: "uppercase" }}>
        {label}{required && <span style={{ color: "#F5A623", marginLeft: "3px" }}>*</span>}
      </label>
      {children}
    </div>
  );
}

function Backdrop({ children, onClose }: { children: React.ReactNode; onClose: () => void }) {
  return (
    <div onClick={onClose} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.7)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 50 }}>
      {children}
    </div>
  );
}

const inputStyle: React.CSSProperties = {
  background: "#0D0D0D", border: "1px solid #252525", borderRadius: "2px",
  height: "38px", padding: "0 10px",
  fontFamily: "var(--font-dm)", fontSize: "13px", color: "#F0F0F0",
  outline: "none", width: "100%",
};
const selectStyle: React.CSSProperties = { ...inputStyle, cursor: "pointer", appearance: "none" };
const headerStyle: React.CSSProperties = { padding: "18px 20px 14px", borderBottom: "1px solid #1E1E1E", display: "flex", alignItems: "center", justifyContent: "space-between" };
const headingStyle: React.CSSProperties = { fontFamily: "var(--font-barlow)", fontWeight: 900, fontSize: "15px", letterSpacing: "0.08em", color: "#F0F0F0" };
const closeBtn: React.CSSProperties = { background: "none", border: "none", color: "#555", cursor: "pointer", fontSize: "18px", lineHeight: "1", padding: "2px 4px" };
const footerStyle: React.CSSProperties = { padding: "12px 20px 18px", borderTop: "1px solid #1E1E1E", display: "flex", justifyContent: "flex-end", gap: "8px" };
const cancelBtn: React.CSSProperties = { background: "transparent", border: "1px solid #282828", color: "#555", fontFamily: "var(--font-barlow)", fontWeight: 700, fontSize: "11px", letterSpacing: "0.06em", padding: "0 16px", height: "36px", borderRadius: "2px", cursor: "pointer" };
