import { getTicketByCode } from "@/app/actions/registrations";
import { notFound } from "next/navigation";
import { QRCodeSVG } from "qrcode.react";
import { FadeInUp } from "@/components/animations/motion";
import { Calendar, MapPin, CheckCircle2, User, Clock } from "lucide-react";
import { AddToCalendar } from "@/components/ui/add-to-calendar";
import { ClaimPaymentButton } from "./claim-payment-button";

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
    <main className="min-h-screen bg-canvas text-slate-200 flex flex-col items-center justify-center py-12 px-4">
      
      <FadeInUp className="w-full max-w-md relative z-10">
        {/* Page Header */}
        <div className="text-center mb-8">
          <p className="text-xs font-semibold text-brand-primary uppercase tracking-widest mb-2">Digital Pass</p>
          <h1 className="text-2xl font-bold text-white tracking-tight">
            {ticket.event?.title || "Event Ticket"}
          </h1>
        </div>

        {/* Ticket Container */}
        <div className="rounded-3xl overflow-hidden border border-white/[0.06] bg-surface shadow-2xl">
          
          {/* ── Top: Event Details (Dark) ── */}
          <div className="p-8 space-y-6">
            {/* Status Badge */}
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span className="text-sm font-medium text-emerald-400 capitalize">{ticket.status}</span>
            </div>

            {/* Details Grid */}
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <User className="w-4 h-4 text-brand-secondary mt-1 shrink-0" />
                <div>
                  <p className="text-[11px] text-muted/50 uppercase tracking-widest mb-0.5">Attendee</p>
                  <p className="text-sm font-medium text-white">{ticket.user?.full_name || ticket.user?.email || "Attendee"}</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Calendar className="w-4 h-4 text-brand-primary mt-1 shrink-0" />
                <div>
                  <p className="text-[11px] text-muted/50 uppercase tracking-widest mb-0.5">Date & Time</p>
                  <p className="text-sm font-medium text-white">
                    {ticket.event?.start_date 
                      ? new Date(ticket.event.start_date).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' }) 
                      : "TBA"}
                  </p>
                  <p className="text-xs text-muted">
                    {ticket.event?.start_date 
                      ? new Date(ticket.event.start_date).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' }) 
                      : ""}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <MapPin className="w-4 h-4 text-brand-secondary mt-1 shrink-0" />
                <div>
                  <p className="text-[11px] text-muted/50 uppercase tracking-widest mb-0.5">Location</p>
                  <p className="text-sm font-medium text-white">{ticket.event?.location_name || "TBA"}</p>
                </div>
              </div>
            </div>
          </div>

          {/* ── Dashed Divider with Cutouts ── */}
          <div className="relative">
            <div className="border-t border-dashed border-white/[0.08]" />
            <div className="absolute -top-4 -left-4 w-8 h-8 rounded-full bg-canvas" />
            <div className="absolute -top-4 -right-4 w-8 h-8 rounded-full bg-canvas" />
          </div>

          {/* ── Bottom: QR Code or Pending Message ── */}
          <div className="bg-white p-8 flex flex-col items-center min-h-[300px] justify-center">
            {ticket.status === 'pending' ? (
              <div className="text-center space-y-4 max-w-xs">
                <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-2">
                  <Clock className="w-8 h-8 text-amber-500" />
                </div>
                <h3 className="text-xl font-bold text-slate-900">Application Under Review</h3>
                <p className="text-sm text-slate-500">
                  The organizer is reviewing your application. You will be notified by email once approved.
                </p>
                <p className="font-mono text-xs tracking-[0.2em] text-gray-400 mt-6 uppercase">
                  REF: {ticket.ticket_code}
                </p>
              </div>
            ) : ticket.status === 'approved' && ticket.payment_status === 'unpaid' && ticket.event?.is_paid ? (
              <ClaimPaymentButton 
                eventId={ticket.event.id}
                ticketCode={ticket.ticket_code}
                priceCents={ticket.event.ticket_price_cents}
              />
            ) : (
              <>
                <QRCodeSVG
                  value={ticket.ticket_code}
                  size={220}
                  level="H"
                  includeMargin={false}
                  fgColor="#000000"
                  bgColor="#ffffff"
                />
                <p className="font-mono text-sm tracking-[0.25em] text-gray-500 mt-5 uppercase">
                  {ticket.ticket_code}
                </p>
                <p className="text-[11px] text-gray-400 mt-1">
                  Scan this at the entrance
                </p>
              </>
            )}
          </div>
        </div>

        {/* Calendar Button — Below the Ticket */}
        {ticket.event && ticket.status !== 'pending' && ticket.payment_status !== 'unpaid' && (
          <FadeInUp delay={0.2} className="mt-6">
            <AddToCalendar event={ticket.event} />
          </FadeInUp>
        )}
      </FadeInUp>
    </main>
  );
}
