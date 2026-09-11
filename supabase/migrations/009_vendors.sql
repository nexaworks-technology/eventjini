-- ENUMS
CREATE TYPE vendor_category AS ENUM ('catering', 'printing', 'av_tech', 'venue', 'logistics', 'security', 'other');
CREATE TYPE vendor_status AS ENUM ('shortlisted', 'contracted', 'completed', 'cancelled');
CREATE TYPE vendor_payment_status AS ENUM ('unpaid', 'partial', 'paid');

CREATE TABLE event_vendors (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  event_id UUID REFERENCES events(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  category vendor_category NOT NULL DEFAULT 'other',
  status vendor_status NOT NULL DEFAULT 'shortlisted',
  contact_name TEXT,
  contact_email TEXT,
  contact_phone TEXT,
  budget_allocated_cents INTEGER DEFAULT 0,
  payment_status vendor_payment_status NOT NULL DEFAULT 'unpaid',
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS
ALTER TABLE event_vendors ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Event team can view vendors"
ON event_vendors FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM events e WHERE e.id = event_vendors.event_id AND e.organizer_id = auth.uid()
  )
  OR
  EXISTS (
    SELECT 1 FROM event_team_members t WHERE t.event_id = event_vendors.event_id AND t.user_id = auth.uid()
  )
);

CREATE POLICY "Event admins can insert vendors"
ON event_vendors FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM events e WHERE e.id = event_vendors.event_id AND e.organizer_id = auth.uid()
  )
  OR
  EXISTS (
    SELECT 1 FROM event_team_members t WHERE t.event_id = event_vendors.event_id AND t.user_id = auth.uid() AND t.role IN ('admin', 'finance')
  )
);

CREATE POLICY "Event admins can update vendors"
ON event_vendors FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM events e WHERE e.id = event_vendors.event_id AND e.organizer_id = auth.uid()
  )
  OR
  EXISTS (
    SELECT 1 FROM event_team_members t WHERE t.event_id = event_vendors.event_id AND t.user_id = auth.uid() AND t.role IN ('admin', 'finance')
  )
);

CREATE POLICY "Event admins can delete vendors"
ON event_vendors FOR DELETE
USING (
  EXISTS (
    SELECT 1 FROM events e WHERE e.id = event_vendors.event_id AND e.organizer_id = auth.uid()
  )
  OR
  EXISTS (
    SELECT 1 FROM event_team_members t WHERE t.event_id = event_vendors.event_id AND t.user_id = auth.uid() AND t.role IN ('admin', 'finance')
  )
);
