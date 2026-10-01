// SMARTMOVE Local Reactive Simulation Store
// Synchronizes city state in-memory and across browser tabs using BroadcastChannel & CustomEvents
// Features: Manual/IoT-free parking records, historical baselines, bus booking transactions, and live streams

import { simulateScenario } from '../ai/simulationEngine';
import { DEMO_STEPS } from '../ai/demoTimeline';

type Listener = () => void;

export interface ParkingLiveRecord {
  id: string;
  parking_id: string;
  parking_name: string;
  latitude: number;
  longitude: number;
  total_capacity: number;
  occupied_spaces: number;
  available_spaces: number;
  occupancy_percentage: number;
  status: 'available' | 'filling_fast' | 'nearly_full' | 'closed';
  source_type: 'manual' | 'api' | 'historical' | 'estimated' | 'prediction';
  event_note?: string;
  expected_demand?: 'Normal' | 'High Surge (+25%)' | 'Severe Surge (+50%)' | 'Low (-20%)';
  hourly_rate: number;
  has_ev: boolean;
  recorded_at: string;
  updated_at: string;
}

export interface BusBookingRecord {
  id: string;
  pnr: string;
  bus_id: string;
  bus_name: string;
  operator: string;
  bus_number: string;
  from_city: string;
  to_city: string;
  travel_date: string;
  departure_time: string;
  arrival_time: string;
  seat_number: string;
  passenger_name: string;
  passenger_age: number;
  passenger_gender: string;
  passenger_contact: string;
  fare_amount: number;
  booking_status: 'CONFIRMED' | 'CANCELLED' | 'PENDING';
  booking_provider: string;
  source_type: 'live_api' | 'authorized_provider';
  created_at: string;
}

class ReactiveCityStore {
  private listeners: Map<string, Set<Listener>> = new Map();
  private broadcastChannel: BroadcastChannel | null = null;
  private tickInterval: any = null;

  public state = {
    simulation_state: {
      id: 1,
      traffic_volume: 68,
      scenario: 'peak_hour',
      signal_optimization: false,
      extra_buses: 0,
      staggered_departure: false,
      parking_guidance: false,
      emergency_vehicle_active: false,
      demo_running: false,
      demo_step: 1,
      sim_clock: '17:15',
      updated_at: new Date().toISOString(),
    },
    traffic_data: [
      { id: 'tf_college', road_id: 'road_college', road_name: 'College Road (Tech Corridor)', vehicle_count: 1180, avg_speed_kmh: 14, congestion_pct: 84, status: 'severe', source: 'SIMULATED DATA', updated_at: new Date().toISOString() },
      { id: 'tf_bus_stand', road_id: 'road_bus_stand', road_name: 'Main Bus Stand Road', vehicle_count: 1320, avg_speed_kmh: 19, congestion_pct: 73, status: 'heavy', source: 'SIMULATED DATA', updated_at: new Date().toISOString() },
      { id: 'tf_market', road_id: 'road_market', road_name: 'Market Central Avenue', vehicle_count: 890, avg_speed_kmh: 11, congestion_pct: 81, status: 'heavy', source: 'SIMULATED DATA', updated_at: new Date().toISOString() },
      { id: 'tf_hospital', road_id: 'road_hospital', road_name: 'Hospital Emergency Express Link', vehicle_count: 620, avg_speed_kmh: 42, congestion_pct: 38, status: 'moderate', source: 'SIMULATED DATA', updated_at: new Date().toISOString() },
      { id: 'tf_industrial', road_id: 'road_industrial', road_name: 'Industrial Ring Corridor', vehicle_count: 950, avg_speed_kmh: 48, congestion_pct: 43, status: 'moderate', source: 'SIMULATED DATA', updated_at: new Date().toISOString() },
    ],
    traffic_predictions: [
      { id: 'pred_college', road_id: 'road_college', road_name: 'College Road (Tech Corridor)', predicted_15m: 92, predicted_30m: 78, predicted_60m: 45, confidence: 91, reason: 'College A & B simultaneous 5:00 PM dispersal + Office tech park exit surge', updated_at: new Date().toISOString() },
      { id: 'pred_bus_stand', road_id: 'road_bus_stand', road_name: 'Main Bus Stand Road', predicted_15m: 79, predicted_30m: 68, predicted_60m: 40, confidence: 87, reason: 'Commuter inflow from metro feeder transfer and regional buses', updated_at: new Date().toISOString() },
      { id: 'pred_market', road_id: 'road_market', road_name: 'Market Central Avenue', predicted_15m: 85, predicted_30m: 82, predicted_60m: 60, confidence: 84, reason: 'Evening peak retail footfall combined with curbside parking spillover', updated_at: new Date().toISOString() },
      { id: 'pred_hospital', road_id: 'road_hospital', road_name: 'Hospital Emergency Express Link', predicted_15m: 42, predicted_30m: 35, predicted_60m: 28, confidence: 93, reason: 'Free flowing corridor with active emergency corridor priority reserve', updated_at: new Date().toISOString() },
    ],
    signal_approaches: [
      { id: 'sig_junc_a', junction_name: 'Junction A (College Gate)', north_count: 62, south_count: 55, east_count: 110, west_count: 38, current_cycle_sec: 120, rec_north_sec: 22, rec_south_sec: 20, rec_east_sec: 52, rec_west_sec: 26, status: 'optimizing', coordinates: [12.9735, 77.5985], updated_at: new Date().toISOString() },
      { id: 'sig_junc_b', junction_name: 'Junction B (Central Market)', north_count: 85, south_count: 70, east_count: 92, west_count: 45, current_cycle_sec: 140, rec_north_sec: 34, rec_south_sec: 28, rec_east_sec: 48, rec_west_sec: 30, status: 'optimizing', coordinates: [12.9710, 77.6040], updated_at: new Date().toISOString() },
      { id: 'sig_junc_c', junction_name: 'Junction C (Bus Stand Terminal)', north_count: 40, south_count: 48, east_count: 125, west_count: 60, current_cycle_sec: 150, rec_north_sec: 20, rec_south_sec: 24, rec_east_sec: 66, rec_west_sec: 40, status: 'optimizing', coordinates: [12.9660, 77.6120], updated_at: new Date().toISOString() },
      { id: 'sig_junc_d', junction_name: 'Junction D (Hospital Cross)', north_count: 25, south_count: 22, east_count: 50, west_count: 20, current_cycle_sec: 90, rec_north_sec: 18, rec_south_sec: 18, rec_east_sec: 38, rec_west_sec: 16, status: 'green_corridor_ready', coordinates: [12.9810, 77.5920], updated_at: new Date().toISOString() },
    ],
    bus_routes: [
      { id: 'bus_102', route_number: '102', name: 'Express: Tech Campus ⇄ Central Station', current_eta_min: 6, delay_min: 8, current_occupancy_pct: 94, is_overloaded: true, next_stop: 'College North Gate', active_buses: 4, stops: ['Tech Campus', 'College North Gate', 'Junction A', 'Central Market', 'Railway Station'], coordinates: [[12.9716, 77.5946], [12.9750, 77.6010], [12.9710, 77.6040], [12.9650, 77.6200]], updated_at: new Date().toISOString() },
      { id: 'bus_105', route_number: '105', name: 'Feeder: North Suburbs ⇄ Metro Interchange', current_eta_min: 11, delay_min: 4, current_occupancy_pct: 76, is_overloaded: false, next_stop: 'Market Square', active_buses: 4, stops: ['North Suburbs', 'Market Square', 'Junction B', 'Metro Hub'], coordinates: [[12.9850, 77.5850], [12.9710, 77.6040], [12.9660, 77.6120]], updated_at: new Date().toISOString() },
      { id: 'bus_210', route_number: '210', name: 'Circulator: Ring Road Eco Shuttle', current_eta_min: 4, delay_min: 1, current_occupancy_pct: 52, is_overloaded: false, next_stop: 'Hospital Green Link', active_buses: 5, stops: ['Green Zone', 'Hospital Link', 'Industrial Park', 'South Terminal'], coordinates: [[12.9810, 77.5920], [12.9550, 77.6300], [12.9500, 77.5700]], updated_at: new Date().toISOString() },
    ],
    bus_predictions: [
      { id: 'bpred_102', route_id: 'bus_102', route_number: '102', predicted_occupancy_8m: 98, predicted_delay_min: 12, recommendation: 'Deploy 2 standby electric buses from Depot A; advise passengers to take Eco Shuttle 210 for Metro transfers', confidence: 92, updated_at: new Date().toISOString() },
      { id: 'bpred_105', route_id: 'bus_105', route_number: '105', predicted_occupancy_8m: 82, predicted_delay_min: 5, recommendation: 'Maintain regular frequency; signal green wave active at Junction B', confidence: 88, updated_at: new Date().toISOString() },
      { id: 'bpred_210', route_id: 'bus_210', route_number: '210', predicted_occupancy_8m: 58, predicted_delay_min: 2, recommendation: 'Underutilized route; recommend as high-speed detour for Southbound passengers', confidence: 94, updated_at: new Date().toISOString() },
    ],
    // FEATURE 1: Dedicated IoT-Free Parking Live Table
    parking_live: [
      {
        id: 'pkl_metro',
        parking_id: 'pk_metro',
        parking_name: 'Metro Park & Ride Hub',
        latitude: 12.9640,
        longitude: 77.6180,
        total_capacity: 350,
        occupied_spaces: 195,
        available_spaces: 155,
        occupancy_percentage: 55.7,
        status: 'available',
        source_type: 'manual',
        event_note: 'Normal transit interchange operations',
        expected_demand: 'Normal',
        hourly_rate: 20,
        has_ev: true,
        recorded_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
      {
        id: 'pkl_market',
        parking_id: 'pk_market',
        parking_name: 'Market Square Underground Lot',
        latitude: 12.9705,
        longitude: 77.6030,
        total_capacity: 180,
        occupied_spaces: 172,
        available_spaces: 8,
        occupancy_percentage: 95.6,
        status: 'nearly_full',
        source_type: 'manual',
        event_note: 'Evening retail rush',
        expected_demand: 'High Surge (+25%)',
        hourly_rate: 35,
        has_ev: true,
        recorded_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
      {
        id: 'pkl_campus',
        parking_id: 'pk_campus',
        parking_name: 'Campus Tech Smart Multi-Level',
        latitude: 12.9730,
        longitude: 77.5960,
        total_capacity: 240,
        occupied_spaces: 226,
        available_spaces: 14,
        occupancy_percentage: 94.2,
        status: 'filling_fast',
        source_type: 'manual',
        event_note: 'College evening student departure',
        expected_demand: 'High Surge (+25%)',
        hourly_rate: 25,
        has_ev: true,
        recorded_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
      {
        id: 'pkl_civic',
        parking_id: 'pk_civic',
        parking_name: 'Civic Center South Parking',
        latitude: 12.9620,
        longitude: 77.6050,
        total_capacity: 120,
        occupied_spaces: 65,
        available_spaces: 55,
        occupancy_percentage: 54.2,
        status: 'available',
        source_type: 'manual',
        event_note: 'Municipal center off-peak',
        expected_demand: 'Normal',
        hourly_rate: 30,
        has_ev: false,
        recorded_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
    ] as ParkingLiveRecord[],
    parking_locations: [
      { id: 'pk_campus', name: 'Campus Tech Smart Multi-Level', total_spots: 240, occupied_spots: 226, available_spots: 14, hourly_rate: 25, has_ev: true, lat: 12.9730, lng: 77.5960, status: 'filling_fast', source: 'MANUAL DATA', updated_at: new Date().toISOString() },
      { id: 'pk_market', name: 'Market Square Underground Lot', total_spots: 180, occupied_spots: 172, available_spots: 8, hourly_rate: 35, has_ev: true, lat: 12.9705, lng: 77.6030, status: 'nearly_full', source: 'MANUAL DATA', updated_at: new Date().toISOString() },
      { id: 'pk_metro', name: 'Metro Park & Ride Hub', total_spots: 350, occupied_spots: 195, available_spots: 155, hourly_rate: 20, has_ev: true, lat: 12.9640, lng: 77.6180, status: 'ample_spots', source: 'MANUAL DATA', updated_at: new Date().toISOString() },
      { id: 'pk_civic', name: 'Civic Center South Parking', total_spots: 120, occupied_spots: 65, available_spots: 55, hourly_rate: 30, has_ev: false, lat: 12.9620, lng: 77.6050, status: 'ample_spots', source: 'MANUAL DATA', updated_at: new Date().toISOString() },
    ],
    parking_predictions: [
      { id: 'pkp_campus', parking_id: 'pk_campus', name: 'Campus Tech Smart Multi-Level', predicted_avail_15m: 2, trend: 'decreasing', recommended: false, confidence: 91, updated_at: new Date().toISOString() },
      { id: 'pkp_market', parking_id: 'pk_market', name: 'Market Square Underground Lot', predicted_avail_15m: 0, trend: 'exhausting', recommended: false, confidence: 94, updated_at: new Date().toISOString() },
      { id: 'pkp_metro', parking_id: 'pk_metro', name: 'Metro Park & Ride Hub', predicted_avail_15m: 135, trend: 'stable', recommended: true, confidence: 96, updated_at: new Date().toISOString() },
      { id: 'pkp_civic', parking_id: 'pk_civic', name: 'Civic Center South Parking', predicted_avail_15m: 42, trend: 'stable', recommended: true, confidence: 89, updated_at: new Date().toISOString() },
    ],
    // FEATURE 2: Bus Bookings Table
    bus_bookings: [
      {
        id: 'bk_sample_01',
        pnr: 'SM-TN-849201',
        bus_id: 'bus_102',
        bus_name: 'Smart Express 102',
        operator: 'TNSTC Smart Fleet',
        bus_number: 'TN-60-N-2418',
        from_city: 'Theni',
        to_city: 'Periyakulam',
        travel_date: 'Today',
        departure_time: '05:30 PM',
        arrival_time: '06:20 PM',
        seat_number: 'A2',
        passenger_name: 'N.A. Hajeesh',
        passenger_age: 28,
        passenger_gender: 'Male',
        passenger_contact: '+91 98401 23456',
        fare_amount: 120,
        booking_status: 'CONFIRMED',
        booking_provider: 'Tamil Nadu Smart Transit Gateway (Authorized API)',
        source_type: 'authorized_provider',
        created_at: new Date().toISOString(),
      },
    ] as BusBookingRecord[],
    ev_stations: [
      { id: 'ev_metro', name: 'Metro Hub Ultra-Fast EV Hub', total_chargers: 8, available_chargers: 5, power_kw: 120, fast_charging: true, lat: 12.9645, lng: 77.6185, status: 'available', updated_at: new Date().toISOString() },
      { id: 'ev_tech', name: 'Tech Corridor Green Station', total_chargers: 6, available_chargers: 2, power_kw: 60, fast_charging: true, lat: 12.9740, lng: 77.5950, status: 'available', updated_at: new Date().toISOString() },
      { id: 'ev_market', name: 'Central Market Eco Charge', total_chargers: 4, available_chargers: 0, power_kw: 30, fast_charging: false, lat: 12.9700, lng: 77.6025, status: 'occupied', updated_at: new Date().toISOString() },
      { id: 'ev_hospital', name: 'Hospital Solar EV Depot', total_chargers: 6, available_chargers: 4, power_kw: 150, fast_charging: true, lat: 12.9830, lng: 77.5900, status: 'available', updated_at: new Date().toISOString() },
    ],
    pedestrian_zones: [
      { id: 'ped_college', name: 'College Main Gate Crossing', pedestrian_count: 240, vehicle_density: 85, risk_score: 78, risk_level: 'Higher', safer_crossing: 'Use Grade-Separated Skywalk at Gate 2', lat: 12.9725, lng: 77.5970, updated_at: new Date().toISOString() },
      { id: 'ped_market', name: 'Market Bazaar Crosswalk', pedestrian_count: 310, vehicle_density: 72, risk_score: 68, risk_level: 'Higher', safer_crossing: 'Use Mid-block Pelican Signal with 30s clearance', lat: 12.9708, lng: 77.6045, updated_at: new Date().toISOString() },
      { id: 'ped_bus_stand', name: 'Bus Stand Terminal Forecourt', pedestrian_count: 190, vehicle_density: 58, risk_score: 48, risk_level: 'Moderate', safer_crossing: 'Follow Illuminated Pedestrian Safety Corridor', lat: 12.9665, lng: 77.6130, updated_at: new Date().toISOString() },
      { id: 'ped_hospital', name: 'Hospital Emergency Gate', pedestrian_count: 45, vehicle_density: 30, risk_score: 22, risk_level: 'Lower', safer_crossing: 'Dedicated Ambulance Zebra with tactile pavers', lat: 12.9820, lng: 77.5910, updated_at: new Date().toISOString() },
    ],
    emission_data: [
      { id: 'em_tech', area_name: 'College & Tech Corridor', co2_kg_hr: 540.20, fuel_wasted_liters_hr: 215.80, avg_congestion_pct: 84, estimated_reduction_pct: 28, source: 'ESTIMATED VALUE', updated_at: new Date().toISOString() },
      { id: 'em_central', area_name: 'Central Commercial Core', co2_kg_hr: 410.50, fuel_wasted_liters_hr: 162.30, avg_congestion_pct: 77, estimated_reduction_pct: 24, source: 'ESTIMATED VALUE', updated_at: new Date().toISOString() },
      { id: 'em_ring', area_name: 'Industrial Transit Ring', co2_kg_hr: 290.00, fuel_wasted_liters_hr: 110.40, avg_congestion_pct: 43, estimated_reduction_pct: 15, source: 'ESTIMATED VALUE', updated_at: new Date().toISOString() },
    ],
    emergency_incidents: [
      { id: 'emg_01', vehicle_type: 'Ambulance 108 (Cardiac Critical)', start_location: 'Tech Park Health Post', destination: 'City Multi-Specialty Hospital', current_eta_normal: 14, current_eta_ai: 8, time_saved_min: 6, active: false, corridors: ['Hospital Express Way', 'Junction D Bypass', 'Green Priority Avenue'], junctions_to_avoid: ['Junction A (Congested)', 'Market Cross (Bottleneck)'], updated_at: new Date().toISOString() },
    ],
    mobility_schedules: [
      { id: 'sch_col_a', entity_name: 'National Institute of Technology (NIT)', entity_type: 'college', departure_time: '17:00', expected_people: 2200, zone: 'Tech Corridor', staggered_suggested_time: '16:45', active: true, updated_at: new Date().toISOString() },
      { id: 'sch_col_b', entity_name: 'City Arts & Science College', entity_type: 'college', departure_time: '17:05', expected_people: 1800, zone: 'Tech Corridor', staggered_suggested_time: '17:15', active: true, updated_at: new Date().toISOString() },
      { id: 'sch_off_a', entity_name: 'Apex Software Tech Park', entity_type: 'office', departure_time: '17:15', expected_people: 3100, zone: 'Tech Corridor', staggered_suggested_time: '17:35', active: true, updated_at: new Date().toISOString() },
      { id: 'sch_off_b', entity_name: 'Global Fintech Tower', entity_type: 'office', departure_time: '17:30', expected_people: 1600, zone: 'Central Zone', staggered_suggested_time: '17:50', active: true, updated_at: new Date().toISOString() },
    ],
    ai_recommendations: [
      {
        id: 'rec_01',
        category: 'transit',
        title: 'Deploy 2 Standby Feeder Buses to College Gate',
        problem: 'Simultaneous departure of NIT and City College causing 94% overload on Bus Route 102 and 22-minute pedestrian curb spillover.',
        prediction: 'Bus 102 queue will exceed 140 passengers with 15+ min wait times unless additional capacity is injected.',
        recommendation: 'Activate 2 standby high-capacity electric buses from North Depot to route 102 between 17:00 and 17:40.',
        estimated_impact: '-38% passenger wait time, -22% road vehicular surge as students choose transit.',
        why_reasons: ['NIT 2,200 students dismiss at 17:00', 'Bus 102 currently at 94% capacity', 'Curbside pedestrian density reaching 78/100 risk level', 'Direct correlation to College Road 84% congestion'],
        confidence: 93,
        connected_effects: ['Traffic Surge', 'Bus Overload', 'Pedestrian Risk at Gate', 'Emissions Spike'],
        active: true,
        updated_at: new Date().toISOString(),
      },
      {
        id: 'rec_03',
        category: 'parking',
        title: 'Dynamic Parking Diversion to Metro Park & Ride',
        problem: 'Market Square lot at 95% capacity; drivers circling for spots causing 35% of local gridlock.',
        prediction: 'Market lot will hit 100% capacity in 6 minutes, spilling queues into main arterial lanes.',
        recommendation: 'Broadcast dynamic parking guidance signage redirecting incoming vehicles to Metro Park & Ride (155 spots open + EV fast charging).',
        estimated_impact: 'Eliminate 80+ cruising vehicles from Market Avenue, saving ~95 liters of idling fuel/hour.',
        why_reasons: ['Market lot has only 8 spots remaining', 'Metro Hub is 700m away with 155 open bays', 'Idling emissions in commercial core reduced by 24%'],
        confidence: 89,
        connected_effects: ['Zero Cruising Delay', 'Emissions Drop', 'Pedestrian Safety Boost in Market'],
        active: true,
        updated_at: new Date().toISOString(),
      },
    ],
    alerts: [
      {
        id: 'alt_01',
        title: 'College Road Peak Congestion',
        message: 'Heavy student and commuter surge detected. Staggered departure advisory issued.',
        severity: 'severe',
        category: 'traffic',
        read: false,
        created_at: new Date().toISOString(),
      },
    ],
    active_incidents: [
      {
        id: 'inc_01',
        type: 'road_closure',
        title: 'College Gate Road Resurfacing',
        location_name: 'Tech Corridor North approach',
        lat: 12.9730,
        lng: 77.5960,
        severity: 'high',
        status: 'active',
        created_at: new Date().toISOString(),
      },
    ],
    // DYNAMIC ROAD PRICING TABLES
    traffic_live: [
      {
        id: 'tf_live_central',
        road_id: 'zone_central',
        road_name: 'Four Roads / Meyyanur Link',
        speed: 28,
        travel_time: 435,
        free_flow_time: 300,
        congestion_percentage: 45,
        status: 'MODERATE',
        source: 'AUTHORIZED PROVIDER',
        recorded_at: new Date().toISOString(),
      },
      {
        id: 'tf_live_tech',
        road_id: 'zone_tech_corridor',
        road_name: 'Junction Main Road',
        speed: 24,
        travel_time: 460,
        free_flow_time: 300,
        congestion_percentage: 53,
        status: 'HIGH',
        source: 'AUTHORIZED PROVIDER',
        recorded_at: new Date().toISOString(),
      },
      {
        id: 'tf_live_market',
        road_id: 'zone_market_cross',
        road_name: 'Old Town Fort Avenue',
        speed: 36,
        travel_time: 390,
        free_flow_time: 300,
        congestion_percentage: 30,
        status: 'LOW',
        source: 'AUTHORIZED PROVIDER',
        recorded_at: new Date().toISOString(),
      },
    ],
    road_pricing_zones: [
      {
        id: 'zone_central',
        zone_name: 'Central Urban Core',
        road_name: 'Four Roads / Meyyanur Link',
        geometry: [
          { lat: 11.6680, lng: 78.1400 },
          { lat: 11.6695, lng: 78.1520 },
          { lat: 11.6600, lng: 78.1530 },
          { lat: 11.6585, lng: 78.1410 },
        ],
        min_charge: 0,
        max_charge: 30,
        peak_multiplier: 1.25,
        offpeak_multiplier: 0.8,
        status: 'active',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
      {
        id: 'zone_tech_corridor',
        zone_name: 'Tech & University Arterial',
        road_name: 'Junction Main Road',
        geometry: [
          { lat: 11.6750, lng: 78.1250 },
          { lat: 11.6780, lng: 78.1360 },
          { lat: 11.6700, lng: 78.1380 },
          { lat: 11.6670, lng: 78.1270 },
        ],
        min_charge: 0,
        max_charge: 30,
        peak_multiplier: 1.25,
        offpeak_multiplier: 0.8,
        status: 'active',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
      {
        id: 'zone_market_cross',
        zone_name: 'Downtown Commercial Hub',
        road_name: 'Old Town Fort Avenue',
        geometry: [
          { lat: 11.6530, lng: 78.1550 },
          { lat: 11.6570, lng: 78.1650 },
          { lat: 11.6490, lng: 78.1660 },
          { lat: 11.6460, lng: 78.1560 },
        ],
        min_charge: 0,
        max_charge: 30,
        peak_multiplier: 1.25,
        offpeak_multiplier: 0.8,
        status: 'active',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
    ],
    road_pricing_live: [
      {
        id: 'live_zone_central',
        zone_id: 'zone_central',
        zone_name: 'Central Urban Core',
        road_name: 'Four Roads / Meyyanur Link',
        congestion_percentage: 45,
        current_charge: 5,
        previous_charge: 5,
        pricing_reason: 'MODERATE congestion (45%). Standard operating hours. Calculated dynamic charge: ₹5.',
        source: 'NEAR-REAL-TIME',
        is_emergency_suspended: false,
        updated_at: new Date().toISOString(),
      },
      {
        id: 'live_zone_tech_corridor',
        zone_id: 'zone_tech_corridor',
        zone_name: 'Tech & University Arterial',
        road_name: 'Junction Main Road',
        congestion_percentage: 53,
        current_charge: 10,
        previous_charge: 5,
        pricing_reason: 'HIGH congestion (53%). Peak-hour surge active. Calculated dynamic charge: ₹10.',
        source: 'NEAR-REAL-TIME',
        is_emergency_suspended: false,
        updated_at: new Date().toISOString(),
      },
      {
        id: 'live_zone_market_cross',
        zone_id: 'zone_market_cross',
        zone_name: 'Downtown Commercial Hub',
        road_name: 'Old Town Fort Avenue',
        congestion_percentage: 30,
        current_charge: 0,
        previous_charge: 0,
        pricing_reason: 'Fluid traffic (30%). No congestion charge applied.',
        source: 'NEAR-REAL-TIME',
        is_emergency_suspended: false,
        updated_at: new Date().toISOString(),
      },
    ],
    road_pricing_predictions: [
      {
        id: 'pred_zone_central_15m',
        zone_id: 'zone_central',
        prediction_horizon: 15,
        predicted_congestion: 52,
        predicted_charge: 10,
        confidence: 88,
        expected_delay_min: 7,
        model_version: 'SMARTMOVE-ML-REGRESSION-v2.4',
        created_at: new Date().toISOString(),
      },
      {
        id: 'pred_zone_central_30m',
        zone_id: 'zone_central',
        prediction_horizon: 30,
        predicted_congestion: 64,
        predicted_charge: 10,
        confidence: 83,
        expected_delay_min: 11,
        model_version: 'SMARTMOVE-ML-REGRESSION-v2.4',
        created_at: new Date().toISOString(),
      },
      {
        id: 'pred_zone_central_45m',
        zone_id: 'zone_central',
        prediction_horizon: 45,
        predicted_congestion: 76,
        predicted_charge: 20,
        confidence: 79,
        expected_delay_min: 14,
        model_version: 'SMARTMOVE-ML-REGRESSION-v2.4',
        created_at: new Date().toISOString(),
      },
      {
        id: 'pred_zone_central_60m',
        zone_id: 'zone_central',
        prediction_horizon: 60,
        predicted_congestion: 68,
        predicted_charge: 10,
        confidence: 74,
        expected_delay_min: 12,
        model_version: 'SMARTMOVE-ML-REGRESSION-v2.4',
        created_at: new Date().toISOString(),
      },
    ],
  };

  constructor() {
    if (typeof window !== 'undefined') {
      try {
        this.broadcastChannel = new BroadcastChannel('smartmove_city_sync');
        this.broadcastChannel.onmessage = (event) => {
          if (event.data?.type === 'STATE_UPDATE') {
            this.state = event.data.payload;
            this.notifyAll();
          }
        };
      } catch (e) {
        console.warn('BroadcastChannel not supported in this environment');
      }

      this.startSimTicker();
    }
  }

  public subscribe(table: string, listener: Listener) {
    if (!this.listeners.has(table)) {
      this.listeners.set(table, new Set());
    }
    this.listeners.get(table)!.add(listener);
    return () => {
      this.listeners.get(table)?.delete(listener);
    };
  }

  private notify(table: string) {
    this.listeners.get(table)?.forEach((cb) => cb());
  }

  private notifyAll() {
    this.listeners.forEach((set) => set.forEach((cb) => cb()));
  }

  private broadcast() {
    if (this.broadcastChannel) {
      try {
        this.broadcastChannel.postMessage({
          type: 'STATE_UPDATE',
          payload: this.state,
        });
      } catch (e) {
        // ignore
      }
    }
  }

  public getTableData(table: string): any {
    return (this.state as any)[table] || [];
  }

  public getState() {
    return this.state;
  }

  public setState(updates: Partial<typeof this.state> | Record<string, any>) {
    Object.assign(this.state, updates);
    Object.keys(updates).forEach((key) => this.notify(key));
    this.broadcast();
  }

  public setLiveData(key: string, data: any) {
    (this.state as any)[key] = data;
    this.notify(key);
    this.broadcast();
  }

  // FEATURE 1: Manual Parking Occupancy Update by Admin
  public updateParkingLive(
    parkingId: string,
    updates: {
      occupied_spaces: number;
      total_capacity?: number;
      status?: 'available' | 'filling_fast' | 'nearly_full' | 'closed';
      event_note?: string;
      expected_demand?: 'Normal' | 'High Surge (+25%)' | 'Severe Surge (+50%)' | 'Low (-20%)';
    }
  ): ParkingLiveRecord | null {
    const existing = this.state.parking_live.find((p) => p.parking_id === parkingId || p.id === parkingId);
    if (!existing) return null;

    const total = updates.total_capacity !== undefined ? updates.total_capacity : existing.total_capacity;
    const occupied = Math.max(0, Math.min(total, updates.occupied_spaces));
    const available = Math.max(0, total - occupied);
    const occupancy_percentage = total > 0 ? Math.round((occupied / total) * 1000) / 10 : 0;

    let computedStatus: 'available' | 'filling_fast' | 'nearly_full' | 'closed' = updates.status || existing.status;
    if (!updates.status) {
      if (available <= 5) computedStatus = 'nearly_full';
      else if (available <= Math.round(total * 0.2)) computedStatus = 'filling_fast';
      else computedStatus = 'available';
    }

    const updatedRecord: ParkingLiveRecord = {
      ...existing,
      total_capacity: total,
      occupied_spaces: occupied,
      available_spaces: available,
      occupancy_percentage,
      status: computedStatus,
      source_type: 'manual',
      event_note: updates.event_note !== undefined ? updates.event_note : existing.event_note,
      expected_demand: updates.expected_demand || existing.expected_demand,
      recorded_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    this.state.parking_live = this.state.parking_live.map((p) =>
      p.parking_id === parkingId || p.id === parkingId ? updatedRecord : p
    );

    // Keep parking_locations in sync
    this.state.parking_locations = this.state.parking_locations.map((p) => {
      if (p.id === parkingId || p.id === existing.parking_id) {
        return {
          ...p,
          total_spots: total,
          occupied_spots: occupied,
          available_spots: available,
          status: computedStatus === 'nearly_full' ? 'nearly_full' : computedStatus === 'filling_fast' ? 'filling_fast' : 'ample_spots',
          source: 'MANUAL DATA',
          updated_at: new Date().toISOString(),
        };
      }
      return p;
    });

    this.notify('parking_live');
    this.notify('parking_locations');
    this.broadcast();
    return updatedRecord;
  }

  // FEATURE 2: Add Confirmed Bus Booking
  public addBusBooking(booking: Omit<BusBookingRecord, 'id' | 'created_at'>): BusBookingRecord {
    const newRecord: BusBookingRecord = {
      id: 'bk_' + Date.now(),
      created_at: new Date().toISOString(),
      ...booking,
    };
    this.state.bus_bookings = [newRecord, ...this.state.bus_bookings];
    this.notify('bus_bookings');
    this.broadcast();
    return newRecord;
  }

  public updateSimulationState(updates: Partial<typeof this.state.simulation_state>) {
    this.state.simulation_state = {
      ...this.state.simulation_state,
      ...updates,
      updated_at: new Date().toISOString(),
    };
    this.runSimTick();
  }

  public setDemoStep(stepNumber: number) {
    const step = DEMO_STEPS.find((s) => s.step === stepNumber);
    if (!step) return;

    this.state.simulation_state = {
      ...this.state.simulation_state,
      demo_step: stepNumber,
      sim_clock: step.time,
      traffic_volume: step.stateOverrides.traffic_volume,
      signal_optimization: step.stateOverrides.signal_optimization,
      extra_buses: step.stateOverrides.extra_buses,
      staggered_departure: step.stateOverrides.staggered_departure,
      parking_guidance: step.stateOverrides.parking_guidance,
      emergency_vehicle_active: step.stateOverrides.emergency_vehicle_active,
      updated_at: new Date().toISOString(),
    };

    if (step.alertBroadcast) {
      const newAlert = {
        id: 'demo_alt_' + Date.now(),
        title: step.alertBroadcast.title,
        message: step.alertBroadcast.message,
        severity: step.alertBroadcast.severity,
        category: 'traffic',
        read: false,
        is_broadcast: true,
        created_at: new Date().toISOString(),
      };
      this.state.alerts = [newAlert, ...this.state.alerts.slice(0, 8)];
      this.notify('alerts');
    }

    this.runSimTick();
  }

  public markAlertRead(id: string) {
    this.state.alerts = this.state.alerts.map((a: any) =>
      a.id === id ? { ...a, read: true } : a
    );
    this.notify('alerts');
    this.broadcast();
  }

  public clearAlerts() {
    this.state.alerts = [];
    this.notify('alerts');
    this.broadcast();
  }

  public addSchedule(schedule: any) {
    const newEntry = {
      id: 'sch_' + Date.now(),
      active: true,
      updated_at: new Date().toISOString(),
      ...schedule,
    };
    this.state.mobility_schedules = [...this.state.mobility_schedules, newEntry];
    this.notify('mobility_schedules');
    this.broadcast();
  }

  public deleteSchedule(id: string) {
    this.state.mobility_schedules = this.state.mobility_schedules.filter((s: any) => s.id !== id);
    this.notify('mobility_schedules');
    this.broadcast();
  }

  public runSimTick() {
    // Only alter state during explicit DEMO steps or when user triggers simulation
    if (!this.state.simulation_state.demo_running) return;

    const s = this.state.simulation_state;
    const simRes = simulateScenario({
      trafficVolume: s.traffic_volume,
      signalOptimization: s.signal_optimization,
      extraBuses: s.extra_buses,
      staggeredDeparture: s.staggered_departure,
      parkingGuidance: s.parking_guidance,
      emergencyVehicleActive: s.emergency_vehicle_active,
    });

    const m = simRes.metrics;
    this.state.emission_data = this.state.emission_data.map((e) => {
      if (e.id === 'em_tech') {
        return {
          ...e,
          co2_kg_hr: m.co2KgHr.after,
          fuel_wasted_liters_hr: m.fuelLitersHr.after,
          avg_congestion_pct: m.avgCongestion.after,
          estimated_reduction_pct: m.avgCongestion.improvementPct,
          updated_at: new Date().toISOString(),
        };
      }
      return { ...e, updated_at: new Date().toISOString() };
    });

    this.notifyAll();
    this.broadcast();
  }

  public addAlert(alert: {
    title: string;
    message: string;
    severity?: 'info' | 'warning' | 'critical';
    category?: string;
  }) {
    const newAlert = {
      id: 'alt_' + Date.now(),
      title: alert.title,
      message: alert.message,
      severity: alert.severity || 'warning',
      category: alert.category || 'traffic',
      read: false,
      created_at: new Date().toISOString(),
    };
    this.state.alerts = [newAlert, ...(this.state.alerts || [])];
    this.notify('alerts');
    this.broadcast();
    return newAlert;
  }

  private startSimTicker() {
    if (this.tickInterval) clearInterval(this.tickInterval);
    this.tickInterval = setInterval(() => {
      if (this.state.simulation_state.demo_running) {
        this.runSimTick();
      }
    }, 4000);
  }
}

export const cityStore = new ReactiveCityStore();
