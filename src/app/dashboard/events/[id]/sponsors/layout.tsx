"use client";

import Link from "next/link";
import { usePathname, useParams } from "next/navigation";
import { ReactNode } from "react";
import { motion } from "framer-motion";
import { Layers, BarChart3 } from "lucide-react";

export default function SponsorsLayout({
  children,
}: {
  children: ReactNode;
}) {
  const pathname = usePathname();
  const params = useParams();
  const eventId = params.id as string;

  const tabs = [
    { name: "Tiers Builder", href: `/dashboard/events/${eventId}/sponsors/tiers`, icon: Layers },
    { name: "Sponsor Analytics", href: `/dashboard/events/${eventId}/sponsors/analytics`, icon: BarChart3 },
  ];

  return (
    <div className="flex flex-col space-y-6">
      <div className="flex items-center space-x-4 border-b border-white/10 pb-4">
        {tabs.map((tab) => {
          const isActive = pathname.startsWith(tab.href);
          const Icon = tab.icon;
          return (
            <Link
              key={tab.name}
              href={tab.href}
              className={`relative flex items-center space-x-2 px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                isActive ? "text-white" : "text-white/60 hover:text-white hover:bg-white/5"
              }`}
            >
              <Icon className={`w-4 h-4 ${isActive ? "text-[#06b6d4]" : "text-white/60"}`} />
              <span>{tab.name}</span>
              {isActive && (
                <motion.div
                  layoutId="sponsors-tab"
                  className="absolute -bottom-[17px] left-0 right-0 h-[2px] bg-gradient-to-r from-[#06b6d4] to-[#a855f7]"
                />
              )}
            </Link>
          );
        })}
      </div>

      <div className="pt-2 w-full">
        {children}
      </div>
    </div>
  );
}
