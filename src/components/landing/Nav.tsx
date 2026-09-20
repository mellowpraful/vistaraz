import { useEffect, useState } from "react";
import { cn } from "../utils/cn";
import { StatusDot } from "./shared";

const LINKS = [
  { label: "Platform", href: "#platform" },
  { label: "Intelligence", href: "#commander" },
  { label: "Operations", href: "#command-centre" },
  { label: "Simulation", href: "#simulation" },
  { label: "About", href: "#trust" },
];

export function Nav() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={cn(
        "fixed inset-x-0 top-0 z-50 flex justify-center transition-all duration-300",
        scrolled
          ? "border-b border-white/[0.07] bg-[#050A0F]/80 backdrop-blur-xl"
          : "border-b border-transparent",
      )}
    >
      <nav className="mx-auto flex h-16 w-full max-w-[1240px] items-center justify-between px-5 sm:px-8">
        {/* brand */}
        <a href="#top" className="group flex items-center gap-3">
          <span className="relative grid h-8 w-8 place-items-center rounded-[9px] border border-cyan-400/25 bg-cyan-400/[0.07]">
            <svg viewBox="0 0 24 24" className="h-4 w-4 text-cyan-300" fill="none" stroke="currentColor" strokeWidth="1.8">
              <path d="M12 2.6 3.4 6.2v6.1c0 5 3.7 8.3 8.6 9.1 4.9-.8 8.6-4.1 8.6-9.1V6.2L12 2.6Z" strokeLinejoin="round" />
              <path d="M12 8.6v6.8M8.6 12h6.8" strokeLinecap="round" />
            </svg>
            <span className="absolute inset-0 rounded-[9px] shadow-[0_0_18px_-4px_rgba(34,211,238,0.7)]" />
          </span>
          <span className="flex flex-col leading-none">
            <span className="text-[15px] font-semibold tracking-[0.14em] text-slate-100">
              VISTARAZ
            </span>
            <span className="mt-[3px] font-mono text-[9px] uppercase tracking-[0.16em] text-slate-500">
              Emergency Intelligence Platform
            </span>
          </span>
        </a>

        {/* desktop links */}
        <div className="hidden items-center gap-1 lg:flex">
          {LINKS.map((l) => (
            <a
              key={l.label}
              href={l.href}
              className="rounded-md px-3 py-2 text-[13.5px] text-slate-400 transition-colors hover:text-slate-100"
            >
              {l.label}
            </a>
          ))}
        </div>

        <div className="flex items-center gap-3">
          <div className="hidden items-center gap-2 rounded-full border border-white/[0.07] bg-white/[0.02] px-3 py-1.5 md:flex">
            <StatusDot tone="ok" />
            <span className="font-mono text-[9.5px] uppercase tracking-[0.18em] text-slate-400">
              System operational
            </span>
          </div>
          <a
            href="/login"
            className="group inline-flex items-center gap-2 rounded-[9px] border border-cyan-400/30 bg-cyan-400/[0.08] px-4 py-2 text-[13px] font-medium text-cyan-200 transition-all hover:-translate-y-[1px] hover:border-cyan-300/50 hover:bg-cyan-400/[0.14] hover:shadow-[0_8px_28px_-10px_rgba(34,211,238,0.6)]"
          >
            Open Command Centre
            <svg viewBox="0 0 16 16" className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" fill="none" stroke="currentColor" strokeWidth="1.6">
              <path d="M3 8h9M8.5 4.5 12 8l-3.5 3.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </a>

          <button
            onClick={() => setOpen((v) => !v)}
            className="grid h-9 w-9 place-items-center rounded-md border border-white/[0.08] text-slate-300 lg:hidden"
            aria-label="Toggle menu"
          >
            <svg viewBox="0 0 20 20" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.7">
              {open ? <path d="M5 5l10 10M15 5 5 15" strokeLinecap="round" /> : <path d="M3 6h14M3 10h14M3 14h14" strokeLinecap="round" />}
            </svg>
          </button>
        </div>
      </nav>

      {/* mobile drawer */}
      <div
        className={cn(
          "overflow-hidden border-t border-white/[0.06] bg-[#050A0F]/95 backdrop-blur-xl transition-all duration-300 lg:hidden",
          open ? "max-h-72" : "max-h-0",
        )}
      >
        <div className="flex flex-col px-5 py-3">
          {LINKS.map((l) => (
            <a
              key={l.label}
              href={l.href}
              onClick={() => setOpen(false)}
              className="border-b border-white/[0.05] py-3 text-sm text-slate-300 last:border-0"
            >
              {l.label}
            </a>
          ))}
        </div>
      </div>
    </header>
  );
}
