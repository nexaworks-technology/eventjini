"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { LayoutDashboard, Calendar, Settings, Compass, Building2, Ticket, ChevronDown, Rocket } from "lucide-react";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import { useState, useRef, useEffect } from "react";

const WORKSPACES = {
  attendee: {
    name: "Personal",
    icon: Ticket,
    basePath: "/dashboard/attendee",
    links: [
      { name: "My Tickets", href: "/dashboard/attendee", icon: Ticket, exact: true },
      { name: "Explore", href: "/explore", icon: Compass },
      { name: "Settings", href: "/dashboard/attendee/profile", icon: Settings },
    ]
  },
  organizer: {
    name: "Organizer",
    icon: Rocket,
    basePath: "/dashboard/organizer",
    links: [
      { name: "Command Center", href: "/dashboard/organizer", icon: LayoutDashboard, exact: true },
      { name: "My Events", href: "/dashboard/organizer/events", icon: Calendar },
    ]
  },
  sponsor: {
    name: "Sponsor",
    icon: Building2,
    basePath: "/dashboard/sponsor",
    links: [
      { name: "Portal", href: "/dashboard/sponsor/portal", icon: LayoutDashboard, exact: true },
    ]
  }
};

type WorkspaceKey = keyof typeof WORKSPACES;

export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Determine active workspace from URL
  let activeWorkspace: WorkspaceKey = "attendee";
  if (pathname.startsWith("/dashboard/organizer")) activeWorkspace = "organizer";
  if (pathname.startsWith("/dashboard/sponsor")) activeWorkspace = "sponsor";

  const currentWorkspace = WORKSPACES[activeWorkspace];

  // Close dropdown on click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const switchWorkspace = (key: WorkspaceKey) => {
    setIsDropdownOpen(false);
    router.push(WORKSPACES[key].basePath);
  };

  return (
    <aside className="fixed inset-y-0 left-0 w-64 bg-surface border-r border-white/[0.04] z-40 hidden md:flex flex-col">
      {/* Workspace Switcher */}
      <div className="px-4 py-4 border-b border-white/[0.04] relative" ref={dropdownRef}>
        <button 
          onClick={() => setIsDropdownOpen(!isDropdownOpen)}
          className="w-full flex items-center justify-between p-2 rounded-xl hover:bg-white/[0.04] transition-colors border border-transparent hover:border-white/[0.05]"
        >
          <div className="flex items-center gap-3">
            <div className="relative w-8 h-8 rounded-lg overflow-hidden ring-1 ring-white/10 flex items-center justify-center bg-brand-primary/10">
              <currentWorkspace.icon className="w-4 h-4 text-brand-primary" />
            </div>
            <div className="flex flex-col items-start">
              <span className="text-sm font-bold text-white tracking-tight leading-tight">EventJini</span>
              <span className="text-[10px] font-medium text-muted uppercase tracking-widest leading-tight">{currentWorkspace.name}</span>
            </div>
          </div>
          <ChevronDown className={cn("w-4 h-4 text-muted transition-transform", isDropdownOpen && "rotate-180")} />
        </button>

        <AnimatePresence>
          {isDropdownOpen && (
            <motion.div 
              initial={{ opacity: 0, y: -10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.95 }}
              transition={{ duration: 0.15 }}
              className="absolute top-full left-4 right-4 mt-2 bg-canvas/90 backdrop-blur-xl border border-white/10 rounded-xl shadow-2xl overflow-hidden z-50 p-1"
            >
              {(Object.keys(WORKSPACES) as WorkspaceKey[]).map((key) => {
                const ws = WORKSPACES[key];
                const Icon = ws.icon;
                const isSelected = key === activeWorkspace;
                return (
                  <button
                    key={key}
                    onClick={() => switchWorkspace(key)}
                    className={cn(
                      "w-full flex items-center gap-3 p-2 rounded-lg text-left text-sm font-medium transition-colors",
                      isSelected ? "bg-brand-primary/10 text-white" : "text-slate-400 hover:bg-white/5 hover:text-white"
                    )}
                  >
                    <Icon className={cn("w-4 h-4", isSelected ? "text-brand-primary" : "text-slate-400")} />
                    {ws.name}
                  </button>
                );
              })}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-1">
        <div className="px-4 py-2 text-[10px] font-bold text-muted uppercase tracking-wider">
          {currentWorkspace.name} Menu
        </div>
        {currentWorkspace.links.map((link) => {
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
