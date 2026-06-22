"use client";

import { useRouter } from "next/navigation";
import { useStore } from "@/lib/store";
import { useAuth } from "@/lib/auth";
import { OpenRunCard } from "./components/OpenRunCard";

export default function DriverHomePage() {
  const router              = useRouter();
  const { user, logout }    = useAuth();
  const { deliveries, clients, assignDriver } = useStore();

  const clientMap = Object.fromEntries(clients.map((c) => [c.id, c]));
  const openRuns  = deliveries.filter((d) => d.status === "open");

  function handleClaim(deliveryId: string) {
    if (!user?.driverId) return;
    assignDriver(deliveryId, user.driverId);
    router.push(`/driver/${deliveryId}`);
  }

  function handleLogout() {
    logout();
    router.push("/login");
  }

  return (
    <div style={{ padding: "0 0 40px" }}>
      {/* Header */}
      <div style={{ padding: "28px 20px 20px", display: "flex", flexDirection: "column", gap: "4px" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <svg width="15" height="15" viewBox="0 0 16 16">
              <polygon points="8,0 16,8 8,16 0,8" fill="#F5A623" />
            </svg>
            <span style={{ fontFamily: "var(--font-plex)", fontSize: "10px", color: "#3A3A3A", letterSpacing: "0.1em" }}>
              RELAY DRIVER
            </span>
          </div>
          <button
            onClick={handleLogout}
            style={{
              background: "transparent", border: "1px solid #1E1E1E",
              color: "#484848", fontFamily: "var(--font-barlow)", fontWeight: 700,
              fontSize: "10px", letterSpacing: "0.06em", padding: "4px 10px",
              borderRadius: "4px", cursor: "pointer",
            }}
          >
            LOG OUT
          </button>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "10px", marginTop: "8px" }}>
          <h1 style={{ fontFamily: "var(--font-barlow)", fontWeight: 900, fontSize: "28px", color: "#F0F0F0", letterSpacing: "0.04em" }}>
            OPEN RUNS
          </h1>
          <div className="animate-pulse-dot" style={{ width: "6px", height: "6px", borderRadius: "50%", background: "#34D399" }} />
          <span style={{ fontFamily: "var(--font-plex)", fontSize: "13px", color: "#34D399" }}>
            {openRuns.length}
          </span>
        </div>

        {user && (
          <div style={{ fontFamily: "var(--font-dm)", fontSize: "12px", color: "#3A3A3A" }}>
            Logged in as {user.name}
          </div>
        )}
      </div>

      {/* Run list */}
      {openRuns.length === 0 ? (
        <div style={{ padding: "40px 20px", textAlign: "center", color: "#2E2E2E", fontFamily: "var(--font-plex)", fontSize: "12px", letterSpacing: "0.06em" }}>
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
