"use client";

import { useState } from "react";
import type { Delivery } from "@/lib/types";

interface Props {
  delivery: Delivery;
  onSave: (patch: Partial<Delivery>) => void;
}

export function EditDetailsPanel({ delivery, onSave }: Props) {
  const [open, setOpen] = useState(false);
  const [contactName, setContactName] = useState(delivery.contactName ?? "");
  const [contactPhone, setContactPhone] = useState(delivery.contactPhone ?? "");
  const [deliveryNotes, setDeliveryNotes] = useState(delivery.deliveryNotes ?? "");

  function handleSave() {
    onSave({
      contactName: contactName.trim() || null,
      contactPhone: contactPhone.trim() || null,
      deliveryNotes: deliveryNotes.trim() || null,
    });
    setOpen(false);
  }

  return (
    <div>
      {/* Toggle button */}
      <button
        onClick={() => setOpen((o) => !o)}
        style={{
          width: "100%",
          height: "44px",
          background: "transparent",
          border: "1px solid #1E1E1E",
          borderRadius: "6px",
          color: "#777",
          fontFamily: "var(--font-barlow)",
          fontWeight: 700,
          fontSize: "13px",
          letterSpacing: "0.06em",
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: "8px",
        }}
      >
        <span style={{ fontSize: "15px" }}>✎</span>
        EDIT DETAILS
      </button>

      {/* Panel */}
      {open && (
        <div
          className="animate-slide-up"
          style={{
            marginTop: "8px",
            background: "#0D0D0D",
            border: "1px solid #1E1E1E",
            borderRadius: "6px",
            padding: "16px",
            display: "flex",
            flexDirection: "column",
            gap: "12px",
          }}
        >
          <InputField
            label="Contact Name"
            type="text"
            value={contactName}
            onChange={setContactName}
            placeholder="Jane Smith"
          />
          <InputField
            label="Contact Phone"
            type="tel"
            value={contactPhone}
            onChange={setContactPhone}
            placeholder="+1 206 555 0100"
          />
          <div style={{ display: "flex", flexDirection: "column", gap: "5px" }}>
            <label
              style={{
                fontFamily: "var(--font-plex)",
                fontSize: "10px",
                color: "#484848",
                letterSpacing: "0.06em",
              }}
            >
              Delivery Notes
            </label>
            <textarea
              value={deliveryNotes}
              onChange={(e) => setDeliveryNotes(e.target.value)}
              placeholder="Leave at door..."
              style={{
                ...driverInputStyle,
                height: "84px",
                resize: "none",
                paddingTop: "12px",
              }}
            />
          </div>

          <button
            onClick={handleSave}
            style={{
              width: "100%",
              height: "50px",
              background: "#F0F0F0",
              color: "#0A0A0A",
              border: "none",
              borderRadius: "6px",
              fontFamily: "var(--font-barlow)",
              fontWeight: 900,
              fontSize: "15px",
              letterSpacing: "0.06em",
              cursor: "pointer",
            }}
          >
            SAVE DETAILS
          </button>
        </div>
      )}
    </div>
  );
}

function InputField({
  label,
  type,
  value,
  onChange,
  placeholder,
}: {
  label: string;
  type: string;
  value: string;
  onChange: (v: string) => void;
  placeholder: string;
}) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "5px" }}>
      <label
        style={{
          fontFamily: "var(--font-plex)",
          fontSize: "10px",
          color: "#484848",
          letterSpacing: "0.06em",
        }}
      >
        {label}
      </label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        style={driverInputStyle}
      />
    </div>
  );
}

const driverInputStyle: React.CSSProperties = {
  background: "#111",
  border: "1px solid #1E1E1E",
  borderRadius: "6px",
  height: "48px",
  padding: "0 14px",
  fontFamily: "var(--font-dm)",
  fontSize: "16px",
  color: "#F0F0F0",
  outline: "none",
  width: "100%",
};
