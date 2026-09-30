// SMARTMOVE Live Data Ingestion Service
// Orchestrates real-time API polling (weather, air quality, EV charging, predictions)
// and updates the cityStore and dataSourceRegistry.

import { fetchLiveWeather, WeatherData } from './weatherService';
import { fetchLiveAirQuality, AirQualityData } from './airQualityService';
import { fetchNearbyEVStations, EVStation } from './evStationService';
import { predictionEngine } from './predictionEngine';
import { cityStore } from '../lib/supabase/mockStore';

class LiveDataService {
  private weatherPollTimer: number | null = null;
  private isInitialized = false;

  public async initialize() {
    if (this.isInitialized) return;
    this.isInitialized = true;

    // Initial fetch of live APIs
    await this.refreshAllLiveData();

    // Set up polling (weather & air quality every 5 minutes)
    this.weatherPollTimer = window.setInterval(() => {
      this.refreshAllLiveData();
    }, 5 * 60 * 1000);
  }

  public async refreshAllLiveData() {
    try {
      const [weather, airQuality, evStations] = await Promise.all([
        fetchLiveWeather(),
        fetchLiveAirQuality(),
        fetchNearbyEVStations(),
      ]);

      // Push weather data to cityStore state if live
      if (weather.isLive) {
        cityStore.setLiveData('weather', weather);
      }

      // Push air quality to cityStore state if live
      if (airQuality.isLive) {
        cityStore.setLiveData('air_quality', airQuality);
      }

      // Push EV stations
      if (evStations.length > 0) {
        cityStore.setLiveData('ev_stations', evStations);
      }

      // Run statistical prediction engine updates
      this.runPredictionUpdates();
    } catch (err) {
      console.error('Error in refreshAllLiveData:', err);
    }
  }

  private runPredictionUpdates() {
    // Generate prediction snapshots for parking hubs
    const parkingPred = predictionEngine.predictParkingOccupancy('hub_central', 'Theni Central Hub', 68, 120, 30);
    cityStore.setLiveData('parking_prediction_central', parkingPred);

    // Generate pedestrian risk snapshot
    const pedRiskPred = predictionEngine.predictPedestrianRisk('zone_school_4', 'School Zone Corridor 4', 28, 1.8, false);
    cityStore.setLiveData('pedestrian_risk_school_4', pedRiskPred);

    // Generate Bus ETA snapshot
    const busEtaPred = predictionEngine.predictBusEta('bus_101', 'Route 4B', 'Main Junction', 12, 1.3);
    cityStore.setLiveData('bus_eta_101', busEtaPred);
  }

  public stop() {
    if (this.weatherPollTimer) {
      clearInterval(this.weatherPollTimer);
      this.weatherPollTimer = null;
    }
    this.isInitialized = false;
  }
}

export const liveDataService = new LiveDataService();
