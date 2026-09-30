// SMARTMOVE Map Configuration (Google Maps & City Geographic Foundation)
// Default City: Salem, Tamil Nadu, India (Configurable)

export const DEFAULT_CITY = 'Salem, Tamil Nadu, India';
export const DEFAULT_LATITUDE = 11.6643;
export const DEFAULT_LONGITUDE = 78.1460;
export const DEFAULT_ZOOM = 14;

export const SALEM_LOCATIONS = {
  // Junctions & Key Intersections
  junctionA: {
    id: 'junc_five_roads',
    name: 'Five Roads Junction (Junction A)',
    lat: 11.6643,
    lng: 78.1460,
    type: 'junction',
    congestion: 84,
    speedKmh: 14,
  },
  junctionB: {
    id: 'junc_four_roads',
    name: 'Four Roads / New Bus Stand Cross (Junction B)',
    lat: 11.6680,
    lng: 78.1380,
    type: 'junction',
    congestion: 78,
    speedKmh: 18,
  },
  junctionC: {
    id: 'junc_old_bus_stand',
    name: 'Old Bus Stand Cross (Junction C)',
    lat: 11.6538,
    lng: 78.1575,
    type: 'junction',
    congestion: 81,
    speedKmh: 11,
  },
  junctionD: {
    id: 'junc_hospital_link',
    name: 'Hospital Link Road (Junction D)',
    lat: 11.6580,
    lng: 78.1510,
    type: 'junction',
    congestion: 38,
    speedKmh: 48,
  },

  // Landmarks & Hubs
  techCampus: {
    id: 'loc_sona_tech',
    name: 'Sona College of Technology & Tech Campus',
    address: 'Junction Main Road, Salem, Tamil Nadu 636005',
    lat: 11.6740,
    lng: 78.1270,
    type: 'campus',
  },
  railwayStation: {
    id: 'loc_salem_junction',
    name: 'Salem Railway Junction (SA)',
    address: 'Suramangalam, Salem, Tamil Nadu 636005',
    lat: 11.6710,
    lng: 78.1250,
    type: 'railway',
  },
  centralBusStand: {
    id: 'loc_new_bus_stand',
    name: 'Salem Central New Bus Stand (MGR Integrated)',
    address: 'Meyyanur, Salem, Tamil Nadu 636004',
    lat: 11.6690,
    lng: 78.1390,
    type: 'bus_stand',
  },
  hospital: {
    id: 'loc_govt_hospital',
    name: 'Govt Mohan Kumaramangalam Medical College Hospital',
    address: 'Fort Main Road, Salem, Tamil Nadu 636001',
    lat: 11.6580,
    lng: 78.1510,
    type: 'hospital',
  },
  centralMarket: {
    id: 'loc_central_bazaar',
    name: 'Salem Central Market Bazaar',
    address: 'Bazaar Street, Salem, Tamil Nadu 636001',
    lat: 11.6550,
    lng: 78.1585,
    type: 'market',
  },
  steelPlantRoad: {
    id: 'loc_steel_corridor',
    name: 'Salem Steel Plant Express Corridor',
    address: 'Steel Plant Road, Salem',
    lat: 11.6850,
    lng: 78.0850,
    type: 'expressway',
  },

  // Parking Bays
  parkingNewBusStand: {
    id: 'park_mgr_bus',
    name: 'New Bus Stand Smart Multilevel Parking',
    lat: 11.6685,
    lng: 78.1375,
    availableSpaces: 14,
    totalCapacity: 120,
    status: 'MEDIUM',
    forecast15m: 8,
  },
  parkingOldBusStand: {
    id: 'park_old_market',
    name: 'Old Bus Stand Commuter Parking Bay',
    lat: 11.6540,
    lng: 78.1570,
    availableSpaces: 6,
    totalCapacity: 80,
    status: 'HIGH',
    forecast15m: 2,
  },
  parkingRailway: {
    id: 'park_railway_hub',
    name: 'Salem Junction Rail Park & Ride',
    lat: 11.6705,
    lng: 78.1245,
    availableSpaces: 88,
    totalCapacity: 200,
    status: 'LOW',
    forecast15m: 75,
  },

  // EV Charging Hubs
  evFiveRoads: {
    id: 'ev_five_roads',
    name: 'Five Roads Fast EV Charging Hub',
    lat: 11.6635,
    lng: 78.1470,
    availablePlugs: 8,
    totalPlugs: 12,
    powerKw: 120,
  },
  evNewBusStand: {
    id: 'ev_mgr_hub',
    name: 'Meyyanur Eco Charge Supercharger',
    lat: 11.6695,
    lng: 78.1385,
    availablePlugs: 4,
    totalPlugs: 6,
    powerKw: 60,
  },

  // Pedestrian Risk Hotspots
  pedFiveRoads: {
    id: 'ped_five_roads_cross',
    name: 'Five Roads Pedestrian Intersection',
    lat: 11.6645,
    lng: 78.1465,
    riskScore: 78,
    riskLevel: 'Higher',
    activeWindow: '5:00 PM – 7:30 PM (Peak)',
  },
  pedOldMarket: {
    id: 'ped_bazaar_gate',
    name: 'Old Bazaar Crossing Zone',
    lat: 11.6535,
    lng: 78.1580,
    riskScore: 86,
    riskLevel: 'Higher',
    activeWindow: '4:30 PM – 8:30 PM (Evening Surge)',
  },
};

// Custom Google Maps Dark Theme JSON Styling
// Matches SMARTMOVE's deep obsidian (#030712), cyan telemetry (#06b6d4), and dark arterial roads (#1e293b)
export const GOOGLE_MAPS_DARK_STYLE: any[] = [
  { elementType: 'geometry', stylers: [{ color: '#090d16' }] },
  { elementType: 'labels.text.stroke', stylers: [{ color: '#030712' }, { weight: 2 }] },
  { elementType: 'labels.text.fill', stylers: [{ color: '#94a3b8' }] },
  {
    featureType: 'administrative.locality',
    elementType: 'labels.text.fill',
    stylers: [{ color: '#38bdf8' }],
  },
  {
    featureType: 'poi',
    elementType: 'labels.text.fill',
    stylers: [{ color: '#64748b' }],
  },
  {
    featureType: 'poi.park',
    elementType: 'geometry',
    stylers: [{ color: '#0b192c' }],
  },
  {
    featureType: 'poi.park',
    elementType: 'labels.text.fill',
    stylers: [{ color: '#10b981' }],
  },
  {
    featureType: 'road',
    elementType: 'geometry',
    stylers: [{ color: '#1e293b' }],
  },
  {
    featureType: 'road',
    elementType: 'geometry.stroke',
    stylers: [{ color: '#0f172a' }],
  },
  {
    featureType: 'road',
    elementType: 'labels.text.fill',
    stylers: [{ color: '#cbd5e1' }],
  },
  {
    featureType: 'road.highway',
    elementType: 'geometry',
    stylers: [{ color: '#26334d' }],
  },
  {
    featureType: 'road.highway',
    elementType: 'geometry.stroke',
    stylers: [{ color: '#0f172a' }],
  },
  {
    featureType: 'road.highway',
    elementType: 'labels.text.fill',
    stylers: [{ color: '#38bdf8' }],
  },
  {
    featureType: 'transit',
    elementType: 'geometry',
    stylers: [{ color: '#111c30' }],
  },
  {
    featureType: 'transit.station',
    elementType: 'labels.text.fill',
    stylers: [{ color: '#06b6d4' }],
  },
  {
    featureType: 'water',
    elementType: 'geometry',
    stylers: [{ color: '#041226' }],
  },
  {
    featureType: 'water',
    elementType: 'labels.text.fill',
    stylers: [{ color: '#0284c7' }],
  },
  {
    featureType: 'water',
    elementType: 'labels.text.stroke',
    stylers: [{ color: '#030712' }],
  },
];
