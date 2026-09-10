"use client";

import Link from "next/link";
import { GlassCard } from "./glass-card";
import { Calendar, MapPin, DollarSign, Users } from "lucide-react";
import Image from "next/image";

interface EventCardProps {
  event: any;
  variant?: "default" | "compact" | "horizontal";
  href: string;
}

export function EventCard({ event, variant = "default", href }: EventCardProps) {
  const isFree = !event.is_paid || event.ticket_price_cents === 0;
  
  return (
    <Link href={href} className="group block h-full">
      <GlassCard 
        level={2} 
        hoverGlow 
        animate={false} 
        className="h-full p-0 overflow-hidden flex flex-col"
      >
        <div className="relative h-48 w-full bg-canvas">
          {event.banner_url ? (
            <Image 
              src={event.banner_url} 
              alt={event.title} 
              fill 
              className="object-cover opacity-80 group-hover:opacity-100 transition-opacity duration-500 group-hover:scale-105" 
            />
          ) : (
            <div className="absolute inset-0 bg-gradient-to-br from-surface to-canvas" />
          )}
          
          <div className="absolute top-4 right-4 bg-canvas/80 backdrop-blur-md border border-glass-border px-3 py-1.5 rounded-full flex items-center gap-1.5">
            {isFree ? (
              <span className="text-xs font-semibold text-event-wellness">Free</span>
            ) : (
              <>
                <DollarSign className="w-3.5 h-3.5 text-brand-accent" />
                <span className="text-xs font-semibold text-white">{(event.ticket_price_cents / 100).toFixed(2)}</span>
              </>
            )}
          </div>
        </div>
        
        <div className="p-6 flex-1 flex flex-col bg-surface">
          <h3 className="text-xl font-bold text-white mb-2 line-clamp-2 group-hover:text-brand-accent transition-colors">
            {event.title}
          </h3>
          
          <div className="space-y-2 mt-auto pt-4">
            <div className="flex items-center text-sm text-muted">
              <Calendar className="w-4 h-4 mr-2 text-brand-primary" />
              <span>{event.start_date ? new Date(event.start_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : "TBA"}</span>
            </div>
            <div className="flex items-center text-sm text-muted">
              <MapPin className="w-4 h-4 mr-2 text-brand-secondary" />
              <span className="line-clamp-1">{event.location_name || "TBA"}</span>
            </div>
          </div>
        </div>
      </GlassCard>
    </Link>
  );
}
