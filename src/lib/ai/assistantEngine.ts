// SMARTMOVE Grounded Conversational Intelligence Engine
// Enforces strict data provenance: Never describes simulated/estimated values as real sensor measurements

import { cityStore } from '../supabase/mockStore';

export interface AssistantAction {
  type: 'NAVIGATE' | 'SET_MAP_LAYER' | 'SET_SIMULATION_CONTROL' | 'NONE';
  payload?: any;
}

export interface AssistantResponse {
  reply: string;
  source: 'SIMULATED DATA' | 'LIVE API DATA' | 'ESTIMATED VALUE';
  action?: AssistantAction;
  whyExplanation?: string;
  confidence?: number;
}

export async function processAssistantQuery(
  query: string,
  lang: string = 'en'
): Promise<AssistantResponse> {
  const q = query.toLowerCase().trim();
  const state = cityStore.state;

  // 1. College Road Jam intent
  if (q.includes('college') || q.includes('jam') || q.includes('traffic') || q.includes('congest')) {
    const colTraffic = state.traffic_data.find((t) => t.id === 'tf_college') || { congestion_pct: 84, avg_speed_kmh: 14 };
    return {
      reply: `College Road is currently at ${colTraffic.congestion_pct}% congestion (severe, simulated reading) with vehicle speeds reduced to ${colTraffic.avg_speed_kmh} km/h. This is caused by simultaneous dismissal of NIT (2,200 students) and Apex Tech Park (3,100 employees). Recommended action: Divert via Ring Express Bypass or board Bus 210 Eco Shuttle.`,
      source: 'SIMULATED DATA',
      whyExplanation: 'NIT dismissal (17:00) + Tech Park shifts (17:15) overlap with road throughput limit of 1,400 vph.',
      confidence: 93,
      action: { type: 'SET_MAP_LAYER', payload: 'traffic' },
    };
  }

  // 2. Bus 102 intent (Explicitly mentions estimated occupancy)
  if (q.includes('bus 102') || q.includes('102') || (q.includes('bus') && q.includes('crowd'))) {
    const bus = state.bus_routes.find((b) => b.route_number === '102') || { current_eta_min: 6, current_occupancy_pct: 94, delay_min: 8, active_buses: 4, is_overloaded: true };
    return {
      reply: `Bus Route 102 arrives in approx ${bus.current_eta_min} min with ${bus.delay_min} min delay (simulated GPS). Passenger crowding is about ${bus.current_occupancy_pct}% full (estimated, not from a physical passenger counter). ${bus.active_buses > 4 ? `${bus.active_buses - 4} extra standby shuttles are active.` : 'AI recommends deploying 2 standby electric shuttles.'}`,
      source: 'SIMULATED DATA',
      whyExplanation: 'Severe passenger queue of 140+ students at College Gate crosswalk estimated from class schedule demand.',
      confidence: 91,
      action: { type: 'NAVIGATE', payload: '/buses' },
    };
  }

  // 3. Parking intent
  if (q.includes('parking') || q.includes('park') || q.includes('spot')) {
    const campus = state.parking_locations.find((p) => p.id === 'pk_campus') || { available_spots: 14 };
    const metro = state.parking_locations.find((p) => p.id === 'pk_metro') || { available_spots: 155 };
    return {
      reply: `Campus Smart Lot has only ${campus.available_spots} spots remaining (simulated reading, filling fast). We recommend Metro Park & Ride Hub with ${metro.available_spots} available spots and fast EV charging to avoid ~12 minutes of cruising delays.`,
      source: 'SIMULATED DATA',
      whyExplanation: 'Market and Campus lots are at 94%+ occupancy. Dynamic parking diversion reduces cruising fuel waste.',
      confidence: 95,
      action: { type: 'NAVIGATE', payload: '/parking' },
    };
  }

  // 4. Emergency / Ambulance intent (Non-negotiable 112 guidance)
  if (q.includes('emergency') || q.includes('ambulance') || q.includes('hospital') || q.includes('112') || q.includes('corridor')) {
    return {
      reply: `For life-threatening emergencies, dial 112 immediately. SMARTMOVE is a simulation and intelligence platform and does not dispatch physical emergency units. In the active simulation, the Green Corridor for Ambulance 108 reduces transit time from 14 min to 8 min by pre-clearing Junction D signals.`,
      source: 'SIMULATED DATA',
      confidence: 96,
      action: { type: 'NAVIGATE', payload: '/emergency' },
    };
  }

  // 5. Pedestrian Safety intent
  if (q.includes('pedestrian') || q.includes('walk') || q.includes('cross') || q.includes('safety')) {
    return {
      reply: `Pedestrian conflict risk at College Main Gate is currently 78/100 (estimated Higher Risk Band) due to vehicle turning conflicts. Advice: Use the Grade-Separated Skywalk at Gate 2 or the Pelican Signal at Market Cross.`,
      source: 'ESTIMATED VALUE',
      confidence: 89,
      action: { type: 'NAVIGATE', payload: '/safety' },
    };
  }

  // 6. What-if simulation request via voice/chat
  if (q.includes('extra bus') || q.includes('what if') || q.includes('simulate')) {
    cityStore.updateSimulationState({ extra_buses: 2, signal_optimization: true });
    return {
      reply: `Executed What-If Simulation: Injected 2 extra electric buses and activated Adaptive Signal Green Wave. Simulated Result: Corridor congestion decreased by 38% and Bus 102 wait times dropped by 7 minutes!`,
      source: 'SIMULATED DATA',
      confidence: 94,
      action: { type: 'NAVIGATE', payload: '/admin/what-if' },
    };
  }

  // 7. Generic Urban Mobility status
  return {
    reply: `SMARTMOVE AI Assistant: Monitoring 5 arterial corridors and 3 transit lines (simulated city model). Peak-hour congestion is active on College Road; Bus 102 is running with 2 extra dispatched units. Would you like to check route recommendations or parking availability?`,
    source: 'SIMULATED DATA',
    confidence: 88,
  };
}
