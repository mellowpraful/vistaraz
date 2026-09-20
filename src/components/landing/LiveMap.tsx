import { cn } from "../utils/cn";
import { StatusDot } from "./shared";

type MapProps = {
  className?: string;
  /** "hero" | "slow" | "sim" — controls tempo & which overlays render */
  variant?: "hero" | "slow" | "sim";
  /** 0 – 100 : how blocked the primary corridor is */
  closure?: number;
  children?: React.ReactNode;
};

const ROUTE_AMB = "M152,268 L350,268 L350,132 L392,132";
const ROUTE_FIRE = "M470,86 L470,132 L392,132";
const ROUTE_ALT = "M152,268 L152,380 L286,380 L286,268 L350,268 L350,132 L392,132";

export function LiveMap({ className, variant = "hero", closure = 0, children }: MapProps) {
  const slow = variant === "slow";
  const sim = variant === "sim";
  const blocked = closure > 18;

  return (
    <div className={cn("relative h-full w-full overflow-hidden", className)}>
      {/* base wash */}
      <div className="absolute inset-0 bg-[radial-gradient(90%_80%_at_60%_25%,#0E1D27_0%,#080F16_60%,#050A0F_100%)]" />

      <svg
        viewBox="0 0 620 440"
        className={cn(
          "absolute -inset-[6%] h-[112%] w-[112%]",
          slow ? "vz-pan-slow" : "vz-pan",
        )}
        preserveAspectRatio="xMidYMid slice"
      >
        <defs>
          <linearGradient id="vzRouteGrad" x1="0" y1="1" x2="1" y2="0">
            <stop offset="0%" stopColor="#22D3EE" stopOpacity="0.15" />
            <stop offset="100%" stopColor="#22D3EE" stopOpacity="0.95" />
          </linearGradient>
          <linearGradient id="vzFireGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#F59E0B" stopOpacity="0.9" />
            <stop offset="100%" stopColor="#F59E0B" stopOpacity="0.25" />
          </linearGradient>
          <filter id="vzGlow" x="-70%" y="-70%" width="240%" height="240%">
            <feGaussianBlur stdDeviation="3.4" result="b" />
            <feMerge>
              <feMergeNode in="b" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* ---- fine geospatial grid ---- */}
        <g stroke="rgba(34,211,238,0.07)" strokeWidth="1">
          {Array.from({ length: 13 }).map((_, i) => (
            <line key={`v${i}`} x1={i * 50} y1={0} x2={i * 50} y2={440} />
          ))}
          {Array.from({ length: 9 }).map((_, i) => (
            <line key={`h${i}`} x1={0} y1={i * 50} x2={620} y2={440} />
          ))}
        </g>

        {/* ---- city blocks ---- */}
        <g fill="rgba(148,197,219,0.035)">
          {[
            [18, 18, 74, 54],
            [112, 18, 104, 54],
            [236, 18, 96, 54],
            [352, 18, 100, 54],
            [18, 108, 74, 54],
            [236, 108, 96, 54],
            [18, 198, 74, 54],
            [112, 198, 104, 54],
            [352, 198, 100, 54],
            [472, 288, 116, 62],
            [18, 288, 74, 62],
            [472, 108, 116, 62],
          ].map(([x, y, w, h], i) => (
            <rect key={i} x={x} y={y} width={w} height={h} rx="3" />
          ))}
        </g>

        {/* ---- arterial roads ---- */}
        <g stroke="rgba(148,197,219,0.13)" strokeWidth="9" strokeLinecap="round" fill="none">
          <path d="M0,88 H620" />
          <path d="M0,178 H620" />
          <path d="M0,268 H620" />
          <path d="M0,366 H620" />
          <path d="M100,0 V440" />
          <path d="M230,0 V440" />
          <path d="M350,0 V440" />
          <path d="M470,0 V440" />
        </g>
        {/* road centre lines */}
        <g
          stroke="rgba(34,211,238,0.16)"
          strokeWidth="1"
          strokeDasharray="7 9"
          fill="none"
        >
          <path d="M0,88 H620" />
          <path d="M0,178 H620" />
          <path d="M0,268 H620" />
          <path d="M0,366 H620" />
          <path d="M100,0 V440" />
          <path d="M230,0 V440" />
          <path d="M350,0 V440" />
          <path d="M470,0 V440" />
        </g>

        {/* ---- blocked corridor ---- */}
        <g opacity={blocked ? 1 : 0.18} style={{ transition: "opacity .5s ease" }}>
          <path
            d="M230,268 L230,366"
            stroke={blocked ? "rgba(239,68,68,0.55)" : "rgba(148,197,219,0.2)"}
            strokeWidth="3"
            strokeDasharray="5 6"
            fill="none"
          />
          {blocked && (
            <g stroke="#EF4444" strokeWidth="2.6" strokeLinecap="round">
              <path d="M218,308 L242,332" />
              <path d="M242,308 L218,332" />
            </g>
          )}
        </g>

        {/* ---- routes ---- */}
        <path
          d={ROUTE_AMB}
          stroke="url(#vzRouteGrad)"
          strokeWidth="2.4"
          fill="none"
          strokeLinecap="round"
          filter="url(#vzGlow)"
        />
        <path
          d={ROUTE_AMB}
          stroke="rgba(34,211,238,0.85)"
          strokeWidth="2"
          fill="none"
          className={slow ? "vz-dash-slow" : "vz-dash"}
        />
        <path
          d={ROUTE_FIRE}
          stroke="url(#vzFireGrad)"
          strokeWidth="2"
          fill="none"
          strokeLinecap="round"
        />
        <path
          d={ROUTE_FIRE}
          stroke="rgba(245,158,11,0.8)"
          strokeWidth="1.8"
          fill="none"
          className={slow ? "vz-dash-slow" : "vz-dash"}
        />

        {sim && blocked && (
          <>
            <path
              d={ROUTE_ALT}
              stroke="rgba(34,211,238,0.42)"
              strokeWidth="2"
              strokeDasharray="6 8"
              fill="none"
              className="vz-dash"
            />
            {/* ambulance reroutes along the longer corridor when blocked */}
            <g>
              <rect x="-9" y="-6" width="18" height="12" rx="3" fill="#0B141C" stroke="#22D3EE" strokeWidth="1.4" />
              <circle cx="0" cy="0" r="2" fill="#22D3EE" />
              <animateMotion dur="16s" repeatCount="indefinite" path={ROUTE_ALT} rotate="auto" />
            </g>
          </>
        )}

        {/* ---- moving units ---- */}
        {!sim && (
          <>
            <g>
              <rect
                x="-10"
                y="-6.5"
                width="20"
                height="13"
                rx="3.5"
                fill="#0B141C"
                stroke="#22D3EE"
                strokeWidth="1.5"
              />
              <circle cx="0" cy="0" r="2.2" fill="#22D3EE" />
              <animateMotion
                dur={slow ? "22s" : "11s"}
                repeatCount="indefinite"
                path={ROUTE_AMB}
                rotate="auto"
              />
            </g>
            <g>
              <rect
                x="-9"
                y="-6"
                width="18"
                height="12"
                rx="3"
                fill="#0B141C"
                stroke="#F59E0B"
                strokeWidth="1.5"
              />
              <circle cx="0" cy="0" r="2" fill="#F59E0B" />
              <animateMotion
                dur={slow ? "30s" : "15s"}
                repeatCount="indefinite"
                path={ROUTE_FIRE}
                rotate="auto"
              />
            </g>
          </>
        )}

        {/* data particles along route */}
        {[0, 1, 2].map((i) => (
          <circle key={i} r="1.8" fill="#A5F3FC">
            <animateMotion
              dur={slow ? "9s" : "4.5s"}
              begin={`${i * (slow ? 3 : 1.5)}s`}
              repeatCount="indefinite"
              path={ROUTE_AMB}
            />
            <animate
              attributeName="opacity"
              values="0;1;0"
              dur={slow ? "9s" : "4.5s"}
              begin={`${i * (slow ? 3 : 1.5)}s`}
              repeatCount="indefinite"
            />
          </circle>
        ))}

        {/* ---- facility markers ---- */}
        <Facility x={152} y={268} label="HOSP" tone="accent" />
        <Facility x={508} y={330} label="SHELTER" tone="ok" />
        <Facility x={470} y={86} label="FIRE STN" tone="warn" />

        {/* ---- incident ---- */}
        <g transform="translate(392,132)">
          <circle r="26" fill="#EF4444" className="vz-ping" opacity="0.25" />
          <circle r="16" fill="#EF4444" className="vz-ping" style={{ animationDelay: "1.1s" }} opacity="0.22" />
          <circle r="11" fill="rgba(239,68,68,0.16)" stroke="rgba(239,68,68,0.5)" strokeWidth="1" />
          <circle r="4.5" fill="#EF4444" filter="url(#vzGlow)" />
          <circle r="1.6" fill="#FFF1F2" />
        </g>

        {/* secondary incident */}
        <g transform="translate(112,140)" opacity="0.75">
          <circle r="14" fill="#F59E0B" className="vz-ping" opacity="0.18" style={{ animationDelay: "0.6s" }} />
          <circle r="3" fill="#F59E0B" />
        </g>
        <g transform="translate(520,214)" opacity="0.6">
          <circle r="3" fill="#22D3EE" className="vz-blink" />
        </g>
      </svg>

      {/* scanline + vignette */}
      <div className="pointer-events-none absolute inset-0">
        <div
          className="vz-scan absolute inset-y-0 w-24 bg-gradient-to-r from-transparent via-cyan-300/[0.045] to-transparent"
          style={{ display: sim ? "none" : undefined }}
        />
        <div className="absolute inset-0 bg-[radial-gradient(110%_85%_at_50%_45%,transparent_45%,rgba(5,10,15,0.72)_100%)]" />
      </div>

      {children}
    </div>
  );
}

function Facility({
  x,
  y,
  label,
  tone,
}: {
  x: number;
  y: number;
  label: string;
  tone: "accent" | "warn" | "ok";
}) {
  const color =
    tone === "accent" ? "#22D3EE" : tone === "warn" ? "#F59E0B" : "#34D399";
  return (
    <g transform={`translate(${x},${y})`}>
      <circle r="7.5" fill="rgba(5,10,15,0.85)" stroke={color} strokeWidth="1.3" />
      <path
        d="M0,-3.4 H0,3.4 M-3.4,0 H3.4"
        stroke={color}
        strokeWidth="1.6"
        strokeLinecap="round"
      />
      <text
        x="0"
        y="-13"
        textAnchor="middle"
        fill="rgba(203,225,238,0.55)"
        fontSize="8"
        fontFamily="IBM Plex Mono, monospace"
        letterSpacing="1.2"
      >
        {label}
      </text>
    </g>
  );
}

/* ------------------------------------------------------------------ */
/*  Hero overlay: incident card that cycles through detected incidents  */
/* ------------------------------------------------------------------ */
export function IncidentCard({
  title,
  area,
  distance,
  resources,
  severity = "CRITICAL",
}: {
  title: string;
  area: string;
  distance: string;
  resources: number;
  severity?: "CRITICAL" | "HIGH";
}) {
  return (
    <div className="pointer-events-none absolute bottom-4 left-4 right-4 sm:left-auto sm:right-5 sm:bottom-5 sm:w-[268px]">
      <div className="rounded-[14px] border border-red-500/25 bg-[#0B141C]/92 p-3.5 shadow-[0_20px_50px_-20px_rgba(0,0,0,0.95)] backdrop-blur-md">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <StatusDot tone={severity === "CRITICAL" ? "crit" : "warn"} />
            <span
              className={cn(
                "font-mono text-[9.5px] font-semibold uppercase tracking-[0.2em]",
                severity === "CRITICAL" ? "text-red-400" : "text-amber-400",
              )}
            >
              {severity} INCIDENT
            </span>
          </div>
          <span className="font-mono text-[9.5px] text-slate-500">LIVE</span>
        </div>
        <div className="mt-2.5 text-[15px] font-semibold tracking-[-0.01em] text-slate-100">
          {title}
        </div>
        <div className="mt-1 flex items-center gap-2 font-mono text-[11px] text-slate-400">
          <span>{area}</span>
          <span className="text-slate-600">·</span>
          <span>{distance}</span>
        </div>
        <div className="mt-3 flex items-center gap-2 border-t border-white/[0.06] pt-2.5">
          <span className="inline-flex h-5 items-center rounded-md bg-cyan-400/10 px-1.5 font-mono text-[10px] text-cyan-300">
            {resources}
          </span>
          <span className="text-[11px] text-slate-400">resources recommended</span>
        </div>
        <div className="mt-2.5 h-[3px] w-full overflow-hidden rounded-full bg-white/[0.06]">
          <div
            className="h-full rounded-full bg-gradient-to-r from-red-500/70 to-cyan-400"
            style={{ width: "100%", animation: "vz-tick 3.2s ease-out infinite" }}
          />
        </div>
      </div>
    </div>
  );
}

export { StatusDot };
