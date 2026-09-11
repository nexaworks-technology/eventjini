"use server";
import { createClient } from "@/utils/supabase/server";
import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";

export async function getCustomFields(eventId: string) {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  const { data, error } = await supabase
    .from("event_custom_fields")
    .select("*")
    .eq("event_id", eventId)
    .order("order_index", { ascending: true });

  if (error) {
    console.error("Error fetching custom fields:", error);
    return [];
  }
  return data;
}

export async function addCustomField(eventId: string, payload: any) {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  const { error } = await supabase
    .from("event_custom_fields")
    .insert([{ ...payload, event_id: eventId }]);

  if (error) return { error: error.message };

  revalidatePath(`/dashboard/organizer/events/[id]/settings`, 'page');
  return { success: true };
}

export async function deleteCustomField(fieldId: string) {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  const { error } = await supabase
    .from("event_custom_fields")
    .delete()
    .eq("id", fieldId);

  if (error) return { error: error.message };

  revalidatePath(`/dashboard/organizer/events/[id]/settings`, 'page');
  return { success: true };
}
