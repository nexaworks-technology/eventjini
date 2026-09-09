import { createClient } from "@/utils/supabase/server";
import { cookies } from "next/headers";
import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { ReactNode } from "react";
import { LayoutDashboard, Users, CheckSquare, DollarSign, Radio, ScanLine } from "lucide-react";

export default async function EventLayout({
  children,
  params,
}: {
  children: ReactNode;
  params: Promise<{ id: string }> | { id: string };
}) {
  // Await params if it's a promise, per Next.js 15+ patterns, or use directly in Next.js 14
  // For Next.js 16 (App Router), params is often asynchronous.
  const resolvedParams = await Promise.resolve(params);
  const eventId = resolvedParams.id;
  
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);
  
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    redirect('/login');
  }

  // Fetch event to verify ownership
  const { data: event, error } = await supabase
    .from('events')
    .select('id, title, organizer_id')
    .eq('id', eventId)
    .single();

  if (error || !event) {
    notFound();
  }

  // Ensure the user is the organizer of the event
  if (event.organizer_id !== user.id) {
    redirect('/dashboard');
  }

  const navItems = [
    { name: 'Overview', href: `/dashboard/events/${eventId}`, icon: LayoutDashboard },
    { name: 'Guests', href: `/dashboard/events/${eventId}/guests`, icon: Users },
    { name: 'Tasks', href: `/dashboard/events/${eventId}/tasks`, icon: CheckSquare },
    { name: 'Budget', href: `/dashboard/events/${eventId}/budget`, icon: DollarSign },
    { name: 'Broadcast', href: `/dashboard/events/${eventId}/broadcast`, icon: Radio },
    { name: 'Scanner', href: `/dashboard/events/${eventId}/scanner`, icon: ScanLine },
  ];

  return (
    <div className="flex flex-col min-h-screen bg-[#050505] text-white">
      {/* Secondary Navigation - Glassmorphism */}
      <div className="sticky top-0 z-40 backdrop-blur-2xl bg-white/[0.03] border-b border-white/10 px-6 py-4">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center space-x-3">
            <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-[#06b6d4] to-[#a855f7]">
              {event.title}
            </h1>
            <span className="px-2 py-0.5 rounded-full bg-white/10 text-xs font-medium text-white/70">
              Event OS
            </span>
          </div>
          
          <nav className="flex items-center overflow-x-auto no-scrollbar gap-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className="flex items-center space-x-2 px-4 py-2 rounded-xl text-sm font-medium transition-all hover:bg-white/10 text-white/80 hover:text-white whitespace-nowrap"
                >
                  <Icon className="w-4 h-4 text-[#06b6d4]" />
                  <span>{item.name}</span>
                </Link>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Main Content Area */}
      <main className="flex-1 w-full max-w-7xl mx-auto p-6">
        {children}
      </main>
    </div>
  );
}
