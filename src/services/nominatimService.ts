// SMARTMOVE Nominatim OpenStreetMap Geocoding & Location Search Service
// Replaces Google Places and Geocoding APIs with OpenStreetMap Nominatim.
// Implements request debouncing, rate-limit throttling (1 req/sec policy), caching, and offline seeds.

import { SALEM_LOCATIONS } from '../config/map-config';

export interface NominatimPlace {
  placeId: string;
  displayName: string;
  name: string;
  formattedAddress: string;
  lat: number;
  lng: number;
  type: string;
  category?: string;
  boundingBox?: [number, number, number, number]; // [minLat, maxLat, minLng, maxLng]
  importance?: number;
}

// In-memory cache to prevent repeated requests
const geocodeCache = new Map<string, { timestamp: number; results: NominatimPlace[] }>();
const CACHE_TTL_MS = 60 * 60 * 1000; // 1 hour cache

// Rate-limiting throttle state (Nominatim requires max 1 req/sec for public tier)
let lastRequestTime = 0;
const MIN_INTERVAL_MS = 800;

async function rateLimitDelay(): Promise<void> {
  const now = Date.now();
  const elapsed = now - lastRequestTime;
  if (elapsed < MIN_INTERVAL_MS) {
    await new Promise((resolve) => setTimeout(resolve, MIN_INTERVAL_MS - elapsed));
  }
  lastRequestTime = Date.now();
}

// Curated seed locations for instantaneous, offline-ready search
const SEED_LOCATIONS: NominatimPlace[] = [
  {
    placeId: 'seed_five_roads',
    name: SALEM_LOCATIONS.junctionA.name,
    displayName: 'Five Roads Junction, Salem',
    formattedAddress: 'Five Roads, Meyyanur, Salem, Tamil Nadu 636004, India',
    lat: SALEM_LOCATIONS.junctionA.lat,
    lng: SALEM_LOCATIONS.junctionA.lng,
    type: 'junction',
    category: 'junction',
  },
  {
    placeId: 'seed_new_bus_stand',
    name: SALEM_LOCATIONS.centralBusStand.name,
    displayName: 'Salem Central New Bus Stand (MGR Integrated)',
    formattedAddress: 'Meyyanur Bypass Road, Salem, Tamil Nadu 636004, India',
    lat: SALEM_LOCATIONS.centralBusStand.lat,
    lng: SALEM_LOCATIONS.centralBusStand.lng,
    type: 'bus_station',
    category: 'transit',
  },
  {
    placeId: 'seed_railway_junction',
    name: SALEM_LOCATIONS.railwayStation.name,
    displayName: 'Salem Railway Junction (SA)',
    formattedAddress: 'Suramangalam, Salem, Tamil Nadu 636005, India',
    lat: SALEM_LOCATIONS.railwayStation.lat,
    lng: SALEM_LOCATIONS.railwayStation.lng,
    type: 'train_station',
    category: 'transit',
  },
  {
    placeId: 'seed_hospital',
    name: SALEM_LOCATIONS.hospital.name,
    displayName: 'Govt Mohan Kumaramangalam Medical College Hospital',
    formattedAddress: 'Fort Main Road, Salem, Tamil Nadu 636001, India',
    lat: SALEM_LOCATIONS.hospital.lat,
    lng: SALEM_LOCATIONS.hospital.lng,
    type: 'hospital',
    category: 'amenity',
  },
  {
    placeId: 'seed_sona_tech',
    name: SALEM_LOCATIONS.techCampus.name,
    displayName: 'Sona College of Technology & Tech Campus',
    formattedAddress: 'Junction Main Road, Salem, Tamil Nadu 636005, India',
    lat: SALEM_LOCATIONS.techCampus.lat,
    lng: SALEM_LOCATIONS.techCampus.lng,
    type: 'university',
    category: 'campus',
  },
  {
    placeId: 'seed_old_bus_stand',
    name: SALEM_LOCATIONS.junctionC.name,
    displayName: 'Old Bus Stand Cross (Junction C)',
    formattedAddress: 'Old Bus Stand, Fort, Salem, Tamil Nadu 636001, India',
    lat: SALEM_LOCATIONS.junctionC.lat,
    lng: SALEM_LOCATIONS.junctionC.lng,
    type: 'junction',
    category: 'junction',
  },
  {
    placeId: 'seed_theni',
    name: 'Theni',
    displayName: 'Theni, Tamil Nadu, India',
    formattedAddress: 'Theni, Tamil Nadu 625531, India',
    lat: 10.0104,
    lng: 77.4768,
    type: 'city',
    category: 'place',
  },
  {
    placeId: 'seed_periyakulam',
    name: 'Periyakulam',
    displayName: 'Periyakulam, Theni, Tamil Nadu, India',
    formattedAddress: 'Periyakulam, Tamil Nadu 625601, India',
    lat: 10.1197,
    lng: 77.5458,
    type: 'city',
    category: 'place',
  },
  {
    placeId: 'seed_bengaluru',
    name: 'Bengaluru',
    displayName: 'Bengaluru, Karnataka, India',
    formattedAddress: 'Bengaluru, Karnataka 560001, India',
    lat: 12.9716,
    lng: 77.5946,
    type: 'city',
    category: 'place',
  },
  {
    placeId: 'seed_chennai',
    name: 'Chennai',
    displayName: 'Chennai, Tamil Nadu, India',
    formattedAddress: 'Chennai, Tamil Nadu 600001, India',
    lat: 13.0827,
    lng: 80.2707,
    type: 'city',
    category: 'place',
  },
  {
    placeId: 'seed_coimbatore',
    name: 'Coimbatore',
    displayName: 'Coimbatore, Tamil Nadu, India',
    formattedAddress: 'Coimbatore, Tamil Nadu 641001, India',
    lat: 11.0018,
    lng: 76.9628,
    type: 'city',
    category: 'place',
  },
  {
    placeId: 'seed_madurai',
    name: 'Madurai',
    displayName: 'Madurai, Tamil Nadu, India',
    formattedAddress: 'Madurai, Tamil Nadu 625001, India',
    lat: 9.9252,
    lng: 78.1198,
    type: 'city',
    category: 'place',
  },
  {
    placeId: 'seed_salem_city',
    name: 'Salem',
    displayName: 'Salem, Tamil Nadu, India',
    formattedAddress: 'Salem, Tamil Nadu 636001, India',
    lat: 11.6643,
    lng: 78.1460,
    type: 'city',
    category: 'place',
  },
];

/**
 * Search locations using OpenStreetMap Nominatim with caching & rate limiting
 */
export async function searchNominatim(query: string, limit: number = 6): Promise<NominatimPlace[]> {
  const clean = query.trim();
  if (!clean || clean.length < 2) return [];

  const cacheKey = `nom_${clean.toLowerCase()}_${limit}`;
  const cached = geocodeCache.get(cacheKey);
  if (cached && Date.now() - cached.timestamp < CACHE_TTL_MS) {
    return cached.results;
  }

  // Check local curated seeds first for instant zero-latency match
  const seedMatches = SEED_LOCATIONS.filter(
    (s) =>
      s.name.toLowerCase().includes(clean.toLowerCase()) ||
      s.formattedAddress.toLowerCase().includes(clean.toLowerCase())
  );

  const baseUrl = import.meta.env.VITE_NOMINATIM_URL || 'https://nominatim.openstreetmap.org';

  try {
    await rateLimitDelay();

    // Query Nominatim API with format=json, q, limit=5, and countrycodes=in
    const url = `${baseUrl}/search?format=json&q=${encodeURIComponent(
      clean
    )}&limit=${limit}&addressdetails=1&countrycodes=in`;

    const response = await fetch(url, {
      headers: {
        Accept: 'application/json',
        'User-Agent': 'SMARTMOVE-UrbanMobility/2.0 (smartmove-urban-mobility-ai@github.com)',
      },
    });

    if (!response.ok) {
      console.warn(`[SMARTMOVE Nominatim] HTTP ${response.status}. Using seed fallback.`);
      return seedMatches;
    }

    const data = await response.json();

    if (Array.isArray(data) && data.length > 0) {
      const fetchedPlaces: NominatimPlace[] = data.map((item: any) => {
        const addr = item.address || {};
        const title = item.name || addr.road || addr.suburb || addr.city || addr.town || addr.village || clean;
        const subtitle = [addr.suburb, addr.city || addr.town || addr.village, addr.state, addr.country]
          .filter(Boolean)
          .join(', ');

        return {
          placeId: `osm_${item.osm_type || 'node'}_${item.osm_id}`,
          displayName: title,
          name: title,
          formattedAddress: item.display_name || subtitle,
          lat: parseFloat(item.lat),
          lng: parseFloat(item.lon),
          type: item.type || 'place',
          category: item.category,
          importance: item.importance,
        };
      });

      // Merge seeds and fetched results without duplicate titles
      const combined = [...seedMatches];
      fetchedPlaces.forEach((fp) => {
        if (!combined.some((c) => c.name.toLowerCase() === fp.name.toLowerCase())) {
          combined.push(fp);
        }
      });

      const finalResults = combined.slice(0, limit);
      geocodeCache.set(cacheKey, { timestamp: Date.now(), results: finalResults });
      return finalResults;
    }
  } catch (error) {
    console.warn('[SMARTMOVE Nominatim] Network error, falling back to local seeds:', error);
  }

  return seedMatches;
}

/**
 * Directly resolves a text string into { lat, lng, formattedAddress, displayName }
 * using seed dictionary and OpenStreetMap Nominatim /search?format=json&q=...&limit=5
 */
export async function resolveLocationCoordinates(
  query: string
): Promise<{ lat: number; lng: number; formattedAddress: string; displayName: string } | null> {
  const clean = query.trim();
  if (!clean) return null;

  // 1. Check if user typed coordinates like "11.6643, 78.1460"
  const coordMatch = clean.match(/^([-+]?\d{1,2}(?:\.\d+)?)[,\s]+([-+]?\d{1,3}(?:\.\d+)?)$/);
  if (coordMatch) {
    const lat = parseFloat(coordMatch[1]);
    const lng = parseFloat(coordMatch[2]);
    if (!isNaN(lat) && !isNaN(lng) && lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180) {
      return {
        lat,
        lng,
        displayName: `Coordinates (${lat.toFixed(4)}, ${lng.toFixed(4)})`,
        formattedAddress: `Coordinates: ${lat.toFixed(5)}, ${lng.toFixed(5)}`,
      };
    }
  }

  // 2. Instant match against curated seeds
  const seed = SEED_LOCATIONS.find(
    (s) =>
      s.name.toLowerCase() === clean.toLowerCase() ||
      s.displayName.toLowerCase().includes(clean.toLowerCase()) ||
      clean.toLowerCase().includes(s.name.toLowerCase())
  );
  if (seed) {
    return {
      lat: seed.lat,
      lng: seed.lng,
      displayName: seed.displayName,
      formattedAddress: seed.formattedAddress,
    };
  }

  // 3. Search via Nominatim
  const places = await searchNominatim(clean, 5);
  if (places && places.length > 0) {
    return {
      lat: places[0].lat,
      lng: places[0].lng,
      displayName: places[0].displayName,
      formattedAddress: places[0].formattedAddress,
    };
  }

  return null;
}

/**
 * Reverse geocode coordinates to an address using OpenStreetMap Nominatim
 */
export async function reverseGeocodeNominatim(lat: number, lng: number): Promise<NominatimPlace | null> {
  const cacheKey = `rev_${lat.toFixed(4)}_${lng.toFixed(4)}`;
  const cached = geocodeCache.get(cacheKey);
  if (cached && cached.results[0]) {
    return cached.results[0];
  }

  // Check if coordinates match known seeds within 500m
  const closeSeed = SEED_LOCATIONS.find((s) => {
    const dLat = Math.abs(s.lat - lat);
    const dLng = Math.abs(s.lng - lng);
    return dLat < 0.005 && dLng < 0.005;
  });

  if (closeSeed) {
    return closeSeed;
  }

  const baseUrl = import.meta.env.VITE_NOMINATIM_URL || 'https://nominatim.openstreetmap.org';

  try {
    await rateLimitDelay();

    const url = `${baseUrl}/reverse?lat=${lat}&lon=${lng}&format=jsonv2&addressdetails=1`;
    const response = await fetch(url, {
      headers: {
        Accept: 'application/json',
        'User-Agent': 'SMARTMOVE-UrbanMobility/2.0 (smartmove-urban-mobility-ai@github.com)',
      },
    });

    if (response.ok) {
      const item = await response.json();
      if (item && !item.error) {
        const addr = item.address || {};
        const title = item.name || addr.road || addr.suburb || addr.city || addr.town || 'Selected Map Location';
        const place: NominatimPlace = {
          placeId: `osm_${item.osm_type || 'node'}_${item.osm_id}`,
          displayName: title,
          name: title,
          formattedAddress: item.display_name,
          lat,
          lng,
          type: item.type || 'coordinate',
        };

        geocodeCache.set(cacheKey, { timestamp: Date.now(), results: [place] });
        return place;
      }
    }
  } catch (err) {
    console.warn('[SMARTMOVE Nominatim] Reverse geocode error:', err);
  }

  // Fallback to human-readable coordinate format
  return {
    placeId: `coords_${lat.toFixed(4)}_${lng.toFixed(4)}`,
    displayName: `Map Pin (${lat.toFixed(4)}, ${lng.toFixed(4)})`,
    name: `Location (${lat.toFixed(4)}, ${lng.toFixed(4)})`,
    formattedAddress: `Coordinates: ${lat.toFixed(5)}°N, ${lng.toFixed(5)}°E`,
    lat,
    lng,
    type: 'coordinate',
  };
}
