import { createClient } from "@/utils/supabase/server";
import { cookies } from "next/headers";
import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { ReactNode } from "react";
import { LayoutDashboard, Users, BarChart3, Radio, ScanLine } from "lucide-react";

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

  if (event.organizer_id !== user.id) {
    redirect('/dashboard');
  }

  const navItems = [
    { name: 'Overview', href: `/dashboard/events/${eventId}`, icon: LayoutDashboard },
    { name: 'Guests', href: `/dashboard/events/${eventId}/guests`, icon: Users },
    { name: 'Analytics', href: `/dashboard/events/${eventId}/analytics`, icon: BarChart3 },
    { name: 'Scanner', href: `/dashboard/events/${eventId}/scanner`, icon: ScanLine },
    { name: 'Broadcast', href: `/dashboard/events/${eventId}/broadcast`, icon: Radio },
  ];

  return (
    <div className="flex flex-col min-h-[calc(100vh-3.5rem)]">
      {/* ── Command Center Header ── */}
      <div className="sticky top-14 z-30 bg-canvas/90 backdrop-blur-xl border-b border-white/[0.04] px-6 py-3">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <h1 className="text-lg font-bold text-white tracking-tight">
              {event.title}
            </h1>
            <span className="px-2 py-0.5 rounded-full bg-brand-primary/10 text-[11px] font-semibold text-brand-primary border border-brand-primary/20">
              Command Center
            </span>
          </div>
          
          <nav className="flex items-center overflow-x-auto no-scrollbar gap-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all hover:bg-white/[0.04] text-muted hover:text-white whitespace-nowrap"
                >
                  <Icon className="w-4 h-4" />
                  <span>{item.name}</span>
                </Link>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Main Content */}
      <main className="flex-1 w-full max-w-6xl mx-auto p-6">
        {children}
      </main>
    </div>
  );
}
