"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { FadeInUp, GlowPulse } from "@/components/animations/motion";
import { Header } from "@/components/ui/header";

import { Calendar, MapPin, ChevronRight } from "lucide-react";
import { GlassCard } from "@/components/ui/glass-card";

// (Keep FloatingOrb definition exactly as is)
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

export default function HomeClient({ featuredEvents }: { featuredEvents: any[] }) {
  return (
    <div className="relative flex min-h-screen flex-col items-center overflow-hidden bg-[#050505]">
      <Header />
      
      <FloatingOrb color="#06b6d4" size={500} initialX="-10%" initialY="10%" duration={18} />
      <FloatingOrb color="#a855f7" size={450} initialX="60%" initialY="50%" duration={22} />

      {/* Hero Section */}
      <div className="flex-1 flex flex-col items-center justify-center w-full min-h-screen pt-20 pb-12">
        <FadeInUp className="relative z-10 w-full max-w-xl px-4">
          <div className="flex flex-col items-center gap-8 rounded-2xl border border-white/[0.06] bg-white/[0.03] p-10 shadow-2xl backdrop-blur-[24px] sm:p-14">
            <FadeInUp delay={0.15}>
              <div className="relative h-20 w-20 overflow-hidden rounded-2xl ring-1 ring-white/10">
                <Image src="/logo.jpg" alt="EventJini logo" fill className="object-cover" priority />
              </div>
            </FadeInUp>

            <FadeInUp delay={0.3}>
              <h1 className="text-center text-5xl font-bold tracking-tight sm:text-6xl">
                <span className="bg-gradient-to-r from-cyan-400 to-purple-500 bg-clip-text text-transparent">
                  EventJini
                </span>
              </h1>
            </FadeInUp>

            <FadeInUp delay={0.45}>
              <p className="max-w-sm text-center text-lg leading-relaxed text-white/70">
                Seamlessly manage, host, and experience world-class events.
              </p>
            </FadeInUp>

            <FadeInUp delay={0.6} className="w-full">
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4 w-full mt-4">
                <Link href="/explore" className="w-full sm:w-auto">
                  <button className="w-full rounded-xl border border-white/10 bg-white/5 px-8 py-3.5 text-sm font-semibold text-white transition-all hover:bg-white/10 hover:border-white/20 hover:scale-105 active:scale-95">
                    Explore Events
                  </button>
                </Link>
                <Link href="/dashboard" className="w-full sm:w-auto">
                  <GlowPulse glowColor="#06b6d4" duration={2.5} className="rounded-xl w-full">
                    <button className="w-full rounded-xl bg-cyan-500 px-8 py-3.5 text-sm font-semibold text-black transition-all hover:bg-cyan-400 hover:scale-105 active:scale-95">
                      Host an Event
                    </button>
                  </GlowPulse>
                </Link>
              </div>
            </FadeInUp>
          </div>
        </FadeInUp>
      </div>

      {/* Featured Events Carousel */}
      {featuredEvents && featuredEvents.length > 0 && (
        <FadeInUp delay={0.8} className="w-full max-w-7xl mx-auto px-6 pb-32 relative z-10">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl font-bold text-white tracking-tight">Trending Events</h2>
            <Link href="/explore" className="text-cyan-400 hover:text-cyan-300 text-sm font-medium flex items-center gap-1 transition-colors">
              View All <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {featuredEvents.slice(0, 3).map((event: any) => (
              <Link href={`/e/${event.slug}`} key={event.id} className="group block">
                <GlassCard hoverGlow className="h-full p-0 overflow-hidden flex flex-col transition-all duration-300 hover:-translate-y-1">
                  <div className="relative h-48 w-full bg-[#111]">
                    {event.banner_url ? (
                      <Image src={event.banner_url} alt={event.title} fill className="object-cover" />
                    ) : (
                      <div className="absolute inset-0 bg-gradient-to-br from-[#111] to-[#222]" />
                    )}
                    <div className="absolute top-4 right-4 bg-black/60 backdrop-blur-md border border-white/10 px-3 py-1 rounded-full text-xs font-semibold text-white">
                      {event.ticket_price_cents > 0 ? `₹${(event.ticket_price_cents / 100).toFixed(2)}` : "FREE"}
                    </div>
                  </div>
                  
                  <div className="p-6 flex-1 flex flex-col">
                    <h3 className="text-xl font-bold text-white mb-2 line-clamp-1 group-hover:text-cyan-400 transition-colors">
                      {event.title}
                    </h3>
                    
                    <div className="space-y-2 mt-auto pt-4 border-t border-white/5">
                      <div className="flex items-center text-sm text-slate-400">
                        <Calendar className="w-4 h-4 mr-2 text-cyan-500" />
                        <span>{new Date(event.start_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                      </div>
                      <div className="flex items-center text-sm text-slate-400">
                        <MapPin className="w-4 h-4 mr-2 text-purple-500" />
                        <span className="line-clamp-1">{event.location_name || "TBA"}</span>
                      </div>
                    </div>
                  </div>
                </GlassCard>
              </Link>
            ))}
          </div>
        </FadeInUp>
      )}
    </div>
  );
}
