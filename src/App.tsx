// SMARTMOVE Main Router & App Core
// Configures routes for Landing, Auth, Citizen Dashboard, Admin Command Center, and Demo Mode

import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider, useAuth } from './hooks/useAuth';

// Layouts
import { CitizenLayout } from './layouts/CitizenLayout';
import { AdminLayout } from './layouts/AdminLayout';

// Public Pages
import { LandingPage } from './pages/LandingPage';
import { SignInPage } from './pages/auth/SignInPage';
import { SignUpPage } from './pages/auth/SignUpPage';
import { AdminSignInPage } from './pages/auth/AdminSignInPage';
import { AdminSignUpPage } from './pages/auth/AdminSignUpPage';
import { OtpVerifyPage } from './pages/auth/OtpVerifyPage';
import { DemoModePage } from './pages/DemoModePage';
import { RealtimeOtpNotification } from './components/ui/RealtimeOtpNotification';

// Citizen Pages
import { CitizenDashboard } from './pages/citizen/CitizenDashboard';
import { LiveMapPage } from './pages/citizen/LiveMapPage';
import { RoutePlannerPage } from './pages/citizen/RoutePlannerPage';
import { SmartTransitPage } from './pages/citizen/SmartTransitPage';
import { PredictiveParkingPage } from './pages/citizen/PredictiveParkingPage';
import { SafetyPage } from './pages/citizen/SafetyPage';
import { EmergencyPage } from './pages/citizen/EmergencyPage';
import { SustainabilityPage } from './pages/citizen/SustainabilityPage';
import { AlertsPage } from './pages/citizen/AlertsPage';
import { ProfilePage } from './pages/citizen/ProfilePage';
import { DynamicRoadPricingPage } from './pages/citizen/DynamicRoadPricingPage';

// Admin Pages
import { AdminDashboard } from './pages/admin/AdminDashboard';
import { PeakHourManagerPage } from './pages/admin/PeakHourManagerPage';
import { WhatIfSimulatorPage } from './pages/admin/WhatIfSimulatorPage';
import { SchedulesPage } from './pages/admin/SchedulesPage';
import { SignalsPage } from './pages/admin/SignalsPage';
import { EmergencyCorridorPage } from './pages/admin/EmergencyCorridorPage';
import { RecommendationsLogPage } from './pages/admin/RecommendationsLogPage';
import { ProvidersHealthPage } from './pages/admin/ProvidersHealthPage';
import { DataSourcesPanel } from './pages/admin/DataSourcesPanel';
import { AdminParkingControlPage } from './pages/admin/AdminParkingControlPage';
import { AdminRoadPricingPage } from './pages/admin/AdminRoadPricingPage';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 3,
      refetchOnWindowFocus: false,
    },
  },
});

// Citizen Route Guard: If logged in as admin, strictly redirect to /admin
const ProtectedCitizenRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  if (user && user.role === 'admin') {
    return <Navigate to="/admin" replace />;
  }
  return <>{children}</>;
};

// Admin Route Guard: Requires admin role; citizens redirect to /app, unauthenticated to /auth/admin-signin
const ProtectedAdminRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  if (!user) {
    return <Navigate to="/auth/admin-signin" replace />;
  }
  if (user.role !== 'admin') {
    return <Navigate to="/app" replace />;
  }
  return <>{children}</>;
};

export const App: React.FC = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <BrowserRouter>
          <RealtimeOtpNotification />
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<LandingPage />} />
            <Route path="/demo" element={<DemoModePage />} />
            <Route path="/auth/signin" element={<SignInPage />} />
            <Route path="/auth/signin/citizen" element={<SignInPage />} />
            <Route path="/auth/signin/admin" element={<AdminSignInPage />} />
            <Route path="/auth/admin-signin" element={<AdminSignInPage />} />
            <Route path="/auth/signup" element={<SignUpPage />} />
            <Route path="/auth/signup/citizen" element={<SignUpPage />} />
            <Route path="/auth/signup/admin" element={<AdminSignUpPage />} />
            <Route path="/auth/admin-signup" element={<AdminSignUpPage />} />
            <Route path="/auth/verify-otp" element={<OtpVerifyPage />} />

            {/* Citizen Application Routes - Restricted to Citizens */}
            <Route
              path="/app"
              element={
                <ProtectedCitizenRoute>
                  <CitizenLayout />
                </ProtectedCitizenRoute>
              }
            >
              <Route index element={<CitizenDashboard />} />
              <Route path="map" element={<LiveMapPage />} />
              <Route path="routes" element={<RoutePlannerPage />} />
              <Route path="road-pricing" element={<DynamicRoadPricingPage />} />
              <Route path="buses" element={<SmartTransitPage />} />
              <Route path="parking" element={<PredictiveParkingPage />} />
              <Route path="safety" element={<SafetyPage />} />
              <Route path="emergency" element={<EmergencyPage />} />
              <Route path="sustainability" element={<SustainabilityPage />} />
              <Route path="alerts" element={<AlertsPage />} />
              <Route path="profile" element={<ProfilePage />} />
            </Route>

            {/* Admin Command Center Routes */}
            <Route
              path="/admin"
              element={
                <ProtectedAdminRoute>
                  <AdminLayout />
                </ProtectedAdminRoute>
              }
            >
              <Route index element={<AdminDashboard />} />
              <Route path="road-pricing" element={<AdminRoadPricingPage />} />
              <Route path="parking-control" element={<AdminParkingControlPage />} />
              <Route path="peak-manager" element={<PeakHourManagerPage />} />
              <Route path="what-if" element={<WhatIfSimulatorPage />} />
              <Route path="schedules" element={<SchedulesPage />} />
              <Route path="signals" element={<SignalsPage />} />
              <Route path="emergency" element={<EmergencyCorridorPage />} />
              <Route path="recommendations" element={<RecommendationsLogPage />} />
              <Route path="providers" element={<ProvidersHealthPage />} />
              <Route path="data-sources" element={<DataSourcesPanel />} />
              <Route path="transit" element={<SmartTransitPage />} />
            </Route>

            {/* Fallback to Home */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </QueryClientProvider>
  );
};

export default App;
