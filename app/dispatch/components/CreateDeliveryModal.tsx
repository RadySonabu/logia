"use client";

import { useState, useId } from "react";
import type { Client, Driver, Delivery } from "@/lib/types";
import { nextOrderId } from "@/lib/data";

interface Props {
  clients: Client[];
  drivers: Driver[];
  previewId: string;
  onConfirm: (payload: Omit<Delivery, "id" | "createdAt" | "updatedAt">) => void;
  onClose: () => void;
}

export function CreateDeliveryModal({
  clients,
  drivers,
  previewId,
  onConfirm,
  onClose,
}: Props) {
  const uid = useId();
  const [clientId, setClientId] = useState(clients[0]?.id ?? "");
  const [address, setAddress] = useState("");
  const [windowStart, setWindowStart] = useState("09:00");
  const [windowEnd, setWindowEnd] = useState("11:00");
  const [dispatchNotes, setDispatchNotes] = useState("");
  const [driverId, setDriverId] = useState("");

  const canSubmit = address.trim().length > 0;

  function handleSubmit() {
    if (!canSubmit) return;
    onConfirm({
      clientId,
      status: driverId ? "claimed" : "open",
      address: address.trim(),
      timeWindowStart: windowStart,
      timeWindowEnd: windowEnd,
      driverId: driverId || null,
      contactName: null,
      contactPhone: null,
      deliveryNotes: null,
      dispatchNotes: dispatchNotes.trim() || null,
      lat: null,
      lng: null,
    });
  }

  return (
    <Backdrop onClose={onClose}>
      <div
        className="animate-modal-in"
        style={{
          width: "540px",
          background: "#141414",
          border: "1px solid #242424",
          borderRadius: "3px",
          boxShadow: "0 24px 90px rgba(0,0,0,0.95)",
          overflow: "hidden",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div
          style={{
            padding: "18px 20px 14px",
            borderBottom: "1px solid #1E1E1E",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <span
            style={{
              fontFamily: "var(--font-barlow)",
              fontWeight: 900,
              fontSize: "15px",
              letterSpacing: "0.08em",
              color: "#F0F0F0",
            }}
          >
            NEW DELIVERY
          </span>
          <button
            onClick={onClose}
            style={{
              background: "none",
              border: "none",
              color: "#555",
              cursor: "pointer",
              fontSize: "18px",
              lineHeight: 1,
              padding: "2px 4px",
            }}
          >
            ×
          </button>
        </div>

        {/* Form */}
        <div style={{ padding: "20px", display: "flex", flexDirection: "column", gap: "14px" }}>
          {/* Row: Client + Order ID */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
            <Field label="CLIENT" htmlFor={`${uid}-client`}>
              <select
                id={`${uid}-client`}
                value={clientId}
                onChange={(e) => setClientId(e.target.value)}
                style={selectStyle}
              >
                {clients.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="ORDER ID" htmlFor={`${uid}-orderid`}>
              <div style={{ ...inputStyle, color: "#555", userSelect: "none" as const }}>
                {previewId}
              </div>
            </Field>
          </div>

          {/* Address */}
          <Field label="DELIVERY ADDRESS" htmlFor={`${uid}-address`} required>
            <input
              id={`${uid}-address`}
              type="text"
              placeholder="Street address..."
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              style={{ ...inputStyle, color: "#F0F0F0" }}
            />
          </Field>

          {/* Time window */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
            <Field label="TIME WINDOW FROM" htmlFor={`${uid}-wstart`}>
              <input
                id={`${uid}-wstart`}
                type="time"
                value={windowStart}
                onChange={(e) => setWindowStart(e.target.value)}
                style={{ ...inputStyle, color: "#F0F0F0" }}
              />
            </Field>
            <Field label="TIME WINDOW TO" htmlFor={`${uid}-wend`}>
              <input
                id={`${uid}-wend`}
                type="time"
                value={windowEnd}
                onChange={(e) => setWindowEnd(e.target.value)}
                style={{ ...inputStyle, color: "#F0F0F0" }}
              />
            </Field>
          </div>

          {/* Dispatch notes */}
          <Field label="DISPATCH NOTES" htmlFor={`${uid}-notes`}>
            <textarea
              id={`${uid}-notes`}
              value={dispatchNotes}
              onChange={(e) => setDispatchNotes(e.target.value)}
              placeholder="Internal notes for dispatcher..."
              style={{
                ...inputStyle,
                height: "78px",
                resize: "none",
                color: "#F0F0F0",
                paddingTop: "10px",
              }}
            />
          </Field>

          {/* Assign driver */}
          <Field label="ASSIGN DRIVER" htmlFor={`${uid}-driver`}>
            <select
              id={`${uid}-driver`}
              value={driverId}
              onChange={(e) => setDriverId(e.target.value)}
              style={selectStyle}
            >
              <option value="">No assignment</option>
              {drivers.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.name}
                </option>
              ))}
            </select>
          </Field>
        </div>

        {/* Footer */}
        <div
          style={{
            padding: "12px 20px 18px",
            borderTop: "1px solid #1E1E1E",
            display: "flex",
            justifyContent: "flex-end",
            gap: "8px",
          }}
        >
          <button
            onClick={onClose}
            style={{
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
            }}
          >
            CANCEL
          </button>
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
            CREATE DELIVERY
          </button>
        </div>
      </div>
    </Backdrop>
  );
}

function Field({
  label,
  htmlFor,
  required,
  children,
}: {
  label: string;
  htmlFor: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "5px" }}>
      <label
        htmlFor={htmlFor}
        style={{
          fontFamily: "var(--font-plex)",
          fontSize: "9px",
          fontWeight: 400,
          color: "#484848",
          letterSpacing: "0.08em",
          textTransform: "uppercase",
        }}
      >
        {label}
        {required && (
          <span style={{ color: "#F5A623", marginLeft: "3px" }}>*</span>
        )}
      </label>
      {children}
    </div>
  );
}

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

const selectStyle: React.CSSProperties = {
  ...inputStyle,
  cursor: "pointer",
  appearance: "none",
};

function Backdrop({
  children,
  onClose,
}: {
  children: React.ReactNode;
  onClose: () => void;
}) {
  return (
    <div
      onClick={onClose}
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,0.7)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 50,
      }}
    >
      {children}
    </div>
  );
}
