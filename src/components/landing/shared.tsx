import {
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type ReactNode,
} from "react";
import { cn } from "../utils/cn";

/* ------------------------------------------------------------------ */
/*  useInView — one-shot intersection observer                          */
/* ------------------------------------------------------------------ */
export function useInView<T extends HTMLElement = HTMLDivElement>(
  threshold = 0.22,
  rootMargin = "0px 0px -8% 0px",
) {
  const ref = useRef<T | null>(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true);
          obs.disconnect();
        }
      },
      { threshold, rootMargin },
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [threshold, rootMargin]);

  return { ref, inView };
}

/* ------------------------------------------------------------------ */
/*  Reveal                                                              */
/* ------------------------------------------------------------------ */
export function Reveal({
  children,
  delay = 0,
  className,
  as: Tag = "div",
}: {
  children: ReactNode;
  delay?: number;
  className?: string;
  as?: "div" | "section" | "li" | "span";
}) {
  const { ref, inView } = useInView<HTMLDivElement>();
  return (
    <Tag
      ref={ref as never}
      className={cn("vz-rise", inView && "in", className)}
      style={{ "--d": `${delay}ms` } as CSSProperties}
    >
      {children}
    </Tag>
  );
}

/* ------------------------------------------------------------------ */
/*  Panel — the shared card surface of the whole system                 */
/* ------------------------------------------------------------------ */
export function Panel({
  children,
  className,
  glow,
}: {
  children: ReactNode;
  className?: string;
  glow?: "accent" | "crit" | "warn" | "none";
}) {
  const glowMap = {
    accent: "before:bg-[radial-gradient(120%_90%_at_50%_-20%,rgba(34,211,238,0.10),transparent_65%)]",
    crit: "before:bg-[radial-gradient(120%_90%_at_50%_-20%,rgba(239,68,68,0.10),transparent_65%)]",
    warn: "before:bg-[radial-gradient(120%_90%_at_50%_-20%,rgba(245,158,11,0.10),transparent_65%)]",
    none: "before:hidden",
  } as const;

  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-[16px] border border-white/[0.07] bg-[#0d1821]/80 backdrop-blur-[2px]",
        "shadow-[0_1px_0_0_rgba(255,255,255,0.04)_inset,0_18px_40px_-24px_rgba(0,0,0,0.9)]",
        "transition-all duration-300 hover:-translate-y-[3px] hover:border-cyan-300/20 hover:shadow-[0_1px_0_0_rgba(255,255,255,0.06)_inset,0_22px_50px_-22px_rgba(34,211,238,0.18)]",
        "before:pointer-events-none before:absolute before:inset-0 before:content-['']",
        glowMap[glow ?? "none"],
        className,
      )}
    >
      <div className="relative h-full">{children}</div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Small atoms                                                         */
/* ------------------------------------------------------------------ */
export function StatusDot({
  tone = "accent",
  pulse = true,
  className,
}: {
  tone?: "accent" | "warn" | "crit" | "ok" | "idle";
  pulse?: boolean;
  className?: string;
}) {
  const tones: Record<string, string> = {
    accent: "bg-cyan-400 shadow-[0_0_10px_2px_rgba(34,211,238,0.55)]",
    warn: "bg-amber-400 shadow-[0_0_10px_2px_rgba(245,158,11,0.5)]",
    crit: "bg-red-500 shadow-[0_0_10px_2px_rgba(239,68,68,0.55)]",
    ok: "bg-emerald-400 shadow-[0_0_10px_2px_rgba(52,211,153,0.5)]",
    idle: "bg-slate-500",
  };
  return (
    <span className={cn("relative inline-flex h-1.5 w-1.5 shrink-0", className)}>
      {pulse && tone !== "idle" && (
        <span
          className={cn("absolute inset-0 rounded-full vz-ping", tones[tone].split(" ")[0])}
        />
      )}
      <span className={cn("relative h-1.5 w-1.5 rounded-full", tones[tone])} />
    </span>
  );
}

export function Eyebrow({
  children,
  tone = "accent",
  className,
}: {
  children: ReactNode;
  tone?: "accent" | "crit";
  className?: string;
}) {
  return (
    <div
      className={cn(
        "inline-flex items-center gap-2.5 rounded-full border px-3.5 py-1.5",
        "font-mono text-[10.5px] font-medium uppercase tracking-[0.22em] backdrop-blur-sm",
        tone === "accent"
          ? "border-cyan-400/20 bg-cyan-400/[0.06] text-cyan-300"
          : "border-red-500/20 bg-red-500/[0.06] text-red-300",
        className,
      )}
    >
      {children}
    </div>
  );
}

export function SectionHeading({
  title,
  sub,
  align = "center",
  className,
}: {
  title: ReactNode;
  sub?: ReactNode;
  align?: "center" | "left";
  className?: string;
}) {
  const { ref, inView } = useInView<HTMLDivElement>();
  return (
    <div
      ref={ref}
      className={cn(
        "vz-rise",
        inView && "in",
        align === "center" ? "mx-auto max-w-3xl text-center" : "max-w-3xl",
        className,
      )}
    >
      <h2 className="text-balance text-[clamp(1.85rem,3.6vw,3rem)] font-semibold leading-[1.08] tracking-[-0.035em] text-slate-50">
        {title}
      </h2>
      {sub && (
        <p
          className={cn(
            "mt-5 text-[15px] leading-relaxed text-slate-400 sm:text-base",
            align === "center" && "mx-auto max-w-2xl",
          )}
        >
          {sub}
        </p>
      )}
    </div>
  );
}

export function SectionShell({
  id,
  children,
  className,
  borderTop = true,
}: {
  id?: string;
  children: ReactNode;
  className?: string;
  borderTop?: boolean;
}) {
  return (
    <section
      id={id}
      className={cn(
        "relative w-full flex flex-col items-center justify-center overflow-hidden scroll-mt-24",
        borderTop && "border-t border-white/[0.055]",
        className,
      )}
    >
      {children}
    </section>
  );
}

/* mono label w/ hairline */
export function MonoLabel({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "font-mono text-[10.5px] uppercase tracking-[0.2em] text-slate-500",
        className,
      )}
    >
      {children}
    </span>
  );
}


