"use client";

import { use } from "react";
import { GlassCard } from "@/components/ui/glass-card";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { CheckCircle2, Crown, Sparkles, Star } from "lucide-react";
import { FadeInUp, StaggerContainer, staggerChildVariants } from "@/components/animations/motion";
import { motion } from "framer-motion";

import { useEffect, useState } from "react";
import { getSponsorshipTiers, SponsorshipTier } from "@/app/actions/sponsors";

export default function SponsorsPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const resolvedParams = use(params);
  const [tiers, setTiers] = useState<SponsorshipTier[]>([]);

  useEffect(() => {
    getSponsorshipTiers(resolvedParams.slug).then(setTiers);
  }, [resolvedParams.slug]);

  const handleExpressInterest = () => {
    toast.success("Thanks! The organizer will contact you.");
  };

  return (
    <div className="min-h-screen bg-[#050505] text-slate-200">
      {/* Hero Section */}
      <section className="relative pt-32 pb-20 px-6 overflow-hidden flex items-center justify-center min-h-[40vh]">
        {/* Neon Glow Backgrounds */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="w-[800px] h-[500px] bg-cyan-500/10 rounded-full blur-[120px] mix-blend-screen" />
          <div className="absolute top-1/4 w-[600px] h-[400px] bg-purple-500/10 rounded-full blur-[100px] mix-blend-screen translate-x-1/3" />
        </div>

        <div className="max-w-5xl mx-auto text-center relative z-10 w-full">
          <FadeInUp>
            <h1 className="text-5xl md:text-7xl font-bold tracking-tight mb-6 bg-gradient-to-br from-white via-slate-200 to-slate-500 bg-clip-text text-transparent">
              Partner with {resolvedParams.slug}
            </h1>
            <p className="text-lg md:text-xl text-slate-400 max-w-2xl mx-auto leading-relaxed">
              Elevate your brand by sponsoring our premier event. Connect with industry leaders, showcase your products, and make a lasting impact.
            </p>
          </FadeInUp>
        </div>
      </section>

      {/* Pricing/Tiers Section */}
      <section className="px-6 pb-32">
        <div className="max-w-6xl mx-auto">
          <StaggerContainer className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
            {tiers.map((tier, index) => {
              // Assign a color theme based on index
              const colorThemes = [
                { color: "text-yellow-400", bgColor: "bg-yellow-400/10", icon: Crown },
                { color: "text-slate-300", bgColor: "bg-slate-300/10", icon: Sparkles },
                { color: "text-orange-400", bgColor: "bg-orange-400/10", icon: Star },
                { color: "text-cyan-400", bgColor: "bg-cyan-400/10", icon: Crown },
              ];
              const theme = colorThemes[index % colorThemes.length];
              const Icon = theme.icon;

              return (
                <motion.div key={tier.id} variants={staggerChildVariants} className="h-full flex">
                  <GlassCard
                    animate={false}
                    hoverGlow
                    className="flex flex-col relative overflow-hidden group w-full"
                  >
                    <div
                      className={`absolute -top-24 -right-24 w-48 h-48 rounded-full blur-[80px] opacity-10 group-hover:opacity-30 transition-opacity duration-500 bg-current ${theme.color}`}
                    />
                    
                    <div className="mb-8 relative z-10">
                      <div className="flex items-center gap-3 mb-4">
                        <div
                          className={`p-3 rounded-xl bg-white/5 border border-white/10 ${theme.color} ${theme.bgColor}`}
                        >
                          <Icon className="w-6 h-6" />
                        </div>
                        <h2 className="text-2xl font-semibold text-white">
                          {tier.name}
                        </h2>
                      </div>

                      <div className="flex items-baseline gap-2 mb-2">
                        <span className="text-4xl font-bold text-white">
                          ${tier.price.toLocaleString()}
                        </span>
                      </div>
                      <p className="text-sm text-cyan-400 font-medium bg-cyan-500/10 inline-flex px-3 py-1 rounded-full border border-cyan-500/20">
                        {tier.slotsAvailable} slots remaining
                      </p>
                    </div>

                    <div className="flex-grow relative z-10">
                      <ul className="space-y-4 mb-8">
                        {tier.benefits.map((benefit, idx) => (
                          <li key={idx} className="flex items-start gap-3">
                            <CheckCircle2 className="w-5 h-5 text-purple-400 shrink-0 mt-0.5" />
                            <span className="text-slate-300 text-sm leading-relaxed">
                              {benefit}
                            </span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div className="relative z-10 mt-auto">
                      <Button
                        variant="primary"
                        className="w-full"
                        onClick={handleExpressInterest}
                      >
                        Express Interest
                      </Button>
                    </div>
                  </GlassCard>
                </motion.div>
              );
            })}
          </StaggerContainer>
        </div>
      </section>
    </div>
  );
}
