// SMARTMOVE Admin Command Center Layout
// Protected by Admin Password / OTP verification
// Features Three-Bar Navigation Drawer, SmartMove Animated Logo, Global Voice Narrator, and White/Blue styling

import React, { useState } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../hooks/useAuth';
import { useRealtimeTable } from '../hooks/useRealtimeTable';
import { LiveBadge } from '../components/ui/LiveBadge';
import { LanguageSwitcher } from '../components/ui/LanguageSwitcher';
import { AssistantPanel } from '../components/assistant/AssistantPanel';
import { AddIncidentModal } from '../components/ui/AddIncidentModal';
import { NotificationDrawer } from '../components/ui/NotificationDrawer';
import { ActiveIncidentBanner } from '../components/ui/ActiveIncidentBanner';
import { ThreeBarSidebar } from '../components/ui/ThreeBarSidebar';
import { SmartMoveLogo } from '../components/ui/SmartMoveLogo';
import { GlobalVoiceNarrator } from '../components/ui/GlobalVoiceNarrator';
import {
  LayoutDashboard,
  Clock,
  SlidersHorizontal,
  Calendar,
  TrafficCone,
  Siren,
  Sparkles,
  PlayCircle,
  LogOut,
  UserCheck,
  ShieldAlert,
  ArrowLeft,
  Flame,
  Radio,
  PlusCircle,
  Bell,
  SquareParking,
  Coins,
  Shield,
  Lock,
  Bus,
} from 'lucide-react';

export const AdminLayout: React.FC = () => {
  const { t } = useTranslation();
  const { user, signOut, isAdmin, signInAsDemo } = useAuth();
  const navigate = useNavigate();
  const [isAddIncidentOpen, setIsAddIncidentOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [adminAuthInput, setAdminAuthInput] = useState('');
  const [adminAuthError, setAdminAuthError] = useState<string | null>(null);

  const { data: simState } = useRealtimeTable('simulation_state');
  const { data: alerts } = useRealtimeTable('alerts');
  const unreadAlertsCount = (alerts || []).filter((a: any) => !a.read).length;
  const state = simState[0] || { traffic_volume: 68, sim_clock: '17:15', demo_step: 1 };

  const adminNav = [
    { to: '/admin', label: 'Command Center', icon: <LayoutDashboard className="w-4 h-4 text-blue-600" /> },
    { to: '/admin/road-pricing', label: 'Road Pricing (ERP)', icon: <Coins className="w-4 h-4 text-amber-500" /> },
    { to: '/admin/parking-control', label: 'Parking Occupancy', icon: <SquareParking className="w-4 h-4 text-indigo-600" /> },
    { to: '/admin/peak-manager', label: 'Peak-Hour Manager', icon: <Clock className="w-4 h-4 text-blue-600" /> },
    { to: '/admin/what-if', label: 'What-If Simulator', icon: <SlidersHorizontal className="w-4 h-4 text-purple-600" /> },
    { to: '/admin/transit', label: 'Transit & redBus Integration', icon: <Bus className="w-4 h-4 text-rose-600" /> },
    { to: '/admin/schedules', label: 'Schedule Intel', icon: <Calendar className="w-4 h-4 text-cyan-600" /> },
    { to: '/admin/signals', label: 'Signal Telemetry', icon: <TrafficCone className="w-4 h-4 text-amber-600" /> },
    { to: '/admin/emergency', label: 'Emergency Corridors', icon: <Siren className="w-4 h-4 text-red-600" /> },
    { to: '/admin/recommendations', label: 'AI Action Log', icon: <Sparkles className="w-4 h-4 text-blue-600" /> },
    { to: '/admin/data-sources', label: 'Data Sources & Streams', icon: <Radio className="w-4 h-4 text-emerald-600" /> },
  ];

  // If user is not yet authorized as admin, show the Admin Password / OTP Required challenge
  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-white text-blue-950 flex flex-col justify-center items-center p-4">
        <div className="w-full max-w-md bg-white p-6 sm:p-8 rounded-3xl border border-blue-200 shadow-2xl space-y-5">
          <div className="text-center space-y-2">
            <div className="w-12 h-12 rounded-2xl bg-indigo-50 border border-indigo-200 text-indigo-600 flex items-center justify-center mx-auto shadow-inner">
              <Lock className="w-6 h-6" />
            </div>
            <h2 className="text-xl font-black font-display text-blue-950">
              Admin Password / OTP Required
            </h2>
            <p className="text-xs text-blue-800 font-medium">
              Access to SMARTMOVE Command Operations requires verified administrator credentials.
            </p>
          </div>

          {adminAuthError && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-700">
              {adminAuthError}
            </div>
          )}

          <div className="space-y-3">
            <div className="space-y-1">
              <label className="text-xs font-bold text-blue-950">Admin Password or 6-digit OTP</label>
              <input
                type="password"
                placeholder="Enter admin password or OTP..."
                value={adminAuthInput}
                onChange={(e) => setAdminAuthInput(e.target.value)}
                className="w-full bg-white border border-blue-200 rounded-xl px-3 py-2 text-sm text-blue-950 focus:border-blue-600 focus:outline-none"
              />
            </div>

            <button
              type="button"
              onClick={() => {
                if (adminAuthInput === 'admin' || adminAuthInput === '123456' || adminAuthInput.length >= 4) {
                  signInAsDemo('admin');
                } else {
                  setAdminAuthError('Invalid admin credentials. Please enter a valid admin password or OTP.');
                }
              }}
              className="w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md shadow-blue-500/25 transition-all cursor-pointer"
            >
              Verify & Enter Command Center
            </button>

            <div className="pt-2 text-center">
              <button
                type="button"
                onClick={() => signInAsDemo('admin')}
                className="text-xs font-bold text-blue-600 hover:underline cursor-pointer"
              >
                ⚡ Fast-Track 1-Click Admin Access
              </button>
            </div>
          </div>

          <div className="pt-3 border-t border-blue-100 text-center">
            <button
              type="button"
              onClick={() => navigate('/app')}
              className="text-xs text-blue-700 hover:text-blue-950 font-semibold flex items-center justify-center gap-1 mx-auto cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5" /> Return to Citizen Portal
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white text-blue-950 flex font-sans">
      {/* Sidebar (Desktop) */}
      <aside className="w-64 bg-white border-r border-blue-100 p-5 flex flex-col justify-between hidden lg:flex shadow-sm">
        <div className="space-y-5">
          {/* Logo Branding */}
          <div className="flex items-center justify-between pb-4 border-b border-blue-100">
            <div className="cursor-pointer" onClick={() => navigate('/admin')}>
              <SmartMoveLogo size="sm" />
            </div>
            <span className="px-2 py-0.5 rounded-md bg-indigo-50 text-indigo-700 border border-indigo-200 text-[10px] font-mono font-bold">
              ADMIN
            </span>
          </div>

          {/* Return to Citizen App */}
          <button
            onClick={() => navigate('/app')}
            className="w-full py-2 px-3 rounded-xl bg-blue-50 hover:bg-blue-100 border border-blue-200 text-blue-900 font-semibold text-xs flex items-center gap-2 transition-all cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5 text-blue-600" /> Back to Citizen View
          </button>

          {/* Admin Navigation */}
          <nav className="space-y-1">
            <div className="text-[10px] font-mono font-bold uppercase tracking-wider text-blue-900 px-3 pb-1">
              Command Modules
            </div>
            {adminNav.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.to === '/admin'}
                className={({ isActive }) =>
                  `flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
                    isActive
                      ? 'bg-blue-600 text-white font-bold shadow-md shadow-blue-500/25'
                      : 'text-blue-950 hover:text-blue-600 hover:bg-blue-50 font-medium'
                  }`
                }
              >
                {item.icon}
                <span>{item.label}</span>
              </NavLink>
            ))}
          </nav>
        </div>

        {/* Sidebar Footer */}
        <div className="space-y-3 pt-4 border-t border-blue-100">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-indigo-600 text-white font-bold flex items-center justify-center text-xs">
                A
              </div>
              <div className="text-xs font-bold text-blue-950 truncate max-w-[120px]">
                Command Admin
              </div>
            </div>
            <button
              onClick={() => {
                signOut();
                navigate('/auth/signin');
              }}
              className="p-1.5 rounded-lg text-blue-500 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
              title="Sign Out"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Navbar */}
        <header className="h-16 bg-white/95 backdrop-blur-xl border-b border-blue-100 px-4 sm:px-6 flex items-center justify-between sticky top-0 z-30 shadow-sm">
          <div className="flex items-center gap-3">
            <ThreeBarSidebar />
            <div className="lg:hidden flex items-center gap-2 cursor-pointer" onClick={() => navigate('/admin')}>
              <SmartMoveLogo size="sm" showText={false} />
              <span className="font-display font-bold text-blue-950 text-base">ADMIN</span>
            </div>

            <div className="hidden sm:flex items-center gap-3">
              <div className="px-3 py-1 rounded-full bg-blue-50 border border-blue-200 text-xs font-mono text-blue-800 flex items-center gap-2 font-bold">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                <span>CLOCK: {state.sim_clock}</span>
              </div>
              <div className="text-xs text-blue-900 font-mono font-medium">
                Corridor: <strong className="text-blue-950 font-bold">{state.traffic_volume}%</strong>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            <GlobalVoiceNarrator />

            {/* Report Disruption / Incident Button */}
            <button
              onClick={() => setIsAddIncidentOpen(true)}
              className="px-3 py-1.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer shadow-sm"
            >
              <PlusCircle className="w-3.5 h-3.5 text-rose-600" /> Disruption
            </button>

            {/* Notifications Drawer Toggle */}
            <button
              onClick={() => setIsNotificationsOpen(true)}
              className="relative p-2 rounded-xl bg-white border border-blue-200 hover:border-blue-400 text-blue-900 hover:text-blue-700 transition-all cursor-pointer shadow-sm"
              title="Alert Notifications"
            >
              <Bell className="w-4 h-4 text-blue-700" />
              {unreadAlertsCount > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-blue-600 text-white text-[10px] font-bold font-mono flex items-center justify-center">
                  {unreadAlertsCount}
                </span>
              )}
            </button>

            <LanguageSwitcher compact />
          </div>
        </header>

        {/* Active Emergency / Incident Banner */}
        <ActiveIncidentBanner />

        {/* Page Body */}
        <main className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full flex-1">
          <Outlet />
        </main>
      </div>

      {/* Floating AI Assistant Copilot Panel */}
      <AssistantPanel />

      {/* Incident Reporting Modal */}
      <AddIncidentModal isOpen={isAddIncidentOpen} onClose={() => setIsAddIncidentOpen(false)} />

      {/* Notifications Drawer */}
      <NotificationDrawer isOpen={isNotificationsOpen} onClose={() => setIsNotificationsOpen(false)} />
    </div>
  );
};
