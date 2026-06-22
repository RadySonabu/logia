export type DeliveryStatus =
  | "open"
  | "claimed"
  | "picked_up"
  | "delivered"
  | "completed";

export interface Client {
  id: string;
  name: string;
}

export interface Driver {
  id: string;
  name: string;
  vehicle: string;
  isActive: boolean;
}

export interface Delivery {
  id: string;                        // SR Number e.g. "SR-0081"
  date: string;                      // "YYYY-MM-DD"
  clientId: string;
  srProblemSummary: string;
  declaredQuantity: number;
  customerName: string;
  contactAddressLine1: string;
  contactAddressLine2: string | null;
  proposedPulloutSchedule: string;   // "YYYY-MM-DDTHH:MM"
  actualDateOfPullout: string | null;
  vehicleType: string | null;
  driverId: string | null;
  actualQuantity: number | null;
  status: DeliveryStatus;
  dispatchNotes: string | null;
  createdAt: string;
  updatedAt: string;
}

// ── Auth ─────────────────────────────────────────────────────────────────────

export type UserRole = "dispatcher" | "driver";

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  driverId: string | null; // only set for driver role
}
