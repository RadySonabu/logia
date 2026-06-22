import type { ReactNode } from "react";

export default function DispatchLayout({ children }: { children: ReactNode }) {
  return (
    <div style={{ height: "100vh", display: "flex", flexDirection: "column", overflow: "hidden", minWidth: "1080px" }}>
      {children}
    </div>
  );
}
