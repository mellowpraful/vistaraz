import React from "react";
import { LucideIcon } from "lucide-react";

interface PageHeaderProps {
  /** The page title — rendered as the page <h1> */
  title: string;
  /** Short description of what this page does */
  description?: string;
  /** A lucide-react icon to display beside the title */
  icon?: LucideIcon;
  /** Icon color (defaults to blue) */
  iconColor?: string;
  /** Right-side actions: buttons, selectors, badges */
  actions?: React.ReactNode;
  /** Optional status badge shown after the title */
  badge?: React.ReactNode;
}

/**
 * PageHeader — used at the top of every main page.
 * Provides consistent h1 typography, icon treatment, and action placement.
 * Replaces ad-hoc page header patterns that mixed emojis and monospace text.
 */
export function PageHeader({
  title,
  description,
  icon: Icon,
  iconColor = "#3b82f6",
  actions,
  badge,
}: PageHeaderProps) {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "row",
        alignItems: "flex-start",
        justifyContent: "space-between",
        gap: "16px",
        flexWrap: "wrap",
      }}
    >
      {/* Left: Icon + Title + Description */}
      <div style={{ display: "flex", alignItems: "flex-start", gap: "14px", minWidth: 0 }}>
        {Icon && (
          <div
            style={{
              width: "40px",
              height: "40px",
              minWidth: "40px",
              borderRadius: "10px",
              background: iconColor + "18",
              border: `1px solid ${iconColor}35`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              marginTop: "2px",
            }}
          >
            <Icon size={20} color={iconColor} />
          </div>
        )}

        <div style={{ minWidth: 0 }}>
          <div style={{ display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap" }}>
            <h1 className="page-title">{title}</h1>
            {badge}
          </div>
          {description && (
            <p className="page-subtitle">{description}</p>
          )}
        </div>
      </div>

      {/* Right: Actions */}
      {actions && (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "8px",
            flexShrink: 0,
            flexWrap: "wrap",
          }}
        >
          {actions}
        </div>
      )}
    </div>
  );
}

export default PageHeader;
