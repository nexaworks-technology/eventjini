import { getTicketByCode } from "@/app/actions/registrations";
import { notFound } from "next/navigation";
import { QRCodeSVG } from "qrcode.react";
import { FadeInUp } from "@/components/animations/motion";
import { Calendar, MapPin, CheckCircle2, Ticket as TicketIcon } from "lucide-react";
import { GlassCard } from "@/components/ui/glass-card";
import { AddToCalendar } from "@/components/ui/add-to-calendar";

interface TicketPageProps {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ code?: string }>;
}

export default async function TicketPage({ params, searchParams }: TicketPageProps) {
  const resolvedSearchParams = await searchParams;
  const code = resolvedSearchParams.code;

  if (!code) {
    notFound();
  }

  const { data: ticket, error } = await getTicketByCode(code);

  if (error || !ticket) {
    notFound();
  }

  return (
    <main className="min-h-screen bg-[#050505] text-slate-200 overflow-hidden relative flex flex-col items-center justify-center py-20 px-4">
      {/* Background Neon Elements */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] opacity-20 pointer-events-none blur-[150px] bg-gradient-to-tr from-cyan-500/50 via-purple-500/30 to-transparent mix-blend-screen rounded-full" />
      
      <FadeInUp className="w-full max-w-md relative z-10">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-white to-slate-400 mb-2">
            Your Digital Ticket
          </h1>
          <p className="text-slate-400">Present this QR code at the entrance</p>
        </div>

        {/* Ticket Container */}
        <div className="relative group">
          {/* Subtle Glow Behind Ticket */}
          <div className="absolute -inset-1 bg-gradient-to-r from-cyan-500 to-purple-500 rounded-[2rem] blur opacity-20 group-hover:opacity-40 transition duration-1000 group-hover:duration-200" />
          
          <GlassCard 
            hoverGlow 
            className="relative p-0 overflow-hidden rounded-[2rem]"
          >
            {/* Top Section: QR Code */}
            <div className="relative p-8 flex flex-col items-center justify-center bg-black/40 border-b border-dashed border-white/10">
              {/* Cutouts for ticket effect */}
              <div className="absolute -bottom-4 -left-4 w-8 h-8 rounded-full bg-[#050505] shadow-inner" />
              <div className="absolute -bottom-4 -right-4 w-8 h-8 rounded-full bg-[#050505] shadow-inner" />

              <div className="relative p-4 rounded-2xl bg-white mb-2 shadow-[0_0_40px_-10px_rgba(6,182,212,0.5)]">
                <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/20 to-purple-500/20 blur-xl -z-10" />
                <QRCodeSVG
                  value={ticket.ticket_code}
                  size={200}
                  level="H"
                  includeMargin={false}
                  className="rounded-lg"
                  fgColor="#000000"
                  bgColor="#ffffff"
                />
              </div>
              <p className="font-mono text-sm tracking-widest text-slate-400 mt-4 uppercase">
                {ticket.ticket_code}
              </p>
            </div>

            {/* Bottom Section: Details */}
            <div className="p-8 bg-gradient-to-b from-transparent to-white/[0.02]">
              <div className="space-y-6">
                <div>
                  <h2 className="text-2xl font-bold text-white mb-1 leading-tight">
                    {ticket.event?.title || "Event"}
                  </h2>
                  <div className="flex items-center gap-2 text-cyan-400">
                    <CheckCircle2 className="w-4 h-4" />
                    <span className="text-sm font-medium capitalize">{ticket.status} Registration</span>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <TicketIcon className="w-5 h-5 text-purple-400 mt-0.5" />
                    <div>
                      <p className="text-xs text-slate-500 uppercase tracking-wider mb-0.5">Attendee</p>
                      <p className="font-medium text-slate-200">{ticket.user?.full_name || ticket.user?.email || "Attendee"}</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <Calendar className="w-5 h-5 text-cyan-400 mt-0.5" />
                    <div>
                      <p className="text-xs text-slate-500 uppercase tracking-wider mb-0.5">Date & Time</p>
                      <p className="font-medium text-slate-200">{ticket.event?.start_date ? new Date(ticket.event.start_date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }) : "TBA"}</p>
                      <p className="text-sm text-slate-400">{ticket.event?.start_date ? new Date(ticket.event.start_date).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' }) : ""}</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 mb-4">
                    <MapPin className="w-5 h-5 text-purple-400 mt-0.5" />
                    <div>
                      <p className="text-xs text-slate-500 uppercase tracking-wider mb-0.5">Location</p>
                      <p className="font-medium text-slate-200">{ticket.event?.location_name || "TBA"}</p>
                    </div>
                  </div>
                  
                  {ticket.event && (
                    <div className="pt-4 border-t border-white/5">
                      <AddToCalendar event={ticket.event} />
                    </div>
                  )}
                </div>
              </div>
            </div>
          </GlassCard>
        </div>
      </FadeInUp>
    </main>
  );
}

