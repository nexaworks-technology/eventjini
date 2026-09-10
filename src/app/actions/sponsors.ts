"use server";

export type SponsorshipTier = {
  id: string;
  name: string;
  price: number;
  slotsTotal: number;
  slotsAvailable: number;
  benefits: string[];
};

export type SponsorAnalyticsData = {
  jobTitles: { name: string; value: number }[];
  companySizes: { name: string; value: number }[];
};

import { createClient } from "@/utils/supabase/server";
import { cookies } from "next/headers";

export async function getSponsorshipTiers(eventIdOrSlug: string): Promise<SponsorshipTier[]> {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  // Check if it's a UUID (eventId) or slug
  const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(eventIdOrSlug);
  
  let eventId = eventIdOrSlug;
  
  if (!isUuid) {
    const { data: event } = await supabase.from("events").select("id").eq("slug", eventIdOrSlug).single();
    if (!event) return [];
    eventId = event.id;
  }

  const { data, error } = await supabase
    .from("sponsorship_tiers")
    .select("*")
    .eq("event_id", eventId)
    .order("sort_order", { ascending: true });

  if (error || !data) return [];

  return data.map((d: any) => ({
    id: d.id,
    name: d.name,
    price: d.price_cents / 100, // converting cents back to dollars
    slotsTotal: d.max_slots || 0,
    slotsAvailable: (d.max_slots || 0) - (d.slots_filled || 0),
    benefits: d.benefits || [],
  }));
}

export async function createSponsorshipTier(eventId: string, data: Omit<SponsorshipTier, "id">): Promise<SponsorshipTier | null> {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  const { data: inserted, error } = await supabase
    .from("sponsorship_tiers")
    .insert({
      event_id: eventId,
      name: data.name,
      price_cents: data.price * 100, // converting dollars to cents
      max_slots: data.slotsTotal,
      benefits: data.benefits,
    })
    .select()
    .single();

  if (error || !inserted) return null;

  return {
    id: inserted.id,
    name: inserted.name,
    price: inserted.price_cents / 100,
    slotsTotal: inserted.max_slots || 0,
    slotsAvailable: (inserted.max_slots || 0) - (inserted.slots_filled || 0),
    benefits: inserted.benefits || [],
  };
}

export async function updateSponsorshipTier(id: string, data: Partial<Omit<SponsorshipTier, "id">>): Promise<SponsorshipTier | null> {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  const updatePayload: any = {};
  if (data.name !== undefined) updatePayload.name = data.name;
  if (data.price !== undefined) updatePayload.price_cents = data.price * 100;
  if (data.slotsTotal !== undefined) updatePayload.max_slots = data.slotsTotal;
  if (data.benefits !== undefined) updatePayload.benefits = data.benefits;

  const { data: updated, error } = await supabase
    .from("sponsorship_tiers")
    .update(updatePayload)
    .eq("id", id)
    .select()
    .single();

  if (error || !updated) return null;

  return {
    id: updated.id,
    name: updated.name,
    price: updated.price_cents / 100,
    slotsTotal: updated.max_slots || 0,
    slotsAvailable: (updated.max_slots || 0) - (updated.slots_filled || 0),
    benefits: updated.benefits || [],
  };
}

export async function getSponsorAnalytics(eventId: string): Promise<SponsorAnalyticsData> {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  // Fetch all registrations for the event with their profile data
  const { data: registrations, error } = await supabase
    .from('registrations')
    .select(`
      user_id,
      profiles:user_id (
        job_title,
        company_size
      )
    `)
    .eq('event_id', eventId)
    .neq('status', 'cancelled');

  if (error || !registrations) {
    return { jobTitles: [], companySizes: [] };
  }

  const jobTitleCounts: Record<string, number> = {};
  const companySizeCounts: Record<string, number> = {};

  registrations.forEach((reg: any) => {
    const jobTitle = reg.profiles?.job_title || "Unspecified";
    const companySize = reg.profiles?.company_size || "Unspecified";

    jobTitleCounts[jobTitle] = (jobTitleCounts[jobTitle] || 0) + 1;
    companySizeCounts[companySize] = (companySizeCounts[companySize] || 0) + 1;
  });

  const jobTitles = Object.entries(jobTitleCounts)
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value);

  const companySizes = Object.entries(companySizeCounts)
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value);

  // If there's no data at all yet, provide an empty state rather than fake data
  return {
    jobTitles,
    companySizes,
  };
}

import { revalidatePath } from "next/cache";

export async function captureSponsorLead(sponsorId: string, ticketCode: string) {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  // 1. Verify user is logged in
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { success: false, message: "Unauthorized" };

  // 2. Find the registration by ticket code
  const { data: registration, error: regError } = await supabase
    .from('registrations')
    .select(`
      id,
      guest_name,
      guest_company,
      guest_job_title,
      guest_college,
      guest_is_student,
      user:user_id (
        full_name
      )
    `)
    .eq('ticket_code', ticketCode)
    .single();

  if (regError || !registration) {
    return { success: false, message: "Invalid ticket code" };
  }

  // 3. Insert into sponsor_leads
  const { error: insertError } = await supabase
    .from('sponsor_leads')
    .insert({
      sponsor_id: sponsorId,
      registration_id: registration.id
    });

  if (insertError) {
    if (insertError.code === '23505') { // Unique violation
      return { success: false, message: "Lead already captured" };
    }
    console.error("Lead capture error:", insertError);
    return { success: false, message: "Failed to capture lead" };
  }

  revalidatePath(`/dashboard/sponsor/portal/${sponsorId}/leads`);

  const name = (registration.user as any)?.full_name || registration.guest_name || "Unknown";
  const company = registration.guest_is_student ? registration.guest_college : registration.guest_company || "-";
  const jobTitle = registration.guest_is_student ? "Student" : registration.guest_job_title || "-";

  return { 
    success: true, 
    message: "Lead captured successfully!",
    lead: { name, company, jobTitle, id: registration.id }
  };
}
