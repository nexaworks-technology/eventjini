import { createClient } from "@/utils/supabase/server";
import { cookies } from "next/headers";
import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { ReactNode } from "react";
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

  return (
    <div className="flex flex-col min-h-screen">
      <EventNavClient eventId={eventId} userRole={userRole} eventTitle={event.title} />

      {/* Main Content (With left padding for the sidebar on desktop) */}
      <main className="flex-1 w-full p-4 md:p-8 md:pl-72">
        <div className="max-w-6xl mx-auto">{children}</div>
      </main>
    </div>
  );
}
