-- ENUMS
CREATE TYPE field_type AS ENUM ('text', 'long_text', 'select', 'checkbox');

CREATE TABLE event_custom_fields (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  event_id UUID REFERENCES events(id) ON DELETE CASCADE NOT NULL,
  field_name TEXT NOT NULL,
  field_label TEXT NOT NULL,
  field_type field_type NOT NULL DEFAULT 'text',
  options JSONB, -- For select dropdowns (Array of strings)
  is_required BOOLEAN DEFAULT false,
  order_index INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE registrations ADD COLUMN custom_data JSONB DEFAULT '{}'::jsonb;

-- RLS
ALTER TABLE event_custom_fields ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view event custom fields"
ON event_custom_fields FOR SELECT
USING (true);

CREATE POLICY "Event admins can manage custom fields"
ON event_custom_fields FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM events e WHERE e.id = event_custom_fields.event_id AND e.organizer_id = auth.uid()
  )
  OR
  EXISTS (
    SELECT 1 FROM event_team_members t WHERE t.event_id = event_custom_fields.event_id AND t.user_id = auth.uid() AND t.role IN ('admin')
  )
);
