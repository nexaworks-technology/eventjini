import { getTeamMembers } from "@/app/actions/team";
import TeamClient from "./team-client";
import { notFound } from "next/navigation";
import { createClient } from "@/utils/supabase/server";
import { cookies } from "next/headers";

export default async function TeamPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params;
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);
  
  const [{ data: event }, { data: teamMembers }] = await Promise.all([
    supabase.from('events').select('*').eq('id', resolvedParams.id).single(),
    getTeamMembers(resolvedParams.id)
  ]);

  if (!event) notFound();

  return <TeamClient eventId={resolvedParams.id} teamMembers={teamMembers || []} />;
}
