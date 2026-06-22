"use client";

import { useState, useId } from "react";
import type { Client, Driver, Delivery } from "@/lib/types";
interface Props {
  clients:      Client[];
  drivers:      Driver[];
  vehicleTypes: string[];
  previewId:    string;
  onConfirm:    (payload: Omit<Delivery, "id" | "createdAt" | "updatedAt">) => void;
  onClose:      () => void;
}

export function CreateDeliveryModal({ clients, drivers, vehicleTypes, previewId, onConfirm, onClose }: Props) {
  const uid = useId();
  const today = new Date().toISOString().slice(0, 10);
  const defaultSchedule = `${today}T09:00`;

  const [clientId,          setClientId]          = useState(clients[0]?.id ?? "");
  const [date,              setDate]              = useState(today);
  const [srProblemSummary,  setSrProblemSummary]  = useState("");
  const [declaredQuantity,  setDeclaredQuantity]  = useState("");
  const [customerName,      setCustomerName]      = useState("");
  const [addressLine1,      setAddressLine1]      = useState("");
  const [addressLine2,      setAddressLine2]      = useState("");
  const [schedule,          setSchedule]          = useState(defaultSchedule);
  const [vehicleType,       setVehicleType]       = useState("");
  const [driverId,          setDriverId]          = useState("");
  const [dispatchNotes,     setDispatchNotes]     = useState("");
  const [actualDate,        setActualDate]        = useState("");
  const [actualQuantity,    setActualQuantity]    = useState("");

  const canSubmit =
    customerName.trim().length > 0 &&
    addressLine1.trim().length > 0 &&
    srProblemSummary.trim().length > 0 &&
    declaredQuantity.trim().length > 0;

  function handleSubmit() {
    if (!canSubmit) return;
    onConfirm({
      date,
      clientId,
      status: driverId ? "claimed" : "open",
      srProblemSummary: srProblemSummary.trim(),
      declaredQuantity: Number(declaredQuantity) || 0,
      customerName:     customerName.trim(),
      contactAddressLine1: addressLine1.trim(),
      contactAddressLine2: addressLine2.trim() || null,
      proposedPulloutSchedule: schedule,
      actualDateOfPullout: actualDate.trim() || null,
      vehicleType: vehicleType || null,
      driverId: driverId || null,
      actualQuantity: actualQuantity ? Number(actualQuantity) : null,
      dispatchNotes: dispatchNotes.trim() || null,
    });
  }

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
          <span style={headingStyle}>NEW SERVICE REQUEST</span>
          <button onClick={onClose} style={closeBtn}>×</button>
        </div>

        {/* Form */}
        <div style={{ padding: "20px", display: "flex", flexDirection: "column", gap: "14px" }}>

          {/* Row 1: SR Number + Date + Client */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "12px" }}>
            <Field label="SR NUMBER" htmlFor={`${uid}-sr`}>
              <div style={{ ...inputStyle, color: "#555", userSelect: "none" as const }}>
                {previewId}
              </div>
            </Field>
            <Field label="DATE" htmlFor={`${uid}-date`} required>
              <input
                id={`${uid}-date`}
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                style={{ ...inputStyle, color: "#F0F0F0" }}
              />
            </Field>
            <Field label="CLIENT" htmlFor={`${uid}-client`}>
              <select
                id={`${uid}-client`}
                value={clientId}
                onChange={(e) => setClientId(e.target.value)}
                style={selectStyle}
              >
                {clients.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </Field>
          </div>

          {/* SR Problem Summary */}
          <Field label="SR PROBLEM SUMMARY" htmlFor={`${uid}-summary`} required>
            <textarea
              id={`${uid}-summary`}
              value={srProblemSummary}
              onChange={(e) => setSrProblemSummary(e.target.value)}
              placeholder="Describe the issue or reason for pullout…"
              style={{ ...inputStyle, height: "72px", resize: "none", paddingTop: "10px" }}
            />
          </Field>

          {/* Row 2: Customer Name + Declared Qty */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 140px", gap: "12px" }}>
            <Field label="CUSTOMER NAME" htmlFor={`${uid}-customer`} required>
              <input
                id={`${uid}-customer`}
                type="text"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                placeholder="Company or contact name"
                style={{ ...inputStyle, color: "#F0F0F0" }}
              />
            </Field>
            <Field label="DECLARED QUANTITY" htmlFor={`${uid}-qty`} required>
              <input
                id={`${uid}-qty`}
                type="number"
                min="1"
                value={declaredQuantity}
                onChange={(e) => setDeclaredQuantity(e.target.value)}
                placeholder="0"
                style={{ ...inputStyle, color: "#F0F0F0" }}
              />
            </Field>
          </div>

          {/* Address Line 1 */}
          <Field label="CONTACT ADDRESS LINE 1" htmlFor={`${uid}-addr1`} required>
            <input
              id={`${uid}-addr1`}
              type="text"
              value={addressLine1}
              onChange={(e) => setAddressLine1(e.target.value)}
              placeholder="Street address"
              style={{ ...inputStyle, color: "#F0F0F0" }}
            />
          </Field>

          {/* Address Line 2 */}
          <Field label="CONTACT ADDRESS LINE 2" htmlFor={`${uid}-addr2`}>
            <input
              id={`${uid}-addr2`}
              type="text"
              value={addressLine2}
              onChange={(e) => setAddressLine2(e.target.value)}
              placeholder="City, State, ZIP"
              style={{ ...inputStyle, color: "#F0F0F0" }}
            />
          </Field>

          {/* Row 3: Schedule + Vehicle Type */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
            <Field label="PROPOSED PULLOUT SCHEDULE" htmlFor={`${uid}-schedule`} required>
              <input
                id={`${uid}-schedule`}
                type="datetime-local"
                value={schedule}
                onChange={(e) => setSchedule(e.target.value)}
                style={{ ...inputStyle, color: "#F0F0F0" }}
              />
            </Field>
            <Field label="VEHICLE TYPE" htmlFor={`${uid}-vehicle`}>
              <select
                id={`${uid}-vehicle`}
                value={vehicleType}
                onChange={(e) => setVehicleType(e.target.value)}
                style={selectStyle}
              >
                <option value="">— Select —</option>
                {vehicleTypes.map((v: string) => (
                  <option key={v} value={v}>{v}</option>
                ))}
              </select>
            </Field>
          </div>

          {/* Row 4: Driver + Dispatch Notes */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
            <Field label="DRIVER NAME" htmlFor={`${uid}-driver`}>
              <select
                id={`${uid}-driver`}
                value={driverId}
                onChange={(e) => setDriverId(e.target.value)}
                style={selectStyle}
              >
                <option value="">No assignment</option>
                {drivers.map((d) => (
                  <option key={d.id} value={d.id}>{d.name}</option>
                ))}
              </select>
            </Field>
            <Field label="DISPATCH NOTES" htmlFor={`${uid}-notes`}>
              <input
                id={`${uid}-notes`}
                type="text"
                value={dispatchNotes}
                onChange={(e) => setDispatchNotes(e.target.value)}
                placeholder="Internal note…"
                style={{ ...inputStyle, color: "#F0F0F0" }}
              />
            </Field>
          </div>

          {/* Row 5: Actual Date of Pullout + Actual Quantity (optional — for recording completed pullouts) */}
          <div style={{ borderTop: "1px solid #1E1E1E", paddingTop: "14px" }}>
            <p style={{ fontFamily: "var(--font-plex)", fontSize: "9px", color: "#2E2E2E", letterSpacing: "0.08em", marginBottom: "12px" }}>
              PULLOUT RESULTS — optional, fill after completion
            </p>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
              <Field label="ACTUAL DATE OF PULLOUT" htmlFor={`${uid}-actual-date`}>
                <input
                  id={`${uid}-actual-date`}
                  type="date"
                  value={actualDate}
                  onChange={(e) => setActualDate(e.target.value)}
                  style={{ ...inputStyle, color: "#F0F0F0" }}
                />
              </Field>
              <Field label="ACTUAL QUANTITY" htmlFor={`${uid}-actual-qty`}>
                <input
                  id={`${uid}-actual-qty`}
                  type="number"
                  min="0"
                  value={actualQuantity}
                  onChange={(e) => setActualQuantity(e.target.value)}
                  placeholder="0"
                  style={{ ...inputStyle, color: "#F0F0F0" }}
                />
              </Field>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div style={footerStyle}>
          <button onClick={onClose} style={cancelBtn}>CANCEL</button>
          <button
            disabled={!canSubmit}
            onClick={handleSubmit}
            style={{
              background: canSubmit ? "#F5A623" : "#252525",
              border: "none",
              color: canSubmit ? "#0A0A0A" : "#4A4A4A",
              fontFamily: "var(--font-barlow)",
              fontWeight: 900,
              fontSize: "11px",
              letterSpacing: "0.08em",
              padding: "0 20px",
              height: "36px",
              borderRadius: "2px",
              cursor: canSubmit ? "pointer" : "not-allowed",
              transition: "background 0.15s, color 0.15s",
            }}
          >
            CREATE SR
          </button>
        </div>
      </div>
    </Backdrop>
  );
}

// ── Shared sub-components ────────────────────────────────────────────────────

function Field({
  label, htmlFor, required, children,
}: {
  label: string; htmlFor: string; required?: boolean; children: React.ReactNode;
}) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "5px" }}>
      <label
        htmlFor={htmlFor}
        style={{
          fontFamily: "var(--font-plex)",
          fontSize: "9px",
          color: "#484848",
          letterSpacing: "0.08em",
          textTransform: "uppercase",
        }}
      >
        {label}
        {required && <span style={{ color: "#F5A623", marginLeft: "3px" }}>*</span>}
      </label>
      {children}
    </div>
  );
}

function Backdrop({ children, onClose }: { children: React.ReactNode; onClose: () => void }) {
  return (
    <div
      onClick={onClose}
      style={{
        position: "fixed", inset: 0,
        background: "rgba(0,0,0,0.7)",
        display: "flex", alignItems: "center", justifyContent: "center",
        zIndex: 50,
      }}
    >
      {children}
    </div>
  );
}

// ── Styles ───────────────────────────────────────────────────────────────────

const inputStyle: React.CSSProperties = {
  background: "#0D0D0D",
  border: "1px solid #252525",
  borderRadius: "2px",
  height: "38px",
  padding: "0 10px",
  fontFamily: "var(--font-dm)",
  fontSize: "13px",
  color: "#F0F0F0",
  outline: "none",
  width: "100%",
};

const selectStyle: React.CSSProperties = { ...inputStyle, cursor: "pointer", appearance: "none" };

const headerStyle: React.CSSProperties = {
  padding: "18px 20px 14px",
  borderBottom: "1px solid #1E1E1E",
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
};

const headingStyle: React.CSSProperties = {
  fontFamily: "var(--font-barlow)",
  fontWeight: 900,
  fontSize: "15px",
  letterSpacing: "0.08em",
  color: "#F0F0F0",
};

const closeBtn: React.CSSProperties = {
  background: "none", border: "none", color: "#555",
  cursor: "pointer", fontSize: "18px", lineHeight: "1", padding: "2px 4px",
};

const footerStyle: React.CSSProperties = {
  padding: "12px 20px 18px",
  borderTop: "1px solid #1E1E1E",
  display: "flex",
  justifyContent: "flex-end",
  gap: "8px",
};

const cancelBtn: React.CSSProperties = {
  background: "transparent",
  border: "1px solid #282828",
  color: "#555",
  fontFamily: "var(--font-barlow)",
  fontWeight: 700,
  fontSize: "11px",
  letterSpacing: "0.06em",
  padding: "0 16px",
  height: "36px",
  borderRadius: "2px",
  cursor: "pointer",
};
