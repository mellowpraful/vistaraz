import React from "react";

interface CardProps {
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
  hover?: boolean;
  accent?: string;
  onClick?: () => void;
}

export function Card({ children, className, style, hover = false, accent, onClick }: CardProps) {
  const [hovered, setHovered] = React.useState(false);
  return (
    <div
      onClick={onClick}
      onMouseEnter={() => hover && setHovered(true)}
      onMouseLeave={() => hover && setHovered(false)}
      className={`card ${className || ""}`}
      style={{
        background: hovered ? "var(--bg-card-hover)" : "var(--bg-card)",
        borderStyle: "solid",
        borderTopWidth: "1px",
        borderRightWidth: "1px",
        borderBottomWidth: "1px",
        borderLeftWidth: accent ? "3px" : "1px",
        borderTopColor: hovered ? "var(--border-secondary)" : "var(--border-primary)",
        borderRightColor: hovered ? "var(--border-secondary)" : "var(--border-primary)",
        borderBottomColor: hovered ? "var(--border-secondary)" : "var(--border-primary)",
        borderLeftColor: accent
          ? accent
          : (hovered ? "var(--border-secondary)" : "var(--border-primary)"),
        borderRadius: "10px",
        transition: "all 0.22s cubic-bezier(0.16, 1, 0.3, 1)",
        cursor: onClick ? "pointer" : undefined,
        boxShadow: hovered
          ? "0 10px 30px -4px rgba(0, 0, 0, 0.15), 0 0 15px rgba(37, 99, 235, 0.08)"
          : "0 4px 18px rgba(0, 0, 0, 0.06)",
        backdropFilter: "blur(12px)",
        WebkitBackdropFilter: "blur(12px)",
        ...style,
      }}
    >
      {children}
    </div>
  );
}

export function CardHeader({
  children,
  style,
}: {
  children: React.ReactNode;
  style?: React.CSSProperties;
}) {
  return (
    <div
      style={{
        padding: "14px 18px",
        borderStyle: "solid",
        borderTopWidth: "0px",
        borderRightWidth: "0px",
        borderBottomWidth: "1px",
        borderLeftWidth: "0px",
        borderBottomColor: "var(--border-primary)",
        borderTopColor: "transparent",
        borderRightColor: "transparent",
        borderLeftColor: "transparent",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: "10px",
        ...style,
      }}
    >
      {children}
    </div>
  );
}

export function CardTitle({
  children,
  style,
}: {
  children: React.ReactNode;
  style?: React.CSSProperties;
}) {
  return (
    <div
      style={{
        fontSize: "14px",
        fontWeight: "700",
        color: "var(--text-primary)",
        display: "flex",
        alignItems: "center",
        gap: "8px",
        ...style,
      }}
    >
      {children}
    </div>
  );
}

export function CardContent({
  children,
  style,
}: {
  children: React.ReactNode;
  style?: React.CSSProperties;
}) {
  return (
    <div
      style={{
        padding: "16px 18px",
        ...style,
      }}
    >
      {children}
    </div>
  );
}

export function CardFooter({
  children,
  style,
}: {
  children: React.ReactNode;
  style?: React.CSSProperties;
}) {
  return (
    <div
      style={{
        padding: "10px 18px",
        borderStyle: "solid",
        borderTopWidth: "1px",
        borderRightWidth: "0px",
        borderBottomWidth: "0px",
        borderLeftWidth: "0px",
        borderTopColor: "var(--border-primary)",
        borderRightColor: "transparent",
        borderBottomColor: "transparent",
        borderLeftColor: "transparent",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        ...style,
      }}
    >
      {children}
    </div>
  );
}

export default Card;
