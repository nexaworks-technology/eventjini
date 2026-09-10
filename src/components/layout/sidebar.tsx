"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Calendar, BarChart3, Users, Settings, Compass, Building2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import Image from "next/image";

const links = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard, exact: true },
  { name: "Events", href: "/dashboard/events", icon: Calendar },
  { name: "Sponsorships", href: "/dashboard/sponsor-portal", icon: Building2 },
  { name: "Explore", href: "/explore", icon: Compass },
  { name: "Settings", href: "/dashboard/profile", icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();

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
              {isActive && (
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

      {/* Footer */}
      <div className="px-4 py-4 border-t border-white/[0.04]">
        <p className="text-[10px] text-muted/30 uppercase tracking-widest text-center">Event Operating System</p>
      </div>
    </aside>
  );
}
