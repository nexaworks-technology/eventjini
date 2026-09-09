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
      router.push(`/register?redirect=${window.location.pathname}`);
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
          color: "#06b6d4",
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
      <GlassCard hoverGlow className="sticky top-24 flex flex-col items-center text-center p-8">
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-cyan-500/20 to-purple-500/20 flex items-center justify-center mb-6 shadow-inner border border-white/5">
          <Ticket className="w-8 h-8 text-cyan-400" />
        </div>
        
        <h3 className="text-2xl font-bold text-white mb-2">
          {isFree ? "Free Registration" : `₹${price}`}
        </h3>
      <div className="flex items-center gap-2 text-slate-400 mb-6 text-sm">
        <Users className="w-4 h-4" />
        <span>{registeredCount} / {capacity} Attending</span>
      </div>

      {isLoggedIn ? (
        <div className="w-full space-y-4 mb-6">
          <div className="space-y-1 text-left">
            <label className="text-xs text-white/60 pl-1">Job Title (Optional)</label>
            <input 
              type="text" 
              placeholder="e.g. Software Engineer" 
              value={jobTitle}
              onChange={(e) => setJobTitle(e.target.value)}
              className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-white/20 focus:outline-none focus:border-cyan-500/50"
            />
          </div>
          
          <div className="space-y-1 text-left">
            <label className="text-xs text-white/60 pl-1">Company Size (Optional)</label>
            <select 
              value={companySize}
              onChange={(e) => setCompanySize(e.target.value)}
              className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-cyan-500/50 appearance-none"
            >
              <option value="" className="bg-black">Select company size</option>
              <option value="1-10" className="bg-black">1-10 employees</option>
              <option value="11-50" className="bg-black">11-50 employees</option>
              <option value="51-200" className="bg-black">51-200 employees</option>
              <option value="201-1000" className="bg-black">201-1000 employees</option>
              <option value="1000+" className="bg-black">1000+ employees</option>
            </select>
          </div>
        </div>
      ) : (
        <div className="w-full bg-white/5 border border-white/10 rounded-xl p-4 mb-6 flex flex-col items-center gap-2">
          <p className="text-sm text-white/80 font-medium">Create an account to attend</p>
          <p className="text-xs text-white/50 text-center">You need an EventJini profile so we can issue your personalized ticket.</p>
        </div>
      )}

      {showUrgency && !isSoldOut && (
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full bg-orange-500/10 border border-orange-500/20 rounded-xl p-3 mb-6 flex items-start gap-3 text-left"
        >
          <AlertCircle className="w-5 h-5 text-orange-400 shrink-0 mt-0.5" />
          <p className="text-sm text-orange-200">
            Hurry! Only <span className="font-bold text-orange-400">{spotsLeft}</span> spots left for this event.
          </p>
        </motion.div>
      )}

      {error && (
        <div className="w-full bg-red-500/10 border border-red-500/20 rounded-xl p-3 mb-6 flex items-start gap-3 text-left">
          <AlertCircle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
          <p className="text-sm text-red-200">{error}</p>
        </div>
      )}

      {isSoldOut ? (
        <Button disabled variant="secondary" className="w-full py-4 text-lg">
          Sold Out
        </Button>
      ) : (
        <Button 
          onClick={handleRegister} 
          disabled={isPending} 
          variant="primary" 
          className="w-full py-4 text-lg relative overflow-hidden group"
        >
          <span className="relative z-10">
            {isPending ? "Processing..." : !isLoggedIn ? "Login to Register" : isFree ? "Register Now" : "Get Tickets"}
          </span>
          <div className="absolute inset-0 bg-gradient-to-r from-purple-500 to-cyan-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        </Button>
      )}
      
      <p className="text-xs text-slate-500 mt-6">
        Secure checkout provided by EventJini. By registering, you agree to our Terms of Service.
      </p>
    </GlassCard>
    </>
  );
}
