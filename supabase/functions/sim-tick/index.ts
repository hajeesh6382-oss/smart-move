// Supabase Edge Function: sim-tick
// Idempotent simulation tick engine executing every 3-5s (or called by admin/cron)

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";
    const supabase = createClient(supabaseUrl, supabaseKey);

    // 1. Fetch current simulation state
    const { data: state, error: stateErr } = await supabase
      .from("simulation_state")
      .select("*")
      .eq("id", 1)
      .single();

    if (stateErr || !state) {
      throw new Error("Could not retrieve simulation state: " + stateErr?.message);
    }

    const volumeMultiplier = (state.traffic_volume || 65) / 50.0; // baseline 1.0 at 50%
    const extraBuses = state.extra_buses || 0;
    const signalOpt = state.signal_optimization || false;
    const staggered = state.staggered_departure || false;
    const parkingGuide = state.parking_guidance || false;
    const emergencyActive = state.emergency_vehicle_active || false;

    // Seeded noise ±3-5%
    const noise = (Math.random() - 0.5) * 6;

    // Calculate effect reductions
    const busRelief = extraBuses * 7.5;
    const signalRelief = signalOpt ? 12 : 0;
    const staggeredRelief = staggered ? 15 : 0;
    const totalTrafficRelief = busRelief * 0.4 + signalRelief + staggeredRelief;

    // 2. Update Traffic Data
    const collegeCongestion = Math.min(98, Math.max(20, Math.round(75 * volumeMultiplier - totalTrafficRelief + noise)));
    const busStandCongestion = Math.min(95, Math.max(20, Math.round(68 * volumeMultiplier - totalTrafficRelief * 0.8 + noise)));
    const marketCongestion = Math.min(96, Math.max(20, Math.round((parkingGuide ? 52 : 78) * volumeMultiplier + noise)));
    const hospitalCongestion = emergencyActive ? 18 : Math.min(65, Math.max(15, Math.round(35 * volumeMultiplier + noise)));

    await supabase.from("traffic_data").upsert([
      { id: "tf_college", road_id: "road_college", road_name: "College Road (Tech Corridor)", vehicle_count: Math.round(collegeCongestion * 14.5), avg_speed_kmh: Math.max(10, Math.round(55 - collegeCongestion * 0.45)), congestion_pct: collegeCongestion, status: collegeCongestion > 75 ? "severe" : collegeCongestion > 50 ? "heavy" : "moderate", source: "SIMULATED DATA", updated_at: new Date().toISOString() },
      { id: "tf_bus_stand", road_id: "road_bus_stand", road_name: "Main Bus Stand Road", vehicle_count: Math.round(busStandCongestion * 18), avg_speed_kmh: Math.max(12, Math.round(50 - busStandCongestion * 0.4)), congestion_pct: busStandCongestion, status: busStandCongestion > 75 ? "severe" : busStandCongestion > 50 ? "heavy" : "moderate", source: "SIMULATED DATA", updated_at: new Date().toISOString() },
      { id: "tf_market", road_id: "road_market", road_name: "Market Central Avenue", vehicle_count: Math.round(marketCongestion * 11), avg_speed_kmh: Math.max(8, Math.round(40 - marketCongestion * 0.35)), congestion_pct: marketCongestion, status: marketCongestion > 75 ? "severe" : marketCongestion > 50 ? "heavy" : "moderate", source: "SIMULATED DATA", updated_at: new Date().toISOString() },
      { id: "tf_hospital", road_id: "road_hospital", road_name: "Hospital Emergency Express Link", vehicle_count: Math.round(hospitalCongestion * 16), avg_speed_kmh: Math.max(30, Math.round(65 - hospitalCongestion * 0.3)), congestion_pct: hospitalCongestion, status: emergencyActive ? "low" : hospitalCongestion > 50 ? "moderate" : "low", source: "SIMULATED DATA", updated_at: new Date().toISOString() },
    ]);

    // 3. Update Bus Routes & Predictions
    const bus102Occ = Math.min(100, Math.max(30, Math.round(92 * volumeMultiplier - extraBuses * 12 + noise)));
    const bus102Delay = Math.max(1, Math.round(collegeCongestion * 0.12 - (signalOpt ? 3 : 0)));
    await supabase.from("bus_routes").upsert([
      { id: "bus_102", route_number: "102", name: "Express: Tech Campus ⇄ Central Station", current_eta_min: Math.max(2, Math.round(7 - extraBuses * 1.5)), delay_min: bus102Delay, current_occupancy_pct: bus102Occ, is_overloaded: bus102Occ > 88, active_buses: 4 + extraBuses, updated_at: new Date().toISOString() },
    ]);

    // 4. Update Parking Locations
    const campusAvail = Math.max(0, Math.min(240, Math.round(parkingGuide ? 35 : Math.max(3, 30 - collegeCongestion * 0.3 + noise))));
    await supabase.from("parking_locations").upsert([
      { id: "pk_campus", name: "Campus Tech Smart Multi-Level", total_spots: 240, occupied_spots: 240 - campusAvail, available_spots: campusAvail, status: campusAvail < 10 ? "nearly_full" : "ample_spots", updated_at: new Date().toISOString() },
    ]);

    // 5. Update Emissions (ESTIMATED)
    const avgCongestion = (collegeCongestion + busStandCongestion + marketCongestion) / 3;
    const co2Rate = 320 * (1 + (avgCongestion / 100) * 0.75);
    const fuelRate = 120 * (1 + (avgCongestion / 100) * 0.85);

    await supabase.from("emission_data").upsert([
      { id: "em_tech", area_name: "College & Tech Corridor", co2_kg_hr: Math.round(co2Rate * 10) / 10, fuel_wasted_liters_hr: Math.round(fuelRate * 10) / 10, avg_congestion_pct: Math.round(avgCongestion), estimated_reduction_pct: Math.round(totalTrafficRelief * 1.1), source: "ESTIMATED VALUE", updated_at: new Date().toISOString() }
    ]);

    return new Response(JSON.stringify({ success: true, timestamp: new Date().toISOString(), metrics: { avgCongestion, totalTrafficRelief } }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (err: any) {
    return new Response(JSON.stringify({ error: err.message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
