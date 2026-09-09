"use server";

import { createClient } from "@/utils/supabase/server";
import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";

export async function getProfile() {
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
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .single();

    if (error) {
      return { error: error.message };
    }

    return { data };
  } catch (err: any) {
    return { error: err?.message || "An unexpected error occurred" };
  }
}

export async function updateProfile(formData: FormData) {
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

    const full_name = formData.get("full_name")?.toString();
    const job_title = formData.get("job_title")?.toString();
    const company_size = formData.get("company_size")?.toString();

    const { error } = await supabase
      .from("profiles")
      .update({
        full_name,
        job_title,
        company_size,
        updated_at: new Date().toISOString(),
      })
      .eq("id", user.id);

    if (error) {
      return { error: error.message };
    }

    revalidatePath("/settings/profile");
    return { success: true };
  } catch (err: any) {
    return { error: err?.message || "An unexpected error occurred" };
  }
}
