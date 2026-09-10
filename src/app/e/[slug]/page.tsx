import { getEventBySlug } from "@/app/actions/events";
import { incrementPageViews } from "@/app/actions/os";
import { notFound } from "next/navigation";
import { cookies } from "next/headers";
import { createClient } from "@/utils/supabase/server";
import EventRegistrationClient from "./registration-client";
import { MapPin, Calendar, Clock, Info, User } from "lucide-react";
import { FadeInUp, StaggerContainer } from "@/components/animations/motion";
import { Header } from "@/components/ui/header";
import Image from "next/image";

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

  // Increment real page views for analytics
  await incrementPageViews(event.id).catch(console.error);

  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);
  const { data: { user } } = await supabase.auth.getUser();

  // Assuming registeredCount isn't fully implemented in DB yet, using 0 for now.
  const registeredCount = 0;
  const isSoldOut = event.capacity ? registeredCount >= event.capacity : false;
  const isFree = !event.is_paid;
  const priceFormatted = event.ticket_price_cents ? (event.ticket_price_cents / 100).toFixed(2) : "0";

  return (
    <main className="min-h-screen bg-canvas text-white overflow-x-hidden selection:bg-brand-primary/30">
      <Header />
      
      {/* ── Massive Event Hero ── */}
      <div className="relative w-full h-[50vh] md:h-[70vh] max-h-[800px] min-h-[400px]">
        {event.banner_url ? (
          <Image 
            src={event.banner_url} 
            alt={event.title} 
            fill 
            className="object-cover" 
            priority
          />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-surface to-canvas" />
        )}
        
        {/* Gradients to blend image into canvas */}
        <div className="absolute inset-0 bg-canvas/30 mix-blend-multiply" />
        <div className="absolute inset-x-0 bottom-0 h-2/3 bg-gradient-to-t from-canvas via-canvas/80 to-transparent" />
      </div>

      <div className="max-w-6xl mx-auto px-6 -mt-32 md:-mt-48 relative z-10 pb-32">
        <StaggerContainer>
          
          {/* ── Title & Intro ── */}
          <FadeInUp className="mb-12 text-left max-w-3xl">
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold mb-6 text-white tracking-tighter leading-tight drop-shadow-2xl">
              {event.title}
            </h1>
            <div className="flex flex-wrap items-center gap-6 text-base md:text-lg text-white/90 drop-shadow-md">
              <div className="flex items-center gap-2">
                <Calendar className="w-5 h-5 text-brand-primary" />
                <span>{new Date(event.start_date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</span>
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="w-5 h-5 text-brand-secondary" />
                <span>{event.location_name || "Location TBA"}</span>
              </div>
            </div>
          </FadeInUp>

          {/* ── Grid Layout ── */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
            
            {/* Left Column: Editorial Details */}
            <FadeInUp className="lg:col-span-7 xl:col-span-8 space-y-12">
              
              {/* About Section */}
              <div className="space-y-6">
                <h3 className="text-xs font-semibold text-muted uppercase tracking-widest flex items-center gap-2">
                  <Info className="w-4 h-4 text-brand-primary" /> About
                </h3>
                <p className="text-lg text-white/80 leading-relaxed whitespace-pre-wrap font-medium">
                  {event.description}
                </p>
              </div>

              {/* Time Section */}
              <div className="space-y-6">
                <h3 className="text-xs font-semibold text-muted uppercase tracking-widest flex items-center gap-2">
                  <Clock className="w-4 h-4 text-brand-secondary" /> Schedule
                </h3>
                <div className="bg-surface border border-white/[0.04] rounded-2xl p-6">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                      <p className="text-sm text-muted mb-1">Starts</p>
                      <p className="text-lg font-medium text-white">
                        {new Date(event.start_date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                    <div className="hidden sm:block w-px h-10 bg-white/10" />
                    <div>
                      <p className="text-sm text-muted mb-1">Ends</p>
                      <p className="text-lg font-medium text-white">
                        {new Date(event.end_date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Organizer Section */}
              {event.organizer && (
                <div className="space-y-6">
                  <h3 className="text-xs font-semibold text-muted uppercase tracking-widest flex items-center gap-2">
                    <User className="w-4 h-4 text-event-wellness" /> Hosted By
                  </h3>
                  <div className="flex items-center gap-4">
                    {event.organizer.avatar_url ? (
                      <Image 
                        src={event.organizer.avatar_url} 
                        alt="Organizer" 
                        width={48} 
                        height={48} 
                        className="rounded-full bg-surface border border-white/10" 
                      />
                    ) : (
                      <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-brand-primary to-brand-secondary flex items-center justify-center text-white font-bold shrink-0">
                        {event.organizer.full_name?.[0] || "O"}
                      </div>
                    )}
                    <div>
                      <p className="text-base font-semibold text-white">{event.organizer.full_name}</p>
                      <p className="text-sm text-muted">Event Organizer</p>
                    </div>
                  </div>
                </div>
              )}
            </FadeInUp>

            {/* Right Column: Sticky Registration Card */}
            <FadeInUp delay={0.2} className="lg:col-span-5 xl:col-span-4 relative">
              <div className="sticky top-28">
                <EventRegistrationClient 
                  eventId={event.id}
                  isSoldOut={isSoldOut}
                  isFree={isFree}
                  price={parseFloat(priceFormatted)}
                  capacity={event.capacity || 100}
                  registeredCount={registeredCount}
                  isLoggedIn={!!user}
                  requireB2bData={event.require_b2b_data || false}
                />
              </div>
            </FadeInUp>
          </div>
        </StaggerContainer>
      </div>
    </main>
  );
}
