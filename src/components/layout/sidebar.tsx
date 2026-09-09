"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Calendar, Users, BarChart, User } from "lucide-react";
import { cn } from "@/lib/utils";

const links = [
  { name: "Events", href: "/dashboard/events", icon: Calendar },
  { name: "Profile", href: "/dashboard/profile", icon: User },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="fixed inset-y-0 left-0 w-64 border-r border-white/10 bg-[#050505]/50 backdrop-blur-3xl z-40 hidden md:block">
      <div className="flex h-full flex-col">
        <div className="flex h-16 items-center px-6 border-b border-white/10">
          <Link href="/dashboard" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-[#06b6d4] to-[#a855f7] flex items-center justify-center">
              <span className="text-white font-bold text-lg">E</span>
            </div>
            <span className="text-xl font-bold text-white tracking-tight">EventJini</span>
          </Link>
        </div>

        <nav className="flex-1 space-y-2 p-4">
          {links.map((link) => {
            const isActive = pathname.startsWith(link.href);
            const Icon = link.icon;

            return (
              <Link
                key={link.name}
                href={link.href}
                className={cn(
                  "flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-all duration-300",
                  isActive
                    ? "bg-white/10 text-white shadow-[0_0_24px_-4px_rgba(6,182,212,0.35)]"
                    : "text-white/60 hover:bg-white/5 hover:text-white"
                )}
              >
                <Icon
                  className={cn(
                    "h-5 w-5 transition-colors",
                    isActive ? "text-[#06b6d4]" : "text-white/40"
                  )}
                />
                {link.name}
              </Link>
            );
          })}
        </nav>
      </div>
    </aside>
  );
}
