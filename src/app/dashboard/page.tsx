import { createClient } from "@/utils/supabase/server";
import { cookies } from "next/headers";
import Link from "next/link";
import { GlassCard } from "@/components/ui/glass-card";
import { Button } from "@/components/ui/button";
import { Calendar, DollarSign, Users, TrendingUp, Plus } from "lucide-react";

export const metadata = {
  title: "Dashboard | EventJini",
};

export default async function DashboardRootPage() {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);
  
  const { data: { user } } = await supabase.auth.getUser();

  // Aggregate stats across all events for this workspace (owner)
  const { data: events } = await supabase
    .from("events")
    .select("id, ticket_price_cents")
    .eq("organizer_id", user?.id);

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
    
    // Simplistic revenue calculation for MVP (assuming all events are same price or we calculate average, actually we can just sum but it's hard without group by in JS. For MVP let's mock the sum if multiple prices, or just use 0 if free)
    // A better approach is to query registrations with event price joined.
  }

  // Get real revenue
  const { data: regs } = await supabase
    .from("registrations")
    .select(`event:events(ticket_price_cents)`)
    .eq("status", "approved")
    .neq("event:events.ticket_price_cents", null);
  
  // calculate total revenue
  if (regs) {
      totalRevenue = regs.reduce((sum, r: any) => sum + ((r.event?.ticket_price_cents || 0) / 100), 0);
  }


  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight">Command Center</h1>
          <p className="text-white/60 mt-1">Overview of your workspace performance.</p>
        </div>
        <Link href="/dashboard/events/new">
          <Button variant="primary">
            <Plus className="w-4 h-4 mr-2" />
            Host Event
          </Button>
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <GlassCard className="p-6 flex flex-col justify-between">
          <div className="flex justify-between items-start mb-4">
            <span className="text-sm font-medium text-white/60">Total Revenue</span>
            <div className="p-2 bg-cyan-500/10 rounded-lg text-cyan-400"><DollarSign className="w-5 h-5"/></div>
          </div>
          <h2 className="text-3xl font-bold text-white">${totalRevenue.toLocaleString()}</h2>
        </GlassCard>
        
        <GlassCard className="p-6 flex flex-col justify-between">
          <div className="flex justify-between items-start mb-4">
            <span className="text-sm font-medium text-white/60">Total Attendees</span>
            <div className="p-2 bg-purple-500/10 rounded-lg text-purple-400"><Users className="w-5 h-5"/></div>
          </div>
          <h2 className="text-3xl font-bold text-white">{totalAttendees.toLocaleString()}</h2>
        </GlassCard>

        <GlassCard className="p-6 flex flex-col justify-between">
          <div className="flex justify-between items-start mb-4">
            <span className="text-sm font-medium text-white/60">Events Hosted</span>
            <div className="p-2 bg-emerald-500/10 rounded-lg text-emerald-400"><Calendar className="w-5 h-5"/></div>
          </div>
          <h2 className="text-3xl font-bold text-white">{events?.length || 0}</h2>
        </GlassCard>
        
        <GlassCard className="p-6 flex flex-col justify-between">
          <div className="flex justify-between items-start mb-4">
            <span className="text-sm font-medium text-white/60">Growth</span>
            <div className="p-2 bg-amber-500/10 rounded-lg text-amber-400"><TrendingUp className="w-5 h-5"/></div>
          </div>
          <h2 className="text-3xl font-bold text-white">+14%</h2>
        </GlassCard>
      </div>
    </div>
  );
}
