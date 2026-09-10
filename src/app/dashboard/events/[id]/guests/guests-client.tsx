"use client";

import { useState, useTransition } from "react";
import { updateGuestStatus, updateRegistrationSettings } from "@/app/actions/os";
import { Check, X, Settings2, Download } from "lucide-react";
import { FadeInUp } from "@/components/animations/motion";
import { GlassCard } from "@/components/ui/glass-card";

interface Guest {
  id: string;
  name: string;
  email: string;
  ticketCode: string;
  status: string;
  company: string;
  jobTitle: string;
  college: string;
  isStudent: boolean;
  isGuest: boolean;
}

interface GuestsClientProps {
  eventId: string;
  initialGuests: Guest[];
  requireB2bData: boolean;
  requireApproval: boolean;
}

export default function GuestsClient({ 
  eventId, 
  initialGuests, 
  requireB2bData: initialB2b, 
  requireApproval: initialApproval 
}: GuestsClientProps) {
  const [guests, setGuests] = useState<Guest[]>(initialGuests);
  const [requireB2bData, setRequireB2bData] = useState(initialB2b);
  const [requiresApproval, setRequiresApproval] = useState(initialApproval);
  const [isPending, startTransition] = useTransition();

  const handleStatusChange = async (id: string, newStatus: "Approved" | "Rejected" | "Pending") => {
    setGuests((prev) => prev.map((g) => (g.id === id ? { ...g, status: newStatus } : g)));
    await updateGuestStatus(id, newStatus.toLowerCase());
  };

  const handleSettingsSave = () => {
    startTransition(async () => {
      await updateRegistrationSettings(eventId, requireB2bData, requiresApproval);
      alert("Settings saved successfully!");
    });
  };

  const exportCSV = () => {
    const headers = ["Name,Email,TicketCode,Status,Company,JobTitle,College,Type"];
    const csvContent = guests.map(g => 
      `${g.name},${g.email},${g.ticketCode},${g.status},${g.company},${g.jobTitle},${g.college},${g.isGuest ? 'Guest' : 'User'}`
    );
    const blob = new Blob([headers.concat(csvContent).join("\n")], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "guests_export.csv";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* Registration Settings */}
      <FadeInUp>
        <GlassCard level={2} className="p-6 border-brand-primary/20 bg-brand-primary/5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <Settings2 className="w-5 h-5 text-brand-primary" />
              Registration Settings
            </h2>
            <button 
              onClick={handleSettingsSave}
              disabled={isPending}
              className="bg-brand-primary text-white px-4 py-2 rounded-xl text-sm font-bold hover:bg-brand-accent transition-colors disabled:opacity-50"
            >
              {isPending ? "Saving..." : "Save Settings"}
            </button>
          </div>
          
          <div className="flex flex-col md:flex-row gap-8">
            <label className="flex items-center gap-3 cursor-pointer group">
              <div className="relative">
                <input 
                  type="checkbox" 
                  className="peer sr-only" 
                  checked={requireB2bData}
                  onChange={(e) => setRequireB2bData(e.target.checked)}
                />
                <div className="block w-10 h-6 bg-white/10 rounded-full peer-checked:bg-brand-primary transition-colors"></div>
                <div className="absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition-transform peer-checked:translate-x-4"></div>
              </div>
              <div>
                <p className="text-sm font-medium text-white group-hover:text-brand-accent transition-colors">Require B2B Data</p>
                <p className="text-xs text-muted">Collect company, job title, or student info.</p>
              </div>
            </label>

            <label className="flex items-center gap-3 cursor-pointer group">
              <div className="relative">
                <input 
                  type="checkbox" 
                  className="peer sr-only" 
                  checked={requiresApproval}
                  onChange={(e) => setRequiresApproval(e.target.checked)}
                />
                <div className="block w-10 h-6 bg-white/10 rounded-full peer-checked:bg-brand-primary transition-colors"></div>
                <div className="absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition-transform peer-checked:translate-x-4"></div>
              </div>
              <div>
                <p className="text-sm font-medium text-white group-hover:text-brand-accent transition-colors">Require Approval</p>
                <p className="text-xs text-muted">Review attendees before issuing tickets.</p>
              </div>
            </label>
          </div>
        </GlassCard>
      </FadeInUp>

      {/* Guest Table */}
      <FadeInUp delay={0.1}>
        <div className="flex justify-between items-end mb-4">
          <h2 className="text-lg font-bold text-white">Attendee List</h2>
          <button 
            onClick={exportCSV}
            className="bg-white/5 text-muted border border-white/10 px-4 py-2 rounded-xl text-sm font-medium hover:bg-white/10 hover:text-white transition-colors flex items-center gap-2"
          >
            <Download className="w-4 h-4" />
            Export CSV
          </button>
        </div>
        
        <div className="rounded-2xl overflow-hidden bg-white/[0.02] backdrop-blur-3xl border border-white/[0.05]">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[800px]">
              <thead>
                <tr className="border-b border-white/5 bg-white/5">
                  <th className="p-4 text-xs font-semibold text-muted uppercase tracking-wider">Attendee</th>
                  <th className="p-4 text-xs font-semibold text-muted uppercase tracking-wider">Company / College</th>
                  <th className="p-4 text-xs font-semibold text-muted uppercase tracking-wider">Status</th>
                  <th className="p-4 text-xs font-semibold text-muted uppercase tracking-wider text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {guests.map((guest) => (
                  <tr key={guest.id} className="border-b border-white/5 last:border-0 hover:bg-white/[0.02] transition-colors">
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div>
                          <p className="text-sm font-medium text-white flex items-center gap-2">
                            {guest.name}
                            {guest.isGuest && <span className="bg-white/10 text-[9px] px-1.5 py-0.5 rounded text-muted uppercase tracking-widest">Guest</span>}
                          </p>
                          <p className="text-xs text-muted">{guest.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="p-4">
                      {guest.isStudent ? (
                        <div>
                          <p className="text-sm text-white">{guest.college}</p>
                          <p className="text-xs text-brand-secondary">Student</p>
                        </div>
                      ) : (
                        <div>
                          <p className="text-sm text-white">{guest.company}</p>
                          <p className="text-xs text-muted">{guest.jobTitle}</p>
                        </div>
                      )}
                    </td>
                    <td className="p-4">
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-md text-[10px] font-semibold tracking-widest uppercase border ${
                        guest.status === 'Approved' || guest.status === 'Auto_approved' ? 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20' :
                        guest.status === 'Pending' ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' :
                        'bg-red-500/10 text-red-400 border-red-500/20'
                      }`}>
                        {guest.status === 'Auto_approved' ? 'Approved' : guest.status}
                      </span>
                    </td>
                    <td className="p-4 text-right space-x-2 whitespace-nowrap">
                      <button
                        onClick={() => handleStatusChange(guest.id, 'Approved')}
                        disabled={guest.status === 'Approved' || guest.status === 'Auto_approved'}
                        className="p-2 rounded-xl bg-cyan-500/10 text-cyan-400 hover:bg-cyan-500/20 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        title="Approve"
                      >
                        <Check className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleStatusChange(guest.id, 'Rejected')}
                        disabled={guest.status === 'Rejected'}
                        className="p-2 rounded-xl bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        title="Reject"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
                {guests.length === 0 && (
                  <tr>
                    <td colSpan={4} className="p-8 text-center text-slate-500 text-sm">
                      No guests have registered yet.
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
