"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { registerForEvent } from "@/app/actions/registrations";
import { Button } from "@/components/ui/button";
import { GlassCard } from "@/components/ui/glass-card";
import { Ticket, Users, AlertCircle } from "lucide-react";
import { createRazorpayOrder, verifyPaymentAndRegister } from "@/app/actions/payment";
import Script from "next/script";
import { motion } from "framer-motion";

declare global {
  interface Window {
    Razorpay: any;
  }
}

interface EventRegistrationClientProps {
  eventId: string;
  isSoldOut: boolean;
  isFree: boolean;
  price: number;
  capacity: number;
  registeredCount: number;
  isLoggedIn: boolean;
}

export default function EventRegistrationClient({
  eventId,
  isSoldOut,
  isFree,
  price,
  capacity,
  registeredCount,
  isLoggedIn,
}: EventRegistrationClientProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const [jobTitle, setJobTitle] = useState("");
  const [companySize, setCompanySize] = useState("");
  
  const handleRegister = () => {
    if (!isLoggedIn) {
      router.push(`/login?redirect=${window.location.pathname}`);
      return;
    }

    setError(null);
    startTransition(async () => {
      if (isFree) {
        const res = await registerForEvent(eventId, jobTitle, companySize);
        if (res.error) {
          setError(res.error);
        } else if (res.data?.ticket_code) {
          const currentPath = window.location.pathname;
          router.push(`${currentPath}/ticket?code=${res.data.ticket_code}`);
        }
        return;
      }

      // Handle Paid Event via Razorpay
      const orderRes = await createRazorpayOrder(eventId);
      if (orderRes.error || !orderRes.data) {
        setError(orderRes.error || "Failed to initiate payment");
        return;
      }

      const options = {
        key: orderRes.data.key,
        amount: orderRes.data.amount,
        currency: "INR",
        name: "EventJini",
        description: "Event Ticket Registration",
        order_id: orderRes.data.orderId,
        handler: async function (response: any) {
          const verifyRes = await verifyPaymentAndRegister(
            eventId,
            response.razorpay_order_id,
            response.razorpay_payment_id,
            response.razorpay_signature,
            jobTitle,
            companySize
          );

          if (verifyRes.error) {
            setError(verifyRes.error);
          } else if (verifyRes.data?.ticket_code) {
            const currentPath = window.location.pathname;
            router.push(`${currentPath}/ticket?code=${verifyRes.data.ticket_code}`);
          }
        },
        theme: {
          color: "#6366f1",
        },
      };

      const paymentObject = new window.Razorpay(options);
      paymentObject.open();
    });
  };

  const spotsLeft = capacity - registeredCount;
  const showUrgency = spotsLeft > 0 && spotsLeft <= 20;

  return (
    <>
      <Script src="https://checkout.razorpay.com/v1/checkout.js" />
      <GlassCard level={2} animate={false} className="flex flex-col p-8 border-t-4 border-t-brand-primary">
        
        {/* Pricing Header */}
        <div className="flex items-start justify-between mb-8 pb-8 border-b border-white/[0.04]">
          <div>
            <p className="text-xs font-semibold text-muted uppercase tracking-widest mb-1">
              {isFree ? "General Admission" : "Early Bird"}
            </p>
            <h3 className="text-4xl font-bold text-white tracking-tight">
              {isFree ? "Free" : `₹${price}`}
            </h3>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-brand-primary/10 flex items-center justify-center border border-brand-primary/20 shrink-0">
            <Ticket className="w-6 h-6 text-brand-primary" />
          </div>
        </div>

        {/* Capacity */}
        <div className="flex items-center gap-3 text-sm text-muted mb-8">
          <Users className="w-4 h-4 text-brand-secondary" />
          <span>{registeredCount} / {capacity} Registered</span>
        </div>

        {/* Auth / Form */}
        {isLoggedIn ? (
          <div className="w-full space-y-5 mb-8">
            <div className="space-y-1.5 text-left">
              <label className="text-xs font-semibold text-muted uppercase tracking-widest pl-1">Job Title (Optional)</label>
              <input 
                type="text" 
                placeholder="e.g. Designer" 
                value={jobTitle}
                onChange={(e) => setJobTitle(e.target.value)}
                className="w-full bg-canvas border border-white/[0.06] rounded-xl px-4 py-3 text-sm text-white placeholder-muted/40 focus:outline-none focus:border-brand-primary/40 focus:ring-1 focus:ring-brand-primary/20 transition-all"
              />
            </div>
            
            <div className="space-y-1.5 text-left">
              <label className="text-xs font-semibold text-muted uppercase tracking-widest pl-1">Company Size (Optional)</label>
              <select 
                value={companySize}
                onChange={(e) => setCompanySize(e.target.value)}
                className="w-full bg-canvas border border-white/[0.06] rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-brand-primary/40 focus:ring-1 focus:ring-brand-primary/20 transition-all appearance-none"
              >
                <option value="" className="bg-canvas">Select size</option>
                <option value="1-10" className="bg-canvas">1-10 employees</option>
                <option value="11-50" className="bg-canvas">11-50 employees</option>
                <option value="51-200" className="bg-canvas">51-200 employees</option>
                <option value="201-1000" className="bg-canvas">201-1000 employees</option>
                <option value="1000+" className="bg-canvas">1000+ employees</option>
              </select>
            </div>
          </div>
        ) : (
          <div className="w-full bg-canvas border border-white/[0.04] rounded-2xl p-5 mb-8 flex flex-col items-center gap-2 text-center">
            <p className="text-sm text-white font-medium">Create an account to attend</p>
            <p className="text-xs text-muted leading-relaxed">
              You need an EventJini profile so we can issue your personalized digital ticket.
            </p>
          </div>
        )}

        {/* Alerts */}
        {showUrgency && !isSoldOut && (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="w-full bg-amber-500/10 border border-amber-500/20 rounded-xl p-4 mb-8 flex items-start gap-3"
          >
            <AlertCircle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
            <p className="text-sm text-amber-200 leading-snug">
              Hurry! Only <span className="font-bold text-amber-500">{spotsLeft}</span> spots remaining.
            </p>
          </motion.div>
        )}

        {error && (
          <div className="w-full bg-red-500/10 border border-red-500/20 rounded-xl p-4 mb-8 flex items-start gap-3">
            <AlertCircle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
            <p className="text-sm text-red-200">{error}</p>
          </div>
        )}

        {/* Action Button */}
        {isSoldOut ? (
          <Button disabled variant="secondary" className="w-full py-4 text-base">
            Sold Out
          </Button>
        ) : (
          <Button 
            onClick={handleRegister} 
            disabled={isPending} 
            variant="primary" 
            className="w-full py-4 text-base relative overflow-hidden group"
          >
            <span className="relative z-10 font-bold tracking-wide">
              {isPending ? "Processing..." : !isLoggedIn ? "Login to Register" : isFree ? "Register Now →" : "Get Tickets →"}
            </span>
            <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
          </Button>
        )}
        
        <p className="text-[10px] text-muted text-center mt-6 tracking-widest uppercase">
          Secure checkout by EventJini
        </p>
      </GlassCard>
    </>
  );
}
