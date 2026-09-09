"use server";

import { createClient } from "@/utils/supabase/server";
import { cookies } from "next/headers";
import crypto from "crypto";
import { revalidatePath } from "next/cache";

export async function registerForEvent(eventId: string, jobTitle?: string, companySize?: string) {
  try {
    const cookieStore = await cookies();
    const supabase = createClient(cookieStore);
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return { error: "Unauthorized" };
    }

    // 0. Update the user's demographic info if provided
    if (jobTitle || companySize) {
      await supabase
        .from("profiles")
        .update({
          ...(jobTitle ? { job_title: jobTitle } : {}),
          ...(companySize ? { company_size: companySize } : {})
        })
        .eq("id", user.id);
    }

    // 1. Fetch event to see if it requires approval
    const { data: event, error: eventError } = await supabase
      .from("events")
      .select("requires_approval")
      .eq("id", eventId)
      .single();

    if (eventError || !event) {
      return { error: "Event not found" };
    }

    // 2. Check if user is already registered for this event
    const { data: existingReg } = await supabase
      .from("registrations")
      .select("ticket_code")
      .eq("event_id", eventId)
      .eq("user_id", user.id)
      .single();

    if (existingReg) {
      // If already registered, just return their existing ticket code so they get redirected to it!
      return { data: { ticket_code: existingReg.ticket_code } };
    }

    // 3. Generate a unique ticket code
    const ticketCode = crypto.randomBytes(4).toString("hex").toUpperCase();

    // 4. Create the registration
    const status = event.requires_approval ? "pending" : "approved";

    const { data: registration, error: regError } = await supabase
      .from("registrations")
      .insert([
        {
          event_id: eventId,
          user_id: user.id,
          status,
          ticket_code: ticketCode,
        },
      ])
      .select()
      .single();

    if (regError) {
      console.error("Error creating registration:", regError);
      return { error: regError.message };
    }

    revalidatePath("/dashboard/tickets");
    return { data: { ticket_code: registration.ticket_code } };
  } catch (err: any) {
    console.error("Error in registerForEvent:", err);
    return { error: err?.message || "An unexpected error occurred" };
  }
}

export async function getTicketByCode(code: string) {
  try {
    const cookieStore = await cookies();
    const supabase = createClient(cookieStore);

    const { data, error } = await supabase
      .from("registrations")
      .select(`
        *,
        event:events(*),
        user:profiles(*)
      `)
      .eq("ticket_code", code)
      .single();

    if (error) {
      return { error: error.message };
    }

    return { data };
  } catch (err: any) {
    return { error: err?.message || "An unexpected error occurred" };
  }
}

export async function getMyTickets() {
  try {
    const cookieStore = await cookies();
    const supabase = createClient(cookieStore);
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return { error: "Unauthorized" };
    }

    const { data, error } = await supabase
      .from("registrations")
      .select(`
        *,
        event:events(*)
      `)
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    if (error) {
      return { error: error.message };
    }

    return { data };
  } catch (err: any) {
    return { error: err?.message || "An unexpected error occurred" };
  }
}
