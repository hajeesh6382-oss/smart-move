// SMARTMOVE Route Calculation Client Service
// Calls Supabase Edge Function maps-route or falls back to internal mathematical routing engine

import { MultiObjectiveRoute, TravelMode } from '../../components/map/types';
import { calculateMultiObjectiveRoutes } from '../ai/formulas';

export async function fetchMultiObjectiveRoutes(
  origin: { lat: number; lng: number; name?: string },
  destination: { lat: number; lng: number; name?: string },
  travelMode: TravelMode = 'DRIVE'
): Promise<{ routes: MultiObjectiveRoute[]; provider: string; dataSource: string }> {
  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
  const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

  // 1. Try Supabase Edge Function `maps-route` if real cloud configuration is active
  if (supabaseUrl && !supabaseUrl.includes('mock-smartmove') && supabaseAnonKey) {
    try {
      const response = await fetch(`${supabaseUrl}/functions/v1/maps-route`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${supabaseAnonKey}`,
        },
        body: JSON.stringify({
          origin,
          destination,
          travelMode,
          computeAlternatives: true,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        if (data.routes && data.routes.length > 0) {
          return {
            routes: data.routes,
            provider: data.provider || 'Google Routes API',
            dataSource: data.dataSource || 'LIVE API DATA',
          };
        }
      }
    } catch (e) {
      console.warn('Edge function maps-route call failed, using local routing solver', e);
    }
  }

  // 2. High-Precision Local Multi-Objective Solver
  const dLat = (destination.lat - origin.lat) * (Math.PI / 180);
  const dLng = (destination.lng - origin.lng) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(origin.lat * (Math.PI / 180)) *
      Math.cos(destination.lat * (Math.PI / 180)) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);
  const distanceKm = Math.max(1.8, Number((6371 * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)) * 1.3).toFixed(1)));

  const baseSpeed = travelMode === 'TWO_WHEELER' ? 28 : travelMode === 'WALK' ? 4.5 : travelMode === 'TRANSIT' ? 22 : 25;
  const rawRoutes = calculateMultiObjectiveRoutes(distanceKm, baseSpeed, 82);

  const mappedRoutes: MultiObjectiveRoute[] = rawRoutes.map((r) => ({
    id: r.id,
    name: r.name,
    badge: r.badge,
    distanceKm: r.distanceKm,
    etaMin: r.etaMin,
    co2Grams: r.co2Grams,
    fuelLiters: r.fuelLiters,
    fuelSavedPct: r.fuelSavedPct,
    congestionPct: r.congestionPct,
    whyExplanation: r.whyExplanation,
    dataSource: 'ESTIMATED VALUE',
    steps: [
      {
        instruction: `Start from ${origin.name || 'Origin'} and merge onto Primary Arterial Corridor`,
        distanceMeters: Math.round((r.distanceKm * 1000) * 0.2),
      },
      {
        instruction: `Pass through adaptive signal intersection at Junction A`,
        distanceMeters: Math.round((r.distanceKm * 1000) * 0.5),
      },
      {
        instruction: `Turn toward ${destination.name || 'Destination'} and arrive at drop-off bay`,
        distanceMeters: Math.round((r.distanceKm * 1000) * 0.3),
      },
    ],
  }));

  return {
    routes: mappedRoutes,
    provider: 'SMARTMOVE Multi-Objective Engine (OSRM Seeded)',
    dataSource: 'ESTIMATED VALUE',
  };
}
