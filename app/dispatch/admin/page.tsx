"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { StoreProvider, useStore } from "@/lib/store";
import { useAuth } from "@/lib/auth";
import { NavBar } from "@/app/dispatch/components/NavBar";
import type { Client } from "@/lib/types";

export default function AdminPage() {
  return (
    <StoreProvider>
      <AuthGuard>
        <AdminDashboard />
      </AuthGuard>
    </StoreProvider>
  );
}

function AuthGuard({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) router.replace("/login");
    if (!loading && user && user.role !== "dispatcher") router.replace("/driver");
  }, [user, loading, router]);

  if (loading || !user || user.role !== "dispatcher") return null;
  return <>{children}</>;
}

function AdminDashboard() {
  const { user, logout } = useAuth();
  const router = useRouter();

  function handleLogout() { logout(); router.push("/login"); }

  return (
    <>
      <NavBar user={user} onLogout={handleLogout} />
      <div
        style={{
          flex: 1,
          overflow: "auto",
          background: "#0A0A0A",
          padding: "28px 28px 48px",
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: "24px",
          alignItems: "start",
        }}
      >
        <ClientsPanel />
        <VehicleTypesPanel />
      </div>
    </>
  );
}

// ── Clients Panel ─────────────────────────────────────────────────────────────

function ClientsPanel() {
  const { clients, addClient, updateClient, deleteClient } = useStore();
  const [newName,   setNewName]   = useState("");
  const [editId,    setEditId]    = useState<string | null>(null);
  const [editName,  setEditName]  = useState("");
  const [error,     setError]     = useState("");

  function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = newName.trim();
    if (!trimmed) { setError("Name cannot be empty"); return; }
    if (clients.some((c) => c.name.toLowerCase() === trimmed.toLowerCase())) {
      setError("Client already exists"); return;
    }
    addClient(trimmed);
    setNewName("");
    setError("");
  }

  function startEdit(client: Client) {
    setEditId(client.id);
    setEditName(client.name);
  }

  function handleUpdate(id: string) {
    const trimmed = editName.trim();
    if (!trimmed) return;
    updateClient(id, trimmed);
    setEditId(null);
    setEditName("");
  }

  return (
    <Panel title="CLIENTS" count={clients.length}>
      {/* List */}
      <div style={{ display: "flex", flexDirection: "column", gap: "4px", marginBottom: "16px" }}>
        {clients.map((client) => (
          <div
            key={client.id}
            style={{
              display: "flex", alignItems: "center", gap: "8px",
              padding: "10px 14px",
              background: "#111", border: "1px solid #1A1A1A", borderRadius: "2px",
            }}
          >
            {editId === client.id ? (
              <>
                <input
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  onKeyDown={(e) => { if (e.key === "Enter") handleUpdate(client.id); if (e.key === "Escape") setEditId(null); }}
                  autoFocus
                  style={inlineInputStyle}
                />
                <IconBtn title="Save" onClick={() => handleUpdate(client.id)} color="#F5A623">✓</IconBtn>
                <IconBtn title="Cancel" onClick={() => setEditId(null)} color="#555">✕</IconBtn>
              </>
            ) : (
              <>
                <span style={{ flex: 1, fontFamily: "var(--font-dm)", fontSize: "13px", color: "#B0B0B0" }}>
                  {client.name}
                </span>
                <IconBtn title="Edit" onClick={() => startEdit(client)} color="#484848">✎</IconBtn>
                <IconBtn title="Delete" onClick={() => deleteClient(client.id)} color="#484848" hoverColor="#F87171">✕</IconBtn>
              </>
            )}
          </div>
        ))}
        {clients.length === 0 && (
          <EmptyState label="No clients yet" />
        )}
      </div>

      {/* Add form */}
      <form onSubmit={handleAdd} style={{ display: "flex", gap: "8px" }}>
        <input
          value={newName}
          onChange={(e) => { setNewName(e.target.value); setError(""); }}
          placeholder="New client name…"
          style={{ ...addInputStyle, flex: 1 }}
        />
        <AddButton type="submit">+ ADD</AddButton>
      </form>
      {error && <ErrorText>{error}</ErrorText>}
    </Panel>
  );
}

// ── Vehicle Types Panel ───────────────────────────────────────────────────────

function VehicleTypesPanel() {
  const { vehicleTypes, addVehicleType, deleteVehicleType } = useStore();
  const [newType, setNewType] = useState("");
  const [error,   setError]   = useState("");

  function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = newType.trim();
    if (!trimmed) { setError("Name cannot be empty"); return; }
    if (vehicleTypes.includes(trimmed)) { setError("Vehicle type already exists"); return; }
    addVehicleType(trimmed);
    setNewType("");
    setError("");
  }

  return (
    <Panel title="VEHICLE TYPES" count={vehicleTypes.length}>
      {/* List */}
      <div style={{ display: "flex", flexDirection: "column", gap: "4px", marginBottom: "16px" }}>
        {vehicleTypes.map((vt) => (
          <div
            key={vt}
            style={{
              display: "flex", alignItems: "center", gap: "8px",
              padding: "10px 14px",
              background: "#111", border: "1px solid #1A1A1A", borderRadius: "2px",
            }}
          >
            <span style={{ flex: 1, fontFamily: "var(--font-dm)", fontSize: "13px", color: "#B0B0B0" }}>
              {vt}
            </span>
            <IconBtn title="Delete" onClick={() => deleteVehicleType(vt)} color="#484848" hoverColor="#F87171">✕</IconBtn>
          </div>
        ))}
        {vehicleTypes.length === 0 && <EmptyState label="No vehicle types yet" />}
      </div>

      {/* Add form */}
      <form onSubmit={handleAdd} style={{ display: "flex", gap: "8px" }}>
        <input
          value={newType}
          onChange={(e) => { setNewType(e.target.value); setError(""); }}
          placeholder="e.g. Refrigerated Van…"
          style={{ ...addInputStyle, flex: 1 }}
        />
        <AddButton type="submit">+ ADD</AddButton>
      </form>
      {error && <ErrorText>{error}</ErrorText>}
    </Panel>
  );
}

// ── Shared sub-components ─────────────────────────────────────────────────────

function Panel({ title, count, children }: { title: string; count: number; children: React.ReactNode }) {
  return (
    <div style={{ background: "#0F0F0F", border: "1px solid #1A1A1A", borderRadius: "3px", overflow: "hidden" }}>
      {/* Panel header */}
      <div style={{ padding: "16px 20px", borderBottom: "1px solid #1A1A1A", display: "flex", alignItems: "center", gap: "10px" }}>
        <span style={{ fontFamily: "var(--font-barlow)", fontWeight: 900, fontSize: "14px", letterSpacing: "0.1em", color: "#F0F0F0" }}>
          {title}
        </span>
        <span style={{ fontFamily: "var(--font-plex)", fontSize: "10px", color: "#2E2E2E", background: "#1A1A1A", padding: "2px 8px", borderRadius: "2px" }}>
          {count}
        </span>
      </div>
      <div style={{ padding: "16px 20px" }}>
        {children}
      </div>
    </div>
  );
}

function IconBtn({
  title, onClick, color, hoverColor, children,
}: {
  title: string; onClick: () => void; color: string; hoverColor?: string; children: React.ReactNode;
}) {
  const [hov, setHov] = useState(false);
  return (
    <button
      title={title}
      onClick={onClick}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        background: "none", border: "none",
        color: hov && hoverColor ? hoverColor : color,
        cursor: "pointer", fontSize: "13px", padding: "2px 4px",
        lineHeight: 1, transition: "color 0.15s",
        fontFamily: "var(--font-dm)",
      }}
    >
      {children}
    </button>
  );
}

function AddButton({ children, type }: { children: React.ReactNode; type?: "submit" | "button" }) {
  const [hov, setHov] = useState(false);
  return (
    <button
      type={type ?? "button"}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        background: hov ? "#F5A623" : "transparent",
        border: `1px solid ${hov ? "#F5A623" : "#282828"}`,
        color: hov ? "#0A0A0A" : "#555",
        fontFamily: "var(--font-barlow)", fontWeight: 900, fontSize: "11px",
        letterSpacing: "0.08em", padding: "0 14px", height: "36px",
        borderRadius: "2px", cursor: "pointer", whiteSpace: "nowrap",
        transition: "all 0.15s",
      }}
    >
      {children}
    </button>
  );
}

function EmptyState({ label }: { label: string }) {
  return (
    <div style={{ padding: "20px 0", textAlign: "center", fontFamily: "var(--font-plex)", fontSize: "11px", color: "#2E2E2E", letterSpacing: "0.06em" }}>
      {label.toUpperCase()}
    </div>
  );
}

function ErrorText({ children }: { children: React.ReactNode }) {
  return (
    <p style={{ fontFamily: "var(--font-plex)", fontSize: "10px", color: "#F87171", margin: "6px 0 0" }}>
      {children}
    </p>
  );
}

const inlineInputStyle: React.CSSProperties = {
  flex: 1, background: "#0D0D0D", border: "1px solid #F5A623",
  borderRadius: "2px", height: "32px", padding: "0 10px",
  fontFamily: "var(--font-dm)", fontSize: "13px", color: "#F0F0F0",
  outline: "none",
};

const addInputStyle: React.CSSProperties = {
  background: "#0D0D0D", border: "1px solid #252525", borderRadius: "2px",
  height: "36px", padding: "0 12px",
  fontFamily: "var(--font-dm)", fontSize: "13px", color: "#F0F0F0",
  outline: "none",
};
