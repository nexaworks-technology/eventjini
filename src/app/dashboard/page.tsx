import { createClient } from "@/utils/supabase/server";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export default async function DashboardRoot() {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);
  
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    redirect("/login");
  }

  // Check if they are an organizer (have created any events)
  const { count } = await supabase
    .from("events")
    .select("*", { count: "exact", head: true })
    .eq("organizer_id", user.id);

  if (count && count > 0) {
    redirect("/dashboard/organizer");
  } else {
    redirect("/dashboard/attendee");
  }
}
