"use client";

import { useState } from "react";
import { GlassCard } from "@/components/ui/glass-card";
import { Button } from "@/components/ui/button";
import { User, Briefcase, Building2, Save, Loader2 } from "lucide-react";
import { FadeInUp } from "@/components/animations/motion";
import { toast } from "sonner";
import { updateProfile } from "@/app/actions/profile";

export default function ProfileClient({ initialProfile, error }: { initialProfile: any, error?: string }) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);

    const formData = new FormData(e.currentTarget);
    const result = await updateProfile(formData);

    setIsSubmitting(false);

    if (result.error) {
      toast.error(result.error);
    } else {
      toast.success("Profile updated successfully!");
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-6 pt-32 pb-24">
      <FadeInUp>
        <h1 className="text-4xl font-bold tracking-tight text-white mb-4">
          Profile Settings
        </h1>
        <p className="text-lg text-white/60 mb-12">
          Update your personal information to pre-fill event registrations instantly.
        </p>
      </FadeInUp>

      <FadeInUp delay={0.1}>
        {error && (
          <div className="text-red-400 p-4 rounded-xl bg-red-400/10 border border-red-400/20 mb-8">
            Failed to load profile: {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <GlassCard className="p-8 space-y-8">
            <div className="flex items-center gap-6 pb-8 border-b border-white/10">
              <div className="w-20 h-20 rounded-2xl bg-gradient-to-tr from-cyan-500 to-purple-500 flex items-center justify-center text-2xl font-bold">
                {initialProfile?.full_name?.[0] || initialProfile?.email?.[0]?.toUpperCase() || "U"}
              </div>
              <div>
                <h2 className="text-xl font-bold text-white">{initialProfile?.full_name || "Your Profile"}</h2>
                <p className="text-white/50">{initialProfile?.email}</p>
              </div>
            </div>

            <div className="space-y-6">
              <div className="space-y-2">
                <label className="text-sm font-medium text-white/80 flex items-center gap-2">
                  <User className="w-4 h-4 text-cyan-400" /> Full Name
                </label>
                <input
                  name="full_name"
                  defaultValue={initialProfile?.full_name || ""}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/40 focus:outline-none focus:border-cyan-500/50 transition-colors"
                  placeholder="e.g. Jane Doe"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-white/80 flex items-center gap-2">
                    <Briefcase className="w-4 h-4 text-purple-400" /> Job Title
                  </label>
                  <input
                    name="job_title"
                    defaultValue={initialProfile?.job_title || ""}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/40 focus:outline-none focus:border-cyan-500/50 transition-colors"
                    placeholder="e.g. Product Manager"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-white/80 flex items-center gap-2">
                    <Building2 className="w-4 h-4 text-emerald-400" /> Company Size
                  </label>
                  <select
                    name="company_size"
                    defaultValue={initialProfile?.company_size || ""}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-cyan-500/50 transition-colors appearance-none"
                  >
                    <option value="" className="bg-[#050505]">Select size...</option>
                    <option value="1-10" className="bg-[#050505]">1-10 employees</option>
                    <option value="11-50" className="bg-[#050505]">11-50 employees</option>
                    <option value="51-200" className="bg-[#050505]">51-200 employees</option>
                    <option value="201-500" className="bg-[#050505]">201-500 employees</option>
                    <option value="500+" className="bg-[#050505]">500+ employees</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="pt-4 flex justify-end">
              <Button variant="primary" type="submit" disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4 mr-2" />
                    Save Changes
                  </>
                )}
              </Button>
            </div>
          </GlassCard>
        </form>
      </FadeInUp>
    </div>
  );
}
