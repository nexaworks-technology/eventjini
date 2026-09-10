"use client";

import { type ReactNode } from "react";
import { cn } from "@/lib/utils";
import { FadeInUp } from "@/components/animations/motion";

interface GlassCardProps {
  children: ReactNode;
  className?: string;
  hoverGlow?: boolean;
  animate?: boolean;
  level?: 2 | 3; // 2 = Solid Structural Surface, 3 = Translucent Glass Premium Surface
}

export function GlassCard({
  children,
  className,
  hoverGlow = false,
  animate = true,
  level = 2,
}: GlassCardProps) {
  const card = (
    <div
      className={cn(
        "rounded-2xl p-6 transition-all duration-300",
        level === 2 
          ? "bg-surface border border-white/5" 
          : "bg-glass backdrop-blur-2xl border border-glass-border shadow-2xl",
        hoverGlow && "hover:shadow-[0_8px_30px_rgb(0,0,0,0.4)] hover:-translate-y-1 hover:border-white/10",
        className
      )}
    >
      {children}
    </div>
  );

  if (!animate) return card;

  return <FadeInUp>{card}</FadeInUp>;
}
