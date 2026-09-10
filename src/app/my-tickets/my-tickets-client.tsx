"use client";

import Link from "next/link";
import { GlassCard } from "@/components/ui/glass-card";
import { Button } from "@/components/ui/button";
import { Calendar, MapPin, Ticket as TicketIcon, ArrowRight, Sparkles } from "lucide-react";
import { FadeInUp, StaggerContainer, staggerChildVariants } from "@/components/animations/motion";
import { motion } from "framer-motion";

export default function MyTicketsClient({ initialTickets, error }: { initialTickets: any[], error?: string }) {
  const now = new Date();
  
  const upcomingTickets = initialTickets.filter(t => new Date(t.event.end_date || t.event.start_date) > now);
  const pastTickets = initialTickets.filter(t => new Date(t.event.end_date || t.event.start_date) <= now);

  const nextEvent = upcomingTickets[0];
  const otherUpcoming = upcomingTickets.slice(1);

  const statusColor = (status: string) => {
    switch (status) {
      case 'checked_in': return { bg: 'bg-emerald-500/10', text: 'text-emerald-400', border: 'border-emerald-500/20', dot: 'bg-emerald-500' };
      case 'approved': return { bg: 'bg-brand-primary/10', text: 'text-brand-primary', border: 'border-brand-primary/20', dot: 'bg-brand-primary' };
      case 'pending': return { bg: 'bg-amber-500/10', text: 'text-amber-400', border: 'border-amber-500/20', dot: 'bg-amber-500' };
      default: return { bg: 'bg-red-500/10', text: 'text-red-400', border: 'border-red-500/20', dot: 'bg-red-500' };
    }
  };

  const renderTicketCard = (ticket: any) => {
    const colors = statusColor(ticket.status);
    return (
      <motion.div key={ticket.id} variants={staggerChildVariants}>
        <Link href={`/e/${ticket.event.slug}/ticket?code=${ticket.ticket_code}`} className="block h-full group">
          <GlassCard level={2} hoverGlow animate={false} className="h-full flex flex-col p-6">
            {/* Header Row */}
            <div className="flex justify-between items-start mb-5">
              <div className={`p-2.5 rounded-xl ${colors.bg} ${colors.border} border`}>
                <TicketIcon className={`w-5 h-5 ${colors.text}`} />
              </div>
              <span className={`px-2.5 py-1 text-[11px] font-semibold rounded-full ${colors.bg} ${colors.text} ${colors.border} border flex items-center gap-1.5`}>
                <span className={`w-1.5 h-1.5 rounded-full ${colors.dot}`} />
                {ticket.status.toUpperCase()}
              </span>
            </div>

            {/* Event Name */}
            <h3 className="text-lg font-bold text-white mb-3 line-clamp-1 group-hover:text-brand-accent transition-colors">
              {ticket.event.title}
            </h3>
            
            {/* Details */}
            <div className="space-y-2.5 mb-5">
              <div className="flex items-center text-sm text-muted">
                <Calendar className="w-4 h-4 mr-2.5 text-brand-primary shrink-0" />
                <span>{new Date(ticket.event.start_date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}</span>
              </div>
              <div className="flex items-center text-sm text-muted">
                <MapPin className="w-4 h-4 mr-2.5 text-brand-secondary shrink-0" />
                <span className="truncate">{ticket.event.location_name || "TBA"}</span>
              </div>
            </div>
            
            {/* Ticket Code */}
            <div className="mt-auto pt-4 border-t border-white/[0.04] flex items-center justify-between">
              <span className="text-xs text-muted/60 uppercase tracking-wider">Ticket</span>
              <span className="font-mono text-sm text-white/80 bg-white/[0.04] px-2.5 py-1 rounded-lg">
                {ticket.ticket_code}
              </span>
            </div>
          </GlassCard>
        </Link>
      </motion.div>
    );
  };

  return (
    <div className="max-w-7xl mx-auto px-6 pt-28 pb-24">

      {/* ── Greeting ── */}
      <FadeInUp className="mb-12">
        <p className="text-sm font-medium text-brand-primary uppercase tracking-widest mb-3">My Tickets</p>
        <h1 className="text-4xl md:text-5xl font-bold tracking-tighter text-white">
          Your event wallet.
        </h1>
      </FadeInUp>

      {error && (
        <div className="text-red-400 p-4 rounded-2xl bg-red-400/5 border border-red-400/10 mb-8">
          Failed to load tickets: {error}
        </div>
      )}

      {/* ── Next Experience — Hero Card ── */}
      {nextEvent && (
        <FadeInUp delay={0.1} className="mb-16">
          <p className="text-xs font-semibold text-muted uppercase tracking-widest mb-4">Your next experience</p>
          <Link href={`/e/${nextEvent.event.slug}/ticket?code=${nextEvent.ticket_code}`} className="group block">
            <GlassCard level={3} animate={false} className="p-0 overflow-hidden rounded-3xl">
              <div className="relative flex flex-col md:flex-row">
                {/* Left — Event Info */}
                <div className="flex-1 p-8 md:p-12 flex flex-col justify-center">
                  <div className="flex items-center gap-2 mb-4">
                    <Sparkles className="w-4 h-4 text-brand-primary" />
                    <span className="text-xs font-semibold text-brand-primary uppercase tracking-widest">Next Up</span>
                  </div>
                  <h2 className="text-3xl md:text-4xl font-bold text-white mb-6 tracking-tight group-hover:text-brand-accent transition-colors">
                    {nextEvent.event.title}
                  </h2>
                  <div className="space-y-3 mb-8">
                    <div className="flex items-center text-muted">
                      <Calendar className="w-5 h-5 mr-3 text-brand-primary" />
                      <span>{new Date(nextEvent.event.start_date).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}</span>
                    </div>
                    <div className="flex items-center text-muted">
                      <MapPin className="w-5 h-5 mr-3 text-brand-secondary" />
                      <span>{nextEvent.event.location_name || "TBA"}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 text-brand-accent text-sm font-medium group-hover:gap-3 transition-all">
                    View Ticket <ArrowRight className="w-4 h-4" />
                  </div>
                </div>

                {/* Right — Visual Accent */}
                <div className="hidden md:block w-[320px] relative">
                  <div className="absolute inset-0 bg-gradient-to-r from-glass to-transparent" />
                  <div className="absolute inset-0 bg-gradient-to-br from-brand-primary/10 via-brand-secondary/5 to-transparent" />
                  <div className="absolute bottom-8 right-8 text-right">
                    <p className="text-muted/40 text-xs uppercase tracking-widest mb-1">Code</p>
                    <p className="font-mono text-2xl text-white/60 tracking-widest">{nextEvent.ticket_code}</p>
                  </div>
                </div>
              </div>
            </GlassCard>
          </Link>
        </FadeInUp>
      )}

      {/* ── Other Upcoming ── */}
      {otherUpcoming.length > 0 && (
        <div className="mb-16">
          <FadeInUp delay={0.2}>
            <h2 className="text-xl font-bold text-white mb-6 tracking-tight">Upcoming</h2>
          </FadeInUp>
          <StaggerContainer className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {otherUpcoming.map(renderTicketCard)}
          </StaggerContainer>
        </div>
      )}

      {/* ── Past Events ── */}
      {pastTickets.length > 0 && (
        <div>
          <FadeInUp delay={0.3}>
            <h2 className="text-xl font-bold text-white/60 mb-6 tracking-tight">Past</h2>
          </FadeInUp>
          <StaggerContainer className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 opacity-60">
            {pastTickets.map(renderTicketCard)}
          </StaggerContainer>
        </div>
      )}

      {/* ── Empty State ── */}
      {initialTickets.length === 0 && !error && (
        <FadeInUp className="py-24 flex flex-col items-center justify-center text-center">
          <div className="w-20 h-20 rounded-2xl bg-surface flex items-center justify-center mb-6 border border-white/[0.06]">
            <TicketIcon className="w-8 h-8 text-muted/30" />
          </div>
          <h3 className="text-2xl font-bold text-white mb-3">No tickets yet</h3>
          <p className="text-muted max-w-sm mb-8">
            You haven't registered for any events yet. Find something incredible.
          </p>
          <Link href="/explore">
            <Button variant="primary">
              Explore Events
            </Button>
          </Link>
        </FadeInUp>
      )}
    </div>
  );
}
