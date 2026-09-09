"use client";

import { useState } from "react";
import Link from "next/link";
import { GlassCard } from "@/components/ui/glass-card";
import { Button } from "@/components/ui/button";
import { Calendar, MapPin, Users, Search, DollarSign, Filter } from "lucide-react";
import { FadeInUp, StaggerContainer, staggerChildVariants } from "@/components/animations/motion";
import { motion } from "framer-motion";

export default function ExploreClient({ initialEvents, error }: { initialEvents: any[], error?: string }) {
  const [searchQuery, setSearchQuery] = useState("");
  const [filter, setFilter] = useState<"all" | "free" | "paid">("all");

  const filteredEvents = initialEvents.filter((event) => {
    const matchesSearch = event.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          (event.location_name && event.location_name.toLowerCase().includes(searchQuery.toLowerCase()));
    
    if (filter === "free") return matchesSearch && !event.is_paid;
    if (filter === "paid") return matchesSearch && event.is_paid;
    return matchesSearch;
  });

  return (
    <div className="max-w-7xl mx-auto px-6 pt-32 pb-24">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
        <FadeInUp>
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-white mb-4">
            Discover <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-500">Events</span>
          </h1>
          <p className="text-lg text-white/60 max-w-2xl">
            Find and join the best hackathons, tech meetups, and developer conferences happening around you.
          </p>
        </FadeInUp>

        <FadeInUp delay={0.1} className="w-full md:w-auto">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
              <input 
                type="text"
                placeholder="Search events or locations..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full sm:w-64 bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder-white/40 focus:outline-none focus:border-cyan-500/50 transition-colors"
              />
            </div>
            
            <div className="flex bg-white/5 border border-white/10 rounded-xl p-1">
              <button 
                onClick={() => setFilter("all")}
                className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-colors ${filter === "all" ? "bg-white/10 text-white" : "text-white/60 hover:text-white"}`}
              >
                All
              </button>
              <button 
                onClick={() => setFilter("free")}
                className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-colors ${filter === "free" ? "bg-white/10 text-white" : "text-white/60 hover:text-white"}`}
              >
                Free
              </button>
              <button 
                onClick={() => setFilter("paid")}
                className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-colors ${filter === "paid" ? "bg-white/10 text-white" : "text-white/60 hover:text-white"}`}
              >
                Paid
              </button>
            </div>
          </div>
        </FadeInUp>
      </div>

      {error ? (
        <div className="text-red-400 p-4 rounded-xl bg-red-400/10 border border-red-400/20 text-center">
          Failed to load events: {error}
        </div>
      ) : filteredEvents.length > 0 ? (
        <StaggerContainer className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredEvents.map((event: any, index: number) => (
            <motion.div key={event.id} variants={staggerChildVariants}>
              <Link href={`/e/${event.slug}`} className="block h-full transition-transform hover:-translate-y-1 duration-300">
                <GlassCard hoverGlow animate={false} className="h-full flex flex-col overflow-hidden p-0 border border-white/10 group">
                  
                  {/* Event Image / Gradient Placeholder */}
                  <div className={`h-48 w-full bg-gradient-to-br ${event.theme_gradient || 'from-slate-800 to-slate-900'} relative`}>
                    {event.banner_url ? (
                      <img src={event.banner_url} alt={event.title} className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity" />
                    ) : (
                      <div className="absolute inset-0 opacity-20 bg-[url('/noise.png')] mix-blend-overlay"></div>
                    )}
                    
                    {/* Price Badge */}
                    <div className="absolute top-4 right-4 bg-black/60 backdrop-blur-md border border-white/10 px-3 py-1.5 rounded-full flex items-center gap-1.5">
                      {event.is_paid ? (
                        <>
                          <DollarSign className="w-3.5 h-3.5 text-cyan-400" />
                          <span className="text-xs font-semibold text-white">{event.ticket_price_cents / 100}</span>
                        </>
                      ) : (
                        <span className="text-xs font-semibold text-emerald-400">Free</span>
                      )}
                    </div>
                  </div>

                  {/* Content */}
                  <div className="p-6 flex flex-col flex-1">
                    <h3 className="text-xl font-bold text-white mb-2 line-clamp-2 group-hover:text-cyan-400 transition-colors">
                      {event.title}
                    </h3>
                    
                    <div className="space-y-2 mt-4 mb-6">
                      <div className="flex items-center text-sm text-slate-300">
                        <Calendar className="w-4 h-4 mr-3 text-cyan-400 shrink-0" />
                        <span>{new Date(event.start_date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' })}</span>
                      </div>
                      <div className="flex items-center text-sm text-slate-300">
                        <MapPin className="w-4 h-4 mr-3 text-purple-400 shrink-0" />
                        <span className="truncate">{event.location_name || "TBA"}</span>
                      </div>
                      <div className="flex items-center text-sm text-slate-300">
                        <Users className="w-4 h-4 mr-3 text-slate-400 shrink-0" />
                        <span>{event.capacity ? `${event.capacity} Spots` : "Open Event"}</span>
                      </div>
                    </div>
                    
                    <div className="mt-auto pt-4 border-t border-white/5 flex items-center gap-3">
                      {event.organizer?.avatar_url ? (
                        <img src={event.organizer.avatar_url} className="w-6 h-6 rounded-full bg-white/10" alt="" />
                      ) : (
                        <div className="w-6 h-6 rounded-full bg-gradient-to-tr from-cyan-500 to-purple-500" />
                      )}
                      <span className="text-xs text-slate-400 font-medium truncate">
                        By {event.organizer?.full_name || "EventJini Organizer"}
                      </span>
                    </div>
                  </div>
                </GlassCard>
              </Link>
            </motion.div>
          ))}
        </StaggerContainer>
      ) : (
        <div className="py-32 flex flex-col items-center justify-center text-center">
          <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mb-4 border border-white/10">
            <Search className="w-8 h-8 text-white/20" />
          </div>
          <h3 className="text-xl font-semibold text-white mb-2">No events found</h3>
          <p className="text-white/50 max-w-sm">
            We couldn't find any events matching your current filters. Try adjusting your search query.
          </p>
          <Button variant="secondary" className="mt-6" onClick={() => { setSearchQuery(""); setFilter("all"); }}>
            Clear Filters
          </Button>
        </div>
      )}
    </div>
  );
}
