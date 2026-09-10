"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { FadeInUp, GlowPulse } from "@/components/animations/motion";
import { Header } from "@/components/ui/header";
import { EventCard } from "@/components/ui/event-card";
import { Calendar, MapPin, ChevronRight, ArrowRight, Sparkles } from "lucide-react";
import { Search } from "lucide-react";
import { useState } from "react";
import { useRouter } from "next/navigation";

/* ---- Ambient background ---- */
function AmbientGlow({ color, size, x, y, delay = 0 }: { color: string; size: number; x: string; y: string; delay?: number }) {
  return (
    <motion.div
      className="pointer-events-none absolute rounded-full"
      style={{
        width: size,
        height: size,
        background: `radial-gradient(circle, ${color} 0%, transparent 70%)`,
        filter: "blur(120px)",
        opacity: 0.15,
        top: y,
        left: x,
      }}
      animate={{
        x: [0, 40, -30, 15, 0],
        y: [0, -30, 20, -15, 0],
        opacity: [0.15, 0.22, 0.15],
      }}
      transition={{
        duration: 20,
        repeat: Infinity,
        ease: "easeInOut",
        delay,
      }}
    />
  );
}

export default function HomeClient({ featuredEvents }: { featuredEvents: any[] }) {
  const [searchQuery, setSearchQuery] = useState("");
  const router = useRouter();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/explore?q=${encodeURIComponent(searchQuery.trim())}`);
    } else {
      router.push("/explore");
    }
  };

  // Pick the first event as the "featured" immersive card
  const featuredEvent = featuredEvents?.[0];
  const remainingEvents = featuredEvents?.slice(1, 4) || [];

  return (
    <div className="relative flex flex-col items-center overflow-hidden bg-canvas min-h-screen">
      <Header />
      
      {/* Ambient atmospheric gradients */}
      <AmbientGlow color="#6366f1" size={600} x="-5%" y="5%" />
      <AmbientGlow color="#8b5cf6" size={500} x="65%" y="15%" delay={3} />
      <AmbientGlow color="#06b6d4" size={400} x="30%" y="60%" delay={6} />

      {/* ═══════════════════════════════════════════════════════════ */}
      {/* HERO SECTION                                               */}
      {/* ═══════════════════════════════════════════════════════════ */}
      <section className="relative z-10 w-full max-w-7xl mx-auto px-6 pt-32 pb-16 md:pt-44 md:pb-24">
        
        {/* Navigation Pillars */}
        <FadeInUp className="flex items-center justify-center gap-8 mb-12">
          <Link href="/explore" className="text-sm font-medium text-muted hover:text-white transition-colors">
            Discover
          </Link>
          <span className="w-1 h-1 rounded-full bg-white/20" />
          <Link href="/dashboard" className="text-sm font-medium text-muted hover:text-white transition-colors">
            Create
          </Link>
          <span className="w-1 h-1 rounded-full bg-white/20" />
          <Link href="/my-tickets" className="text-sm font-medium text-muted hover:text-white transition-colors">
            Connect
          </Link>
        </FadeInUp>

        {/* Editorial Typography */}
        <FadeInUp delay={0.15} className="text-center mb-10">
          <h1 className="text-6xl sm:text-7xl md:text-8xl lg:text-9xl font-bold tracking-tighter leading-[0.9] text-white">
            EVENTS
            <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-primary via-brand-secondary to-brand-accent">
              THAT MOVE
            </span>
            <br />
            PEOPLE.
          </h1>
        </FadeInUp>

        {/* Search Bar */}
        <FadeInUp delay={0.3} className="max-w-2xl mx-auto mb-6">
          <form onSubmit={handleSearch} className="relative group">
            <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-muted group-focus-within:text-brand-primary transition-colors" />
            <input 
              type="text"
              placeholder="Search events, people, places..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-surface border border-white/[0.06] rounded-2xl pl-14 pr-6 py-4 text-base text-white placeholder-muted/60 focus:outline-none focus:border-brand-primary/40 focus:ring-1 focus:ring-brand-primary/20 transition-all"
            />
          </form>
        </FadeInUp>

        {/* Sub-tagline */}
        <FadeInUp delay={0.4}>
          <p className="text-center text-muted text-base md:text-lg max-w-lg mx-auto leading-relaxed">
            The operating system for discovering, creating, and experiencing events.
          </p>
        </FadeInUp>
      </section>

      {/* ═══════════════════════════════════════════════════════════ */}
      {/* TRENDING NOW                                               */}
      {/* ═══════════════════════════════════════════════════════════ */}
      {featuredEvents && featuredEvents.length > 0 && (
        <section className="relative z-10 w-full max-w-7xl mx-auto px-6 pb-20">
          <FadeInUp delay={0.5}>
            <div className="flex items-center justify-between mb-10">
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 rounded-full bg-brand-primary animate-pulse" />
                <h2 className="text-2xl md:text-3xl font-bold text-white tracking-tight">
                  TRENDING NOW
                </h2>
              </div>
              <Link href="/explore" className="text-brand-primary hover:text-brand-accent text-sm font-medium flex items-center gap-1.5 transition-colors group">
                View All <ChevronRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
              </Link>
            </div>
          </FadeInUp>
          
          {/* Featured Event — Immersive Large Card */}
          {featuredEvent && (
            <FadeInUp delay={0.6} className="mb-8">
              <Link href={`/e/${featuredEvent.slug}`} className="group block">
                <div className="relative h-[320px] md:h-[400px] rounded-3xl overflow-hidden bg-surface border border-white/[0.06]">
                  {featuredEvent.banner_url ? (
                    <Image 
                      src={featuredEvent.banner_url} 
                      alt={featuredEvent.title} 
                      fill 
                      className="object-cover opacity-60 group-hover:opacity-75 group-hover:scale-[1.03] transition-all duration-700" 
                    />
                  ) : (
                    <div className="absolute inset-0 bg-gradient-to-br from-brand-primary/20 via-surface to-canvas" />
                  )}
                  
                  {/* Gradient overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-canvas via-canvas/60 to-transparent" />
                  
                  {/* Content */}
                  <div className="absolute bottom-0 left-0 right-0 p-8 md:p-12">
                    <div className="flex items-center gap-2 mb-4">
                      <Sparkles className="w-4 h-4 text-brand-primary" />
                      <span className="text-xs font-semibold text-brand-primary uppercase tracking-widest">Featured</span>
                    </div>
                    <h3 className="text-3xl md:text-5xl font-bold text-white mb-4 tracking-tight group-hover:text-brand-accent transition-colors">
                      {featuredEvent.title}
                    </h3>
                    <div className="flex flex-wrap items-center gap-6 text-sm text-muted">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-brand-primary" />
                        <span>{new Date(featuredEvent.start_date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <MapPin className="w-4 h-4 text-brand-secondary" />
                        <span>{featuredEvent.location_name || "TBA"}</span>
                      </div>
                    </div>
                  </div>
                  
                  {/* Price Badge */}
                  <div className="absolute top-6 right-6 bg-canvas/70 backdrop-blur-xl border border-glass-border px-4 py-2 rounded-full">
                    <span className="text-sm font-bold text-white">
                      {featuredEvent.ticket_price_cents > 0 
                        ? `₹${(featuredEvent.ticket_price_cents / 100).toFixed(0)}`
                        : "FREE"}
                    </span>
                  </div>
                </div>
              </Link>
            </FadeInUp>
          )}
          
          {/* Remaining Events — Standard Cards */}
          {remainingEvents.length > 0 && (
            <FadeInUp delay={0.7}>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {remainingEvents.map((event: any) => (
                  <EventCard key={event.id} event={event} href={`/e/${event.slug}`} />
                ))}
              </div>
            </FadeInUp>
          )}
        </section>
      )}

      {/* ═══════════════════════════════════════════════════════════ */}
      {/* FOOTER / CTA                                               */}
      {/* ═══════════════════════════════════════════════════════════ */}
      <section className="relative z-10 w-full border-t border-white/[0.04] py-24">
        <FadeInUp className="text-center">
          <h2 className="text-4xl md:text-6xl font-bold text-white tracking-tighter mb-6">
            MORE THAN EVENTS.
          </h2>
          <p className="text-muted text-lg max-w-md mx-auto mb-10">
            Build. Host. Grow. Your events. Your community. Your brand.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/explore">
              <motion.button 
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                className="px-8 py-4 rounded-2xl bg-surface border border-white/[0.06] text-white text-sm font-semibold hover:border-white/10 transition-colors"
              >
                Explore Events
              </motion.button>
            </Link>
            <Link href="/dashboard">
              <GlowPulse glowColor="#6366f1" duration={3} className="rounded-2xl">
                <motion.button 
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  className="px-8 py-4 rounded-2xl bg-brand-primary text-white text-sm font-semibold hover:bg-brand-primary/90 transition-colors flex items-center gap-2"
                >
                  Host an Event <ArrowRight className="w-4 h-4" />
                </motion.button>
              </GlowPulse>
            </Link>
          </div>
        </FadeInUp>
      </section>

      {/* Footer Bar */}
      <footer className="relative z-10 w-full border-t border-white/[0.04] py-8">
        <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
          <span className="text-xs text-muted/50">© {new Date().getFullYear()} EventJini. All rights reserved.</span>
          <span className="text-xs text-muted/30 tracking-wider">THE EVENT OPERATING SYSTEM</span>
        </div>
      </footer>
    </div>
  );
}
