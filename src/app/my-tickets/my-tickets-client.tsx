"use client";

import Link from "next/link";
import { GlassCard } from "@/components/ui/glass-card";
import { Button } from "@/components/ui/button";
import { Calendar, MapPin, Ticket as TicketIcon } from "lucide-react";
import { FadeInUp, StaggerContainer, staggerChildVariants } from "@/components/animations/motion";
import { motion } from "framer-motion";

export default function MyTicketsClient({ initialTickets, error }: { initialTickets: any[], error?: string }) {
  const now = new Date();
  
  const upcomingTickets = initialTickets.filter(t => new Date(t.event.end_date || t.event.start_date) > now);
  const pastTickets = initialTickets.filter(t => new Date(t.event.end_date || t.event.start_date) <= now);

  const renderTicketCard = (ticket: any) => (
    <motion.div key={ticket.id} variants={staggerChildVariants}>
      <Link href={`/e/${ticket.event.slug}/ticket?code=${ticket.ticket_code}`} className="block h-full transition-transform hover:-translate-y-1 duration-300">
        <GlassCard hoverGlow animate={false} className="h-full flex flex-col p-6 group">
          <div className="flex justify-between items-start mb-4">
            <div className={`p-3 rounded-2xl flex items-center justify-center border ${
              ticket.status === 'checked_in' ? 'bg-emerald-500/20 border-emerald-500/20 text-emerald-500' :
              ticket.status === 'approved' ? 'bg-cyan-500/20 border-cyan-500/20 text-cyan-500' :
              ticket.status === 'pending' ? 'bg-orange-500/20 border-orange-500/20 text-orange-500' :
              'bg-red-500/20 border-red-500/20 text-red-500'
            }`}>
              <TicketIcon className="w-6 h-6" />
            </div>
            
            <span className={`px-2.5 py-1 text-xs font-semibold rounded-full border ${
              ticket.status === 'checked_in' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' :
              ticket.status === 'approved' ? 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20' :
              ticket.status === 'pending' ? 'bg-orange-500/10 text-orange-400 border-orange-500/20' :
              'bg-red-500/10 text-red-400 border-red-500/20'
            }`}>
              {ticket.status.toUpperCase()}
            </span>
          </div>

          <h3 className="text-xl font-bold text-white mb-2 line-clamp-1 group-hover:text-cyan-400 transition-colors">
            {ticket.event.title}
          </h3>
          
          <div className="space-y-2 mt-2 mb-6">
            <div className="flex items-center text-sm text-slate-300">
              <Calendar className="w-4 h-4 mr-3 text-cyan-400 shrink-0" />
              <span>{new Date(ticket.event.start_date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' })}</span>
            </div>
            <div className="flex items-center text-sm text-slate-300">
              <MapPin className="w-4 h-4 mr-3 text-purple-400 shrink-0" />
              <span className="truncate">{ticket.event.location_name || "TBA"}</span>
            </div>
          </div>
          
          <div className="mt-auto pt-4 border-t border-white/5 flex items-center justify-between">
            <div className="text-xs text-slate-400">
              Ticket Code
            </div>
            <div className="font-mono text-sm text-white font-medium bg-white/10 px-2 py-1 rounded">
              {ticket.ticket_code}
            </div>
          </div>
        </GlassCard>
      </Link>
    </motion.div>
  );

  return (
    <div className="max-w-7xl mx-auto px-6 pt-32 pb-24">
      <FadeInUp>
        <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-white mb-4">
          My <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-500">Tickets</span>
        </h1>
        <p className="text-lg text-white/60 max-w-2xl mb-12">
          Access your digital QR tickets for upcoming events and view your attendance history.
        </p>
      </FadeInUp>

      {error && (
        <div className="text-red-400 p-4 rounded-xl bg-red-400/10 border border-red-400/20 mb-8">
          Failed to load tickets: {error}
        </div>
      )}

      {upcomingTickets.length > 0 && (
        <div className="mb-16">
          <h2 className="text-2xl font-bold text-white mb-6">Upcoming Events</h2>
          <StaggerContainer className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {upcomingTickets.map(renderTicketCard)}
          </StaggerContainer>
        </div>
      )}

      {pastTickets.length > 0 && (
        <div>
          <h2 className="text-2xl font-bold text-white mb-6">Past Events</h2>
          <StaggerContainer className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 opacity-70">
            {pastTickets.map(renderTicketCard)}
          </StaggerContainer>
        </div>
      )}

      {initialTickets.length === 0 && !error && (
        <div className="py-20 flex flex-col items-center justify-center text-center">
          <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mb-4 border border-white/10">
            <TicketIcon className="w-8 h-8 text-white/20" />
          </div>
          <h3 className="text-xl font-semibold text-white mb-2">No tickets yet!</h3>
          <p className="text-white/50 max-w-sm mb-6">
            You haven't registered for any events yet. Explore public events and get your first ticket.
          </p>
          <Link href="/explore">
            <Button variant="primary">
              Explore Events
            </Button>
          </Link>
        </div>
      )}
    </div>
  );
}
