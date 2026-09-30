// SMARTMOVE Live Air Quality React Hook
// Fetches and subscribes to OpenWeather air pollution updates.

import { useState, useEffect } from 'react';
import { fetchLiveAirQuality, AirQualityData } from '../services/airQualityService';

export function useAirQuality(lat?: number, lng?: number) {
  const [airQuality, setAirQuality] = useState<AirQualityData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    let isMounted = true;
    setLoading(true);

    fetchLiveAirQuality(lat, lng).then((data) => {
      if (isMounted) {
        setAirQuality(data);
        setLoading(false);
      }
    });

    return () => {
      isMounted = false;
    };
  }, [lat, lng]);

  return { airQuality, loading };
}
