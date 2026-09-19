import React, { forwardRef } from "react";
import { Loader2 } from "lucide-react";

export type ButtonVariant =
  | "primary"
  | "secondary"
  | "danger"
  | "success"
  | "outline"
  | "ghost"
  | "accent";

export type ButtonSize = "sm" | "md" | "lg" | "icon";

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  icon?: React.ReactNode;
  iconPosition?: "left" | "right";
}

const VARIANT_STYLES: Record<ButtonVariant, React.CSSProperties> = {
  primary: {
    background: "var(--accent-blue)",
    color: "#ffffff",
    border: "1px solid var(--accent-blue)",
    boxShadow: "0 2px 8px rgba(37,99,235,0.25)",
  },
  secondary: {
    background: "var(--bg-elevated)",
    color: "var(--text-primary)",
    border: "1px solid var(--border-primary)",
  },
  danger: {
    background: "#7f1d1d",
    color: "#fca5a5",
    border: "1px solid #991b1b",
    boxShadow: "0 2px 8px rgba(239,68,68,0.2)",
  },
  success: {
    background: "#14532d",
    color: "#86efac",
    border: "1px solid #166534",
    boxShadow: "0 2px 8px rgba(34,197,94,0.2)",
  },
  outline: {
    background: "transparent",
    color: "var(--accent-blue-bright)",
    border: "1px solid var(--accent-blue)",
  },
  ghost: {
    background: "transparent",
    color: "var(--text-secondary)",
    border: "1px solid transparent",
  },
  accent: {
    background: "linear-gradient(135deg, #1d4ed8, #7c3aed)",
    color: "#ffffff",
    border: "1px solid #6366f1",
    boxShadow: "0 2px 12px rgba(99,102,241,0.3)",
  },
};

const SIZE_STYLES: Record<ButtonSize, React.CSSProperties> = {
  sm: {
    padding: "4px 10px",
    fontSize: "12px",
    gap: "5px",
    borderRadius: "5px",
  },
  md: {
    padding: "7px 14px",
    fontSize: "13px",
    gap: "7px",
    borderRadius: "6px",
  },
  lg: {
    padding: "10px 18px",
    fontSize: "14px",
    gap: "8px",
    borderRadius: "8px",
  },
  icon: {
    padding: "7px",
    width: "32px",
    height: "32px",
    borderRadius: "6px",
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
  },
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      children,
      variant = "secondary",
      size = "md",
      loading = false,
      disabled = false,
      icon,
      iconPosition = "left",
      style,
      className,
      ...props
    },
    ref
  ) => {
    const baseStyle: React.CSSProperties = {
      display: "inline-flex",
      alignItems: "center",
      justifyContent: "center",
      fontWeight: 600,
      cursor: disabled || loading ? "not-allowed" : "pointer",
      opacity: disabled || loading ? 0.55 : 1,
      transition: "all 0.15s ease",
      fontFamily: "inherit",
      outline: "none",
      whiteSpace: "nowrap",
      userSelect: "none",
      ...VARIANT_STYLES[variant],
      ...SIZE_STYLES[size],
      ...style,
    };

    return (
      <button
        ref={ref}
        disabled={disabled || loading}
        style={baseStyle}
        className={`btn btn-${variant} ${className || ""}`}
        {...props}
      >
        {loading && (
          <Loader2
            size={size === "sm" ? 12 : 14}
            className="animate-spin"
            style={{ animation: "spin 1s linear infinite" }}
          />
        )}
        {!loading && icon && iconPosition === "left" && icon}
        {children}
        {!loading && icon && iconPosition === "right" && icon}
      </button>
    );
  }
);

Button.displayName = "Button";
