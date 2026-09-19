import React from "react";

interface CardProps {
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
  hover?: boolean;
  accent?: string;
  onClick?: () => void;
}

export function Card({ children, style, hover = false, accent, onClick }: CardProps) {
  const [hovered, setHovered] = React.useState(false);
  return (
    <div
      onClick={onClick}
      onMouseEnter={() => hover && setHovered(true)}
      onMouseLeave={() => hover && setHovered(false)}
      style={{
        background: hovered
          ? "linear-gradient(145deg, rgba(21, 31, 50, 0.95) 0%, rgba(15, 22, 35, 0.95) 100%)"
          : "linear-gradient(145deg, rgba(15, 22, 35, 0.85) 0%, rgba(10, 14, 23, 0.85) 100%)",
        borderStyle: "solid",
        borderTopWidth: "1px",
        borderRightWidth: "1px",
        borderBottomWidth: "1px",
        borderLeftWidth: accent ? "3px" : "1px",
        borderTopColor: hovered ? "rgba(255, 255, 255, 0.15)" : "rgba(255, 255, 255, 0.07)",
        borderRightColor: hovered ? "rgba(255, 255, 255, 0.15)" : "rgba(255, 255, 255, 0.07)",
        borderBottomColor: hovered ? "rgba(255, 255, 255, 0.15)" : "rgba(255, 255, 255, 0.07)",
        borderLeftColor: accent
          ? accent
          : (hovered ? "rgba(255, 255, 255, 0.15)" : "rgba(255, 255, 255, 0.07)"),
        borderRadius: "10px",
        transition: "all 0.25s cubic-bezier(0.16, 1, 0.3, 1)",
        cursor: onClick ? "pointer" : undefined,
        boxShadow: hovered
          ? "0 12px 32px -4px rgba(0, 0, 0, 0.5), 0 0 15px rgba(59, 130, 246, 0.1)"
          : "0 4px 20px rgba(0, 0, 0, 0.25)",
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
