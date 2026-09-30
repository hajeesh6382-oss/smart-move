// SMARTMOVE Map Types & Provider Interfaces
// Configuration-driven support for Google Maps & Leaflet OpenStreetMap engines

import { MobilitySeverity } from '../../config/design-tokens';

export type MapProviderType = 'google' | 'leaflet' | 'osm' | 'maplibre';
export type MapStyleType = 'default' | 'satellite' | 'terrain';
export type TravelMode = 'DRIVE' | 'TWO_WHEELER' | 'TRANSIT' | 'WALK';
export type TimeOffset = 0 | 15 | 30 | 60;

export interface GeoPoint {
  lat: number;
  lng: number;
  name?: string;
  address?: string;
}

export interface MapLayersState {
  googleTraffic: boolean; // LIVE API DATA (Display only)
  simulatedCongestion: boolean; // SIMULATED / ESTIMATED (SMARTMOVE mathematical layer)
  buses: boolean;
  parking: boolean;
  ev: boolean;
  pedestrian: boolean;
  emergency: boolean;
}

export interface PlaceResult {
  id: string;
  name: string;
  address: string;
  lat: number;
  lng: number;
  category?: 'campus' | 'hospital' | 'market' | 'transit' | 'station' | 'parking' | 'landmark';
  nearbyMetrics?: {
    congestionPct: number;
    nearestBusStop: string;
    busCrowdPct: number;
    busEtaMin: number;
    availableParking: number;
    pedestrianRisk: number;
  };
}

export interface NavigationStep {
  instruction: string;
  distanceMeters: number;
  durationSec?: number;
}

export interface MultiObjectiveRoute {
  id: 'fastest' | 'eco' | 'balanced';
  name: string;
  badge: string;
  distanceKm: number;
  etaMin: number;
  co2Grams: number;
  fuelLiters: number;
  fuelSavedPct: number;
  congestionPct: number;
  polyline?: string;
  coordinates?: [number, number][];
  steps: NavigationStep[];
  whyExplanation: string;
  dataSource: 'LIVE API DATA' | 'ESTIMATED VALUE' | 'SIMULATED DATA';
}

export type LocationType =
  | 'source'
  | 'destination'
  | 'parking'
  | 'bus_stop'
  | 'metro'
  | 'ev_charging'
  | 'hospital'
  | 'incident'
  | 'waypoint';

export interface DynamicMapLocation {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
  type: LocationType;
  source: 'openstreetmap' | 'nominatim' | 'overpass' | 'osrm' | 'user';
  details?: string;
  available?: string | number;
  status?: string;
  hourlyRate?: string;
}

export type RequirementType = 'none' | 'parking' | 'ev' | 'transit' | 'emergency' | 'traffic' | 'all';

export interface SmartMapProps {
  initialCenter?: { lat: number; lng: number };
  initialZoom?: number;
  trafficData?: any[];
  busRoutes?: any[];
  parkingLocations?: any[];
  evStations?: any[];
  pedestrianZones?: any[];
  emergencyActive?: boolean;
  selectedRoute?: string;
  className?: string;
  fullHeight?: boolean;
  originName?: string;
  destinationName?: string;
  sourcePoint?: { lat: number; lng: number; name?: string };
  destinationPoint?: { lat: number; lng: number; name?: string };
  intermediateLocations?: DynamicMapLocation[];
  selectedRequirement?: RequirementType;
  directionsResult?: any;
  routes?: any[];
  activeRouteIndex?: number;
  travelMode?: TravelMode;
  userLocation?: { lat: number; lng: number; heading?: number };
  isNavigating?: boolean;
  onPlaceSelect?: (place: PlaceResult) => void;
  onRouteSelect?: (route: MultiObjectiveRoute) => void;
  onMapClickCoordinate?: (coords: { lat: number; lng: number }) => void;
}
