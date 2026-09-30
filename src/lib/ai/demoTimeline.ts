// SMARTMOVE 12-Step Hackathon Demo Timeline & Simulation Controller

export interface DemoStep {
  step: number;
  time: string;
  title: string;
  summary: string;
  narration: string;
  activeNodes: string[];
  metrics: {
    trafficCongestion: number;
    busOccupancy: number;
    parkingAvail: number;
    pedRisk: number;
    co2Kg: number;
  };
  stateOverrides: {
    traffic_volume: number;
    signal_optimization: boolean;
    extra_buses: number;
    staggered_departure: boolean;
    parking_guidance: boolean;
    emergency_vehicle_active: boolean;
  };
  highlightTab?: string;
  alertBroadcast?: {
    title: string;
    message: string;
    severity: 'info' | 'warning' | 'critical' | 'success';
  };
}

export const DEMO_STEPS: DemoStep[] = [
  {
    step: 1,
    time: '16:45',
    title: 'Normal Traffic Baseline',
    summary: 'Baseline city movement prior to educational and corporate shift dismissals.',
    narration: 'At 4:45 PM, traffic across College Road and the commercial core is steady at 38% capacity. Public buses have ample seats and emissions are at normal baseline levels.',
    activeNodes: [],
    metrics: { trafficCongestion: 38, busOccupancy: 45, parkingAvail: 110, pedRisk: 24, co2Kg: 280 },
    stateOverrides: { traffic_volume: 40, signal_optimization: false, extra_buses: 0, staggered_departure: false, parking_guidance: false, emergency_vehicle_active: false },
  },
  {
    step: 2,
    time: '16:55',
    title: 'Departure Window Begins',
    summary: 'NIT campus gates open; first wave of students and faculty enter transit networks.',
    narration: 'NIT campus gates open at 4:55 PM. The initial influx of 2,200 students begins boarding buses and walking toward Junction A.',
    activeNodes: ['node_surge'],
    metrics: { trafficCongestion: 52, busOccupancy: 68, parkingAvail: 65, pedRisk: 42, co2Kg: 340 },
    stateOverrides: { traffic_volume: 55, signal_optimization: false, extra_buses: 0, staggered_departure: false, parking_guidance: false, emergency_vehicle_active: false },
  },
  {
    step: 3,
    time: '17:00',
    title: 'Vehicle Volume Rises',
    summary: 'Private vehicles and 2-wheelers enter arterial roads simultaneously.',
    narration: 'By 5:00 PM, vehicle volume surges on College Road. Traffic congestion crosses 65% and vehicle speeds drop to 24 km/h.',
    activeNodes: ['node_surge', 'node_traffic'],
    metrics: { trafficCongestion: 66, busOccupancy: 82, parkingAvail: 35, pedRisk: 58, co2Kg: 410 },
    stateOverrides: { traffic_volume: 68, signal_optimization: false, extra_buses: 0, staggered_departure: false, parking_guidance: false, emergency_vehicle_active: false },
  },
  {
    step: 4,
    time: '17:05',
    title: 'AI Detects Rising Congestion',
    summary: 'Mobility Intelligence Layer detects anomalous rate-of-rise on Eastbound approach.',
    narration: 'SMARTMOVE AI detects rapid queue accumulation at Junction A. The intelligence engine correlates this with scheduled office exits.',
    activeNodes: ['node_traffic', 'node_signals'],
    metrics: { trafficCongestion: 75, busOccupancy: 88, parkingAvail: 22, pedRisk: 66, co2Kg: 460 },
    stateOverrides: { traffic_volume: 75, signal_optimization: false, extra_buses: 0, staggered_departure: false, parking_guidance: false, emergency_vehicle_active: false },
    alertBroadcast: {
      title: 'Traffic Inflow Surge Detected',
      message: 'Rapid queue build-up on College Road. Approaching 75% corridor saturation.',
      severity: 'warning',
    }
  },
  {
    step: 5,
    time: '17:10',
    title: 'AI Predicts Severe Congestion (15 min)',
    summary: 'Predictive forecast flags imminent gridlock (>90% congestion) across 3 junctions.',
    narration: 'AI models predict severe 92% congestion within 15 minutes as Apex Tech Park releases 3,100 employees into the same corridor.',
    activeNodes: ['node_surge', 'node_traffic', 'node_signals'],
    metrics: { trafficCongestion: 84, busOccupancy: 94, parkingAvail: 14, pedRisk: 74, co2Kg: 510 },
    stateOverrides: { traffic_volume: 84, signal_optimization: false, extra_buses: 0, staggered_departure: false, parking_guidance: false, emergency_vehicle_active: false },
  },
  {
    step: 6,
    time: '17:12',
    title: 'Bus Occupancy Reaches Capacity',
    summary: 'Bus Route 102 exceeds 94% occupancy; 140+ passengers left stranded at stops.',
    narration: 'Public transit experiences cascading failure. Bus 102 hits 94% overload, forcing students onto curbsides.',
    activeNodes: ['node_transit'],
    metrics: { trafficCongestion: 86, busOccupancy: 96, parkingAvail: 10, pedRisk: 78, co2Kg: 530 },
    stateOverrides: { traffic_volume: 86, signal_optimization: false, extra_buses: 0, staggered_departure: false, parking_guidance: false, emergency_vehicle_active: false },
  },
  {
    step: 7,
    time: '17:14',
    title: 'Parking Demand Exhaustion',
    summary: 'Campus and Market lots reach 96% capacity; cruising vehicles cause secondary gridlock.',
    narration: 'Campus and Market parking lots are virtually full. Cruising vehicles circling for parking now account for 35% of intersection delay.',
    activeNodes: ['node_parking'],
    metrics: { trafficCongestion: 88, busOccupancy: 96, parkingAvail: 6, pedRisk: 80, co2Kg: 545 },
    stateOverrides: { traffic_volume: 88, signal_optimization: false, extra_buses: 0, staggered_departure: false, parking_guidance: false, emergency_vehicle_active: false },
  },
  {
    step: 8,
    time: '17:15',
    title: 'Pedestrian Risk Alert Escalates',
    summary: 'High footfall at Gate 2 crosswalk raises conflict risk index to 78/100 (Higher).',
    narration: 'Pedestrian safety risk reaches a critical 78 out of 100 as crowded sidewalks spill into active vehicle lanes at Market Cross.',
    activeNodes: ['node_pedestrian'],
    metrics: { trafficCongestion: 90, busOccupancy: 97, parkingAvail: 4, pedRisk: 82, co2Kg: 555 },
    stateOverrides: { traffic_volume: 90, signal_optimization: false, extra_buses: 0, staggered_departure: false, parking_guidance: false, emergency_vehicle_active: false },
  },
  {
    step: 9,
    time: '17:18',
    title: 'Peak Emission & Fuel Waste Spike',
    summary: 'Stop-and-go idling drives hourly CO₂ output to 560 kg/hr with 220 L/hr fuel wasted.',
    narration: 'At the peak of uncoordinated congestion, stop-and-go idling causes localized CO₂ emissions to spike 98% above normal levels.',
    activeNodes: ['node_environment'],
    metrics: { trafficCongestion: 92, busOccupancy: 98, parkingAvail: 2, pedRisk: 84, co2Kg: 565 },
    stateOverrides: { traffic_volume: 92, signal_optimization: false, extra_buses: 0, staggered_departure: false, parking_guidance: false, emergency_vehicle_active: false },
  },
  {
    step: 10,
    time: '17:20',
    title: 'AI Synthesizes Coordinated Actions',
    summary: '4 coordinated actions generated: +2 Shuttles, Green Wave Signal, Parking Guidance, Staggering.',
    narration: 'SMARTMOVE synthesizes a 4-point coordinated intervention plan: deploy 2 standby electric buses, extend Eastbound green split to 52s, divert parking to Metro Hub, and stagger dismissals.',
    activeNodes: ['node_surge', 'node_traffic', 'node_transit', 'node_parking', 'node_signals', 'node_environment', 'node_pedestrian'],
    metrics: { trafficCongestion: 92, busOccupancy: 98, parkingAvail: 2, pedRisk: 84, co2Kg: 565 },
    stateOverrides: { traffic_volume: 92, signal_optimization: false, extra_buses: 0, staggered_departure: false, parking_guidance: false, emergency_vehicle_active: false },
  },
  {
    step: 11,
    time: '17:22',
    title: 'Executing Coordinated Simulation',
    summary: 'Applying full multi-system AI solution across signals, transit routing, and parking guidance.',
    narration: 'Simulating multi-agency coordination in real-time. Adaptive signals adjust, 2 additional electric buses enter the corridor, and parking guidance signs illuminate.',
    activeNodes: ['node_traffic', 'node_transit', 'node_signals'],
    metrics: { trafficCongestion: 62, busOccupancy: 64, parkingAvail: 45, pedRisk: 50, co2Kg: 390 },
    stateOverrides: { traffic_volume: 92, signal_optimization: true, extra_buses: 2, staggered_departure: true, parking_guidance: true, emergency_vehicle_active: false },
  },
  {
    step: 12,
    time: '17:30',
    title: 'Optimized State: Before vs After',
    summary: 'Corridor congestion down 52%, bus delays cut by 68%, CO₂ reduced by 34%.',
    narration: 'Simulation complete. Coordinated AI actions deliver a 52% reduction in corridor congestion, eliminate bus queuing, and reduce emissions by 175 kg per hour.',
    activeNodes: [],
    metrics: { trafficCongestion: 42, busOccupancy: 58, parkingAvail: 85, pedRisk: 32, co2Kg: 330 },
    stateOverrides: { traffic_volume: 92, signal_optimization: true, extra_buses: 2, staggered_departure: true, parking_guidance: true, emergency_vehicle_active: false },
    alertBroadcast: {
      title: 'Coordinated AI Optimization Active',
      message: 'Congestion cleared on College Road. Travel time reduced by 11 min across all routes.',
      severity: 'success',
    }
  },
];
