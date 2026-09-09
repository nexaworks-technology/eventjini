"use server";

import { createClient } from "@/utils/supabase/server";
import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";

export async function createOrganizer(formData: FormData) {
  try {
    const cookieStore = await cookies();
    const supabase = createClient(cookieStore);
    
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) return { error: "Unauthorized" };

    const name = formData.get("name")?.toString();
    const slug = name?.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');

    if (!name || !slug) return { error: "Name is required" };

    // 1. Create the Workspace (Organizer)
    const { data: org, error: orgError } = await supabase
      .from("organizers")
      .insert([{ name, slug, owner_id: user.id }])
      .select()
      .single();

    if (orgError) {
      if (orgError.code === '23505') return { error: "This name is already taken. Try another." };
      return { error: orgError.message };
    }

    // 2. Flip the user's is_organizer flag to true
    await supabase
      .from("profiles")
      .update({ is_organizer: true })
      .eq("id", user.id);

    revalidatePath("/dashboard");
    return { success: true };
  } catch (err: any) {
    return { error: err?.message || "An unexpected error occurred" };
  }
}
