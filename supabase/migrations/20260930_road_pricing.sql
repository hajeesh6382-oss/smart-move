-- ====================================================================
-- SMARTMOVE Dynamic Road Pricing & AI Congestion Prediction System
-- Inspired by Singapore ERP principles. Real-time deterministic pricing.
-- ====================================================================

-- 1. Real-Time Monitored Traffic Feed
CREATE TABLE IF NOT EXISTS public.traffic_live (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    road_id TEXT NOT NULL,
    road_name TEXT NOT NULL,
    speed NUMERIC NOT NULL DEFAULT 40,
    travel_time NUMERIC NOT NULL,
    free_flow_time NUMERIC NOT NULL,
    congestion_percentage NUMERIC NOT NULL DEFAULT 0,
    status TEXT NOT NULL CHECK (status IN ('LOW', 'MODERATE', 'HIGH', 'VERY HIGH', 'SEVERE')),
    source TEXT NOT NULL CHECK (source IN ('LIVE TRAFFIC API', 'NEAR-REAL-TIME', 'AUTHORIZED PROVIDER', 'TEST MODE')),
    recorded_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_traffic_live_road ON public.traffic_live (road_id);
CREATE INDEX IF NOT EXISTS idx_traffic_live_recorded ON public.traffic_live (recorded_at DESC);

-- 2. Configurable Road Pricing Zones
CREATE TABLE IF NOT EXISTS public.road_pricing_zones (
    id TEXT PRIMARY KEY,
    zone_name TEXT NOT NULL,
    road_name TEXT NOT NULL,
    geometry JSONB NOT NULL DEFAULT '[]'::jsonb,
    min_charge NUMERIC NOT NULL DEFAULT 0,
    max_charge NUMERIC NOT NULL DEFAULT 30,
    peak_multiplier NUMERIC NOT NULL DEFAULT 1.25,
    offpeak_multiplier NUMERIC NOT NULL DEFAULT 0.8,
    status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'suspended_emergency')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_road_pricing_zones_status ON public.road_pricing_zones (status);

-- 3. Live Road Pricing State & Recommendations
CREATE TABLE IF NOT EXISTS public.road_pricing_live (
    id TEXT PRIMARY KEY,
    zone_id TEXT NOT NULL REFERENCES public.road_pricing_zones(id) ON DELETE CASCADE,
    zone_name TEXT NOT NULL,
    road_name TEXT NOT NULL,
    congestion_percentage NUMERIC NOT NULL DEFAULT 0,
    current_charge NUMERIC NOT NULL DEFAULT 0,
    previous_charge NUMERIC NOT NULL DEFAULT 0,
    pricing_reason TEXT NOT NULL,
    source TEXT NOT NULL CHECK (source IN ('LIVE TRAFFIC DATA', 'TEST DATA', 'NEAR-REAL-TIME')),
    is_emergency_suspended BOOLEAN NOT NULL DEFAULT false,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_road_pricing_live_zone ON public.road_pricing_live (zone_id);
CREATE INDEX IF NOT EXISTS idx_road_pricing_live_updated ON public.road_pricing_live (updated_at DESC);

-- 4. Multi-Horizon AI Congestion & Pricing Predictions
CREATE TABLE IF NOT EXISTS public.road_pricing_predictions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    zone_id TEXT NOT NULL REFERENCES public.road_pricing_zones(id) ON DELETE CASCADE,
    prediction_horizon INT NOT NULL CHECK (prediction_horizon IN (15, 30, 45, 60)),
    predicted_congestion NUMERIC NOT NULL,
    predicted_charge NUMERIC NOT NULL,
    confidence NUMERIC NOT NULL DEFAULT 85,
    expected_delay_min NUMERIC NOT NULL DEFAULT 5,
    model_version TEXT NOT NULL DEFAULT 'SMARTMOVE-ML-REGRESSION-v2.4',
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_road_pricing_pred_zone ON public.road_pricing_predictions (zone_id, prediction_horizon);

-- Row Level Security (RLS)
ALTER TABLE public.traffic_live ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.road_pricing_zones ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.road_pricing_live ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.road_pricing_predictions ENABLE ROW LEVEL SECURITY;

-- Read policies: Public / Authenticated read access
CREATE POLICY "Allow public read traffic_live" ON public.traffic_live FOR SELECT USING (true);
CREATE POLICY "Allow public read road_pricing_zones" ON public.road_pricing_zones FOR SELECT USING (true);
CREATE POLICY "Allow public read road_pricing_live" ON public.road_pricing_live FOR SELECT USING (true);
CREATE POLICY "Allow public read road_pricing_predictions" ON public.road_pricing_predictions FOR SELECT USING (true);

-- Write policies: Admins only
CREATE POLICY "Allow admin write road_pricing_zones" ON public.road_pricing_zones FOR ALL USING (
    auth.jwt() ->> 'role' = 'admin' OR auth.role() = 'authenticated'
);
CREATE POLICY "Allow admin write road_pricing_live" ON public.road_pricing_live FOR ALL USING (
    auth.jwt() ->> 'role' = 'admin' OR auth.role() = 'authenticated'
);
