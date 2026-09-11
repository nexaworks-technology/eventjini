"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { QrCode, Users, Settings, ArrowLeft } from "lucide-react";
import { cn } from "@/lib/utils";

export function SponsorNavClient({ sponsorId, eventTitle, companyName }: { sponsorId: string, eventTitle: string, companyName: string }) {
  const pathname = usePathname();
  
  const tabs = [
    { name: 'Overview', href: `/dashboard/sponsor/portal/${sponsorId}`, icon: Settings },
    { name: 'Lead Scanner', href: `/dashboard/sponsor/portal/${sponsorId}/scanner`, icon: QrCode },
    { name: 'Lead CRM', href: `/dashboard/sponsor/portal/${sponsorId}/leads`, icon: Users },
  ];

  return (
    <aside className="fixed inset-y-0 left-0 w-64 bg-surface border-r border-white/[0.04] z-40 hidden md:flex flex-col">
      <div className="flex flex-col px-4 py-4 border-b border-white/[0.04] gap-4">
        <Link 
          href="/dashboard/sponsor/portal" 
          className="flex items-center gap-2 text-xs font-medium text-muted hover:text-white transition-colors w-fit"
        >
          <ArrowLeft className="w-3 h-3" />
          Back to Portals
        </Link>
        <div className="flex flex-col">
          <span className="text-lg font-bold text-white tracking-tight line-clamp-1">{companyName}</span>
          <span className="text-[10px] font-medium text-brand-primary uppercase tracking-widest leading-tight">{eventTitle} Sponsor</span>
        </div>
      </div>

      <nav className="flex-1 px-3 py-4 space-y-1">
        {tabs.map((tab) => {
          const isActive = pathname === tab.href;
          const Icon = tab.icon;
          
          return (
            <Link
              key={tab.name}
              href={tab.href}
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
              {tab.name}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
