"use client";

import { useRouter } from "next/navigation";
import { useStore } from "@/lib/store";
import { OpenRunCard } from "./components/OpenRunCard";

// Hard-coded current driver for demo purposes.
// Replace with auth session lookup when Supabase is wired up.
const DEMO_DRIVER_ID = "d1";

export default function DriverHomePage() {
  const router = useRouter();
  const { deliveries, clients, assignDriver } = useStore();

  const clientMap = Object.fromEntries(clients.map((c) => [c.id, c]));
  const openRuns = deliveries.filter((d) => d.status === "open");

  function handleClaim(deliveryId: string) {
    assignDriver(deliveryId, DEMO_DRIVER_ID);
    router.push(`/driver/${deliveryId}`);
  }

  return (
    <div style={{ padding: "28px 0 40px" }}>
      {/* Header */}
      <div style={{ padding: "0 20px 20px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "4px" }}>
          <svg width="15" height="15" viewBox="0 0 16 16">
            <polygon points="8,0 16,8 8,16 0,8" fill="#F5A623" />
          </svg>
          <span
            style={{
              fontFamily: "var(--font-plex)",
              fontSize: "10px",
              color: "#3A3A3A",
              letterSpacing: "0.1em",
            }}
          >
            RELAY DRIVER
          </span>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <h1
            style={{
              fontFamily: "var(--font-barlow)",
              fontWeight: 900,
              fontSize: "28px",
              color: "#F0F0F0",
              letterSpacing: "0.04em",
            }}
          >
            OPEN RUNS
          </h1>
          <div
            className="animate-pulse-dot"
            style={{
              width: "6px",
              height: "6px",
              borderRadius: "50%",
              background: "#34D399",
            }}
          />
          <span
            style={{
              fontFamily: "var(--font-plex)",
              fontSize: "13px",
              color: "#34D399",
            }}
          >
            {openRuns.length}
          </span>
        </div>
      </div>

      {/* Run list */}
      {openRuns.length === 0 ? (
        <div
          style={{
            padding: "40px 20px",
            textAlign: "center",
            color: "#2E2E2E",
            fontFamily: "var(--font-plex)",
            fontSize: "12px",
            letterSpacing: "0.06em",
          }}
        >
          NO OPEN RUNS — CHECK BACK SOON
        </div>
      ) : (
        openRuns.map((d) => (
          <OpenRunCard
            key={d.id}
            delivery={d}
            client={clientMap[d.clientId]}
            onClaim={handleClaim}
          />
        ))
      )}
    </div>
  );
}
