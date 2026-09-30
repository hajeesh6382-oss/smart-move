// SMARTMOVE Connected Effects Graph Mapper
// Maps a primary trigger (e.g. Peak Hour Vehicle Surge) to downstream cascading impacts with live dynamic severity.

export interface ConnectedEffectNode {
  id: string;
  name: string;
  category: 'cause' | 'traffic' | 'transit' | 'parking' | 'signals' | 'environment' | 'safety';
  metricLabel: string;
  metricValue: string;
  severity: 'low' | 'moderate' | 'high' | 'critical';
  description: string;
  linkPath: string;
  connectedTo: string[];
}

export function buildConnectedEffectsGraph(
  trafficVolume: number = 68,
  collegeCongestion: number = 84,
  busOccupancy: number = 94,
  parkingAvail: number = 14,
  pedRisk: number = 78,
  co2Kg: number = 540
): ConnectedEffectNode[] {
  const isHighTraffic = trafficVolume > 60 || collegeCongestion > 70;
  const isBusCritical = busOccupancy > 85;
  const isParkingScarce = parkingAvail < 20;
  const isPedHigh = pedRisk > 65;

  return [
    {
      id: 'node_surge',
      name: 'College & Office Peak Dismissal',
      category: 'cause',
      metricLabel: 'Surge Demand',
      metricValue: '7,100 people / hr',
      severity: isHighTraffic ? 'critical' : 'moderate',
      description: 'Simultaneous departure of NIT, City College, and Apex Tech Park employees.',
      linkPath: '/admin/schedules',
      connectedTo: ['node_traffic', 'node_transit', 'node_parking'],
    },
    {
      id: 'node_traffic',
      name: 'College Road Arterial Gridlock',
      category: 'traffic',
      metricLabel: 'Congestion Level',
      metricValue: `${collegeCongestion}%`,
      severity: collegeCongestion > 75 ? 'critical' : collegeCongestion > 50 ? 'high' : 'moderate',
      description: 'Vehicular influx exceeds 1,400 vph capacity, causing 680m queue lengths.',
      linkPath: '/traffic',
      connectedTo: ['node_transit', 'node_signals', 'node_environment'],
    },
    {
      id: 'node_transit',
      name: 'Bus 102 Delay & Overload',
      category: 'transit',
      metricLabel: 'Bus Occupancy',
      metricValue: `${busOccupancy}% (${isBusCritical ? 'Overloaded' : 'Normal'})`,
      severity: isBusCritical ? 'critical' : 'moderate',
      description: 'Public transit bottleneck traps 140+ waiting commuters at College Gate.',
      linkPath: '/buses',
      connectedTo: ['node_pedestrian', 'node_environment'],
    },
    {
      id: 'node_parking',
      name: 'Cruising for Parking Spots',
      category: 'parking',
      metricLabel: 'Campus Lot Availability',
      metricValue: `${parkingAvail} spots left`,
      severity: isParkingScarce ? 'high' : 'low',
      description: '35% of local traffic comprises drivers circling for limited parking spots.',
      linkPath: '/parking',
      connectedTo: ['node_traffic', 'node_environment'],
    },
    {
      id: 'node_signals',
      name: 'Intersection Cycle Stalling',
      category: 'signals',
      metricLabel: 'Junction Delay',
      metricValue: '+6.2 min / cycle',
      severity: isHighTraffic ? 'high' : 'moderate',
      description: 'Static signal timings cause queue spillbacks across Junction A & B cross-streets.',
      linkPath: '/signals',
      connectedTo: ['node_environment', 'node_pedestrian'],
    },
    {
      id: 'node_environment',
      name: 'CO₂ Spike & Fuel Idling Waste',
      category: 'environment',
      metricLabel: 'CO₂ Emission Rate',
      metricValue: `${co2Kg} kg/hr`,
      severity: co2Kg > 450 ? 'critical' : 'moderate',
      description: 'Low-speed stop-and-go driving inflates fuel waste and localized urban emissions.',
      linkPath: '/sustainability',
      connectedTo: [],
    },
    {
      id: 'node_pedestrian',
      name: 'Pedestrian Crossing Hazard',
      category: 'safety',
      metricLabel: 'Pedestrian Risk Score',
      metricValue: `${pedRisk}/100 (Higher)`,
      severity: isPedHigh ? 'critical' : 'moderate',
      description: 'Curb spillover and impatient vehicles turning right escalate crosswalk conflict.',
      linkPath: '/safety',
      connectedTo: [],
    },
  ];
}
