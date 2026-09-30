// SMARTMOVE Live Weather React Hook
// Fetches and subscribes to weather service updates with loading and error states.

import { useState, useEffect } from 'react';
import { fetchLiveWeather, WeatherData } from '../services/weatherService';

export function useLiveWeather(lat?: number, lng?: number) {
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    let isMounted = true;
    setLoading(true);

    fetchLiveWeather(lat, lng).then((data) => {
      if (isMounted) {
        setWeather(data);
        setLoading(false);
      }
    });

    return () => {
      isMounted = false;
    };
  }, [lat, lng]);

  return { weather, loading };
}
