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
  id: string;
  clientId: string;
  status: DeliveryStatus;
  address: string;
  timeWindowStart: string; // "HH:MM"
  timeWindowEnd: string;   // "HH:MM"
  driverId: string | null;
  contactName: string | null;
  contactPhone: string | null;
  deliveryNotes: string | null;
  dispatchNotes: string | null;
  lat: number | null;
  lng: number | null;
  createdAt: string;
  updatedAt: string;
}
