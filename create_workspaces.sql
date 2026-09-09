CREATE TABLE IF NOT EXISTS public.organizers (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    logo_url TEXT,
    owner_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS
ALTER TABLE public.organizers ENABLE ROW LEVEL SECURITY;

-- Policies for organizers
CREATE POLICY "Organizers are viewable by everyone" ON public.organizers
    FOR SELECT USING (true);

CREATE POLICY "Users can create organizers" ON public.organizers
    FOR INSERT WITH CHECK (auth.uid() = owner_id);

CREATE POLICY "Owners can update their organizers" ON public.organizers
    FOR UPDATE USING (auth.uid() = owner_id);

-- Add column to events
ALTER TABLE public.events ADD COLUMN IF NOT EXISTS workspace_id UUID REFERENCES public.organizers(id) ON DELETE CASCADE;

-- We need a migration script for existing events, but we can just run it via JS or SQL.
