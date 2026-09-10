import { getGuests } from "@/app/actions/os";
import GuestsClient from "./guests-client";
import { createClient } from "@/utils/supabase/server";
import { cookies } from "next/headers";

interface GuestsPageProps {
  params: Promise<{ id: string }>;
}

export default async function GuestsPage({ params }: GuestsPageProps) {
  const resolvedParams = await params;
  const eventId = resolvedParams.id;
  const rawGuests = await getGuests(eventId);

  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);
  const { data: event } = await supabase
    .from('events')
    .select('require_b2b_data, requires_approval')
    .eq('id', eventId)
    .single();

  const mappedGuests = rawGuests.map((g: any) => ({
    id: g.id,
    name: g.user?.full_name || g.guest_name || "Unknown",
    email: g.user?.email || g.guest_email || "No email",
    ticketCode: g.ticket_code,
    status: (g.approval_status || 'auto_approved').charAt(0).toUpperCase() + (g.approval_status || 'auto_approved').slice(1),
    company: g.guest_company || "-",
    jobTitle: g.guest_job_title || "-",
    college: g.guest_college || "-",
    isStudent: !!g.guest_is_student,
    isGuest: !g.user_id,
  }));

  return (
    <div className="flex-1 p-8 overflow-y-auto w-full">
      <h1 className="text-3xl font-bold mb-6 text-white tracking-tight">Guests Management</h1>
      <GuestsClient 
        eventId={eventId}
        initialGuests={mappedGuests} 
        requireB2bData={event?.require_b2b_data || false}
        requireApproval={event?.requires_approval || false}
      />
    </div>
  );
}
