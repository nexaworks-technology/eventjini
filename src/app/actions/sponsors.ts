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

export async function getSponsorAnalytics(_eventId: string): Promise<SponsorAnalyticsData> {
  await new Promise((resolve) => setTimeout(resolve, 500));
  return {
    jobTitles: [
      { name: "C-Level", value: 400 },
      { name: "VP/Director", value: 300 },
      { name: "Manager", value: 300 },
      { name: "Individual Contributor", value: 200 },
    ],
    companySizes: [
      { name: "1-50", value: 100 },
      { name: "51-200", value: 250 },
      { name: "201-1000", value: 450 },
      { name: "1000+", value: 400 },
    ],
  };
}
