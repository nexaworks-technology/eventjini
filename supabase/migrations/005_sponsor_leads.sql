-- ============================================
-- FEATURE 3: SPONSOR LEAD RETRIEVAL
-- ============================================

-- 1. Create sponsor_leads table
CREATE TABLE public.sponsor_leads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sponsor_id UUID NOT NULL REFERENCES public.sponsor_registrations(id) ON DELETE CASCADE,
  registration_id UUID NOT NULL REFERENCES public.registrations(id) ON DELETE CASCADE,
  notes TEXT,
  scanned_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(sponsor_id, registration_id)
);

-- Index for fast lookups
CREATE INDEX idx_sponsor_leads_sponsor ON public.sponsor_leads(sponsor_id);
CREATE INDEX idx_sponsor_leads_registration ON public.sponsor_leads(registration_id);

-- Enable RLS
ALTER TABLE public.sponsor_leads ENABLE ROW LEVEL SECURITY;

-- Policy: Sponsors can insert leads for their own sponsor_registration
CREATE POLICY "Sponsors can insert leads" ON public.sponsor_leads 
FOR INSERT WITH CHECK (
  sponsor_id IN (
    SELECT id FROM public.sponsor_registrations WHERE sponsor_user_id = auth.uid()
  )
);

-- Policy: Sponsors can view their own leads
CREATE POLICY "Sponsors can view own leads" ON public.sponsor_leads 
FOR SELECT USING (
  sponsor_id IN (
    SELECT id FROM public.sponsor_registrations WHERE sponsor_user_id = auth.uid()
  )
);

-- Policy: Event Organizers/Admins can view all leads for their event
CREATE POLICY "Organizers can view all event leads" ON public.sponsor_leads 
FOR SELECT USING (
  sponsor_id IN (
    SELECT sr.id 
    FROM public.sponsor_registrations sr
    JOIN public.sponsorship_tiers st ON sr.tier_id = st.id
    JOIN public.events e ON st.event_id = e.id
    WHERE e.organizer_id = auth.uid() 
       OR e.id IN (SELECT event_id FROM public.event_team_members WHERE user_id = auth.uid())
  )
);

-- Note: We assume the sponsor gets access to the registration data via a secure view or direct join since RLS on registrations allows users to view them if they own them, but a sponsor might not own the registration.
-- Let's update the RLS on `registrations` to allow sponsors to view registrations they have scanned!
CREATE POLICY "Sponsors can view registrations they scanned" ON public.registrations
FOR SELECT USING (
  id IN (
    SELECT sl.registration_id 
    FROM public.sponsor_leads sl
    JOIN public.sponsor_registrations sr ON sl.sponsor_id = sr.id
    WHERE sr.sponsor_user_id = auth.uid()
  )
);
