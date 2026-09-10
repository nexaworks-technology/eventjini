import { createClient } from "@/utils/supabase/server";
import { cookies } from "next/headers";
import { GlassCard } from "@/components/ui/glass-card";
import { FadeInUp } from "@/components/animations/motion";
import { revalidatePath } from "next/cache";

export default async function SponsorOverviewPage({
  params,
}: {
  params: Promise<{ sponsorId: string }> | { sponsorId: string };
}) {
  const resolvedParams = await Promise.resolve(params);
  const sponsorId = resolvedParams.sponsorId;
  
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  const { data: sponsorship } = await supabase
    .from('sponsor_registrations')
    .select('*')
    .eq('id', sponsorId)
    .single();

  async function updateProfile(formData: FormData) {
    "use server";
    const name = formData.get("company_name") as string;
    const logo = formData.get("company_logo_url") as string;
    
    const cookieStore = await cookies();
    const supabase = createClient(cookieStore);
    await supabase
      .from('sponsor_registrations')
      .update({ company_name: name, company_logo_url: logo })
      .eq('id', sponsorId);
      
    revalidatePath(`/dashboard/sponsor-portal/${sponsorId}`);
  }

  return (
    <div className="flex-1 p-8 overflow-y-auto">
      <FadeInUp>
        <div className="max-w-2xl">
          <h2 className="text-2xl font-bold text-white mb-6">Company Profile</h2>
          
          <GlassCard level={2} className="p-6 border-white/5">
            <form action={updateProfile} className="space-y-5">
              <div className="space-y-2">
                <label className="text-sm font-semibold text-muted uppercase tracking-wider">Company Name</label>
                <input 
                  type="text" 
                  name="company_name"
                  defaultValue={sponsorship?.company_name || ""}
                  placeholder="e.g. Acme Corp"
                  className="w-full bg-surface border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-brand-primary/50 transition-colors"
                />
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-semibold text-muted uppercase tracking-wider">Company Logo URL</label>
                <input 
                  type="url" 
                  name="company_logo_url"
                  defaultValue={sponsorship?.company_logo_url || ""}
                  placeholder="https://example.com/logo.png"
                  className="w-full bg-surface border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-brand-primary/50 transition-colors"
                />
                <p className="text-xs text-muted/80">In a production environment, this would be an image upload dropzone.</p>
              </div>

              <div className="pt-4">
                <button type="submit" className="bg-brand-primary hover:bg-brand-accent text-white font-bold py-3 px-6 rounded-xl transition-colors">
                  Save Changes
                </button>
              </div>
            </form>
          </GlassCard>
        </div>
      </FadeInUp>
    </div>
  );
}
