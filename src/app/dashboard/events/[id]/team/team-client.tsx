"use client";
import Image from "next/image";

import { useState } from "react";
import { addTeamMember, removeTeamMember } from "@/app/actions/team";
import { GlassCard } from "@/components/ui/glass-card";
import { Button } from "@/components/ui/button";
import { FadeInUp } from "@/components/animations/motion";
import { Mail, Shield, UserX, UserPlus, CheckCircle2 } from "lucide-react";

export default function TeamClient({ eventId, teamMembers: initialMembers }: { eventId: string, teamMembers: any[] }) {
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("scanner");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleAddMember = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setSuccess(false);

    const result = await addTeamMember(eventId, email, role);

    if (result.error) {
      setError(result.error);
    } else {
      setSuccess(true);
      setEmail("");
    }
    
    setIsLoading(false);
  };

  const handleRemoveMember = async (memberId: string) => {
    if (!confirm("Are you sure you want to remove this team member?")) return;
    await removeTeamMember(eventId, memberId);
  };

  return (
    <div className="max-w-4xl space-y-8 pb-12">
      <div>
        <h1 className="text-3xl font-bold text-white mb-2 tracking-tight">Team Management</h1>
        <p className="text-muted">Invite co-organizers, check-in staff, and finance admins to help run your event.</p>
      </div>

      {/* Add Member Form */}
      <FadeInUp>
        <GlassCard level={2} className="p-8 border-brand-primary/20 bg-brand-primary/5">
          <h2 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
            <UserPlus className="w-5 h-5 text-brand-primary" />
            Invite a Team Member
          </h2>
          
          <form onSubmit={handleAddMember} className="grid grid-cols-1 md:grid-cols-12 gap-4 items-end">
            <div className="md:col-span-5 space-y-2">
              <label className="text-xs font-semibold text-muted uppercase tracking-wider">Email Address</label>
              <div className="relative">
                <Mail className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="colleague@company.com"
                  className="w-full bg-surface border border-white/10 rounded-xl py-2.5 pl-10 pr-4 text-white focus:outline-none focus:border-brand-primary/50 transition-colors"
                />
              </div>
            </div>
            
            <div className="md:col-span-4 space-y-2">
              <label className="text-xs font-semibold text-muted uppercase tracking-wider">Role</label>
              <div className="relative">
                <Shield className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  className="w-full bg-surface border border-white/10 rounded-xl py-2.5 pl-10 pr-4 text-white focus:outline-none focus:border-brand-primary/50 appearance-none transition-colors"
                >
                  <option value="admin">Admin (Full Access)</option>
                  <option value="finance">Finance (View Revenue Only)</option>
                  <option value="scanner">Check-in Scanner (App Only)</option>
                </select>
              </div>
            </div>
            
            <div className="md:col-span-3">
              <Button type="submit" variant="primary" className="w-full py-2.5" disabled={isLoading}>
                {isLoading ? "Inviting..." : "Send Invite"}
              </Button>
            </div>
          </form>

          {error && <p className="text-red-400 text-sm mt-4">{error}</p>}
          {success && (
            <p className="text-emerald-400 text-sm mt-4 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4" /> Member successfully added!
            </p>
          )}
        </GlassCard>
      </FadeInUp>

      {/* Member List */}
      <FadeInUp delay={0.1}>
        <div className="space-y-4">
          <h2 className="text-lg font-bold text-white mb-4">Active Team</h2>
          
          <div className="bg-surface border border-white/[0.04] rounded-2xl overflow-hidden">
            <div className="grid grid-cols-12 gap-4 p-4 border-b border-white/[0.04] text-xs font-semibold text-muted uppercase tracking-wider bg-white/[0.01]">
              <div className="col-span-6 md:col-span-5">User</div>
              <div className="col-span-4 md:col-span-4">Role</div>
              <div className="col-span-2 md:col-span-3 text-right">Actions</div>
            </div>
            
            <div className="divide-y divide-white/[0.04]">
              {initialMembers.length === 0 ? (
                <div className="p-8 text-center text-muted text-sm">
                  No team members added yet. You are the only admin.
                </div>
              ) : (
                initialMembers.map((member) => (
                  <div key={member.id} className="grid grid-cols-12 gap-4 p-4 items-center hover:bg-white/[0.02] transition-colors">
                    <div className="col-span-6 md:col-span-5 flex items-center gap-3">
                      <Image 
                        width={32}
                        height={32}
                        src={member.profile?.avatar_url || `https://api.dicebear.com/7.x/initials/svg?seed=${member.profile?.full_name || 'U'}&backgroundColor=131b2f&textColor=6366f1`} 
                        alt="Avatar" 
                        className="w-8 h-8 rounded-full border border-white/10"
                      />
                      <div>
                        <p className="text-sm font-medium text-white line-clamp-1">{member.profile?.full_name || 'Unknown User'}</p>
                        <p className="text-xs text-muted line-clamp-1">{member.profile?.email}</p>
                      </div>
                    </div>
                    
                    <div className="col-span-4 md:col-span-4">
                      <span className={`inline-flex items-center px-2 py-1 rounded-md text-[10px] font-semibold tracking-wider uppercase border
                        ${member.role === 'admin' ? 'bg-purple-500/10 text-purple-400 border-purple-500/20' : 
                          member.role === 'finance' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 
                          'bg-amber-500/10 text-amber-400 border-amber-500/20'}`}>
                        {member.role}
                      </span>
                    </div>
                    
                    <div className="col-span-2 md:col-span-3 text-right">
                      <button 
                        onClick={() => handleRemoveMember(member.id)}
                        className="p-2 text-muted hover:text-red-400 transition-colors bg-white/5 rounded-lg hover:bg-red-400/10"
                      >
                        <UserX className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </FadeInUp>
    </div>
  );
}
