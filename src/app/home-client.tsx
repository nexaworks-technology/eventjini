"use client";

import Image from "next/image";
import Link from "next/link";
import { motion, useScroll, useTransform } from "framer-motion";
import { FadeInUp, GlowPulse } from "@/components/animations/motion";
import { Header } from "@/components/ui/header";
import { EventCard } from "@/components/ui/event-card";
import { CityCard } from "@/components/ui/city-card";
import { ArrowRight, Search, ChevronRight, Sparkles, MoveRight, Globe } from "lucide-react";
import { useState, useRef } from "react";
import { useRouter } from "next/navigation";

const CATEGORIES = ["Tech", "Business", "Music", "Design", "Wellness", "Community"];
const CITIES = [
  { name: "Mumbai", count: 120, image: "https://images.unsplash.com/photo-1522206090757-558661674482?q=80&w=800&auto=format&fit=crop" },
  { name: "Delhi", count: 80, image: "https://images.unsplash.com/photo-1587474260584-136574528ed5?q=80&w=800&auto=format&fit=crop" },
  { name: "Bengaluru", count: 70, image: "https://images.unsplash.com/photo-1596443686812-2f45229eebc3?q=80&w=800&auto=format&fit=crop" },
  { name: "Hyderabad", count: 45, image: "https://images.unsplash.com/photo-1573887163889-4876b509f6b9?q=80&w=800&auto=format&fit=crop" }
];

export default function HomeClient({ featuredEvents }: { featuredEvents: any[] }) {
  const [searchQuery, setSearchQuery] = useState("");
  const router = useRouter();
  const heroRef = useRef(null);
  
  const { scrollY } = useScroll();
  const heroY = useTransform(scrollY, [0, 1000], [0, 200]);
  const heroOpacity = useTransform(scrollY, [0, 500], [1, 0]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/explore?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  return (
    <div className="relative min-h-screen bg-[#07090D] text-white selection:bg-brand-primary/30 overflow-x-hidden font-sans">
      <Header />

      {/* ═══════════════════════════════════════════════════════════ */}
      {/* HERO SECTION                                               */}
      {/* ═══════════════════════════════════════════════════════════ */}
      <section ref={heroRef} className="relative w-full min-h-[100vh] pt-24 pb-16 flex items-center">
        {/* Massive Background Image Bleed on Right */}
        <motion.div 
          style={{ y: heroY, opacity: heroOpacity }}
          className="absolute top-0 right-0 w-full lg:w-[70%] h-[60vh] lg:h-[100vh] z-0 overflow-hidden"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-[#07090D] via-[#07090D]/80 to-transparent lg:via-[#07090D]/50 z-10" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#07090D] via-transparent to-[#07090D]/40 z-10" />
          <div className="absolute inset-0 bg-gradient-to-b from-[#07090D] via-transparent to-transparent z-10" />
          <Image 
            src="/demo/music.jpg" 
            alt="Event Atmosphere" 
            fill 
            className="object-cover object-right-top mix-blend-screen opacity-70"
            priority
          />
        </motion.div>

        <div className="relative z-10 w-full max-w-[1400px] mx-auto px-6 lg:px-12 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          {/* LEFT: Typography & Search */}
          <div className="lg:col-span-7 xl:col-span-6 pt-20 lg:pt-0">
            <FadeInUp>
              <h3 className="text-[10px] md:text-xs font-semibold tracking-[0.2em] text-white/50 uppercase mb-6 flex items-center gap-4">
                People <span className="w-1 h-1 rounded-full bg-white/20" /> 
                Ideas <span className="w-1 h-1 rounded-full bg-white/20" /> 
                Experiences
              </h3>
            </FadeInUp>
            
            <FadeInUp delay={0.1}>
              <h1 className="text-6xl sm:text-7xl lg:text-[5.5rem] xl:text-[6.5rem] font-bold tracking-tighter leading-[0.95] text-white mb-6">
                Events <br/>
                <span className="text-white/60">that move</span> <br/>
                <span className="text-brand-primary drop-shadow-[0_0_25px_rgba(99,102,241,0.3)]">people.</span>
              </h1>
            </FadeInUp>
            
            <FadeInUp delay={0.2}>
              <p className="text-lg md:text-xl text-white/70 mb-10 font-medium tracking-wide">
                Discover. Attend. Host. Make it happen.
              </p>
            </FadeInUp>

            {/* Command-style Search */}
            <FadeInUp delay={0.3} className="w-full max-w-xl mb-6">
              <form onSubmit={handleSearch} className="relative group">
                <div className="absolute inset-0 bg-white/[0.03] rounded-full blur-xl group-focus-within:bg-brand-primary/10 transition-colors duration-500" />
                <div className="relative flex items-center bg-[#131B2F]/60 backdrop-blur-xl border border-white/10 rounded-full p-2 group-focus-within:border-brand-primary/40 group-focus-within:bg-[#131B2F]/80 transition-all shadow-2xl">
                  <Search className="w-5 h-5 text-white/40 ml-4 mr-2" />
                  <input 
                    type="text"
                    placeholder="Search events, topics, or cities..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="flex-1 bg-transparent border-none py-3 px-2 text-base text-white placeholder-white/40 focus:outline-none focus:ring-0"
                  />
                  <button type="submit" className="w-12 h-12 rounded-full bg-brand-primary flex items-center justify-center text-white hover:scale-105 hover:bg-brand-accent transition-all shadow-[0_0_15px_rgba(99,102,241,0.5)]">
                    <ArrowRight className="w-5 h-5" />
                  </button>
                </div>
              </form>
            </FadeInUp>

            {/* Category Pills */}
            <FadeInUp delay={0.4} className="flex flex-wrap gap-2 mb-12">
              {CATEGORIES.map(cat => (
                <Link key={cat} href={`/explore?q=${cat.toLowerCase()}`} className="px-4 py-2 rounded-full border border-white/10 bg-white/[0.03] text-xs font-medium text-white/70 hover:text-white hover:bg-white/10 hover:border-white/20 transition-all">
                  {cat}
                </Link>
              ))}
              <Link href="/explore" className="px-4 py-2 rounded-full border border-transparent bg-white/[0.02] text-xs font-medium text-white/50 hover:text-white transition-all flex items-center gap-1">
                More <ChevronRight className="w-3 h-3" />
              </Link>
            </FadeInUp>

            {/* Stats Row */}
            <FadeInUp delay={0.5} className="flex items-center gap-8 md:gap-12 pt-8 border-t border-white/[0.06]">
              <div>
                <p className="text-2xl md:text-3xl font-bold text-white mb-1">10K+</p>
                <p className="text-[10px] uppercase tracking-widest text-white/40 font-semibold">Events Hosted</p>
              </div>
              <div>
                <p className="text-2xl md:text-3xl font-bold text-white mb-1">1M+</p>
                <p className="text-[10px] uppercase tracking-widest text-white/40 font-semibold">People Connected</p>
              </div>
              <div className="hidden sm:block">
                <p className="text-2xl md:text-3xl font-bold text-white mb-1">50K+</p>
                <p className="text-[10px] uppercase tracking-widest text-white/40 font-semibold">Organizers</p>
              </div>
            </FadeInUp>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════ */}
      {/* TRENDING NOW                                               */}
      {/* ═══════════════════════════════════════════════════════════ */}
      {featuredEvents && featuredEvents.length > 0 && (
        <section className="relative z-10 w-full max-w-[1400px] mx-auto px-6 lg:px-12 py-20 border-t border-white/[0.04]">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-4">
            <FadeInUp>
              <h2 className="text-2xl md:text-3xl font-bold text-white tracking-tight mb-2">Trending Now</h2>
              <p className="text-sm text-white/50 font-medium">Curated events everyone's talking about.</p>
            </FadeInUp>
            <FadeInUp delay={0.1}>
              <Link href="/explore" className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full border border-white/10 text-xs font-semibold text-white/80 hover:text-white hover:bg-white/5 transition-all">
                View all <MoveRight className="w-3 h-3" />
              </Link>
            </FadeInUp>
          </div>
          
          <FadeInUp delay={0.2} className="w-full">
            <div className="flex overflow-x-auto snap-x snap-mandatory hide-scrollbar gap-6 pb-8 -mx-6 px-6 lg:mx-0 lg:px-0 lg:grid lg:grid-cols-3 xl:grid-cols-4">
              {featuredEvents.slice(0, 4).map((event: any) => (
                <EventCard key={event.id} event={event} href={`/e/${event.slug}`} />
              ))}
            </div>
          </FadeInUp>
        </section>
      )}

      {/* ═══════════════════════════════════════════════════════════ */}
      {/* HAPPENING AROUND YOU                                       */}
      {/* ═══════════════════════════════════════════════════════════ */}
      <section className="relative z-10 w-full max-w-[1400px] mx-auto px-6 lg:px-12 py-10 pb-32">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
          <FadeInUp>
            <h2 className="text-xl md:text-2xl font-bold text-white tracking-tight mb-2">Happening Around You</h2>
            <p className="text-sm text-white/50 font-medium">Explore events in your city or around the world.</p>
          </FadeInUp>
          <FadeInUp delay={0.1}>
            <Link href="/explore" className="inline-flex items-center gap-2 text-xs font-semibold text-white/50 hover:text-white transition-all">
              View all cities <MoveRight className="w-3 h-3" />
            </Link>
          </FadeInUp>
        </div>

        <FadeInUp delay={0.2} className="w-full">
          <div className="flex overflow-x-auto snap-x snap-mandatory hide-scrollbar gap-4 pb-4 -mx-6 px-6 lg:mx-0 lg:px-0">
            {CITIES.map(city => (
              <CityCard key={city.name} {...city} />
            ))}
            
            {/* Online Events Card */}
            <Link href="/explore?q=online" className="group relative h-28 w-44 md:h-32 md:w-48 rounded-2xl overflow-hidden flex-shrink-0 snap-center border border-white/[0.04] bg-[#131B2F] hover:bg-[#1A233A] transition-colors flex flex-col items-center justify-center">
              <Globe className="w-8 h-8 text-brand-primary mb-2 opacity-50 group-hover:opacity-100 group-hover:scale-110 transition-all duration-300" />
              <h4 className="text-white font-semibold text-sm">Online</h4>
              <p className="text-[10px] text-white/50 font-medium mt-0.5">200+ events</p>
            </Link>
          </div>
        </FadeInUp>
      </section>

      {/* ═══════════════════════════════════════════════════════════ */}
      {/* FOR ORGANIZERS - PREMIUM CTA                                 */}
      {/* ═══════════════════════════════════════════════════════════ */}
      <section className="relative z-10 w-full max-w-[1400px] mx-auto px-6 lg:px-12 pb-32">
        <FadeInUp>
          <div className="relative w-full rounded-[2rem] overflow-hidden bg-[#0A0D14] border border-white/[0.05] p-8 md:p-16 lg:p-24 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            
            {/* Ambient Background for CTA */}
            <div className="absolute inset-0 z-0 opacity-40 mix-blend-screen pointer-events-none">
              <div className="absolute top-[-50%] left-[-10%] w-[120%] h-[200%] bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-brand-primary/20 via-[#0A0D14]/0 to-[#0A0D14]/0 blur-3xl" />
              <div className="absolute bottom-[-50%] right-[-10%] w-[120%] h-[200%] bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-brand-secondary/10 via-[#0A0D14]/0 to-[#0A0D14]/0 blur-3xl" />
            </div>

            <div className="relative z-10">
              <h4 className="text-[10px] font-bold tracking-[0.2em] text-white/40 uppercase mb-6">For Organizers</h4>
              <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white tracking-tighter leading-[1.1] mb-6">
                Create. Grow.<br />
                <span className="text-brand-secondary">Build Communities.</span>
              </h2>
              <p className="text-base md:text-lg text-white/60 mb-10 max-w-md leading-relaxed font-medium">
                Everything you need to host unforgettable events. Give your audience the experience they deserve.
              </p>
              <Link href="/dashboard">
                <button className="px-8 py-4 rounded-full bg-brand-primary text-white text-sm font-bold tracking-wide hover:bg-brand-accent hover:scale-105 transition-all shadow-[0_0_20px_rgba(99,102,241,0.4)] flex items-center gap-2">
                  Start Hosting <MoveRight className="w-4 h-4" />
                </button>
              </Link>
            </div>

            <div className="relative z-10 flex flex-col gap-6 lg:pl-12">
              {[
                { icon: Sparkles, title: "Simple event setup", desc: "Go live in minutes, not hours." },
                { icon: Globe, title: "Sell tickets securely", desc: "Powered by enterprise-grade infrastructure." },
                { icon: Users, title: "Engage your audience", desc: "Built-in tools to manage and delight attendees." }
              ].map((feature, i) => (
                <div key={i} className="flex items-start gap-5 p-4 rounded-2xl hover:bg-white/[0.02] transition-colors border border-transparent hover:border-white/[0.04]">
                  <div className="w-12 h-12 rounded-2xl bg-white/[0.03] border border-white/[0.06] flex items-center justify-center flex-shrink-0 shadow-inner">
                    <feature.icon className="w-5 h-5 text-brand-primary" />
                  </div>
                  <div>
                    <h5 className="text-white font-semibold text-base mb-1">{feature.title}</h5>
                    <p className="text-sm text-white/50">{feature.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </FadeInUp>
      </section>

      {/* Footer */}
      <footer className="relative z-10 w-full border-t border-white/[0.04] py-12 bg-[#07090D]">
        <div className="max-w-[1400px] mx-auto px-6 lg:px-12 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-md bg-white/10 flex items-center justify-center">
              <span className="text-white text-[10px] font-bold">E</span>
            </div>
            <span className="text-sm font-bold text-white tracking-tight">EventJini</span>
          </div>
          <span className="text-[10px] text-white/40 tracking-widest uppercase font-semibold">The Event Operating System</span>
          <span className="text-xs text-white/40 font-medium">© {new Date().getFullYear()} All rights reserved.</span>
        </div>
      </footer>
    </div>
  );
}

// Temporary icon for mapping
function Users(props: any) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  )
}
