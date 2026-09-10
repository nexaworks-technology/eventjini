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

  const initials = initialProfile?.full_name?.[0] || initialProfile?.email?.[0]?.toUpperCase() || "U";

  return (
    <div className="max-w-2xl mx-auto px-6 pt-28 pb-24">
      <FadeInUp>
        <p className="text-sm font-medium text-brand-primary uppercase tracking-widest mb-3">Settings</p>
        <h1 className="text-4xl font-bold tracking-tighter text-white mb-2">
          Profile
        </h1>
        <p className="text-muted mb-12">
          Manage your personal information. This pre-fills event registrations.
        </p>
      </FadeInUp>

      <FadeInUp delay={0.1}>
        {error && (
          <div className="text-red-400 p-4 rounded-2xl bg-red-400/5 border border-red-400/10 mb-8">
            Failed to load profile: {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Avatar + Identity */}
          <GlassCard level={2} className="p-8">
            <div className="flex items-center gap-5 pb-8 mb-8 border-b border-white/[0.04]">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-brand-primary to-brand-secondary flex items-center justify-center text-xl font-bold text-white shrink-0">
                {initials}
              </div>
              <div>
                <h2 className="text-lg font-bold text-white">{initialProfile?.full_name || "Your Profile"}</h2>
                <p className="text-sm text-muted">{initialProfile?.email}</p>
              </div>
            </div>

            <div className="space-y-6">
              {/* Full Name */}
              <div className="space-y-2">
                <label className="text-xs font-semibold text-muted uppercase tracking-widest flex items-center gap-2">
                  <User className="w-3.5 h-3.5 text-brand-primary" /> Full Name
                </label>
                <input
                  name="full_name"
                  defaultValue={initialProfile?.full_name || ""}
                  className="w-full bg-canvas border border-white/[0.06] rounded-xl px-4 py-3 text-white placeholder-muted/40 focus:outline-none focus:border-brand-primary/40 focus:ring-1 focus:ring-brand-primary/20 transition-all"
                  placeholder="e.g. Sahil Gupta"
                />
              </div>

              {/* Job Title + Company Size */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-muted uppercase tracking-widest flex items-center gap-2">
                    <Briefcase className="w-3.5 h-3.5 text-brand-secondary" /> Job Title
                  </label>
                  <input
                    name="job_title"
                    defaultValue={initialProfile?.job_title || ""}
                    className="w-full bg-canvas border border-white/[0.06] rounded-xl px-4 py-3 text-white placeholder-muted/40 focus:outline-none focus:border-brand-primary/40 focus:ring-1 focus:ring-brand-primary/20 transition-all"
                    placeholder="e.g. Product Manager"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-semibold text-muted uppercase tracking-widest flex items-center gap-2">
                    <Building2 className="w-3.5 h-3.5 text-event-wellness" /> Company Size
                  </label>
                  <select
                    name="company_size"
                    defaultValue={initialProfile?.company_size || ""}
                    className="w-full bg-canvas border border-white/[0.06] rounded-xl px-4 py-3 text-white focus:outline-none focus:border-brand-primary/40 focus:ring-1 focus:ring-brand-primary/20 transition-all appearance-none"
                  >
                    <option value="" className="bg-canvas">Select size...</option>
                    <option value="1-10" className="bg-canvas">1-10 employees</option>
                    <option value="11-50" className="bg-canvas">11-50 employees</option>
                    <option value="51-200" className="bg-canvas">51-200 employees</option>
                    <option value="201-500" className="bg-canvas">201-500 employees</option>
                    <option value="500+" className="bg-canvas">500+ employees</option>
                  </select>
                </div>
              </div>
            </div>
          </GlassCard>

          {/* Save Button */}
          <div className="flex justify-end">
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
        </form>
      </FadeInUp>
    </div>
  );
}
