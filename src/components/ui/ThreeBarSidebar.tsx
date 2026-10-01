import React, { useState } from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../hooks/useAuth';
import { SmartMoveLogo } from './SmartMoveLogo';
import { LanguageSwitcher } from './LanguageSwitcher';
import { GlobalVoiceNarrator } from './GlobalVoiceNarrator';
import { SettingsModal } from './SettingsModal';
import {
  Menu,
  X,
  User,
  MapPin,
  Route,
  Bus,
  Settings,
  LogOut,
  Compass,
  Coins,
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
  ChevronRight,
  ShieldCheck,
  CheckCircle2,
  Sun,
  Moon,
  Globe,
  Mic,
} from 'lucide-react';

interface ThreeBarSidebarProps {
  className?: string;
}

export const ThreeBarSidebar: React.FC<ThreeBarSidebarProps> = ({ className = '' }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const { t } = useTranslation();
  const { user, signOut, isAdmin } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Core Mandatory Topics requested by user:
  // Profile, Live Map, Route Planner, Smart Transit, Setting, Log Out
  const coreTopics = [
    {
      to: '/app/profile',
      label: 'Profile',
      sub: 'User Profile & Mobility Pass',
      icon: <User className="w-5 h-5 text-blue-600" />,
    },
    {
      to: '/app/map',
      label: 'Live Map',
      sub: 'Real-time traffic & vehicle telemetry',
      icon: <MapPin className="w-5 h-5 text-cyan-600" />,
    },
    {
      to: '/app/routes',
      label: 'Route Planner',
      sub: 'Multi-modal route optimization & tolls',
      icon: <Route className="w-5 h-5 text-blue-600" />,
    },
    {
      to: '/app/buses',
      label: 'Smart Transit',
      sub: 'Bus timetable, redBus & IRCTC trains',
      icon: <Bus className="w-5 h-5 text-rose-600" />,
    },
  ];

  // Extended Citizen City Modules
  const extendedCitizenTopics = [
    { to: '/app', label: t('nav.dashboard', 'City Dashboard'), icon: <Compass className="w-4 h-4 text-blue-600" /> },
    { to: '/app/road-pricing', label: t('nav.road_pricing', 'Dynamic Road Pricing (ERP)'), icon: <Coins className="w-4 h-4 text-amber-500" /> },
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
    { to: '/admin/transit', label: 'Transit & redBus Integration', icon: <Bus className="w-4 h-4 text-rose-600" /> },
    { to: '/admin/schedules', label: 'Staggered Schedules', icon: <Calendar className="w-4 h-4 text-cyan-600" /> },
    { to: '/admin/signals', label: 'Signal Telemetry', icon: <TrafficCone className="w-4 h-4 text-amber-600" /> },
    { to: '/admin/emergency', label: 'Emergency Clearance', icon: <Siren className="w-4 h-4 text-red-600" /> },
    { to: '/admin/recommendations', label: 'AI Mobility Brain Log', icon: <Sparkles className="w-4 h-4 text-blue-600" /> },
    { to: '/admin/data-sources', label: 'Data Sources & Streams', icon: <Radio className="w-4 h-4 text-emerald-600" /> },
  ];

  const closeSidebar = () => setIsOpen(false);

  const handleOpenSettings = () => {
    closeSidebar();
    setIsSettingsOpen(true);
  };

  const handleLogout = async () => {
    await signOut();
    closeSidebar();
    navigate('/auth/signin');
  };

  return (
    <>
      {/* Three-Bar Hamburger Button */}
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className={`p-2.5 rounded-2xl bg-white hover:bg-slate-50 border border-blue-200 text-blue-900 shadow-md hover:shadow-lg transition-all cursor-pointer flex items-center justify-center gap-2 group ${className}`}
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
          className="fixed inset-0 z-50 bg-slate-950/40 backdrop-blur-sm transition-opacity animate-in fade-in"
        />
      )}

      {/* Left-Side Off-Canvas Drawer (Solid White Background with zero transparent gradients) */}
      <div
        className={`fixed top-0 bottom-0 left-0 z-50 w-84 max-w-[88vw] bg-white border-r border-slate-200 shadow-2xl flex flex-col transition-transform duration-300 ease-out ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Drawer Header (Solid White) */}
        <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-white">
          <SmartMoveLogo size="sm" />
          <button
            type="button"
            onClick={closeSidebar}
            className="p-2 rounded-xl text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors cursor-pointer"
            aria-label="Close Menu"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Global Voice Narrator & Quick Language Pill */}
        <div className="p-3 border-b border-slate-100 bg-white flex items-center justify-between gap-2">
          <GlobalVoiceNarrator />
          <button
            type="button"
            onClick={handleOpenSettings}
            className="px-2.5 py-1.5 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-700 font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
            title="Open Settings"
          >
            <Settings className="w-3.5 h-3.5" />
            <span>Settings</span>
          </button>
        </div>

        {/* Scrollable Navigation Topics (Pure White Surface) */}
        <div className="flex-1 overflow-y-auto p-4 space-y-5 bg-white">
          {/* PRIMARY MANDATORY NAVIGATION (Profile, Live Map, Route Planner, Smart Transit) */}
          <div className="space-y-1.5">
            <div className="text-[11px] font-mono uppercase font-bold text-blue-700 tracking-wider px-2 mb-1 flex items-center justify-between">
              <span>Main Navigation</span>
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
            </div>

            <nav className="space-y-1">
              {coreTopics.map((item) => {
                const isActive = location.pathname === item.to;
                return (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    onClick={closeSidebar}
                    className={`flex items-center justify-between p-2.5 rounded-2xl text-xs transition-all ${
                      isActive
                        ? 'bg-blue-600 text-white font-bold shadow-md shadow-blue-600/25'
                        : 'text-slate-800 hover:bg-blue-50/70 hover:text-blue-900 bg-white border border-slate-100'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`p-1.5 rounded-xl ${isActive ? 'bg-white/20 text-white' : 'bg-slate-50'}`}>
                        {item.icon}
                      </div>
                      <div>
                        <div className="font-bold text-xs">{item.label}</div>
                        <div className={`text-[10px] ${isActive ? 'text-white/80' : 'text-slate-500'}`}>
                          {item.sub}
                        </div>
                      </div>
                    </div>
                    {isActive ? (
                      <CheckCircle2 className="w-4 h-4 text-white shrink-0" />
                    ) : (
                      <ChevronRight className="w-4 h-4 text-slate-400 shrink-0" />
                    )}
                  </NavLink>
                );
              })}

              {/* SETTINGS ITEM (Mandatory) */}
              <button
                type="button"
                onClick={handleOpenSettings}
                className="w-full flex items-center justify-between p-2.5 rounded-2xl text-xs transition-all text-slate-800 hover:bg-blue-50/70 hover:text-blue-900 bg-white border border-slate-100 cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <div className="p-1.5 rounded-xl bg-slate-50 text-blue-600">
                    <Settings className="w-5 h-5" />
                  </div>
                  <div className="text-left">
                    <div className="font-bold text-xs">Settings</div>
                    <div className="text-[10px] text-slate-500">Dark/Light Mode, Languages, Voice STT</div>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-400 shrink-0" />
              </button>
            </nav>
          </div>

          {/* EXTENDED CITIZEN MODULES */}
          <div className="space-y-1.5 pt-1 border-t border-slate-100">
            <div className="text-[11px] font-mono uppercase font-bold text-slate-500 tracking-wider px-2 mb-1">
              Urban Mobility Services
            </div>

            <nav className="space-y-0.5">
              {extendedCitizenTopics.map((item) => {
                const isActive = location.pathname === item.to;
                return (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    onClick={closeSidebar}
                    className={`flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium transition-all ${
                      isActive
                        ? 'bg-blue-600 text-white font-bold shadow-sm'
                        : 'text-slate-700 hover:bg-slate-50 hover:text-blue-900'
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

          {/* ADMIN OPERATIONS (If Admin) */}
          {(isAdmin || user?.role === 'admin') && (
            <div className="space-y-1.5 pt-2 border-t border-slate-100">
              <div className="text-[11px] font-mono uppercase font-bold text-indigo-700 tracking-wider px-2 mb-1 flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  <Lock className="w-3 h-3 text-indigo-600" /> Admin Command Operations
                </span>
                <span className="text-[9px] px-1.5 py-0.5 rounded-md bg-purple-100 text-purple-800 font-bold">
                  ADMIN
                </span>
              </div>

              <nav className="space-y-0.5">
                {adminTopics.map((item) => {
                  const isActive = location.pathname === item.to;
                  return (
                    <NavLink
                      key={item.to}
                      to={item.to}
                      onClick={closeSidebar}
                      className={`flex items-center justify-between px-3 py-1.5 rounded-xl text-xs font-medium transition-all ${
                        isActive
                          ? 'bg-indigo-600 text-white font-bold shadow-sm'
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
          )}
        </div>

        {/* Drawer Footer with User Session & MANDATORY LOG OUT BUTTON (Solid White) */}
        <div className="p-4 border-t border-slate-200 bg-white">
          {user ? (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-full bg-blue-600 text-white font-bold flex items-center justify-center text-xs shadow-md">
                    {user.full_name?.charAt(0) || user.email?.charAt(0) || 'U'}
                  </div>
                  <div>
                    <div className="text-xs font-bold text-slate-900 truncate max-w-[150px]">
                      {user.full_name || 'SMARTMOVE User'}
                    </div>
                    <div className="text-[10px] text-blue-600 font-mono">
                      {user.role === 'admin' ? '🛡️ Administrator' : '👤 Verified Commuter'}
                    </div>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleLogout}
                  className="px-3 py-1.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer shadow-sm"
                  title="Log Out of SMARTMOVE"
                >
                  <LogOut className="w-3.5 h-3.5 text-rose-600" />
                  <span>Log Out</span>
                </button>
              </div>

              {/* Explicit Full-Width Log Out Bar */}
              <button
                type="button"
                onClick={handleLogout}
                className="w-full py-2.5 rounded-xl bg-slate-900 hover:bg-rose-600 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-sm transition-all cursor-pointer"
              >
                <LogOut className="w-4 h-4" />
                <span>Log Out of Account</span>
              </button>
            </div>
          ) : (
            <div className="space-y-2">
              <button
                type="button"
                onClick={() => {
                  closeSidebar();
                  navigate('/auth/signin');
                }}
                className="w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md shadow-blue-500/25 transition-all text-center cursor-pointer"
              >
                Sign In with Gmail OTP
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Dedicated Settings Modal for Dark/Light Mode, Languages, and Voice STT */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
      />
    </>
  );
};

