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
  requireB2bData?: boolean;
  requiresApproval?: boolean;
  trackingLinkId?: string | null;
}

export default function EventRegistrationClient({
  eventId,
  isSoldOut,
  isFree,
  price,
  capacity,
  registeredCount,
  isLoggedIn,
  requireB2bData,
  requiresApproval,
  trackingLinkId,
}: EventRegistrationClientProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  // Guest Data State
  const [showGuestForm, setShowGuestForm] = useState(false);
  const [guestEmail, setGuestEmail] = useState("");
  const [guestName, setGuestName] = useState("");
  const [guestCompany, setGuestCompany] = useState("");
  const [guestJobTitle, setGuestJobTitle] = useState("");
  const [isStudent, setIsStudent] = useState(false);
  const [guestCollege, setGuestCollege] = useState("");
  
  const handleRegister = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    
    if (!isLoggedIn && !showGuestForm) {
      setShowGuestForm(true);
      return;
    }

    if (!isLoggedIn && showGuestForm) {
      if (!guestEmail || !guestName) {
        setError("Email and Name are required.");
        return;
      }
      if (requireB2bData && !isStudent && (!guestCompany || !guestJobTitle)) {
        setError("Company and Job Title are required.");
        return;
      }
      if (requireB2bData && isStudent && !guestCollege) {
        setError("College name is required.");
        return;
      }
    }

    setError(null);
    startTransition(async () => {
      let guestData: any = !isLoggedIn ? {
        email: guestEmail,
        name: guestName,
        company: guestCompany,
        jobTitle: guestJobTitle,
        isStudent: isStudent,
        college: guestCollege
      } : {};
      
      if (trackingLinkId) {
        guestData.trackingLinkId = trackingLinkId;
      }
      
      if (isLoggedIn && !trackingLinkId) {
        guestData = undefined; // For backward compatibility if neither exist
      }

      if (isFree || requiresApproval) {
        const res = await registerForEvent(eventId, guestData);
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
          // Note: verification would also need to accept guest data in a real production flow
          // but for MVP, we just verify the payment.
          const verifyRes = await verifyPaymentAndRegister(
            eventId,
            response.razorpay_order_id,
            response.razorpay_payment_id,
            response.razorpay_signature,
            guestData
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

        {/* Guest Form */}
        {showGuestForm && !isLoggedIn && (
          <form id="guest-form" onSubmit={handleRegister} className="w-full space-y-4 mb-8">
            <h4 className="text-sm font-bold text-white uppercase tracking-wider mb-4 border-b border-white/10 pb-2">Guest Details</h4>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-muted uppercase tracking-wider">Full Name</label>
                <input
                  type="text"
                  required
                  value={guestName}
                  onChange={e => setGuestName(e.target.value)}
                  className="w-full bg-surface border border-white/10 rounded-xl py-2.5 px-4 text-white focus:outline-none focus:border-brand-primary/50 transition-colors"
                  placeholder="John Doe"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-muted uppercase tracking-wider">Email</label>
                <input
                  type="email"
                  required
                  value={guestEmail}
                  onChange={e => setGuestEmail(e.target.value)}
                  className="w-full bg-surface border border-white/10 rounded-xl py-2.5 px-4 text-white focus:outline-none focus:border-brand-primary/50 transition-colors"
                  placeholder="john@example.com"
                />
              </div>
            </div>

            {requireB2bData && (
              <div className="pt-4 border-t border-white/5 space-y-4">
                <label className="flex items-center gap-3 p-3 rounded-xl border border-white/10 bg-white/[0.02] cursor-pointer hover:bg-white/[0.04] transition-colors">
                  <input 
                    type="checkbox"
                    checked={isStudent}
                    onChange={e => setIsStudent(e.target.checked)}
                    className="w-4 h-4 rounded bg-surface border-white/20 text-brand-primary focus:ring-brand-primary/50"
                  />
                  <span className="text-sm font-medium text-white">I am currently a student</span>
                </label>

                {isStudent ? (
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-muted uppercase tracking-wider">College / University</label>
                    <input
                      type="text"
                      required
                      value={guestCollege}
                      onChange={e => setGuestCollege(e.target.value)}
                      className="w-full bg-surface border border-white/10 rounded-xl py-2.5 px-4 text-white focus:outline-none focus:border-brand-primary/50 transition-colors"
                      placeholder="e.g. Stanford University"
                    />
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-muted uppercase tracking-wider">Company</label>
                      <input
                        type="text"
                        required
                        value={guestCompany}
                        onChange={e => setGuestCompany(e.target.value)}
                        className="w-full bg-surface border border-white/10 rounded-xl py-2.5 px-4 text-white focus:outline-none focus:border-brand-primary/50 transition-colors"
                        placeholder="e.g. Acme Corp"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-muted uppercase tracking-wider">Job Title</label>
                      <input
                        type="text"
                        required
                        value={guestJobTitle}
                        onChange={e => setGuestJobTitle(e.target.value)}
                        className="w-full bg-surface border border-white/10 rounded-xl py-2.5 px-4 text-white focus:outline-none focus:border-brand-primary/50 transition-colors"
                        placeholder="e.g. Product Manager"
                      />
                    </div>
                  </div>
                )}
              </div>
            )}
          </form>
        )}

        {/* Action Button */}
        {isSoldOut ? (
          <Button disabled variant="secondary" className="w-full py-4 text-base">
            Sold Out
          </Button>
        ) : (
          <Button 
            onClick={showGuestForm && !isLoggedIn ? () => document.getElementById('guest-form')?.dispatchEvent(new Event('submit', { cancelable: true, bubbles: true })) : handleRegister} 
            disabled={isPending} 
            variant="primary" 
            className="w-full py-4 text-base relative overflow-hidden group"
          >
            <span className="relative z-10 font-bold tracking-wide">
              {isPending 
                ? "Processing..." 
                : (!isLoggedIn && !showGuestForm) 
                  ? (requiresApproval ? "Apply as Guest →" : "Register as Guest →")
                  : requiresApproval 
                    ? "Submit Application" 
                    : isFree 
                      ? "Complete Registration" 
                      : "Proceed to Payment"}
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
