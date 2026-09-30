// SMARTMOVE Add Live Incident Modal & Real-Time Simulation Trigger
// Allows users and city operators to report incidents that trigger AI Mobility Brain updates across the entire website

import React, { useState } from 'react';
import { aiMobilityBrain, IncidentType, IncidentSeverity } from '../../lib/ai/mobilityBrain';
import { SALEM_LOCATIONS } from '../../config/map-config';
import {
  AlertTriangle,
  X,
  Sparkles,
  MapPin,
  Flame,
  Activity,
  Car,
  Clock,
  CheckCircle2,
  Zap,
  Siren,
  CloudRain,
  GraduationCap,
} from 'lucide-react';

interface AddIncidentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export const AddIncidentModal: React.FC<AddIncidentModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const [locationName, setLocationName] = useState('Five Roads Junction, Salem');
  const [type, setType] = useState<IncidentType>('accident');
  const [severity, setSeverity] = useState<IncidentSeverity>('high');
  const [title, setTitle] = useState('Major Multi-Vehicle Accident');
  const [description, setDescription] = useState('Two vehicles collided near the main junction. 2 of 3 lanes blocked.');
  const [durationMin, setDurationMin] = useState(45);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const locations = [
    { name: 'Five Roads Junction, Salem', lat: SALEM_LOCATIONS.junctionA.lat, lng: SALEM_LOCATIONS.junctionA.lng },
    { name: 'Four Roads / New Bus Stand Cross', lat: SALEM_LOCATIONS.junctionB.lat, lng: SALEM_LOCATIONS.junctionB.lng },
    { name: 'Old Bus Stand Cross', lat: SALEM_LOCATIONS.junctionC.lat, lng: SALEM_LOCATIONS.junctionC.lng },
    { name: 'Sona Tech Campus Gate', lat: SALEM_LOCATIONS.techCampus.lat, lng: SALEM_LOCATIONS.techCampus.lng },
    { name: 'Salem Railway Junction (SA)', lat: SALEM_LOCATIONS.railwayStation.lat, lng: SALEM_LOCATIONS.railwayStation.lng },
    { name: 'Govt Medical College Hospital Road', lat: SALEM_LOCATIONS.hospital.lat, lng: SALEM_LOCATIONS.hospital.lng },
    { name: 'Salem Central Market Bazaar', lat: SALEM_LOCATIONS.centralMarket.lat, lng: SALEM_LOCATIONS.centralMarket.lng },
  ];

  const presets = [
    {
      label: '🚨 Major Accident (Five Roads)',
      title: 'Major Multi-Vehicle Collision',
      type: 'accident' as IncidentType,
      severity: 'critical' as IncidentSeverity,
      loc: 'Five Roads Junction, Salem',
      desc: '2 lanes blocked. Severe queue buildup propagating toward Tech Corridor.',
    },
    {
      label: '🎓 College Peak Dismissal',
      title: 'NIT & Sona Tech Simultaneous Dispersal',
      type: 'peak_surge' as IncidentType,
      severity: 'high' as IncidentSeverity,
      loc: 'Sona Tech Campus Gate',
      desc: '7,100 students dismissing simultaneously. Bus 102 queue exceeds 140 passengers.',
    },
    {
      label: '🚑 Ambulance 108 Green Wave',
      title: 'Critical Cardiac Ambulance Transit',
      type: 'emergency_corridor' as IncidentType,
      severity: 'high' as IncidentSeverity,
      loc: 'Govt Medical College Hospital Road',
      desc: 'Ambulance 108 en route from Tech Park to Medical College. Emergency signal clearance requested.',
    },
    {
      label: '🌧️ Flash Flooding (Old Bazaar)',
      title: 'Monsoon Waterlogging & Road Blockage',
      type: 'weather_storm' as IncidentType,
      severity: 'high' as IncidentSeverity,
      loc: 'Salem Central Market Bazaar',
      desc: '1.5 ft water accumulation blocking light vehicles. Complete diversion active.',
    },
  ];

  const handleApplyPreset = (p: (typeof presets)[0]) => {
    setTitle(p.title);
    setType(p.type);
    setSeverity(p.severity);
    setLocationName(p.loc);
    setDescription(p.desc);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    const selectedLoc = locations.find((l) => l.name === locationName) || locations[0];

    try {
      aiMobilityBrain.processLiveIncident({
        title,
        location_name: locationName,
        lat: selectedLoc.lat,
        lng: selectedLoc.lng,
        type,
        severity,
        description,
        duration_min: Number(durationMin),
        reported_by: 'Live Operator / Citizen',
      });

      setSuccessMessage('AI Mobility Brain has analyzed the incident and updated all city systems in real-time!');
      setTimeout(() => {
        setIsSubmitting(false);
        setSuccessMessage(null);
        if (onSuccess) onSuccess();
        onClose();
      }, 900);
    } catch (err) {
      console.error(err);
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in">
      <div className="relative w-full max-w-xl glass-panel-glow bg-slate-950/95 border border-slate-700/80 rounded-3xl p-6 sm:p-7 shadow-2xl space-y-5 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-gradient-to-tr from-rose-500 to-amber-500 text-slate-950 font-bold shadow-lg shadow-rose-500/20">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-black font-display text-white">Report Real-Time Mobility Incident</h3>
              <p className="text-xs text-slate-400">Triggers AI Mobility Brain & updates all website pages live</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-xl bg-slate-900 text-slate-400 hover:text-white border border-slate-800 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Quick Simulation Presets */}
        <div>
          <div className="text-[11px] font-mono text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1">
            <Zap className="w-3.5 h-3.5 text-amber-400" /> One-Click Live Scenarios:
          </div>
          <div className="grid grid-cols-2 gap-2">
            {presets.map((p, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => handleApplyPreset(p)}
                className="p-2 rounded-xl text-left bg-slate-900/90 hover:bg-slate-800 border border-slate-800 hover:border-cyan-500/50 text-xs text-slate-200 transition-all cursor-pointer font-medium truncate"
              >
                {p.label}
              </button>
            ))}
          </div>
        </div>

        {/* Incident Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Location */}
            <div>
              <label className="text-[11px] font-mono text-slate-400 block mb-1">Incident Location</label>
              <select
                value={locationName}
                onChange={(e) => setLocationName(e.target.value)}
                className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-400"
              >
                {locations.map((loc) => (
                  <option key={loc.name} value={loc.name}>
                    {loc.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Type */}
            <div>
              <label className="text-[11px] font-mono text-slate-400 block mb-1">Incident Type</label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value as IncidentType)}
                className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-400"
              >
                <option value="accident">Accident / Road Collision</option>
                <option value="congestion">Traffic Congestion Spike</option>
                <option value="road_closure">Road Closure / Blockade</option>
                <option value="emergency_corridor">Emergency Vehicle Transit</option>
                <option value="peak_surge">College/Office Peak Surge</option>
                <option value="weather_storm">Weather / Waterlogging</option>
                <option value="bus_delay">Bus Overload / Delay</option>
                <option value="parking_shortage">Parking Full Alert</option>
                <option value="pedestrian_hazard">Pedestrian Danger Zone</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Severity */}
            <div>
              <label className="text-[11px] font-mono text-slate-400 block mb-1">Severity Level</label>
              <div className="grid grid-cols-4 gap-1">
                {(['low', 'moderate', 'high', 'critical'] as IncidentSeverity[]).map((lvl) => (
                  <button
                    key={lvl}
                    type="button"
                    onClick={() => setSeverity(lvl)}
                    className={`py-1.5 rounded-lg text-[11px] font-bold uppercase font-mono transition-all cursor-pointer ${
                      severity === lvl
                        ? lvl === 'critical'
                          ? 'bg-rose-500 text-white shadow-md shadow-rose-500/30'
                          : lvl === 'high'
                          ? 'bg-amber-500 text-slate-950 font-black'
                          : lvl === 'moderate'
                          ? 'bg-blue-500 text-white'
                          : 'bg-emerald-500 text-slate-950'
                        : 'bg-slate-900 text-slate-400 border border-slate-800'
                    }`}
                  >
                    {lvl}
                  </button>
                ))}
              </div>
            </div>

            {/* Estimated Duration */}
            <div>
              <label className="text-[11px] font-mono text-slate-400 block mb-1">Est. Duration (Minutes)</label>
              <input
                type="number"
                value={durationMin}
                onChange={(e) => setDurationMin(Number(e.target.value))}
                min={5}
                max={240}
                className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-400"
              />
            </div>
          </div>

          {/* Title & Description */}
          <div>
            <label className="text-[11px] font-mono text-slate-400 block mb-1">Incident Headline</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Multi-Vehicle Collision near Junction A"
              className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-400"
              required
            />
          </div>

          <div>
            <label className="text-[11px] font-mono text-slate-400 block mb-1">Description / AI Context</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={2}
              placeholder="Provide details about lanes blocked, crowds, or transit impacts..."
              className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-400 resize-none"
            />
          </div>

          {/* Feedback & Submit Button */}
          {successMessage && (
            <div className="p-3 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>{successMessage}</span>
            </div>
          )}

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-cyan-500 via-blue-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-slate-950 font-black text-sm shadow-xl shadow-cyan-500/25 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
          >
            {isSubmitting ? (
              <>
                <Sparkles className="w-4 h-4 animate-spin text-slate-950" />
                AI Mobility Brain Processing Network Impact...
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 text-slate-950" />
                Broadcast Real-Time Incident & Update System
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};
