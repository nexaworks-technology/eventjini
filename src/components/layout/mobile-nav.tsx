"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Calendar, Compass, Settings, Building2, Ticket, Rocket } from "lucide-react";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

const WORKSPACES = {
  attendee: [
    { name: "Tickets", href: "/dashboard/attendee", icon: Ticket, exact: true },
    { name: "Explore", href: "/explore", icon: Compass },
    { name: "Settings", href: "/dashboard/attendee/profile", icon: Settings },
  ],
  organizer: [
    { name: "Command", href: "/dashboard/organizer", icon: LayoutDashboard, exact: true },
    { name: "Events", href: "/dashboard/organizer/events", icon: Calendar },
    { name: "Switch", href: "/dashboard/attendee", icon: Ticket }, // Allow switching back
  ],
  sponsor: [
    { name: "Portal", href: "/dashboard/sponsor/portal", icon: LayoutDashboard, exact: true },
    { name: "Switch", href: "/dashboard/attendee", icon: Ticket }, // Allow switching back
  ]
};

type WorkspaceKey = keyof typeof WORKSPACES;

export function MobileNav() {
  const pathname = usePathname();

  // Determine active workspace from URL
  let activeWorkspace: WorkspaceKey = "attendee";
  if (pathname.startsWith("/dashboard/organizer")) activeWorkspace = "organizer";
  if (pathname.startsWith("/dashboard/sponsor")) activeWorkspace = "sponsor";

  const links = WORKSPACES[activeWorkspace];

  return (
    <div className="md:hidden fixed bottom-0 inset-x-0 z-50 bg-surface/90 backdrop-blur-xl border-t border-white/[0.04] pb-safe">
      <nav className="flex items-center justify-around px-2 h-16">
        {links.map((link) => {
          const isActive = link.exact 
            ? pathname === link.href 
            : pathname.startsWith(link.href) && link.name !== "Switch";
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
