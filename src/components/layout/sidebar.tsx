"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Compass, Settings, Building2, Ticket, Rocket, PlusCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import Image from "next/image";
import { useState, useEffect } from "react";

export function Sidebar({ hasEvents = false, hasSponsorships = false }: { hasEvents?: boolean, hasSponsorships?: boolean }) {
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Unified Smart Navigation Links
  const links = [
    { name: "My Tickets", href: "/dashboard/attendee", icon: Ticket, exact: true },
    { name: "Explore", href: "/explore", icon: Compass },
  ];

  if (hasEvents) {
    links.push({ name: "My Events", href: "/dashboard/organizer/events", icon: Rocket });
  }
  
  if (hasSponsorships) {
    links.push({ name: "Sponsorships", href: "/dashboard/sponsor/portal", icon: Building2 });
  }
  
  links.push({ name: "Settings", href: "/dashboard/attendee/profile", icon: Settings });

  return (
    <aside className="fixed inset-y-0 left-0 w-64 bg-surface border-r border-white/[0.04] z-40 hidden md:flex flex-col">
      {/* Logo */}
      <div className="flex h-16 items-center px-6 border-b border-white/[0.04]">
        <Link href="/dashboard" className="flex items-center gap-2.5 group">
          <div className="relative w-8 h-8 rounded-lg overflow-hidden ring-1 ring-white/10 group-hover:ring-white/20 transition-all">
            <Image src="/logo.jpg" alt="Logo" fill className="object-cover" />
          </div>
          <span className="text-lg font-bold text-white tracking-tight">EventJini</span>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-1">
        {links.map((link) => {
          const isActive = link.exact 
            ? pathname === link.href 
            : pathname.startsWith(link.href);
          const Icon = link.icon;

          return (
            <Link
              key={link.name}
              href={link.href}
              className={cn(
                "relative flex items-center gap-3 rounded-xl px-4 py-2.5 text-sm font-medium transition-all duration-200",
                isActive
                  ? "text-white bg-white/[0.06]"
                  : "text-muted hover:text-white hover:bg-white/[0.03]"
              )}
            >
              {mounted && isActive && (
                <motion.div
                  layoutId="sidebar-indicator"
                  className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-5 bg-brand-primary rounded-r-full"
                  transition={{ type: "spring", stiffness: 300, damping: 30 }}
                />
              )}
              <Icon className={cn("h-[18px] w-[18px]", isActive ? "text-brand-primary" : "text-muted")} />
              {link.name}
            </Link>
          );
        })}
      </nav>

      {/* Footer / Host CTA */}
      <div className="px-4 py-4 border-t border-white/[0.04] flex flex-col gap-4">
        {!hasEvents && (
          <Link href="/dashboard/organizer/events/new" className="w-full">
            <button className="w-full flex items-center justify-center gap-2 bg-brand-primary/10 hover:bg-brand-primary/20 text-brand-primary border border-brand-primary/20 transition-colors py-2.5 rounded-xl text-sm font-bold">
              <PlusCircle className="w-4 h-4" />
              Host an Event
            </button>
          </Link>
        )}
        <p className="text-[10px] text-muted/30 uppercase tracking-widest text-center">Event Operating System</p>
      </div>
    </aside>
  );
}
