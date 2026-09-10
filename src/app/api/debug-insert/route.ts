import { createClient } from '@/utils/supabase/server';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);
  
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Not logged in" });

  // Get a tier
  const { data: tier } = await supabase.from('sponsorship_tiers').select('id').limit(1).single();
  if (!tier) return NextResponse.json({ error: "No tier" });

  const { data, error } = await supabase
    .from("sponsor_registrations")
    .insert({
      tier_id: tier.id,
      sponsor_user_id: user.id,
      company_name: "Test",
      status: "paid"
    })
    .select();

  return NextResponse.json({ data, error });
}
