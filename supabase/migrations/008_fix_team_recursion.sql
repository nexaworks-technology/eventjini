-- ============================================
-- FIX RLS INFINITE RECURSION ON EVENT_TEAM_MEMBERS
-- ============================================

-- The previous fix solved recursion between events and event_team_members,
-- but the event_team_members policy still queried event_team_members within itself:
-- `event_id IN (SELECT event_id FROM public.event_team_members...)`
-- This caused an infinite loop within event_team_members.

-- Solution: Create another SECURITY DEFINER function to bypass RLS when checking team roles.

CREATE OR REPLACE FUNCTION public.is_team_admin(e_id UUID, u_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.event_team_members WHERE event_id = e_id AND user_id = u_id AND role IN ('owner', 'admin')
  );
$$;

-- Drop the recursive policies
DROP POLICY IF EXISTS "Team members viewable by members" ON public.event_team_members;
DROP POLICY IF EXISTS "Admins can insert team members" ON public.event_team_members;
DROP POLICY IF EXISTS "Admins can update team members" ON public.event_team_members;
DROP POLICY IF EXISTS "Admins can delete team members" ON public.event_team_members;

-- Recreate policies using the security definer functions ONLY
CREATE POLICY "Team members viewable by members" ON public.event_team_members 
FOR SELECT USING (
  user_id = auth.uid() OR 
  public.is_event_organizer(event_id, auth.uid()) OR
  public.is_team_admin(event_id, auth.uid())
);

CREATE POLICY "Admins can insert team members" ON public.event_team_members 
FOR INSERT WITH CHECK (
  public.is_event_organizer(event_id, auth.uid()) OR
  public.is_team_admin(event_id, auth.uid())
);

CREATE POLICY "Admins can update team members" ON public.event_team_members 
FOR UPDATE USING (
  public.is_event_organizer(event_id, auth.uid()) OR
  public.is_team_admin(event_id, auth.uid())
);

CREATE POLICY "Admins can delete team members" ON public.event_team_members 
FOR DELETE USING (
  public.is_event_organizer(event_id, auth.uid()) OR
  public.is_team_admin(event_id, auth.uid())
);
