"use client";

import { type ReactNode } from "react";
import { cn } from "@/lib/utils";
import { FadeInUp } from "@/components/animations/motion";

/* ------------------------------------------------------------------ */
/*  GlassCard                                                          */
/* ------------------------------------------------------------------ */

interface GlassCardProps {
  children: ReactNode;
  className?: string;
  /** Enable a subtle cyan glow on hover. Default: false */
  hoverGlow?: boolean;
  /** Wrap the card in a FadeInUp animation. Default: true */
  animate?: boolean;
}

export function GlassCard({
  children,
  className,
  hoverGlow = false,
  animate = true,
}: GlassCardProps) {
  const card = (
    <div
      className={cn(
        // Glass morphism surface
        "rounded-2xl p-6",
        // Hover glow
        hoverGlow &&
          "transition-shadow duration-300 hover:shadow-[0_0_24px_-4px_rgba(6,182,212,0.35)]",
        className
      )}
      style={{
        background: "rgba(255,255,255,0.03)",
        backdropFilter: "blur(24px)",
        WebkitBackdropFilter: "blur(24px)",
        border: "1px solid rgba(255,255,255,0.06)",
        boxShadow:
          "0 4px 24px -1px rgba(0,0,0,0.25), 0 0 0 0 rgba(6,182,212,0)",
      }}
    >
      {children}
    </div>
  );

  if (!animate) return card;

  return <FadeInUp>{card}</FadeInUp>;
}
