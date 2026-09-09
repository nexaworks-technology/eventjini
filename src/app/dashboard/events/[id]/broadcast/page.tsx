"use client";

import { useState } from "react";
import { use } from "react";
import { GlassCard } from "@/components/ui/glass-card";
import { Button } from "@/components/ui/button";
import { FadeInUp } from "@/components/animations/motion";
import { toast } from "sonner";
import { Send, Users, Type, AlignLeft } from "lucide-react";
import { sendBroadcast } from "@/app/actions/broadcast";

export default function BroadcastPage({ params }: { params: Promise<{ id: string }> }) {
  const unwrappedParams = use(params);
  const eventId = unwrappedParams.id;

  const [recipient, setRecipient] = useState("all");
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [isSending, setIsSending] = useState(false);

  const handleSend = async () => {
    if (!subject || !body) {
      toast.error("Please fill in all fields");
      return;
    }
    
    setIsSending(true);
    
    const response = await sendBroadcast(eventId, recipient, subject, body);
    
    setIsSending(false);
    
    if (response.error) {
      toast.error(response.error);
    } else {
      toast.success(`Broadcast sent successfully to ${response.count} attendees!`);
      setSubject("");
      setBody("");
    }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      <FadeInUp>
        <h1 className="text-3xl font-bold tracking-tight text-white mb-2">Broadcast</h1>
        <p className="text-white/60">Send email updates to your attendees.</p>
      </FadeInUp>

      <FadeInUp delay={0.1}>
        <GlassCard className="p-8 space-y-6">
          {/* To Field */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-white/80 flex items-center gap-2">
              <Users className="w-4 h-4 text-cyan-500" />
              To
            </label>
            <div className="relative">
              <select
                value={recipient}
                onChange={(e) => setRecipient(e.target.value)}
                className="w-full appearance-none bg-[#0a0a0a]/50 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500/50 transition-all cursor-pointer"
              >
                <option value="all">All Approved Attendees</option>
                <option value="pending">Pending Approvals</option>
                <option value="vip">VIP Guests</option>
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-white/50">
                <svg className="h-4 w-4 fill-current" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                  <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
                </svg>
              </div>
            </div>
          </div>

          {/* Subject Field */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-white/80 flex items-center gap-2">
              <Type className="w-4 h-4 text-purple-500" />
              Subject
            </label>
            <input
              type="text"
              placeholder="e.g. Important Update Regarding the Venue"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              className="w-full bg-[#0a0a0a]/50 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50 transition-all"
            />
          </div>

          {/* Body Field */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-white/80 flex items-center gap-2">
              <AlignLeft className="w-4 h-4 text-emerald-500" />
              Message Body
            </label>
            <textarea
              rows={8}
              placeholder="Type your message here..."
              value={body}
              onChange={(e) => setBody(e.target.value)}
              className="w-full bg-[#0a0a0a]/50 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500/50 transition-all resize-none"
            />
          </div>

          <div className="pt-4 flex justify-end">
            <Button
              variant="primary"
              size="lg"
              disabled={isSending}
              onClick={handleSend}
              className="px-8"
            >
              <Send className={`w-4 h-4 mr-2 ${isSending ? 'animate-pulse' : ''}`} />
              {isSending ? "Sending..." : "Send Broadcast"}
            </Button>
          </div>
        </GlassCard>
      </FadeInUp>
    </div>
  );
}
