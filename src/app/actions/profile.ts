"use server";

import { createClient } from "@/utils/supabase/server";
import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";

export async function getProfile() {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Not authenticated" };
  }

  const { data: profile, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  if (error) {
    return { error: error.message };
  }

  return { 
    profile: {
      ...profile,
      email: user.email, // Passing email down for convenience if needed
    } 
  };
}

export async function updateProfile(formData: FormData) {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Not authenticated" };
  }

  const phone = formData.get("phone") as string;
  const location = formData.get("location") as string;
  const linkedin_url = formData.get("linkedin_url") as string;
  const dietary_preference = formData.get("dietary_preference") as string;
  const tshirt_size = formData.get("tshirt_size") as string;
  const bio = formData.get("bio") as string;
  const opt_in_recommendations = formData.get("opt_in_recommendations") === "on";

  const { error } = await supabase
    .from("profiles")
    .update({
      phone,
      location,
      linkedin_url,
      dietary_preference,
      tshirt_size,
      bio,
      opt_in_recommendations,
      updated_at: new Date().toISOString(),
    })
    .eq("id", user.id);

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/dashboard/profile");
  return { success: true };
}
