"use client";

import { usePathname } from "next/navigation";
import { Sidebar } from "./sidebar";
import { MobileNav } from "./mobile-nav";
import { LogOut } from "lucide-react";
import { ReactNode } from "react";

export function DashboardShell({ 
  children, 
  hasEvents, 
  hasSponsorships, 
  userEmail, 
  avatarInitial, 
  signOutAction 
}: { 
  children: ReactNode, 
  hasEvents: boolean, 
  hasSponsorships: boolean,
  userEmail: string,
  avatarInitial: string,
  signOutAction: any
}) {
  const pathname = usePathname();
  
  // Smart Detect Deep Dives (Hide main shell if deep diving)
  const isEventManagement = pathname.match(/\/dashboard\/organizer\/events\/[a-zA-Z0-9-]{10,}/);
  const isSponsorManagement = pathname.match(/\/dashboard\/sponsor\/portal\/[a-zA-Z0-9-]{10,}/);

  const isDeepDive = isEventManagement || isSponsorManagement;

  if (isDeepDive) {
    return <>{children}</>;
  }

  return (
    <div className="min-h-screen bg-canvas text-white selection:bg-brand-primary/30 pb-16 md:pb-0">
      <Sidebar hasEvents={hasEvents} hasSponsorships={hasSponsorships} />
      <MobileNav hasEvents={hasEvents} hasSponsorships={hasSponsorships} />

      <div className="md:pl-64 flex flex-col min-h-screen">
        <header className="h-14 border-b border-white/[0.04] bg-canvas/80 backdrop-blur-xl sticky top-0 z-30 px-6 md:px-8 flex items-center justify-between md:justify-end gap-4">
          <div className="md:hidden font-bold text-lg text-white">EventJini</div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-3">
              <div className="w-7 h-7 rounded-full bg-gradient-to-br from-brand-primary to-brand-secondary flex items-center justify-center text-xs font-bold text-white">
                {avatarInitial}
              </div>
              <span className="text-sm text-muted hidden sm:block">
                {userEmail}
              </span>
            </div>
            <form action={signOutAction}>
              <button type="submit" className="p-2 rounded-lg text-muted hover:text-white hover:bg-white/[0.04] transition-colors" title="Logout">
                <LogOut className="h-4 w-4" />
              </button>
            </form>
          </div>
        </header>

        <main className="flex-1 p-4 md:p-8">
          <div className="max-w-6xl mx-auto">{children}</div>
        </main>
      </div>
    </div>
  );
}
