import type { DeliveryStatus } from "@/lib/types";

const STEPS: DeliveryStatus[] = ["claimed", "picked_up", "delivered", "completed"];

const STEP_COLOR: Record<DeliveryStatus, string> = {
  open: "#94A3B8",
  claimed: "#F59E0B",
  picked_up: "#60A5FA",
  delivered: "#34D399",
  completed: "#4ADE80",
};

interface Props {
  status: DeliveryStatus;
}

export function ProgressBar({ status }: Props) {
  const activeIdx = STEPS.indexOf(status);

  return (
    <div style={{ display: "flex", gap: "4px" }}>
      {STEPS.map((step, idx) => {
        const filled = idx <= activeIdx;
        const color = filled ? STEP_COLOR[step] : "#1E1E1E";
        return (
          <div
            key={step}
            style={{
              flex: 1,
              height: "4px",
              borderRadius: "2px",
              background: color,
              transition: "background 0.3s",
            }}
          />
        );
      })}
    </div>
  );
}
