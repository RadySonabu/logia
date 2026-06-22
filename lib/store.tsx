"use client";

import {
  createContext,
  useContext,
  useReducer,
  useCallback,
  type ReactNode,
} from "react";
import { CLIENTS, DRIVERS, DELIVERIES, VEHICLE_TYPES, nextOrderId } from "./data";
import { LS_DRIVERS } from "./auth";
import type { Client, Driver, Delivery, DeliveryStatus } from "./types";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function loadRegisteredDrivers(): Driver[] {
  if (typeof window === "undefined") return [];
  try {
    const raw: { id: string; name: string; vehicle: string }[] =
      JSON.parse(localStorage.getItem(LS_DRIVERS) ?? "[]");
    return raw.map((d) => ({ ...d, isActive: true }));
  } catch {
    return [];
  }
}

// ---------------------------------------------------------------------------
// State
// ---------------------------------------------------------------------------

interface StoreState {
  clients:      Client[];
  drivers:      Driver[];
  deliveries:   Delivery[];
  vehicleTypes: string[];
}

type Action =
  // Deliveries
  | { type: "CREATE_DELIVERY"; payload: Omit<Delivery, "id" | "createdAt" | "updatedAt"> }
  | { type: "UPDATE_DELIVERY"; id: string; patch: Partial<Delivery> }
  | { type: "UPDATE_STATUS";   id: string; status: DeliveryStatus; driverId?: string }
  // Clients
  | { type: "ADD_CLIENT";    name: string }
  | { type: "UPDATE_CLIENT"; id: string; name: string }
  | { type: "DELETE_CLIENT"; id: string }
  // Vehicle types
  | { type: "ADD_VEHICLE_TYPE";    value: string }
  | { type: "DELETE_VEHICLE_TYPE"; value: string };

function reducer(state: StoreState, action: Action): StoreState {
  switch (action.type) {
    // ── Deliveries ────────────────────────────────────────────────────────
    case "CREATE_DELIVERY": {
      const now = new Date().toISOString();
      const delivery: Delivery = {
        ...action.payload,
        id:        nextOrderId(),
        createdAt: now,
        updatedAt: now,
      };
      return { ...state, deliveries: [delivery, ...state.deliveries] };
    }
    case "UPDATE_DELIVERY":
      return {
        ...state,
        deliveries: state.deliveries.map((d) =>
          d.id === action.id
            ? { ...d, ...action.patch, updatedAt: new Date().toISOString() }
            : d
        ),
      };
    case "UPDATE_STATUS":
      return {
        ...state,
        deliveries: state.deliveries.map((d) =>
          d.id === action.id
            ? {
                ...d,
                status: action.status,
                ...(action.driverId !== undefined ? { driverId: action.driverId } : {}),
                updatedAt: new Date().toISOString(),
              }
            : d
        ),
      };

    // ── Clients ───────────────────────────────────────────────────────────
    case "ADD_CLIENT":
      return {
        ...state,
        clients: [
          ...state.clients,
          { id: `c_${Date.now()}`, name: action.name.trim() },
        ],
      };
    case "UPDATE_CLIENT":
      return {
        ...state,
        clients: state.clients.map((c) =>
          c.id === action.id ? { ...c, name: action.name.trim() } : c
        ),
      };
    case "DELETE_CLIENT":
      return { ...state, clients: state.clients.filter((c) => c.id !== action.id) };

    // ── Vehicle types ─────────────────────────────────────────────────────
    case "ADD_VEHICLE_TYPE":
      if (state.vehicleTypes.includes(action.value.trim())) return state;
      return { ...state, vehicleTypes: [...state.vehicleTypes, action.value.trim()] };
    case "DELETE_VEHICLE_TYPE":
      return {
        ...state,
        vehicleTypes: state.vehicleTypes.filter((v) => v !== action.value),
      };

    default:
      return state;
  }
}

// ---------------------------------------------------------------------------
// Context
// ---------------------------------------------------------------------------

interface StoreContextValue {
  clients:      Client[];
  drivers:      Driver[];
  deliveries:   Delivery[];
  vehicleTypes: string[];
  // Deliveries
  createDelivery: (payload: Omit<Delivery, "id" | "createdAt" | "updatedAt">) => void;
  updateDelivery: (id: string, patch: Partial<Delivery>) => void;
  assignDriver:   (deliveryId: string, driverId: string) => void;
  advanceStatus:  (deliveryId: string, currentDriverId?: string) => void;
  // Clients
  addClient:    (name: string) => void;
  updateClient: (id: string, name: string) => void;
  deleteClient: (id: string) => void;
  // Vehicle types
  addVehicleType:    (value: string) => void;
  deleteVehicleType: (value: string) => void;
}

const StoreContext = createContext<StoreContextValue | null>(null);

// ---------------------------------------------------------------------------
// Provider
// ---------------------------------------------------------------------------

export function StoreProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, undefined, () => {
    const registeredDrivers = loadRegisteredDrivers();
    const seedIds = new Set(DRIVERS.map((d) => d.id));
    const newDrivers = registeredDrivers.filter((d) => !seedIds.has(d.id));
    return {
      clients:      CLIENTS,
      drivers:      [...DRIVERS, ...newDrivers],
      deliveries:   DELIVERIES,
      vehicleTypes: [...VEHICLE_TYPES],
    };
  });

  // Deliveries
  const createDelivery = useCallback(
    (payload: Omit<Delivery, "id" | "createdAt" | "updatedAt">) =>
      dispatch({ type: "CREATE_DELIVERY", payload }),
    []
  );
  const updateDelivery = useCallback(
    (id: string, patch: Partial<Delivery>) =>
      dispatch({ type: "UPDATE_DELIVERY", id, patch }),
    []
  );
  const assignDriver = useCallback(
    (deliveryId: string, driverId: string) =>
      dispatch({ type: "UPDATE_STATUS", id: deliveryId, status: "claimed", driverId }),
    []
  );
  const advanceStatus = useCallback(
    (deliveryId: string, currentDriverId?: string) => {
      const delivery = state.deliveries.find((d) => d.id === deliveryId);
      if (!delivery) return;
      const next: Record<DeliveryStatus, DeliveryStatus | null> = {
        open: "claimed", claimed: "picked_up",
        picked_up: "delivered", delivered: "completed", completed: null,
      };
      const nextStatus = next[delivery.status];
      if (!nextStatus) return;
      dispatch({
        type: "UPDATE_STATUS", id: deliveryId, status: nextStatus,
        ...(currentDriverId ? { driverId: currentDriverId } : {}),
      });
    },
    [state.deliveries]
  );

  // Clients
  const addClient    = useCallback((name: string) => dispatch({ type: "ADD_CLIENT", name }), []);
  const updateClient = useCallback((id: string, name: string) => dispatch({ type: "UPDATE_CLIENT", id, name }), []);
  const deleteClient = useCallback((id: string) => dispatch({ type: "DELETE_CLIENT", id }), []);

  // Vehicle types
  const addVehicleType    = useCallback((value: string) => dispatch({ type: "ADD_VEHICLE_TYPE", value }), []);
  const deleteVehicleType = useCallback((value: string) => dispatch({ type: "DELETE_VEHICLE_TYPE", value }), []);

  return (
    <StoreContext.Provider value={{
      clients: state.clients, drivers: state.drivers,
      deliveries: state.deliveries, vehicleTypes: state.vehicleTypes,
      createDelivery, updateDelivery, assignDriver, advanceStatus,
      addClient, updateClient, deleteClient,
      addVehicleType, deleteVehicleType,
    }}>
      {children}
    </StoreContext.Provider>
  );
}

// ---------------------------------------------------------------------------
// Hook
// ---------------------------------------------------------------------------

export function useStore() {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error("useStore must be used inside <StoreProvider>");
  return ctx;
}
