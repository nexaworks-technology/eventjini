import Link from "next/link";
import { getEvents } from "@/app/actions/events";
import { GlassCard } from "@/components/ui/glass-card";
import { Button } from "@/components/ui/button";
import { PlusIcon, CalendarIcon, MapPinIcon, UsersIcon } from "lucide-react";
import { FadeInUp } from "@/components/animations/motion";

export const metadata = {
  title: "Events - EventJini",
};

export default async function EventsPage() {
  const { data: events, error } = await getEvents();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-white tracking-tight">Your Events</h1>
        <Link href="/dashboard/events/new">
          <Button variant="primary">
            <PlusIcon className="w-5 h-5 mr-1" />
            Create Event
          </Button>
        </Link>
      </div>

      {error ? (
        <div className="text-red-400 p-4 rounded-xl bg-red-400/10 border border-red-400/20">
          Failed to load events: {error}
        </div>
      ) : events && events.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {events.map((event: any, index: number) => (
            <GlassCard key={event.id} hoverGlow animate={false}>
              <FadeInUp delay={index * 0.1}>
                <div className="flex flex-col h-full">
                  <div className="mb-4">
                    <h3 className="text-xl font-semibold text-white truncate" title={event.title}>
                      {event.title}
                    </h3>
                    <p className="text-sm text-slate-400 mt-1">/{event.slug}</p>
                  </div>
                  
                  <div className="space-y-2 mt-auto mb-6 text-sm text-slate-300">
                    <div className="flex items-center">
                      <CalendarIcon className="w-4 h-4 mr-2 text-cyan-400" />
                      <span>{event.start_date ? new Date(event.start_date).toLocaleDateString() : event.date || "TBD"}</span>
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
                  
                  <Link href={`/dashboard/events/${event.id}`}>
                    <Button variant="secondary" className="w-full">
                      Manage Event
                    </Button>
                  </Link>
                </div>
              </FadeInUp>
            </GlassCard>
          ))}
        </div>
      ) : (
        <GlassCard className="flex flex-col items-center justify-center py-20 text-center">
          <div className="bg-cyan-500/10 p-4 rounded-full mb-4 border border-cyan-500/20">
            <CalendarIcon className="w-8 h-8 text-cyan-400" />
          </div>
          <h2 className="text-xl font-semibold text-white mb-2">No events yet — create your first!</h2>
          <p className="text-slate-400 max-w-md mb-8">
            Host amazing experiences with beautiful registration pages, 
            analytics, and seamless attendee management.
          </p>
          <Link href="/dashboard/events/new">
            <Button variant="primary" size="lg">
              <PlusIcon className="w-5 h-5 mr-1" />
              Create Event
            </Button>
          </Link>
        </GlassCard>
      )}
    </div>
  );
}
