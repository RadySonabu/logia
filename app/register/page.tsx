"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth, type RegisterData } from "@/lib/auth";
import { VEHICLE_TYPES } from "@/lib/data";
import {
  AuthShell, AuthField, Hint,
  inputStyle, submitStyle,
} from "@/app/login/page";

export default function RegisterPage() {
  const router       = useRouter();
  const { register } = useAuth();

  const [name,     setName]     = useState("");
  const [email,    setEmail]    = useState("");
  const [password, setPassword] = useState("");
  const [confirm,  setConfirm]  = useState("");
  const [role,     setRole]     = useState<"dispatcher" | "driver">("dispatcher");
  const [vehicle,  setVehicle]  = useState("");
  const [error,    setError]    = useState("");
  const [loading,  setLoading]  = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (password !== confirm) { setError("Passwords do not match"); return; }
    if (password.length < 6)  { setError("Password must be at least 6 characters"); return; }

    setLoading(true);
    const payload: RegisterData = { name, email, password, role, vehicle };
    const result = await register(payload);
    setLoading(false);
    if (result.error) { setError(result.error); return; }
    router.push(role === "driver" ? "/driver" : "/dispatch");
  }

  return (
    <AuthShell title="CREATE ACCOUNT">
      <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "14px" }}>

        <AuthField label={role === "driver" ? "DRIVER NAME" : "FULL NAME"} htmlFor="name">
          <input
            id="name" type="text" autoComplete="name"
            value={name} onChange={(e) => setName(e.target.value)}
            placeholder={role === "driver" ? "Driver's full name" : "Your name"}
            required style={inputStyle}
          />
        </AuthField>

        <AuthField label="EMAIL" htmlFor="email">
          <input
            id="email" type="email" autoComplete="email"
            value={email} onChange={(e) => setEmail(e.target.value)}
            placeholder="you@company.com" required style={inputStyle}
          />
        </AuthField>

        <AuthField label="PASSWORD" htmlFor="password">
          <input
            id="password" type="password" autoComplete="new-password"
            value={password} onChange={(e) => setPassword(e.target.value)}
            placeholder="Min. 6 characters" required style={inputStyle}
          />
        </AuthField>

        <AuthField label="CONFIRM PASSWORD" htmlFor="confirm">
          <input
            id="confirm" type="password" autoComplete="new-password"
            value={confirm} onChange={(e) => setConfirm(e.target.value)}
            placeholder="Repeat password" required style={inputStyle}
          />
        </AuthField>

        {/* Role toggle */}
        <AuthField label="ROLE" htmlFor="role">
          <div style={{ display: "flex", gap: "8px" }}>
            {(["dispatcher", "driver"] as const).map((r) => (
              <button
                key={r} type="button" onClick={() => setRole(r)}
                style={{
                  flex: 1, height: "40px",
                  background: role === r ? "#F5A623" : "transparent",
                  color: role === r ? "#0A0A0A" : "#555",
                  border: `1px solid ${role === r ? "#F5A623" : "#252525"}`,
                  borderRadius: "2px",
                  fontFamily: "var(--font-barlow)", fontWeight: 900,
                  fontSize: "11px", letterSpacing: "0.08em",
                  cursor: "pointer", transition: "all 0.15s",
                }}
              >
                {r.toUpperCase()}
              </button>
            ))}
          </div>
        </AuthField>

        {/* Vehicle type — only shown for drivers */}
        {role === "driver" && (
          <AuthField label="VEHICLE TYPE" htmlFor="vehicle">
            <select
              id="vehicle"
              value={vehicle}
              onChange={(e) => setVehicle(e.target.value)}
              style={{ ...inputStyle, appearance: "none", cursor: "pointer" }}
            >
              <option value="">— Select vehicle —</option>
              {VEHICLE_TYPES.map((v) => (
                <option key={v} value={v}>{v}</option>
              ))}
            </select>
            <p style={{ fontFamily: "var(--font-plex)", fontSize: "9px", color: "#3A3A3A", margin: "3px 0 0", letterSpacing: "0.04em" }}>
              Optional — can be updated later
            </p>
          </AuthField>
        )}

        {error && (
          <p style={{ fontFamily: "var(--font-plex)", fontSize: "11px", color: "#F87171", margin: 0 }}>
            {error}
          </p>
        )}

        <button type="submit" disabled={loading} style={submitStyle(loading)}>
          {loading ? "CREATING…" : "CREATE ACCOUNT"}
        </button>
      </form>

      <Hint>
        Already have an account?{" "}
        <Link href="/login" style={{ color: "#F5A623", textDecoration: "none" }}>
          Sign in
        </Link>
      </Hint>
    </AuthShell>
  );
}
