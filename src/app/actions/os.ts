"use server";

import { createClient } from "@/utils/supabase/server";
import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";

export async function getEventStats(eventId: string) {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);
  
  // Get event details (price and page views)
  const { data: event } = await supabase
    .from('events')
    .select('ticket_price_cents, page_views')
    .eq('id', eventId)
    .single();

  // Get active registrations count
  const { count: registrationsCount } = await supabase
    .from('registrations')
    .select('*', { count: 'exact', head: true })
    .eq('event_id', eventId)
    .neq('status', 'cancelled');
    
  // Get checkins count
  const { count: checkInsCount } = await supabase
    .from('registrations')
    .select('*', { count: 'exact', head: true })
    .eq('event_id', eventId)
    .eq('status', 'checked_in');

  const count = registrationsCount || 0;
  const checkIns = checkInsCount || 0;
  const price = (event?.ticket_price_cents || 0) / 100;

  // Basic mock trend for now since we don't have daily timeseries in DB yet
  const trend = [
    { date: "Mon", registrations: Math.floor(count * 0.1) },
    { date: "Tue", registrations: Math.floor(count * 0.15) },
    { date: "Wed", registrations: Math.floor(count * 0.2) },
    { date: "Thu", registrations: Math.floor(count * 0.3) },
    { date: "Fri", registrations: Math.floor(count * 0.5) },
    { date: "Sat", registrations: Math.floor(count * 0.8) },
    { date: "Sun", registrations: count },
  ];

  const { data: trackingLinks } = await supabase
    .from('tracking_links')
    .select(`
      id,
      utm_source,
      utm_medium,
      utm_campaign,
      clicks,
      registrations:registrations(count)
    `)
    .eq('event_id', eventId);

  const formattedTracking = (trackingLinks || []).map((link: any) => ({
    id: link.id,
    source: link.utm_source,
    medium: link.utm_medium || "-",
    campaign: link.utm_campaign || "-",
    clicks: link.clicks,
    conversions: link.registrations?.[0]?.count || 0,
  }));

  return {
    registrationsCount: count,
    checkInsCount: checkIns,
    revenue: count * price,
    pageViews: event?.page_views || 0,
    trend,
    trackingLinks: formattedTracking,
  };
}

export async function getGuests(eventId: string) {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);
  
  const { data: guests, error } = await supabase
    .from('registrations')
    .select(`
      *,
      user:user_id (
        id,
        full_name,
        email,
        avatar_url
      )
    `)
    .eq('event_id', eventId)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching guests:', error);
    return [];
  }

  return guests;
}

export async function updateGuestStatus(registrationId: string, newStatus: string) {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);
  
  const { error } = await supabase
    .from('registrations')
    .update({ 
      approval_status: newStatus,
      status: newStatus 
    })
    .eq('id', registrationId);

  if (error) {
    console.error('Error updating guest status:', error);
    return { error: error.message };
  }
  
  revalidatePath('/dashboard/organizer/events/[id]/guests');
  return { success: true };
}

export async function updateRegistrationSettings(eventId: string, requireB2b: boolean, requireApproval: boolean) {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);
  
  const { error } = await supabase
    .from('events')
    .update({ 
      require_b2b_data: requireB2b,
      requires_approval: requireApproval 
    })
    .eq('id', eventId);

  if (error) {
    return { error: error.message };
  }
  
  revalidatePath('/dashboard/organizer/events/[id]/guests');
  revalidatePath('/e/[slug]', 'page');
  return { success: true };
}

export async function getTasks(eventId: string) {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);
  
  const { data: tasks, error } = await supabase
    .from('tasks')
    .select('*')
    .eq('event_id', eventId)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching tasks:', error);
    return [];
  }

  return tasks;
}

export async function createTask(data: { event_id: string; title: string; description?: string; assigned_to?: string; due_date?: string; status?: string }) {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);
  
  const { data: task, error } = await supabase
    .from('tasks')
    .insert([{ ...data, status: data.status || 'todo' }])
    .select()
    .single();

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath('/dashboard/organizer/events/[id]/tasks', 'page');
  return task;
}

export async function updateTaskStatus(taskId: string, status: string) {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);
  
  const { error } = await supabase
    .from('tasks')
    .update({ status })
    .eq('id', taskId);

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath('/dashboard/organizer/events/[id]/tasks', 'page');
  return { success: true };
}

export async function getBudgets(eventId: string) {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);
  
  const { data: budgets, error } = await supabase
    .from('budget_items')
    .select('*')
    .eq('event_id', eventId)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching budgets:', error);
    return [];
  }

  return budgets;
}

export async function checkInGuest(eventId: string, ticketCode: string) {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);
  
  // Find the registration by ticket_code
  const { data: registration, error: fetchError } = await supabase
    .from('registrations')
    .select(`
      id, 
      status, 
      event_id,
      user:user_id (
        full_name
      )
    `)
    .eq('ticket_code', ticketCode)
    .single();

  if (fetchError || !registration) {
    return { success: false, message: 'Invalid ticket code' };
  }

  // ENFORCE EVENT MATCHING
  if (registration.event_id !== eventId) {
    return { success: false, message: 'Invalid ticket for this specific event!' };
  }

  if (registration.status === 'checked_in') {
    // @ts-ignore
    return { success: false, message: `${registration.user?.full_name || 'Attendee'} is already checked in!` };
  }

  // Update status to checked_in
  const { error: updateError } = await supabase
    .from('registrations')
    .update({ status: 'checked_in', checked_in_at: new Date().toISOString() })
    .eq('id', registration.id);

  if (updateError) {
    return { success: false, message: 'Failed to update check-in status' };
  }

  // @ts-ignore
  return { success: true, message: `${registration.user?.full_name || 'Attendee'} checked in successfully!` };
}

export async function incrementPageViews(eventId: string) {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);
  
  await supabase.rpc('increment_page_views', { p_event_id: eventId });
}

export async function updateEventDetails(eventId: string, formData: FormData) {
  try {
    const cookieStore = await cookies();
    const supabase = createClient(cookieStore);

    const title = formData.get("title")?.toString();
    const description = formData.get("description")?.toString();
    const start_date = formData.get("start_date")?.toString();
    const end_date = formData.get("end_date")?.toString();
    const location_name = formData.get("location_name")?.toString();
    const banner_url = formData.get("banner_url")?.toString() || null;
    const capacityStr = formData.get("capacity")?.toString();
    
    if (!title || !start_date || !end_date) {
      return { error: "Missing required fields" };
    }

    const capacity = capacityStr ? parseInt(capacityStr, 10) : null;

    const { error } = await supabase
      .from("events")
      .update({
        title,
        description,
        start_date,
        end_date,
        location_name,
        capacity,
        banner_url,
      })
      .eq("id", eventId);

    if (error) {
      return { error: error.message };
    }

    revalidatePath(`/dashboard/organizer/events/${eventId}/settings`);
    revalidatePath(`/e/[slug]`, 'page'); // Can't easily know slug here, but it's fine
    return { success: true };
  } catch (err: any) {
    return { error: err?.message || "An unexpected error occurred" };
  }
}
