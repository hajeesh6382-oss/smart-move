// SMARTMOVE Unified Map Container
// Bridges Leaflet OpenStreetMap Engine with SMARTMOVE AI telemetry, OSRM routing, Overpass layers, and interactive controls

import React from 'react';
import { SmartMapProps } from './types';
import { LeafletCityMap } from './LeafletCityMap';

export const SmartCityMap: React.FC<SmartMapProps> = (props) => {
  return <LeafletCityMap {...props} />;
};
