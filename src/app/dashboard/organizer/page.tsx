import { createClient } from "@/utils/supabase/server";
import { cookies } from "next/headers";
import Link from "next/link";
import { GlassCard } from "@/components/ui/glass-card";
import { Button } from "@/components/ui/button";
import { Calendar, DollarSign, Users, TrendingUp, Plus, ArrowRight } from "lucide-react";

export const metadata = {
  title: "Dashboard | EventJini",
};

export default async function DashboardRootPage() {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);
  
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    const { redirect } = await import("next/navigation");
    redirect('/login');
  }

  // Temporary auto-migration for banners
  if (user) {
    const { data: missingEvents } = await supabase.from("events").select("id, title").eq("organizer_id", user.id).is("banner_url", null);
    if (missingEvents && missingEvents.length > 0) {
      for (const evt of missingEvents) {
        let banner_url = "/demo/tech.jpg";
        const titleLower = evt.title.toLowerCase();
        if (titleLower.includes("music") || titleLower.includes("festival") || titleLower.includes("neon")) {
          banner_url = "/demo/music.jpg";
        } else if (titleLower.includes("wellness") || titleLower.includes("yoga")) {
          banner_url = "/demo/wellness.jpg";
        }
        await supabase.from("events").update({ banner_url }).eq("id", evt.id);
      }
    }
  }

  // Fetch workspace name
  const { data: workspace } = await supabase
    .from("organizers")
    .select("name")
    .eq("owner_id", user?.id)
    .single();

  // Get team events
  const { data: teamMemberships } = await supabase
    .from("event_team_members")
    .select("event_id, role")
    .eq("user_id", user?.id);
    
  const teamEventIds = teamMemberships?.map(tm => tm.event_id) || [];
  const teamMemberMap = new Map(teamMemberships?.map(tm => [tm.event_id, tm.role]) || []);

  const orQuery = teamEventIds.length > 0 
    ? `organizer_id.eq.${user?.id},id.in.(${teamEventIds.join(',')})`
    : `organizer_id.eq.${user?.id}`;

  // Aggregate stats
  const { data: events } = await supabase
    .from("events")
    .select("id, title, slug, start_date, ticket_price_cents, capacity, organizer_id")
    .or(orQuery)
    .order("start_date", { ascending: true });

  let totalRevenue = 0;
  let totalAttendees = 0;

  if (events && events.length > 0) {
    const eventIds = events.map(e => e.id);
    
    const { count } = await supabase
      .from("registrations")
      .select("*", { count: "exact", head: true })
      .in("event_id", eventIds)
      .neq("status", "cancelled");

    totalAttendees = count || 0;
  }

  // Real revenue
  const { data: regs } = await supabase
    .from("registrations")
    .select(`event:events(ticket_price_cents)`)
    .eq("status", "approved")
    .neq("event:events.ticket_price_cents", null);
  
  if (regs) {
    totalRevenue = regs.reduce((sum, r: any) => sum + ((r.event?.ticket_price_cents || 0) / 100), 0);
  }

  const upcomingEvents = events?.filter(e => new Date(e.start_date) > new Date()).slice(0, 3) || [];

  const greeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 17) return "Good afternoon";
    return "Good evening";
  };

  return (
    <div className="space-y-10">
      {/* ── Greeting ── */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight mb-1">
            {greeting()}, {workspace?.name || "Organizer"} 👋
          </h1>
          <p className="text-muted">Here's what's happening across your workspace.</p>
        </div>
        <Link href="/dashboard/organizer/events/new">
          <Button variant="primary">
            <Plus className="w-4 h-4 mr-2" />
            New Event
          </Button>
        </Link>
      </div>

      {/* ── Stat Cards ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Revenue", value: `₹${totalRevenue.toLocaleString()}`, icon: DollarSign, color: "text-brand-primary", bg: "bg-brand-primary/10" },
          { label: "Attendees", value: totalAttendees.toLocaleString(), icon: Users, color: "text-brand-secondary", bg: "bg-brand-secondary/10" },
          { label: "Events", value: (events?.length || 0).toString(), icon: Calendar, color: "text-brand-accent", bg: "bg-brand-accent/10" },
          { label: "Growth", value: "+14%", icon: TrendingUp, color: "text-event-wellness", bg: "bg-event-wellness/10" },
        ].map((stat) => (
          <GlassCard key={stat.label} level={2} animate={false} className="p-5">
            <div className="flex justify-between items-start mb-4">
              <span className="text-xs font-semibold text-muted uppercase tracking-widest">{stat.label}</span>
              <div className={`p-2 rounded-xl ${stat.bg}`}>
                <stat.icon className={`w-4 h-4 ${stat.color}`} />
              </div>
            </div>
            <h2 className="text-2xl font-bold text-white tracking-tight">{stat.value}</h2>
          </GlassCard>
        ))}
      </div>

      {/* ── Upcoming Events ── */}
      {upcomingEvents.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-lg font-bold text-white tracking-tight">Upcoming Events</h2>
            <Link href="/dashboard/organizer/events" className="text-brand-primary hover:text-brand-accent text-sm font-medium flex items-center gap-1 transition-colors">
              View All <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
          <div className="space-y-3">
            {upcomingEvents.map((event: any) => {
              const role = event.organizer_id === user?.id ? 'owner' : teamMemberMap.get(event.id) as string;
              const targetHref = role === 'scanner' ? `/dashboard/organizer/events/${event.id}/scanner` : `/dashboard/organizer/events/${event.id}`;
              
              return (
                <Link key={event.id} href={targetHref} className="block group">
                  <GlassCard level={2} animate={false} hoverGlow className="p-5 flex items-center justify-between">
                    <div className="flex items-center gap-5">
                      <div className="w-12 h-12 rounded-xl bg-brand-primary/10 flex items-center justify-center shrink-0">
                        <Calendar className="w-5 h-5 text-brand-primary" />
                      </div>
                      <div>
                        <div className="flex items-center gap-3">
                          <h3 className="text-base font-semibold text-white group-hover:text-brand-accent transition-colors">{event.title}</h3>
                          {role !== 'owner' && (
                            <span className="px-2 py-0.5 rounded-md bg-white/5 border border-white/10 text-[10px] font-semibold uppercase tracking-wider text-muted">
                              {role}
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-muted mt-0.5">
                          {new Date(event.start_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                          {event.capacity > 0 && ` · ${event.capacity} capacity`}
                        </p>
                      </div>
                    </div>
                    <ArrowRight className="w-4 h-4 text-muted group-hover:text-brand-primary transition-colors" />
                  </GlassCard>
                </Link>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
