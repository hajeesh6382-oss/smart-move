// SMARTMOVE AI MOBILITY BRAIN
// Central Real-Time Event Processing & Network Impact Calculation Engine
// Analyzes incoming incidents, computes multi-modal ripple effects, updates all tables, and generates structured AI explanations

import { cityStore } from '../supabase/mockStore';
import { SALEM_LOCATIONS } from '../../config/map-config';
import { updateZoneCongestion } from '../../services/dynamicPricingService';

export type IncidentType =
  | 'accident'
  | 'road_closure'
  | 'congestion'
  | 'bus_delay'
  | 'overcrowding'
  | 'parking_shortage'
  | 'ev_fault'
  | 'emergency_corridor'
  | 'pedestrian_hazard'
  | 'pollution_spike'
  | 'weather_storm'
  | 'peak_surge'
  | 'custom';

export type IncidentSeverity = 'low' | 'moderate' | 'high' | 'critical';

export interface LiveIncident {
  id: string;
  location_name: string;
  lat: number;
  lng: number;
  type: IncidentType;
  severity: IncidentSeverity;
  status: 'active' | 'in_progress' | 'resolved';
  title: string;
  description: string;
  affected_roads: string[];
  affected_bus_routes: string[];
  duration_min: number;
  reported_by: string;
  timestamp: string;
  verified: boolean;
}

export interface StructuredAIOutput {
  whatHappened: string;
  aiAnalysis: string;
  recommendation: string;
  expectedImpact: string;
  whyReasons: string[];
  affectedCorridors: string[];
  routeA: { name: string; etaMin: number; congestionPct: number; status: string };
  routeB: { name: string; etaMin: number; savedTimeMin: number; isRecommended: boolean };
}

export interface ImpactAnalysisResult {
  incident: LiveIncident;
  aiOutput: StructuredAIOutput;
  congestionDelta: number;
  busDelayDelta: number;
  parkingReduction: number;
  pedestrianRiskLevel: 'Lower' | 'Moderate' | 'Higher';
  extraFuelLiters: number;
  extraCo2Kg: number;
}

class AIMobilityBrainEngine {
  private lastAnalysis: ImpactAnalysisResult | null = null;
  private brainState: 'idle' | 'analyzing' | 'recalculating' | 'live' = 'live';

  public getBrainState() {
    return this.brainState;
  }

  /**
   * Evaluates the ripple impact of any real-time user/admin incident across the entire mobility network
   */
  public analyzeImpact(incident: LiveIncident): ImpactAnalysisResult {
    const isCritical = incident.severity === 'critical';
    const isHigh = incident.severity === 'high';
    const isModerate = incident.severity === 'moderate';

    // 1. Calculate Congestion Spike
    const congestionDelta = isCritical ? 45 : isHigh ? 30 : isModerate ? 18 : 8;

    // 2. Calculate Transit Delay Spike
    const busDelayDelta = isCritical ? 14 : isHigh ? 9 : isModerate ? 5 : 2;

    // 3. Identify Affected Corridors & Bus lines based on location
    const locLower = incident.location_name.toLowerCase();
    const affectedCorridors: string[] = [];
    const affectedBusRoutes: string[] = [];

    if (locLower.includes('five roads') || locLower.includes('junction a')) {
      affectedCorridors.push('Salem Tech - Five Roads Arterial', 'Five Roads - Hospital Emergency Link');
      affectedBusRoutes.push('102', '105');
    } else if (locLower.includes('four roads') || locLower.includes('bus stand') || locLower.includes('junction b')) {
      affectedCorridors.push('Four Roads - Old Bazaar Commercial Link', 'Main Bus Stand Road');
      affectedBusRoutes.push('102', '210');
    } else if (locLower.includes('tech') || locLower.includes('sona') || locLower.includes('college')) {
      affectedCorridors.push('College Road (Tech Corridor)', 'Salem Tech - Five Roads Arterial');
      affectedBusRoutes.push('102');
    } else if (locLower.includes('market') || locLower.includes('bazaar')) {
      affectedCorridors.push('Market Central Avenue', 'Four Roads - Old Bazaar Commercial Link');
      affectedBusRoutes.push('105', '210');
    } else if (locLower.includes('hospital')) {
      affectedCorridors.push('Hospital Emergency Express Link', 'Five Roads - Hospital Emergency Link');
      affectedBusRoutes.push('210');
    } else {
      affectedCorridors.push('Salem Tech - Five Roads Arterial', 'Main Bus Stand Road');
      affectedBusRoutes.push('102');
    }

    // 4. Route A vs Route B Dynamic Rerouting Logic
    const routeABaseEta = 25;
    const routeANewEta = routeABaseEta + (isCritical ? 17 : isHigh ? 12 : 7);
    const routeBCongestion = 32;
    const routeBEta = 28;
    const timeSaved = Math.max(4, routeANewEta - routeBEta);

    // 5. Build Structured AI Output
    const whatHappened = `${incident.severity.toUpperCase()} severity incident (${incident.title}) reported at ${incident.location_name}.`;
    
    let aiAnalysis = '';
    if (incident.type === 'accident') {
      aiAnalysis = `Vehicular blockage on ${affectedCorridors[0]} has reduced corridor flow rate by ${congestionDelta}%. Downstream intersections (Junction A & B) are experiencing queue spillback with ${busDelayDelta} min transit delay.`;
    } else if (incident.type === 'emergency_corridor') {
      aiAnalysis = `Emergency Priority Corridor active for ${incident.title}. AI signal preemption is clearing North/South approaches along ${affectedCorridors.join(' & ')}.`;
    } else if (incident.type === 'road_closure' || incident.type === 'weather_storm') {
      aiAnalysis = `Complete throughput restriction on ${affectedCorridors[0]}. Traffic is diverting towards the Ring Bypass corridor, creating secondary peak loads.`;
    } else {
      aiAnalysis = `Elevated density along ${affectedCorridors.join(', ')} exceeds carrying capacity. Multi-objective rerouting recommended to avoid bottleneck.`;
    }

    const recommendation = `Divert private vehicles via Route B (Ring Express Bypass) and activate ${affectedBusRoutes.length > 0 ? `Bus Route ${affectedBusRoutes[0]} standby shuttles` : 'traffic signal green wave'}. Avoid ${incident.location_name}.`;
    
    const expectedImpact = `Saves estimated ${timeSaved} minutes in travel time, prevents ~${Math.round(timeSaved * 8.5)}kg CO₂ idling emissions, and clears ${affectedCorridors[0]} queue ${35 + (isCritical ? 15 : 5)}% faster.`;

    const whyReasons = [
      `${incident.title} at ${incident.location_name} caused congestion to reach ${Math.min(99, 50 + congestionDelta)}%`,
      `Route A ETA increased from ${routeABaseEta}m to ${routeANewEta}m (${routeANewEta - routeABaseEta}m delay)`,
      `Route B (Bypass) remains fluid with 32% congestion and ${routeBEta}m ETA`,
      `Pedestrian risk level in nearby crossing elevated to Higher`,
    ];

    const structuredAIOutput: StructuredAIOutput = {
      whatHappened,
      aiAnalysis,
      recommendation,
      expectedImpact,
      whyReasons,
      affectedCorridors,
      routeA: {
        name: 'Route A (Direct via ' + (affectedCorridors[0] || 'Main Corridor') + ')',
        etaMin: routeANewEta,
        congestionPct: Math.min(98, 52 + congestionDelta),
        status: isCritical ? 'SEVERE BOTTLENECK' : 'HEAVY DELAY',
      },
      routeB: {
        name: 'Route B (AI Ring Bypass & Green Wave)',
        etaMin: routeBEta,
        savedTimeMin: timeSaved,
        isRecommended: true,
      },
    };

    const extraFuelLiters = Math.round((congestionDelta * 3.8) * 10) / 10;
    const extraCo2Kg = Math.round((congestionDelta * 9.2) * 10) / 10;

    return {
      incident,
      aiOutput: structuredAIOutput,
      congestionDelta,
      busDelayDelta,
      parkingReduction: isHigh || isCritical ? 12 : 5,
      pedestrianRiskLevel: isHigh || isCritical ? 'Higher' : 'Moderate',
      extraFuelLiters,
      extraCo2Kg,
    };
  }

  /**
   * Process a live real-time incident: Runs AI Analysis, updates all cityStore tables,
   * creates notifications, and broadcasts to all connected browser tabs and subscribers
   */
  public processLiveIncident(incidentInput: Partial<LiveIncident>): ImpactAnalysisResult {
    this.brainState = 'analyzing';

    const incident: LiveIncident = {
      id: incidentInput.id || 'inc_' + Date.now(),
      location_name: incidentInput.location_name || 'Five Roads Junction, Salem',
      lat: incidentInput.lat || SALEM_LOCATIONS.junctionA.lat,
      lng: incidentInput.lng || SALEM_LOCATIONS.junctionA.lng,
      type: incidentInput.type || 'accident',
      severity: incidentInput.severity || 'high',
      status: incidentInput.status || 'active',
      title: incidentInput.title || 'Live Traffic Disruption',
      description: incidentInput.description || 'Unexpected vehicular congestion and lane bottleneck detected.',
      affected_roads: incidentInput.affected_roads || ['Salem Tech - Five Roads Arterial'],
      affected_bus_routes: incidentInput.affected_bus_routes || ['102', '105'],
      duration_min: incidentInput.duration_min || 45,
      reported_by: incidentInput.reported_by || 'Citizen / Sensor Telemetry',
      timestamp: new Date().toLocaleTimeString('en-US', { hour12: false }),
      verified: true,
    };

    // 1. Run AI Analysis
    const impact = this.analyzeImpact(incident);
    this.lastAnalysis = impact;

    // 2. Update reactive cityStore state across ALL tables
    const state = cityStore.state as any;

    // A. Active Incidents Table
    if (!state.active_incidents) {
      state.active_incidents = [];
    }
    state.active_incidents = [incident, ...state.active_incidents.filter((i: any) => i.id !== incident.id).slice(0, 10)];

    // B. Traffic Data Table (Congestion spikes on affected roads)
    state.traffic_data = state.traffic_data.map((t: any) => {
      const isTarget =
        t.road_name.toLowerCase().includes(incident.location_name.toLowerCase().split(' ')[0]) ||
        impact.aiOutput.affectedCorridors.some((c) => c.toLowerCase().includes(t.road_name.toLowerCase().split(' ')[0]));

      if (isTarget || incident.severity === 'critical') {
        const newCongestion = Math.min(99, Math.max(30, t.congestion_pct + impact.congestionDelta));
        return {
          ...t,
          congestion_pct: newCongestion,
          avg_speed_kmh: Math.max(6, Math.round(50 - newCongestion * 0.45)),
          status: newCongestion > 75 ? 'severe' : newCongestion > 50 ? 'heavy' : 'moderate',
          updated_at: new Date().toISOString(),
        };
      }
      return t;
    });

    // C. Bus Routes (Delays increase)
    state.bus_routes = state.bus_routes.map((b: any) => {
      if (incident.affected_bus_routes.includes(b.route_number) || b.route_number === '102') {
        const newDelay = b.delay_min + impact.busDelayDelta;
        const newOcc = Math.min(100, b.current_occupancy_pct + (incident.severity === 'critical' ? 12 : 6));
        return {
          ...b,
          delay_min: newDelay,
          current_eta_min: Math.max(1, b.current_eta_min + Math.round(impact.busDelayDelta * 0.6)),
          current_occupancy_pct: newOcc,
          is_overloaded: newOcc > 85,
          updated_at: new Date().toISOString(),
        };
      }
      return b;
    });

    // D. Pedestrian Zones (Risk jumps)
    state.pedestrian_zones = state.pedestrian_zones.map((pz: any) => {
      if (pz.name.toLowerCase().includes(incident.location_name.toLowerCase().split(' ')[0])) {
        return {
          ...pz,
          risk_score: Math.min(98, pz.risk_score + (incident.severity === 'critical' ? 25 : 15)),
          risk_level: impact.pedestrianRiskLevel,
          updated_at: new Date().toISOString(),
        };
      }
      return pz;
    });

    // E. Emissions (Spikes due to idling)
    state.emission_data = state.emission_data.map((em: any) => {
      return {
        ...em,
        co2_kg_hr: Math.round((em.co2_kg_hr + impact.extraCo2Kg) * 10) / 10,
        fuel_wasted_liters_hr: Math.round((em.fuel_wasted_liters_hr + impact.extraFuelLiters) * 10) / 10,
        avg_congestion_pct: Math.min(98, em.avg_congestion_pct + Math.round(impact.congestionDelta * 0.5)),
        updated_at: new Date().toISOString(),
      };
    });

    // F. AI Recommendations Table (Prepend new structured 4-part card)
    const newRecommendation = {
      id: 'rec_' + Date.now(),
      category: incident.type === 'accident' ? 'reroute' : incident.type === 'emergency_corridor' ? 'emergency' : 'traffic',
      title: `AI Action: ${impact.aiOutput.recommendation.split('.')[0]}`,
      problem: impact.aiOutput.whatHappened,
      prediction: impact.aiOutput.aiAnalysis,
      recommendation: impact.aiOutput.recommendation,
      estimated_impact: impact.aiOutput.expectedImpact,
      why_reasons: impact.aiOutput.whyReasons,
      confidence: 94,
      connected_effects: ['Corridor Congestion', 'Route B Rerouting', 'Bus 102 Delay', 'Emissions Surge'],
      active: true,
      updated_at: new Date().toISOString(),
    };
    state.ai_recommendations = [newRecommendation, ...state.ai_recommendations.slice(0, 5)];

    // G. Alerts Table (Broadcast alert notification)
    const newAlert = {
      id: 'alt_' + Date.now(),
      title: `${incident.severity.toUpperCase()} ALERT: ${incident.title}`,
      message: `${impact.aiOutput.whatHappened} ${impact.aiOutput.recommendation}`,
      severity: incident.severity === 'critical' ? 'critical' : incident.severity === 'high' ? 'warning' : 'info',
      category: 'traffic',
      read: false,
      is_broadcast: true,
      created_at: new Date().toISOString(),
    };
    state.alerts = [newAlert, ...state.alerts.slice(0, 10)];

    // H. Update Simulation State
    state.simulation_state = {
      ...state.simulation_state,
      traffic_volume: Math.min(99, state.simulation_state.traffic_volume + Math.round(impact.congestionDelta * 0.4)),
      emergency_vehicle_active: incident.type === 'emergency_corridor',
      updated_at: new Date().toISOString(),
    };

    // I. Dynamic Road Pricing Recalculation via Brain
    if (incident.type === 'emergency_corridor') {
      updateZoneCongestion('zone_central', 0, 'LIVE TRAFFIC DATA', 'Pricing suspended for emergency vehicle priority corridor');
    } else {
      updateZoneCongestion('zone_central', Math.min(95, 45 + impact.congestionDelta), 'LIVE TRAFFIC DATA', `Surge due to ${incident.title}`);
    }

    // 3. Notify all listeners & broadcast to tabs
    this.brainState = 'live';
    (cityStore as any).notifyAll();
    (cityStore as any).broadcast();

    // Trigger audio / speech or console indicator
    console.log('[SMARTMOVE AI MOBILITY BRAIN]', 'Real-time incident processed and propagated:', incident.title, impact);

    return impact;
  }

  /**
   * Clears an active incident and restores baseline conditions
   */
  public resolveIncident(incidentId: string) {
    const state = cityStore.state as any;
    if (state.active_incidents) {
      state.active_incidents = state.active_incidents.filter((i: any) => i.id !== incidentId);
    }

    const newAlert = {
      id: 'alt_' + Date.now(),
      title: 'Incident Cleared & Flow Restored',
      message: 'Obstruction resolved. Corridor throughput restored to baseline parameters.',
      severity: 'info',
      category: 'traffic',
      read: false,
      is_broadcast: true,
      created_at: new Date().toISOString(),
    };
    state.alerts = [newAlert, ...state.alerts.slice(0, 10)];

    // Ease traffic
    state.traffic_data = state.traffic_data.map((t: any) => ({
      ...t,
      congestion_pct: Math.max(30, t.congestion_pct - 20),
      avg_speed_kmh: Math.min(48, t.avg_speed_kmh + 10),
      status: 'moderate',
      updated_at: new Date().toISOString(),
    }));

    (cityStore as any).notifyAll();
    (cityStore as any).broadcast();
  }

  public getLastAnalysis(): ImpactAnalysisResult | null {
    return this.lastAnalysis;
  }

  public getSimulationState() {
    const transitData = {
      occupancyRate: 68,
      activeBuses: 42,
      avgDelayMinutes: 3.2,
    };
    return {
      status: 'active',
      transit: transitData,
      busCorridors: transitData,
      evHubs: {
        chargingAvailability: 74,
        peakPowerKw: 420,
      },
      sustainability: {
        carbonSavedKg: 1840,
        activeTransitShare: 46,
      },
    };
  }
}

export const aiMobilityBrain = new AIMobilityBrainEngine();
export const mobilityBrain = aiMobilityBrain;

