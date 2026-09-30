-- SMARTMOVE Migration: All-India Event-Driven Real-Time Platform
-- Adds tables for traffic_events, brain_runs, route_updates, parking_updates, user_routes, ingest_log, translations_cache

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Helper function to check if current user is admin
CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role = 'admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 2. Traffic Events Table (User-reported and admin incidents with provenance)
CREATE TABLE IF NOT EXISTS public.traffic_events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  place_id TEXT,
  place_name TEXT NOT NULL,
  state TEXT,
  district TEXT,
  lat DOUBLE PRECISION NOT NULL,
  lng DOUBLE PRECISION NOT NULL,
  type TEXT NOT NULL, -- accident, road_closure, congestion, bus_delay, etc.
  severity INTEGER NOT NULL CHECK (severity >= 1 AND severity <= 5),
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'monitoring', 'resolved', 'pending')),
  title TEXT NOT NULL,
  description TEXT,
  affected_roads TEXT[] DEFAULT '{}',
  affected_bus_routes TEXT[] DEFAULT '{}',
  duration_min INTEGER DEFAULT 45,
  reported_by UUID REFERENCES auth.users(id),
  reporter_name TEXT DEFAULT 'Citizen',
  data_source TEXT NOT NULL DEFAULT 'user_reported' CHECK (data_source IN ('live_api', 'simulated', 'estimated', 'user_reported', 'ai_prediction')),
  provider TEXT DEFAULT 'SMARTMOVE_COMMUNITY',
  verified_by_admin BOOLEAN DEFAULT FALSE,
  observed_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_traffic_events_coords ON public.traffic_events(lat, lng);
CREATE INDEX IF NOT EXISTS idx_traffic_events_status ON public.traffic_events(status);
CREATE INDEX IF NOT EXISTS idx_traffic_events_place ON public.traffic_events(place_id);

-- 3. Brain Runs Queue Table (Logs every AI Mobility Brain execution)
CREATE TABLE IF NOT EXISTS public.brain_runs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  event_id UUID REFERENCES public.traffic_events(id) ON DELETE SET NULL,
  trigger_source TEXT NOT NULL, -- user_incident, sim_tick, place_query, manual
  status TEXT NOT NULL DEFAULT 'queued' CHECK (status IN ('queued', 'processing', 'completed', 'failed')),
  steps JSONB DEFAULT '[]'::jsonb,
  affected_tables TEXT[] DEFAULT '{}',
  latency_ms INTEGER,
  error_message TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_brain_runs_status ON public.brain_runs(status);

-- 4. User Routes (Monitored commuter routes for targeted push/alert rerouting)
CREATE TABLE IF NOT EXISTS public.user_routes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  origin_name TEXT NOT NULL,
  origin_lat DOUBLE PRECISION NOT NULL,
  origin_lng DOUBLE PRECISION NOT NULL,
  dest_name TEXT NOT NULL,
  dest_lat DOUBLE PRECISION NOT NULL,
  dest_lng DOUBLE PRECISION NOT NULL,
  travel_mode TEXT NOT NULL DEFAULT 'DRIVE',
  polyline TEXT,
  baseline_eta_min INTEGER,
  current_eta_min INTEGER,
  has_active_delay BOOLEAN DEFAULT FALSE,
  active_delay_min INTEGER DEFAULT 0,
  recommended_bypass_name TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 5. Route Updates (Dynamic recalculated diffs)
CREATE TABLE IF NOT EXISTS public.route_updates (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_route_id UUID REFERENCES public.user_routes(id) ON DELETE CASCADE,
  event_id UUID REFERENCES public.traffic_events(id) ON DELETE SET NULL,
  old_eta_min INTEGER NOT NULL,
  new_eta_min INTEGER NOT NULL,
  delta_min INTEGER NOT NULL,
  recommended_route JSONB NOT NULL,
  ai_explanation TEXT NOT NULL,
  data_source TEXT NOT NULL DEFAULT 'ai_prediction',
  observed_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 6. Parking Updates
CREATE TABLE IF NOT EXISTS public.parking_updates (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  parking_id TEXT NOT NULL,
  place_name TEXT NOT NULL,
  available_bays INTEGER NOT NULL,
  total_bays INTEGER NOT NULL,
  pressure_pct INTEGER NOT NULL,
  predicted_15m INTEGER NOT NULL,
  data_source TEXT NOT NULL DEFAULT 'estimated',
  provider TEXT DEFAULT 'SMARTMOVE_PARK',
  observed_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 7. Translations Cache (Multilingual Gemini response cache)
CREATE TABLE IF NOT EXISTS public.translations_cache (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  source_hash TEXT NOT NULL,
  source_text TEXT NOT NULL,
  target_lang TEXT NOT NULL,
  translated_text TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_translations_cache_key ON public.translations_cache(source_hash, target_lang);

-- 8. Ingest Log (API calls, latency & provenance audit)
CREATE TABLE IF NOT EXISTS public.ingest_log (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  provider TEXT NOT NULL,
  endpoint TEXT NOT NULL,
  place_query TEXT,
  status_code INTEGER,
  latency_ms INTEGER,
  cached BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.traffic_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.brain_runs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_routes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.route_updates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.parking_updates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.translations_cache ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ingest_log ENABLE ROW LEVEL SECURITY;

-- Policies:
-- traffic_events: everyone can read active/verified. Citizens insert pending. Admins can update/delete.
CREATE POLICY "Public read verified traffic events" ON public.traffic_events
  FOR SELECT USING (verified_by_admin = true OR status = 'active' OR auth.uid() = reported_by OR is_admin());

CREATE POLICY "Authenticated users insert traffic events" ON public.traffic_events
  FOR INSERT WITH CHECK (
    auth.role() = 'authenticated' AND (
      is_admin() OR (data_source = 'user_reported' AND status = 'pending' AND verified_by_admin = false)
    )
  );

CREATE POLICY "Admins manage traffic events" ON public.traffic_events
  FOR ALL USING (is_admin());

-- user_routes: users manage their own
CREATE POLICY "Users manage own routes" ON public.user_routes
  FOR ALL USING (auth.uid() = user_id);

-- Realtime publication enablement
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables
    WHERE pubname = 'supabase_realtime' AND tablename = 'traffic_events'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.traffic_events;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables
    WHERE pubname = 'supabase_realtime' AND tablename = 'brain_runs'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.brain_runs;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables
    WHERE pubname = 'supabase_realtime' AND tablename = 'route_updates'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.route_updates;
  END IF;
END $$;
