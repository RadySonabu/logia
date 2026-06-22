"use client";

import {
  createContext,
  useContext,
  useReducer,
  useCallback,
  type ReactNode,
} from "react";
import { CLIENTS, DRIVERS, DELIVERIES, nextOrderId } from "./data";
import type { Client, Driver, Delivery, DeliveryStatus } from "./types";

// ---------------------------------------------------------------------------
// State
// ---------------------------------------------------------------------------

interface StoreState {
  clients: Client[];
  drivers: Driver[];
  deliveries: Delivery[];
}

type Action =
  | { type: "CREATE_DELIVERY"; payload: Omit<Delivery, "id" | "createdAt" | "updatedAt"> }
  | { type: "UPDATE_DELIVERY"; id: string; patch: Partial<Delivery> }
  | { type: "UPDATE_STATUS"; id: string; status: DeliveryStatus; driverId?: string };

function reducer(state: StoreState, action: Action): StoreState {
  switch (action.type) {
    case "CREATE_DELIVERY": {
      const now = new Date().toISOString();
      const delivery: Delivery = {
        ...action.payload,
        id: nextOrderId(),
        createdAt: now,
        updatedAt: now,
      };
      return { ...state, deliveries: [delivery, ...state.deliveries] };
    }
    case "UPDATE_DELIVERY": {
      return {
        ...state,
        deliveries: state.deliveries.map((d) =>
          d.id === action.id
            ? { ...d, ...action.patch, updatedAt: new Date().toISOString() }
            : d
        ),
      };
    }
    case "UPDATE_STATUS": {
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
    }
    default:
      return state;
  }
}

// ---------------------------------------------------------------------------
// Context
// ---------------------------------------------------------------------------

interface StoreContextValue {
  clients: Client[];
  drivers: Driver[];
  deliveries: Delivery[];
  createDelivery: (payload: Omit<Delivery, "id" | "createdAt" | "updatedAt">) => void;
  updateDelivery: (id: string, patch: Partial<Delivery>) => void;
  assignDriver: (deliveryId: string, driverId: string) => void;
  advanceStatus: (deliveryId: string, currentDriverId?: string) => void;
}

const StoreContext = createContext<StoreContextValue | null>(null);

// ---------------------------------------------------------------------------
// Provider
// ---------------------------------------------------------------------------

export function StoreProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, {
    clients: CLIENTS,
    drivers: DRIVERS,
    deliveries: DELIVERIES,
  });

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
      dispatch({
        type: "UPDATE_STATUS",
        id: deliveryId,
        status: "claimed",
        driverId,
      }),
    []
  );

  const advanceStatus = useCallback(
    (deliveryId: string, currentDriverId?: string) => {
      const delivery = state.deliveries.find((d) => d.id === deliveryId);
      if (!delivery) return;
      const next: Record<DeliveryStatus, DeliveryStatus | null> = {
        open: "claimed",
        claimed: "picked_up",
        picked_up: "delivered",
        delivered: "completed",
        completed: null,
      };
      const nextStatus = next[delivery.status];
      if (!nextStatus) return;
      dispatch({
        type: "UPDATE_STATUS",
        id: deliveryId,
        status: nextStatus,
        ...(currentDriverId ? { driverId: currentDriverId } : {}),
      });
    },
    [state.deliveries]
  );

  return (
    <StoreContext.Provider
      value={{
        clients: state.clients,
        drivers: state.drivers,
        deliveries: state.deliveries,
        createDelivery,
        updateDelivery,
        assignDriver,
        advanceStatus,
      }}
    >
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
