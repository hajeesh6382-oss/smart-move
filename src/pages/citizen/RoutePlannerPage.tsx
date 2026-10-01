// SMARTMOVE Universal Multi-Objective Route Planner & AI Navigation Engine
// Supports ANY location worldwide (Cities, Addresses, Landmarks, Airports, Plus Codes)
// Integrates Google Places Autocomplete, Google Directions/Routes API, Map Auto-Centering, and Grounded AI Analysis

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { SUPPORTED_LANGUAGES } from '../../i18n';
import { SourceBadge } from '../../components/ui/SourceBadge';
import { LiveBadge } from '../../components/ui/LiveBadge';
import { SmartCityMap } from '../../components/map/SmartCityMap';
import { useRealtimeTable } from '../../hooks/useRealtimeTable';
import { TravelMode } from '../../components/map/types';
import { PlacesAutocompleteInput, PlaceSelection } from '../../components/place/PlacesAutocompleteInput';
import {
  Navigation,
  Clock,
  Leaf,
  Fuel,
  HelpCircle,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  ArrowRight,
  ArrowUpDown,
  Sparkles,
  Zap,
  MapPin,
  RefreshCw,
  Compass,
  AlertTriangle,
  Radio,
  Check,
  TrendingDown,
  Car,
  Bike,
  Bus,
  Footprints,
  AlertCircle,
  RotateCcw,
  Volume2,
  VolumeX,
  Coins,
} from 'lucide-react';

import { computeMasterRoute, RouteWaypoint, ComputedRouteResult } from '../../services/osrmRoutingService';
import { resolveLocationCoordinates } from '../../services/nominatimService';
import { fetchPoisAlongRoute } from '../../services/overpassService';
import { evaluateRouteCongestionCharge, RoutePricingEvaluation } from '../../services/dynamicPricingService';
import { DynamicMapLocation, RequirementType, LocationType } from '../../components/map/types';
import { ErrorBoundary } from '../../components/ui/ErrorBoundary';

const RoutePlannerPageContent: React.FC = () => {
  const { t, i18n } = useTranslation();
  const [searchParams, setSearchParams] = useSearchParams();
  const urlDest = searchParams.get('dest') || '';
  const urlOrigin = searchParams.get('origin') || '';
  const urlAutoStart = searchParams.get('autoStart') === 'true';
  const urlDestLat = searchParams.get('destLat');
  const urlDestLng = searchParams.get('destLng');

  const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY || '';

  // Location inputs & resolved Place IDs
  const [startPoint, setStartPoint] = useState(urlOrigin || 'Theni, Tamil Nadu');
  const [destination, setDestination] = useState(urlDest || 'Madurai, Tamil Nadu');
  const [originPlace, setOriginPlace] = useState<PlaceSelection | null>(null);
  const [destPlace, setDestPlace] = useState<PlaceSelection | null>(null);

  // Dynamic Map Coordinates & Intermediate Facilities State
  const [sourceCoordinates, setSourceCoordinates] = useState<{ lat: number; lng: number } | null>(null);
  const [destinationCoordinates, setDestinationCoordinates] = useState<{ lat: number; lng: number } | null>(null);
  const [intermediateLocations, setIntermediateLocations] = useState<DynamicMapLocation[]>([]);
  const [selectedRequirement, setSelectedRequirement] = useState<RequirementType>('all');
  const [isFetchingFacilities, setIsFetchingFacilities] = useState(false);

  // Routing and Navigation state
  const [travelMode, setTravelMode] = useState<TravelMode>('DRIVE');
  const [selectedRouteId, setSelectedRouteId] = useState<string>('fastest');
  const [selectedRouteIndex, setSelectedRouteIndex] = useState<number>(0);
  const [expandedWhyId, setExpandedWhyId] = useState<string | null>('fastest');

  // UI & Calculation states
  const [buttonState, setButtonState] = useState<'idle' | 'calculating' | 'success' | 'error'>('idle');
  const [isNavigating, setIsNavigating] = useState(false);
  const [navStatus, setNavStatus] = useState<'idle' | 'starting' | 'active' | 'recalculating' | 'arrived' | 'error'>('idle');
  const [navStepIndex, setNavStepIndex] = useState(0);
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number; speed?: number; heading?: number } | null>(null);
  const [isOffRoute, setIsOffRoute] = useState(false);
  const [googleDirectionsResult, setGoogleDirectionsResult] = useState<any | null>(null);
  const [calculationError, setCalculationError] = useState<string | null>(null);
  const [errorActionableFix, setErrorActionableFix] = useState<string | null>(null);
  const [dataSourceBadge, setDataSourceBadge] = useState<string>('REAL GOOGLE MAPS');

  // Realtime tables
  const { data: trafficData } = useRealtimeTable('traffic_data');
  const { data: busRoutes } = useRealtimeTable('bus_routes');
  const { data: parkingLots } = useRealtimeTable('parking_locations');
  const { data: simState } = useRealtimeTable('simulation_state');
  const { data: activeIncidents } = useRealtimeTable('active_incidents');
  const { data: pricingZones } = useRealtimeTable('road_pricing_zones');
  const { data: pricingLive } = useRealtimeTable('road_pricing_live');

  const activeIncident = activeIncidents?.find((i: any) => i.status === 'active');

  // Real-Time Road Pricing Alert Banner State
  const [pricingAlert, setPricingAlert] = useState<{
    zoneName: string;
    previousCharge: number;
    currentCharge: number;
    congestionPercentage: number;
    reason: string;
  } | null>(null);

  // Listen for real-time dynamic pricing change events
  useEffect(() => {
    const handlePricingUpdate = (e: any) => {
      if (e.detail) {
        setPricingAlert({
          zoneName: e.detail.zoneName || 'Monitored Corridor',
          previousCharge: e.detail.previousCharge ?? 0,
          currentCharge: e.detail.currentCharge ?? 0,
          congestionPercentage: e.detail.congestionPercentage ?? 0,
          reason: e.detail.reason || 'Traffic conditions changed',
        });
      }
    };
    window.addEventListener('smartmove_pricing_updated', handlePricingUpdate);
    return () => window.removeEventListener('smartmove_pricing_updated', handlePricingUpdate);
  }, []);

  // Helper to evaluate dynamic road charges for any route
  const getRoutePricing = (route: ComputedRouteResult, idx: number): RoutePricingEvaluation => {
    return evaluateRouteCongestionCharge(
      idx,
      route.badge,
      route.pathCoordinates || [],
      pricingZones && pricingZones.length > 0 ? pricingZones : undefined,
      pricingLive && pricingLive.length > 0 ? pricingLive : undefined
    );
  };

  // Dynamic Route Options State
  const [routes, setRoutes] = useState<ComputedRouteResult[]>([]);
  const [turnByTurnSteps, setTurnByTurnSteps] = useState<Array<{ instruction: string; distance: string; duration?: string }>>([]);

  const activeRoute = routes.find((r) => r.id === selectedRouteId) || routes[0] || null;

  // Turn-by-turn steps
  const displaySteps = (turnByTurnSteps && turnByTurnSteps.length > 0)
    ? turnByTurnSteps
    : activeRoute
    ? [
        {
          instruction: `Proceed along highlighted route towards ${destination ? destination.split(',')[0] : 'Metro Hub'}`,
          distance: `${activeRoute.distanceKm} km`,
          duration: `${activeRoute.etaMin} min`,
        },
        {
          instruction: `Arrive at ${destination ? destination.split(',')[0] : 'Metro Hub'}`,
          distance: '0 m',
          duration: '0 min',
        },
      ]
    : [];

  // Voice guidance state
  const [voiceGuidanceEnabled, setVoiceGuidanceEnabled] = useState(true);

  // Multilingual Regional Text-to-Speech announcer
  const speakInstruction = useCallback((text: string) => {
    if (!voiceGuidanceEnabled || typeof window === 'undefined' || !('speechSynthesis' in window)) return;
    try {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      const langCode = i18n.language || 'en';
      const langObj = SUPPORTED_LANGUAGES.find((l) => l.code === langCode);
      const targetBcp47 = langObj?.bcp47 || 'en-IN';
      utterance.lang = targetBcp47;
      utterance.rate = 1.0;
      utterance.pitch = 1.0;

      const voices = window.speechSynthesis.getVoices();
      const regionalVoice = voices.find(
        (v) =>
          v.lang.toLowerCase().replace('_', '-').startsWith(targetBcp47.toLowerCase()) ||
          v.lang.toLowerCase().startsWith(langCode.toLowerCase())
      );
      if (regionalVoice) utterance.voice = regionalVoice;

      window.speechSynthesis.speak(utterance);
    } catch (e) {
      console.warn('[SMARTMOVE Voice] TTS notice:', e);
    }
  }, [voiceGuidanceEnabled, i18n.language]);

  // Start Navigation Action
  const handleStartNavigation = () => {
    console.log('[SMARTMOVE Navigation] Start Active Navigation initiated');
    if (!routes || routes.length === 0 || !activeRoute) {
      setCalculationError('Please calculate a route first before starting active navigation.');
      setErrorActionableFix('Select your origin and destination above, then click Plan & Recalculate Route.');
      setNavStatus('error');
      return;
    }

    setNavStatus('starting');
    setIsNavigating(true);
    setNavStepIndex(0);
    setCalculationError(null);
    setErrorActionableFix(null);

    const initialInstruction = displaySteps[0]?.instruction || `Starting navigation to ${destination ? destination.split(',')[0] : 'Metro Hub'}`;
    speakInstruction(`Starting active navigation. ${initialInstruction}`);

    if (!('geolocation' in navigator)) {
      console.warn('[SMARTMOVE Navigation] Geolocation not supported in browser');
      setCalculationError('Browser does not support geolocation tracking.');
      setNavStatus('active');
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const coords = {
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
          speed: pos.coords.speed ? Math.round(pos.coords.speed * 3.6) : 0,
          heading: pos.coords.heading || 0,
        };
        setUserLocation(coords);
        setNavStatus('active');
        console.log('[SMARTMOVE Navigation] Live GPS acquired:', coords);
      },
      (err) => {
        console.error('[SMARTMOVE Navigation Error] Geolocation error:', err.code, err.message);
        if (err.code === err.PERMISSION_DENIED) {
          setCalculationError('Location permission is required to start navigation.');
          setErrorActionableFix('Please allow location access in your browser site permissions and try again.');
        } else if (err.code === err.POSITION_UNAVAILABLE) {
          setCalculationError('Unable to start navigation: GPS location is unavailable.');
          setErrorActionableFix('Please check device GPS settings.');
        } else if (err.code === err.TIMEOUT) {
          setCalculationError('Unable to start navigation: Location request timed out.');
          setErrorActionableFix('Please click Start Active Navigation again.');
        } else {
          setCalculationError(`Unable to start navigation: ${err.message}`);
        }
        setNavStatus('error');
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  };

  // Exit Navigation Action
  const handleExitNavigation = () => {
    console.log('[SMARTMOVE Navigation] Exiting active navigation');
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    setIsNavigating(false);
    setNavStatus('idle');
    setUserLocation(null);
    setIsOffRoute(false);
    setNavStepIndex(0);
  };

  // Speak updated instruction when step changes in active navigation
  const prevStepRef = useRef<number>(-1);
  useEffect(() => {
    if (isNavigating && displaySteps.length > 0 && navStepIndex !== prevStepRef.current) {
      prevStepRef.current = navStepIndex;
      const current = displaySteps[navStepIndex];
      if (current) {
        speakInstruction(`${current.instruction}. In ${current.distance}`);
      }
    }
  }, [isNavigating, navStepIndex, displaySteps, speakInstruction]);

  // Live GPS Tracking during active navigation
  useEffect(() => {
    let watchId: number | null = null;
    if (isNavigating && 'geolocation' in navigator) {
      console.log('[SMARTMOVE Navigation] Starting live GPS tracking watchPosition');
      watchId = navigator.geolocation.watchPosition(
        (pos) => {
          const coords = {
            lat: pos.coords.latitude,
            lng: pos.coords.longitude,
            speed: pos.coords.speed ? Math.round(pos.coords.speed * 3.6) : 0,
            heading: pos.coords.heading || 0,
          };
          setUserLocation(coords);
          setNavStatus('active');

          // Check for off-route condition
          if (activeRoute?.polylinePoints && activeRoute.polylinePoints.length > 0) {
            let minDistanceMeters = Infinity;
            for (const pt of activeRoute.polylinePoints) {
              const dLat = (pt.lat - coords.lat) * 111000;
              const dLng = (pt.lng - coords.lng) * 111000 * Math.cos((coords.lat * Math.PI) / 180);
              const dist = Math.sqrt(dLat * dLat + dLng * dLng);
              if (dist < minDistanceMeters) minDistanceMeters = dist;
            }

            if (minDistanceMeters > 400) {
              console.warn('[SMARTMOVE Navigation] User is off-route by', Math.round(minDistanceMeters), 'meters.');
              setIsOffRoute(true);
            } else {
              setIsOffRoute(false);
            }
          }
        },
        (err) => {
          console.warn('[SMARTMOVE Navigation] Geolocation watch position note:', err.message);
        },
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 3000 }
      );
    } else {
      setUserLocation(null);
      setIsOffRoute(false);
    }

    return () => {
      if (watchId !== null) navigator.geolocation.clearWatch(watchId);
    };
  }, [isNavigating, activeRoute]);

  // Clear Route
  const handleClearRoute = () => {
    setGoogleDirectionsResult(null);
    setRoutes([]);
    setTurnByTurnSteps([]);
    setSourceCoordinates(null);
    setDestinationCoordinates(null);
    setIntermediateLocations([]);
    setCalculationError(null);
    setErrorActionableFix(null);
    setButtonState('idle');
    setIsNavigating(false);
    setNavStatus('idle');
    setUserLocation(null);
  };

  // Core Route Calculation Engine
  const calculateRoutes = useCallback(
    async (
      originQuery: string,
      destQuery: string,
      mode: TravelMode,
      originObj?: PlaceSelection | null,
      destObj?: PlaceSelection | null
    ) => {
      console.log('[SMARTMOVE] Calculating route from:', originQuery, 'to:', destQuery);

      if (!originQuery || !originQuery.trim()) {
        setCalculationError('Please enter your starting location.');
        setErrorActionableFix('Type a city, address, or landmark in the FROM field.');
        setButtonState('error');
        return;
      }

      if (!destQuery || !destQuery.trim()) {
        setCalculationError('Please enter your destination.');
        setErrorActionableFix('Type a city, address, or landmark in the TO field.');
        setButtonState('error');
        return;
      }

      setButtonState('calculating');
      setCalculationError(null);
      setErrorActionableFix(null);
      setGoogleDirectionsResult(null);

      let resolvedOriginLat = originObj?.lat;
      let resolvedOriginLng = originObj?.lng;
      let resolvedOriginAddress = originObj?.formattedAddress || originQuery.trim();

      if (typeof resolvedOriginLat !== 'number' || typeof resolvedOriginLng !== 'number') {
        const resolved = await resolveLocationCoordinates(originQuery.trim());
        if (resolved) {
          resolvedOriginLat = resolved.lat;
          resolvedOriginLng = resolved.lng;
          resolvedOriginAddress = resolved.formattedAddress;
          setOriginPlace({
            name: resolved.displayName,
            formattedAddress: resolved.formattedAddress,
            lat: resolved.lat,
            lng: resolved.lng,
          });
        }
      }

      let resolvedDestLat = destObj?.lat;
      let resolvedDestLng = destObj?.lng;
      let resolvedDestAddress = destObj?.formattedAddress || destQuery.trim();

      if (typeof resolvedDestLat !== 'number' || typeof resolvedDestLng !== 'number') {
        const resolved = await resolveLocationCoordinates(destQuery.trim());
        if (resolved) {
          resolvedDestLat = resolved.lat;
          resolvedDestLng = resolved.lng;
          resolvedDestAddress = resolved.formattedAddress;
          setDestPlace({
            name: resolved.displayName,
            formattedAddress: resolved.formattedAddress,
            lat: resolved.lat,
            lng: resolved.lng,
          });
        }
      }

      const originParam: RouteWaypoint = {
        placeId: originObj?.placeId,
        lat: resolvedOriginLat,
        lng: resolvedOriginLng,
        address: resolvedOriginAddress,
      };

      const destParam: RouteWaypoint = {
        placeId: destObj?.placeId,
        lat: resolvedDestLat,
        lng: resolvedDestLng,
        address: resolvedDestAddress,
      };

      const res = await computeMasterRoute(apiKey, originParam, destParam, mode);

      if (res.success && res.routes.length > 0) {
        console.log('[SMARTMOVE OSRM] Route calculation successful:', res.routes.length, 'routes returned');
        setRoutes(res.routes);
        setSelectedRouteId((res.routes[0]?.id as any) || 'fastest');
        setSelectedRouteIndex(0);
        setGoogleDirectionsResult(null);
        setTurnByTurnSteps(
          (res.routes[0]?.steps || []).map((s) => ({
            instruction: s.instruction,
            distance: s.distanceText || `${(s.distanceMeters / 1000).toFixed(1)} km`,
            duration: s.durationText,
          }))
        );
        setDataSourceBadge('OSRM + OPENSTREETMAP');
        setButtonState('success');

        // Set dynamic source & destination coordinates
        if (typeof resolvedOriginLat === 'number' && typeof resolvedOriginLng === 'number') {
          setSourceCoordinates({ lat: resolvedOriginLat, lng: resolvedOriginLng });
        }
        if (typeof resolvedDestLat === 'number' && typeof resolvedDestLng === 'number') {
          setDestinationCoordinates({ lat: resolvedDestLat, lng: resolvedDestLng });
        }

        // Map first route's milestone places to intermediate locations on the Leaflet map
        const firstRoute = res.routes[0];
        const routeMilestones: DynamicMapLocation[] = (firstRoute?.milestones || [])
          .filter((m) => m.type !== 'origin' && m.type !== 'destination')
          .map((m, mIdx) => ({
            id: `milestone_${mIdx}_${m.name.replace(/\s+/g, '_')}`,
            name: m.name,
            latitude: m.lat,
            longitude: m.lng,
            type: 'waypoint' as LocationType,
            source: 'osrm' as const,
            available: `${m.distanceKm} km • ~${m.etaMin} min`,
            details: `Corridor milestone along ${firstRoute.name}`,
            status: 'TRANSIT HUB',
          }));

        // Fetch dynamic intermediate places along the calculated route
        const activePath = firstRoute?.pathCoordinates || [];
        if (activePath.length > 0) {
          setIsFetchingFacilities(true);
          fetchPoisAlongRoute(activePath, selectedRequirement)
            .then((pois) => setIntermediateLocations([...routeMilestones, ...pois]))
            .catch((err) => {
              console.warn('[SMARTMOVE POI] Failed to load facilities:', err);
              setIntermediateLocations(routeMilestones);
            })
            .finally(() => setIsFetchingFacilities(false));
        } else {
          setIntermediateLocations(routeMilestones);
        }
      } else {
        console.warn('[SMARTMOVE OSRM] Route calculation note:', res.error);
        setRoutes([]);
        setTurnByTurnSteps([]);
        setIntermediateLocations([]);
        setCalculationError(res.error?.message || 'OSRM routing service is currently unavailable.');
        setErrorActionableFix(res.error?.actionableFix || 'Please select valid start and destination locations.');
        setButtonState('error');
      }
    },
    [apiKey, selectedRequirement]
  );

  // Switch between calculated routes and update milestone markers on map
  const handleSelectRoute = (route: ComputedRouteResult, idx: number) => {
    setSelectedRouteId(route.id);
    setSelectedRouteIndex(idx);
    setTurnByTurnSteps(
      (route.steps || []).map((s) => ({
        instruction: s.instruction,
        distance: s.distanceText || `${(s.distanceMeters / 1000).toFixed(1)} km`,
        duration: s.durationText,
      }))
    );

    const routeMilestones: DynamicMapLocation[] = (route.milestones || [])
      .filter((m) => m.type !== 'origin' && m.type !== 'destination')
      .map((m, mIdx) => ({
        id: `milestone_${mIdx}_${m.name.replace(/\s+/g, '_')}`,
        name: m.name,
        latitude: m.lat,
        longitude: m.lng,
        type: 'waypoint' as LocationType,
        source: 'osrm' as const,
        available: `${m.distanceKm} km • ~${m.etaMin} min`,
        details: `Corridor milestone along ${route.name}`,
        status: 'TRANSIT HUB',
      }));

    setIntermediateLocations((prev) => {
      const nonMilestones = prev.filter((p) => p.type !== 'waypoint');
      return [...routeMilestones, ...nonMilestones];
    });
  };

  // Requirement selector handler
  const handleRequirementChange = async (req: RequirementType) => {
    setSelectedRequirement(req);
    const activePath = activeRoute?.pathCoordinates || routes[0]?.pathCoordinates;
    if (activePath && activePath.length > 0) {
      setIsFetchingFacilities(true);
      try {
        const pois = await fetchPoisAlongRoute(activePath, req);
        setIntermediateLocations(pois);
      } catch (err) {
        console.warn('[SMARTMOVE POI] Failed to load facilities for requirement:', err);
      } finally {
        setIsFetchingFacilities(false);
      }
    } else {
      setIntermediateLocations([]);
    }
  };

  // Quick Preset Test Routes Handler
  const handleQuickRoute = async (originText: string, destText: string) => {
    setStartPoint(originText);
    setDestination(destText);
    setOriginPlace(null);
    setDestPlace(null);
    setSourceCoordinates(null);
    setDestinationCoordinates(null);
    setIntermediateLocations([]);
    setRoutes([]);
    await calculateRoutes(originText, destText, travelMode);
  };

  // Initial load / search params sync
  useEffect(() => {
    let isMounted = true;

    async function handleParamSync() {
      const targetDest = urlDest || destination;
      const targetDestLat = urlDestLat ? parseFloat(urlDestLat) : undefined;
      const targetDestLng = urlDestLng ? parseFloat(urlDestLng) : undefined;

      setDestination(targetDest);

      let destSelection: PlaceSelection | null = null;
      if (targetDestLat && targetDestLng) {
        destSelection = {
          name: targetDest,
          formattedAddress: targetDest,
          lat: targetDestLat,
          lng: targetDestLng,
        };
        setDestPlace(destSelection);
      }

      // Automatically calculate initial route
      calculateRoutes(startPoint, targetDest, travelMode, null, destSelection);

      // Handle autoStart or Metro Hub navigation directly
      if (urlAutoStart || urlDest) {
        if ('geolocation' in navigator) {
          navigator.geolocation.getCurrentPosition(
            async (pos) => {
              if (!isMounted) return;
              const userLat = pos.coords.latitude;
              const userLng = pos.coords.longitude;
              const coords = { lat: userLat, lng: userLng };
              setUserLocation(coords);

              const originSelection: PlaceSelection = {
                name: 'Your Current Location',
                formattedAddress: `GPS (${userLat.toFixed(4)}, ${userLng.toFixed(4)})`,
                lat: userLat,
                lng: userLng,
              };
              setStartPoint(`Current Location (${userLat.toFixed(4)}, ${userLng.toFixed(4)})`);
              setOriginPlace(originSelection);

              console.log('[SMARTMOVE] Auto-calculating route from User GPS to:', targetDest);
              await calculateRoutes(
                `${userLat},${userLng}`,
                targetDest,
                travelMode,
                originSelection,
                destSelection
              );

              if (urlAutoStart && isMounted) {
                setNavStatus('starting');
                setIsNavigating(true);
                setNavStepIndex(0);
                setNavStatus('active');
              }
            },
            async (err) => {
              console.warn('[SMARTMOVE Navigation] Geolocation error, using default origin:', err.message);
              if (err.code === err.PERMISSION_DENIED) {
                setCalculationError('Location permission is required to start navigation.');
                setErrorActionableFix('Please grant browser location permissions for turn-by-turn guidance.');
              }
              const defaultOrigin = urlOrigin || 'Theni, Tamil Nadu, India';
              setStartPoint(defaultOrigin);
              await calculateRoutes(defaultOrigin, targetDest, travelMode, null, destSelection);
            },
            { enableHighAccuracy: true, timeout: 8000 }
          );
        } else {
          const defaultOrigin = urlOrigin || 'Theni, Tamil Nadu, India';
          setStartPoint(defaultOrigin);
          await calculateRoutes(defaultOrigin, targetDest, travelMode, null, destSelection);
        }
      }
    }

    handleParamSync();

    return () => {
      isMounted = false;
    };
  }, [urlDest, urlOrigin, urlAutoStart, urlDestLat, urlDestLng]);

  // Form submit handler
  const handlePlanRoute = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setSearchParams({ origin: startPoint, dest: destination });
    calculateRoutes(startPoint, destination, travelMode, originPlace, destPlace);
  };

  // Swap Origin and Destination
  const handleSwap = () => {
    const tempText = startPoint;
    const tempObj = originPlace;
    setStartPoint(destination);
    setOriginPlace(destPlace);
    setDestination(tempText);
    setDestPlace(tempObj);
    setSearchParams({ origin: destination, dest: tempText });
    calculateRoutes(destination, tempText, travelMode, destPlace, tempObj);
  };

  // Presets
  const presets = [
    { from: 'Current Location', to: 'Metro Park & Ride Hub', label: '📍 My Location ➔ Metro Hub' },
    { from: 'Theni, Tamil Nadu, India', to: 'Periyakulam, Tamil Nadu, India', label: 'Theni ➔ Periyakulam' },
    { from: 'Salem, Tamil Nadu, India', to: 'Bengaluru, Karnataka, India', label: 'Salem ➔ Bengaluru' },
    { from: 'Chennai, Tamil Nadu, India', to: 'Coimbatore, Tamil Nadu, India', label: 'Chennai ➔ Coimbatore' },
  ];

  const travelModesList: { mode: TravelMode; label: string; icon: React.ReactNode }[] = [
    { mode: 'DRIVE', label: 'Drive', icon: <Car className="w-4 h-4" /> },
    { mode: 'TWO_WHEELER', label: '2-Wheeler', icon: <Bike className="w-4 h-4" /> },
    { mode: 'TRANSIT', label: 'Transit', icon: <Bus className="w-4 h-4" /> },
    { mode: 'WALK', label: 'Walk', icon: <Footprints className="w-4 h-4" /> },
  ];

  return (
    <div className="space-y-6">
      {/* Top Page Header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs uppercase font-mono font-bold text-cyan-400">
              Universal Multi-Objective AI Navigation
            </span>
            <LiveBadge />
            <SourceBadge source={dataSourceBadge} />
          </div>
          <h2 className="text-2xl lg:text-3xl font-black font-display text-white mt-0.5">
            {t('routes.title', 'Smart Route Optimizer & Active Navigation')}
          </h2>
          <p className="text-xs text-slate-400">
            {t('routes.subtitle', 'Compute traffic-aware routes for Metro Hub or any location worldwide with real navigation.')}
          </p>
        </div>

        {/* Global Presets */}
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="text-[11px] font-mono text-slate-500 mr-1">Presets:</span>
          {presets.map((p, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => {
                if (p.from === 'Current Location') {
                  setSearchParams({ dest: 'Metro Park & Ride Hub', destLat: '12.9640', destLng: '77.6180', autoStart: 'true' });
                } else {
                  setStartPoint(p.from);
                  setOriginPlace(null);
                  setDestination(p.to);
                  setDestPlace(null);
                  setSearchParams({ origin: p.from, dest: p.to });
                  calculateRoutes(p.from, p.to, travelMode);
                }
              }}
              className="px-2.5 py-1 rounded-xl text-[11px] bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 transition-colors cursor-pointer font-medium"
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      {/* Real-time Dynamic Road Pricing Notification Banner */}
      {pricingAlert && (
        <div className="p-4 rounded-2xl bg-amber-500/15 border border-amber-500/40 text-amber-200 flex items-start justify-between gap-3 shadow-xl backdrop-blur-md animate-in fade-in slide-in-from-top-2">
          <div className="flex items-start gap-3">
            <div className="p-2 rounded-xl bg-amber-500/20 text-amber-300 border border-amber-500/40 shrink-0">
              <Coins className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono font-bold uppercase tracking-wider text-amber-300">
                  ⚡ Dynamic Road Pricing Alert
                </span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-400/20 text-amber-300 font-mono font-semibold">
                  {pricingAlert.zoneName}
                </span>
              </div>
              <p className="text-sm font-semibold text-white mt-0.5">
                Recommended congestion charge updated: <span className="line-through text-slate-400">₹{pricingAlert.previousCharge}</span> → <span className="text-amber-300 font-black">₹{pricingAlert.currentCharge}</span>
              </p>
              <p className="text-xs text-amber-200/80 mt-0.5">
                {pricingAlert.reason} • Congestion level: {pricingAlert.congestionPercentage}%
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setPricingAlert(null)}
            className="text-xs text-amber-400 hover:text-white px-2 py-1 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 transition-colors cursor-pointer"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* AI Explanation Panel */}
      {routes.length > 0 && activeRoute && (
        <div className="glass-panel p-5 rounded-3xl border border-blue-200 bg-gradient-to-r from-blue-50/90 via-white to-sky-50/90 shadow-xl relative overflow-hidden animate-in fade-in">
          <div className="flex items-center justify-between pb-3 border-b border-blue-100">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-blue-100 text-blue-700 border border-blue-200">
                <Sparkles className="w-4 h-4 text-blue-600" />
              </div>
              <span className="text-xs uppercase font-mono font-bold text-blue-900 tracking-wider">
                SMARTMOVE AI Mobility Brain Live Decision Feed
              </span>
            </div>
            <span className="text-[10px] font-mono text-blue-700 font-bold bg-blue-100/70 px-2 py-0.5 rounded-full border border-blue-200">
              ● REAL GOOGLE ROUTE ACTIVE
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-4 text-xs">
            <div className="p-3.5 rounded-2xl bg-white border border-blue-100 shadow-sm space-y-1">
              <span className="text-[10px] font-mono uppercase font-bold text-blue-900 block flex items-center gap-1">
                <AlertTriangle className="w-3 h-3 text-amber-500" /> ROUTE SUMMARY
              </span>
              <p className="text-blue-950 leading-relaxed font-medium">
                Route calculated to <strong className="text-blue-900 font-bold">{destination ? destination.split(',')[0] : 'Metro Hub'}</strong> ({activeRoute.distanceKm} km).
              </p>
            </div>

            <div className="p-3.5 rounded-2xl bg-white border border-blue-100 shadow-sm space-y-1">
              <span className="text-[10px] font-mono uppercase font-bold text-blue-900 block flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-blue-600" /> TRAFFIC ANALYSIS
              </span>
              <p className="text-blue-950 leading-relaxed font-medium">
                Corridor flow at {activeRoute.congestionPct}% congestion. Current ETA is{' '}
                <strong className="text-blue-700 font-bold">{activeRoute.etaMin} minutes</strong> in traffic.
              </p>
            </div>

            <div className="p-3.5 rounded-2xl bg-white border border-blue-100 shadow-sm space-y-1">
              <span className="text-[10px] font-mono uppercase font-bold text-blue-900 block flex items-center gap-1">
                <Coins className="w-3 h-3 text-amber-500" /> DYNAMIC ROAD PRICING
              </span>
              <p className="text-blue-950 leading-relaxed font-medium">
                {routes.length > 1
                  ? `Primary route has ₹${getRoutePricing(routes[0], 0).totalDynamicCharge} ERP fee. Alternative (${routes[1]?.badge || 'Route B'}) avoids high-congestion corridor (₹${getRoutePricing(routes[1], 1).totalDynamicCharge} fee).`
                  : `Current dynamic road pricing recommendation: ₹${getRoutePricing(activeRoute, selectedRouteIndex).totalDynamicCharge}.`}
              </p>
            </div>

            <div className="p-3.5 rounded-2xl bg-white border border-blue-100 shadow-sm space-y-1">
              <span className="text-[10px] font-mono uppercase font-bold text-blue-900 block flex items-center gap-1">
                <TrendingDown className="w-3 h-3 text-blue-600" /> SUSTAINABILITY IMPACT
              </span>
              <p className="text-blue-950 leading-relaxed font-medium">
                Saves estimated <strong className="text-blue-700 font-bold">{activeRoute.fuelSavedPct}% fuel</strong> (~{activeRoute.fuelLiters} L).
              </p>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Inputs & Route Cards */}
        <div className="lg:col-span-5 space-y-4">
          <form onSubmit={handlePlanRoute} className="glass-panel p-5 rounded-2xl border border-blue-200 bg-white space-y-3.5 shadow-md">
            <div className="flex items-center justify-between">
              <div className="text-xs uppercase font-bold text-blue-950 font-mono flex items-center gap-1.5">
                <Navigation className="w-3.5 h-3.5 text-blue-600" />
                Trip Parameters
              </div>
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={handleSwap}
                  className="p-1.5 rounded-lg bg-blue-50 text-blue-700 hover:text-blue-950 border border-blue-200 transition-colors cursor-pointer"
                  title="Swap Origin and Destination"
                >
                  <ArrowUpDown className="w-3.5 h-3.5" />
                </button>
                {routes.length > 0 && (
                  <button
                    type="button"
                    onClick={handleClearRoute}
                    className="p-1.5 rounded-lg bg-blue-50 text-blue-700 hover:text-rose-600 border border-blue-200 transition-colors cursor-pointer"
                    title="Clear Current Route"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>

            {/* Travel Mode Selector */}
            <div className="grid grid-cols-4 gap-1.5 pt-1">
              {travelModesList.map((tm) => (
                <button
                  key={tm.mode}
                  type="button"
                  onClick={() => {
                    setTravelMode(tm.mode);
                    calculateRoutes(startPoint, destination, tm.mode, originPlace, destPlace);
                  }}
                  className={`py-1.5 rounded-xl text-xs font-semibold flex items-center justify-center gap-1 transition-all cursor-pointer ${
                    travelMode === tm.mode
                      ? 'bg-blue-600 text-white font-bold shadow-md shadow-blue-500/25'
                      : 'bg-blue-50/70 text-blue-900 hover:bg-blue-100 border border-blue-200'
                  }`}
                >
                  {tm.icon}
                  <span className="text-[11px]">{tm.label}</span>
                </button>
              ))}
            </div>

            {/* Google Places Autocomplete Inputs */}
            <div className="space-y-3">
              <PlacesAutocompleteInput
                label={t('routes.origin_label', 'Origin Point (FROM)')}
                value={startPoint}
                onChange={setStartPoint}
                onSelectPlace={setOriginPlace}
                placeholder={t('routes.origin_placeholder', 'Enter city, town, address, or landmark...')}
                indicatorColor="bg-blue-600"
              />

              <PlacesAutocompleteInput
                label={t('routes.destination_label', 'Destination (TO)')}
                value={destination}
                onChange={setDestination}
                onSelectPlace={setDestPlace}
                placeholder={t('routes.destination_placeholder', 'Enter destination location...')}
                indicatorColor="bg-emerald-600"
              />
            </div>

            {/* Quick Test Route Presets */}
            <div className="space-y-1.5 pt-1">
              <div className="text-[10px] font-mono uppercase text-blue-950 font-bold flex items-center justify-between">
                <span>Quick Test Routes</span>
                <span className="text-blue-600 font-bold">1-Click Test</span>
              </div>
              <div className="grid grid-cols-2 gap-1.5">
                {[
                  { from: 'Theni, Tamil Nadu', to: 'Madurai, Tamil Nadu', label: 'Theni → Madurai (4 Routes)' },
                  { from: 'Theni, Tamil Nadu', to: 'Periyakulam, Tamil Nadu', label: 'Theni → Periyakulam' },
                  { from: 'Salem, Tamil Nadu', to: 'Madurai, Tamil Nadu', label: 'Salem → Madurai' },
                  { from: 'Chennai, Tamil Nadu', to: 'Coimbatore, Tamil Nadu', label: 'Chennai → Coimbatore' },
                ].map((preset) => (
                  <button
                    key={preset.label}
                    type="button"
                    onClick={() => handleQuickRoute(preset.from, preset.to)}
                    className="py-1.5 px-2 rounded-xl bg-white hover:bg-blue-50 border border-blue-200 text-[11px] font-semibold text-blue-950 hover:text-blue-700 transition-all text-left truncate cursor-pointer flex items-center gap-1.5 shadow-sm"
                  >
                    <Compass className="w-3 h-3 text-blue-600 shrink-0" />
                    <span className="truncate">{preset.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {calculationError && (
              <div className="p-3.5 rounded-2xl bg-rose-950/40 border border-rose-500/40 text-rose-200 text-xs space-y-2 animate-in fade-in">
                <div className="flex items-start gap-2.5">
                  <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                  <div className="space-y-1">
                    <p className="font-semibold text-rose-300">{calculationError}</p>
                    {errorActionableFix && (
                      <p className="text-[11px] text-slate-300 leading-relaxed font-mono bg-slate-950/60 p-2 rounded-lg border border-slate-800">
                        💡 <strong className="text-amber-300">Action Required:</strong> {errorActionableFix}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={buttonState === 'calculating'}
              className="w-full py-3.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-black text-xs sm:text-sm shadow-xl shadow-blue-500/25 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
            >
              {buttonState === 'calculating' ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin text-white" />
                  {t('routes.calculating', 'Calculating Route...')}
                </>
              ) : buttonState === 'success' ? (
                <>
                  <CheckCircle2 className="w-4 h-4 text-white" />
                  {t('routes.calculate_button', 'Plan & Recalculate Route')}
                </>
              ) : buttonState === 'error' ? (
                <>
                  <AlertTriangle className="w-4 h-4 text-white" />
                  {t('common.cancel', 'Try Again')}
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 text-white" />
                  {t('routes.calculate_button', 'Find Optimal Route')}
                </>
              )}
            </button>

            {/* SMARTMOVE Requirement-Based Facilities Selector */}
            <div className="space-y-1.5 pt-2 border-t border-blue-100">
              <div className="text-[10px] font-mono uppercase text-blue-950 font-bold flex items-center justify-between">
                <span className="flex items-center gap-1">
                  <Sparkles className="w-3 h-3 text-blue-600" /> Route Requirements
                </span>
                {isFetchingFacilities && <RefreshCw className="w-3 h-3 text-blue-600 animate-spin" />}
              </div>
              <div className="grid grid-cols-3 gap-1.5">
                {[
                  { req: 'all', label: 'All Places', icon: '📍' },
                  { req: 'parking', label: 'Parking', icon: '🅿️' },
                  { req: 'ev', label: 'EV Stations', icon: '⚡' },
                  { req: 'transit', label: 'Transit / Bus', icon: '🚌' },
                  { req: 'emergency', label: 'Hospitals', icon: '🏥' },
                  { req: 'traffic', label: 'Traffic Alerts', icon: '⚠️' },
                ].map((item) => (
                  <button
                    key={item.req}
                    type="button"
                    onClick={() => handleRequirementChange(item.req as RequirementType)}
                    className={`py-1.5 px-2 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                      selectedRequirement === item.req
                        ? 'bg-blue-600 text-white font-bold shadow-md shadow-blue-500/25'
                        : 'bg-blue-50/70 text-blue-950 hover:bg-blue-100 border border-blue-200'
                    }`}
                  >
                    <span>{item.icon}</span>
                    <span className="text-[11px]">{item.label}</span>
                  </button>
                ))}
              </div>
            </div>
          </form>

          {/* Returned Google Route Options Cards */}
          {routes.length > 0 && (
            <div className="space-y-3 animate-in fade-in">
              <div className="text-[11px] font-mono text-blue-950 uppercase tracking-wider flex items-center justify-between font-bold">
                <span>Calculated Routes ({routes.length})</span>
                <span className="text-blue-600 font-bold">Select to view</span>
              </div>

              {routes.map((route, idx) => {
                const isSelected = selectedRouteId === route.id || selectedRouteIndex === idx;
                const isWhyOpen = expandedWhyId === route.id;

                return (
                  <div
                    key={route.id}
                    onClick={() => handleSelectRoute(route, idx)}
                    className={`p-4 rounded-2xl border transition-all duration-200 cursor-pointer ${
                      isSelected
                        ? 'bg-blue-50/90 border-blue-500 shadow-xl shadow-blue-500/10 ring-2 ring-blue-500/30'
                        : 'bg-white border-blue-200 hover:border-blue-400 shadow-sm'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <div className="flex items-center gap-2">
                          <span
                            className={`text-[10px] font-mono uppercase font-bold px-2 py-0.5 rounded-full ${
                              idx === 0
                                ? 'bg-blue-100 text-blue-900 border border-blue-300'
                                : idx === 1
                                ? 'bg-emerald-100 text-emerald-900 border border-emerald-300'
                                : idx === 2
                                ? 'bg-purple-100 text-purple-900 border border-purple-300'
                                : 'bg-cyan-100 text-cyan-900 border border-cyan-300'
                            }`}
                          >
                            {route.badge}
                          </span>
                          {isSelected && <CheckCircle2 className="w-4 h-4 text-blue-600" />}
                        </div>
                        <h4 className="text-sm font-bold text-blue-950 font-display mt-1">{route.name}</h4>
                      </div>

                      <div className="text-right">
                        <div className="text-lg font-black font-mono text-blue-950">{route.etaMin} min</div>
                        <div className="text-[11px] text-blue-700 font-medium">{route.distanceKm} km</div>
                      </div>
                    </div>

                    {/* Places Covered Along Corridor Strip */}
                    {route.majorPlaces && route.majorPlaces.length > 0 && (
                      <div className="mt-2.5 p-2 rounded-xl bg-blue-50/70 border border-blue-200/80">
                        <div className="flex items-center justify-between text-[10px] font-mono uppercase font-bold text-blue-900 mb-1">
                          <span className="flex items-center gap-1 text-blue-700 font-bold">
                            <MapPin className="w-3 h-3 text-blue-600 shrink-0" />
                            Places Covered ({route.majorPlaces.length} Points)
                          </span>
                          <span className="text-blue-600 font-semibold">{route.distanceKm} km</span>
                        </div>
                        <div className="flex flex-wrap items-center gap-1">
                          {route.majorPlaces.map((place, pIdx) => {
                            const isFirst = pIdx === 0;
                            const isLast = pIdx === route.majorPlaces.length - 1;
                            return (
                              <React.Fragment key={pIdx}>
                                <span
                                  className={`px-1.5 py-0.5 rounded text-[10px] font-semibold ${
                                    isFirst
                                      ? 'bg-emerald-600 text-white font-bold'
                                      : isLast
                                      ? 'bg-rose-600 text-white font-bold'
                                      : 'bg-white text-blue-950 border border-blue-200'
                                  }`}
                                >
                                  {place}
                                </span>
                                {!isLast && (
                                  <span className="text-blue-400 font-bold text-[9px]">➔</span>
                                )}
                              </React.Fragment>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    <div className="grid grid-cols-3 gap-2 mt-3 pt-3 border-t border-blue-100 text-[11px] font-mono">
                      <div>
                        <span className="text-blue-700 block font-medium">Congestion</span>
                        <span className="text-blue-950 font-bold">{route.congestionPct}%</span>
                      </div>
                      <div>
                        <span className="text-blue-700 block font-medium">CO₂ Footprint</span>
                        <span className="text-emerald-700 font-bold">{route.co2Grams} g</span>
                      </div>
                      <div>
                        <span className="text-blue-700 block font-medium">Fuel Saved</span>
                        <span className="text-blue-700 font-bold">{route.fuelSavedPct}%</span>
                      </div>
                    </div>

                    {/* Dynamic Road Pricing & Travel Cost Row */}
                    {(() => {
                      const pricing = getRoutePricing(route, idx);
                      const estimatedFuelCost = Math.round(route.distanceKm * 5.2);
                      const totalCost = estimatedFuelCost + pricing.totalDynamicCharge;

                      return (
                        <div className="mt-2.5 p-2 rounded-xl bg-blue-50/70 border border-blue-200 flex items-center justify-between text-xs">
                          <div className="flex items-center gap-1.5">
                            <Coins className={`w-3.5 h-3.5 ${pricing.totalDynamicCharge > 0 ? 'text-amber-500' : 'text-emerald-600'}`} />
                            <span className="text-blue-800 text-[11px] font-medium">Dynamic ERP:</span>
                            <span className={`font-bold font-mono ${pricing.totalDynamicCharge > 0 ? 'text-amber-600' : 'text-emerald-600'}`}>
                              {pricing.totalDynamicCharge > 0 ? `₹${pricing.totalDynamicCharge}` : '₹0 (Toll-Free)'}
                            </span>
                          </div>
                          <div className="text-[11px] font-mono text-blue-900">
                            Est. Total Trip: <strong className="text-blue-950 font-bold">₹{totalCost}</strong>
                          </div>
                        </div>
                      );
                    })()}

                    <div className="mt-2.5 pt-2 border-t border-blue-100">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setExpandedWhyId(isWhyOpen ? null : route.id);
                        }}
                        className="text-[11px] text-blue-700 hover:text-blue-900 font-medium flex items-center gap-1 cursor-pointer"
                      >
                        <HelpCircle className="w-3.5 h-3.5 text-blue-600" />
                        Why this route recommendation?
                        {isWhyOpen ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                      </button>

                      {isWhyOpen && (
                        <p className="text-xs text-blue-950 mt-2 p-2.5 rounded-lg bg-blue-50/80 border border-blue-200 leading-relaxed font-sans">
                          {route.whyExplanation}
                        </p>
                      )}
                    </div>
                  </div>
                );
              })}

              {/* Active Route Places & Milestones Breakdown Timeline */}
              {activeRoute && activeRoute.milestones && activeRoute.milestones.length > 0 && (
                <div className="p-4 rounded-2xl bg-white border border-blue-200 shadow-md space-y-3 animate-in fade-in">
                  <div className="flex items-center justify-between">
                    <div className="text-xs font-mono uppercase font-bold text-blue-950 flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-blue-600" />
                      Places Along {activeRoute.name}
                    </div>
                    <span className="text-[10px] font-mono font-bold text-blue-600 px-2 py-0.5 rounded-full bg-blue-50 border border-blue-200">
                      {activeRoute.milestones.length} Major Places
                    </span>
                  </div>

                  <div className="relative pl-4 space-y-2.5 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-blue-200">
                    {activeRoute.milestones.map((m, mIdx) => {
                      const isOrigin = m.type === 'origin';
                      const isDest = m.type === 'destination';
                      return (
                        <div
                          key={mIdx}
                          className="relative flex items-center justify-between text-xs cursor-pointer group"
                          onClick={() => {
                            window.dispatchEvent(
                              new CustomEvent('recenter_map', {
                                detail: { lat: m.lat, lng: m.lng },
                              })
                            );
                          }}
                          title="Click to view place on map"
                        >
                          <div
                            className={`absolute -left-[18px] w-2.5 h-2.5 rounded-full border-2 border-white shadow ${
                              isOrigin
                                ? 'bg-emerald-500'
                                : isDest
                                ? 'bg-rose-500'
                                : 'bg-blue-600 group-hover:scale-150 transition-transform'
                            }`}
                          />
                          <div>
                            <span className={`font-bold ${isOrigin ? 'text-emerald-700' : isDest ? 'text-rose-700' : 'text-blue-950 group-hover:text-blue-600'}`}>
                              {m.name}
                            </span>
                            <span className="text-[10px] text-blue-600 block">
                              {isOrigin ? 'Starting Point' : isDest ? 'Destination' : 'Transit Corridor Town'}
                            </span>
                          </div>
                          <div className="text-right font-mono text-[11px]">
                            <span className="text-blue-950 font-bold">{m.distanceKm} km</span>
                            <span className="text-blue-600 block text-[10px]">~{m.etaMin} min</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {!isNavigating ? (
                <button
                  type="button"
                  onClick={handleStartNavigation}
                  className="w-full py-3.5 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-black text-sm shadow-xl shadow-blue-500/25 transition-all flex items-center justify-center gap-2 cursor-pointer mt-2"
                >
                  <Navigation className="w-4 h-4 fill-white" />
                  START ACTIVE NAVIGATION ({activeRoute?.name || 'Primary Route'}) <ArrowRight className="w-4 h-4 text-white" />
                </button>
              ) : (
                <div className="p-4 rounded-2xl bg-gradient-to-br from-blue-50/90 via-white to-sky-50/90 border border-blue-200 space-y-3 animate-in fade-in shadow-md">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="relative flex h-2.5 w-2.5">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-500 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-blue-600"></span>
                      </span>
                      <span className="text-xs font-mono font-bold text-blue-950 uppercase">
                        {navStatus === 'starting' ? '🛰️ Acquiring GPS...' : navStatus === 'recalculating' ? '🔄 Recalculating...' : '🚗 Active Navigation'}
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => setVoiceGuidanceEnabled(!voiceGuidanceEnabled)}
                        className={`p-1.5 rounded-lg border text-xs cursor-pointer transition-colors ${
                          voiceGuidanceEnabled
                            ? 'bg-blue-600 border-blue-600 text-white font-bold'
                            : 'bg-blue-50 border-blue-200 text-blue-700'
                        }`}
                        title={voiceGuidanceEnabled ? 'Voice Guidance ON' : 'Voice Guidance Muted'}
                      >
                        {voiceGuidanceEnabled ? <Volume2 className="w-3.5 h-3.5" /> : <VolumeX className="w-3.5 h-3.5" />}
                      </button>
                      {userLocation?.speed !== undefined && (
                        <span className="text-[11px] font-mono text-blue-950 bg-blue-50 px-2 py-0.5 rounded-lg border border-blue-200 font-bold">
                          {userLocation.speed} km/h
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Dynamic Road Pricing Ahead Alert in Active Nav */}
                  {(() => {
                    if (!activeRoute) return null;
                    const pricing = getRoutePricing(activeRoute, selectedRouteIndex);
                    if (pricing.totalDynamicCharge > 0) {
                      return (
                        <div className="p-3 rounded-xl bg-amber-50 border border-amber-300 text-amber-900 text-xs space-y-1">
                          <div className="flex items-center gap-1.5 font-bold text-amber-800">
                            <Coins className="w-4 h-4 text-amber-600" /> Dynamic Pricing Zone Ahead
                          </div>
                          <p className="text-[11px] text-amber-900/90 leading-relaxed">
                            Approaching monitored corridor: current congestion charge <strong className="text-amber-700 font-bold">₹{pricing.totalDynamicCharge}</strong>. AI dynamic recommendation (no financial deduction).
                          </p>
                        </div>
                      );
                    }
                    return null;
                  })()}

                  <div className="p-3 rounded-xl bg-white border border-blue-100 shadow-sm space-y-1">
                    <div className="text-[11px] text-blue-700 font-medium">Next Maneuver:</div>
                    <div className="text-xs font-bold text-blue-950 leading-snug">
                      {displaySteps[navStepIndex]?.instruction || 'Follow highlighted route'}
                    </div>
                    <div className="flex items-center justify-between pt-2 border-t border-blue-100 text-[11px] font-mono text-blue-700">
                      <span className="font-bold">{displaySteps[navStepIndex]?.distance || '200 m'}</span>
                      <span className="text-blue-600">Step {navStepIndex + 1} of {displaySteps.length}</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2 pt-1">
                    <button
                      type="button"
                      disabled={navStepIndex === 0}
                      onClick={() => setNavStepIndex((prev) => Math.max(0, prev - 1))}
                      className="py-2 px-3 rounded-xl bg-blue-50 border border-blue-200 text-xs text-blue-900 hover:bg-blue-100 disabled:opacity-30 cursor-pointer font-bold"
                    >
                      Prev Step
                    </button>
                    <button
                      type="button"
                      disabled={navStepIndex === displaySteps.length - 1}
                      onClick={() => setNavStepIndex((prev) => Math.min(displaySteps.length - 1, prev + 1))}
                      className="py-2 px-3 rounded-xl bg-blue-600 border border-blue-600 text-xs text-white hover:bg-blue-700 disabled:opacity-30 cursor-pointer font-bold shadow-md shadow-blue-500/25"
                    >
                      Next Step
                    </button>
                  </div>

                  <button
                    type="button"
                    onClick={handleExitNavigation}
                    className="w-full py-2.5 rounded-xl bg-rose-50 hover:bg-rose-100 border border-rose-200 text-rose-700 font-bold text-xs transition-colors cursor-pointer flex items-center justify-center gap-1.5"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    Exit Active Navigation
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Right Map View & Live Navigation HUD */}
        <div className="lg:col-span-7 flex flex-col space-y-4">
          {/* Active Navigation Floating Mobile / Tablet Compact HUD */}
          {isNavigating && displaySteps.length > 0 && (
            <div className="p-4 rounded-2xl bg-white/95 backdrop-blur-md border border-blue-200 shadow-xl space-y-3 animate-in fade-in zoom-in-95">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="relative flex h-3 w-3">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-500 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-3 w-3 bg-blue-600"></span>
                  </span>
                  <span className="text-xs uppercase font-mono font-bold text-blue-950">
                    Active Navigation — Destination: {destination.split(',')[0]}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  {userLocation && (
                    <button
                      type="button"
                      onClick={() => {
                        window.dispatchEvent(new CustomEvent('recenter_map', { detail: userLocation }));
                      }}
                      className="px-2.5 py-1 rounded-lg bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200 text-xs font-semibold cursor-pointer"
                    >
                      Recenter
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={handleExitNavigation}
                    className="text-xs px-2.5 py-1 rounded-lg bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200 cursor-pointer font-bold"
                  >
                    Stop Navigation
                  </button>
                </div>
              </div>

              {/* Current Maneuver */}
              <div className="p-3 rounded-xl bg-blue-50/70 border border-blue-200 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-xl bg-blue-600 text-white font-bold">
                    <Navigation className="w-5 h-5 fill-white" />
                  </div>
                  <div>
                    <div className="text-xs text-blue-700 font-medium">Next Maneuver:</div>
                    <div className="text-sm font-bold text-blue-950">
                      {displaySteps[navStepIndex]?.instruction || 'Continue along route'}
                    </div>
                  </div>
                </div>
                <div className="text-right font-mono">
                  <div className="text-base font-black text-blue-700">
                    {displaySteps[navStepIndex]?.distance || '400 m'}
                  </div>
                  <div className="text-[10px] text-blue-600 font-medium">ETA: {activeRoute?.etaMin || 12} min</div>
                </div>
              </div>

              {/* Off-Route Warning Alert */}
              {isOffRoute && (
                <div className="p-3 rounded-xl bg-amber-50 border border-amber-300 text-amber-900 text-xs flex items-center justify-between animate-pulse">
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                    <span>You are off route. Recalculating with Google Routes...</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => calculateRoutes(userLocation ? `${userLocation.lat},${userLocation.lng}` : startPoint, destination, travelMode)}
                    className="px-2 py-1 rounded bg-amber-500 text-white font-bold text-[11px] cursor-pointer shadow"
                  >
                    Recalculate
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Interactive Google Map with Calculated Route Polyline */}
          <div className="flex-1 min-h-[520px] rounded-3xl overflow-hidden border border-blue-200 shadow-xl bg-white">
            <ErrorBoundary
              fallbackTitle="Interactive OpenStreetMap"
              fallbackMessage="OpenStreetMap view is currently loading."
            >
              <SmartCityMap
                trafficData={trafficData}
                busRoutes={busRoutes}
                parkingLocations={parkingLots}
                emergencyActive={simState?.[0]?.emergency_vehicle_active}
                fullHeight={true}
                originName={startPoint}
                destinationName={destination}
                sourcePoint={sourceCoordinates ? { lat: sourceCoordinates.lat, lng: sourceCoordinates.lng, name: startPoint } : undefined}
                destinationPoint={destinationCoordinates ? { lat: destinationCoordinates.lat, lng: destinationCoordinates.lng, name: destination } : undefined}
                intermediateLocations={intermediateLocations}
                selectedRequirement={selectedRequirement}
                directionsResult={googleDirectionsResult}
                routes={routes}
                activeRouteIndex={selectedRouteIndex}
                travelMode={travelMode}
                userLocation={userLocation || undefined}
                isNavigating={isNavigating}
                className="w-full h-full min-h-[520px]"
              />
            </ErrorBoundary>
          </div>
        </div>
      </div>
    </div>
  );
};

export const RoutePlannerPage: React.FC = () => {
  return (
    <ErrorBoundary
      fallbackTitle="Route Planner"
      fallbackMessage="An unexpected issue occurred while initializing the navigation engine."
    >
      <RoutePlannerPageContent />
    </ErrorBoundary>
  );
};
