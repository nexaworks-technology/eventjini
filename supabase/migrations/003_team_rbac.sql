-- ============================================
-- FEATURE 2: TEAM & VOLUNTEER MANAGEMENT (RBAC)
-- ============================================

-- Create Enum for Roles
CREATE TYPE public.event_role AS ENUM ('owner', 'admin', 'finance', 'scanner');

-- Create event_team_members table
CREATE TABLE public.event_team_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  role event_role NOT NULL DEFAULT 'scanner',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(event_id, user_id)
);

-- Index for performance
CREATE INDEX idx_event_team_members_event ON public.event_team_members(event_id);
CREATE INDEX idx_event_team_members_user ON public.event_team_members(user_id);

-- Enable RLS
ALTER TABLE public.event_team_members ENABLE ROW LEVEL SECURITY;

-- Policy: Members can view their own team membership or organizers can view their team
CREATE POLICY "Team members viewable by members" ON public.event_team_members 
FOR SELECT USING (
  user_id = auth.uid() OR 
  event_id IN (SELECT id FROM public.events WHERE organizer_id = auth.uid()) OR
  event_id IN (SELECT event_id FROM public.event_team_members WHERE user_id = auth.uid() AND role IN ('owner', 'admin'))
);

-- Policy: Only owner or admin can add team members
CREATE POLICY "Admins can insert team members" ON public.event_team_members 
FOR INSERT WITH CHECK (
  event_id IN (SELECT id FROM public.events WHERE organizer_id = auth.uid()) OR
  event_id IN (SELECT event_id FROM public.event_team_members WHERE user_id = auth.uid() AND role IN ('owner', 'admin'))
);

-- Policy: Only owner or admin can update team members
CREATE POLICY "Admins can update team members" ON public.event_team_members 
FOR UPDATE USING (
  event_id IN (SELECT id FROM public.events WHERE organizer_id = auth.uid()) OR
  event_id IN (SELECT event_id FROM public.event_team_members WHERE user_id = auth.uid() AND role IN ('owner', 'admin'))
);

-- Policy: Only owner or admin can delete team members
CREATE POLICY "Admins can delete team members" ON public.event_team_members 
FOR DELETE USING (
  event_id IN (SELECT id FROM public.events WHERE organizer_id = auth.uid()) OR
  event_id IN (SELECT event_id FROM public.event_team_members WHERE user_id = auth.uid() AND role IN ('owner', 'admin'))
);

-- ============================================
-- UPDATE EXISTING RLS POLICIES FOR EVENTS
-- ============================================
-- We need to allow team members (admins/finance/scanner) to SELECT events
DROP POLICY "Published events are viewable by everyone" ON public.events;
CREATE POLICY "Events viewable by public if published, or by team members" ON public.events 
FOR SELECT USING (
  status IN ('published', 'live', 'completed') OR 
  organizer_id = auth.uid() OR
  id IN (SELECT event_id FROM public.event_team_members WHERE user_id = auth.uid())
);

-- Update events UPDATE policy (owner or admin can update)
DROP POLICY "Organizers can update own events" ON public.events;
CREATE POLICY "Organizers and admins can update events" ON public.events 
FOR UPDATE USING (
  organizer_id = auth.uid() OR
  id IN (SELECT event_id FROM public.event_team_members WHERE user_id = auth.uid() AND role IN ('owner', 'admin'))
);

-- ============================================
-- UPDATE RLS FOR SUB-TABLES (Registrations, Tasks, Budget, etc)
-- ============================================
-- Allow scanners to read/update registrations
DROP POLICY "Users can view own registrations" ON public.registrations;
CREATE POLICY "Users can view own registrations, team can view all" ON public.registrations 
FOR SELECT USING (
  user_id = auth.uid() OR 
  event_id IN (SELECT id FROM public.events WHERE organizer_id = auth.uid()) OR
  event_id IN (SELECT event_id FROM public.event_team_members WHERE user_id = auth.uid())
);

DROP POLICY "Organizers can update registrations" ON public.registrations;
CREATE POLICY "Team can update registrations" ON public.registrations 
FOR UPDATE USING (
  event_id IN (SELECT id FROM public.events WHERE organizer_id = auth.uid()) OR
  event_id IN (SELECT event_id FROM public.event_team_members WHERE user_id = auth.uid() AND role IN ('owner', 'admin', 'scanner'))
);

-- Tasks: Admins only
DROP POLICY "Organizers manage tasks" ON public.tasks;
CREATE POLICY "Team manage tasks" ON public.tasks 
FOR ALL USING (
  event_id IN (SELECT id FROM public.events WHERE organizer_id = auth.uid()) OR
  event_id IN (SELECT event_id FROM public.event_team_members WHERE user_id = auth.uid() AND role IN ('owner', 'admin'))
);

-- Budget: Admins & Finance only
DROP POLICY "Organizers manage budgets" ON public.budget_items;
CREATE POLICY "Finance and admins manage budgets" ON public.budget_items 
FOR ALL USING (
  event_id IN (SELECT id FROM public.events WHERE organizer_id = auth.uid()) OR
  event_id IN (SELECT event_id FROM public.event_team_members WHERE user_id = auth.uid() AND role IN ('owner', 'admin', 'finance'))
);

-- Broadcasts: Admins only
DROP POLICY "Organizers manage broadcasts" ON public.broadcasts;
CREATE POLICY "Admins manage broadcasts" ON public.broadcasts 
FOR ALL USING (
  event_id IN (SELECT id FROM public.events WHERE organizer_id = auth.uid()) OR
  event_id IN (SELECT event_id FROM public.event_team_members WHERE user_id = auth.uid() AND role IN ('owner', 'admin'))
);
