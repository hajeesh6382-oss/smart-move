-- ====================================================================
-- SMARTMOVE URBAN MOBILITY INTELLIGENCE PLATFORM
-- Database Migration (Schema, Provenance, Security, RLS & Realtime)
-- ====================================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Data Source Type Enum
DO $$ BEGIN
  CREATE TYPE public.data_source_type AS ENUM (
    'simulated',
    'demo_seed',
    'live_api',
    'sensor',
    'estimated'
  );
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- 1. PROFILES TABLE
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  full_name TEXT NOT NULL DEFAULT '',
  role TEXT NOT NULL DEFAULT 'citizen' CHECK (role IN ('citizen', 'admin')),
  preferred_language TEXT NOT NULL DEFAULT 'en',
  preferred_transport TEXT NOT NULL DEFAULT 'balanced' CHECK (preferred_transport IN ('fastest', 'eco', 'balanced', 'transit', 'walk')),
  voice_enabled BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2. SIMULATION STATE TABLE (Single Row Control for City State + Source Mode)
CREATE TABLE IF NOT EXISTS public.simulation_state (
  id INT PRIMARY KEY DEFAULT 1 CHECK (id = 1),
  traffic_volume INT NOT NULL DEFAULT 65 CHECK (traffic_volume BETWEEN 0 AND 100),
  scenario TEXT NOT NULL DEFAULT 'peak_hour' CHECK (scenario IN ('normal', 'peak_hour', 'custom', 'emergency_corridor')),
  source_mode TEXT NOT NULL DEFAULT 'simulated' CHECK (source_mode IN ('simulated', 'hybrid', 'live_only')),
  signal_optimization BOOLEAN NOT NULL DEFAULT false,
  extra_buses INT NOT NULL DEFAULT 0 CHECK (extra_buses BETWEEN 0 AND 5),
  staggered_departure BOOLEAN NOT NULL DEFAULT false,
  parking_guidance BOOLEAN NOT NULL DEFAULT false,
  emergency_vehicle_active BOOLEAN NOT NULL DEFAULT false,
  demo_running BOOLEAN NOT NULL DEFAULT false,
  demo_step INT NOT NULL DEFAULT 1 CHECK (demo_step BETWEEN 1 AND 12),
  sim_clock TEXT NOT NULL DEFAULT '17:15',
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3. ROADS & INFRASTRUCTURE (GeoJSON Polyline Coordinates)
CREATE TABLE IF NOT EXISTS public.roads (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  type TEXT NOT NULL DEFAULT 'arterial',
  capacity INT NOT NULL DEFAULT 1200,
  length_km NUMERIC(4, 2) NOT NULL DEFAULT 2.5,
  speed_limit INT NOT NULL DEFAULT 50,
  geometry JSONB NOT NULL DEFAULT '[]', -- GeoJSON LineString coordinates [[lat, lng], ...]
  start_lat NUMERIC(9, 6) NOT NULL,
  start_lng NUMERIC(9, 6) NOT NULL,
  end_lat NUMERIC(9, 6) NOT NULL,
  end_lng NUMERIC(9, 6) NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 4. LIVE TRAFFIC DATA (with Provenance)
CREATE TABLE IF NOT EXISTS public.traffic_data (
  id TEXT PRIMARY KEY,
  road_id TEXT NOT NULL REFERENCES public.roads(id) ON DELETE CASCADE,
  road_name TEXT NOT NULL,
  vehicle_count INT NOT NULL DEFAULT 400,
  avg_speed_kmh INT NOT NULL DEFAULT 35,
  congestion_pct INT NOT NULL DEFAULT 50,
  status TEXT NOT NULL DEFAULT 'moderate' CHECK (status IN ('low', 'moderate', 'high', 'severe')),
  data_source public.data_source_type NOT NULL DEFAULT 'simulated',
  provider TEXT DEFAULT 'sim-engine',
  observed_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  confidence NUMERIC(4, 1) DEFAULT 92.0,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 5. TRAFFIC PREDICTIONS (15 / 30 / 60 min)
CREATE TABLE IF NOT EXISTS public.traffic_predictions (
  id TEXT PRIMARY KEY,
  road_id TEXT NOT NULL REFERENCES public.roads(id) ON DELETE CASCADE,
  road_name TEXT NOT NULL,
  predicted_15m INT NOT NULL,
  predicted_30m INT NOT NULL,
  predicted_60m INT NOT NULL,
  confidence INT NOT NULL DEFAULT 88,
  reason TEXT NOT NULL,
  data_source public.data_source_type NOT NULL DEFAULT 'estimated',
  provider TEXT DEFAULT 'smartmove-ml',
  observed_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 6. ADAPTIVE SIGNAL APPROACHES
CREATE TABLE IF NOT EXISTS public.signal_approaches (
  id TEXT PRIMARY KEY,
  junction_name TEXT NOT NULL,
  north_count INT NOT NULL DEFAULT 45,
  south_count INT NOT NULL DEFAULT 40,
  east_count INT NOT NULL DEFAULT 85,
  west_count INT NOT NULL DEFAULT 30,
  current_cycle_sec INT NOT NULL DEFAULT 120,
  rec_north_sec INT NOT NULL DEFAULT 25,
  rec_south_sec INT NOT NULL DEFAULT 25,
  rec_east_sec INT NOT NULL DEFAULT 45,
  rec_west_sec INT NOT NULL DEFAULT 25,
  status TEXT NOT NULL DEFAULT 'optimizing',
  coordinates JSONB NOT NULL DEFAULT '[12.9735, 77.5985]',
  data_source public.data_source_type NOT NULL DEFAULT 'estimated',
  provider TEXT DEFAULT 'signal-optimizer',
  observed_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 7. BUS ROUTES & REAL-TIME TRANSIT
CREATE TABLE IF NOT EXISTS public.bus_routes (
  id TEXT PRIMARY KEY,
  route_number TEXT NOT NULL,
  name TEXT NOT NULL,
  current_eta_min INT NOT NULL DEFAULT 8,
  delay_min INT NOT NULL DEFAULT 3,
  current_occupancy_pct INT NOT NULL DEFAULT 75, -- ALWAYS simulated/estimated
  is_overloaded BOOLEAN NOT NULL DEFAULT false,
  next_stop TEXT NOT NULL DEFAULT 'College Gate',
  active_buses INT NOT NULL DEFAULT 4,
  lat NUMERIC(9, 6) NOT NULL DEFAULT 12.9716,
  lng NUMERIC(9, 6) NOT NULL DEFAULT 77.5946,
  stops JSONB NOT NULL DEFAULT '[]',
  route_geometry JSONB NOT NULL DEFAULT '[]',
  data_source public.data_source_type NOT NULL DEFAULT 'simulated',
  provider TEXT DEFAULT 'sim-transit',
  observed_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 8. BUS PREDICTIONS
CREATE TABLE IF NOT EXISTS public.bus_predictions (
  id TEXT PRIMARY KEY,
  route_id TEXT NOT NULL REFERENCES public.bus_routes(id) ON DELETE CASCADE,
  route_number TEXT NOT NULL,
  predicted_occupancy_8m INT NOT NULL DEFAULT 88,
  predicted_delay_min INT NOT NULL DEFAULT 6,
  recommendation TEXT NOT NULL,
  confidence INT NOT NULL DEFAULT 91,
  data_source public.data_source_type NOT NULL DEFAULT 'estimated',
  provider TEXT DEFAULT 'transit-forecaster',
  observed_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 9. PARKING LOCATIONS & PREDICTIONS
CREATE TABLE IF NOT EXISTS public.parking_locations (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  total_spots INT NOT NULL DEFAULT 120,
  occupied_spots INT NOT NULL DEFAULT 95,
  available_spots INT NOT NULL DEFAULT 25,
  hourly_rate INT NOT NULL DEFAULT 30,
  has_ev BOOLEAN NOT NULL DEFAULT true,
  lat NUMERIC(9, 6) NOT NULL,
  lng NUMERIC(9, 6) NOT NULL,
  status TEXT NOT NULL DEFAULT 'filling_fast',
  data_source public.data_source_type NOT NULL DEFAULT 'simulated',
  provider TEXT DEFAULT 'parking-sim',
  observed_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.parking_predictions (
  id TEXT PRIMARY KEY,
  parking_id TEXT NOT NULL REFERENCES public.parking_locations(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  predicted_avail_15m INT NOT NULL DEFAULT 8,
  trend TEXT NOT NULL DEFAULT 'decreasing',
  recommended BOOLEAN NOT NULL DEFAULT false,
  confidence INT NOT NULL DEFAULT 85,
  data_source public.data_source_type NOT NULL DEFAULT 'estimated',
  observed_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 10. EV CHARGING STATIONS
CREATE TABLE IF NOT EXISTS public.ev_stations (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  total_chargers INT NOT NULL DEFAULT 6,
  available_chargers INT NOT NULL DEFAULT 3,
  power_kw INT NOT NULL DEFAULT 60,
  fast_charging BOOLEAN NOT NULL DEFAULT true,
  lat NUMERIC(9, 6) NOT NULL,
  lng NUMERIC(9, 6) NOT NULL,
  status TEXT NOT NULL DEFAULT 'available',
  data_source public.data_source_type NOT NULL DEFAULT 'simulated',
  observed_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 11. PEDESTRIAN SAFETY & RISK ZONES
CREATE TABLE IF NOT EXISTS public.pedestrian_zones (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  pedestrian_count INT NOT NULL DEFAULT 120,
  vehicle_density INT NOT NULL DEFAULT 80,
  risk_score INT NOT NULL DEFAULT 72,
  risk_level TEXT NOT NULL DEFAULT 'Higher' CHECK (risk_level IN ('Lower', 'Moderate', 'Higher')),
  safer_crossing TEXT NOT NULL DEFAULT 'Use East Foot Overbridge',
  lat NUMERIC(9, 6) NOT NULL,
  lng NUMERIC(9, 6) NOT NULL,
  data_source public.data_source_type NOT NULL DEFAULT 'estimated',
  observed_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 12. ESTIMATED EMISSION DATA
CREATE TABLE IF NOT EXISTS public.emission_data (
  id TEXT PRIMARY KEY,
  area_name TEXT NOT NULL,
  co2_kg_hr NUMERIC(8, 2) NOT NULL DEFAULT 420.50,
  fuel_wasted_liters_hr NUMERIC(8, 2) NOT NULL DEFAULT 165.20,
  avg_congestion_pct INT NOT NULL DEFAULT 68,
  estimated_reduction_pct INT NOT NULL DEFAULT 22,
  data_source public.data_source_type NOT NULL DEFAULT 'estimated',
  provider TEXT DEFAULT 'carbon-model',
  observed_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 13. OTP VERIFICATIONS TABLE (Real-Time Gmail Delivery)
CREATE TABLE IF NOT EXISTS public.otp_verifications (
  email TEXT PRIMARY KEY,
  otp_code TEXT NOT NULL,
  expires_at TIMESTAMPTZ NOT NULL,
  verified BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 14. INGEST LOG (Admin Audit & Health Monitor)
CREATE TABLE IF NOT EXISTS public.ingest_log (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  provider TEXT NOT NULL,
  category TEXT NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('success', 'fallback', 'failed', 'empty')),
  latency_ms INT NOT NULL DEFAULT 10,
  data_source public.data_source_type NOT NULL,
  message TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 14. EMERGENCY GREEN CORRIDORS
CREATE TABLE IF NOT EXISTS public.emergency_incidents (
  id TEXT PRIMARY KEY,
  vehicle_type TEXT NOT NULL DEFAULT 'Ambulance 108',
  start_location TEXT NOT NULL,
  destination TEXT NOT NULL,
  current_eta_normal INT NOT NULL DEFAULT 14,
  current_eta_ai INT NOT NULL DEFAULT 8,
  time_saved_min INT NOT NULL DEFAULT 6,
  active BOOLEAN NOT NULL DEFAULT false,
  corridors JSONB NOT NULL DEFAULT '[]',
  junctions_to_avoid JSONB NOT NULL DEFAULT '[]',
  data_source public.data_source_type NOT NULL DEFAULT 'estimated',
  observed_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 15. MOBILITY SCHEDULES (Colleges & Offices)
CREATE TABLE IF NOT EXISTS public.mobility_schedules (
  id TEXT PRIMARY KEY DEFAULT uuid_generate_v4()::TEXT,
  entity_name TEXT NOT NULL,
  entity_type TEXT NOT NULL CHECK (entity_type IN ('college', 'office', 'school', 'commercial')),
  departure_time TEXT NOT NULL,
  expected_people INT NOT NULL DEFAULT 1500,
  zone TEXT NOT NULL DEFAULT 'North Tech Corridor',
  staggered_suggested_time TEXT NOT NULL DEFAULT '16:50',
  active BOOLEAN NOT NULL DEFAULT true,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 16. SIMULATION RUNS
CREATE TABLE IF NOT EXISTS public.simulation_runs (
  id TEXT PRIMARY KEY DEFAULT uuid_generate_v4()::TEXT,
  name TEXT NOT NULL,
  scenario_inputs JSONB NOT NULL,
  before_metrics JSONB NOT NULL,
  after_metrics JSONB NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 17. AI RECOMMENDATIONS & EXPLAINABILITY
CREATE TABLE IF NOT EXISTS public.ai_recommendations (
  id TEXT PRIMARY KEY,
  category TEXT NOT NULL CHECK (category IN ('traffic', 'transit', 'parking', 'signal', 'safety', 'staggered', 'emergency')),
  title TEXT NOT NULL,
  problem TEXT NOT NULL,
  prediction TEXT NOT NULL,
  recommendation TEXT NOT NULL,
  estimated_impact TEXT NOT NULL,
  why_reasons JSONB NOT NULL DEFAULT '[]',
  confidence INT NOT NULL DEFAULT 89,
  connected_effects JSONB NOT NULL DEFAULT '[]',
  data_source public.data_source_type NOT NULL DEFAULT 'estimated',
  active BOOLEAN NOT NULL DEFAULT true,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 18. ALERTS & NOTIFICATIONS
CREATE TABLE IF NOT EXISTS public.alerts (
  id TEXT PRIMARY KEY DEFAULT uuid_generate_v4()::TEXT,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  severity TEXT NOT NULL DEFAULT 'warning' CHECK (severity IN ('info', 'warning', 'critical', 'success')),
  category TEXT NOT NULL DEFAULT 'traffic',
  read BOOLEAN NOT NULL DEFAULT false,
  is_broadcast BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 19. TRANSLATIONS CACHE
CREATE TABLE IF NOT EXISTS public.translations_cache (
  id TEXT PRIMARY KEY DEFAULT uuid_generate_v4()::TEXT,
  source_hash TEXT NOT NULL,
  lang TEXT NOT NULL,
  translated_text TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT unique_hash_lang UNIQUE (source_hash, lang)
);

-- 20. ASSISTANT MESSAGES
CREATE TABLE IF NOT EXISTS public.assistant_messages (
  id TEXT PRIMARY KEY DEFAULT uuid_generate_v4()::TEXT,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('user', 'assistant', 'system')),
  content TEXT NOT NULL,
  lang TEXT NOT NULL DEFAULT 'en',
  metadata JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ====================================================================
-- INDEXES & PERFORMANCE OPTIMIZATIONS
-- ====================================================================
CREATE INDEX IF NOT EXISTS idx_traffic_observed ON public.traffic_data(observed_at);
CREATE INDEX IF NOT EXISTS idx_traffic_source ON public.traffic_data(data_source);
CREATE INDEX IF NOT EXISTS idx_bus_observed ON public.bus_routes(observed_at);
CREATE INDEX IF NOT EXISTS idx_ingest_log_time ON public.ingest_log(created_at DESC);

-- ====================================================================
-- ROW LEVEL SECURITY (RLS)
-- ====================================================================
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.simulation_state ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.roads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.traffic_data ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.traffic_predictions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.signal_approaches ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bus_routes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bus_predictions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.parking_locations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.parking_predictions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ev_stations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pedestrian_zones ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.emission_data ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ingest_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.emergency_incidents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mobility_schedules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.simulation_runs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_recommendations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.translations_cache ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.assistant_messages ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role = 'admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Public/Citizen read policies
CREATE POLICY "Public read simulation state" ON public.simulation_state FOR SELECT USING (true);
CREATE POLICY "Public read roads" ON public.roads FOR SELECT USING (true);
CREATE POLICY "Public read traffic" ON public.traffic_data FOR SELECT USING (true);
CREATE POLICY "Public read traffic predictions" ON public.traffic_predictions FOR SELECT USING (true);
CREATE POLICY "Public read signals" ON public.signal_approaches FOR SELECT USING (true);
CREATE POLICY "Public read buses" ON public.bus_routes FOR SELECT USING (true);
CREATE POLICY "Public read bus predictions" ON public.bus_predictions FOR SELECT USING (true);
CREATE POLICY "Public read parking" ON public.parking_locations FOR SELECT USING (true);
CREATE POLICY "Public read parking predictions" ON public.parking_predictions FOR SELECT USING (true);
CREATE POLICY "Public read ev" ON public.ev_stations FOR SELECT USING (true);
CREATE POLICY "Public read pedestrian" ON public.pedestrian_zones FOR SELECT USING (true);
CREATE POLICY "Public read emissions" ON public.emission_data FOR SELECT USING (true);
CREATE POLICY "Public read emergency" ON public.emergency_incidents FOR SELECT USING (true);
CREATE POLICY "Public read mobility schedules" ON public.mobility_schedules FOR SELECT USING (true);
CREATE POLICY "Public read ai recommendations" ON public.ai_recommendations FOR SELECT USING (true);
CREATE POLICY "Public read translations" ON public.translations_cache FOR SELECT USING (true);
CREATE POLICY "Admin read ingest log" ON public.ingest_log FOR SELECT USING (public.is_admin() OR auth.role() = 'service_role');

-- Admin write policies
CREATE POLICY "Admin update simulation state" ON public.simulation_state FOR ALL USING (public.is_admin() OR auth.role() = 'service_role');
CREATE POLICY "Admin manage schedules" ON public.mobility_schedules FOR ALL USING (public.is_admin() OR auth.role() = 'service_role');
CREATE POLICY "Admin manage simulation runs" ON public.simulation_runs FOR ALL USING (public.is_admin() OR auth.role() = 'service_role');
CREATE POLICY "Admin manage city traffic" ON public.traffic_data FOR ALL USING (public.is_admin() OR auth.role() = 'service_role');

-- User private policies
CREATE POLICY "Users view own profile" ON public.profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users update own profile without role escalation" ON public.profiles FOR UPDATE USING (auth.uid() = id)
WITH CHECK (auth.uid() = id AND role = (SELECT role FROM public.profiles WHERE id = auth.uid()));
CREATE POLICY "Users read own alerts or broadcast" ON public.alerts FOR SELECT USING (user_id = auth.uid() OR is_broadcast = true);
CREATE POLICY "Users update own alerts" ON public.alerts FOR UPDATE USING (user_id = auth.uid());
CREATE POLICY "Users read own messages" ON public.assistant_messages FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "Users insert own messages" ON public.assistant_messages FOR INSERT WITH CHECK (user_id = auth.uid());

-- User creation trigger
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, role, preferred_language)
  VALUES (
    new.id,
    new.email,
    COALESCE(new.raw_user_meta_data->>'full_name', 'Citizen User'),
    'citizen',
    COALESCE(new.raw_user_meta_data->>'preferred_language', 'en')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Realtime publication
ALTER PUBLICATION supabase_realtime ADD TABLE 
  public.simulation_state,
  public.traffic_data,
  public.traffic_predictions,
  public.signal_approaches,
  public.bus_routes,
  public.bus_predictions,
  public.parking_locations,
  public.parking_predictions,
  public.pedestrian_zones,
  public.emission_data,
  public.emergency_incidents,
  public.ai_recommendations,
  public.alerts;
