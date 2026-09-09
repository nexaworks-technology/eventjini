"use server";

import { createClient } from "@/utils/supabase/server";
import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";

export async function getEventStats(eventId: string) {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);
  
  // Try to get actual registrations count
  const { count: registrationsCount } = await supabase
    .from('registrations')
    .select('*', { count: 'exact', head: true })
    .eq('event_id', eventId);

  // Return real counts when available and mock the rest for the dashboard UI
  return {
    registrationsCount: registrationsCount || 0,
    revenue: 12500, // Mocked for now
    pageViews: 1450, // Mocked for now
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
    .eq('event_id', eventId);

  if (error) {
    console.error('Error fetching guests:', error);
    return [];
  }

  return guests;
}

export async function updateGuestStatus(registrationId: string, status: string) {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);
  
  const { error } = await supabase
    .from('registrations')
    .update({ status })
    .eq('id', registrationId);

  if (error) {
    throw new Error(error.message);
  }
  
  revalidatePath('/dashboard/events/[id]/guests', 'page');
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

  revalidatePath('/dashboard/events/[id]/tasks', 'page');
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

  revalidatePath('/dashboard/events/[id]/tasks', 'page');
  return { success: true };
}

export async function getBudgets(eventId: string) {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);
  
  const { data: budgets, error } = await supabase
    .from('budgets')
    .select('*')
    .eq('event_id', eventId)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching budgets:', error);
    return [];
  }

  return budgets;
}
