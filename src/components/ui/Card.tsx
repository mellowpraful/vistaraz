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
        background: hovered ? "var(--bg-card-hover)" : "var(--bg-card)",
        border: `1px solid ${hovered ? "var(--border-secondary)" : "var(--border-primary)"}`,
        borderLeft: accent ? `3px solid ${accent}` : undefined,
        borderRadius: "8px",
        transition: "all 0.2s",
        cursor: onClick ? "pointer" : undefined,
        boxShadow: hovered ? "0 4px 24px rgba(0,0,0,0.3)" : "none",
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
        borderBottom: "1px solid var(--border-primary)",
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
        borderTop: "1px solid var(--border-primary)",
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
