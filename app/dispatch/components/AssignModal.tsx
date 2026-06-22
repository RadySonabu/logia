"use client";

import { useState } from "react";
import type { Delivery, Client, Driver } from "@/lib/types";

interface Props {
  delivery: Delivery;
  client: Client | undefined;
  drivers: Driver[];
  onConfirm: (driverId: string) => void;
  onClose: () => void;
}

export function AssignModal({ delivery, client, drivers, onConfirm, onClose }: Props) {
  const [selected, setSelected] = useState<string | null>(delivery.driverId);

  return (
    <Backdrop onClose={onClose}>
      <div
        className="animate-modal-in"
        style={{
          width: "460px",
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
            ASSIGN DRIVER
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

        {/* Delivery info strip */}
        <div
          style={{
            padding: "12px 20px",
            background: "#0D0D0D",
            borderBottom: "1px solid #1E1E1E",
          }}
        >
          <div
            style={{
              fontFamily: "var(--font-plex)",
              fontSize: "10px",
              color: "#F5A623",
              marginBottom: "4px",
            }}
          >
            {delivery.id} · {client?.name ?? "—"}
          </div>
          <div
            style={{
              fontFamily: "var(--font-dm)",
              fontSize: "13px",
              color: "#B0B0B0",
              marginBottom: "2px",
            }}
          >
            {delivery.address}
          </div>
          <div
            style={{
              fontFamily: "var(--font-plex)",
              fontSize: "11px",
              color: "#484848",
            }}
          >
            {delivery.timeWindowStart}–{delivery.timeWindowEnd}
          </div>
        </div>

        {/* Driver list */}
        <div style={{ padding: "12px 20px", display: "flex", flexDirection: "column", gap: "6px" }}>
          {drivers.map((driver) => {
            const isSelected = selected === driver.id;
            return (
              <button
                key={driver.id}
                onClick={() => setSelected(driver.id)}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "12px",
                  padding: "10px 14px",
                  borderRadius: "2px",
                  border: `1px solid ${isSelected ? "#F5A623" : "#1E1E1E"}`,
                  background: isSelected ? "rgba(245,166,35,0.06)" : "transparent",
                  cursor: "pointer",
                  textAlign: "left",
                  transition: "border-color 0.15s, background 0.15s",
                }}
              >
                {/* Avatar circle */}
                <div
                  style={{
                    width: "30px",
                    height: "30px",
                    borderRadius: "50%",
                    background: "#1E1E1E",
                    border: `1px solid ${isSelected ? "#F5A623" : "#2E2E2E"}`,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontFamily: "var(--font-barlow)",
                    fontWeight: 700,
                    fontSize: "12px",
                    color: isSelected ? "#F5A623" : "#555",
                    flexShrink: 0,
                  }}
                >
                  {driver.name[0]}
                </div>
                <div>
                  <div
                    style={{
                      fontFamily: "var(--font-dm)",
                      fontWeight: 600,
                      fontSize: "13px",
                      color: isSelected ? "#F0F0F0" : "#B0B0B0",
                    }}
                  >
                    {driver.name}
                  </div>
                  <div
                    style={{
                      fontFamily: "var(--font-plex)",
                      fontSize: "10px",
                      color: "#484848",
                    }}
                  >
                    {driver.vehicle}
                  </div>
                </div>
              </button>
            );
          })}
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
              height: "32px",
              borderRadius: "2px",
              cursor: "pointer",
            }}
          >
            CANCEL
          </button>
          <button
            disabled={!selected}
            onClick={() => selected && onConfirm(selected)}
            style={{
              background: selected ? "#F5A623" : "#1E1E1E",
              border: "none",
              color: selected ? "#0A0A0A" : "#3A3A3A",
              fontFamily: "var(--font-barlow)",
              fontWeight: 900,
              fontSize: "11px",
              letterSpacing: "0.08em",
              padding: "0 16px",
              height: "32px",
              borderRadius: "2px",
              cursor: selected ? "pointer" : "not-allowed",
              transition: "background 0.15s, color 0.15s",
            }}
          >
            CONFIRM ASSIGNMENT
          </button>
        </div>
      </div>
    </Backdrop>
  );
}

function Backdrop({ children, onClose }: { children: React.ReactNode; onClose: () => void }) {
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
