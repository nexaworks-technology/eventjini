"use client";

import Link from "next/link";
import { GlassCard } from "./glass-card";
import { MapPin, Heart, ArrowRight } from "lucide-react";
import Image from "next/image";

interface EventCardProps {
  event: any;
  href: string;
}

export function EventCard({ event, href }: EventCardProps) {
  // Mock category since db doesn't have it natively yet
  const category = event.title.toLowerCase().includes("tech") || event.title.toLowerCase().includes("zero") 
    ? "Tech" 
    : event.title.toLowerCase().includes("design") ? "Design" 
    : event.title.toLowerCase().includes("music") || event.title.toLowerCase().includes("echoes") ? "Music" 
    : "Community";

  const isFree = !event.is_paid || event.ticket_price_cents === 0;
  
  const startDate = new Date(event.start_date);
  const month = startDate.toLocaleString('en-US', { month: 'short' }).toUpperCase();
  const day = startDate.getDate();

  return (
    <Link href={href} className="group block h-full w-full max-w-[340px] sm:max-w-none flex-shrink-0 snap-center">
      <GlassCard 
        level={2} 
        animate={false} 
        className="h-full p-0 overflow-hidden flex flex-col border border-white/[0.04] hover:border-white/10 hover:shadow-[0_8px_30px_rgb(0,0,0,0.5)] transition-all duration-300 group-hover:-translate-y-1 bg-[#0A0D14]"
      >
        <div className="relative h-[200px] w-full bg-canvas overflow-hidden">
          {event.banner_url ? (
            <Image 
              src={event.banner_url} 
              alt={event.title} 
              fill 
              className="object-cover opacity-90 group-hover:opacity-100 transition-transform duration-500 group-hover:scale-105" 
            />
          ) : (
            <div className="absolute inset-0 bg-gradient-to-br from-[#131B2F] to-[#0A0D14]" />
          )}
          
          {/* Subtle gradient overlay to ensure badge contrast */}
          <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-black/20" />
          
          {/* Date Badge */}
          <div className="absolute top-4 left-4 bg-white text-black px-3 py-1.5 rounded-xl flex flex-col items-center justify-center min-w-[50px] shadow-lg">
            <span className="text-[10px] font-bold tracking-widest leading-none mb-0.5">{month}</span>
            <span className="text-lg font-bold leading-none">{day}</span>
          </div>

          {/* Heart Button */}
          <button className="absolute top-4 right-4 w-8 h-8 rounded-full bg-black/40 backdrop-blur-md border border-white/10 flex items-center justify-center text-white/70 hover:text-white hover:bg-white/20 hover:scale-110 transition-all">
            <Heart className="w-4 h-4" />
          </button>
        </div>
        
        <div className="p-5 flex-1 flex flex-col">
          {/* Category Pills */}
          <div className="flex flex-wrap gap-2 mb-3">
            <span className="px-2.5 py-1 rounded-full bg-white/[0.04] border border-white/[0.06] text-[10px] font-medium text-white/70 tracking-wide">
              {category}
            </span>
            <span className="px-2.5 py-1 rounded-full bg-white/[0.04] border border-white/[0.06] text-[10px] font-medium text-white/70 tracking-wide">
              {isFree ? "Free" : `₹${(event.ticket_price_cents / 100).toFixed(0)}`}
            </span>
          </div>

          <h3 className="text-lg font-bold text-white mb-2 line-clamp-1 group-hover:text-brand-primary transition-colors">
            {event.title}
          </h3>
          
          <div className="flex items-center justify-between mt-auto pt-2">
            <div className="flex items-center text-xs text-muted font-medium">
              <MapPin className="w-3.5 h-3.5 mr-1.5 opacity-70" />
              <span className="line-clamp-1">{event.location_name || "Online"}</span>
            </div>
            
            {/* Arrow Affordance */}
            <div className="w-8 h-8 rounded-full bg-white/[0.03] border border-white/[0.05] flex items-center justify-center text-white/50 group-hover:text-white group-hover:bg-white/[0.1] transition-all duration-300">
              <ArrowRight className="w-4 h-4 -translate-x-0.5 group-hover:translate-x-0 transition-transform duration-300" />
            </div>
          </div>
        </div>
      </GlassCard>
    </Link>
  );
}
