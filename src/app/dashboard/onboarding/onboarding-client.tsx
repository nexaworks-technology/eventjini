"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { GlassCard } from "@/components/ui/glass-card";
import { Button } from "@/components/ui/button";
import { Building2, Loader2, Rocket } from "lucide-react";
import { FadeInUp } from "@/components/animations/motion";
import { toast } from "sonner";
import { createOrganizer } from "@/app/actions/organizer";

export default function OnboardingClient() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);

    const formData = new FormData(e.currentTarget);
    const result = await createOrganizer(formData);

    if (result.error) {
      toast.error(result.error);
      setIsSubmitting(false);
    } else {
      toast.success("Workspace created! Welcome to EventJini.");
      // Hard refresh to reload layouts and middleware state
      window.location.href = "/dashboard";
    }
  };

  return (
    <FadeInUp className="w-full max-w-md">
      <GlassCard className="p-8">
        <div className="flex justify-center mb-6">
          <div className="w-16 h-16 rounded-2xl bg-cyan-500/20 flex items-center justify-center border border-cyan-500/30">
            <Rocket className="w-8 h-8 text-cyan-400" />
          </div>
        </div>
        
        <h1 className="text-2xl font-bold text-center text-white mb-2">
          Host Your First Event
        </h1>
        <p className="text-center text-white/60 mb-8 text-sm">
          To access the Organizer Dashboard, please create a Workspace for your organization or personal brand.
        </p>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <label className="text-sm font-medium text-white/80 flex items-center gap-2">
              <Building2 className="w-4 h-4 text-purple-400" /> Organization Name
            </label>
            <input
              name="name"
              required
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/40 focus:outline-none focus:border-cyan-500/50 transition-colors"
              placeholder="e.g. NexaWorks Tech, or just your name"
            />
            <p className="text-xs text-white/40 pt-1">
              This will be public on your event pages.
            </p>
          </div>

          <Button variant="primary" type="submit" disabled={isSubmitting} className="w-full">
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Creating Workspace...
              </>
            ) : (
              "Create Workspace & Continue"
            )}
          </Button>
        </form>
      </GlassCard>
    </FadeInUp>
  );
}
