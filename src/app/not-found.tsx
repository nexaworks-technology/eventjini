"use client";

import Link from "next/link";
import { FadeInUp } from "@/components/animations/motion";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="flex min-h-[100dvh] flex-col items-center justify-center p-4 bg-[#050505] relative overflow-hidden">
      {/* Background ambient glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-cyan-500/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] bg-purple-500/10 rounded-full blur-[100px] pointer-events-none" />

      <FadeInUp className="flex flex-col items-center justify-center text-center z-10 p-12 rounded-3xl bg-white/5 border border-white/10 shadow-2xl backdrop-blur-3xl max-w-lg w-full">
        <h1
          className="text-9xl font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-br from-cyan-400 to-purple-600 mb-6 drop-shadow-[0_0_30px_rgba(6,182,212,0.4)]"
          style={{ textShadow: "0 0 40px rgba(6, 182, 212, 0.3)" }}
        >
          404
        </h1>

        <h2 className="text-2xl font-bold text-white/90 mb-4 tracking-tight">
          Lost in the event multiverse.
        </h2>

        <p className="text-white/60 mb-10 text-lg">
          The page you are looking for does not exist or has been moved to another dimension.
        </p>

        <Link href="/" passHref>
          <Button variant="primary" size="lg">
            Return Home
          </Button>
        </Link>
      </FadeInUp>
    </div>
  );
}
