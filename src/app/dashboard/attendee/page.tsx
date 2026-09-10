import { createClient } from "@/utils/supabase/server";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { FadeInUp, StaggerContainer } from "@/components/animations/motion";
import { GlassCard } from "@/components/ui/glass-card";
import { Ticket, Calendar, MapPin } from "lucide-react";
import Link from "next/link";
import Image from "next/image";

export default async function AttendeeDashboard() {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);
  
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: registrations } = await supabase
    .from("registrations")
    .select(`
      id,
      ticket_code,
      status,
      event:event_id (
        title,
        start_date,
        location_name,
        banner_url
      )
    `)
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  return (
    <div className="flex-1 p-8 overflow-y-auto">
      <FadeInUp>
        <h1 className="text-3xl font-bold mb-2 text-white tracking-tight">My Tickets</h1>
        <p className="text-muted mb-8 text-sm">View and manage your upcoming events.</p>
      </FadeInUp>

      {(!registrations || registrations.length === 0) ? (
        <FadeInUp>
          <GlassCard level={2} className="p-12 text-center max-w-lg mx-auto">
            <Ticket className="w-16 h-16 text-muted/30 mx-auto mb-6" />
            <h2 className="text-2xl font-bold text-white mb-3">No Tickets Found</h2>
            <p className="text-muted mb-8">You haven't registered for any upcoming events yet.</p>
            <Link href="/explore" className="bg-brand-primary text-white font-bold py-3 px-6 rounded-xl hover:bg-brand-accent transition-colors">
              Explore Events
            </Link>
          </GlassCard>
        </FadeInUp>
      ) : (
        <StaggerContainer className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {registrations.map((reg: any) => (
            <FadeInUp key={reg.id} className="h-full">
              <GlassCard level={2} className="h-full flex flex-col overflow-hidden hover:border-brand-primary/40 transition-all duration-300">
                <div className="h-32 w-full relative bg-surface border-b border-white/5">
                  {(reg.event as any)?.banner_url ? (
                    <Image src={(reg.event as any).banner_url} alt="Event" fill className="object-cover opacity-80" />
                  ) : (
                    <div className="absolute inset-0 bg-gradient-to-br from-brand-primary/20 to-purple-500/20" />
                  )}
                  <div className="absolute top-4 right-4">
                    <span className="bg-black/60 backdrop-blur-md px-3 py-1 rounded-full text-xs font-bold text-white border border-white/10 uppercase tracking-widest">
                      {reg.status}
                    </span>
                  </div>
                </div>
                <div className="p-6 flex-1 flex flex-col">
                  <h3 className="text-xl font-bold text-white mb-2 line-clamp-1">{(reg.event as any)?.title}</h3>
                  <div className="space-y-2 mb-6 text-sm text-slate-300">
                    <p className="flex items-center gap-2"><Calendar className="w-4 h-4 text-brand-primary" /> {new Date((reg.event as any)?.start_date).toLocaleDateString()}</p>
                    <p className="flex items-center gap-2"><MapPin className="w-4 h-4 text-brand-primary" /> {(reg.event as any)?.location_name || "TBA"}</p>
                  </div>
                  <div className="mt-auto pt-4 border-t border-white/10 flex justify-between items-center">
                    <span className="text-xs text-muted uppercase tracking-widest">Ticket Code</span>
                    <span className="font-mono font-bold text-brand-primary">{reg.ticket_code}</span>
                  </div>
                </div>
              </GlassCard>
            </FadeInUp>
          ))}
        </StaggerContainer>
      )}
    </div>
  );
}
