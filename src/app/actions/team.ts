"use server";

import { createClient } from "@/utils/supabase/server";
import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";

export async function getTeamMembers(eventId: string) {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);
  
  // We join with profiles to get name/email/avatar
  const { data, error } = await supabase
    .from("event_team_members")
    .select(`
      id,
      role,
      user_id,
      created_at,
      profiles:user_id (
        id,
        full_name,
        email,
        avatar_url
      )
    `)
    .eq("event_id", eventId)
    .order("created_at", { ascending: true });

  if (error) {
    console.error("Error fetching team members:", JSON.stringify(error, null, 2), error.message, error.details, error.hint, error.code);
    return { data: null, error: error.message };
  }

  // To cleanly format it:
  const formattedData = data.map(member => ({
    id: member.id,
    role: member.role,
    user_id: member.user_id,
    created_at: member.created_at,
    profile: Array.isArray(member.profiles) ? member.profiles[0] : member.profiles,
  }));

  return { data: formattedData, error: null };
}

export async function addTeamMember(eventId: string, email: string, role: string) {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);
  
  // 1. Find user by email
  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("id")
    .eq("email", email)
    .single();
    
  if (profileError || !profile) {
    return { error: "User with this email not found. They must sign up first." };
  }
  
  // 2. Add to team
  const { error } = await supabase
    .from("event_team_members")
    .insert({
      event_id: eventId,
      user_id: profile.id,
      role: role
    });
    
  if (error) {
    if (error.code === '23505') {
      return { error: "User is already on the team." };
    }
    return { error: error.message };
  }
  
  revalidatePath(`/dashboard/events/${eventId}/team`);
  return { success: true };
}

export async function removeTeamMember(eventId: string, memberId: string) {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);
  
  const { error } = await supabase
    .from("event_team_members")
    .delete()
    .eq("id", memberId)
    .eq("event_id", eventId);
    
  if (error) {
    return { error: error.message };
  }
  
  revalidatePath(`/dashboard/events/${eventId}/team`);
  return { success: true };
}
