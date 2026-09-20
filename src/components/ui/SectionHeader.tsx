import React from "react";
import { LucideIcon } from "lucide-react";

interface SectionHeaderProps {
  /** Section heading text */
  title: string;
  /** Optional count shown in muted text after the title */
  count?: number;
  /** Optional lucide icon */
  icon?: LucideIcon;
  /** Icon color */
  iconColor?: string;
  /** Right-side actions (buttons, badges, etc.) */
  actions?: React.ReactNode;
  /** Bottom border separator */
  withDivider?: boolean;
}

/**
 * SectionHeader — a consistent sub-section heading for use inside pages.
 * Replaces ad-hoc `<h2 className="text-sm font-bold uppercase tracking-wider">` patterns.
 * Uses readable mixed-case, not all-uppercase.
 */
export function SectionHeader({
  title,
  count,
  icon: Icon,
  iconColor = "#94a3b8",
  actions,
  withDivider = false,
}: SectionHeaderProps) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: "12px",
        paddingBottom: withDivider ? "12px" : undefined,
        borderBottom: withDivider ? "1px solid var(--border-primary)" : undefined,
      }}
    >
      {/* Left: Icon + Title + Count */}
      <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
        {Icon && <Icon size={15} color={iconColor} style={{ flexShrink: 0 }} />}
        <h2 className="section-title">{title}</h2>
        {count !== undefined && (
          <span
            style={{
              fontSize: "11px",
              fontWeight: "500",
              color: "var(--text-muted)",
              background: "rgba(255, 255, 255, 0.05)",
              border: "1px solid var(--border-primary)",
              borderRadius: "4px",
              padding: "1px 7px",
            }}
          >
            {count}
          </span>
        )}
      </div>

      {/* Right: Actions */}
      {actions && (
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          {actions}
        </div>
      )}
    </div>
  );
}

export default SectionHeader;
