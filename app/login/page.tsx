"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/lib/auth";

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuth();

  const [email,    setEmail]    = useState("");
  const [password, setPassword] = useState("");
  const [error,    setError]    = useState("");
  const [loading,  setLoading]  = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    const result = await login(email, password);
    setLoading(false);
    if (result.error) {
      setError(result.error);
      return;
    }
    // Redirect based on role — auth context doesn't expose role here,
    // so we check the stored user
    const raw = localStorage.getItem("relay_session");
    const user = raw ? JSON.parse(raw) : null;
    router.push(user?.role === "driver" ? "/driver" : "/dispatch");
  }

  return (
    <AuthShell title="SIGN IN">
      <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
        <AuthField label="EMAIL" htmlFor="email">
          <input
            id="email"
            type="email"
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@company.com"
            required
            style={inputStyle}
          />
        </AuthField>

        <AuthField label="PASSWORD" htmlFor="password">
          <input
            id="password"
            type="password"
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            required
            style={inputStyle}
          />
        </AuthField>

        {error && (
          <p style={{ fontFamily: "var(--font-plex)", fontSize: "11px", color: "#F87171", margin: 0 }}>
            {error}
          </p>
        )}

        <button type="submit" disabled={loading} style={submitStyle(loading)}>
          {loading ? "SIGNING IN…" : "SIGN IN"}
        </button>
      </form>

      <Hint>
        No account?{" "}
        <Link href="/register" style={{ color: "#F5A623", textDecoration: "none" }}>
          Register
        </Link>
      </Hint>

      <DevHint />
    </AuthShell>
  );
}

function DevHint() {
  return (
    <div
      style={{
        marginTop: "20px",
        padding: "12px 14px",
        background: "#0D0D0D",
        border: "1px solid #1E1E1E",
        borderRadius: "4px",
      }}
    >
      <p style={{ fontFamily: "var(--font-plex)", fontSize: "9px", color: "#2E2E2E", letterSpacing: "0.08em", marginBottom: "8px" }}>
        DEMO CREDENTIALS
      </p>
      {[
        ["admin@relay.com",  "Dispatcher"],
        ["marcus@relay.com", "Driver — Marcus T."],
        ["priya@relay.com",  "Driver — Priya K."],
      ].map(([em, label]) => (
        <p key={em} style={{ fontFamily: "var(--font-plex)", fontSize: "10px", color: "#484848", margin: "3px 0" }}>
          <span style={{ color: "#555" }}>{label}:</span> {em} / <span style={{ color: "#555" }}>relay2024</span>
        </p>
      ))}
    </div>
  );
}

// ── Shared auth shell ─────────────────────────────────────────────────────────

export function AuthShell({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#0A0A0A",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "24px",
      }}
    >
      <div style={{ width: "100%", maxWidth: "400px" }}>
        {/* Logo */}
        <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "36px" }}>
          <svg width="15" height="15" viewBox="0 0 16 16">
            <polygon points="8,0 16,8 8,16 0,8" fill="#F5A623" />
          </svg>
          <span
            style={{
              fontFamily: "var(--font-barlow)",
              fontWeight: 900,
              fontSize: "20px",
              color: "#F0F0F0",
              letterSpacing: "0.14em",
            }}
          >
            RELAY
          </span>
        </div>

        {/* Card */}
        <div
          style={{
            background: "#111",
            border: "1px solid #1A1A1A",
            borderRadius: "4px",
            padding: "28px 24px",
          }}
        >
          <h1
            style={{
              fontFamily: "var(--font-barlow)",
              fontWeight: 900,
              fontSize: "18px",
              letterSpacing: "0.1em",
              color: "#F0F0F0",
              marginBottom: "24px",
            }}
          >
            {title}
          </h1>
          {children}
        </div>
      </div>
    </div>
  );
}

export function AuthField({
  label,
  htmlFor,
  children,
}: {
  label: string;
  htmlFor: string;
  children: React.ReactNode;
}) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "5px" }}>
      <label
        htmlFor={htmlFor}
        style={{
          fontFamily: "var(--font-plex)",
          fontSize: "9px",
          color: "#484848",
          letterSpacing: "0.1em",
          textTransform: "uppercase",
        }}
      >
        {label}
      </label>
      {children}
    </div>
  );
}

export function Hint({ children }: { children: React.ReactNode }) {
  return (
    <p
      style={{
        marginTop: "16px",
        fontFamily: "var(--font-dm)",
        fontSize: "12px",
        color: "#484848",
        textAlign: "center",
      }}
    >
      {children}
    </p>
  );
}

export const inputStyle: React.CSSProperties = {
  background: "#0D0D0D",
  border: "1px solid #252525",
  borderRadius: "2px",
  height: "40px",
  padding: "0 12px",
  fontFamily: "var(--font-dm)",
  fontSize: "14px",
  color: "#F0F0F0",
  outline: "none",
  width: "100%",
};

export const submitStyle = (loading: boolean): React.CSSProperties => ({
  width: "100%",
  height: "42px",
  marginTop: "4px",
  background: loading ? "#C08010" : "#F5A623",
  color: "#0A0A0A",
  border: "none",
  borderRadius: "2px",
  fontFamily: "var(--font-barlow)",
  fontWeight: 900,
  fontSize: "13px",
  letterSpacing: "0.1em",
  cursor: loading ? "not-allowed" : "pointer",
  transition: "background 0.15s",
});
