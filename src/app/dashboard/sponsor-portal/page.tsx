import { createClient } from "@/utils/supabase/server";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import Link from "next/link";
import { FadeInUp, StaggerContainer } from "@/components/animations/motion";
import { GlassCard } from "@/components/ui/glass-card";
import { Building2, ArrowRight, ExternalLink } from "lucide-react";
import Image from "next/image";

export default async function SponsorPortalList() {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);
  
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  // Fetch all sponsorships for this user
  const { data: sponsorships } = await supabase
    .from('sponsor_registrations')
    .select(`
      id,
      company_name,
      company_logo_url,
      status,
      tier:tier_id (
        name,
        event:event_id (
          id,
          title,
          start_time,
          banner_url
        )
      )
    `)
    .eq('sponsor_user_id', user.id);

  if (!sponsorships || sponsorships.length === 0) {
    return (
      <div className="flex-1 p-8 overflow-y-auto w-full flex items-center justify-center">
        <GlassCard level={2} className="p-12 max-w-lg text-center">
          <Building2 className="w-16 h-16 text-muted/50 mx-auto mb-6" />
          <h2 className="text-2xl font-bold text-white mb-3">No Sponsorships Found</h2>
          <p className="text-muted mb-8">
            You are not currently registered as a sponsor for any events. Browse our upcoming events to become a sponsor.
          </p>
          <Link href="/explore">
            <button className="bg-brand-primary text-white font-bold py-3 px-6 rounded-xl hover:bg-brand-accent transition-colors">
              Explore Events
            </button>
          </Link>
        </GlassCard>
      </div>
    );
  }

  return (
    <div className="flex-1 p-8 overflow-y-auto w-full">
      <FadeInUp>
        <h1 className="text-3xl font-bold mb-2 text-white tracking-tight">Sponsor Portal</h1>
        <p className="text-muted mb-8 text-sm">Manage your brand presence and scan leads across all your sponsored events.</p>
      </FadeInUp>

      <StaggerContainer className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {sponsorships.map((sponsorship: any) => (
          <FadeInUp key={sponsorship.id} className="h-full">
            <Link href={`/dashboard/sponsor-portal/${sponsorship.id}`}>
              <GlassCard level={2} className="h-full flex flex-col overflow-hidden hover:border-brand-primary/40 group transition-all duration-300">
                <div className="h-32 w-full relative bg-surface border-b border-white/5">
                  {(sponsorship.tier as any)?.event?.banner_url ? (
                    <Image 
                      src={(sponsorship.tier as any).event.banner_url} 
                      alt={(sponsorship.tier as any).event.title} 
                      fill 
                      className="object-cover opacity-60 group-hover:opacity-80 transition-opacity"
                    />
                  ) : (
                    <div className="absolute inset-0 bg-gradient-to-br from-brand-primary/20 to-purple-500/20" />
                  )}
                  <div className="absolute top-4 left-4 right-4 flex justify-between items-start">
                    <span className="bg-black/60 backdrop-blur-md px-3 py-1 rounded-full text-xs font-medium text-white border border-white/10">
                      {(sponsorship.tier as any)?.name} Sponsor
                    </span>
                    <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase tracking-widest ${
                      sponsorship.status === 'approved' ? 'bg-cyan-500/80 text-white' : 'bg-amber-500/80 text-white'
                    }`}>
                      {sponsorship.status}
                    </span>
                  </div>
                </div>

                <div className="p-5 flex-1 flex flex-col">
                  <h3 className="text-xl font-bold text-white mb-1 line-clamp-1 group-hover:text-brand-primary transition-colors">
                    {(sponsorship.tier as any)?.event?.title}
                  </h3>
                  <p className="text-sm text-muted mb-6 flex-1">
                    {new Date((sponsorship.tier as any)?.event?.start_time).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                  </p>
                  
                  <div className="flex items-center justify-between mt-auto">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center overflow-hidden border border-white/20">
                        {sponsorship.company_logo_url ? (
                          <Image src={sponsorship.company_logo_url} alt="Logo" width={32} height={32} className="object-cover w-full h-full" />
                        ) : (
                          <Building2 className="w-4 h-4 text-muted" />
                        )}
                      </div>
                      <span className="text-sm font-medium text-slate-300">{sponsorship.company_name || 'Set up profile'}</span>
                    </div>
                    <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center group-hover:bg-brand-primary transition-colors">
                      <ArrowRight className="w-4 h-4 text-white group-hover:translate-x-0.5 transition-transform" />
                    </div>
                  </div>
                </div>
              </GlassCard>
            </Link>
          </FadeInUp>
        ))}
      </StaggerContainer>
    </div>
  );
}
