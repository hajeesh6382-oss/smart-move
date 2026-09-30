import React, { useState } from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../hooks/useAuth';
import { SmartMoveLogo } from './SmartMoveLogo';
import { LanguageSwitcher } from './LanguageSwitcher';
import { GlobalVoiceNarrator } from './GlobalVoiceNarrator';
import {
  Menu,
  X,
  Compass,
  MapPin,
  Route,
  Coins,
  Bus,
  SquareParking,
  ShieldAlert,
  Siren,
  Leaf,
  LayoutDashboard,
  Clock,
  SlidersHorizontal,
  Calendar,
  TrafficCone,
  Sparkles,
  Radio,
  Lock,
  User,
  LogOut,
  ChevronRight,
  ShieldCheck,
  CheckCircle2,
} from 'lucide-react';

interface ThreeBarSidebarProps {
  className?: string;
}

export const ThreeBarSidebar: React.FC<ThreeBarSidebarProps> = ({ className = '' }) => {
  const [isOpen, setIsOpen] = useState(false);
  const { t } = useTranslation();
  const { user, signOut, isAdmin } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const citizenTopics = [
    { to: '/app', label: t('nav.dashboard', 'City Dashboard'), icon: <Compass className="w-4 h-4 text-blue-600" /> },
    { to: '/app/map', label: t('nav.live_map', 'Live Interactive Map'), icon: <MapPin className="w-4 h-4 text-cyan-600" /> },
    { to: '/app/routes', label: t('nav.routes', 'Route Planner & Tolls'), icon: <Route className="w-4 h-4 text-blue-600" /> },
    { to: '/app/road-pricing', label: t('nav.road_pricing', 'Dynamic Road Pricing (ERP)'), icon: <Coins className="w-4 h-4 text-amber-500" /> },
    { to: '/app/buses', label: t('nav.buses', 'Smart Transit & Buses'), icon: <Bus className="w-4 h-4 text-blue-600" /> },
    { to: '/app/parking', label: t('nav.parking', 'Predictive Parking'), icon: <SquareParking className="w-4 h-4 text-indigo-600" /> },
    { to: '/app/safety', label: t('nav.safety', 'Pedestrian Safety'), icon: <ShieldAlert className="w-4 h-4 text-rose-500" /> },
    { to: '/app/emergency', label: t('nav.emergency', 'Emergency Corridors'), icon: <Siren className="w-4 h-4 text-red-600" /> },
    { to: '/app/sustainability', label: t('nav.sustainability', 'Sustainability Impact'), icon: <Leaf className="w-4 h-4 text-emerald-600" /> },
  ];

  const adminTopics = [
    { to: '/admin', label: 'Admin Command Center', icon: <LayoutDashboard className="w-4 h-4 text-blue-600" /> },
    { to: '/admin/road-pricing', label: 'Road Pricing Governance', icon: <Coins className="w-4 h-4 text-amber-500" /> },
    { to: '/admin/parking-control', label: 'Parking Occupancy Control', icon: <SquareParking className="w-4 h-4 text-indigo-600" /> },
    { to: '/admin/peak-manager', label: 'Peak-Hour Traffic Manager', icon: <Clock className="w-4 h-4 text-blue-600" /> },
    { to: '/admin/what-if', label: 'What-If AI Simulator', icon: <SlidersHorizontal className="w-4 h-4 text-purple-600" /> },
    { to: '/admin/schedules', label: 'Staggered Schedules', icon: <Calendar className="w-4 h-4 text-cyan-600" /> },
    { to: '/admin/signals', label: 'Signal Telemetry', icon: <TrafficCone className="w-4 h-4 text-amber-600" /> },
    { to: '/admin/emergency', label: 'Emergency Clearance', icon: <Siren className="w-4 h-4 text-red-600" /> },
    { to: '/admin/recommendations', label: 'AI Mobility Brain Log', icon: <Sparkles className="w-4 h-4 text-blue-600" /> },
    { to: '/admin/data-sources', label: 'Data Sources & Streams', icon: <Radio className="w-4 h-4 text-emerald-600" /> },
  ];

  const closeSidebar = () => setIsOpen(false);

  return (
    <>
      {/* Three-Bar Hamburger Button */}
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className={`p-2.5 rounded-2xl bg-white hover:bg-blue-50 border border-blue-200 text-blue-900 shadow-md hover:shadow-lg transition-all cursor-pointer flex items-center justify-center gap-2 group ${className}`}
        title="Open SMARTMOVE Navigation Menu"
        aria-label="Toggle Three Bar Menu"
      >
        <div className="flex flex-col gap-1 w-5 h-4 justify-center items-center">
          <span className="w-5 h-0.5 bg-blue-700 rounded-full transition-all group-hover:w-4" />
          <span className="w-5 h-0.5 bg-blue-700 rounded-full transition-all" />
          <span className="w-5 h-0.5 bg-blue-700 rounded-full transition-all group-hover:w-3" />
        </div>
        <span className="text-xs font-bold font-display text-blue-900 hidden md:inline">
          Menu
        </span>
      </button>

      {/* Backdrop Overlay */}
      {isOpen && (
        <div
          onClick={closeSidebar}
          className="fixed inset-0 z-50 bg-blue-950/40 backdrop-blur-sm transition-opacity animate-in fade-in"
        />
      )}

      {/* Left-Side Off-Canvas Drawer */}
      <div
        className={`fixed top-0 bottom-0 left-0 z-50 w-80 max-w-[85vw] bg-white border-r border-blue-100 shadow-2xl flex flex-col transition-transform duration-300 ease-out ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Drawer Header */}
        <div className="p-4 border-b border-blue-100 flex items-center justify-between bg-gradient-to-r from-blue-50 to-white">
          <SmartMoveLogo size="sm" />
          <button
            type="button"
            onClick={closeSidebar}
            className="p-2 rounded-xl text-blue-600 hover:text-blue-900 hover:bg-blue-100/70 transition-colors cursor-pointer"
            aria-label="Close Menu"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Voice Narrator & Language Bar inside Drawer */}
        <div className="p-3 border-b border-blue-100 bg-blue-50/50 flex items-center justify-between gap-2">
          <GlobalVoiceNarrator />
          <LanguageSwitcher compact />
        </div>

        {/* Scrollable Navigation Topics */}
        <div className="flex-1 overflow-y-auto p-4 space-y-6">
          {/* 1. Citizen Mobility Suite */}
          <div className="space-y-1.5">
            <div className="text-[11px] font-mono uppercase font-bold text-blue-600 tracking-wider px-3 mb-2 flex items-center justify-between">
              <span>Citizen Mobility Portal</span>
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
            </div>

            <nav className="space-y-1">
              {citizenTopics.map((item) => {
                const isActive = location.pathname === item.to;
                return (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    onClick={closeSidebar}
                    className={`flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                      isActive
                        ? 'bg-blue-600 text-white shadow-md shadow-blue-500/25 font-bold'
                        : 'text-blue-950 hover:bg-blue-50 hover:text-blue-700'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <span className={isActive ? 'text-white' : ''}>{item.icon}</span>
                      <span>{item.label}</span>
                    </div>
                    {isActive ? <CheckCircle2 className="w-3.5 h-3.5 text-white" /> : <ChevronRight className="w-3.5 h-3.5 text-blue-300" />}
                  </NavLink>
                );
              })}
            </nav>
          </div>

          {/* 2. Admin Command Center (Password / OTP Protected) */}
          <div className="space-y-1.5 pt-4 border-t border-blue-100">
            <div className="text-[11px] font-mono uppercase font-bold text-indigo-700 tracking-wider px-3 mb-2 flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <Lock className="w-3 h-3 text-indigo-600" /> Admin Command (Protected)
              </span>
              {isAdmin && (
                <span className="text-[9px] px-1.5 py-0.5 rounded-md bg-purple-100 text-purple-800 font-bold">
                  VERIFIED
                </span>
              )}
            </div>

            <nav className="space-y-1">
              {adminTopics.map((item) => {
                const isActive = location.pathname === item.to;
                return (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    onClick={closeSidebar}
                    className={`flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium transition-all ${
                      isActive
                        ? 'bg-indigo-600 text-white font-bold shadow-md shadow-indigo-500/25'
                        : 'text-slate-700 hover:bg-indigo-50 hover:text-indigo-900'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <span className={isActive ? 'text-white' : ''}>{item.icon}</span>
                      <span>{item.label}</span>
                    </div>
                    <ChevronRight className="w-3.5 h-3.5 text-slate-300" />
                  </NavLink>
                );
              })}
            </nav>
          </div>
        </div>

        {/* Drawer Footer with User Session & Sign Out */}
        <div className="p-4 border-t border-blue-100 bg-gradient-to-t from-blue-50/80 to-white">
          {user ? (
            <div className="space-y-2.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-full bg-blue-600 text-white font-bold flex items-center justify-center text-xs shadow-md">
                    {user.full_name?.charAt(0) || user.email?.charAt(0) || 'U'}
                  </div>
                  <div>
                    <div className="text-xs font-bold text-blue-950 truncate max-w-[150px]">
                      {user.full_name || 'SMARTMOVE User'}
                    </div>
                    <div className="text-[10px] text-blue-600 font-mono">
                      {user.role === 'admin' ? '🛡️ Administrator' : '👤 Citizen'}
                    </div>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={async () => {
                    await signOut();
                    closeSidebar();
                    navigate('/auth/signin');
                  }}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                  title="Sign Out"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => {
                  closeSidebar();
                  navigate('/auth/signin');
                }}
                className="w-full py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md shadow-blue-500/25 transition-all text-center cursor-pointer"
              >
                Sign In / Verify OTP
              </button>
            </div>
          )}
        </div>
      </div>
    </>
  );
};
