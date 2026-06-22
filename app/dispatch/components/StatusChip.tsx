import type { DeliveryStatus } from "@/lib/types";

const STATUS_CONFIG: Record<
  DeliveryStatus,
  { label: string; color: string; bg: string; border: string }
> = {
  open:      { label: "OPEN",      color: "#94A3B8", bg: "rgba(148,163,184,0.10)", border: "rgba(148,163,184,0.30)" },
  claimed:   { label: "CLAIMED",   color: "#F59E0B", bg: "rgba(245,158,11,0.10)",  border: "rgba(245,158,11,0.30)"  },
  picked_up: { label: "PICKED UP", color: "#60A5FA", bg: "rgba(96,165,250,0.10)",  border: "rgba(96,165,250,0.30)"  },
  delivered: { label: "DELIVERED", color: "#34D399", bg: "rgba(52,211,153,0.10)",  border: "rgba(52,211,153,0.30)"  },
  completed: { label: "COMPLETED", color: "#4ADE80", bg: "rgba(74,222,128,0.07)",  border: "rgba(74,222,128,0.25)"  },
};

interface Props {
  status: DeliveryStatus;
  size?: "sm" | "md";
}

export function StatusChip({ status, size = "sm" }: Props) {
  const cfg = STATUS_CONFIG[status];
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        padding: size === "sm" ? "3px 9px" : "4px 12px",
        borderRadius: "2px",
        border: `1px solid ${cfg.border}`,
        background: cfg.bg,
        color: cfg.color,
        fontFamily: "var(--font-barlow)",
        fontWeight: 700,
        fontSize: size === "sm" ? "10px" : "12px",
        letterSpacing: "0.06em",
        whiteSpace: "nowrap",
      }}
    >
      {cfg.label}
    </span>
  );
}

export { STATUS_CONFIG };
