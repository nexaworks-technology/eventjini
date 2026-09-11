import { createClient } from "@/utils/supabase/server";
import { cookies } from "next/headers";
import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { ReactNode } from "react";
import { LayoutDashboard, Users, BarChart3, Radio, ScanLine, Shield, Zap, Settings, Building } from "lucide-react";
import { EventNavClient } from "./event-nav-client";

export default async function EventLayout({
  children,
  params,
}: {
  children: ReactNode;
  params: Promise<{ id: string }> | { id: string };
}) {
  const resolvedParams = await Promise.resolve(params);
  const eventId = resolvedParams.id;
  
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);
  
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    redirect('/login');
  }

  const { data: event, error } = await supabase
    .from('events')
    .select('id, title, organizer_id')
    .eq('id', eventId)
    .single();

  if (error || !event) {
    notFound();
  }

  // 1. Determine user role
  let userRole = null;
  
  if (event.organizer_id === user.id) {
    userRole = 'owner';
  } else {
    // Check if they are a team member
    const { data: teamMember } = await supabase
      .from('event_team_members')
      .select('role')
      .eq('event_id', eventId)
      .eq('user_id', user.id)
      .single();
      
    if (teamMember) {
      userRole = teamMember.role;
    }
  }

  // If no role, kick them out
  if (!userRole) {
    redirect('/dashboard');
  }

  // 2. Define all possible nav items and their allowed roles
  const allNavItems = [
    { name: 'Overview', href: `/dashboard/organizer/events/${eventId}`, icon: LayoutDashboard, roles: ['owner', 'admin', 'finance'] },
    { name: 'Guests', href: `/dashboard/organizer/events/${eventId}/guests`, icon: Users, roles: ['owner', 'admin'] },
    { name: 'Sponsors', href: `/dashboard/organizer/events/${eventId}/sponsors/tiers`, icon: Building, roles: ['owner', 'admin'] },
    { name: 'Analytics', href: `/dashboard/organizer/events/${eventId}/analytics`, icon: BarChart3, roles: ['owner', 'admin', 'finance'] },
    { name: 'Scanner', href: `/dashboard/organizer/events/${eventId}/scanner`, icon: ScanLine, roles: ['owner', 'admin', 'scanner'] },
    { name: 'Automations', href: `/dashboard/organizer/events/${eventId}/automations`, icon: Zap, roles: ['owner', 'admin'] },
    { name: 'Team', href: `/dashboard/organizer/events/${eventId}/team`, icon: Shield, roles: ['owner', 'admin'] },
    { name: 'Settings', href: `/dashboard/organizer/events/${eventId}/settings`, icon: Settings, roles: ['owner', 'admin'] },
  ];

  // Filter based on user role
  const navItems = allNavItems.filter(item => item.roles.includes(userRole as string));

  return (
    <div className="flex flex-col min-h-screen">
      <EventNavClient navItems={navItems} eventTitle={event.title} />

      {/* Main Content (With left padding for the sidebar on desktop) */}
      <main className="flex-1 w-full p-4 md:p-8 md:pl-72">
        <div className="max-w-6xl mx-auto">{children}</div>
      </main>
    </div>
  );
}
