// SMARTMOVE Citizen Application Layout
// Features top header with connection status, language switcher, live incident reporting, notification center, and voice assistant

import React, { useState } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../hooks/useAuth';
import { useRealtimeTable } from '../hooks/useRealtimeTable';
import { LiveBadge } from '../components/ui/LiveBadge';
import { LanguageSwitcher } from '../components/ui/LanguageSwitcher';
import { VoiceButton } from '../components/voice/VoiceButton';
import { AssistantPanel } from '../components/assistant/AssistantPanel';
import { AddIncidentModal } from '../components/ui/AddIncidentModal';
import { NotificationDrawer } from '../components/ui/NotificationDrawer';
import { ActiveIncidentBanner } from '../components/ui/ActiveIncidentBanner';
import { ThreeBarSidebar } from '../components/ui/ThreeBarSidebar';
import { SmartMoveLogo } from '../components/ui/SmartMoveLogo';
import { GlobalVoiceNarrator } from '../components/ui/GlobalVoiceNarrator';
import {
  Compass,
  MapPin,
  Route,
  Bus,
  SquareParking,
  ShieldAlert,
  Siren,
  Leaf,
  Bell,
  User,
  Shield,
  LogOut,
  PlayCircle,
  PlusCircle,
  AlertTriangle,
  Coins,
} from 'lucide-react';

export const CitizenLayout: React.FC = () => {
  const { t } = useTranslation();
  const { user, signOut, isAdmin } = useAuth();
  const navigate = useNavigate();
  const [isIncidentModalOpen, setIsIncidentModalOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);

  const { data: alerts } = useRealtimeTable('alerts');
  const unreadAlertsCount = (alerts || []).filter((a: any) => !a.read).length;

  const navItems = [
    { to: '/app', label: t('nav.dashboard', 'Dashboard'), icon: <Compass className="w-4 h-4 text-blue-600" /> },
    { to: '/app/map', label: t('nav.live_map', 'Live Map'), icon: <MapPin className="w-4 h-4 text-cyan-600" /> },
    { to: '/app/routes', label: t('nav.routes', 'Routes'), icon: <Route className="w-4 h-4 text-blue-600" /> },
    { to: '/app/road-pricing', label: t('nav.road_pricing', 'Road Pricing'), icon: <Coins className="w-4 h-4 text-amber-500" /> },
    { to: '/app/buses', label: t('nav.buses', 'Transit'), icon: <Bus className="w-4 h-4 text-blue-600" /> },
    { to: '/app/parking', label: t('nav.parking', 'Parking'), icon: <SquareParking className="w-4 h-4 text-indigo-600" /> },
    { to: '/app/safety', label: t('nav.safety', 'Safety'), icon: <ShieldAlert className="w-4 h-4 text-rose-500" /> },
    { to: '/app/emergency', label: t('nav.emergency', 'Emergency'), icon: <Siren className="w-4 h-4 text-red-600" /> },
    { to: '/app/sustainability', label: t('nav.sustainability', 'Sustainability'), icon: <Leaf className="w-4 h-4 text-emerald-600" /> },
  ];

  return (
    <div className="min-h-screen bg-white text-blue-950 flex flex-col font-sans">
      {/* Top Main Navbar */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-xl border-b border-blue-100 px-4 lg:px-8 py-3 shadow-md shadow-blue-500/5">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-3">
          {/* Left: 3-Bar Hamburger Menu & Animated Logo */}
          <div className="flex items-center gap-2 sm:gap-3">
            <ThreeBarSidebar />
            <div onClick={() => navigate('/app')} className="cursor-pointer">
              <SmartMoveLogo size="md" />
            </div>
          </div>

          {/* Center Navigation Links (Desktop) */}
          <nav className="hidden xl:flex items-center gap-1">
            {navItems.slice(0, 5).map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.to === '/app'}
                className={({ isActive }) =>
                  `px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all ${
                    isActive
                      ? 'bg-blue-600 text-white shadow-md shadow-blue-500/25 font-bold'
                      : 'text-blue-950 hover:text-blue-600 hover:bg-blue-50 font-medium'
                  }`
                }
              >
                <span className="shrink-0">{item.icon}</span>
                <span>{item.label}</span>
              </NavLink>
            ))}
          </nav>

          {/* Right Controls: Voice Narrator, Incident, Alerts, Language, Auth */}
          <div className="flex items-center gap-2 sm:gap-2.5">
            <GlobalVoiceNarrator />
            <LiveBadge />

            {/* Quick Report Live Incident Button */}
            <button
              type="button"
              onClick={() => setIsIncidentModalOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 text-xs font-bold transition-all shadow-sm cursor-pointer"
              title="Report Live Traffic Incident or Hazard"
            >
              <PlusCircle className="w-3.5 h-3.5 text-rose-600" />
              <span className="hidden sm:inline">Add Live Incident</span>
            </button>

            {/* Notification Bell with Badge */}
            <button
              type="button"
              onClick={() => setIsNotificationsOpen(true)}
              className="relative p-2 rounded-xl bg-white hover:bg-blue-50 text-blue-900 hover:text-blue-700 border border-blue-200 shadow-sm transition-colors cursor-pointer"
              title="Open Real-Time Mobility Notifications"
            >
              <Bell className="w-4 h-4 text-blue-700" />
              {unreadAlertsCount > 0 && (
                <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-rose-500 text-[10px] font-bold text-white shadow-lg">
                  {unreadAlertsCount}
                </span>
              )}
            </button>

            <LanguageSwitcher compact />

            {/* Admin Switcher for rapid demo evaluation */}


            {user ? (
              <div className="flex items-center gap-2 pl-2 border-l border-blue-200">
                <button
                  onClick={() => navigate('/app/profile')}
                  className="w-8 h-8 rounded-full bg-blue-100 border border-blue-300 flex items-center justify-center text-blue-950 text-xs font-bold hover:border-blue-600 transition-colors cursor-pointer"
                  title={user.full_name || user.email}
                >
                  {user.full_name ? user.full_name[0].toUpperCase() : 'U'}
                </button>
              </div>
            ) : (
              <button
                onClick={() => navigate('/auth/signin')}
                className="px-3.5 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md shadow-blue-500/20 transition-all cursor-pointer"
              >
                {t('buttons.sign_in', 'Sign In')}
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Main App Page Content */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8 mb-20 lg:mb-6">
        {/* Active Emergency / Critical Incident Banner */}
        <ActiveIncidentBanner />
        <Outlet />
      </main>

      {/* Mobile Bottom Navigation Bar with Prominent Mic Button */}
      <div className="fixed bottom-0 left-0 right-0 z-40 lg:hidden bg-white/95 backdrop-blur-xl border-t border-blue-100 px-3 py-2 flex items-center justify-around shadow-lg shadow-blue-500/10">
        <NavLink
          to="/app"
          end
          className={({ isActive }) =>
            `flex flex-col items-center gap-1 text-[10px] font-semibold transition-colors ${
              isActive ? 'text-blue-600 font-bold' : 'text-blue-900 hover:text-blue-600'
            }`
          }
        >
          <Compass className="w-5 h-5" />
          <span>{t('nav.dashboard', 'Home')}</span>
        </NavLink>

        <NavLink
          to="/app/routes"
          className={({ isActive }) =>
            `flex flex-col items-center gap-1 text-[10px] font-semibold transition-colors ${
              isActive ? 'text-blue-600 font-bold' : 'text-blue-900 hover:text-blue-600'
            }`
          }
        >
          <Route className="w-5 h-5" />
          <span>{t('nav.routes', 'Routes')}</span>
        </NavLink>

        {/* Center Prominent Voice Mic */}
        <div className="-mt-5">
          <VoiceButton />
        </div>

        <NavLink
          to="/app/road-pricing"
          className={({ isActive }) =>
            `flex flex-col items-center gap-1 text-[10px] font-semibold transition-colors ${
              isActive ? 'text-blue-600 font-bold' : 'text-blue-900 hover:text-blue-600'
            }`
          }
        >
          <Coins className="w-5 h-5" />
          <span>{t('nav.road_pricing', 'ERP Tolls')}</span>
        </NavLink>

        <button
          type="button"
          onClick={() => setIsNotificationsOpen(true)}
          className="relative flex flex-col items-center gap-1 text-[10px] font-semibold text-blue-900 hover:text-blue-600 cursor-pointer"
        >
          <Bell className="w-5 h-5" />
          {unreadAlertsCount > 0 && (
            <span className="absolute -top-1 right-2 w-2 h-2 rounded-full bg-rose-500" />
          )}
          <span>{t('nav.alerts', 'Alerts')}</span>
        </button>
      </div>

      {/* Add Incident Modal */}
      <AddIncidentModal
        isOpen={isIncidentModalOpen}
        onClose={() => setIsIncidentModalOpen(false)}
      />

      {/* Real-Time Notification Drawer */}
      <NotificationDrawer
        isOpen={isNotificationsOpen}
        onClose={() => setIsNotificationsOpen(false)}
      />

      {/* Floating Chat Assistant */}
      <AssistantPanel />
    </div>
  );
};
