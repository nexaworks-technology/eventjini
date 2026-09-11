import { ReactNode } from "react";
import { DashboardShell } from "@/components/layout/dashboard-shell";
import { createClient } from "@/utils/supabase/server";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { signOut } from "@/app/actions/auth";
import { LogOut } from "lucide-react";

export default async function DashboardLayout({
  children,
}: {
  children: ReactNode;
}) {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // Smart Detect: Check if they are an Organizer
  const { count: eventsCount } = await supabase
    .from("events")
    .select("*", { count: "exact", head: true })
    .eq("organizer_id", user.id);
  const hasEvents = (eventsCount || 0) > 0;

  // Smart Detect: Check if they are a Sponsor
  const { count: sponsorsCount } = await supabase
    .from("sponsor_registrations")
    .select("*", { count: "exact", head: true })
    .eq("sponsor_user_id", user.id);
  const hasSponsorships = (sponsorsCount || 0) > 0;

  const avatarInitial = user.email ? user.email.charAt(0).toUpperCase() : "U";

  return (
    <DashboardShell 
      hasEvents={hasEvents} 
      hasSponsorships={hasSponsorships} 
      userEmail={user.email || ""} 
      avatarInitial={avatarInitial} 
      signOutAction={signOut}
    >
      {children}
    </DashboardShell>
  );
}
