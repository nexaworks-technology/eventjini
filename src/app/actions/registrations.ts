"use server";

import { createClient } from "@/utils/supabase/server";
import { cookies } from "next/headers";
import crypto from "crypto";
import { revalidatePath } from "next/cache";

export async function registerForEvent(
  eventId: string, 
  guestData?: {
    email?: string;
    name?: string;
    company?: string;
    jobTitle?: string;
    isStudent?: boolean;
    college?: string;
    trackingLinkId?: string;
  }
) {
  try {
    const cookieStore = await cookies();
    const supabase = createClient(cookieStore);
    const { data: { user } } = await supabase.auth.getUser();

    // 1. Fetch event to see if it requires approval or B2B data
    const { data: event, error: eventError } = await supabase
      .from("events")
      .select("requires_approval, require_b2b_data, is_paid")
      .eq("id", eventId)
      .single();

    if (eventError || !event) {
      return { error: "Event not found" };
    }

    // 2. Check if user/email is already registered
    let existingRegQuery = supabase.from("registrations").select("ticket_code").eq("event_id", eventId);
    
    if (user) {
      existingRegQuery = existingRegQuery.eq("user_id", user.id);
    } else if (guestData?.email) {
      existingRegQuery = existingRegQuery.eq("guest_email", guestData.email);
    } else {
      return { error: "Email or authentication is required." };
    }

    const { data: existingReg } = await existingRegQuery.single();

    if (existingReg) {
      return { data: { ticket_code: existingReg.ticket_code } };
    }

    // 3. Generate a unique ticket code
    const ticketCode = crypto.randomBytes(4).toString("hex").toUpperCase();
    const status = event.requires_approval ? "pending" : "approved";
    
    // Determine payment_status
    let payment_status = "paid"; // default to paid (for free events or auto-approved paid events that just ran razorpay)
    if (event.is_paid && event.requires_approval) {
      payment_status = "unpaid";
    }

    // 4. Create the registration payload
    const payload: any = {
      event_id: eventId,
      status,
      approval_status: event.requires_approval ? 'pending' : 'auto_approved',
      ticket_code: ticketCode,
      payment_status,
    };

    if (user) {
      payload.user_id = user.id;
    }
    
    if (guestData?.trackingLinkId) {
      payload.tracking_link_id = guestData.trackingLinkId;
    }
    
    if (guestData) {
      payload.guest_email = guestData.email;
      payload.guest_name = guestData.name;
      payload.guest_company = guestData.company;
      payload.guest_job_title = guestData.jobTitle;
      payload.guest_is_student = guestData.isStudent;
      payload.guest_college = guestData.college;
    }

    const { data: registration, error: regError } = await supabase
      .from("registrations")
      .insert([payload])
      .select()
      .single();

    if (regError) {
      console.error("Error creating registration:", regError);
      return { error: regError.message };
    }

    revalidatePath("/my-tickets");
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
