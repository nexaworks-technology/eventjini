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
    redirect('/dashboard/sponsor-portal');
  }

  return (
    <div className="flex flex-col w-full h-full relative">
      <div className="border-b border-white/5 bg-surface/50 backdrop-blur-xl sticky top-0 z-20">
        <div className="px-6 py-4 flex items-center justify-between">
          <div>
            <Link href="/dashboard/sponsor-portal" className="text-muted hover:text-white flex items-center gap-2 text-sm font-medium mb-1 transition-colors">
              <ArrowLeft className="w-4 h-4" /> Back to Portals
            </Link>
            <h1 className="text-xl font-bold text-white flex items-center gap-3">
              {sponsorship.company_name || "Sponsor Profile"} 
              <span className="text-sm font-normal text-muted bg-white/5 px-2 py-0.5 rounded border border-white/10">
                {(sponsorship.tier as any)?.event?.title}
              </span>
            </h1>
          </div>
        </div>
        <SponsorNavClient sponsorId={sponsorId} />
      </div>
      <div className="flex-1 flex overflow-hidden relative">
        {children}
      </div>
    </div>
  );
}
