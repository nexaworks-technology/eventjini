-- ============================================
-- FEATURE 5: MARKETING, ANALYTICS & AUTOMATION
-- ============================================

-- 1. Create tracking_links table
CREATE TABLE public.tracking_links (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
  utm_source TEXT NOT NULL,
  utm_medium TEXT,
  utm_campaign TEXT,
  clicks INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(event_id, utm_source, utm_medium, utm_campaign)
);

-- 2. Update registrations table to track conversions
ALTER TABLE public.registrations ADD COLUMN tracking_link_id UUID REFERENCES public.tracking_links(id) ON DELETE SET NULL;

-- 3. Create automations table
CREATE TYPE public.automation_trigger AS ENUM ('ticket_purchased', 'checked_in', 'event_ended');
CREATE TYPE public.automation_action AS ENUM ('send_email', 'send_webhook');

CREATE TABLE public.automations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
  trigger_type public.automation_trigger NOT NULL,
  action_type public.automation_action NOT NULL,
  is_active BOOLEAN DEFAULT true,
  payload JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.tracking_links ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.automations ENABLE ROW LEVEL SECURITY;

-- Policies for tracking_links
CREATE POLICY "Anyone can view tracking links" ON public.tracking_links FOR SELECT USING (true);
CREATE POLICY "Organizers can manage tracking links" ON public.tracking_links 
FOR ALL USING (
  event_id IN (
    SELECT id FROM public.events WHERE organizer_id = auth.uid()
    UNION
    SELECT event_id FROM public.event_team_members WHERE user_id = auth.uid()
  )
);

-- Policies for automations
CREATE POLICY "Organizers can manage automations" ON public.automations 
FOR ALL USING (
  event_id IN (
    SELECT id FROM public.events WHERE organizer_id = auth.uid()
    UNION
    SELECT event_id FROM public.event_team_members WHERE user_id = auth.uid()
  )
);
