"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  type ReactNode,
} from "react";
import type { AuthUser, UserRole } from "./types";

// ---------------------------------------------------------------------------
// Hardcoded seed accounts (swapped for Supabase Auth later)
// ---------------------------------------------------------------------------

interface StoredUser extends AuthUser {
  passwordHash: string;
  vehicle?: string; // only for drivers
}

const SEED_USERS: StoredUser[] = [
  { id: "u1", name: "Admin",     email: "admin@relay.com",  role: "dispatcher", driverId: null,  passwordHash: "relay2024" },
  { id: "u2", name: "Marcus T.", email: "marcus@relay.com", role: "driver",     driverId: "d1", passwordHash: "relay2024", vehicle: "Pickup Truck" },
  { id: "u3", name: "Priya K.",  email: "priya@relay.com",  role: "driver",     driverId: "d2", passwordHash: "relay2024", vehicle: "Cargo Van" },
  { id: "u4", name: "Devon H.",  email: "devon@relay.com",  role: "driver",     driverId: "d3", passwordHash: "relay2024", vehicle: "Box Truck" },
  { id: "u5", name: "Sasha L.",  email: "sasha@relay.com",  role: "driver",     driverId: "d4", passwordHash: "relay2024", vehicle: "Cargo Van" },
];

const LS_SESSION  = "relay_session";
const LS_USERS    = "relay_registered_users";
export const LS_DRIVERS = "relay_registered_drivers"; // read by StoreProvider

function getRegisteredUsers(): StoredUser[] {
  if (typeof window === "undefined") return [];
  try { return JSON.parse(localStorage.getItem(LS_USERS) ?? "[]"); } catch { return []; }
}

function saveRegisteredUsers(users: StoredUser[]) {
  localStorage.setItem(LS_USERS, JSON.stringify(users));
}

function saveRegisteredDriver(driver: { id: string; name: string; vehicle: string }) {
  const existing: typeof driver[] =
    typeof window !== "undefined"
      ? JSON.parse(localStorage.getItem(LS_DRIVERS) ?? "[]")
      : [];
  localStorage.setItem(LS_DRIVERS, JSON.stringify([...existing, driver]));
}

function allUsers(): StoredUser[] {
  return [...SEED_USERS, ...getRegisteredUsers()];
}

// ---------------------------------------------------------------------------
// Context types
// ---------------------------------------------------------------------------

interface AuthContextValue {
  user:     AuthUser | null;
  loading:  boolean;
  login:    (email: string, password: string) => Promise<{ error?: string }>;
  register: (data: RegisterData)              => Promise<{ error?: string }>;
  logout:   ()                                => void;
}

export interface RegisterData {
  name:     string;
  email:    string;
  password: string;
  role:     UserRole;
  vehicle:  string; // for drivers — empty string if dispatcher
}

const AuthContext = createContext<AuthContextValue | null>(null);

// ---------------------------------------------------------------------------
// Provider
// ---------------------------------------------------------------------------

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser]       = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(LS_SESSION);
      if (raw) setUser(JSON.parse(raw));
    } catch { /* ignore */ }
    setLoading(false);
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    const found = allUsers().find(
      (u) => u.email.toLowerCase() === email.toLowerCase() && u.passwordHash === password
    );
    if (!found) return { error: "Invalid email or password" };

    const session: AuthUser = {
      id: found.id, name: found.name, email: found.email,
      role: found.role, driverId: found.driverId,
    };
    localStorage.setItem(LS_SESSION, JSON.stringify(session));
    setUser(session);
    return {};
  }, []);

  const register = useCallback(async (data: RegisterData) => {
    if (!data.name.trim())     return { error: "Name is required" };
    if (!data.email.trim())    return { error: "Email is required" };
    if (!data.password.trim()) return { error: "Password is required" };

    const existing = allUsers().find(
      (u) => u.email.toLowerCase() === data.email.toLowerCase()
    );
    if (existing) return { error: "An account with that email already exists" };

    // Auto-create a driver ID for new driver accounts
    const driverId = data.role === "driver" ? `drv_${Date.now()}` : null;

    const newUser: StoredUser = {
      id:           `u_${Date.now()}`,
      name:         data.name.trim(),
      email:        data.email.trim().toLowerCase(),
      role:         data.role,
      driverId,
      passwordHash: data.password,
      vehicle:      data.vehicle || undefined,
    };

    saveRegisteredUsers([...getRegisteredUsers(), newUser]);

    // Persist the driver entry so StoreProvider can include them in driver lists
    if (data.role === "driver" && driverId) {
      saveRegisteredDriver({
        id:      driverId,
        name:    data.name.trim(),
        vehicle: data.vehicle.trim() || "—",
      });
    }

    const session: AuthUser = {
      id: newUser.id, name: newUser.name, email: newUser.email,
      role: newUser.role, driverId: newUser.driverId,
    };
    localStorage.setItem(LS_SESSION, JSON.stringify(session));
    setUser(session);
    return {};
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem(LS_SESSION);
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

// ---------------------------------------------------------------------------
// Hook
// ---------------------------------------------------------------------------

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside <AuthProvider>");
  return ctx;
}
