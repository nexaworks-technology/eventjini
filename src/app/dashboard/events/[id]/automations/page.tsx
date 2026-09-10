import { createClient } from "@/utils/supabase/server";
import { cookies } from "next/headers";
import { GlassCard } from "@/components/ui/glass-card";
import { FadeInUp, StaggerContainer } from "@/components/animations/motion";
import { Zap, Plus, ArrowRight, Settings, Mail, Globe } from "lucide-react";
import Link from "next/link";

export default async function AutomationsPage({
  params,
}: {
  params: Promise<{ id: string }> | { id: string };
}) {
  const resolvedParams = await Promise.resolve(params);
  const eventId = resolvedParams.id;
  
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  const { data: automations } = await supabase
    .from('automations')
    .select('*')
    .eq('event_id', eventId)
    .order('created_at', { ascending: false });

  const formatTrigger = (trigger: string) => {
    return trigger.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
  };

  return (
    <div className="space-y-6">
      <FadeInUp className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-2xl font-bold text-white mb-2">Automations</h2>
          <p className="text-muted text-sm flex items-center gap-2">
            Build workflows to engage attendees and sync data automatically.
          </p>
        </div>
        
        <button className="bg-brand-primary text-white border border-brand-primary/20 px-4 py-2 rounded-xl text-sm font-medium hover:bg-brand-accent transition-colors flex items-center gap-2">
          <Plus className="w-4 h-4" />
          Create Workflow
        </button>
      </FadeInUp>

      {automations && automations.length > 0 ? (
        <StaggerContainer className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {automations.map((auto: any) => (
            <FadeInUp key={auto.id}>
              <GlassCard level={2} className="p-6 h-full flex flex-col group relative overflow-hidden">
                <div className="absolute top-0 right-0 p-4">
                  <div className={`w-2 h-2 rounded-full ${auto.is_active ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]' : 'bg-slate-500'}`} />
                </div>
                
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center">
                    <Zap className="w-5 h-5 text-amber-400" />
                  </div>
                  <div>
                    <p className="text-xs text-muted font-semibold tracking-wider uppercase mb-0.5">When</p>
                    <p className="text-sm font-bold text-white">{formatTrigger(auto.trigger_type)}</p>
                  </div>
                </div>

                <div className="flex items-center justify-center py-2 text-muted">
                  <ArrowRight className="w-5 h-5" />
                </div>

                <div className="flex items-center gap-3 mt-4 bg-black/20 p-4 rounded-xl border border-white/5">
                  {auto.action_type === 'send_email' ? (
                    <Mail className="w-5 h-5 text-cyan-400" />
                  ) : (
                    <Globe className="w-5 h-5 text-purple-400" />
                  )}
                  <div>
                    <p className="text-xs text-muted font-semibold tracking-wider uppercase mb-0.5">Then</p>
                    <p className="text-sm font-medium text-slate-200">
                      {auto.action_type === 'send_email' ? 'Send Automated Email' : 'Trigger Webhook'}
                    </p>
                  </div>
                </div>

                <div className="mt-6 flex justify-end">
                  <button className="text-xs font-semibold text-muted hover:text-white transition-colors flex items-center gap-1.5">
                    <Settings className="w-3.5 h-3.5" /> Configure
                  </button>
                </div>
              </GlassCard>
            </FadeInUp>
          ))}
        </StaggerContainer>
      ) : (
        <FadeInUp>
          <GlassCard level={2} className="p-12 text-center border-dashed border-white/10">
            <Zap className="w-12 h-12 text-brand-primary/50 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-white mb-2">No Automations Yet</h3>
            <p className="text-muted max-w-md mx-auto mb-6">
              Create your first workflow to automatically email attendees when they register, or trigger a webhook to your CRM when they check in.
            </p>
            <button className="bg-white/10 text-white border border-white/20 px-6 py-2.5 rounded-xl text-sm font-bold hover:bg-white/20 transition-colors inline-flex items-center gap-2">
              <Plus className="w-4 h-4" />
              Build Workflow
            </button>
          </GlassCard>
        </FadeInUp>
      )}
    </div>
  );
}
