-- ============================================
-- FIX RLS INFINITE RECURSION
-- ============================================

-- The issue: 
-- events policy SELECT queries event_team_members
-- event_team_members policy SELECT queries events
-- This creates an infinite loop.

-- Solution: Create a SECURITY DEFINER function to bypass RLS when checking event ownership,
-- breaking the dependency chain.

CREATE OR REPLACE FUNCTION public.is_event_organizer(e_id UUID, u_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.events WHERE id = e_id AND organizer_id = u_id
  );
$$;

-- Drop recursive policies on event_team_members
DROP POLICY IF EXISTS "Team members viewable by members" ON public.event_team_members;
DROP POLICY IF EXISTS "Admins can insert team members" ON public.event_team_members;
DROP POLICY IF EXISTS "Admins can update team members" ON public.event_team_members;
DROP POLICY IF EXISTS "Admins can delete team members" ON public.event_team_members;

-- Recreate policies using the security definer function
CREATE POLICY "Team members viewable by members" ON public.event_team_members 
FOR SELECT USING (
  user_id = auth.uid() OR 
  public.is_event_organizer(event_id, auth.uid()) OR
  event_id IN (SELECT event_id FROM public.event_team_members WHERE user_id = auth.uid() AND role IN ('owner', 'admin'))
);

CREATE POLICY "Admins can insert team members" ON public.event_team_members 
FOR INSERT WITH CHECK (
  public.is_event_organizer(event_id, auth.uid()) OR
  event_id IN (SELECT event_id FROM public.event_team_members WHERE user_id = auth.uid() AND role IN ('owner', 'admin'))
);

CREATE POLICY "Admins can update team members" ON public.event_team_members 
FOR UPDATE USING (
  public.is_event_organizer(event_id, auth.uid()) OR
  event_id IN (SELECT event_id FROM public.event_team_members WHERE user_id = auth.uid() AND role IN ('owner', 'admin'))
);

CREATE POLICY "Admins can delete team members" ON public.event_team_members 
FOR DELETE USING (
  public.is_event_organizer(event_id, auth.uid()) OR
  event_id IN (SELECT event_id FROM public.event_team_members WHERE user_id = auth.uid() AND role IN ('owner', 'admin'))
);

-- Similarly, fix other sub-tables that query events to avoid extra nested RLS evaluation overhead
-- We can optionally apply `is_event_organizer` to registrations, tasks, etc, but fixing event_team_members breaks the cycle so it's strictly sufficient.
