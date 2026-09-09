import { getEventBySlug } from "@/app/actions/events";
import { notFound } from "next/navigation";
import EventRegistrationClient from "./registration-client";
import { MapPin, Calendar, Clock, Info } from "lucide-react";
import { FadeInUp, StaggerContainer, staggerChildVariants } from "@/components/animations/motion";

interface EventPageProps {
  params: Promise<{ slug: string }>;
}

export default async function EventPage({ params }: EventPageProps) {
  const resolvedParams = await params;
  const slug = resolvedParams.slug;
  const { data: event, error } = await getEventBySlug(slug);

  if (error || !event) {
    notFound();
  }

  // Assuming registeredCount isn't fully implemented in DB yet, using 0 for now.
  const registeredCount = 0;
  const isSoldOut = event.capacity ? registeredCount >= event.capacity : false;
  const isFree = !event.is_paid;
  const priceFormatted = event.ticket_price_cents ? (event.ticket_price_cents / 100).toFixed(2) : "0";

  return (
    <main className="min-h-screen bg-[#050505] text-slate-200 overflow-hidden relative selection:bg-cyan-500/30">
      {/* Abstract Background Elements */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[600px] opacity-20 pointer-events-none blur-[120px] bg-gradient-to-br from-cyan-500/40 via-purple-500/20 to-transparent mix-blend-screen rounded-full" />
      <div className="absolute bottom-0 right-0 w-[600px] h-[600px] opacity-10 pointer-events-none blur-[100px] bg-gradient-to-tl from-purple-500/40 via-cyan-500/20 to-transparent mix-blend-screen rounded-full" />

      <div className="max-w-5xl mx-auto px-6 py-20 relative z-10">
        <StaggerContainer>
          {/* Hero Section */}
          <FadeInUp className="mb-12 text-center md:text-left">
            <h1 className="text-4xl md:text-6xl font-bold mb-6 text-transparent bg-clip-text bg-gradient-to-r from-white via-cyan-100 to-cyan-500 tracking-tight">
              {event.title}
            </h1>
            <p className="text-lg md:text-xl text-slate-400 max-w-3xl leading-relaxed">
              {event.description}
            </p>
          </FadeInUp>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Event Details */}
            <FadeInUp className="lg:col-span-2 space-y-6">
              <div 
                className="rounded-2xl p-8 space-y-8"
                style={{
                  background: "rgba(255,255,255,0.02)",
                  backdropFilter: "blur(24px)",
                  WebkitBackdropFilter: "blur(24px)",
                  border: "1px solid rgba(255,255,255,0.05)",
                }}
              >
                <h3 className="text-xl font-semibold text-white flex items-center gap-2">
                  <Info className="w-5 h-5 text-cyan-400" />
                  Event Information
                </h3>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-full bg-cyan-500/10 flex items-center justify-center border border-cyan-500/20 shrink-0">
                      <Calendar className="w-5 h-5 text-cyan-400" />
                    </div>
                    <div>
                      <p className="text-sm text-slate-400 mb-1">Date</p>
                      <p className="font-medium text-slate-200">
                        {new Date(event.start_date).toLocaleDateString()}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-full bg-purple-500/10 flex items-center justify-center border border-purple-500/20 shrink-0">
                      <Clock className="w-5 h-5 text-purple-400" />
                    </div>
                    <div>
                      <p className="text-sm text-slate-400 mb-1">Time</p>
                      <p className="font-medium text-slate-200">
                        {new Date(event.start_date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - {new Date(event.end_date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4 sm:col-span-2">
                    <div className="w-10 h-10 rounded-full bg-cyan-500/10 flex items-center justify-center border border-cyan-500/20 shrink-0">
                      <MapPin className="w-5 h-5 text-cyan-400" />
                    </div>
                    <div>
                      <p className="text-sm text-slate-400 mb-1">Location</p>
                      <p className="font-medium text-slate-200">{event.location_name}</p>
                    </div>
                  </div>
                </div>
              </div>
            </FadeInUp>

            {/* Registration Card */}
            <FadeInUp delay={0.2} className="lg:col-span-1">
              <EventRegistrationClient 
                eventId={event.id}
                isSoldOut={isSoldOut}
                isFree={isFree}
                price={parseFloat(priceFormatted)}
                capacity={event.capacity || 100}
                registeredCount={registeredCount}
              />
            </FadeInUp>
          </div>
        </StaggerContainer>

      </div>
    </main>
  );
}
