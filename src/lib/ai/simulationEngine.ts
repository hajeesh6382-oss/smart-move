// SMARTMOVE What-If Mobility Scenario Simulation Engine
// Computes multi-parameter synchronized before vs after metrics

export interface SimulationControls {
  trafficVolume: number; // 0 - 100
  signalOptimization: boolean;
  extraBuses: number; // 0 - 5
  staggeredDeparture: boolean;
  parkingGuidance: boolean;
  emergencyVehicleActive: boolean;
}

export interface MetricComparison {
  name: string;
  before: number;
  after: number;
  unit: string;
  improvementPct: number;
  status: 'improved' | 'worsened' | 'neutral';
  explanation: string;
}

export interface SimulationScenarioResult {
  controls: SimulationControls;
  metrics: {
    avgCongestion: MetricComparison;
    busDelayMin: MetricComparison;
    busOccupancyPct: MetricComparison;
    parkingSearchTimeMin: MetricComparison;
    co2KgHr: MetricComparison;
    fuelLitersHr: MetricComparison;
    pedestrianRiskScore: MetricComparison;
    emergencyTransitTimeMin: MetricComparison;
  };
  overallImprovementPct: number;
  timestamp: string;
}

export function simulateScenario(controls: SimulationControls): SimulationScenarioResult {
  // Baseline "Before" metrics (Peak Hour Unmanaged)
  const volFactor = controls.trafficVolume / 65.0;
  
  const beforeCongestion = Math.round(84 * volFactor);
  const beforeBusDelay = Math.round(9.5 * volFactor);
  const beforeBusOccupancy = Math.min(100, Math.round(94 * volFactor));
  const beforeParkingSearch = 12; // 12 min cruising for spots
  const beforeCo2 = Math.round(540 * volFactor);
  const beforeFuel = Math.round(215 * volFactor);
  const beforePedRisk = 78;
  const beforeEmergencyTime = 14;

  // Calculators for "After" relief
  const signalRelief = controls.signalOptimization ? 14 : 0;
  const busRelief = controls.extraBuses * 8.5;
  const staggeredRelief = controls.staggeredDeparture ? 22 : 0;
  const parkingRelief = controls.parkingGuidance ? 10 : 0;
  const emergencyRelief = controls.emergencyVehicleActive ? 45 : 0;

  const totalCongestionRelief = signalRelief + (busRelief * 0.4) + staggeredRelief + (parkingRelief * 0.5);
  
  const afterCongestion = Math.max(18, Math.round(beforeCongestion - totalCongestionRelief));
  const afterBusDelay = Math.max(2, Math.round(beforeBusDelay - (controls.extraBuses * 1.6) - (controls.signalOptimization ? 3.2 : 0)));
  const afterBusOccupancy = Math.max(35, Math.round(beforeBusOccupancy - (controls.extraBuses * 12) - (controls.staggeredDeparture ? 14 : 0)));
  const afterParkingSearch = controls.parkingGuidance ? 3 : Math.max(4, beforeParkingSearch - Math.round(totalCongestionRelief * 0.15));
  
  const afterCo2 = Math.max(220, Math.round(beforeCo2 * (1 - (totalCongestionRelief * 0.007))));
  const afterFuel = Math.max(90, Math.round(beforeFuel * (1 - (totalCongestionRelief * 0.008))));
  const afterPedRisk = Math.max(25, Math.round(beforePedRisk - (staggeredRelief * 0.8) - (signalRelief * 0.5)));
  const afterEmergencyTime = controls.emergencyVehicleActive ? 7.5 : Math.max(8, beforeEmergencyTime - (totalCongestionRelief * 0.08));

  const buildMetric = (
    name: string,
    before: number,
    after: number,
    unit: string,
    lowerIsBetter: boolean,
    explanation: string
  ): MetricComparison => {
    const diff = before - after;
    const improvementPct = before === 0 ? 0 : Math.round((Math.abs(diff) / before) * 100);
    const isImproved = lowerIsBetter ? after < before : after > before;
    return {
      name,
      before,
      after,
      unit,
      improvementPct,
      status: isImproved ? 'improved' : after === before ? 'neutral' : 'worsened',
      explanation,
    };
  };

  const metrics = {
    avgCongestion: buildMetric('Corridor Congestion', beforeCongestion, afterCongestion, '%', true, 'Relief via adaptive signals & peak staggering'),
    busDelayMin: buildMetric('Average Bus Delay', beforeBusDelay, afterBusDelay, 'min', true, 'Frequency boost & green priority waves'),
    busOccupancyPct: buildMetric('Peak Bus Occupancy', beforeBusOccupancy, afterBusOccupancy, '%', true, 'Additional electric transit capacity injected'),
    parkingSearchTimeMin: buildMetric('Parking Search Cruising', beforeParkingSearch, afterParkingSearch, 'min', true, 'Direct dynamic routing to Metro Park & Ride'),
    co2KgHr: buildMetric('Estimated CO₂ Rate', beforeCo2, afterCo2, 'kg/hr', true, 'Reduced stop-and-go idling across major junctions'),
    fuelLitersHr: buildMetric('Wasted Fuel Rate', beforeFuel, afterFuel, 'L/hr', true, 'Smoothed traffic speed curves save fuel'),
    pedestrianRiskScore: buildMetric('Pedestrian Conflict Risk', beforePedRisk, afterPedRisk, '/100', true, 'Staggered dispersal reduces crosswalk overcrowding'),
    emergencyTransitTimeMin: buildMetric('Emergency Corridor ETA', beforeEmergencyTime, afterEmergencyTime, 'min', true, 'Dynamic signal preemption clears path'),
  };

  const overallImprovementPct = Math.round(
    (metrics.avgCongestion.improvementPct +
     metrics.busDelayMin.improvementPct +
     metrics.co2KgHr.improvementPct +
     metrics.pedestrianRiskScore.improvementPct) / 4
  );

  return {
    controls,
    metrics,
    overallImprovementPct,
    timestamp: new Date().toISOString(),
  };
}
