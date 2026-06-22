"use client";

import { StoreProvider } from "@/lib/store";
import type { ReactNode } from "react";

export default function DriverLayout({ children }: { children: ReactNode }) {
  return (
    <StoreProvider>
      <div
        style={{
          minHeight: "100vh",
          background: "#0A0A0A",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
        }}
      >
        {/* Constrain to phone-width on desktop */}
        <div
          style={{
            width: "100%",
            maxWidth: "430px",
            flex: 1,
            display: "flex",
            flexDirection: "column",
          }}
        >
          {children}
        </div>
      </div>
    </StoreProvider>
  );
}
