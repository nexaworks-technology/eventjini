"use client";

import { use, useEffect, useState } from "react";
import { GlassCard } from "@/components/ui/glass-card";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { CheckCircle2, Crown, Sparkles, Star } from "lucide-react";
import { FadeInUp, StaggerContainer, staggerChildVariants } from "@/components/animations/motion";
import { motion, AnimatePresence } from "framer-motion";
import { getSponsorshipTiers, SponsorshipTier } from "@/app/actions/sponsors";
import { createSponsorRazorpayOrder, verifySponsorPaymentAndRegister } from "@/app/actions/payment";
import Script from "next/script";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";

declare global {
  interface Window {
    Razorpay: any;
  }
}

export default function SponsorsPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const resolvedParams = use(params);
  const router = useRouter();
  const supabase = createClient();
  const [tiers, setTiers] = useState<SponsorshipTier[]>([]);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [processingTier, setProcessingTier] = useState<string | null>(null);
  
  // Checkout Modal State
  const [selectedTier, setSelectedTier] = useState<SponsorshipTier | null>(null);
  const [companyName, setCompanyName] = useState("");

  useEffect(() => {
    getSponsorshipTiers(resolvedParams.slug).then(setTiers);
    supabase.auth.getSession().then(({ data }) => {
      setIsLoggedIn(!!data.session);
    });
  }, [resolvedParams.slug, supabase.auth]);

  const initiateCheckout = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTier) return;
    if (!companyName.trim()) {
      toast.error("Please enter your company name.");
      return;
    }

    setProcessingTier(selectedTier.id);
    
    const orderRes = await createSponsorRazorpayOrder(selectedTier.id);
    if (orderRes.error || !orderRes.data) {
      toast.error(orderRes.error || "Failed to initialize payment");
      setProcessingTier(null);
      return;
    }

    const options = {
      key: orderRes.data.key,
      amount: orderRes.data.amount,
      currency: "INR",
      name: "EventJini",
      description: `Sponsorship: ${selectedTier.name}`,
      order_id: orderRes.data.orderId,
      handler: async function (response: any) {
        const verifyRes = await verifySponsorPaymentAndRegister(
          selectedTier.id,
          response.razorpay_order_id,
          response.razorpay_payment_id,
          response.razorpay_signature,
          companyName
        );

        if (verifyRes.error) {
          toast.error(verifyRes.error);
        } else {
          toast.success("Sponsorship secured! Redirecting to your portal...");
          router.push("/dashboard/sponsor-portal");
        }
        setProcessingTier(null);
        setSelectedTier(null);
      },
      modal: {
        ondismiss: function() {
          setProcessingTier(null);
        }
      },
      theme: { color: "#6366f1" },
    };

    const paymentObject = new window.Razorpay(options);
    paymentObject.open();
  };

  const handleSelectTier = (tier: SponsorshipTier) => {
    if (!isLoggedIn) {
      toast.error("Please log in to become a sponsor.");
      router.push(`/login?redirect=/e/${resolvedParams.slug}/sponsors`);
      return;
    }
    setSelectedTier(tier);
  };

  return (
    <div className="min-h-screen bg-[#050505] text-slate-200">
      <Script src="https://checkout.razorpay.com/v1/checkout.js" />
      
      {/* Checkout Modal Overlay */}
      <AnimatePresence>
        {selectedTier && (
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
          >
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
              className="w-full max-w-md"
            >
              <GlassCard level={2} className="p-8">
                <h3 className="text-2xl font-bold text-white mb-2">Checkout: {selectedTier.name}</h3>
                <p className="text-muted mb-6">Total Amount: ₹{selectedTier.price.toLocaleString()}</p>
                
                <form onSubmit={initiateCheckout} className="space-y-4">
                  <div>
                    <label className="block text-sm font-semibold text-slate-400 uppercase tracking-widest mb-2">Company Name</label>
                    <input 
                      type="text" 
                      required 
                      autoFocus
                      value={companyName}
                      onChange={(e) => setCompanyName(e.target.value)}
                      className="w-full bg-surface border border-white/10 rounded-xl py-3 px-4 text-white focus:outline-none focus:border-brand-primary/50 transition-colors"
                      placeholder="e.g. Acme Corp"
                    />
                  </div>
                  <div className="flex gap-3 pt-4">
                    <Button type="button" variant="ghost" className="flex-1" onClick={() => setSelectedTier(null)}>Cancel</Button>
                    <Button type="submit" variant="primary" className="flex-1" disabled={processingTier === selectedTier.id}>
                      {processingTier === selectedTier.id ? "Processing..." : "Pay Now"}
                    </Button>
                  </div>
                </form>
              </GlassCard>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <section className="relative pt-32 pb-20 px-6 overflow-hidden flex items-center justify-center min-h-[40vh]">
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

      <section className="px-6 pb-32">
        <div className="max-w-6xl mx-auto">
          <StaggerContainer className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
            {tiers.map((tier, index) => {
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
                  <GlassCard hoverGlow className="flex flex-col relative overflow-hidden group w-full">
                    <div className={`absolute -top-24 -right-24 w-48 h-48 rounded-full blur-[80px] opacity-10 group-hover:opacity-30 transition-opacity duration-500 bg-current ${theme.color}`} />
                    
                    <div className="mb-8 relative z-10">
                      <div className="flex items-center gap-3 mb-4">
                        <div className={`p-3 rounded-xl bg-white/5 border border-white/10 ${theme.color} ${theme.bgColor}`}>
                          <Icon className="w-6 h-6" />
                        </div>
                        <h2 className="text-2xl font-semibold text-white">{tier.name}</h2>
                      </div>

                      <div className="flex items-baseline gap-2 mb-2">
                        <span className="text-4xl font-bold text-white">₹{tier.price.toLocaleString()}</span>
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
                            <span className="text-slate-300 text-sm leading-relaxed">{benefit}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div className="relative z-10 mt-auto">
                      <Button variant="primary" className="w-full" onClick={() => handleSelectTier(tier)} disabled={processingTier === tier.id}>
                        {processingTier === tier.id ? "Initializing..." : "Secure Sponsorship"}
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
