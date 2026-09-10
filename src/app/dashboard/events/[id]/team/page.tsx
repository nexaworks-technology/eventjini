import { getTeamMembers } from "@/app/actions/team";
import TeamClient from "./team-client";
import { notFound } from "next/navigation";
import { createClient } from "@/utils/supabase/server";
import { cookies } from "next/headers";

export default async function TeamPage({ params }: { params: { id: string } }) {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);
  
  const [{ data: event }, { data: teamMembers }] = await Promise.all([
    supabase.from('events').select('*').eq('id', params.id).single(),
    getTeamMembers(params.id)
  ]);

  if (!event) notFound();

  return <TeamClient eventId={params.id} teamMembers={teamMembers || []} />;
}
