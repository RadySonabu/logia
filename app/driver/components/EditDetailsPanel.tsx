"use client";

import { useState } from "react";
import type { Delivery } from "@/lib/types";

interface Props {
  delivery: Delivery;
  onSave:   (patch: Partial<Delivery>) => void;
}

export function EditDetailsPanel({ delivery, onSave }: Props) {
  const [open,              setOpen]              = useState(false);
  const [actualDate,        setActualDate]        = useState(delivery.actualDateOfPullout ?? "");
  const [actualQty,         setActualQty]         = useState(delivery.actualQuantity != null ? String(delivery.actualQuantity) : "");

  function handleSave() {
    onSave({
      actualDateOfPullout: actualDate || null,
      actualQuantity:      actualQty ? Number(actualQty) : null,
    });
    setOpen(false);
  }

  return (
    <div>
      {/* Toggle */}
      <button
        onClick={() => setOpen((o) => !o)}
        style={{
          width: "100%", height: "44px",
          background: "transparent", border: "1px solid #1E1E1E", borderRadius: "6px",
          color: "#777", fontFamily: "var(--font-barlow)", fontWeight: 700, fontSize: "13px",
          letterSpacing: "0.06em", cursor: "pointer",
          display: "flex", alignItems: "center", justifyContent: "center", gap: "8px",
        }}
      >
        <span style={{ fontSize: "15px" }}>✎</span>
        RECORD PULLOUT DETAILS
      </button>

      {/* Expandable panel */}
      {open && (
        <div
          className="animate-slide-up"
          style={{
            marginTop: "8px", background: "#0D0D0D",
            border: "1px solid #1E1E1E", borderRadius: "6px",
            padding: "16px", display: "flex", flexDirection: "column", gap: "12px",
          }}
        >
          {/* Read-only SR summary */}
          <div style={{ padding: "10px 12px", background: "#111", border: "1px solid #1A1A1A", borderRadius: "4px" }}>
            <div style={{ fontFamily: "var(--font-plex)", fontSize: "9px", color: "#2E2E2E", letterSpacing: "0.08em", marginBottom: "4px" }}>
              DECLARED QUANTITY
            </div>
            <div style={{ fontFamily: "var(--font-plex)", fontSize: "14px", color: "#555" }}>
              {delivery.declaredQuantity} units
            </div>
          </div>

          <DriverInput
            label="Actual Date of Pullout"
            type="date"
            value={actualDate}
            onChange={setActualDate}
            placeholder="YYYY-MM-DD"
          />

          <DriverInput
            label="Actual Quantity"
            type="number"
            value={actualQty}
            onChange={setActualQty}
            placeholder="0"
          />

          <button
            onClick={handleSave}
            style={{
              width: "100%", height: "50px",
              background: "#F0F0F0", color: "#0A0A0A", border: "none", borderRadius: "6px",
              fontFamily: "var(--font-barlow)", fontWeight: 900, fontSize: "15px",
              letterSpacing: "0.06em", cursor: "pointer",
            }}
          >
            SAVE PULLOUT DETAILS
          </button>
        </div>
      )}
    </div>
  );
}

function DriverInput({ label, type, value, onChange, placeholder }: {
  label: string; type: string; value: string;
  onChange: (v: string) => void; placeholder: string;
}) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "5px" }}>
      <label style={{ fontFamily: "var(--font-plex)", fontSize: "10px", color: "#484848", letterSpacing: "0.06em" }}>
        {label}
      </label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        style={{
          background: "#111", border: "1px solid #1E1E1E", borderRadius: "6px",
          height: "48px", padding: "0 14px",
          fontFamily: "var(--font-dm)", fontSize: "16px", color: "#F0F0F0",
          outline: "none", width: "100%",
        }}
      />
    </div>
  );
}
