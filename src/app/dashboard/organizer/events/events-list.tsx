"use client";

import { useState } from "react";
import Link from "next/link";
import { GlassCard } from "@/components/ui/glass-card";
import { Button } from "@/components/ui/button";
import { PlusIcon, CalendarIcon, MapPinIcon, UsersIcon, Copy, Loader2 } from "lucide-react";
import { FadeInUp } from "@/components/animations/motion";
import { duplicateEvent } from "@/app/actions/events";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

export function EventsList({ events }: { events: any[] }) {
  const router = useRouter();
  const [cloningId, setCloningId] = useState<string | null>(null);

  const handleClone = async (id: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    setCloningId(id);
    const result = await duplicateEvent(id);
    setCloningId(null);
    
    if (result.error) {
      toast.error(result.error);
    } else if (result.data) {
      toast.success("Event duplicated successfully!");
      router.push(`/dashboard/organizer/events/${result.data.id}`);
    }
  };

  if (!events || events.length === 0) {
    return (
      <GlassCard className="flex flex-col items-center justify-center py-20 text-center">
        <div className="bg-cyan-500/10 p-4 rounded-full mb-4 border border-cyan-500/20">
          <CalendarIcon className="w-8 h-8 text-cyan-400" />
        </div>
        <h2 className="text-xl font-semibold text-white mb-2">No events yet — create your first!</h2>
        <p className="text-slate-400 max-w-md mb-8">
          Host amazing experiences with beautiful registration pages, 
          analytics, and seamless attendee management.
        </p>
        <Link href="/dashboard/organizer/events/new">
          <Button variant="primary" size="lg">
            <PlusIcon className="w-5 h-5 mr-1" />
            Create Event
          </Button>
        </Link>
      </GlassCard>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {events.map((event: any, index: number) => (
        <GlassCard key={event.id} hoverGlow animate={false}>
          <FadeInUp delay={index * 0.1}>
            <div className="flex flex-col h-full">
              <div className="mb-4">
                <div className="flex justify-between items-start">
                  <h3 className="text-xl font-semibold text-white truncate max-w-[80%]" title={event.title}>
                    {event.title}
                  </h3>
                  <button 
                    onClick={(e) => handleClone(event.id, e)}
                    disabled={cloningId === event.id}
                    className="p-2 bg-white/5 hover:bg-white/10 rounded-lg text-slate-400 hover:text-white transition-colors border border-white/5"
                    title="Duplicate Event"
                  >
                    {cloningId === event.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Copy className="w-4 h-4" />}
                  </button>
                </div>
                <p className="text-sm text-slate-400 mt-1">/{event.slug}</p>
              </div>
              
              <div className="space-y-2 mt-auto mb-6 text-sm text-slate-300">
                <div className="flex items-center">
                  <CalendarIcon className="w-4 h-4 mr-2 text-cyan-400" />
                  <span>{event.start_date ? new Date(event.start_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : event.date || "TBD"}</span>
                </div>
                <div className="flex items-center">
                  <MapPinIcon className="w-4 h-4 mr-2 text-purple-400" />
                  <span className="truncate">{event.location_name || event.location || "TBD"}</span>
                </div>
                <div className="flex items-center">
                  <UsersIcon className="w-4 h-4 mr-2 text-slate-400" />
                  <span>{event.capacity > 0 ? `${event.registeredCount || 0} / ${event.capacity}` : "Unlimited capacity"}</span>
                </div>
              </div>
              
              <Link href={`/dashboard/organizer/events/${event.id}`}>
                <Button variant="secondary" className="w-full">
                  Manage Event
                </Button>
              </Link>
            </div>
          </FadeInUp>
        </GlassCard>
      ))}
    </div>
  );
}
