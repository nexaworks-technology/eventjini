"use server";

import { createClient } from "@/utils/supabase/server";
import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";

export async function getVendors(eventId: string) {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  const { data: vendors, error } = await supabase
    .from("event_vendors")
    .select("*")
    .eq("event_id", eventId)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching vendors:", error);
    return [];
  }

  return vendors;
}

export async function createVendor(
  eventId: string,
  payload: {
    name: string;
    category: string;
    status: string;
    contact_name?: string;
    contact_email?: string;
    contact_phone?: string;
    budget_allocated_cents?: number;
    payment_status?: string;
    notes?: string;
  }
) {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  const { error } = await supabase
    .from("event_vendors")
    .insert([{ ...payload, event_id: eventId }]);

  if (error) {
    console.error("Error creating vendor:", error);
    return { error: error.message };
  }

  revalidatePath(`/dashboard/organizer/events/[id]/vendors`, 'page');
  return { success: true };
}

export async function updateVendor(
  vendorId: string,
  eventId: string, // for revalidation
  payload: any
) {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  const { error } = await supabase
    .from("event_vendors")
    .update({ ...payload, updated_at: new Date().toISOString() })
    .eq("id", vendorId);

  if (error) {
    console.error("Error updating vendor:", error);
    return { error: error.message };
  }

  revalidatePath(`/dashboard/organizer/events/[id]/vendors`, 'page');
  return { success: true };
}

export async function deleteVendor(vendorId: string, eventId: string) {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  const { error } = await supabase
    .from("event_vendors")
    .delete()
    .eq("id", vendorId);

  if (error) {
    console.error("Error deleting vendor:", error);
    return { error: error.message };
  }

  revalidatePath(`/dashboard/organizer/events/[id]/vendors`, 'page');
  return { success: true };
}
