import React, { forwardRef } from "react";
import { ChevronDown } from "lucide-react";

export interface SelectProps
  extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  helperText?: string;
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ label, error, helperText, children, style, className, id, ...props }, ref) => {
    const selectId = id || (label ? label.toLowerCase().replace(/\s+/g, "-") : undefined);

    return (
      <div style={{ display: "flex", flexDirection: "column", gap: "5px", width: "100%" }}>
        {label && (
          <label
            htmlFor={selectId}
            style={{
              fontSize: "11px",
              fontWeight: 700,
              textTransform: "uppercase",
              letterSpacing: "0.8px",
              color: error ? "#f87171" : "var(--text-secondary)",
            }}
          >
            {label}
          </label>
        )}
        <div style={{ position: "relative", display: "flex", alignItems: "center" }}>
          <select
            ref={ref}
            id={selectId}
            style={{
              width: "100%",
              background: "var(--bg-secondary)",
              border: `1px solid ${error ? "#ef4444" : "var(--border-primary)"}`,
              borderRadius: "6px",
              padding: "8px 32px 8px 12px",
              color: "var(--text-primary)",
              fontSize: "13px",
              fontFamily: "inherit",
              outline: "none",
              appearance: "none",
              cursor: "pointer",
              transition: "border-color 0.15s ease, box-shadow 0.15s ease",
              boxShadow: error ? "0 0 0 1px #ef4444" : "none",
              ...style,
            }}
            className={`input select ${className || ""}`}
            onFocus={(e) => {
              e.currentTarget.style.borderColor = error ? "#ef4444" : "var(--accent-blue)";
              e.currentTarget.style.boxShadow = error
                ? "0 0 0 2px rgba(239,68,68,0.25)"
                : "0 0 0 2px rgba(37,99,235,0.25)";
            }}
            onBlur={(e) => {
              e.currentTarget.style.borderColor = error ? "#ef4444" : "var(--border-primary)";
              e.currentTarget.style.boxShadow = error ? "0 0 0 1px #ef4444" : "none";
            }}
            {...props}
          >
            {children}
          </select>
          <ChevronDown
            size={14}
            style={{
              position: "absolute",
              right: "10px",
              pointerEvents: "none",
              color: "var(--text-muted)",
            }}
          />
        </div>
        {error && (
          <span style={{ fontSize: "11px", color: "#f87171", fontWeight: 500 }}>
            {error}
          </span>
        )}
        {!error && helperText && (
          <span style={{ fontSize: "11px", color: "var(--text-muted)" }}>
            {helperText}
          </span>
        )}
      </div>
    );
  }
);

Select.displayName = "Select";
