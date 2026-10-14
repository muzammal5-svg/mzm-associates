"use client";

import { useEffect, useState } from "react";
import { Logo } from "./Logo";
import { BRAND } from "@/lib/brand";

interface SplashScreenProps {
  /** Called when the minimum display time has elapsed */
  onDone: () => void;
  /** Minimum ms to show splash (default 1400) */
  minDuration?: number;
}

export function SplashScreen({ onDone, minDuration = 1400 }: SplashScreenProps) {
  const [visible, setVisible] = useState(true);
  const [fading,  setFading]  = useState(false);

  useEffect(() => {
    const fadeTimer = setTimeout(() => setFading(true), minDuration - 300);
    const doneTimer = setTimeout(() => { setVisible(false); onDone(); }, minDuration);
    return () => { clearTimeout(fadeTimer); clearTimeout(doneTimer); };
  }, [minDuration, onDone]);

  if (!visible) return null;

  return (
    <div
      aria-live="polite"
      aria-label="Loading MZM & Associates"
      className={`
        fixed inset-0 z-[100] flex flex-col items-center justify-center
        bg-navy transition-opacity duration-300
        ${fading ? "opacity-0" : "opacity-100"}
      `}
    >
      {/* Gold top accent bar */}
      <div className="absolute top-0 start-0 end-0 h-1 bg-gold" />

      {/* Logo mark (large) */}
      <div className="animate-fade-in flex flex-col items-center gap-6">
        <Logo size="lg" variant="full" />

        {/* Tagline */}
        <p className="text-navy-200 text-sm font-body tracking-wide text-center px-8">
          {BRAND.tagline}
        </p>

        {/* Loading dots */}
        <div className="flex gap-1.5 mt-4" aria-hidden="true">
          {[0, 1, 2].map((i) => (
            <span
              key={i}
              className="w-1.5 h-1.5 rounded-full bg-gold animate-bounce"
              style={{ animationDelay: `${i * 150}ms`, animationDuration: "900ms" }}
            />
          ))}
        </div>
      </div>

      {/* Bottom firm name */}
      <div className="absolute bottom-8 start-0 end-0 text-center">
        <p className="text-navy-300 text-xs tracking-widest uppercase">
          {BRAND.name}
        </p>
      </div>
    </div>
  );
}
