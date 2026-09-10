"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { QrCode, Users, Settings } from "lucide-react";
import { motion } from "framer-motion";

export function SponsorNavClient({ sponsorId }: { sponsorId: string }) {
  const pathname = usePathname();
  
  const tabs = [
    { name: 'Overview', href: `/dashboard/sponsor/portal/${sponsorId}`, icon: Settings },
    { name: 'Lead Scanner', href: `/dashboard/sponsor/portal/${sponsorId}/scanner`, icon: QrCode },
    { name: 'Lead CRM', href: `/dashboard/sponsor/portal/${sponsorId}/leads`, icon: Users },
  ];

  return (
    <nav className="flex px-6 space-x-1 overflow-x-auto hide-scrollbar">
      {tabs.map((tab) => {
        const isActive = pathname === tab.href;
        const Icon = tab.icon;
        
        return (
          <Link
            key={tab.name}
            href={tab.href}
            className={`
              relative px-4 py-3 text-sm font-medium whitespace-nowrap flex items-center gap-2
              ${isActive ? 'text-white' : 'text-muted hover:text-slate-200'}
              transition-colors
            `}
          >
            <Icon className="w-4 h-4" />
            {tab.name}
            {isActive && (
              <motion.div
                layoutId="sponsor-nav-indicator"
                className="absolute bottom-0 left-0 right-0 h-0.5 bg-brand-primary"
                initial={false}
                transition={{ type: "spring", stiffness: 500, damping: 30 }}
              />
            )}
          </Link>
        );
      })}
    </nav>
  );
}
