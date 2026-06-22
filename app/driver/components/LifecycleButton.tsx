"use client";

import type { DeliveryStatus } from "@/lib/types";

const LIFECYCLE: Record<
  DeliveryStatus,
  { label: string; color: string; textColor: string } | null
> = {
  open: null,
  claimed:   { label: "CONFIRM PICKUP",  color: "#60A5FA", textColor: "#0A0A0A" },
  picked_up: { label: "MARK DELIVERED",  color: "#34D399", textColor: "#0A0A0A" },
  delivered: { label: "COMPLETE JOB",    color: "#4ADE80", textColor: "#0A0A0A" },
  completed: null,
};

interface Props {
  status: DeliveryStatus;
  onAdvance: () => void;
}

export function LifecycleButton({ status, onAdvance }: Props) {
  const cfg = LIFECYCLE[status];
  if (!cfg) return null;

  return (
    <button
      onClick={onAdvance}
      style={{
        width: "100%",
        height: "68px",
        borderRadius: "8px",
        border: "none",
        background: cfg.color,
        color: cfg.textColor,
        fontFamily: "var(--font-barlow)",
        fontWeight: 900,
        fontSize: "20px",
        letterSpacing: "0.08em",
        cursor: "pointer",
        transition: "opacity 0.15s",
      }}
      onMouseDown={(e) => {
        (e.currentTarget as HTMLButtonElement).style.opacity = "0.85";
      }}
      onMouseUp={(e) => {
        (e.currentTarget as HTMLButtonElement).style.opacity = "1";
      }}
    >
      {cfg.label}
    </button>
  );
}
