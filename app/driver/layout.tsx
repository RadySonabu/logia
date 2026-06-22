"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { StoreProvider } from "@/lib/store";
import { useAuth } from "@/lib/auth";
import type { ReactNode } from "react";

export default function DriverLayout({ children }: { children: ReactNode }) {
  return (
    <StoreProvider>
      <AuthGuard>{children}</AuthGuard>
    </StoreProvider>
  );
}

function AuthGuard({ children }: { children: ReactNode }) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) router.replace("/login");
    if (!loading && user && user.role !== "driver") router.replace("/dispatch");
  }, [user, loading, router]);

  if (loading || !user || user.role !== "driver") return null;

  return (
    <div style={{ minHeight: "100vh", background: "#0A0A0A", display: "flex", flexDirection: "column", alignItems: "center" }}>
      <div style={{ width: "100%", maxWidth: "430px", flex: 1, display: "flex", flexDirection: "column" }}>
        {children}
      </div>
    </div>
  );
}
