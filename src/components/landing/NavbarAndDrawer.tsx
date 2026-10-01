import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Menu,
  X,
  Bell,
  User,
  Compass,
  MapPin,
  Coins,
  Settings,
  Sparkles,
  ArrowRight,
  Radio,
  CheckCircle2,
  Shield,
  Layers,
  Leaf,
  Navigation,
} from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';

interface NavbarAndDrawerProps {
  activeSection?: string;
  onNavigateSection?: (sectionId: string) => void;
}

export const NavbarAndDrawer: React.FC<NavbarAndDrawerProps> = ({
  activeSection = 'hero',
  onNavigateSection,
}) => {
  const navigate = useNavigate();
  const { user, signInAsDemo } = useAuth();
  const [isScrolled, setIsScrolled] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(3);

  // Monitor scroll for navbar resizing & blurring
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 30);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navItems = [
    { id: 'hero', label: 'Home', route: '/' },
    { id: 'live-map', label: 'Live Map', route: '/app/map' },
    { id: 'route-planner', label: 'Route Planner', route: '/app/routes' },
    { id: 'road-pricing', label: 'Road Pricing', route: '/app/road-pricing' },
    { id: 'transit', label: 'Transit Corridors', route: '/app/buses' },
  ];

  const handleNavClick = (item: typeof navItems[0]) => {
    if (item.id === 'hero') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }
    if (item.route) {
      if (item.route.startsWith('/app') && !user) {
        navigate('/auth/signin');
        return;
      }
      navigate(item.route);
    }
  };

  const handleLaunchApp = () => {
    if (!user) {
      navigate('/auth/signin');
      return;
    }
    if (user.role === 'admin') {
      navigate('/admin');
    } else {
      navigate('/app');
    }
  };

  return (
    <>
      {/* Floating Glass Navigation Bar */}
      <header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 px-4 sm:px-8 ${
          isScrolled ? 'py-2.5' : 'py-4 sm:py-5'
        }`}
      >
        <div
          className={`max-w-7xl mx-auto rounded-2xl sm:rounded-3xl transition-all duration-300 px-4 sm:px-6 py-2.5 flex items-center justify-between border ${
            isScrolled
              ? 'bg-slate-950/85 backdrop-blur-2xl border-cyan-500/30 shadow-2xl shadow-cyan-950/40'
              : 'bg-slate-900/60 backdrop-blur-xl border-white/10 shadow-lg shadow-black/30'
          }`}
        >
          {/* Logo with Animated Beacon */}
          <div
            onClick={() => {
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            className="flex items-center gap-3 cursor-pointer group"
          >
            <div className="relative">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center font-black font-display text-slate-950 text-xl shadow-lg shadow-cyan-500/25 group-hover:scale-105 transition-transform">
                S
              </div>
              <span className="absolute -top-1 -right-1 w-3 h-3 bg-emerald-400 rounded-full border-2 border-slate-950 animate-ping" />
              <span className="absolute -top-1 -right-1 w-3 h-3 bg-emerald-400 rounded-full border-2 border-slate-950" />
            </div>

            <div>
              <div className="flex items-center gap-2">
                <span className="font-black font-display tracking-tight text-lg sm:text-xl text-white group-hover:text-cyan-300 transition-colors">
                  SMARTMOVE
                </span>
                <span className="hidden sm:inline-block px-2 py-0.5 rounded-full bg-cyan-500/15 border border-cyan-500/30 text-cyan-300 text-[10px] font-mono font-bold tracking-wide">
                  AI MOBILITY
                </span>
              </div>
              <p className="text-[10px] text-slate-400 hidden md:block -mt-0.5">
                Intelligent Urban Flow Layer
              </p>
            </div>
          </div>

          {/* Desktop Navigation Links with Animated Underline */}
          <nav className="hidden lg:flex items-center gap-1 xl:gap-2">
            {navItems.map((item) => {
              const isActive = activeSection === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => handleNavClick(item)}
                  className={`relative px-3.5 py-1.5 rounded-xl text-xs font-semibold tracking-wide transition-all cursor-pointer ${
                    isActive
                      ? 'text-cyan-300 font-bold bg-cyan-500/10'
                      : 'text-slate-300 hover:text-white hover:bg-white/5'
                  }`}
                >
                  {item.label}
                  {isActive && (
                    <span className="absolute bottom-0 left-2 right-2 h-0.5 bg-gradient-to-r from-cyan-400 to-blue-500 rounded-full shadow-[0_0_8px_rgba(56,189,248,0.8)]" />
                  )}
                </button>
              );
            })}
          </nav>

          {/* Right Action Icons & CTAs */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Notification Bell with Badge */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setNotificationsOpen(!notificationsOpen)}
                className="p-2 sm:p-2.5 rounded-xl bg-slate-800/80 hover:bg-slate-700/80 border border-white/10 text-slate-300 hover:text-cyan-300 transition-colors relative cursor-pointer"
                title="Notifications"
              >
                <Bell className="w-4 h-4" />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 bg-cyan-500 text-slate-950 font-black text-[9px] rounded-full flex items-center justify-center animate-pulse">
                    {unreadCount}
                  </span>
                )}
              </button>

              {/* Notification Dropdown Flyout */}
              {notificationsOpen && (
                <div className="absolute right-0 mt-3 w-80 sm:w-96 rounded-2xl bg-slate-900/95 backdrop-blur-2xl border border-cyan-500/30 p-4 shadow-2xl shadow-black/80 z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                  <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
                      <h4 className="text-xs font-bold text-white uppercase tracking-wider">
                        Live Mobility Alerts
                      </h4>
                    </div>
                    <button
                      onClick={() => setUnreadCount(0)}
                      className="text-[10px] text-cyan-400 hover:underline cursor-pointer"
                    >
                      Clear All
                    </button>
                  </div>

                  <div className="mt-3 space-y-2.5 max-h-64 overflow-y-auto pr-1">
                    <div className="p-2.5 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-xs">
                      <div className="flex items-center justify-between text-cyan-300 font-bold mb-1">
                        <span>🟢 Green Wave Active</span>
                        <span className="text-[10px] text-slate-400">Just now</span>
                      </div>
                      <p className="text-slate-300 text-[11px] leading-tight">
                        North Expressway signal synchronization has cut travel delay by 24%.
                      </p>
                    </div>

                    <div className="p-2.5 rounded-xl bg-purple-500/10 border border-purple-500/20 text-xs">
                      <div className="flex items-center justify-between text-purple-300 font-bold mb-1">
                        <span>⚡ Dynamic ERP Adjustment</span>
                        <span className="text-[10px] text-slate-400">4m ago</span>
                      </div>
                      <p className="text-slate-300 text-[11px] leading-tight">
                        CBD Outer zone fee auto-adjusted to ₹18 to maintain free-flow target.
                      </p>
                    </div>

                    <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-xs">
                      <div className="flex items-center justify-between text-emerald-300 font-bold mb-1">
                        <span>🌱 Carbon Credit Earned</span>
                        <span className="text-[10px] text-slate-400">12m ago</span>
                      </div>
                      <p className="text-slate-300 text-[11px] leading-tight">
                        Metro feeder shuttle connection completed: +15 Eco Points credited.
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      setNotificationsOpen(false);
                      navigate('/app/alerts');
                    }}
                    className="w-full mt-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-cyan-300 text-xs font-bold text-center block transition-colors cursor-pointer"
                  >
                    View All City Feeds →
                  </button>
                </div>
              )}
            </div>

            {/* Profile Avatar Button */}
            <button
              onClick={() => {
                if (!user) signInAsDemo('citizen');
                navigate('/app/profile');
              }}
              className="p-1.5 sm:p-2 rounded-xl bg-slate-800/80 hover:bg-slate-700/80 border border-white/10 text-slate-300 hover:text-cyan-300 transition-colors flex items-center gap-2 cursor-pointer"
              title="Citizen Profile"
            >
              <div className="w-6 h-6 rounded-lg bg-gradient-to-tr from-cyan-500 to-indigo-600 flex items-center justify-center text-slate-950 font-bold text-xs">
                {(user?.full_name || (user as any)?.name || 'U').charAt(0).toUpperCase()}
              </div>
              <span className="text-xs font-semibold text-slate-300 hidden xl:inline">
                {(user?.full_name || (user as any)?.name || 'Citizen').split(' ')[0]}
              </span>
            </button>

            {/* Primary Action Button */}
            <button
              onClick={handleLaunchApp}
              className="hidden sm:inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-bold text-xs shadow-lg shadow-cyan-500/25 hover:shadow-cyan-500/40 hover:scale-105 transition-all cursor-pointer"
            >
              <span>Launch App</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>

            {/* Animated Menu Drawer Hamburger Button */}
            <button
              onClick={() => setDrawerOpen(true)}
              className="p-2 sm:p-2.5 rounded-xl bg-slate-800/80 hover:bg-slate-700/80 border border-white/10 text-cyan-300 transition-all cursor-pointer hover:border-cyan-500/40"
              aria-label="Open Menu Drawer"
            >
              <Menu className="w-5 h-5" />
            </button>
          </div>
        </div>
      </header>

      {/* Animated Full-Height Side Drawer Panel */}
      {drawerOpen && (
        <div className="fixed inset-0 z-50 flex justify-end">
          {/* Backdrop with Blur */}
          <div
            onClick={() => setDrawerOpen(false)}
            className="fixed inset-0 bg-slate-950/70 backdrop-blur-md transition-opacity duration-300 animate-in fade-in"
          />

          {/* Drawer Body Sliding in from Right */}
          <div className="relative w-full max-w-sm sm:max-w-md h-full bg-slate-950/95 border-l border-cyan-500/30 p-6 sm:p-8 flex flex-col justify-between shadow-2xl shadow-cyan-950/80 z-10 overflow-y-auto animate-in slide-in-from-right duration-300">
            <div>
              {/* Drawer Header */}
              <div className="flex items-center justify-between pb-6 border-b border-slate-800">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center font-black font-display text-slate-950 text-xl shadow-lg shadow-cyan-500/20">
                    S
                  </div>
                  <div>
                    <h3 className="text-base font-black font-display text-white tracking-tight">
                      SMARTMOVE
                    </h3>
                    <p className="text-[11px] text-cyan-400 font-mono">
                      Autonomous Urban Mobility
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => setDrawerOpen(false)}
                  className="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-400 hover:text-white transition-colors cursor-pointer"
                  aria-label="Close Drawer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* User Snapshot in Drawer */}
              <div className="mt-6 p-4 rounded-2xl bg-gradient-to-br from-cyan-950/40 to-slate-900/60 border border-cyan-500/20 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-cyan-500/20 border border-cyan-500/40 text-cyan-300 flex items-center justify-center font-bold">
                    <User className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-white">
                      {user?.full_name || (user as any)?.name || 'Citizen Guest'}
                    </h4>
                    <span className="text-[10px] text-emerald-400 flex items-center gap-1 font-mono">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                      Active Mobility Pass
                    </span>
                  </div>
                </div>
                <button
                  onClick={() => {
                    setDrawerOpen(false);
                    navigate('/app/profile');
                  }}
                  className="text-xs text-cyan-400 hover:underline font-semibold cursor-pointer"
                >
                  Profile
                </button>
              </div>

              {/* Menu Navigation Options (Prompt Section 5) */}
              <div className="mt-6 space-y-2">
                <span className="text-[11px] font-mono uppercase tracking-widest text-slate-400 font-bold px-2">
                  Navigation
                </span>

                {[
                  {
                    label: 'Profile',
                    sub: 'Commute preferences & pass',
                    icon: <User className="w-5 h-5 text-cyan-400" />,
                    path: '/app/profile',
                  },
                  {
                    label: 'Live Map',
                    sub: 'Real-time traffic & facility GIS',
                    icon: <MapPin className="w-5 h-5 text-emerald-400" />,
                    path: '/app/map',
                  },
                  {
                    label: 'Route Planner',
                    sub: 'Multi-modal AI trip generation',
                    icon: <Compass className="w-5 h-5 text-blue-400" />,
                    path: '/app/routes',
                  },
                  {
                    label: 'Road Pricing',
                    sub: 'Dynamic congestion tolls & ERP',
                    icon: <Coins className="w-5 h-5 text-amber-400" />,
                    path: '/app/road-pricing',
                  },
                  {
                    label: 'Smart Transit & Buses',
                    sub: 'Live rapid electric corridors',
                    icon: <Navigation className="w-5 h-5 text-purple-400" />,
                    path: '/app/buses',
                  },
                  {
                    label: 'Admin Command Center',
                    sub: 'City operations & signal sandbox',
                    icon: <Shield className="w-5 h-5 text-rose-400" />,
                    path: '/admin',
                  },
                ].map((item, idx) => (
                  <button
                    key={idx}
                    onClick={() => {
                      setDrawerOpen(false);
                      if (!user) {
                        navigate('/auth/signin');
                        return;
                      }
                      navigate(item.path);
                    }}
                    className="w-full p-3.5 rounded-2xl bg-slate-900/60 hover:bg-slate-800/80 border border-slate-800/80 hover:border-cyan-500/40 flex items-center justify-between text-left transition-all group cursor-pointer"
                  >
                    <div className="flex items-center gap-3.5">
                      <div className="p-2 rounded-xl bg-slate-800 border border-slate-700 group-hover:scale-110 group-hover:border-cyan-500/50 transition-all">
                        {item.icon}
                      </div>
                      <div>
                        <div className="text-sm font-bold text-white group-hover:text-cyan-300 transition-colors">
                          {item.label}
                        </div>
                        <div className="text-[11px] text-slate-400">
                          {item.sub}
                        </div>
                      </div>
                    </div>
                    <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-cyan-400 group-hover:translate-x-1 transition-all" />
                  </button>
                ))}
              </div>
            </div>

            {/* Drawer Bottom Actions */}
            <div className="pt-6 border-t border-slate-800 space-y-3">

              <button
                onClick={() => {
                  setDrawerOpen(false);
                  handleLaunchApp();
                }}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-cyan-500/20 transition-all cursor-pointer"
              >
                <span>Launch Citizen App</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
