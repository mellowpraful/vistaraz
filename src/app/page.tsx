"use client";

import { useEffect, useState } from "react";
import { Nav } from "@/components/landing/Nav";
import { Hero } from "@/components/landing/Hero";
import { SignalStrip } from "@/components/landing/SignalStrip";
import { Problem } from "@/components/landing/Problem";
import { Pillars } from "@/components/landing/Pillars";
import { AICommander } from "@/components/landing/AICommander";
import { Simulation } from "@/components/landing/Simulation";
import { ResourceIntel } from "@/components/landing/ResourceIntel";
import { Voice } from "@/components/landing/Voice";
import { CommandCentre } from "@/components/landing/CommandCentre";
import { Lifecycle } from "@/components/landing/Lifecycle";
import { Analytics } from "@/components/landing/Analytics";
import { Footer, FinalCTA, Trust } from "@/components/landing/Closing";

function ScrollProgress() {
  const [p, setP] = useState(0);

  useEffect(() => {
    const onScroll = () => {
      const h = document.documentElement.scrollHeight - window.innerHeight;
      setP(h > 0 ? Math.min(1, window.scrollY / h) : 0);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, []);

  return (
    <div className="pointer-events-none fixed left-0 top-0 z-[60] h-[2px] w-full">
      <div
        className="h-full bg-gradient-to-r from-cyan-400 via-cyan-300 to-emerald-400 shadow-[0_0_12px_0_rgba(34,211,238,0.8)] transition-[width] duration-150 ease-out"
        style={{ width: `${p * 100}%` }}
      />
    </div>
  );
}

export default function LandingPage() {
  return (
    <div className="relative min-h-screen w-full max-w-full overflow-x-hidden bg-[#050A0F] text-slate-200 antialiased selection:bg-cyan-400/20 flex flex-col items-center justify-start">
      <ScrollProgress />
      <Nav />

      <main className="relative w-full max-w-full overflow-x-hidden flex flex-col items-center">
        <Hero />
        <SignalStrip />
        <Problem />
        <Pillars />
        <AICommander />
        <Simulation />
        <ResourceIntel />
        <Voice />
        <CommandCentre />
        <Lifecycle />
        <Analytics />
        <Trust />
        <FinalCTA />
      </main>

      <Footer />
    </div>
  );
}
