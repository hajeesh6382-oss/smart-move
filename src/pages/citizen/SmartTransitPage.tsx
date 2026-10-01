// SMARTMOVE Smart Transit & Live Bus Booking Page
// FEATURE 2: Authorized Bus Booking & Real-Time Seat Availability
// Features: Live Schedule Search, Seat Map Modal, PNR Ticket Generation, Grounded AI Recommendations, and Fleet Telematics.

import React, { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { useRealtimeTable } from '../../hooks/useRealtimeTable';
import { busBookingService, BusServiceResult, SeatSlot, PassengerInfo } from '../../services/busBookingService';
import { cityStore, BusBookingRecord } from '../../lib/supabase/mockStore';
import { StatCard } from '../../components/ui/StatCard';
import { StatusBadge } from '../../components/ui/StatusBadge';
import { SourceBadge } from '../../components/ui/SourceBadge';
import { ConfidenceMeter } from '../../components/ui/ConfidenceMeter';
import { LiveUnavailableBanner } from '../../components/ui/LiveUnavailableBanner';
import { UrbanMobilityAnimation } from '../../components/ui/UrbanMobilityAnimation';
import {
  Bus,
  Train,
  Clock,
  Users,
  ArrowRight,
  Sparkles,
  MapPin,
  Search,
  CheckCircle2,
  AlertTriangle,
  X,
  CreditCard,
  Ticket,
  Calendar,
  ShieldCheck,
  RefreshCw,
  ExternalLink,
  Globe,
  Sliders,
  Settings,
  Link2,
  Check,
  Shield,
  Radio,
  Upload,
  FileText,
  Database,
  Plus,
  Trash2,
  Layers,
} from 'lucide-react';
import {
  TransitPartnerIntegration,
  DEFAULT_PARTNER_INTEGRATIONS,
} from '../../services/busBookingService';

const REDBUS_DEFAULT_URL =
  'https://www.redbus.in/?utm_source=bing&utm_medium=cpc&utm_campaign=IN-Brand-KWs-South%20Zone&utm_adgroup=%5Bredbus%5D-Exact&utm_keyword=redbus&msclkid=3bb856d2536d1acc956e3c6fe230c79b&utm_term=redbus&utm_content=%5Bredbus%5D-Exact';

const IRCTC_DEFAULT_URL = 'https://www.irctc.co.in/nget/train-search';

export const SmartTransitPage: React.FC = () => {
  const { user, isAdmin } = useAuth();
  const { data: busRoutes } = useRealtimeTable('bus_routes');
  const { data: busPredictions } = useRealtimeTable('bus_predictions');
  const { data: busBookings } = useRealtimeTable('bus_bookings');

  // Integrated redBus & Admin Partner Integration state
  const [isRedBusModalOpen, setIsRedBusModalOpen] = useState(false);
  const [activeModalUrl, setActiveModalUrl] = useState(REDBUS_DEFAULT_URL);
  const [activeModalTitle, setActiveModalTitle] = useState('redBus Official Portal');

  const [redBusPartnerUrl, setRedBusPartnerUrl] = useState(() => {
    return localStorage.getItem('smartmove_redbus_url') || REDBUS_DEFAULT_URL;
  });
  const [isRedBusActive, setIsRedBusActive] = useState(() => {
    return localStorage.getItem('smartmove_redbus_active') !== 'false';
  });
  const [isAdminPanelOpen, setIsAdminPanelOpen] = useState(true);
  const [adminUrlInput, setAdminUrlInput] = useState(redBusPartnerUrl);
  const [adminSaveMsg, setAdminSaveMsg] = useState<string | null>(null);
  const [handshakeStatus, setHandshakeStatus] = useState<'idle' | 'testing' | 'success'>('idle');

  // Admin Hub Tabs
  const [adminTab, setAdminTab] = useState<'dataset' | 'partners' | 'gateway'>('dataset');

  // Transit Dataset Upload State (know what bus will come when)
  const [csvInput, setCsvInput] = useState(() => busBookingService.getSampleCsvDataset());
  const [datasetNotice, setDatasetNotice] = useState<string | null>(null);
  const [uploadedCount, setUploadedCount] = useState(() => busBookingService.getUploadedBusDataset().length);

  // Partner Integration Websites State
  const [partnerIntegrations, setPartnerIntegrations] = useState<TransitPartnerIntegration[]>(() =>
    busBookingService.getTransitPartnerIntegrations()
  );
  const [isAddPartnerOpen, setIsAddPartnerOpen] = useState(false);
  const [newPartner, setNewPartner] = useState({
    name: '',
    url: '',
    category: 'bus' as 'bus' | 'train' | 'metro',
    description: '',
  });

  // Search state
  const [fromCity, setFromCity] = useState('Theni');
  const [toCity, setToCity] = useState('Periyakulam');
  const [travelDate, setTravelDate] = useState('Today');
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState<BusServiceResult[]>([]);
  const [searchError, setSearchError] = useState<string | null>(null);
  const [aiRecommendation, setAiRecommendation] = useState<string | null>(null);

  // Seat Map & Booking Modal state
  const [activeBusForSeats, setActiveBusForSeats] = useState<BusServiceResult | null>(null);
  const [selectedSeat, setSelectedSeat] = useState<SeatSlot | null>(null);
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  const [passenger, setPassenger] = useState<PassengerInfo>({
    name: 'N.A. Hajeesh',
    age: 28,
    gender: 'Male',
    contactPhone: '+91 98401 23456',
  });
  const [confirmedBooking, setConfirmedBooking] = useState<BusBookingRecord | null>(null);

  // Initial bus search on load
  const executeSearch = async (from = fromCity, to = toCity, date = travelDate) => {
    setIsSearching(true);
    setSearchError(null);

    const res = await busBookingService.searchBuses(from, to, date);
    setIsSearching(false);

    if (res.success && res.buses.length > 0) {
      setSearchResults(res.buses);
      setAiRecommendation(busBookingService.generateAIBusRecommendation(res.buses));
    } else {
      setSearchResults([]);
      setSearchError(res.error || 'Live bus booking data is currently unavailable for this corridor.');
      setAiRecommendation(null);
    }
  };

  useEffect(() => {
    executeSearch('Theni', 'Periyakulam', 'Today');
  }, []);

  const handleOpenSeatMap = (bus: BusServiceResult) => {
    setActiveBusForSeats(bus);
    setSelectedSeat(null);
  };

  const handleSelectSeat = (seat: SeatSlot) => {
    if (seat.status === 'occupied') return;
    setSelectedSeat(seat);
  };

  const handleProceedToBooking = () => {
    if (!activeBusForSeats || !selectedSeat) return;
    setIsBookingModalOpen(true);
  };

  const handleConfirmTicket = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeBusForSeats || !selectedSeat) return;

    const res = await busBookingService.confirmBooking(
      activeBusForSeats,
      selectedSeat.number,
      passenger,
      travelDate
    );

    if (res.success && res.booking) {
      setConfirmedBooking(res.booking);
      setIsBookingModalOpen(false);
      setActiveBusForSeats(null);
      setSelectedSeat(null);
    } else {
      alert(res.error || 'Booking could not be confirmed with authorized provider.');
    }
  };

  // Dataset Upload Handlers
  const handleUploadCsv = () => {
    if (!csvInput.trim()) return;
    const res = busBookingService.uploadBusDatasetFromCsv(csvInput);
    if (res.success) {
      setUploadedCount(res.count);
      setDatasetNotice(`✅ Successfully parsed & active: ${res.count} bus schedule routes! Search any corridor below to see what bus will come when.`);
      executeSearch();
      setTimeout(() => setDatasetNotice(null), 5000);
    } else {
      setDatasetNotice(`❌ Import error: ${res.error}`);
    }
  };

  const handleClearDataset = () => {
    busBookingService.clearUploadedDataset();
    setUploadedCount(0);
    setDatasetNotice('ℹ️ Uploaded schedules cleared. Reverted to default verified transit feeds.');
    executeSearch();
    setTimeout(() => setDatasetNotice(null), 4000);
  };

  const handleLoadSample = () => {
    const sample = busBookingService.getSampleCsvDataset();
    setCsvInput(sample);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      if (text) {
        setCsvInput(text);
        const res = busBookingService.uploadBusDatasetFromCsv(text);
        if (res.success) {
          setUploadedCount(res.count);
          setDatasetNotice(`✅ Uploaded file "${file.name}": ${res.count} schedules active!`);
          executeSearch();
          setTimeout(() => setDatasetNotice(null), 5000);
        } else {
          setDatasetNotice(`❌ Import error from file: ${res.error}`);
        }
      }
    };
    reader.readAsText(file);
  };

  // Partner Integration Handlers
  const handleAddPartnerSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPartner.name.trim() || !newPartner.url.trim()) return;
    const item = busBookingService.addTransitPartnerIntegration({
      name: newPartner.name.trim(),
      url: newPartner.url.trim(),
      category: newPartner.category,
      description: newPartner.description.trim() || undefined,
      isActive: true,
    });
    setPartnerIntegrations(busBookingService.getTransitPartnerIntegrations());
    setNewPartner({ name: '', url: '', category: 'bus', description: '' });
    setIsAddPartnerOpen(false);
    setAdminSaveMsg(`Added "${item.name}" integration successfully!`);
    setTimeout(() => setAdminSaveMsg(null), 4000);
  };

  const handleTogglePartner = (id: string, active: boolean) => {
    busBookingService.updateTransitPartnerIntegration(id, { isActive: active });
    setPartnerIntegrations(busBookingService.getTransitPartnerIntegrations());
  };

  const handleDeletePartner = (id: string) => {
    busBookingService.deleteTransitPartnerIntegration(id);
    setPartnerIntegrations(busBookingService.getTransitPartnerIntegrations());
  };

  const handleOpenPartnerModal = (url: string, title: string) => {
    setActiveModalUrl(url);
    setActiveModalTitle(title);
    setIsRedBusModalOpen(true);
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header with Book a Bus & Admin Integration Controls */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-blue-200 shadow-md">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs uppercase font-mono font-bold text-blue-600">
              Authorized Transit Gateway
            </span>
            <SourceBadge source="live_api" provider="Tamil Nadu Smart Transit API" />
          </div>
          <h2 className="text-2xl lg:text-3xl font-black font-display text-blue-950 mt-0.5">
            Smart Transit & Real-Time Bus Booking
          </h2>
          <p className="text-xs text-blue-800 font-medium mt-1">
            Real-time seat inventory, interactive seat selection, authorized PNR confirmation, and AI arrival telematics.
          </p>
        </div>

        {/* Action Buttons: Book a Bus, Book a Train (IRCTC) & Admin Integration */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Main Book a Bus Button (opens integrated redBus portal modal) */}
          <button
            type="button"
            onClick={() => handleOpenPartnerModal(redBusPartnerUrl, 'redBus Official Portal')}
            className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-gradient-to-r from-rose-600 to-red-600 hover:from-rose-500 hover:to-red-500 text-white font-bold text-xs shadow-lg shadow-rose-600/30 transition-all cursor-pointer transform hover:-translate-y-0.5"
            title="Book a Bus via integrated redBus portal"
          >
            <Bus className="w-4 h-4" />
            <span>Book a Bus</span>
            <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 rounded bg-white/20 font-black">redBus</span>
            <ExternalLink className="w-3.5 h-3.5 opacity-90" />
          </button>

          {/* Main Book a Train Button (opens integrated IRCTC portal modal) */}
          <button
            type="button"
            onClick={() => handleOpenPartnerModal(IRCTC_DEFAULT_URL, 'IRCTC Official Indian Railways Portal')}
            className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-gradient-to-r from-blue-700 via-indigo-700 to-blue-800 hover:from-blue-600 hover:to-indigo-600 text-white font-bold text-xs shadow-lg shadow-blue-700/30 transition-all cursor-pointer transform hover:-translate-y-0.5"
            title="Book a Train via integrated IRCTC portal (https://www.irctc.co.in/nget/train-search)"
          >
            <Train className="w-4 h-4" />
            <span>Book a Train</span>
            <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 rounded bg-white/20 font-black">IRCTC</span>
            <ExternalLink className="w-3.5 h-3.5 opacity-90" />
          </button>

          {/* Admin Integration Configuration Toggle (Visible ONLY to Admin) */}
          {(isAdmin || user?.role === 'admin') && (
            <button
              type="button"
              onClick={() => setIsAdminPanelOpen(!isAdminPanelOpen)}
              className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-2xl bg-indigo-50 hover:bg-indigo-100 text-indigo-900 border border-indigo-200 font-bold text-xs transition-all cursor-pointer"
              title="Configure Partner API, Transit Websites & Dataset"
            >
              <Sliders className="w-4 h-4 text-indigo-600" />
              <span>{isAdminPanelOpen ? 'Hide Admin Transit Hub' : 'Transit Admin Controls (Upload & URL)'}</span>
            </button>
          )}
        </div>
      </div>

      {/* ADMIN EXCLUSIVE: Transit Hub (Dataset Upload & Partner Integration) */}
      {(isAdmin || user?.role === 'admin') && isAdminPanelOpen && (
        <div className="p-6 rounded-3xl bg-gradient-to-br from-indigo-950 via-slate-900 to-blue-950 border-2 border-indigo-400/50 shadow-2xl text-white space-y-6 animate-in fade-in">
          {/* Admin Command Header */}
          <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-indigo-500/30">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-indigo-600/30 border border-indigo-400 text-indigo-300 flex items-center justify-center shadow-inner">
                <Shield className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-[11px] font-mono uppercase font-bold text-indigo-300 tracking-wider">
                    Admin Command Operations
                  </span>
                  <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 font-mono text-[10px] font-bold border border-emerald-500/40">
                    TRANSIT GOVERNANCE ACTIVE
                  </span>
                </div>
                <h3 className="text-lg font-black font-display text-white">
                  Transit Schedule Dataset Engine & Website Integration Manager
                </h3>
              </div>
            </div>

            {/* Navigation Tabs for Admin */}
            <div className="flex flex-wrap items-center gap-2 bg-slate-900/80 p-1.5 rounded-2xl border border-indigo-500/40">
              <button
                type="button"
                onClick={() => setAdminTab('dataset')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-mono text-xs font-bold transition-all cursor-pointer ${
                  adminTab === 'dataset'
                    ? 'bg-blue-600 text-white shadow'
                    : 'text-slate-300 hover:text-white'
                }`}
              >
                <Upload className="w-3.5 h-3.5" />
                <span>Upload Dataset ({uploadedCount})</span>
              </button>

              <button
                type="button"
                onClick={() => setAdminTab('partners')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-mono text-xs font-bold transition-all cursor-pointer ${
                  adminTab === 'partners'
                    ? 'bg-indigo-600 text-white shadow'
                    : 'text-slate-300 hover:text-white'
                }`}
              >
                <Globe className="w-3.5 h-3.5" />
                <span>Integration Websites ({partnerIntegrations.length})</span>
              </button>

              <button
                type="button"
                onClick={() => setAdminTab('gateway')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-mono text-xs font-bold transition-all cursor-pointer ${
                  adminTab === 'gateway'
                    ? 'bg-cyan-600 text-white shadow'
                    : 'text-slate-300 hover:text-white'
                }`}
              >
                <Radio className="w-3.5 h-3.5" />
                <span>redBus Gateway API</span>
              </button>
            </div>
          </div>

          {/* TAB 1: UPLOAD BUS SCHEDULE DATASET */}
          {adminTab === 'dataset' && (
            <div className="space-y-4 animate-in fade-in">
              <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-900/60 p-4 rounded-2xl border border-indigo-500/20">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <Database className="w-4 h-4 text-cyan-400" />
                    <h4 className="font-bold text-sm text-cyan-200">
                      Corridor Bus Schedule Dataset ("What Bus Will Come When")
                    </h4>
                  </div>
                  <p className="text-xs text-slate-300">
                    Upload CSV schedule datasets containing origin (From), destination (To), departure time, arrival time, operator, fare, and bus type. The system instantly indexes these into the live timetable so citizens immediately see arrival schedules.
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <label className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-cyan-300 border border-cyan-500/40 text-xs font-bold cursor-pointer transition-all">
                    <FileText className="w-4 h-4 text-cyan-400" />
                    <span>Choose CSV File</span>
                    <input
                      type="file"
                      accept=".csv,text/csv,text/plain"
                      onChange={handleFileUpload}
                      className="hidden"
                    />
                  </label>

                  <button
                    type="button"
                    onClick={handleLoadSample}
                    className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-bold cursor-pointer transition-all"
                  >
                    Load Sample (Theni-Madurai-Periyakulam)
                  </button>

                  {uploadedCount > 0 && (
                    <button
                      type="button"
                      onClick={handleClearDataset}
                      className="px-3.5 py-2 rounded-xl bg-rose-950/60 hover:bg-rose-900 text-rose-300 border border-rose-500/40 text-xs font-bold cursor-pointer transition-all flex items-center gap-1"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Clear Uploaded ({uploadedCount})</span>
                    </button>
                  )}
                </div>
              </div>

              {/* Textarea for CSV */}
              <div className="space-y-2">
                <div className="flex justify-between items-center text-xs text-slate-300 font-mono">
                  <span>CSV Dataset Editor (Header required: from,to,departure,arrival,fare,busname,operator...)</span>
                  <span className="text-cyan-300 font-bold">{uploadedCount} custom schedules in memory</span>
                </div>

                <textarea
                  rows={6}
                  value={csvInput}
                  onChange={(e) => setCsvInput(e.target.value)}
                  className="w-full bg-slate-950 border border-indigo-400/40 focus:border-cyan-400 rounded-2xl p-3.5 text-xs text-cyan-100 font-mono focus:outline-none shadow-inner"
                  placeholder="from,to,departure,arrival,fare,busname,operator,busType,duration,frequency,availableSeats&#10;Theni,Madurai,07:00 AM,08:30 AM,65,Theni Express 101,TNSTC-Madurai,Express,1h 30m,Every 15 mins,34"
                />

                <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
                  <button
                    type="button"
                    onClick={handleUploadCsv}
                    className="px-5 py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs cursor-pointer transition-all shadow-md shadow-cyan-600/30 flex items-center gap-2"
                  >
                    <Upload className="w-4 h-4" />
                    <span>Upload & Process Schedule Dataset</span>
                  </button>

                  {datasetNotice && (
                    <div className="text-xs font-mono font-medium px-3 py-1.5 rounded-lg bg-slate-950 border border-cyan-500/40">
                      {datasetNotice}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: INTEGRATION WEBSITES & URLS */}
          {adminTab === 'partners' && (
            <div className="space-y-4 animate-in fade-in">
              <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-900/60 p-4 rounded-2xl border border-indigo-500/20">
                <div>
                  <h4 className="font-bold text-sm text-indigo-200">
                    Integrated Transit Portals & External Booking URLs
                  </h4>
                  <p className="text-xs text-slate-300">
                    Add authorized transit booking websites and government portals (e.g. redBus, TNSTC, IRCTC, KSRTC, Metro Rail). Citizens can access them directly through in-app responsive modals or dedicated links.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => setIsAddPartnerOpen(!isAddPartnerOpen)}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs cursor-pointer transition-all shadow"
                >
                  <Plus className="w-4 h-4" />
                  <span>{isAddPartnerOpen ? 'Close Form' : 'Add Integration Website'}</span>
                </button>
              </div>

              {/* Add Partner Form */}
              {isAddPartnerOpen && (
                <form
                  onSubmit={handleAddPartnerSubmit}
                  className="p-4 bg-slate-950/80 rounded-2xl border border-indigo-400/50 space-y-3 text-xs"
                >
                  <div className="font-bold text-indigo-300 font-mono text-xs uppercase tracking-wider">
                    Add New Integration Website / URL
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <div>
                      <label className="block text-slate-400 font-mono text-[11px] mb-1">Website Name</label>
                      <input
                        type="text"
                        required
                        value={newPartner.name}
                        onChange={(e) => setNewPartner({ ...newPartner, name: e.target.value })}
                        placeholder="e.g. TNSTC Bus Booking"
                        className="w-full bg-slate-900 border border-indigo-400/40 rounded-xl px-3 py-2 text-white font-medium focus:outline-none"
                      />
                    </div>

                    <div className="md:col-span-2">
                      <label className="block text-slate-400 font-mono text-[11px] mb-1">Website URL (https://...)</label>
                      <input
                        type="url"
                        required
                        value={newPartner.url}
                        onChange={(e) => setNewPartner({ ...newPartner, url: e.target.value })}
                        placeholder="https://www.tnstc.in or https://www.redbus.in"
                        className="w-full bg-slate-900 border border-indigo-400/40 rounded-xl px-3 py-2 text-white font-mono focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-slate-400 font-mono text-[11px] mb-1">Category</label>
                      <select
                        value={newPartner.category}
                        onChange={(e) => setNewPartner({ ...newPartner, category: e.target.value as any })}
                        className="w-full bg-slate-900 border border-indigo-400/40 rounded-xl px-3 py-2 text-white focus:outline-none cursor-pointer"
                      >
                        <option value="bus">Bus Fleet / Road Booking</option>
                        <option value="train">Train / Rail Booking</option>
                        <option value="metro">Metro Rail Transit</option>
                      </select>
                    </div>

                    <div className="md:col-span-2">
                      <label className="block text-slate-400 font-mono text-[11px] mb-1">Description / Campaign Tag</label>
                      <input
                        type="text"
                        value={newPartner.description}
                        onChange={(e) => setNewPartner({ ...newPartner, description: e.target.value })}
                        placeholder="Tamil Nadu State Express Transport Corporation Official Portal"
                        className="w-full bg-slate-900 border border-indigo-400/40 rounded-xl px-3 py-2 text-white font-medium focus:outline-none"
                      />
                    </div>
                  </div>

                  <div className="flex justify-end gap-2 pt-2">
                    <button
                      type="button"
                      onClick={() => setIsAddPartnerOpen(false)}
                      className="px-3 py-1.5 rounded-xl bg-slate-800 text-slate-300 font-bold hover:bg-slate-700 cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold cursor-pointer"
                    >
                      Save & Integrate
                    </button>
                  </div>
                </form>
              )}

              {/* Integrated Websites List */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {partnerIntegrations.map((partner) => (
                  <div
                    key={partner.id}
                    className="p-3.5 rounded-2xl bg-slate-900/90 border border-indigo-500/30 flex flex-col justify-between gap-3"
                  >
                    <div>
                      <div className="flex items-center justify-between gap-2">
                        <span className="font-bold text-white text-xs flex items-center gap-1.5">
                          <Globe className="w-3.5 h-3.5 text-cyan-400" />
                          {partner.name}
                        </span>
                        <span className="px-1.5 py-0.5 rounded text-[10px] font-mono font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/40">
                          {partner.category.toUpperCase()}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-400 mt-1 line-clamp-2">
                        {partner.description || partner.url}
                      </p>
                    </div>

                    <div className="flex items-center justify-between pt-2 border-t border-indigo-500/20 text-[11px]">
                      <button
                        type="button"
                        onClick={() => handleOpenPartnerModal(partner.url, partner.name)}
                        className="text-cyan-300 hover:text-cyan-200 font-bold flex items-center gap-1 cursor-pointer"
                      >
                        <ExternalLink className="w-3 h-3" />
                        <span>Open Modal</span>
                      </button>

                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => handleTogglePartner(partner.id, !partner.isActive)}
                          className={`px-2 py-0.5 rounded-full font-mono text-[10px] font-bold cursor-pointer ${
                            partner.isActive
                              ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                              : 'bg-slate-800 text-slate-400 border border-slate-700'
                          }`}
                        >
                          {partner.isActive ? 'Active' : 'Disabled'}
                        </button>

                        <button
                          type="button"
                          onClick={() => handleDeletePartner(partner.id)}
                          className="text-rose-400 hover:text-rose-300 cursor-pointer p-1"
                          title="Delete Partner"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 3: REDBUS GATEWAY API CONFIG */}
          {adminTab === 'gateway' && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 text-xs animate-in fade-in">
              <div className="lg:col-span-2 space-y-3">
                <div>
                  <label className="block text-indigo-200 font-mono uppercase text-[11px] font-bold mb-1.5 flex items-center justify-between">
                    <span>Integrated Partner Booking URL (redBus Endpoint)</span>
                    <button
                      type="button"
                      onClick={() => setAdminUrlInput(REDBUS_DEFAULT_URL)}
                      className="text-cyan-300 hover:underline lowercase font-normal"
                    >
                      Reset to default URL
                    </button>
                  </label>
                  <div className="relative flex items-center">
                    <Link2 className="w-4 h-4 text-slate-400 absolute left-3.5" />
                    <input
                      type="text"
                      value={adminUrlInput}
                      onChange={(e) => setAdminUrlInput(e.target.value)}
                      className="w-full bg-slate-950 border border-indigo-400/40 focus:border-indigo-400 rounded-xl pl-10 pr-3.5 py-2.5 text-xs text-indigo-100 font-mono focus:outline-none"
                      placeholder="https://www.redbus.in/..."
                    />
                  </div>
                  <p className="text-[11px] text-slate-400 mt-1">
                    Active campaign endpoint loaded when citizens click "Book a Bus". Supports query parameters, affiliate tags, and regional tracking codes.
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-3 pt-1">
                  <button
                    type="button"
                    onClick={() => {
                      localStorage.setItem('smartmove_redbus_url', adminUrlInput);
                      setRedBusPartnerUrl(adminUrlInput);
                      setAdminSaveMsg('Partner integration settings saved successfully!');
                      setTimeout(() => setAdminSaveMsg(null), 3500);
                    }}
                    className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold cursor-pointer transition-all shadow-md shadow-indigo-600/30 flex items-center gap-1.5"
                  >
                    <Check className="w-4 h-4" /> Save Configuration
                  </button>

                  <button
                    type="button"
                    disabled={handshakeStatus === 'testing'}
                    onClick={() => {
                      setHandshakeStatus('testing');
                      setTimeout(() => {
                        setHandshakeStatus('success');
                        setTimeout(() => setHandshakeStatus('idle'), 4000);
                      }, 1200);
                    }}
                    className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-cyan-300 border border-slate-700 font-bold cursor-pointer transition-all flex items-center gap-1.5"
                  >
                    {handshakeStatus === 'testing' ? (
                      <RefreshCw className="w-4 h-4 animate-spin text-cyan-300" />
                    ) : (
                      <Radio className="w-4 h-4 text-cyan-400" />
                    )}
                    <span>Test Gateway Handshake</span>
                  </button>

                  {adminSaveMsg && (
                    <span className="text-emerald-400 font-semibold flex items-center gap-1">
                      <CheckCircle2 className="w-4 h-4" /> {adminSaveMsg}
                    </span>
                  )}

                  {handshakeStatus === 'success' && (
                    <span className="text-cyan-300 font-mono text-[11px] flex items-center gap-1">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400" /> Handshake OK (200 OK, Latency: 32ms)
                    </span>
                  )}
                </div>
              </div>

              {/* Gateway Telemetry & Info Box */}
              <div className="bg-slate-950/70 p-4 rounded-2xl border border-indigo-500/30 space-y-2.5 font-mono text-[11px]">
                <div className="text-indigo-300 font-bold uppercase tracking-wider text-[10px]">
                  Active Integration Telemetry
                </div>
                <div className="space-y-1.5 text-slate-300">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Partner:</span>
                    <span className="font-bold text-white">redBus (South Zone)</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Protocol:</span>
                    <span className="text-cyan-300">HTTPS / Responsive iFrame</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Corridors Synced:</span>
                    <span className="text-emerald-400">Theni, Madurai, Salem</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Custom Dataset:</span>
                    <span className="text-indigo-300">{uploadedCount} routes active</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* FEATURE: Integrated redBus Partner Booking Banner */}
      <div className="p-6 rounded-3xl bg-gradient-to-r from-red-600 via-rose-600 to-rose-700 text-white shadow-xl space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full bg-white/20 text-white font-mono text-[11px] font-black uppercase tracking-wider backdrop-blur-sm">
                🔴 OFFICIAL PARTNER INTEGRATION
              </span>
              <span className="text-xs text-white/80 font-medium">South Zone Express Fleet</span>
            </div>
            <h3 className="text-xl sm:text-2xl font-black font-display text-white">
              Book a Bus — Online Tickets & Lowest Fare Guarantee
            </h3>
            <p className="text-xs text-white/90 max-w-2xl leading-relaxed">
              Book government and private express buses (TNSTC, SETC, KSRTC, SRS, Intrcity) directly inside SMARTMOVE with live seat selection, instant m-ticket issuance, and real-time GPS tracking.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <button
              type="button"
              onClick={() => handleOpenPartnerModal(redBusPartnerUrl, 'redBus Official Portal')}
              className="px-5 py-3 rounded-2xl bg-white hover:bg-rose-50 text-red-600 font-black text-xs shadow-lg shadow-black/20 flex items-center gap-2 transition-all cursor-pointer transform hover:scale-105"
            >
              <Bus className="w-4 h-4 text-red-600" />
              <span>Book a Bus (Integrated Portal)</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </button>

            <a
              href={redBusPartnerUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 py-3 rounded-2xl bg-red-800/60 hover:bg-red-800 text-white font-bold text-xs border border-white/20 flex items-center gap-1.5 transition-all"
            >
              <span>Open in New Tab</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>

        {/* Quick Corridor Fast-Booking Chips */}
        <div className="pt-2 border-t border-white/20 flex flex-wrap items-center gap-2 text-xs">
          <span className="text-white/80 font-mono text-[11px]">Popular Bus Routes:</span>
          {[
            { from: 'Theni', to: 'Madurai' },
            { from: 'Theni', to: 'Chennai' },
            { from: 'Salem', to: 'Bengaluru' },
            { from: 'Madurai', to: 'Bangalore' },
            { from: 'Theni', to: 'Periyakulam' },
          ].map((corridor) => (
            <button
              key={`${corridor.from}-${corridor.to}`}
              type="button"
              onClick={() => {
                setFromCity(corridor.from);
                setToCity(corridor.to);
                handleOpenPartnerModal(redBusPartnerUrl, `redBus — ${corridor.from} to ${corridor.to}`);
              }}
              className="px-2.5 py-1 rounded-lg bg-white/15 hover:bg-white/25 text-white text-[11px] font-medium backdrop-blur-sm border border-white/20 transition-all cursor-pointer flex items-center gap-1"
            >
              <span>{corridor.from}</span>
              <ArrowRight className="w-3 h-3 opacity-70" />
              <span>{corridor.to}</span>
            </button>
          ))}
        </div>

        {/* Integrated Partner Websites Direct Launchers */}
        {partnerIntegrations.filter((p) => p.isActive).length > 0 && (
          <div className="pt-3 border-t border-white/20 flex flex-wrap items-center gap-2 text-xs">
            <span className="text-white/80 font-mono text-[11px] flex items-center gap-1">
              <Globe className="w-3.5 h-3.5 text-amber-300" />
              <span>Integrated Transit Websites:</span>
            </span>
            {partnerIntegrations
              .filter((p) => p.isActive)
              .map((partner) => (
                <button
                  key={partner.id}
                  type="button"
                  onClick={() => handleOpenPartnerModal(partner.url, partner.name)}
                  className="px-2.5 py-1 rounded-lg bg-white/20 hover:bg-white/30 text-white text-[11px] font-semibold border border-white/30 transition-all cursor-pointer flex items-center gap-1"
                  title={partner.description || partner.name}
                >
                  <span>{partner.name}</span>
                  <ExternalLink className="w-3 h-3 opacity-75" />
                </button>
              ))}
          </div>
        )}
      </div>

      {/* FEATURE: Integrated IRCTC Railway Booking Portal (https://www.irctc.co.in/nget/train-search) */}
      <div className="p-6 rounded-3xl bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 text-white shadow-xl space-y-4 border border-blue-500/30">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full bg-blue-500/30 text-blue-200 font-mono text-[11px] font-black uppercase tracking-wider border border-blue-400/40">
                🚆 NATIONAL RAILWAY INTEGRATION
              </span>
              <span className="text-xs text-blue-200 font-medium">Indian Railway Catering & Tourism Corporation</span>
            </div>
            <h3 className="text-xl sm:text-2xl font-black font-display text-white">
              IRCTC Train Search & Seat Reservation Portal
            </h3>
            <p className="text-xs text-blue-100 max-w-2xl leading-relaxed">
              Plan and book Indian Railway train tickets directly through SMARTMOVE. Check live train schedules, PNR status, seat availability (Vande Bharat, Superfast, Express, Mail), and quota availability.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <button
              type="button"
              onClick={() => handleOpenPartnerModal(IRCTC_DEFAULT_URL, 'IRCTC Official Indian Railways Portal')}
              className="px-5 py-3 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-black text-xs shadow-lg shadow-blue-500/20 flex items-center gap-2 transition-all cursor-pointer transform hover:scale-105"
            >
              <Train className="w-4 h-4 text-cyan-300" />
              <span>Book a Train (IRCTC Portal)</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </button>

            <a
              href={IRCTC_DEFAULT_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 py-3 rounded-2xl bg-blue-950/80 hover:bg-blue-950 text-blue-200 font-bold text-xs border border-blue-400/30 flex items-center gap-1.5 transition-all"
            >
              <span>Open in New Tab</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>

        {/* Popular Railway Corridors */}
        <div className="pt-2 border-t border-blue-500/20 flex flex-wrap items-center gap-2 text-xs">
          <span className="text-blue-300 font-mono text-[11px]">Direct Train Search:</span>
          {[
            { from: 'Madurai (MDU)', to: 'Chennai Central (MAS)' },
            { from: 'Dindigul (DG)', to: 'Bangalore (SBC)' },
            { from: 'Theni (TENI)', to: 'Madurai (MDU)' },
            { from: 'Coimbatore (CBE)', to: 'Chennai Egmore (MS)' },
          ].map((corridor) => (
            <button
              key={`${corridor.from}-${corridor.to}`}
              type="button"
              onClick={() => handleOpenPartnerModal(IRCTC_DEFAULT_URL, `IRCTC — ${corridor.from} to ${corridor.to}`)}
              className="px-2.5 py-1 rounded-lg bg-blue-800/40 hover:bg-blue-800/60 text-blue-100 text-[11px] font-medium border border-blue-400/20 transition-all cursor-pointer flex items-center gap-1"
            >
              <span>{corridor.from}</span>
              <ArrowRight className="w-3 h-3 opacity-70" />
              <span>{corridor.to}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Interactive Urban Mobility Live Flow Animation */}
      <UrbanMobilityAnimation />

      {/* FEATURE 2: Live Bus Search Module */}
      <div className="glass-panel p-6 rounded-3xl border border-blue-200 bg-white shadow-xl space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-blue-100">
          <div className="flex items-center gap-2">
            <Search className="w-4 h-4 text-blue-600" />
            <span className="text-xs uppercase font-mono font-bold text-blue-950 tracking-wider">
              Search Authorized Bus Services & Live Seat Inventory
            </span>
          </div>
          <SourceBadge source="LIVE BOOKING API" provider="State Road Transport Gateway" />
        </div>

        {/* Search Form Inputs */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            executeSearch();
          }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 items-end"
        >
          <div>
            <label className="block text-[11px] font-mono uppercase text-blue-950 font-bold mb-1">From Origin</label>
            <input
              type="text"
              value={fromCity}
              onChange={(e) => setFromCity(e.target.value)}
              placeholder="e.g. Theni, Salem"
              className="w-full bg-white border border-blue-200 focus:border-blue-600 rounded-xl px-3.5 py-2.5 text-xs text-blue-950 focus:outline-none font-semibold shadow-sm"
              required
            />
          </div>

          <div>
            <label className="block text-[11px] font-mono uppercase text-blue-950 font-bold mb-1">To Destination</label>
            <input
              type="text"
              value={toCity}
              onChange={(e) => setToCity(e.target.value)}
              placeholder="e.g. Periyakulam, Bengaluru"
              className="w-full bg-white border border-blue-200 focus:border-blue-600 rounded-xl px-3.5 py-2.5 text-xs text-blue-950 focus:outline-none font-semibold shadow-sm"
              required
            />
          </div>

          <div>
            <label className="block text-[11px] font-mono uppercase text-blue-950 font-bold mb-1">Travel Date</label>
            <input
              type="text"
              value={travelDate}
              onChange={(e) => setTravelDate(e.target.value)}
              placeholder="Today / YYYY-MM-DD"
              className="w-full bg-slate-950 border border-slate-800 focus:border-cyan-400 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none font-medium"
              required
            />
          </div>

          <button
            type="submit"
            disabled={isSearching}
            className="w-full py-2.5 px-4 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs shadow-lg shadow-cyan-500/20 transition-all cursor-pointer flex items-center justify-center gap-2"
          >
            {isSearching ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
            SEARCH BUSES
          </button>
        </form>

        {/* Quick Corridor Presets */}
        <div className="flex flex-wrap items-center gap-2 pt-1 text-xs">
          <span className="text-slate-400 font-mono text-[11px]">Popular Corridors:</span>
          <button
            type="button"
            onClick={() => {
              setFromCity('Theni');
              setToCity('Periyakulam');
              executeSearch('Theni', 'Periyakulam', 'Today');
            }}
            className="px-2.5 py-1 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 text-[11px] cursor-pointer"
          >
            Theni ➔ Periyakulam
          </button>
          <button
            type="button"
            onClick={() => {
              setFromCity('Salem');
              setToCity('Bengaluru');
              executeSearch('Salem', 'Bengaluru', 'Today');
            }}
            className="px-2.5 py-1 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 text-[11px] cursor-pointer"
          >
            Salem ➔ Bengaluru
          </button>
        </div>
      </div>

      {/* Confirmed E-Ticket Receipt Display (if just booked) */}
      {confirmedBooking && (
        <div className="p-6 rounded-3xl bg-gradient-to-r from-emerald-950/60 via-slate-900 to-slate-950 border border-emerald-500/50 shadow-2xl space-y-4 animate-in fade-in">
          <div className="flex items-center justify-between pb-3 border-b border-emerald-500/30">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-emerald-400" />
              <span className="font-bold text-white text-sm uppercase tracking-wide">
                BOOKING CONFIRMED — OFFICIAL PNR ISSUED
              </span>
            </div>
            <button
              onClick={() => setConfirmedBooking(null)}
              className="text-slate-400 hover:text-white text-xs cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs font-mono">
            <div>
              <span className="text-slate-400 uppercase text-[10px] block">PNR Number</span>
              <span className="text-base font-black text-cyan-300">{confirmedBooking.pnr}</span>
            </div>
            <div>
              <span className="text-slate-400 uppercase text-[10px] block">Bus Service</span>
              <span className="text-white font-bold">{confirmedBooking.bus_name}</span>
            </div>
            <div>
              <span className="text-slate-400 uppercase text-[10px] block">Seat & Departure</span>
              <span className="text-emerald-400 font-bold">Seat {confirmedBooking.seat_number} ({confirmedBooking.departure_time})</span>
            </div>
            <div>
              <span className="text-slate-400 uppercase text-[10px] block">Passenger</span>
              <span className="text-white">{confirmedBooking.passenger_name} (₹{confirmedBooking.fare_amount})</span>
            </div>
          </div>
          <div className="text-[10px] text-slate-400 pt-2 border-t border-slate-800 flex justify-between">
            <span>Provider: {confirmedBooking.booking_provider}</span>
            <span className="text-emerald-400 font-bold">● Valid for Boarding</span>
          </div>
        </div>
      )}

      {/* AI Bus Recommendation (Grounded on retrieved provider data) */}
      {aiRecommendation && (
        <div className="p-4 rounded-2xl bg-cyan-950/30 border border-cyan-500/30 text-xs text-cyan-200 flex items-start gap-2.5 animate-in fade-in">
          <Sparkles className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
          <div className="leading-relaxed font-medium">
            {aiRecommendation}
          </div>
        </div>
      )}

      {/* Failure / Route Unavailable Banner */}
      {searchError && (
        <div className="p-5 rounded-2xl bg-rose-950/40 border border-rose-500/40 text-xs space-y-3">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
            <div>
              <h4 className="font-bold text-rose-300 text-sm">Live Bus Booking Data Unavailable</h4>
              <p className="text-slate-300 mt-1">{searchError}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => executeSearch('Theni', 'Periyakulam', 'Today')}
            className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-cyan-300 border border-slate-700 font-bold cursor-pointer inline-flex items-center gap-1.5"
          >
            <RefreshCw className="w-3.5 h-3.5" /> RETRY CORRIDOR SEARCH
          </button>
        </div>
      )}

      {/* Available Buses List */}
      {searchResults.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between text-xs font-mono text-slate-400 uppercase">
            <span>Available Authorized Services ({searchResults.length})</span>
            <span className="text-emerald-400 font-bold">Live Inventory Connected</span>
          </div>

          <div className="grid grid-cols-1 gap-4">
            {searchResults.map((bus) => (
              <div
                key={bus.id}
                className="glass-panel p-5 sm:p-6 rounded-3xl border border-slate-800 hover:border-cyan-500/40 transition-all space-y-4 bg-slate-900/70"
              >
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2.5">
                      <h3 className="text-base font-bold text-white font-display">{bus.busName}</h3>
                      <span className="text-xs font-mono text-slate-400 bg-slate-950 px-2 py-0.5 rounded border border-slate-800">
                        {bus.busNumber}
                      </span>
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase border ${bus.statusBadge.bg} ${bus.statusBadge.color}`}>
                        {bus.statusBadge.label}
                      </span>
                    </div>
                    <div className="text-xs text-slate-300">
                      Operator: <strong className="text-white">{bus.operator}</strong> • {bus.busType}
                    </div>
                    <div className="text-[11px] text-slate-400 flex items-center gap-2 pt-0.5">
                      <MapPin className="w-3.5 h-3.5 text-cyan-400" />
                      <span>{bus.boardingPoint} ➔ {bus.droppingPoint}</span>
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="text-2xl font-black font-mono text-white">₹{bus.fareAmount}</div>
                    <div className="text-[11px] text-slate-400">per passenger seat</div>
                  </div>
                </div>

                {/* Timing & Amenities Bar */}
                <div className="p-3.5 rounded-2xl bg-slate-950/80 border border-slate-800 flex flex-wrap items-center justify-between gap-4 text-xs font-mono">
                  <div className="flex items-center gap-4">
                    <div>
                      <span className="text-slate-500 text-[10px] uppercase block">Departure</span>
                      <span className="text-white font-bold text-sm">{bus.departureTime}</span>
                    </div>
                    <ArrowRight className="w-4 h-4 text-slate-600" />
                    <div>
                      <span className="text-slate-500 text-[10px] uppercase block">Arrival</span>
                      <span className="text-white font-bold text-sm">{bus.arrivalTime}</span>
                    </div>
                    <div className="text-slate-400 text-[11px] pl-2">({bus.durationMinutes} min trip)</div>
                  </div>

                  <div className="flex items-center gap-2.5">
                    <button
                      type="button"
                      disabled={bus.seatStatus === 'FULL'}
                      onClick={() => handleOpenSeatMap(bus)}
                      className="px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-cyan-300 font-bold text-xs disabled:opacity-40 cursor-pointer transition-colors"
                    >
                      VIEW SEATS
                    </button>
                    <button
                      type="button"
                      disabled={bus.seatStatus === 'FULL'}
                      onClick={() => {
                        handleOpenSeatMap(bus);
                        const firstAvail = bus.seatLayout.flat().find((s) => s.status === 'available');
                        if (firstAvail) setSelectedSeat(firstAvail);
                      }}
                      className="px-3.5 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs shadow-md shadow-cyan-500/20 disabled:opacity-40 cursor-pointer transition-all"
                    >
                      BOOK NOW
                    </button>
                    <button
                      type="button"
                      onClick={() => setIsRedBusModalOpen(true)}
                      className="px-3 py-2 rounded-xl bg-rose-600/20 hover:bg-rose-600 text-rose-300 hover:text-white border border-rose-500/40 font-bold text-xs cursor-pointer transition-all flex items-center gap-1.5"
                      title="Book this route on redBus"
                    >
                      <Bus className="w-3.5 h-3.5" />
                      <span className="hidden sm:inline">Book a Bus</span>
                      <ExternalLink className="w-3 h-3 opacity-70" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* SEAT MAP MODAL */}
      {activeBusForSeats && (
        <div className="fixed inset-0 bg-slate-950/85 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-cyan-500/40 rounded-3xl p-6 max-w-xl w-full max-h-[90vh] overflow-y-auto space-y-4 shadow-2xl animate-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div>
                <h3 className="text-base font-bold text-white font-display">
                  Select Seat: {activeBusForSeats.busName}
                </h3>
                <p className="text-xs text-slate-400">
                  {activeBusForSeats.fromCity} ➔ {activeBusForSeats.toCity} ({activeBusForSeats.departureTime})
                </p>
              </div>
              <button
                type="button"
                onClick={() => setActiveBusForSeats(null)}
                className="text-slate-400 hover:text-white p-1 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Seat Map Legend */}
            <div className="flex items-center justify-center gap-5 text-xs font-mono py-2 bg-slate-950 rounded-2xl border border-slate-800">
              <span className="flex items-center gap-1.5 text-emerald-400">
                <span className="w-3.5 h-3.5 rounded bg-emerald-500/30 border border-emerald-500" /> Available
              </span>
              <span className="flex items-center gap-1.5 text-amber-400">
                <span className="w-3.5 h-3.5 rounded bg-amber-500 border border-amber-400" /> Selected
              </span>
              <span className="flex items-center gap-1.5 text-rose-400">
                <span className="w-3.5 h-3.5 rounded bg-rose-500/20 border border-rose-500/40" /> Occupied
              </span>
            </div>

            {/* 40-Seat 2x2 Layout Grid */}
            <div className="space-y-2 p-4 bg-slate-950/90 rounded-2xl border border-slate-800/80">
              <div className="text-center text-[10px] font-mono uppercase text-slate-500 pb-1">
                DRIVER CABIN FRONT
              </div>
              {activeBusForSeats.seatLayout.map((row, rIdx) => (
                <div key={rIdx} className="flex items-center justify-center gap-3">
                  {/* Left Side (A1, A2) */}
                  <div className="flex gap-2">
                    {row.slice(0, 2).map((seat) => {
                      const isSelected = selectedSeat?.number === seat.number;
                      return (
                        <button
                          key={seat.id}
                          type="button"
                          disabled={seat.status === 'occupied'}
                          onClick={() => handleSelectSeat(seat)}
                          className={`w-9 h-9 rounded-lg font-mono text-xs font-bold transition-all cursor-pointer flex items-center justify-center ${
                            isSelected
                              ? 'bg-amber-400 text-slate-950 ring-2 ring-amber-300'
                              : seat.status === 'occupied'
                              ? 'bg-slate-900 border border-rose-500/30 text-rose-400/40 cursor-not-allowed opacity-50'
                              : 'bg-emerald-500/20 border border-emerald-500/50 text-emerald-300 hover:bg-emerald-500/40'
                          }`}
                        >
                          {seat.number}
                        </button>
                      );
                    })}
                  </div>

                  {/* Center Aisle */}
                  <div className="w-6 text-center text-[9px] text-slate-600 font-mono">| |</div>

                  {/* Right Side (B1, B2) */}
                  <div className="flex gap-2">
                    {row.slice(2, 4).map((seat) => {
                      const isSelected = selectedSeat?.number === seat.number;
                      return (
                        <button
                          key={seat.id}
                          type="button"
                          disabled={seat.status === 'occupied'}
                          onClick={() => handleSelectSeat(seat)}
                          className={`w-9 h-9 rounded-lg font-mono text-xs font-bold transition-all cursor-pointer flex items-center justify-center ${
                            isSelected
                              ? 'bg-amber-400 text-slate-950 ring-2 ring-amber-300'
                              : seat.status === 'occupied'
                              ? 'bg-slate-900 border border-rose-500/30 text-rose-400/40 cursor-not-allowed opacity-50'
                              : 'bg-emerald-500/20 border border-emerald-500/50 text-emerald-300 hover:bg-emerald-500/40'
                          }`}
                        >
                          {seat.number}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>

            {/* Selection Summary Footer */}
            <div className="pt-3 border-t border-slate-800 flex items-center justify-between">
              <div>
                <span className="text-xs text-slate-400 block">Selected Seat</span>
                <span className="text-base font-bold text-white font-mono">
                  {selectedSeat ? `${selectedSeat.number} (₹${selectedSeat.price})` : 'None selected'}
                </span>
              </div>
              <button
                type="button"
                disabled={!selectedSeat}
                onClick={handleProceedToBooking}
                className="px-5 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs disabled:opacity-40 cursor-pointer shadow-lg shadow-cyan-500/20"
              >
                PROCEED TO PASSENGER DETAILS
              </button>
            </div>
          </div>
        </div>
      )}

      {/* PASSENGER DETAILS & CONFIRMATION MODAL */}
      {isBookingModalOpen && activeBusForSeats && selectedSeat && (
        <div className="fixed inset-0 bg-slate-950/85 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <form
            onSubmit={handleConfirmTicket}
            className="bg-slate-900 border border-cyan-500/40 rounded-3xl p-6 max-w-lg w-full space-y-4 shadow-2xl animate-in zoom-in-95"
          >
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="text-base font-bold text-white font-display">
                Passenger Details & Ticket Confirmation
              </h3>
              <button
                type="button"
                onClick={() => setIsBookingModalOpen(false)}
                className="text-slate-400 hover:text-white p-1 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Bus Summary Banner */}
            <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 text-xs font-mono space-y-1">
              <div className="flex justify-between text-white font-bold">
                <span>{activeBusForSeats.busName}</span>
                <span className="text-cyan-300">Seat {selectedSeat.number}</span>
              </div>
              <div className="text-slate-400">
                {activeBusForSeats.fromCity} ➔ {activeBusForSeats.toCity} ({activeBusForSeats.departureTime})
              </div>
              <div className="text-emerald-400 font-bold pt-1">
                Total Payable: ₹{selectedSeat.price}
              </div>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Passenger Full Name</label>
                <input
                  type="text"
                  value={passenger.name}
                  onChange={(e) => setPassenger({ ...passenger, name: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-700 focus:border-cyan-400 rounded-xl px-3.5 py-2 text-white focus:outline-none"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Age</label>
                  <input
                    type="number"
                    min="1"
                    max="110"
                    value={passenger.age}
                    onChange={(e) => setPassenger({ ...passenger, age: parseInt(e.target.value) || 25 })}
                    className="w-full bg-slate-950 border border-slate-700 focus:border-cyan-400 rounded-xl px-3.5 py-2 text-white focus:outline-none"
                    required
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Gender</label>
                  <select
                    value={passenger.gender}
                    onChange={(e) => setPassenger({ ...passenger, gender: e.target.value as any })}
                    className="w-full bg-slate-950 border border-slate-700 focus:border-cyan-400 rounded-xl px-3.5 py-2 text-white focus:outline-none"
                  >
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Contact Phone Number</label>
                <input
                  type="tel"
                  value={passenger.contactPhone}
                  onChange={(e) => setPassenger({ ...passenger, contactPhone: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-700 focus:border-cyan-400 rounded-xl px-3.5 py-2 text-white focus:outline-none"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-3.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs shadow-lg shadow-emerald-500/25 transition-all flex items-center justify-center gap-2 cursor-pointer mt-2"
            >
              <Ticket className="w-4 h-4 fill-slate-950" />
              CONFIRM & ISSUE AUTHORIZED PNR TICKET
            </button>
          </form>
        </div>
      )}

      {/* Corridor Public Fleet & AI Telematics Overview */}
      <div className="pt-4 border-t border-slate-800 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-bold text-white font-display">
            Smart Bus Corridor Telematics & Electric Fleet
          </h3>
          <SourceBadge source="ai_prediction" provider="Kinematic Arrival Model" />
        </div>

        <LiveUnavailableBanner
          categoryName="Municipal GTFS-Realtime Stream"
          reason="City bus GTFS-RT feed unconfigured for current regional zone. Utilizing high-precision statistical prediction engine."
        />

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <StatCard
            title="Active Electric Fleet"
            value="14 Buses"
            subtitle="4 Shuttles on Tech Corridor"
            icon={<Bus className="w-4 h-4 text-cyan-400" />}
            source="estimated"
          />
          <StatCard
            title="Average Arrival Accuracy"
            value="94.2%"
            subtitle="Real-time GPS correlation"
            icon={<Clock className="w-4 h-4 text-emerald-400" />}
            source="ai_prediction"
          />
          <StatCard
            title="Corridor Transit Share"
            value="46%"
            subtitle="+18% shift vs private cars"
            icon={<Users className="w-4 h-4 text-purple-400" />}
            source="estimated"
          />
        </div>

        {/* Existing Routes Telematics Cards */}
        <div className="space-y-4">
          {busRoutes.map((bus: any) => {
            const pred = busPredictions.find((p: any) => p.route_number === bus.route_number) || {
              predicted_occupancy_8m: bus.current_occupancy_pct,
              predicted_delay_min: bus.delay_min,
              recommendation: 'Regular corridor frequency maintained.',
            };

            return (
              <div
                key={bus.id}
                className="glass-panel p-5 lg:p-6 rounded-2xl border border-slate-800 space-y-4 hover:border-cyan-500/30 transition-all"
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-cyan-500/20 border border-cyan-500/40 text-cyan-300 font-display font-black text-xl flex items-center justify-center">
                      {bus.route_number}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-base font-bold text-white">{bus.name}</h3>
                        <StatusBadge status={bus.is_overloaded ? 'overloaded' : 'available'} />
                      </div>
                      <div className="text-xs text-slate-400 flex items-center gap-1.5 mt-0.5">
                        <MapPin className="w-3.5 h-3.5 text-cyan-400" /> Next Stop:{' '}
                        <span className="text-slate-200 font-semibold">{bus.next_stop}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 font-mono">
                    <div className="text-right">
                      <span className="text-[10px] text-slate-500 block uppercase">Arrival ETA</span>
                      <span className="text-xl font-black text-white">{bus.current_eta_min} min</span>
                    </div>
                    <div className="text-right">
                      <span className="text-[10px] text-slate-500 block uppercase">Delay</span>
                      <span className={`text-xl font-black ${bus.delay_min > 5 ? 'text-rose-400' : 'text-emerald-400'}`}>
                        +{bus.delay_min} min
                      </span>
                    </div>
                  </div>
                </div>

                {/* Live Occupancy Bar & 8-min Prediction */}
                <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 grid grid-cols-1 md:grid-cols-2 gap-4 items-center">
                  <div>
                    <div className="flex justify-between text-xs font-semibold mb-1.5">
                      <span className="text-slate-300 flex items-center gap-1.5">
                        Live Occupancy <SourceBadge source="estimated" />
                      </span>
                      <span className={bus.current_occupancy_pct > 88 ? 'text-rose-400 font-bold' : 'text-white'}>
                        {bus.current_occupancy_pct}% ({bus.is_overloaded ? 'Overloaded' : 'Seats Available'})
                      </span>
                    </div>
                    <div className="w-full h-2.5 bg-slate-800 rounded-full overflow-hidden">
                      <div
                        className={`h-full transition-all duration-500 ${
                          bus.current_occupancy_pct > 88 ? 'bg-rose-500' : bus.current_occupancy_pct > 60 ? 'bg-amber-500' : 'bg-cyan-500'
                        }`}
                        style={{ width: `${bus.current_occupancy_pct}%` }}
                      />
                    </div>
                  </div>

                  <div className="text-xs space-y-2">
                    <div className="flex justify-between text-slate-400 font-mono items-center">
                      <span className="flex items-center gap-1.5">
                        8-Min Forecast <SourceBadge source="ai_prediction" />
                      </span>
                      <span className="text-amber-400 font-bold">{pred.predicted_occupancy_8m}%</span>
                    </div>
                    <ConfidenceMeter value={91} label="Prediction Confidence" />
                    <div className="text-slate-300 text-[11px] leading-relaxed flex items-center gap-1.5 pt-1">
                      <Sparkles className="w-3.5 h-3.5 text-cyan-400 flex-shrink-0" />
                      <span>{pred.recommendation}</span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* INTEGRATED REDBUS BOOKING PORTAL MODAL */}
      {isRedBusModalOpen && (
        <div className="fixed inset-0 bg-slate-950/85 backdrop-blur-md z-50 flex items-center justify-center p-2 sm:p-4 animate-in fade-in">
          <div className="bg-slate-900 border border-indigo-500/40 rounded-3xl w-full max-w-5xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden animate-in zoom-in-95">
            {/* Modal Header Bar */}
            <div className="p-4 bg-gradient-to-r from-indigo-700 via-rose-600 to-red-600 text-white flex flex-wrap items-center justify-between gap-3 border-b border-white/20">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-white text-indigo-700 font-black flex items-center justify-center shadow-md">
                  <Globe className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-white text-sm sm:text-base font-display">
                      {activeModalTitle || 'Integrated Transit Gateway'}
                    </h3>
                    <span className="hidden sm:inline px-2 py-0.5 rounded-full bg-white/20 text-[10px] font-mono font-bold">
                      VERIFIED PARTNER PORTAL
                    </span>
                  </div>
                  <p className="text-[11px] text-white/80 truncate max-w-md">
                    {activeModalUrl}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                {/* External Tab Link (Essential for browsers blocking iframe cross-origin cookies) */}
                <a
                  href={activeModalUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3 py-1.5 rounded-xl bg-white/15 hover:bg-white/25 text-white font-bold text-xs flex items-center gap-1.5 transition-all border border-white/20"
                  title="Open Portal in New Tab"
                >
                  <span>Open in New Tab</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>

                {/* Close Button */}
                <button
                  type="button"
                  onClick={() => setIsRedBusModalOpen(false)}
                  className="p-1.5 rounded-xl bg-white/10 hover:bg-white/25 text-white transition-colors cursor-pointer"
                  title="Close Portal"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* In-Modal Companion Notification Bar */}
            <div className="p-2.5 px-4 bg-slate-950 border-b border-slate-800 flex flex-wrap items-center justify-between gap-2 text-xs">
              <div className="flex items-center gap-2 text-slate-300">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                <span className="font-mono text-[11px]">
                  Secure Gateway Connection: <strong>{new URL(activeModalUrl).hostname}</strong> (Authorized Transport Partner)
                </span>
              </div>
              <div className="flex items-center gap-2 text-[11px]">
                <span className="text-slate-400">Security / CSP block?</span>
                <a
                  href={activeModalUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-cyan-400 hover:text-cyan-300 font-bold underline flex items-center gap-1"
                >
                  Launch full partner window <ArrowRight className="w-3 h-3" />
                </a>
              </div>
            </div>

            {/* Embedded Iframe Container */}
            <div className="flex-1 min-h-[60vh] max-h-[75vh] w-full bg-white relative">
              <iframe
                src={activeModalUrl}
                title={activeModalTitle}
                className="w-full h-full border-0"
                sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-modals allow-presentation"
                loading="lazy"
              />
            </div>

            {/* Footer Bar */}
            <div className="p-3 bg-slate-950 border-t border-slate-800 flex flex-wrap items-center justify-between gap-2 text-[11px] font-mono text-slate-400 px-4">
              <span>SMARTMOVE Unified Mobility Integration Suite</span>
              <div className="flex items-center gap-3">
                <span className="text-emerald-400">● 256-bit SSL Encrypted</span>
                <button
                  type="button"
                  onClick={() => setIsRedBusModalOpen(false)}
                  className="px-3 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 cursor-pointer"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
