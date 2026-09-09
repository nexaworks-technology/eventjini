"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { FadeInUp, GlowPulse } from "@/components/animations/motion";

/* ------------------------------------------------------------------ */
/*  Floating gradient orb                                              */
/* ------------------------------------------------------------------ */

function FloatingOrb({
  color,
  size,
  initialX,
  initialY,
  duration,
}: {
  color: string;
  size: number;
  initialX: string;
  initialY: string;
  duration: number;
}) {
  return (
    <motion.div
      className="pointer-events-none absolute rounded-full opacity-30"
      style={{
        width: size,
        height: size,
        background: `radial-gradient(circle, ${color} 0%, transparent 70%)`,
        filter: "blur(80px)",
        top: initialY,
        left: initialX,
      }}
      animate={{
        x: [0, 60, -40, 20, 0],
        y: [0, -50, 30, -20, 0],
      }}
      transition={{
        duration,
        repeat: Infinity,
        ease: "easeInOut",
      }}
    />
  );
}

/* ------------------------------------------------------------------ */
/*  Landing page                                                       */
/* ------------------------------------------------------------------ */

export default function Home() {
  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-[#050505]">
      {/* ── Floating background orbs ── */}
      <FloatingOrb
        color="#06b6d4"
        size={500}
        initialX="-10%"
        initialY="10%"
        duration={18}
      />
      <FloatingOrb
        color="#a855f7"
        size={450}
        initialX="60%"
        initialY="50%"
        duration={22}
      />

      {/* ── Glass card ── */}
      <FadeInUp className="relative z-10 w-full max-w-lg px-4">
        <div className="flex flex-col items-center gap-8 rounded-2xl border border-white/[0.06] bg-white/[0.03] p-10 shadow-2xl backdrop-blur-[24px] sm:p-14">
          {/* Logo */}
          <FadeInUp delay={0.15}>
            <div className="relative h-20 w-20 overflow-hidden rounded-2xl ring-1 ring-white/10">
              <Image
                src="/logo.jpg"
                alt="EventJini logo"
                fill
                className="object-cover"
                priority
              />
            </div>
          </FadeInUp>

          {/* Heading */}
          <FadeInUp delay={0.3}>
            <h1 className="text-center text-5xl font-bold tracking-tight sm:text-6xl">
              <span className="bg-gradient-to-r from-cyan-400 to-purple-500 bg-clip-text text-transparent">
                EventJini
              </span>
            </h1>
          </FadeInUp>

          {/* Tagline */}
          <FadeInUp delay={0.45}>
            <p className="text-center text-lg font-medium tracking-wide text-white/70">
              The Premium Event OS
            </p>
          </FadeInUp>

          {/* Subtitle */}
          <FadeInUp delay={0.6}>
            <p className="max-w-sm text-center text-sm leading-relaxed text-white/50">
              Seamlessly manage, host, and experience world-class events.
            </p>
          </FadeInUp>

          {/* Coming Soon badge */}
          <FadeInUp delay={0.75}>
            <GlowPulse
              glowColor="#06b6d4"
              duration={2.5}
              className="rounded-xl"
            >
              <span className="inline-block rounded-xl border border-cyan-500/30 bg-cyan-500/10 px-6 py-2.5 text-sm font-semibold tracking-widest text-cyan-400 uppercase">
                Coming Soon
              </span>
            </GlowPulse>
          </FadeInUp>
        </div>
      </FadeInUp>
    </div>
  );
}
