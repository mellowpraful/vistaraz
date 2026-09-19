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
    background: "linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)",
    color: "#ffffff",
    borderTop: "1px solid rgba(255, 255, 255, 0.3)",
    borderRight: "1px solid rgba(59, 130, 246, 0.4)",
    borderBottom: "1px solid rgba(59, 130, 246, 0.4)",
    borderLeft: "1px solid rgba(59, 130, 246, 0.4)",
    boxShadow: "0 4px 14px rgba(37, 99, 235, 0.35)",
  },
  secondary: {
    background: "linear-gradient(145deg, rgba(255, 255, 255, 0.07) 0%, rgba(255, 255, 255, 0.03) 100%)",
    color: "var(--text-primary)",
    borderTop: "1px solid rgba(255, 255, 255, 0.15)",
    borderRight: "1px solid rgba(255, 255, 255, 0.08)",
    borderBottom: "1px solid rgba(255, 255, 255, 0.08)",
    borderLeft: "1px solid rgba(255, 255, 255, 0.08)",
    backdropFilter: "blur(12px)",
  },
  danger: {
    background: "linear-gradient(135deg, #dc2626 0%, #991b1b 100%)",
    color: "#ffffff",
    borderTop: "1px solid rgba(255, 255, 255, 0.3)",
    borderRight: "1px solid rgba(239, 68, 68, 0.4)",
    borderBottom: "1px solid rgba(239, 68, 68, 0.4)",
    borderLeft: "1px solid rgba(239, 68, 68, 0.4)",
    boxShadow: "0 4px 14px rgba(220, 38, 38, 0.35)",
  },
  success: {
    background: "linear-gradient(135deg, #16a34a 0%, #15803d 100%)",
    color: "#ffffff",
    borderTop: "1px solid rgba(255, 255, 255, 0.3)",
    borderRight: "1px solid rgba(34, 197, 94, 0.4)",
    borderBottom: "1px solid rgba(34, 197, 94, 0.4)",
    borderLeft: "1px solid rgba(34, 197, 94, 0.4)",
    boxShadow: "0 4px 14px rgba(34, 197, 94, 0.3)",
  },
  outline: {
    background: "transparent",
    color: "var(--accent-blue-bright)",
    border: "1px solid rgba(59, 130, 246, 0.4)",
  },
  ghost: {
    background: "transparent",
    color: "var(--text-secondary)",
    border: "1px solid transparent",
  },
  accent: {
    background: "linear-gradient(135deg, #7c3aed 0%, #4f46e5 100%)",
    color: "#ffffff",
    borderTop: "1px solid rgba(255, 255, 255, 0.3)",
    borderRight: "1px solid rgba(124, 58, 237, 0.4)",
    borderBottom: "1px solid rgba(124, 58, 237, 0.4)",
    borderLeft: "1px solid rgba(124, 58, 237, 0.4)",
    boxShadow: "0 4px 16px rgba(124, 58, 237, 0.35)",
  },
};

const SIZE_STYLES: Record<ButtonSize, React.CSSProperties> = {
  sm: {
    padding: "5px 11px",
    fontSize: "12px",
    gap: "5px",
    borderRadius: "6px",
  },
  md: {
    padding: "8px 15px",
    fontSize: "13px",
    gap: "7px",
    borderRadius: "7px",
  },
  lg: {
    padding: "10px 20px",
    fontSize: "14px",
    gap: "8px",
    borderRadius: "8px",
  },
  icon: {
    padding: "7px",
    width: "34px",
    height: "34px",
    borderRadius: "7px",
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
      opacity: disabled || loading ? 0.45 : 1,
      transition: "all 0.18s cubic-bezier(0.16, 1, 0.3, 1)",
      fontFamily: "inherit",
      outline: "none",
      whiteSpace: "nowrap",
      userSelect: "none",
      letterSpacing: "0.2px",
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
