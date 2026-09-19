import React, { forwardRef } from "react";

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    {
      label,
      error,
      helperText,
      leftIcon,
      rightIcon,
      style,
      className,
      id,
      ...props
    },
    ref
  ) => {
    const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, "-") : undefined);

    return (
      <div style={{ display: "flex", flexDirection: "column", gap: "5px", width: "100%" }}>
        {label && (
          <label
            htmlFor={inputId}
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
          {leftIcon && (
            <div
              style={{
                position: "absolute",
                left: "10px",
                display: "flex",
                alignItems: "center",
                pointerEvents: "none",
                color: "var(--text-muted)",
              }}
            >
              {leftIcon}
            </div>
          )}
          <input
            ref={ref}
            id={inputId}
            style={{
              width: "100%",
              background: "var(--bg-secondary)",
              border: `1px solid ${error ? "#ef4444" : "var(--border-primary)"}`,
              borderRadius: "6px",
              padding: leftIcon ? "8px 12px 8px 34px" : rightIcon ? "8px 34px 8px 12px" : "8px 12px",
              color: "var(--text-primary)",
              fontSize: "13px",
              fontFamily: "inherit",
              outline: "none",
              transition: "border-color 0.15s ease, box-shadow 0.15s ease",
              boxShadow: error ? "0 0 0 1px #ef4444" : "none",
              ...style,
            }}
            className={`input ${className || ""}`}
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
          />
          {rightIcon && (
            <div
              style={{
                position: "absolute",
                right: "10px",
                display: "flex",
                alignItems: "center",
                color: "var(--text-muted)",
              }}
            >
              {rightIcon}
            </div>
          )}
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

Input.displayName = "Input";
