import type { Delivery, Client, Driver } from "./types";

interface ExportRow {
  "SR Number":                string;
  "Date":                     string;
  "Status":                   string;
  "Client":                   string;
  "Customer Name":            string;
  "SR Problem Summary":       string;
  "Declared Quantity":        number;
  "Actual Quantity":          number | string;
  "Contact Address Line 1":   string;
  "Contact Address Line 2":   string;
  "Proposed Pullout Schedule": string;
  "Actual Date of Pullout":   string;
  "Vehicle Type":             string;
  "Driver Name":              string;
  "Dispatch Notes":           string;
}

export async function exportToExcel(
  deliveries: Delivery[],
  clients:    Client[],
  drivers:    Driver[],
  filename = "relay-export"
) {
  const { utils, writeFile } = await import("xlsx");

  const clientMap = Object.fromEntries(clients.map((c) => [c.id, c.name]));
  const driverMap = Object.fromEntries(drivers.map((d) => [d.id, d.name]));

  const rows: ExportRow[] = deliveries.map((d) => ({
    "SR Number":                d.srNumber,
    "Date":                     d.date,
    "Status":                   d.status.replace(/_/g, " ").toUpperCase(),
    "Client":                   clientMap[d.clientId] ?? "",
    "Customer Name":            d.customerName,
    "SR Problem Summary":       d.srProblemSummary,
    "Declared Quantity":        d.declaredQuantity,
    "Actual Quantity":          d.actualQuantity ?? "",
    "Contact Address Line 1":   d.contactAddressLine1,
    "Contact Address Line 2":   d.contactAddressLine2 ?? "",
    "Proposed Pullout Schedule": d.proposedPulloutSchedule.replace("T", " "),
    "Actual Date of Pullout":   d.actualDateOfPullout ?? "",
    "Vehicle Type":             d.vehicleType ?? "",
    "Driver Name":              d.driverId ? (driverMap[d.driverId] ?? "") : "",
    "Dispatch Notes":           d.dispatchNotes ?? "",
  }));

  const worksheet = utils.json_to_sheet(rows);

  // Column widths (approximate chars)
  worksheet["!cols"] = [
    { wch: 12 }, // SR Number
    { wch: 12 }, // Date
    { wch: 12 }, // Status
    { wch: 18 }, // Client
    { wch: 26 }, // Customer Name
    { wch: 40 }, // SR Problem Summary
    { wch: 10 }, // Declared Quantity
    { wch: 10 }, // Actual Quantity
    { wch: 28 }, // Address Line 1
    { wch: 22 }, // Address Line 2
    { wch: 22 }, // Proposed Pullout Schedule
    { wch: 20 }, // Actual Date of Pullout
    { wch: 18 }, // Vehicle Type
    { wch: 16 }, // Driver Name
    { wch: 30 }, // Dispatch Notes
  ];

  const workbook = utils.book_new();
  utils.book_append_sheet(workbook, worksheet, "Service Requests");

  const dateTag = new Date().toISOString().slice(0, 10);
  writeFile(workbook, `${filename}-${dateTag}.xlsx`);
}
