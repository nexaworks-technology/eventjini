"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { GlassCard } from "@/components/ui/glass-card";
import { Button } from "@/components/ui/button";
import { EventCard } from "@/components/ui/event-card";
import { Calendar, MapPin, Users, Search, DollarSign, Sparkles } from "lucide-react";
import { FadeInUp, StaggerContainer, staggerChildVariants } from "@/components/animations/motion";
import { motion } from "framer-motion";

const CATEGORIES = [
  { id: "all", label: "All" },
  { id: "free", label: "Free" },
  { id: "paid", label: "Paid" },
  { id: "tech", label: "Tech" },
  { id: "business", label: "Business" },
  { id: "design", label: "Design" },
  { id: "music", label: "Music" },
  { id: "community", label: "Community" },
];

export default function ExploreClient({ initialEvents, error }: { initialEvents: any[], error?: string }) {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState("all");

  const filteredEvents = initialEvents.filter((event) => {
    const matchesSearch = event.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          (event.location_name && event.location_name.toLowerCase().includes(searchQuery.toLowerCase()));
    
    if (activeCategory === "free") return matchesSearch && !event.is_paid;
    if (activeCategory === "paid") return matchesSearch && event.is_paid;
    // For category filters like tech/business/design etc, we pass through for now
    // since the DB doesn't have category tags yet
    return matchesSearch;
  });

  const featuredEvent = filteredEvents[0];
  const gridEvents = filteredEvents.slice(1);

  return (
    <div className="max-w-7xl mx-auto px-6 pt-28 pb-24">

      {/* ── Page Header ── */}
      <FadeInUp className="mb-10">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <p className="text-sm font-medium text-brand-primary uppercase tracking-widest mb-3">Explore</p>
            <h1 className="text-4xl md:text-5xl font-bold tracking-tighter text-white">
              Discover what's happening.
            </h1>
          </div>
          
          <div className="flex items-center gap-2 text-muted text-sm">
            <span className="w-2 h-2 rounded-full bg-event-wellness animate-pulse" />
            <span>{initialEvents.length} events found</span>
          </div>
        </div>
      </FadeInUp>

      {/* ── Search + Filters ── */}
      <FadeInUp delay={0.1} className="mb-12">
        <div className="flex flex-col gap-5">
          {/* Search */}
          <div className="relative group">
            <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-muted group-focus-within:text-brand-primary transition-colors" />
            <input 
              type="text"
              placeholder="Search events, topics, or cities..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-surface border border-white/[0.06] rounded-2xl pl-14 pr-6 py-4 text-base text-white placeholder-muted/60 focus:outline-none focus:border-brand-primary/40 focus:ring-1 focus:ring-brand-primary/20 transition-all"
            />
          </div>
          
          {/* Category Pills */}
          <div className="flex overflow-x-auto no-scrollbar gap-2 pb-2 -mx-2 px-2 md:mx-0 md:px-0 md:flex-wrap">
            {CATEGORIES.map((cat) => (
              <motion.button
                key={cat.id}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setActiveCategory(cat.id)}
                className={`px-5 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
                  activeCategory === cat.id 
                    ? "bg-brand-primary text-white shadow-lg shadow-brand-primary/20" 
                    : "bg-surface border border-white/[0.06] text-muted hover:text-white hover:border-white/10"
                }`}
              >
                {cat.label}
              </motion.button>
            ))}
          </div>
        </div>
      </FadeInUp>

      {/* ── Content ── */}
      {error ? (
        <div className="text-red-400 p-6 rounded-2xl bg-red-400/5 border border-red-400/10 text-center">
          Failed to load events: {error}
        </div>
      ) : filteredEvents.length > 0 ? (
        <div className="space-y-12">
          
          {/* Featured Event — Large Immersive Card */}
          {featuredEvent && (
            <FadeInUp delay={0.2}>
              <Link href={`/e/${featuredEvent.slug}`} className="group block">
                <div className="relative h-[280px] md:h-[380px] rounded-3xl overflow-hidden bg-surface border border-white/[0.06]">
                  {featuredEvent.banner_url ? (
                    <Image 
                      src={featuredEvent.banner_url} 
                      alt={featuredEvent.title} 
                      fill 
                      className="object-cover opacity-50 group-hover:opacity-70 group-hover:scale-[1.03] transition-all duration-700" 
                    />
                  ) : (
                    <div className="absolute inset-0 bg-gradient-to-br from-brand-primary/15 via-surface to-canvas" />
                  )}
                  
                  <div className="absolute inset-0 bg-gradient-to-t from-canvas via-canvas/50 to-transparent" />
                  
                  <div className="absolute bottom-0 left-0 right-0 p-8 md:p-12">
                    <div className="flex items-center gap-2 mb-3">
                      <Sparkles className="w-4 h-4 text-brand-primary" />
                      <span className="text-xs font-semibold text-brand-primary uppercase tracking-widest">Featured</span>
                    </div>
                    <h3 className="text-3xl md:text-4xl font-bold text-white mb-4 tracking-tight group-hover:text-brand-accent transition-colors">
                      {featuredEvent.title}
                    </h3>
                    <div className="flex flex-wrap items-center gap-6 text-sm text-muted">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-brand-primary" />
                        <span>{new Date(featuredEvent.start_date).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <MapPin className="w-4 h-4 text-brand-secondary" />
                        <span>{featuredEvent.location_name || "TBA"}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Users className="w-4 h-4 text-muted" />
                        <span>{featuredEvent.capacity ? `${featuredEvent.capacity} Spots` : "Open"}</span>
                      </div>
                    </div>
                  </div>
                  
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

          {/* Event Grid */}
          {gridEvents.length > 0 && (
            <StaggerContainer className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {gridEvents.map((event: any) => (
                <motion.div key={event.id} variants={staggerChildVariants}>
                  <EventCard event={event} href={`/e/${event.slug}`} />
                </motion.div>
              ))}
            </StaggerContainer>
          )}
        </div>
      ) : (
        <FadeInUp className="py-32 flex flex-col items-center justify-center text-center">
          <div className="w-20 h-20 rounded-2xl bg-surface flex items-center justify-center mb-6 border border-white/[0.06]">
            <Search className="w-8 h-8 text-muted/40" />
          </div>
          <h3 className="text-2xl font-bold text-white mb-3">No events found</h3>
          <p className="text-muted max-w-sm mb-8">
            We couldn't find anything matching your filters. Try a different search or category.
          </p>
          <Button variant="secondary" onClick={() => { setSearchQuery(""); setActiveCategory("all"); }}>
            Clear Filters
          </Button>
        </FadeInUp>
      )}
    </div>
  );
}
