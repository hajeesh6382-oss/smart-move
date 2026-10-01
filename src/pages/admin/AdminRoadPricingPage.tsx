import React, { useState, useEffect } from 'react';
import { useRealtimeTable } from '../../hooks/useRealtimeTable';
import {
  Coins,
  Shield,
  Sliders,
  Play,
  RotateCcw,
  AlertTriangle,
  Clock,
  Sparkles,
  Layers,
  Save,
  CheckCircle2,
  RefreshCw,
  Activity,
  Flame,
  Radio,
  MapPin,
  Plus,
  Lock,
  Unlock,
  Edit3,
  X,
  Check,
} from 'lucide-react';
import {
  DEFAULT_ZONES,
  RoadPricingLiveRecord,
  RoadPricingZone,
  RoadPricingPrediction,
  updateZoneCongestion,
  setRoadPricingTestMode,
  getRoadPricingTestMode,
  getPricingThresholds,
  updatePricingThresholds,
  PricingThresholdConfig,
  getZonePricingOverrides,
  setZoneFixedPrice,
  getAllZonesWithOverrides,
  addCustomPricingPlace,
  ZonePricingOverride,
} from '../../services/dynamicPricingService';
import { AdminRoadPricingMap } from '../../components/admin/AdminRoadPricingMap';

export const AdminRoadPricingPage: React.FC = () => {
  const { data: rawZones } = useRealtimeTable('road_pricing_zones');
  const { data: rawLive } = useRealtimeTable('road_pricing_live');
  const { data: rawPredictions } = useRealtimeTable('road_pricing_predictions');

  const [isTestMode, setIsTestMode] = useState<boolean>(getRoadPricingTestMode());
  const [selectedZoneId, setSelectedZoneId] = useState<string>('zone_theni_gateway');
  const [manualCongestion, setManualCongestion] = useState<number>(65);
  const [thresholds, setThresholds] = useState<PricingThresholdConfig>(getPricingThresholds());
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saved'>('idle');
  const [activeScenario, setActiveScenario] = useState<string | null>(null);

  // Admin Place-by-Place Price Fixing State
  const [overrides, setOverrides] = useState<Record<string, ZonePricingOverride>>(getZonePricingOverrides());
  const [priceInputs, setPriceInputs] = useState<Record<string, number>>({});
  const [fixSuccessMsg, setFixSuccessMsg] = useState<string | null>(null);
  const [isAddPlaceOpen, setIsAddPlaceOpen] = useState(false);
  const [newPlace, setNewPlace] = useState({
    name: '',
    road: '',
    fixedPrice: 25,
    minCharge: 0,
    maxCharge: 60,
  });

  // Price change audit log in admin session
  const [auditLog, setAuditLog] = useState<Array<{
    timestamp: string;
    zoneName: string;
    prev: number;
    curr: number;
    cong: number;
    reason: string;
  }>>([
    {
      timestamp: new Date().toLocaleTimeString(),
      zoneName: 'Central City Arterial',
      prev: 5,
      curr: 10,
      cong: 64,
      reason: 'Traffic delay increased during peak rush window.',
    },
  ]);

  useEffect(() => {
    const handlePricingEvent = (e: any) => {
      if (e.detail) {
        setAuditLog((prev) => [
          {
            timestamp: new Date().toLocaleTimeString(),
            zoneName: e.detail.zoneName || 'Monitored Zone',
            prev: e.detail.previousCharge ?? 0,
            curr: e.detail.currentCharge ?? 0,
            cong: e.detail.congestionPercentage ?? 0,
            reason: e.detail.reason || 'Telemetry update',
          },
          ...prev.slice(0, 15),
        ]);
      }
    };
    window.addEventListener('smartmove_pricing_updated', handlePricingEvent);
    return () => window.removeEventListener('smartmove_pricing_updated', handlePricingEvent);
  }, []);

  const zones: RoadPricingZone[] = (rawZones && rawZones.length > 0) ? rawZones : getAllZonesWithOverrides();
  const liveRecords: RoadPricingLiveRecord[] = (rawLive && rawLive.length > 0) ? rawLive : [];
  const predictions: RoadPricingPrediction[] = (rawPredictions && rawPredictions.length > 0) ? rawPredictions : [];

  const handleFixPriceForZone = (zone: RoadPricingZone, price: number) => {
    setZoneFixedPrice(zone.id, zone.zone_name, price, 'fixed');
    setOverrides(getZonePricingOverrides());
    setFixSuccessMsg(`ERP Toll price for "${zone.zone_name}" successfully fixed at ₹${price}. Active on live citizen maps!`);
    setTimeout(() => setFixSuccessMsg(null), 4500);
  };

  const handleResetToDynamic = (zone: RoadPricingZone) => {
    setZoneFixedPrice(zone.id, zone.zone_name, 0, 'dynamic');
    setOverrides(getZonePricingOverrides());
    setFixSuccessMsg(`ERP Toll price for "${zone.zone_name}" reset to AI Dynamic calculation.`);
    setTimeout(() => setFixSuccessMsg(null), 4500);
  };

  const handleCreateNewPlace = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPlace.name.trim() || !newPlace.road.trim()) return;

    const newId = `zone_${newPlace.name.toLowerCase().replace(/[^a-z0-9]+/g, '_')}_${Date.now().toString().slice(-4)}`;
    const zone: RoadPricingZone = {
      id: newId,
      zone_name: newPlace.name.trim(),
      road_name: newPlace.road.trim(),
      geometry: [
        { lat: 10.005 + (Math.random() - 0.5) * 0.05, lng: 77.48 + (Math.random() - 0.5) * 0.05 },
        { lat: 10.015 + (Math.random() - 0.5) * 0.05, lng: 77.49 + (Math.random() - 0.5) * 0.05 },
        { lat: 10.01 + (Math.random() - 0.5) * 0.05, lng: 77.50 + (Math.random() - 0.5) * 0.05 },
        { lat: 10.0 + (Math.random() - 0.5) * 0.05, lng: 77.485 + (Math.random() - 0.5) * 0.05 },
      ],
      min_charge: newPlace.minCharge || 0,
      max_charge: newPlace.maxCharge || 60,
      peak_multiplier: 1.25,
      offpeak_multiplier: 0.8,
      status: 'active',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    addCustomPricingPlace(zone, Number(newPlace.fixedPrice));
    setOverrides(getZonePricingOverrides());
    setIsAddPlaceOpen(false);
    setNewPlace({ name: '', road: '', fixedPrice: 25, minCharge: 0, maxCharge: 60 });
    setFixSuccessMsg(`New ERP Toll Gantry "${zone.zone_name}" added and price fixed at ₹${newPlace.fixedPrice}!`);
    setTimeout(() => setFixSuccessMsg(null), 4500);
  };

  const handleToggleTestMode = (enabled: boolean) => {
    setIsTestMode(enabled);
    setRoadPricingTestMode(enabled);
  };

  // Scenario 1: 5:00 PM
  const triggerScenario500PM = () => {
    setActiveScenario('5:00 PM');
    if (!isTestMode) handleToggleTestMode(true);
    updateZoneCongestion(
      selectedZoneId,
      45,
      'TEST DATA',
      'Test Scenario 5:00 PM: Fluid evening traffic baseline.'
    );
  };

  // Scenario 2: 5:05 PM
  const triggerScenario505PM = () => {
    setActiveScenario('5:05 PM');
    if (!isTestMode) handleToggleTestMode(true);
    updateZoneCongestion(
      selectedZoneId,
      67,
      'TEST DATA',
      'Test Scenario 5:05 PM: Moderate rush build-up. Speed dropped to 32 km/h.'
    );
  };

  // Scenario 3: 5:10 PM
  const triggerScenario510PM = () => {
    setActiveScenario('5:10 PM');
    if (!isTestMode) handleToggleTestMode(true);
    updateZoneCongestion(
      selectedZoneId,
      82,
      'TEST DATA',
      'Test Scenario 5:10 PM: Severe congestion bottleneck detected. AI predicts 89% 30-min peak.'
    );
  };

  // Scenario 4: Emergency Override
  const triggerEmergencyOverride = () => {
    setActiveScenario('Emergency');
    if (!isTestMode) handleToggleTestMode(true);
    updateZoneCongestion(
      selectedZoneId,
      95,
      'TEST DATA',
      '🚑 EMERGENCY OVERRIDE: Corridor cleared for active ambulance dispatch. Toll suspended.'
    );
  };

  const handleApplyManualSlider = () => {
    if (!isTestMode) handleToggleTestMode(true);
    updateZoneCongestion(
      selectedZoneId,
      manualCongestion,
      'TEST DATA',
      `Manual test injection: Congestion set to ${manualCongestion}%.`
    );
  };

  const handleSaveThresholds = () => {
    updatePricingThresholds(thresholds);
    setSaveStatus('saved');
    setTimeout(() => setSaveStatus('idle'), 2500);
  };

  const currentZoneLive = liveRecords.find((r) => r.zone_id === selectedZoneId);

  return (
    <div className="space-y-6 pb-12 animate-in fade-in">
      {/* Top Admin Header */}
      <div className="glass-panel p-6 rounded-3xl border border-slate-800 bg-gradient-to-r from-slate-950 via-slate-900 to-[#0d1624] relative shadow-2xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-2xl bg-amber-500/20 text-amber-300 border border-amber-500/30">
                <Coins className="w-6 h-6 text-amber-400" />
              </div>
              <div>
                <h1 className="text-2xl font-black font-display text-white tracking-tight flex items-center gap-3">
                  Dynamic Road Pricing Command Center
                  {isTestMode ? (
                    <span className="px-3 py-0.5 rounded-full text-xs font-mono font-bold bg-rose-500/20 text-rose-300 border border-rose-500/40 animate-pulse">
                      🔴 TEST MODE ACTIVE
                    </span>
                  ) : (
                    <span className="px-3 py-0.5 rounded-full text-xs font-mono font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                      🟢 LIVE MODE ACTIVE
                    </span>
                  )}
                </h1>
                <p className="text-xs text-slate-400 font-sans">
                  Deterministic pricing algorithms, threshold governance, real-time pipeline simulator, and audit streaming.
                </p>
              </div>
            </div>
          </div>

          {/* Mode Switcher */}
          <div className="flex items-center gap-2 p-1.5 rounded-2xl bg-slate-950 border border-slate-800">
            <button
              type="button"
              onClick={() => handleToggleTestMode(false)}
              className={`px-3 py-1.5 rounded-xl text-xs font-mono font-bold transition-all cursor-pointer ${
                !isTestMode
                  ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/30'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              🟢 LIVE MODE
            </button>
            <button
              type="button"
              onClick={() => handleToggleTestMode(true)}
              className={`px-3 py-1.5 rounded-xl text-xs font-mono font-bold transition-all cursor-pointer ${
                isTestMode
                  ? 'bg-rose-500 text-white shadow-md shadow-rose-500/30'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              🔴 TEST MODE
            </button>
          </div>
        </div>
      </div>

      {/* ADMIN EXCLUSIVE: Place-by-Place ERP Price Fixer & Authority Controls */}
      <div className="glass-panel p-6 rounded-3xl border-2 border-amber-500/40 bg-gradient-to-br from-slate-950 via-slate-900 to-[#131b2e] shadow-2xl space-y-5 text-white">
        <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-amber-500/20 text-amber-300 border border-amber-500/40 flex items-center justify-center shadow-inner">
              <Coins className="w-6 h-6 text-amber-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-mono uppercase font-bold text-amber-400 tracking-wider">
                  Transport Authority Rights
                </span>
                <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 font-mono text-[10px] font-bold border border-amber-500/30">
                  PLACE-BY-PLACE PRICING
                </span>
              </div>
              <h2 className="text-xl sm:text-2xl font-black font-display text-white mt-0.5">
                Place-by-Place ERP Price Fixer & Corridor Governance
              </h2>
              <p className="text-xs text-slate-300 max-w-2xl mt-1">
                Admin has full statutory rights to fix the ERP toll price for any specific place or corridor, or toggle between AI Dynamic prediction and Enforced Fixed Rates.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setIsAddPlaceOpen(true)}
            className="px-4 py-2.5 rounded-2xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shadow-lg shadow-amber-500/20 flex items-center gap-1.5 transition-all cursor-pointer transform hover:-translate-y-0.5"
          >
            <Plus className="w-4 h-4" />
            <span>Add New Toll Gantry / Place</span>
          </button>
        </div>

        {/* Success Notice Banner */}
        {fixSuccessMsg && (
          <div className="p-3.5 rounded-2xl bg-emerald-950/70 border border-emerald-500/50 text-emerald-300 text-xs font-semibold flex items-center gap-2.5 animate-in fade-in">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{fixSuccessMsg}</span>
          </div>
        )}

        {/* FEATURE: Interactive Geographical Map to Fix ERP Price on Corridors */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-mono uppercase tracking-wider text-amber-300 font-bold flex items-center gap-2">
              <MapPin className="w-4 h-4 text-amber-400" />
              <span>Interactive ERP Road Pricing Map — Click Gantry to Fix Price</span>
            </h3>
            <span className="text-[11px] font-mono text-slate-400">
              Live updates propagate instantly to Citizen Route Planners
            </span>
          </div>
          <AdminRoadPricingMap
            zones={zones}
            overrides={overrides}
            liveRecords={liveRecords}
            onFixPrice={handleFixPriceForZone}
            onResetDynamic={handleResetToDynamic}
            onCreatePlaceAtCoords={(lat, lng) => {
              setNewPlace((prev) => ({
                ...prev,
                name: prev.name || `Toll Station (${lat.toFixed(3)}, ${lng.toFixed(3)})`,
                road: prev.road || 'Expressway Corridor',
              }));
              setIsAddPlaceOpen(true);
            }}
          />
        </div>

        {/* Zones / Places Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {zones.map((zone) => {
            const override = overrides[zone.id];
            const isFixed = override && override.pricingMode === 'fixed';
            const live = liveRecords.find((r) => r.zone_id === zone.id);
            const currentCharge = isFixed ? override.fixedRate : (live ? live.current_charge : 15);
            const inputVal = priceInputs[zone.id] !== undefined ? priceInputs[zone.id] : currentCharge;

            return (
              <div
                key={zone.id}
                className={`p-5 rounded-3xl border transition-all space-y-4 ${
                  isFixed
                    ? 'bg-amber-950/20 border-amber-500/50 shadow-lg shadow-amber-500/5'
                    : 'bg-slate-900/60 border-slate-800 hover:border-slate-700'
                }`}
              >
                {/* Zone Header */}
                <div className="flex items-start justify-between gap-3">
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-amber-400 shrink-0" />
                      <h3 className="font-bold text-white text-sm font-display">{zone.zone_name}</h3>
                    </div>
                    <div className="text-xs text-slate-400 font-mono pl-6">{zone.road_name}</div>
                  </div>

                  {/* Mode Badge */}
                  <span
                    className={`px-2.5 py-1 rounded-full text-[10px] font-mono font-bold uppercase border shrink-0 flex items-center gap-1 ${
                      isFixed
                        ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                        : 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                    }`}
                  >
                    {isFixed ? <Lock className="w-3 h-3 text-amber-400" /> : <Sparkles className="w-3 h-3 text-emerald-400" />}
                    <span>{isFixed ? `Fixed: ₹${override.fixedRate}` : `AI Rate: ₹${currentCharge}`}</span>
                  </span>
                </div>

                {/* Price Setting Box */}
                <div className="p-3.5 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-3">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-400 font-mono text-[11px] uppercase font-bold">
                      Set Fixed Price to Enforce:
                    </span>
                    <span className="text-2xl font-black font-mono text-amber-400">₹{inputVal}</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <div className="relative flex-1">
                      <span className="absolute left-3 top-2 text-slate-500 text-xs font-mono">₹</span>
                      <input
                        type="number"
                        min="0"
                        max="250"
                        value={inputVal}
                        onChange={(e) =>
                          setPriceInputs({
                            ...priceInputs,
                            [zone.id]: Math.max(0, parseInt(e.target.value, 10) || 0),
                          })
                        }
                        className="w-full bg-slate-900 border border-slate-700 focus:border-amber-400 rounded-xl pl-7 pr-3 py-1.5 text-xs text-white font-mono font-bold focus:outline-none"
                      />
                    </div>

                    <button
                      type="button"
                      onClick={() => handleFixPriceForZone(zone, inputVal)}
                      className="px-3 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shadow-md shadow-amber-500/20 transition-all cursor-pointer flex items-center gap-1 shrink-0"
                      title="Save and fix this price in place"
                    >
                      <Lock className="w-3.5 h-3.5" />
                      <span>Fix Price</span>
                    </button>

                    {isFixed && (
                      <button
                        type="button"
                        onClick={() => handleResetToDynamic(zone)}
                        className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 text-xs transition-colors cursor-pointer"
                        title="Reset this place to AI Dynamic calculation"
                      >
                        <RotateCcw className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>

                  {/* Vehicle Rates Breakdown Pill */}
                  <div className="pt-2 border-t border-slate-800/80 grid grid-cols-4 gap-1 text-center font-mono text-[10px]">
                    <div className="bg-slate-900 p-1.5 rounded-lg border border-slate-800">
                      <span className="text-slate-400 block">Cars</span>
                      <strong className="text-white font-bold">₹{inputVal}</strong>
                    </div>
                    <div className="bg-slate-900 p-1.5 rounded-lg border border-slate-800">
                      <span className="text-slate-400 block">Cabs</span>
                      <strong className="text-cyan-300 font-bold">₹{Math.round(inputVal * 1.5)}</strong>
                    </div>
                    <div className="bg-slate-900 p-1.5 rounded-lg border border-slate-800">
                      <span className="text-slate-400 block">Buses</span>
                      <strong className="text-purple-300 font-bold">₹{Math.round(inputVal * 2.5)}</strong>
                    </div>
                    <div className="bg-slate-900 p-1.5 rounded-lg border border-slate-800">
                      <span className="text-slate-400 block">2-Wheeler</span>
                      <strong className="text-emerald-300 font-bold">₹{Math.round(inputVal * 0.4)}</strong>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* MODAL: Add New ERP Toll Gantry / Place */}
      {isAddPlaceOpen && (
        <div className="fixed inset-0 bg-slate-950/85 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <form
            onSubmit={handleCreateNewPlace}
            className="bg-slate-900 border border-amber-500/40 rounded-3xl p-6 max-w-lg w-full space-y-4 shadow-2xl animate-in zoom-in-95 text-white"
          >
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <MapPin className="w-5 h-5 text-amber-400" />
                <h3 className="font-bold text-white text-base font-display">
                  Add New ERP Road Pricing Gantry / Place
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsAddPlaceOpen(false)}
                className="text-slate-400 hover:text-white p-1 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Gantry / Place Name</label>
                <input
                  type="text"
                  placeholder="e.g. Theni North Junction Gantry, Kodaikanal Ghat Toll"
                  value={newPlace.name}
                  onChange={(e) => setNewPlace({ ...newPlace, name: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-700 focus:border-amber-400 rounded-xl px-3.5 py-2 text-white focus:outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Road / Highway Corridor</label>
                <input
                  type="text"
                  placeholder="e.g. NH-85 Expressway Km 12.4"
                  value={newPlace.road}
                  onChange={(e) => setNewPlace({ ...newPlace, road: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-700 focus:border-amber-400 rounded-xl px-3.5 py-2 text-white focus:outline-none"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Initial Fixed Price (₹)</label>
                  <input
                    type="number"
                    min="0"
                    max="300"
                    value={newPlace.fixedPrice}
                    onChange={(e) => setNewPlace({ ...newPlace, fixedPrice: parseInt(e.target.value, 10) || 0 })}
                    className="w-full bg-slate-950 border border-slate-700 focus:border-amber-400 rounded-xl px-3.5 py-2 text-white focus:outline-none font-mono"
                    required
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Max Toll Cap (₹)</label>
                  <input
                    type="number"
                    min="10"
                    max="500"
                    value={newPlace.maxCharge}
                    onChange={(e) => setNewPlace({ ...newPlace, maxCharge: parseInt(e.target.value, 10) || 60 })}
                    className="w-full bg-slate-950 border border-slate-700 focus:border-amber-400 rounded-xl px-3.5 py-2 text-white focus:outline-none font-mono"
                    required
                  />
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setIsAddPlaceOpen(false)}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold shadow-md shadow-amber-500/20 cursor-pointer"
              >
                Create & Fix Place Price
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Real-Time Interactive Test Scenarios Runner */}
      <div className="glass-panel p-5 rounded-3xl border border-rose-500/30 bg-slate-950/80 shadow-xl space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-rose-500/20 text-rose-300 border border-rose-500/30">
              <Play className="w-4 h-4 text-rose-400" />
            </div>
            <span className="text-xs uppercase font-mono font-bold text-rose-300 tracking-wider">
              Real-Time Verification Test Scenarios (Prompt Spec Section 26)
            </span>
          </div>
          <span className="text-[11px] font-mono text-slate-400">
            Automates the 5:00 → 5:05 → 5:10 PM test sequence
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {/* Scenario 1: 5:00 PM */}
          <button
            type="button"
            onClick={triggerScenario500PM}
            className={`p-4 rounded-2xl border text-left transition-all cursor-pointer ${
              activeScenario === '5:00 PM'
                ? 'bg-cyan-950/40 border-cyan-500/60 ring-1 ring-cyan-500/40'
                : 'bg-slate-900/60 border-slate-800 hover:border-slate-700'
            }`}
          >
            <div className="text-[10px] font-mono font-bold uppercase text-cyan-400 flex items-center justify-between">
              <span>Step 1 • 5:00 PM</span>
              <Clock className="w-3.5 h-3.5" />
            </div>
            <div className="text-base font-bold text-white mt-1">Traffic: 45%</div>
            <div className="text-xs text-amber-300 font-mono font-bold mt-0.5">Calculated: ₹5</div>
            <div className="text-[11px] text-slate-400 mt-1">Moderate fluid evening baseline.</div>
          </button>

          {/* Scenario 2: 5:05 PM */}
          <button
            type="button"
            onClick={triggerScenario505PM}
            className={`p-4 rounded-2xl border text-left transition-all cursor-pointer ${
              activeScenario === '5:05 PM'
                ? 'bg-amber-950/40 border-amber-500/60 ring-1 ring-amber-500/40'
                : 'bg-slate-900/60 border-slate-800 hover:border-slate-700'
            }`}
          >
            <div className="text-[10px] font-mono font-bold uppercase text-amber-400 flex items-center justify-between">
              <span>Step 2 • 5:05 PM</span>
              <Activity className="w-3.5 h-3.5" />
            </div>
            <div className="text-base font-bold text-white mt-1">Traffic: 67%</div>
            <div className="text-xs text-amber-300 font-mono font-bold mt-0.5">Calculated: ₹10</div>
            <div className="text-[11px] text-slate-400 mt-1">Telemetry update triggers recalculation.</div>
          </button>

          {/* Scenario 3: 5:10 PM */}
          <button
            type="button"
            onClick={triggerScenario510PM}
            className={`p-4 rounded-2xl border text-left transition-all cursor-pointer ${
              activeScenario === '5:10 PM'
                ? 'bg-purple-950/40 border-purple-500/60 ring-1 ring-purple-500/40'
                : 'bg-slate-900/60 border-slate-800 hover:border-slate-700'
            }`}
          >
            <div className="text-[10px] font-mono font-bold uppercase text-purple-400 flex items-center justify-between">
              <span>Step 3 • 5:10 PM</span>
              <Sparkles className="w-3.5 h-3.5" />
            </div>
            <div className="text-base font-bold text-white mt-1">Traffic: 82%</div>
            <div className="text-xs text-amber-300 font-mono font-bold mt-0.5">Calculated: ₹20 (Pred: 89%)</div>
            <div className="text-[11px] text-slate-400 mt-1">Surges to ₹20; Route Planner alerts users.</div>
          </button>

          {/* Scenario 4: Emergency Suspension */}
          <button
            type="button"
            onClick={triggerEmergencyOverride}
            className={`p-4 rounded-2xl border text-left transition-all cursor-pointer ${
              activeScenario === 'Emergency'
                ? 'bg-rose-950/40 border-rose-500/60 ring-1 ring-rose-500/40'
                : 'bg-slate-900/60 border-slate-800 hover:border-slate-700'
            }`}
          >
            <div className="text-[10px] font-mono font-bold uppercase text-rose-400 flex items-center justify-between">
              <span>Emergency Mode</span>
              <AlertTriangle className="w-3.5 h-3.5" />
            </div>
            <div className="text-base font-bold text-white mt-1">Corridor Clearance</div>
            <div className="text-xs text-cyan-300 font-mono font-bold mt-0.5">Toll: ₹0 (Suspended)</div>
            <div className="text-[11px] text-slate-400 mt-1">Emergency vehicles priority corridor.</div>
          </button>
        </div>

        {/* Manual Traffic Injection Slider */}
        <div className="p-4 rounded-2xl bg-slate-900/50 border border-slate-800/80 space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <span className="text-xs font-mono font-bold uppercase text-slate-300 flex items-center gap-2">
              <Sliders className="w-4 h-4 text-cyan-400" />
              Manual Congestion Injection for Monitored Zone:
            </span>
            <select
              value={selectedZoneId}
              onChange={(e) => setSelectedZoneId(e.target.value)}
              className="bg-slate-950 border border-slate-700 text-xs text-white rounded-xl px-3 py-1 font-mono cursor-pointer"
            >
              {zones.map((z) => (
                <option key={z.id} value={z.id}>
                  {z.zone_name} ({z.road_name})
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-4">
            <input
              type="range"
              min="0"
              max="100"
              value={manualCongestion}
              onChange={(e) => setManualCongestion(Number(e.target.value))}
              className="flex-1 accent-cyan-400 cursor-pointer"
            />
            <span className="text-base font-mono font-bold text-cyan-300 w-12 text-right">
              {manualCongestion}%
            </span>
            <button
              type="button"
              onClick={handleApplyManualSlider}
              className="px-4 py-1.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-mono font-bold text-xs shadow-md shadow-cyan-500/20 cursor-pointer transition-all"
            >
              Inject Update
            </button>
          </div>
        </div>
      </div>

      {/* Grid: Threshold Governance & Price Audit Stream */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Threshold Configuration Form */}
        <div className="lg:col-span-6 space-y-4">
          <div className="glass-panel p-5 rounded-3xl border border-slate-800 space-y-4 shadow-xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <Shield className="w-4 h-4 text-amber-400" />
                <h3 className="text-sm font-bold text-white font-display uppercase tracking-wider">
                  Pricing Threshold & Rate Governance
                </h3>
              </div>
              <button
                type="button"
                onClick={handleSaveThresholds}
                className="px-3.5 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer"
              >
                {saveStatus === 'saved' ? <CheckCircle2 className="w-3.5 h-3.5" /> : <Save className="w-3.5 h-3.5" />}
                {saveStatus === 'saved' ? 'Saved' : 'Save Rules'}
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3.5 text-xs">
              <div className="space-y-1">
                <label className="text-[11px] font-mono text-slate-400">Low Tier Max (%)</label>
                <input
                  type="number"
                  value={thresholds.lowMax}
                  onChange={(e) => setThresholds({ ...thresholds, lowMax: Number(e.target.value) })}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-1.5 font-mono text-white"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-mono text-slate-400">Low Base Charge (₹)</label>
                <input
                  type="number"
                  value={thresholds.baseLowRate}
                  onChange={(e) => setThresholds({ ...thresholds, baseLowRate: Number(e.target.value) })}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-1.5 font-mono text-white"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-mono text-slate-400">Moderate Tier Max (%)</label>
                <input
                  type="number"
                  value={thresholds.moderateMax}
                  onChange={(e) => setThresholds({ ...thresholds, moderateMax: Number(e.target.value) })}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-1.5 font-mono text-white"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-mono text-slate-400">Moderate Base Charge (₹)</label>
                <input
                  type="number"
                  value={thresholds.baseModerateRate}
                  onChange={(e) => setThresholds({ ...thresholds, baseModerateRate: Number(e.target.value) })}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-1.5 font-mono text-white"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-mono text-slate-400">High Tier Max (%)</label>
                <input
                  type="number"
                  value={thresholds.highMax}
                  onChange={(e) => setThresholds({ ...thresholds, highMax: Number(e.target.value) })}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-1.5 font-mono text-white"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-mono text-slate-400">High Base Charge (₹)</label>
                <input
                  type="number"
                  value={thresholds.baseHighRate}
                  onChange={(e) => setThresholds({ ...thresholds, baseHighRate: Number(e.target.value) })}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-1.5 font-mono text-white"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-mono text-slate-400">Very High Tier Max (%)</label>
                <input
                  type="number"
                  value={thresholds.veryHighMax}
                  onChange={(e) => setThresholds({ ...thresholds, veryHighMax: Number(e.target.value) })}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-1.5 font-mono text-white"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-mono text-slate-400">Very High Base Charge (₹)</label>
                <input
                  type="number"
                  value={thresholds.baseVeryHighRate}
                  onChange={(e) => setThresholds({ ...thresholds, baseVeryHighRate: Number(e.target.value) })}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-1.5 font-mono text-white"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-mono text-slate-400">Severe Base Charge (₹)</label>
                <input
                  type="number"
                  value={thresholds.baseSevereRate}
                  onChange={(e) => setThresholds({ ...thresholds, baseSevereRate: Number(e.target.value) })}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-1.5 font-mono text-white"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-mono text-slate-400">Peak Hour Multiplier</label>
                <input
                  type="number"
                  step="0.05"
                  value={thresholds.peakMultiplier}
                  onChange={(e) => setThresholds({ ...thresholds, peakMultiplier: Number(e.target.value) })}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-1.5 font-mono text-white"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Right: Live Price Change Audit Stream */}
        <div className="lg:col-span-6 space-y-4">
          <div className="glass-panel p-5 rounded-3xl border border-slate-800 space-y-4 shadow-xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <Radio className="w-4 h-4 text-cyan-400 animate-pulse" />
                <h3 className="text-sm font-bold text-white font-display uppercase tracking-wider">
                  Real-Time Price Audit Stream
                </h3>
              </div>
              <span className="text-[10px] font-mono text-slate-400">
                Live Event Subscriber
              </span>
            </div>

            <div className="space-y-2.5 max-h-[380px] overflow-y-auto pr-1">
              {auditLog.map((log, idx) => (
                <div
                  key={idx}
                  className="p-3 rounded-2xl bg-slate-900/50 border border-slate-800/80 text-xs space-y-1"
                >
                  <div className="flex items-center justify-between font-mono">
                    <span className="font-bold text-white">{log.zoneName}</span>
                    <span className="text-[10px] text-slate-500">{log.timestamp}</span>
                  </div>
                  <div className="flex items-center gap-2 text-[11px] font-mono">
                    <span className="text-slate-400">Charge:</span>
                    <span className="line-through text-slate-500">₹{log.prev}</span>
                    <span className="text-amber-400 font-bold">→ ₹{log.curr}</span>
                    <span className="text-slate-500">• Congestion: {log.cong}%</span>
                  </div>
                  <p className="text-[11px] text-slate-300 font-sans leading-snug">
                    {log.reason}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
