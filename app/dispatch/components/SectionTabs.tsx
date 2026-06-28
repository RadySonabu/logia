"use client";

export type Section = "pending" | "on-going" | "completed" | "issues";
export type ActiveView = Section | "summary";

interface TabDef {
  key:   Section;
  label: string;
}

const TABS: TabDef[] = [
  { key: "pending",   label: "PENDING"   },
  { key: "on-going",  label: "ON-GOING"  },
  { key: "completed", label: "COMPLETED" },
  { key: "issues",    label: "ISSUES"    },
];

interface Props {
  active:   ActiveView;
  counts:   Record<Section, number>;
  onChange: (v: ActiveView) => void;
}

export function SectionTabs({ active, counts, onChange }: Props) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "stretch",
        background: "#0A0A0A",
        borderBottom: "1px solid #1A1A1A",
        padding: "0 20px",
        gap: "0",
        flexShrink: 0,
      }}
    >
      {TABS.map(({ key, label }) => {
        const isActive = active === key;
        const count    = counts[key];
        const isIssues = key === "issues";

        return (
          <button
            key={key}
            onClick={() => onChange(key)}
            style={{
              position: "relative",
              height: "40px",
              padding: "0 18px",
              background: "transparent",
              border: "none",
              borderBottom: isActive ? `2px solid #F5A623` : "2px solid transparent",
              color: isActive ? "#F0F0F0" : "#484848",
              fontFamily: "var(--font-barlow)",
              fontWeight: 700,
              fontSize: "11px",
              letterSpacing: "0.08em",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: "7px",
              transition: "color 0.15s, border-color 0.15s",
            }}
          >
            {label}
            {count > 0 && (
              <span
                style={{
                  fontFamily: "var(--font-plex)",
                  fontWeight: 400,
                  fontSize: "10px",
                  background: isIssues ? "rgba(248,113,113,0.15)" : isActive ? "rgba(245,166,35,0.15)" : "#1A1A1A",
                  color: isIssues ? "#F87171" : isActive ? "#F5A623" : "#555",
                  border: `1px solid ${isIssues ? "rgba(248,113,113,0.3)" : isActive ? "rgba(245,166,35,0.3)" : "#2E2E2E"}`,
                  borderRadius: "2px",
                  padding: "1px 6px",
                  lineHeight: 1.6,
                  transition: "background 0.15s, color 0.15s",
                }}
              >
                {count}
              </span>
            )}
          </button>
        );
      })}

      {/* Spacer */}
      <div style={{ flex: 1 }} />

      {/* Summary button */}
      <button
        onClick={() => onChange("summary")}
        style={{
          height: "40px",
          padding: "0 16px",
          background: "transparent",
          border: "none",
          borderBottom: active === "summary" ? "2px solid #F5A623" : "2px solid transparent",
          color: active === "summary" ? "#F5A623" : "#2E2E2E",
          fontFamily: "var(--font-barlow)",
          fontWeight: 700,
          fontSize: "11px",
          letterSpacing: "0.08em",
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          gap: "6px",
          transition: "color 0.15s, border-color 0.15s",
        }}
      >
        <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.4">
          <rect x="1" y="1" width="4" height="4" rx="0.5" />
          <rect x="7" y="1" width="4" height="4" rx="0.5" />
          <rect x="1" y="7" width="4" height="4" rx="0.5" />
          <rect x="7" y="7" width="4" height="4" rx="0.5" />
        </svg>
        SUMMARY
      </button>
    </div>
  );
}
