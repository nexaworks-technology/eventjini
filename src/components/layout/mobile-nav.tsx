"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Compass, Settings, Building2, Ticket, Rocket } from "lucide-react";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

export function MobileNav({ hasEvents = false, hasSponsorships = false }: { hasEvents?: boolean, hasSponsorships?: boolean }) {
  const pathname = usePathname();

  // Unified Smart Navigation Links
  const links = [
    { name: "Tickets", href: "/dashboard/attendee", icon: Ticket, exact: true },
    { name: "Explore", href: "/explore", icon: Compass },
  ];

  if (hasEvents) {
    links.push({ name: "Events", href: "/dashboard/organizer/events", icon: Rocket });
  }
  
  if (hasSponsorships) {
    links.push({ name: "Sponsors", href: "/dashboard/sponsor/portal", icon: Building2 });
  }
  
  links.push({ name: "Profile", href: "/dashboard/attendee/profile", icon: Settings });

  return (
    <div className="md:hidden fixed bottom-0 inset-x-0 z-50 bg-surface/90 backdrop-blur-xl border-t border-white/[0.04] pb-safe">
      <nav className="flex items-center justify-around px-2 h-16">
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
                "relative flex flex-col items-center justify-center w-full h-full gap-1 transition-colors",
                isActive ? "text-brand-primary" : "text-muted hover:text-white"
              )}
            >
              {isActive && (
                <motion.div
                  layoutId="mobile-indicator"
                  className="absolute top-0 inset-x-4 h-0.5 bg-brand-primary rounded-b-full"
                  transition={{ type: "spring", stiffness: 300, damping: 30 }}
                />
              )}
              <Icon className="w-5 h-5" />
              <span className="text-[10px] font-medium tracking-wide">{link.name}</span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
