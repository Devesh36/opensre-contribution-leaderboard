"use client";

import { useEffect, useState, type CSSProperties, type ReactNode } from "react";

// Splash variants to try one by one:
// 1. assembly     — staggered logo assembly (ring spin + arc sweep) (CURRENT)
// 2. stroke-draw  — SVG stroke draw-on reveal
// 3. focus-snap   — scale + blur reveal
// 4. ripple       — circular ripple wipe
// 5. glitch       — glitch reveal
// 6. particle     — particle burst
// 7. spin         — simple logo spin

type SplashVariant =
  | "assembly"
  | "stroke-draw"
  | "focus-snap"
  | "ripple"
  | "glitch"
  | "particle"
  | "spin";

export const SPLASH_VARIANT: SplashVariant = "assembly";

const SPLASH_TIMINGS: Record<SplashVariant, { spin: number; exit: number }> = {
  assembly: { spin: 680, exit: 280 },
  "stroke-draw": { spin: 900, exit: 280 },
  "focus-snap": { spin: 720, exit: 260 },
  ripple: { spin: 800, exit: 300 },
  glitch: { spin: 750, exit: 280 },
  particle: { spin: 850, exit: 300 },
  spin: { spin: 560, exit: 280 },
};

const { spin: SPLASH_SPIN_MS, exit: SPLASH_EXIT_MS } = SPLASH_TIMINGS[SPLASH_VARIANT];

const ICON_PATHS = {
  ring: "M78.96 175.2C31.2 175.2 0 140.64 0 87.6C0 34.56 31.2 0 78.96 0C126.72 0 157.92 34.56 157.92 87.6C157.92 140.64 126.72 175.2 78.96 175.2ZM78.96 159.6C115.92 159.6 140.16 131.28 140.16 87.6C140.16 43.92 115.92 15.6 78.96 15.6C42 15.6 17.76 43.92 17.76 87.6C17.76 131.28 42 159.6 78.96 159.6Z",
  arcRight:
    "M124.443 0.560946C167.185 5.21126 194.56 38.4807 194.56 87.6C194.56 136.719 167.185 169.988 124.443 174.638C134.991 170.245 144.216 163.724 151.806 155.308C166.768 138.715 174.92 115.278 174.92 87.6C174.92 59.9219 166.768 36.4846 151.806 19.892C144.216 11.4757 134.991 4.95409 124.443 0.560946Z",
  arcLeft:
    "M89.9602 21.6C92.6201 21.6 95.1991 21.76 97.6936 22.0727C72.337 29.1751 56.3195 53.382 56.3195 87.6C56.3195 121.818 72.3372 146.024 97.6936 153.126C95.199 153.439 92.6202 153.6 89.9602 153.6C73.1268 153.6 59.5372 147.208 50.0676 136.089C40.5185 124.877 34.76 108.368 34.76 87.6C34.76 66.8318 40.5185 50.3231 50.0676 39.1107C59.5372 27.9919 73.1268 21.6 89.9602 21.6Z",
} as const;

type SplashLoaderProps = {
  children: ReactNode;
};

function FilledIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 195 176"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <path d={ICON_PATHS.ring} fill="white" />
      <path d={ICON_PATHS.arcRight} fill="white" />
      <path d={ICON_PATHS.arcLeft} fill="white" />
    </svg>
  );
}

function AssemblyIcon() {
  return (
    <svg
      className="splash-icon"
      viewBox="0 0 195 176"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <g className="splash-assembly-ring">
        <path d={ICON_PATHS.ring} fill="white" />
      </g>
      <g className="splash-assembly-arc-right">
        <path d={ICON_PATHS.arcRight} fill="white" />
      </g>
      <g className="splash-assembly-arc-left">
        <path d={ICON_PATHS.arcLeft} fill="white" />
      </g>
    </svg>
  );
}

function StrokeDrawIcon() {
  return (
    <svg
      className="splash-icon"
      viewBox="0 0 195 176"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <path
        className="splash-draw splash-draw-ring"
        pathLength="1"
        d={ICON_PATHS.ring}
        stroke="white"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="white"
        fillOpacity="0"
      />
      <path
        className="splash-draw splash-draw-arc-right"
        pathLength="1"
        d={ICON_PATHS.arcRight}
        stroke="white"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="white"
        fillOpacity="0"
      />
      <path
        className="splash-draw splash-draw-arc-left"
        pathLength="1"
        d={ICON_PATHS.arcLeft}
        stroke="white"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="white"
        fillOpacity="0"
      />
    </svg>
  );
}

const PARTICLE_ANGLES = [0, 30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330] as const;

function ParticleBurst() {
  return (
    <div className="splash-particles" aria-hidden="true">
      {PARTICLE_ANGLES.map((angle, index) => (
        <span
          key={angle}
          className="splash-particle"
          style={
            {
              "--particle-angle": `${angle}deg`,
              "--particle-delay": `${index * 0.025}s`,
            } as CSSProperties
          }
        />
      ))}
    </div>
  );
}

function GlitchIcon() {
  return (
    <div className="splash-glitch-wrap">
      <FilledIcon className="splash-icon splash-glitch-layer splash-glitch-red" />
      <FilledIcon className="splash-icon splash-glitch-layer splash-glitch-cyan" />
      <FilledIcon className="splash-icon splash-glitch-layer splash-glitch-main" />
      <div className="splash-glitch-scan" aria-hidden="true" />
    </div>
  );
}

function SplashIcon() {
  return (
    <div className={`splash-stage splash-variant-${SPLASH_VARIANT}`}>
      {SPLASH_VARIANT === "stroke-draw" ? (
        <div className="splash-glow" aria-hidden="true" />
      ) : null}
      {SPLASH_VARIANT === "assembly" ? (
        <>
          <div className="splash-orbit" aria-hidden="true" />
          <div className="splash-glow" aria-hidden="true" />
        </>
      ) : null}
      {SPLASH_VARIANT === "ripple" ? (
        <>
          <div className="splash-ripple splash-ripple-1" aria-hidden="true" />
          <div className="splash-ripple splash-ripple-2" aria-hidden="true" />
          <div className="splash-ripple splash-ripple-3" aria-hidden="true" />
        </>
      ) : null}
      {SPLASH_VARIANT === "particle" ? <ParticleBurst /> : null}
      {SPLASH_VARIANT !== "glitch" &&
      SPLASH_VARIANT !== "particle" &&
      SPLASH_VARIANT !== "ripple" &&
      SPLASH_VARIANT !== "assembly" &&
      SPLASH_VARIANT !== "stroke-draw" ? (
        <div className="splash-glow" aria-hidden="true" />
      ) : null}
      {SPLASH_VARIANT === "stroke-draw" ? (
        <StrokeDrawIcon />
      ) : SPLASH_VARIANT === "glitch" ? (
        <GlitchIcon />
      ) : SPLASH_VARIANT === "assembly" ? (
        <AssemblyIcon />
      ) : (
        <FilledIcon className="splash-icon" />
      )}
    </div>
  );
}

export function SplashLoader({ children }: SplashLoaderProps) {
  const [phase, setPhase] = useState<"splash" | "exit" | "done">("splash");
  const [splashKey] = useState(() => Date.now());

  useEffect(() => {
    document.body.classList.add("splash-pending");
    document.body.classList.remove("splash-ready");

    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    if (prefersReducedMotion) {
      document.body.classList.remove("splash-pending");
      document.body.classList.add("splash-ready");
      setPhase("done");
      return;
    }

    const revealTimer = window.setTimeout(() => {
      document.body.classList.remove("splash-pending");
      document.body.classList.add("splash-ready");
      setPhase("exit");
    }, SPLASH_SPIN_MS);

    const doneTimer = window.setTimeout(() => {
      setPhase("done");
    }, SPLASH_SPIN_MS + SPLASH_EXIT_MS);

    return () => {
      window.clearTimeout(revealTimer);
      window.clearTimeout(doneTimer);
      document.body.classList.remove("splash-pending");
      document.body.classList.add("splash-ready");
    };
  }, []);

  return (
    <>
      {phase !== "done" ? (
        <div
          key={splashKey}
          className={`splash-overlay splash-variant-${SPLASH_VARIANT}${phase === "exit" ? " splash-overlay-exit" : ""}`}
          aria-hidden="true"
        >
          <SplashIcon />
        </div>
      ) : null}
      <div className={phase === "splash" ? "site-content-pending" : "site-content-visible"}>
        {children}
      </div>
    </>
  );
}
