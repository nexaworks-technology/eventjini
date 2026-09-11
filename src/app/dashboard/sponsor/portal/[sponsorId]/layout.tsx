import { createClient } from "@/utils/supabase/server";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { SponsorNavClient } from "./sponsor-nav-client";

export default async function SponsorDashboardLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ sponsorId: string }> | { sponsorId: string };
}) {
  const resolvedParams = await Promise.resolve(params);
  const sponsorId = resolvedParams.sponsorId;
  
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  // Verify ownership
  const { data: sponsorship } = await supabase
    .from('sponsor_registrations')
    .select(`
      id,
      company_name,
      tier:tier_id (
        name,
        event:event_id (
          title
        )
      )
    `)
    .eq('id', sponsorId)
    .eq('sponsor_user_id', user.id)
    .single();

  if (!sponsorship) {
    redirect('/dashboard/sponsor/portal');
  }

  return (
    <div className="flex flex-col min-h-screen">
      <SponsorNavClient 
        sponsorId={sponsorId} 
        eventTitle={(sponsorship.tier as any)?.event?.title || "Unknown Event"} 
        companyName={sponsorship.company_name || "Sponsor Profile"} 
      />
      
      {/* Main Content (With left padding for the sidebar on desktop) */}
      <main className="flex-1 w-full p-4 md:p-8 md:pl-72">
        <div className="max-w-6xl mx-auto">{children}</div>
      </main>
    </div>
  );
}
