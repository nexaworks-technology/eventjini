import { cookies } from "next/headers";
import { createClient } from "@/utils/supabase/server";
import SettingsClient from "./settings-client";

interface SettingsPageProps {
  params: Promise<{ id: string }>;
}

export default async function SettingsPage({ params }: SettingsPageProps) {
  const resolvedParams = await params;
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  const { data: event } = await supabase
    .from("events")
    .select("*")
    .eq("id", resolvedParams.id)
    .single();

  if (!event) {
    return <div className="p-8 text-white">Event not found.</div>;
  }

  return (
    <div className="flex-1 p-8 overflow-y-auto w-full max-w-4xl">
      <h1 className="text-3xl font-bold mb-2 text-white tracking-tight">Event Settings</h1>
      <p className="text-muted mb-8">Update your event details and configurations.</p>
      
      <SettingsClient event={event} />
    </div>
  );
}
