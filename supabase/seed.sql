-- ====================================================================
-- SMARTMOVE URBAN MOBILITY INTELLIGENCE PLATFORM
-- Seed Data for Simulation and Realistic Demo Evaluation
-- ====================================================================

-- 1. Simulation State (Default Row)
INSERT INTO public.simulation_state (
  id, traffic_volume, scenario, signal_optimization, extra_buses,
  staggered_departure, parking_guidance, emergency_vehicle_active,
  demo_running, demo_step, sim_clock
) VALUES (
  1, 68, 'peak_hour', false, 0, false, false, false, false, 1, '17:15'
) ON CONFLICT (id) DO UPDATE SET
  traffic_volume = EXCLUDED.traffic_volume,
  scenario = EXCLUDED.scenario,
  updated_at = NOW();

-- 2. Roads
INSERT INTO public.roads (id, name, type, capacity, length_km, speed_limit, start_lat, start_lng, end_lat, end_lng)
VALUES
  ('road_college', 'College Road (Tech Corridor)', 'arterial', 1400, 3.2, 45, 12.9716, 77.5946, 12.9800, 77.6100),
  ('road_bus_stand', 'Main Bus Stand Road', 'arterial', 1800, 4.5, 40, 12.9750, 77.5900, 12.9650, 77.6200),
  ('road_market', 'Market Central Avenue', 'commercial', 1100, 2.1, 30, 12.9680, 77.5980, 12.9730, 77.6050),
  ('road_hospital', 'Hospital Emergency Express Link', 'express', 1600, 5.0, 60, 12.9850, 77.5850, 12.9550, 77.6300),
  ('road_industrial', 'Industrial Ring Corridor', 'highway', 2200, 7.8, 70, 12.9500, 77.5700, 12.9900, 77.6400),
  ('road_junction_b', 'Junction B Connector', 'collector', 900, 1.8, 35, 12.9720, 77.6020, 12.9790, 77.6080)
ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name;

-- 3. Live Traffic Data
INSERT INTO public.traffic_data (id, road_id, road_name, vehicle_count, avg_speed_kmh, congestion_pct, status, source)
VALUES
  ('tf_college', 'road_college', 'College Road (Tech Corridor)', 1180, 14, 84, 'severe', 'SIMULATED DATA'),
  ('tf_bus_stand', 'road_bus_stand', 'Main Bus Stand Road', 1320, 19, 73, 'heavy', 'SIMULATED DATA'),
  ('tf_market', 'road_market', 'Market Central Avenue', 890, 11, 81, 'heavy', 'SIMULATED DATA'),
  ('tf_hospital', 'road_hospital', 'Hospital Emergency Express Link', 620, 42, 38, 'moderate', 'SIMULATED DATA'),
  ('tf_industrial', 'road_industrial', 'Industrial Ring Corridor', 950, 48, 43, 'moderate', 'SIMULATED DATA'),
  ('tf_junction_b', 'road_junction_b', 'Junction B Connector', 780, 16, 86, 'severe', 'SIMULATED DATA')
ON CONFLICT (id) DO UPDATE SET
  vehicle_count = EXCLUDED.vehicle_count,
  avg_speed_kmh = EXCLUDED.avg_speed_kmh,
  congestion_pct = EXCLUDED.congestion_pct,
  status = EXCLUDED.status,
  updated_at = NOW();

-- 4. Traffic Predictions
INSERT INTO public.traffic_predictions (id, road_id, road_name, predicted_15m, predicted_30m, predicted_60m, confidence, reason)
VALUES
  ('pred_college', 'road_college', 'College Road (Tech Corridor)', 92, 78, 45, 91, 'College A & B simultaneous 5:00 PM dispersal + Office tech park exit surge'),
  ('pred_bus_stand', 'road_bus_stand', 'Main Bus Stand Road', 79, 68, 40, 87, 'Commuter inflow from metro feeder transfer and regional buses'),
  ('pred_market', 'road_market', 'Market Central Avenue', 85, 82, 60, 84, 'Evening peak retail footfall combined with curbside parking spillover'),
  ('pred_hospital', 'road_hospital', 'Hospital Emergency Express Link', 42, 35, 28, 93, 'Free flowing corridor with active emergency corridor priority reserve')
ON CONFLICT (id) DO UPDATE SET
  predicted_15m = EXCLUDED.predicted_15m,
  confidence = EXCLUDED.confidence,
  reason = EXCLUDED.reason,
  updated_at = NOW();

-- 5. Signal Approaches
INSERT INTO public.signal_approaches (id, junction_name, north_count, south_count, east_count, west_count, current_cycle_sec, rec_north_sec, rec_south_sec, rec_east_sec, rec_west_sec, status, coordinates)
VALUES
  ('sig_junc_a', 'Junction A (College Gate)', 62, 55, 110, 38, 120, 22, 20, 52, 26, 'optimizing', '[12.9735, 77.5985]'),
  ('sig_junc_b', 'Junction B (Central Market)', 85, 70, 92, 45, 140, 34, 28, 48, 30, 'optimizing', '[12.9710, 77.6040]'),
  ('sig_junc_c', 'Junction C (Bus Stand Terminal)', 40, 48, 125, 60, 150, 20, 24, 66, 40, 'optimizing', '[12.9660, 77.6120]'),
  ('sig_junc_d', 'Junction D (Hospital Cross)', 25, 22, 50, 20, 90, 18, 18, 38, 16, 'green_corridor_ready', '[12.9810, 77.5920]')
ON CONFLICT (id) DO UPDATE SET
  north_count = EXCLUDED.north_count,
  east_count = EXCLUDED.east_count,
  rec_east_sec = EXCLUDED.rec_east_sec,
  updated_at = NOW();

-- 6. Bus Routes
INSERT INTO public.bus_routes (id, route_number, name, current_eta_min, delay_min, current_occupancy_pct, is_overloaded, next_stop, active_buses, stops, coordinates)
VALUES
  ('bus_102', '102', 'Express: Tech Campus ⇄ Central Station', 6, 8, 94, true, 'College North Gate', 6, '["Tech Campus", "College North Gate", "Junction A", "Central Market", "Railway Station"]', '[[12.9716, 77.5946], [12.9750, 77.6010], [12.9710, 77.6040], [12.9650, 77.6200]]'),
  ('bus_105', '105', 'Feeder: North Suburbs ⇄ Metro Interchange', 11, 4, 76, false, 'Market Square', 4, '["North Suburbs", "Market Square", "Junction B", "Metro Hub"]', '[[12.9850, 77.5850], [12.9710, 77.6040], [12.9660, 77.6120]]'),
  ('bus_210', '210', 'Circulator: Ring Road Eco Shuttle', 4, 1, 52, false, 'Hospital Green Link', 5, '["Green Zone", "Hospital Link", "Industrial Park", "South Terminal"]', '[[12.9810, 77.5920], [12.9550, 77.6300], [12.9500, 77.5700]]')
ON CONFLICT (id) DO UPDATE SET
  current_eta_min = EXCLUDED.current_eta_min,
  delay_min = EXCLUDED.delay_min,
  current_occupancy_pct = EXCLUDED.current_occupancy_pct,
  is_overloaded = EXCLUDED.is_overloaded,
  updated_at = NOW();

-- 7. Bus Predictions
INSERT INTO public.bus_predictions (id, route_id, route_number, predicted_occupancy_8m, predicted_delay_min, recommendation, confidence)
VALUES
  ('bpred_102', 'bus_102', '102', 98, 12, 'Deploy 2 standby electric buses from Depot A; advise passengers to take Eco Shuttle 210 for Metro transfers', 92),
  ('bpred_105', 'bus_105', '105', 82, 5, 'Maintain regular frequency; signal green wave active at Junction B', 88),
  ('bpred_210', 'bus_210', '210', 58, 2, 'Underutilized route; recommend as high-speed detour for Southbound passengers', 94)
ON CONFLICT (id) DO UPDATE SET
  predicted_occupancy_8m = EXCLUDED.predicted_occupancy_8m,
  recommendation = EXCLUDED.recommendation,
  updated_at = NOW();

-- 8. Parking Locations & Predictions
INSERT INTO public.parking_locations (id, name, total_spots, occupied_spots, available_spots, hourly_rate, has_ev, lat, lng, status)
VALUES
  ('pk_campus', 'Campus Tech Smart Multi-Level', 240, 226, 14, 25, true, 12.9730, 77.5960, 'filling_fast'),
  ('pk_market', 'Market Square Underground Lot', 180, 172, 8, 35, true, 12.9705, 77.6030, 'nearly_full'),
  ('pk_metro', 'Metro Park & Ride Hub', 350, 195, 155, 20, true, 12.9640, 77.6180, 'ample_spots'),
  ('pk_civic', 'Civic Center South Parking', 120, 65, 55, 30, false, 12.9620, 77.6050, 'ample_spots')
ON CONFLICT (id) DO UPDATE SET
  occupied_spots = EXCLUDED.occupied_spots,
  available_spots = EXCLUDED.available_spots,
  status = EXCLUDED.status,
  updated_at = NOW();

INSERT INTO public.parking_predictions (id, parking_id, name, predicted_avail_15m, trend, recommended, confidence)
VALUES
  ('pkp_campus', 'pk_campus', 'Campus Tech Smart Multi-Level', 2, 'decreasing', false, 91),
  ('pkp_market', 'pk_market', 'Market Square Underground Lot', 0, 'exhausting', false, 94),
  ('pkp_metro', 'pk_metro', 'Metro Park & Ride Hub', 135, 'stable', true, 96),
  ('pkp_civic', 'pk_civic', 'Civic Center South Parking', 42, 'stable', true, 89)
ON CONFLICT (id) DO UPDATE SET
  predicted_avail_15m = EXCLUDED.predicted_avail_15m,
  recommended = EXCLUDED.recommended,
  updated_at = NOW();

-- 9. EV Stations
INSERT INTO public.ev_stations (id, name, total_chargers, available_chargers, power_kw, fast_charging, lat, lng, status)
VALUES
  ('ev_metro', 'Metro Hub Ultra-Fast EV Hub', 8, 5, 120, true, 12.9645, 77.6185, 'available'),
  ('ev_tech', 'Tech Corridor Green Station', 6, 2, 60, true, 12.9740, 77.5950, 'available'),
  ('ev_market', 'Central Market Eco Charge', 4, 0, 30, false, 12.9700, 77.6025, 'occupied'),
  ('ev_hospital', 'Hospital Solar EV Depot', 6, 4, 150, true, 12.9830, 77.5900, 'available')
ON CONFLICT (id) DO UPDATE SET
  available_chargers = EXCLUDED.available_chargers,
  status = EXCLUDED.status,
  updated_at = NOW();

-- 10. Pedestrian Safety Zones
INSERT INTO public.pedestrian_zones (id, name, pedestrian_count, vehicle_density, risk_score, risk_level, safer_crossing, lat, lng)
VALUES
  ('ped_college', 'College Main Gate Crossing', 240, 85, 78, 'Higher', 'Use Grade-Separated Skywalk at Gate 2', 12.9725, 77.5970),
  ('ped_market', 'Market Bazaar Crosswalk', 310, 72, 68, 'Higher', 'Use Mid-block Pelican Signal with 30s clearance', 12.9708, 77.6045),
  ('ped_bus_stand', 'Bus Stand Terminal Forecourt', 190, 58, 48, 'Moderate', 'Follow Illuminated Pedestrian Safety Corridor', 12.9665, 77.6130),
  ('ped_hospital', 'Hospital Emergency Gate', 45, 30, 22, 'Lower', 'Dedicated Ambulance Zebra with tactile pavers', 12.9820, 77.5910)
ON CONFLICT (id) DO UPDATE SET
  risk_score = EXCLUDED.risk_score,
  risk_level = EXCLUDED.risk_level,
  updated_at = NOW();

-- 11. Emission Data
INSERT INTO public.emission_data (id, area_name, co2_kg_hr, fuel_wasted_liters_hr, avg_congestion_pct, estimated_reduction_pct, source)
VALUES
  ('em_tech', 'College & Tech Corridor', 540.20, 215.80, 84, 28, 'ESTIMATED VALUE'),
  ('em_central', 'Central Commercial Core', 410.50, 162.30, 77, 24, 'ESTIMATED VALUE'),
  ('em_ring', 'Industrial Transit Ring', 290.00, 110.40, 43, 15, 'ESTIMATED VALUE')
ON CONFLICT (id) DO UPDATE SET
  co2_kg_hr = EXCLUDED.co2_kg_hr,
  fuel_wasted_liters_hr = EXCLUDED.fuel_wasted_liters_hr,
  updated_at = NOW();

-- 12. Emergency Corridors
INSERT INTO public.emergency_incidents (id, vehicle_type, start_location, destination, current_eta_normal, current_eta_ai, time_saved_min, active, corridors, junctions_to_avoid)
VALUES
  ('emg_01', 'Ambulance 108 (Cardiac Critical)', 'Tech Park Health Post', 'City Multi-Specialty Hospital', 14, 8, 6, false,
   '["Hospital Express Way", "Junction D Bypass", "Green Priority Avenue"]',
   '["Junction A (Congested)", "Market Cross (Bottleneck)"]')
ON CONFLICT (id) DO UPDATE SET
  current_eta_normal = EXCLUDED.current_eta_normal,
  current_eta_ai = EXCLUDED.current_eta_ai,
  updated_at = NOW();

-- 13. Mobility Schedules (Colleges & Offices)
INSERT INTO public.mobility_schedules (id, entity_name, entity_type, departure_time, expected_people, zone, staggered_suggested_time, active)
VALUES
  ('sch_col_a', 'National Institute of Technology (NIT)', 'college', '17:00', 2200, 'Tech Corridor', '16:45', true),
  ('sch_col_b', 'City Arts & Science College', 'college', '17:05', 1800, 'Tech Corridor', '17:15', true),
  ('sch_off_a', 'Apex Software Tech Park', 'office', '17:15', 3100, 'Tech Corridor', '17:35', true),
  ('sch_off_b', 'Global Fintech Tower', 'office', '17:30', 1600, 'Central Zone', '17:50', true)
ON CONFLICT (id) DO UPDATE SET
  departure_time = EXCLUDED.departure_time,
  expected_people = EXCLUDED.expected_people,
  updated_at = NOW();

-- 14. AI Recommendations
INSERT INTO public.ai_recommendations (id, category, title, problem, prediction, recommendation, estimated_impact, why_reasons, confidence, connected_effects, active)
VALUES
  ('rec_01', 'transit', 'Deploy 2 Standby Feeder Buses to College Gate',
   'Simultaneous departure of NIT and City College causing 94% overload on Bus Route 102 and 22-minute pedestrian curb spillover.',
   'Bus 102 queue will exceed 140 passengers with 15+ min wait times unless additional capacity is injected.',
   'Activate 2 standby high-capacity electric buses from North Depot to route 102 between 17:00 and 17:40.',
   '-38% passenger wait time, -22% road vehicular surge as students choose transit.',
   '["NIT 2,200 students dismiss at 17:00", "Bus 102 currently at 94% capacity", "Curbside pedestrian density reaching 78/100 risk level", "Direct correlation to College Road 84% congestion"]',
   93,
   '["Traffic Surge", "Bus Overload", "Pedestrian Risk at Gate", "Emissions Spike"]',
   true),

  ('rec_02', 'signal', 'Dynamic Green Wave on Junction A & B East Approaches',
   'Eastbound corridor traffic queue extending 680 meters along College Road towards Junction B.',
   'Unmanaged signal cycles will trigger complete gridlock across Junction B intersection within 12 minutes.',
   'Dynamically extend Eastbound green split from 25s to 52s and hold Northbound left turn for 15s.',
   'Clear Eastbound queue by 45%, reduce average signal delay by 6.2 minutes per vehicle.',
   '["Eastbound vehicle count is 110 vs 38 Westbound", "Queue length approaching gridlock threshold", "Simulated flow improves throughput by 420 vehicles/hour"]',
   91,
   '["Junction Queue Clearance", "Reduced Idling Fuel Waste", "Smoother Bus Transit"]',
   true),

  ('rec_03', 'parking', 'Dynamic Parking Diversion to Metro Park & Ride',
   'Market Square lot at 95% capacity; drivers circling for spots causing 35% of local gridlock.',
   'Market lot will hit 100% capacity in 6 minutes, spilling queues into main arterial lanes.',
   'Broadcast dynamic parking guidance signage redirecting incoming vehicles to Metro Park & Ride (155 spots open + EV fast charging).',
   'Eliminate 80+ cruising vehicles from Market Avenue, saving ~95 liters of idling fuel/hour.',
   '["Market lot has only 8 spots remaining", "Metro Hub is 700m away with 155 open bays", "Idling emissions in commercial core reduced by 24%"]',
   89,
   '["Zero Cruising Delay", "Emissions Drop", "Pedestrian Safety Boost in Market"]',
   true),

  ('rec_04', 'staggered', 'Stagger College & Tech Park Dismissal Times by 25 Minutes',
   'NIT, City College, and Apex Tech Park exiting in a narrow 20-minute window creates a combined 7,100 person demand spike.',
   'Peak vehicle surge creates severe 88%+ congestion lasting from 17:00 to 18:15.',
   'Recommend AI Staggered Departure: NIT at 16:45, City College at 17:15, and Apex Tech Park at 17:35.',
   'Flatten peak surge curve by 42%, cut overall travel times by 11 minutes per commuter.',
   '["7,100 people releasing simultaneously exceeds road carrying capacity of 1,400 vph", "Smoothing arrival rates keeps bus occupancy under 80%"]',
   95,
   '["Peak Flattening", "Reduced Signal Queues", "Lower Ambient Air Pollution"]',
   true)
ON CONFLICT (id) DO UPDATE SET
  recommendation = EXCLUDED.recommendation,
  estimated_impact = EXCLUDED.estimated_impact,
  updated_at = NOW();

-- 15. Broadcast Alerts
INSERT INTO public.alerts (id, title, message, severity, category, read, is_broadcast)
VALUES
  ('alt_01', 'College Road Heavy Congestion Warning', 'Severe congestion (84%) near College Gate due to evening peak dismissal. Recommend Route B via Metro Link or Bus 210.', 'warning', 'traffic', false, true),
  ('alt_02', 'High Pedestrian Activity at Market Cross', 'Caution: Elevated pedestrian footfall at Central Market. Driver speeds restricted to 25 km/h.', 'info', 'safety', false, true),
  ('alt_03', 'Bus 102 Overload Alert', 'Bus 102 running at 94% occupancy. 2 additional transit shuttles deployed to clear waiting crowds.', 'info', 'transit', false, true)
ON CONFLICT (id) DO NOTHING;
