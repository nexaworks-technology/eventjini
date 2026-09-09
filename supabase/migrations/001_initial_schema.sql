-- EventJini MVP Database Schema
-- Run this in your Supabase SQL Editor (Dashboard → SQL Editor → New Query)
-- Version: 1.0 | Date: September 9, 2026

-- ============================================
-- ENUMS
-- ============================================

CREATE TYPE user_role AS ENUM ('delegate', 'organizer', 'admin', 'sponsor');
CREATE TYPE dietary_pref AS ENUM ('veg', 'non-veg', 'vegan', 'no-preference');
CREATE TYPE tshirt_size AS ENUM ('XS', 'S', 'M', 'L', 'XL', 'XXL');
CREATE TYPE event_status AS ENUM ('draft', 'published', 'live', 'completed', 'cancelled');
CREATE TYPE registration_status AS ENUM ('pending', 'approved', 'rejected', 'cancelled', 'checked_in');
CREATE TYPE payment_status AS ENUM ('unpaid', 'paid', 'refunded');
CREATE TYPE sponsor_status AS ENUM ('interested', 'confirmed', 'paid');
CREATE TYPE task_priority AS ENUM ('low', 'medium', 'high', 'urgent');
CREATE TYPE task_status AS ENUM ('todo', 'in_progress', 'done');
CREATE TYPE budget_status AS ENUM ('planned', 'committed', 'paid');
CREATE TYPE broadcast_audience AS ENUM ('all', 'approved', 'pending', 'vip');

-- ============================================
-- 1. PROFILES (extends Supabase auth.users)
-- ============================================

CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT NOT NULL DEFAULT '',
  avatar_url TEXT,
  role user_role NOT NULL DEFAULT 'delegate',
  phone TEXT,
  location TEXT,
  linkedin_url TEXT,
  dietary_preference dietary_pref DEFAULT 'no-preference',
  tshirt_size tshirt_size,
  bio TEXT,
  opt_in_recommendations BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data ->> 'full_name', '')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============================================
-- 2. EVENTS
-- ============================================

CREATE TABLE public.events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organizer_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT,
  start_date TIMESTAMPTZ NOT NULL,
  end_date TIMESTAMPTZ,
  timezone TEXT DEFAULT 'Asia/Kolkata',
  location_name TEXT,
  location_lat DOUBLE PRECISION,
  location_lng DOUBLE PRECISION,
  google_maps_url TEXT,
  banner_url TEXT,
  capacity INTEGER,
  requires_approval BOOLEAN DEFAULT false,
  is_paid BOOLEAN DEFAULT false,
  ticket_price_cents INTEGER DEFAULT 0,
  currency TEXT DEFAULT 'INR',
  stripe_product_id TEXT,
  status event_status DEFAULT 'draft',
  theme_gradient TEXT DEFAULT 'from-cyan-500 to-purple-500',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================
-- 3. REGISTRATIONS
-- ============================================

CREATE TABLE public.registrations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  status registration_status DEFAULT 'pending',
  ticket_code TEXT UNIQUE NOT NULL DEFAULT encode(gen_random_bytes(12), 'hex'),
  payment_intent_id TEXT,
  payment_status payment_status DEFAULT 'unpaid',
  checked_in_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(event_id, user_id)
);

-- ============================================
-- 4. SPONSORSHIP TIERS
-- ============================================

CREATE TABLE public.sponsorship_tiers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  price_cents INTEGER NOT NULL,
  benefits TEXT[] DEFAULT '{}',
  max_slots INTEGER,
  slots_filled INTEGER DEFAULT 0,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================
-- 5. SPONSOR REGISTRATIONS
-- ============================================

CREATE TABLE public.sponsor_registrations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tier_id UUID NOT NULL REFERENCES public.sponsorship_tiers(id) ON DELETE CASCADE,
  sponsor_user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  company_name TEXT,
  company_logo_url TEXT,
  status sponsor_status DEFAULT 'interested',
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================
-- 6. TASKS
-- ============================================

CREATE TABLE public.tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  assignee TEXT,
  due_date DATE,
  priority task_priority DEFAULT 'medium',
  status task_status DEFAULT 'todo',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================
-- 7. BUDGET ITEMS
-- ============================================

CREATE TABLE public.budget_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
  category TEXT NOT NULL,
  description TEXT,
  estimated_amount_cents INTEGER NOT NULL DEFAULT 0,
  actual_amount_cents INTEGER DEFAULT 0,
  status budget_status DEFAULT 'planned',
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================
-- 8. BROADCASTS
-- ============================================

CREATE TABLE public.broadcasts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
  audience broadcast_audience DEFAULT 'all',
  subject TEXT NOT NULL,
  body TEXT NOT NULL,
  sent_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================
-- INDEXES (Performance)
-- ============================================

CREATE INDEX idx_events_organizer ON public.events(organizer_id);
CREATE INDEX idx_events_slug ON public.events(slug);
CREATE INDEX idx_events_status ON public.events(status);
CREATE INDEX idx_registrations_event ON public.registrations(event_id);
CREATE INDEX idx_registrations_user ON public.registrations(user_id);
CREATE INDEX idx_registrations_ticket ON public.registrations(ticket_code);
CREATE INDEX idx_tasks_event ON public.tasks(event_id);
CREATE INDEX idx_budget_event ON public.budget_items(event_id);
CREATE INDEX idx_broadcasts_event ON public.broadcasts(event_id);
CREATE INDEX idx_sponsorship_tiers_event ON public.sponsorship_tiers(event_id);

-- ============================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.registrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sponsorship_tiers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sponsor_registrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.budget_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.broadcasts ENABLE ROW LEVEL SECURITY;

-- PROFILES: Users can read all profiles, update their own
CREATE POLICY "Profiles are viewable by everyone" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);

-- EVENTS: Anyone can read published/live events, organizers manage their own
CREATE POLICY "Published events are viewable by everyone" ON public.events FOR SELECT USING (status IN ('published', 'live', 'completed') OR organizer_id = auth.uid());
CREATE POLICY "Organizers can create events" ON public.events FOR INSERT WITH CHECK (organizer_id = auth.uid());
CREATE POLICY "Organizers can update own events" ON public.events FOR UPDATE USING (organizer_id = auth.uid());
CREATE POLICY "Organizers can delete own events" ON public.events FOR DELETE USING (organizer_id = auth.uid());

-- REGISTRATIONS: Users can read own, organizers can read all for their events
CREATE POLICY "Users can view own registrations" ON public.registrations FOR SELECT USING (user_id = auth.uid() OR event_id IN (SELECT id FROM public.events WHERE organizer_id = auth.uid()));
CREATE POLICY "Users can register for events" ON public.registrations FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY "Organizers can update registrations" ON public.registrations FOR UPDATE USING (event_id IN (SELECT id FROM public.events WHERE organizer_id = auth.uid()));

-- SPONSORSHIP TIERS: Viewable by everyone, manageable by event organizer
CREATE POLICY "Tiers viewable by everyone" ON public.sponsorship_tiers FOR SELECT USING (true);
CREATE POLICY "Organizers manage tiers" ON public.sponsorship_tiers FOR INSERT WITH CHECK (event_id IN (SELECT id FROM public.events WHERE organizer_id = auth.uid()));
CREATE POLICY "Organizers update tiers" ON public.sponsorship_tiers FOR UPDATE USING (event_id IN (SELECT id FROM public.events WHERE organizer_id = auth.uid()));
CREATE POLICY "Organizers delete tiers" ON public.sponsorship_tiers FOR DELETE USING (event_id IN (SELECT id FROM public.events WHERE organizer_id = auth.uid()));

-- SPONSOR REGISTRATIONS: Sponsors can create, organizers can manage
CREATE POLICY "Sponsor regs viewable by relevant parties" ON public.sponsor_registrations FOR SELECT USING (sponsor_user_id = auth.uid() OR tier_id IN (SELECT st.id FROM public.sponsorship_tiers st JOIN public.events e ON st.event_id = e.id WHERE e.organizer_id = auth.uid()));
CREATE POLICY "Sponsors can express interest" ON public.sponsor_registrations FOR INSERT WITH CHECK (sponsor_user_id = auth.uid());
CREATE POLICY "Organizers can update sponsor regs" ON public.sponsor_registrations FOR UPDATE USING (tier_id IN (SELECT st.id FROM public.sponsorship_tiers st JOIN public.events e ON st.event_id = e.id WHERE e.organizer_id = auth.uid()));

-- TASKS: Only event organizers
CREATE POLICY "Organizers manage tasks" ON public.tasks FOR ALL USING (event_id IN (SELECT id FROM public.events WHERE organizer_id = auth.uid()));

-- BUDGET: Only event organizers
CREATE POLICY "Organizers manage budgets" ON public.budget_items FOR ALL USING (event_id IN (SELECT id FROM public.events WHERE organizer_id = auth.uid()));

-- BROADCASTS: Only event organizers
CREATE POLICY "Organizers manage broadcasts" ON public.broadcasts FOR ALL USING (event_id IN (SELECT id FROM public.events WHERE organizer_id = auth.uid()));
