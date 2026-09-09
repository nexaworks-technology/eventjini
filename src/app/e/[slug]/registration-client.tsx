"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { registerForEvent } from "@/app/actions/registrations";
import { Button } from "@/components/ui/button";
import { GlassCard } from "@/components/ui/glass-card";
import { Ticket, Users, AlertCircle } from "lucide-react";
import { motion } from "framer-motion";

interface EventRegistrationClientProps {
  eventId: string;
  isSoldOut: boolean;
  isFree: boolean;
  price: number;
  capacity: number;
  registeredCount: number;
}

export default function EventRegistrationClient({
  eventId,
  isSoldOut,
  isFree,
  price,
  capacity,
  registeredCount,
}: EventRegistrationClientProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const handleRegister = () => {
    setError(null);
    startTransition(async () => {
      const res = await registerForEvent(eventId);
      if (res.error) {
        setError(res.error);
      } else if (res.data?.ticket_code) {
        // Since we are on /e/[slug], we can construct the URL
        const currentPath = window.location.pathname;
        router.push(`${currentPath}/ticket?code=${res.data.ticket_code}`);
      }
    });
  };

  const spotsLeft = capacity - registeredCount;
  const showUrgency = spotsLeft > 0 && spotsLeft <= 20;

  return (
    <GlassCard hoverGlow className="sticky top-24 flex flex-col items-center text-center p-8">
      <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-cyan-500/20 to-purple-500/20 flex items-center justify-center mb-6 shadow-inner border border-white/5">
        <Ticket className="w-8 h-8 text-cyan-400" />
      </div>
      
      <h3 className="text-2xl font-bold text-white mb-2">
        {isFree ? "Free Registration" : `$${price} USD`}
      </h3>
      
      <div className="flex items-center gap-2 text-slate-400 mb-8 text-sm">
        <Users className="w-4 h-4" />
        <span>{registeredCount} / {capacity} Attending</span>
      </div>

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
            {isPending ? "Processing..." : isFree ? "Register Now" : "Get Tickets"}
          </span>
          <div className="absolute inset-0 bg-gradient-to-r from-purple-500 to-cyan-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        </Button>
      )}
      
      <p className="text-xs text-slate-500 mt-6">
        Secure checkout provided by EventJini. By registering, you agree to our Terms of Service.
      </p>
    </GlassCard>
  );
}
