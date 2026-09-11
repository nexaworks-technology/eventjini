"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { ArrowLeft, LayoutDashboard, Users, BarChart3, ScanLine, Shield, Zap, Settings, Building, Send } from "lucide-react";

export function EventNavClient({ eventId, userRole, eventTitle }: { eventId: string, userRole: string, eventTitle: string }) {
  const pathname = usePathname();

  const allNavItems = [
    { name: 'Overview', href: `/dashboard/organizer/events/${eventId}`, icon: LayoutDashboard, roles: ['owner', 'admin', 'finance'] },
    { name: 'Guests', href: `/dashboard/organizer/events/${eventId}/guests`, icon: Users, roles: ['owner', 'admin'] },
    { name: 'Sponsors', href: `/dashboard/organizer/events/${eventId}/sponsors/tiers`, icon: Building, roles: ['owner', 'admin'] },
    { name: 'Analytics', href: `/dashboard/organizer/events/${eventId}/analytics`, icon: BarChart3, roles: ['owner', 'admin', 'finance'] },
    { name: 'Scanner', href: `/dashboard/organizer/events/${eventId}/scanner`, icon: ScanLine, roles: ['owner', 'admin', 'scanner'] },
    { name: 'Broadcast', href: `/dashboard/organizer/events/${eventId}/broadcast`, icon: Send, roles: ['owner', 'admin'] },
    { name: 'Automations', href: `/dashboard/organizer/events/${eventId}/automations`, icon: Zap, roles: ['owner', 'admin'] },
    { name: 'Team', href: `/dashboard/organizer/events/${eventId}/team`, icon: Shield, roles: ['owner', 'admin'] },
    { name: 'Settings', href: `/dashboard/organizer/events/${eventId}/settings`, icon: Settings, roles: ['owner', 'admin'] },
  ];

  const navItems = allNavItems.filter(item => item.roles.includes(userRole));

  return (
    <aside className="fixed inset-y-0 left-0 w-64 bg-surface border-r border-white/[0.04] z-40 hidden md:flex flex-col">
      {/* Header with Back Button */}
      <div className="flex flex-col px-4 py-4 border-b border-white/[0.04] gap-4">
        <Link 
          href="/dashboard/organizer/events" 
          className="flex items-center gap-2 text-xs font-medium text-muted hover:text-white transition-colors w-fit"
        >
          <ArrowLeft className="w-3 h-3" />
          Back to Dashboard
        </Link>
        <div className="flex flex-col">
          <span className="text-lg font-bold text-white tracking-tight line-clamp-1">{eventTitle}</span>
          <span className="text-[10px] font-medium text-brand-primary uppercase tracking-widest leading-tight">Command Center</span>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-1">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;

          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "relative flex items-center gap-3 rounded-xl px-4 py-2.5 text-sm font-medium transition-all duration-200",
                isActive
                  ? "text-white bg-white/[0.06]"
                  : "text-muted hover:text-white hover:bg-white/[0.03]"
              )}
            >
              {isActive && (
                <div className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-5 bg-brand-primary rounded-r-full" />
              )}
              <Icon className={cn("h-[18px] w-[18px]", isActive ? "text-brand-primary" : "text-muted")} />
              {item.name}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
