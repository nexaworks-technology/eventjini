import { createClient } from "@/utils/supabase/server";
import { cookies } from "next/headers";
import { GlassCard } from "@/components/ui/glass-card";
import { FadeInUp } from "@/components/animations/motion";
import { Users, Download, Mail, Building2, MapPin } from "lucide-react";

export default async function SponsorLeadsPage({
  params,
}: {
  params: Promise<{ sponsorId: string }> | { sponsorId: string };
}) {
  const resolvedParams = await Promise.resolve(params);
  const sponsorId = resolvedParams.sponsorId;
  
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  const { data: leads } = await supabase
    .from('sponsor_leads')
    .select(`
      id,
      scanned_at,
      notes,
      registration:registration_id (
        ticket_code,
        guest_name,
        guest_email,
        guest_company,
        guest_job_title,
        guest_college,
        guest_is_student,
        user:user_id (
          full_name,
          email
        )
      )
    `)
    .eq('sponsor_id', sponsorId)
    .order('scanned_at', { ascending: false });

  const mappedLeads = (leads || []).map((l: any) => ({
    id: l.id,
    scannedAt: new Date(l.scanned_at).toLocaleString(),
    notes: l.notes || "-",
    name: l.registration?.user?.full_name || l.registration?.guest_name || "Unknown",
    email: l.registration?.user?.email || l.registration?.guest_email || "No email",
    company: l.registration?.guest_is_student ? l.registration?.guest_college : l.registration?.guest_company || "-",
    jobTitle: l.registration?.guest_is_student ? "Student" : l.registration?.guest_job_title || "-",
  }));

  return (
    <div className="flex-1 p-8 overflow-y-auto w-full">
      <FadeInUp>
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl font-bold text-white mb-2">Lead CRM</h2>
            <p className="text-muted text-sm flex items-center gap-2">
              <Users className="w-4 h-4 text-brand-primary" />
              {mappedLeads.length} Leads Captured
            </p>
          </div>
          
          <button className="bg-brand-primary/10 text-brand-primary border border-brand-primary/20 px-4 py-2 rounded-xl text-sm font-medium hover:bg-brand-primary/20 transition-colors flex items-center gap-2">
            <Download className="w-4 h-4" />
            Export CSV
          </button>
        </div>

        <div className="rounded-2xl overflow-hidden bg-white/[0.02] backdrop-blur-3xl border border-white/[0.05]">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[800px]">
              <thead>
                <tr className="border-b border-white/5 bg-white/5">
                  <th className="p-4 text-xs font-semibold text-muted uppercase tracking-wider">Lead Details</th>
                  <th className="p-4 text-xs font-semibold text-muted uppercase tracking-wider">Company / Role</th>
                  <th className="p-4 text-xs font-semibold text-muted uppercase tracking-wider">Scanned At</th>
                  <th className="p-4 text-xs font-semibold text-muted uppercase tracking-wider">Sponsor Notes</th>
                </tr>
              </thead>
              <tbody>
                {mappedLeads.map((lead: any) => (
                  <tr key={lead.id} className="border-b border-white/5 last:border-0 hover:bg-white/[0.02] transition-colors group">
                    <td className="p-4">
                      <div>
                        <p className="text-sm font-bold text-white mb-0.5">{lead.name}</p>
                        <p className="text-xs text-muted flex items-center gap-1.5">
                          <Mail className="w-3 h-3" /> {lead.email}
                        </p>
                      </div>
                    </td>
                    <td className="p-4">
                      <div>
                        <p className="text-sm text-white flex items-center gap-1.5">
                          <Building2 className="w-3.5 h-3.5 text-muted" /> {lead.company}
                        </p>
                        <p className="text-xs text-brand-secondary mt-0.5 ml-5">{lead.jobTitle}</p>
                      </div>
                    </td>
                    <td className="p-4">
                      <span className="text-xs font-medium text-slate-400 bg-white/5 px-2.5 py-1 rounded-md border border-white/10">
                        {lead.scannedAt}
                      </span>
                    </td>
                    <td className="p-4">
                      <p className="text-sm text-slate-300 italic max-w-xs truncate" title={lead.notes}>
                        {lead.notes}
                      </p>
                    </td>
                  </tr>
                ))}
                {mappedLeads.length === 0 && (
                  <tr>
                    <td colSpan={4} className="p-12 text-center text-slate-500">
                      <Users className="w-12 h-12 text-muted/30 mx-auto mb-4" />
                      <p className="text-sm font-medium">No leads captured yet.</p>
                      <p className="text-xs mt-1">Use the Lead Scanner to capture attendees.</p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </FadeInUp>
    </div>
  );
}
