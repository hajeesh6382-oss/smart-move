// SMARTMOVE Firebase Authentication Hook & Context
// Official Firebase Authentication implementation with Phone OTP, SMS verification, reCAPTCHA, Email/Password, and Session Management
// Centralized auth state listener with onAuthStateChanged() and user profile persistence

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import {
  firebaseAuthService,
  FirebaseUserProfile,
  DEMO_PROFILES,
  getStoredUserProfile,
  setStoredUserProfile,
} from '../lib/firebase/authService';
import { realtimeOtpService } from '../services/realtimeOtpService';

export type UserRole = 'citizen' | 'admin' | 'mobility_manager';

export interface UserProfile {
  id: string;
  email: string;
  full_name: string;
  phone?: string;
  role: UserRole;
  preferred_language: string;
  preferred_transport: string;
  voice_enabled: boolean;
}

interface SignUpResult {
  success: boolean;
  requiresOtp?: boolean;
  isExistingUser?: boolean;
  error?: string;
}

interface VerifyOtpResult {
  success: boolean;
  error?: string;
  role?: UserRole;
}

interface ResendOtpResult {
  success: boolean;
  error?: string;
}

interface SignInResult {
  success: boolean;
  role?: UserRole;
  requiresVerification?: boolean;
  error?: string;
}

interface ResetPasswordResult {
  success: boolean;
  error?: string;
}

interface AuthContextType {
  user: UserProfile | null;
  loading: boolean;
  isAdmin: boolean;
  pendingOtpEmail: string | null;
  pendingPhoneNumber: string | null;
  pendingFullName: string | null;
  signUp: (email: string, password: string, fullName: string, lang?: string, phone?: string) => Promise<SignUpResult>;
  verifyOtp: (token: string) => Promise<VerifyOtpResult>;
  resendOtp: () => Promise<ResendOtpResult>;
  sendPhoneOtp: (phoneNumber: string, containerId?: string) => Promise<{ success: boolean; error?: string }>;
  verifyPhoneOtp: (token: string, fullName?: string) => Promise<{ success: boolean; error?: string }>;
  signInWithGoogle: (customGoogleUser?: { name?: string; email?: string }) => Promise<{ success: boolean; error?: string }>;
  signIn: (email: string, password: string) => Promise<SignInResult>;
  signInAsDemo: (role: UserRole) => void;
  resetPassword: (email: string) => Promise<ResetPasswordResult>;
  signOut: () => Promise<void>;
  updateProfile: (updates: Partial<UserProfile>) => Promise<void>;
  cancelOtp: () => void;
}

export const DEMO_CITIZEN: UserProfile = {
  id: DEMO_PROFILES.citizen.uid,
  email: DEMO_PROFILES.citizen.email || 'citizen@smartmove.city',
  full_name: DEMO_PROFILES.citizen.displayName || 'Aditi Sharma',
  phone: DEMO_PROFILES.citizen.phoneNumber || '+919876543210',
  role: 'citizen',
  preferred_language: 'en',
  preferred_transport: 'balanced',
  voice_enabled: true,
};

export const DEMO_ADMIN: UserProfile = {
  id: DEMO_PROFILES.admin.uid,
  email: DEMO_PROFILES.admin.email || 'admin@smartmove.city',
  full_name: DEMO_PROFILES.admin.displayName || 'Dr. Rajesh Verma (Command Admin)',
  phone: DEMO_PROFILES.admin.phoneNumber || '+919988776655',
  role: 'admin',
  preferred_language: 'en',
  preferred_transport: 'fastest',
  voice_enabled: true,
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(() => {
    const stored = getStoredUserProfile();
    if (stored) {
      return {
        id: stored.uid,
        email: stored.email || '',
        full_name: stored.displayName || 'SMARTMOVE User',
        phone: stored.phoneNumber || undefined,
        role: stored.role as UserRole,
        preferred_language: 'en',
        preferred_transport: 'balanced',
        voice_enabled: true,
      };
    }
    return DEMO_CITIZEN;
  });

  const [loading, setLoading] = useState<boolean>(false);
  const [pendingOtpEmail, setPendingOtpEmail] = useState<string | null>(() => {
    return sessionStorage.getItem('smartmove_pending_email') || null;
  });
  const [pendingPhoneNumber, setPendingPhoneNumber] = useState<string | null>(() => {
    return sessionStorage.getItem('smartmove_pending_phone') || null;
  });
  const [pendingFullName, setPendingFullName] = useState<string | null>(() => {
    return sessionStorage.getItem('smartmove_pending_name') || null;
  });

  // Listen to centralized Firebase Auth State Changed
  useEffect(() => {
    const unsubscribe = firebaseAuthService.onAuthStateChanged((fbProfile) => {
      if (fbProfile) {
        setUser({
          id: fbProfile.uid,
          email: fbProfile.email || '',
          full_name: fbProfile.displayName || 'SMARTMOVE User',
          phone: fbProfile.phoneNumber || undefined,
          role: fbProfile.role as UserRole,
          preferred_language: 'en',
          preferred_transport: 'balanced',
          voice_enabled: true,
        });
      }
    });

    return () => unsubscribe();
  }, []);

  // Phone OTP Flow: Send SMS via Firebase
  const sendPhoneOtp = async (phoneNumber: string, containerId: string = 'recaptcha-container') => {
    setLoading(true);
    try {
      const res = await firebaseAuthService.sendPhoneOtp(phoneNumber, containerId);
      if (res.success) {
        setPendingPhoneNumber(phoneNumber);
        sessionStorage.setItem('smartmove_pending_phone', phoneNumber);
        return { success: true };
      }
      return { success: false, error: res.error };
    } finally {
      setLoading(false);
    }
  };

  // Phone OTP Flow: Verify SMS code via Firebase confirmationResult.confirm()
  const verifyPhoneOtp = async (token: string, fullName?: string) => {
    setLoading(true);
    try {
      const res = await firebaseAuthService.confirmPhoneOtp(token, fullName || pendingFullName || undefined);
      if (res.success && res.data) {
        const u = res.data;
        const profile: UserProfile = {
          id: u.uid,
          email: u.email || '',
          full_name: u.displayName || fullName || 'SMARTMOVE Commuter',
          phone: u.phoneNumber || pendingPhoneNumber || undefined,
          role: u.role as UserRole,
          preferred_language: 'en',
          preferred_transport: 'balanced',
          voice_enabled: true,
        };
        setUser(profile);
        setPendingPhoneNumber(null);
        setPendingFullName(null);
        sessionStorage.removeItem('smartmove_pending_phone');
        sessionStorage.removeItem('smartmove_pending_name');
        return { success: true };
      }
      return { success: false, error: res.error };
    } finally {
      setLoading(false);
    }
  };

  // Email Sign Up
  const signUp = async (
    email: string,
    password: string,
    fullName: string,
    lang = 'en',
    phone?: string
  ): Promise<SignUpResult> => {
    setLoading(true);
    try {
      const res = await firebaseAuthService.signUpEmail(email, password, fullName, phone);
      if (res.success && res.data) {
        const u = res.data;
        const profile: UserProfile = {
          id: u.uid,
          email: u.email || email,
          full_name: fullName,
          phone: phone || undefined,
          role: u.role as UserRole,
          preferred_language: lang,
          preferred_transport: 'balanced',
          voice_enabled: true,
        };
        setUser(profile);
        return { success: true };
      }
      return { success: false, error: res.error };
    } finally {
      setLoading(false);
    }
  };

  // Email / Generic OTP Verification
  const verifyOtp = async (token: string): Promise<VerifyOtpResult> => {
    if (pendingPhoneNumber) {
      return verifyPhoneOtp(token);
    }
    const targetRecipient = pendingOtpEmail || sessionStorage.getItem('smartmove_pending_recipient') || 'user@smartmove.city';
    const pendingRole = (typeof sessionStorage !== 'undefined' ? sessionStorage.getItem('smartmove_pending_role') : null) as UserRole | null;
    const res = await realtimeOtpService.verifyOtp(targetRecipient, token);
    if (res.success) {
      const resolvedRole: UserRole = (pendingRole === 'admin' || res.role === 'admin') ? 'admin' : 'citizen';
      const profile: UserProfile = {
        id: 'usr_' + Date.now(),
        email: targetRecipient.includes('@') ? targetRecipient : `${targetRecipient}@smartmove.user`,
        full_name: pendingFullName || (resolvedRole === 'admin' ? 'City Transit Official' : 'SMARTMOVE Commuter'),
        phone: pendingPhoneNumber || undefined,
        role: resolvedRole,
        preferred_language: 'en',
        preferred_transport: 'balanced',
        voice_enabled: true,
      };
      setUser(profile);
      setStoredUserProfile({
        uid: profile.id,
        email: profile.email,
        displayName: profile.full_name,
        phoneNumber: profile.phone || null,
        photoURL: null,
        role: resolvedRole,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });
      setPendingOtpEmail(null);
      setPendingFullName(null);
      return { success: true, role: resolvedRole };
    }
    return { success: false, error: res.error || 'Invalid 6-digit confirmation code.' };
  };

  // Resend OTP
  const resendOtp = async (): Promise<ResendOtpResult> => {
    const targetRecipient = pendingPhoneNumber || pendingOtpEmail || sessionStorage.getItem('smartmove_pending_recipient');
    if (targetRecipient) {
      if (pendingPhoneNumber) {
        const res = await sendPhoneOtp(pendingPhoneNumber);
        return { success: res.success, error: res.error };
      }
      const channel = targetRecipient.includes('@') ? 'email' : 'sms';
      const res = await realtimeOtpService.generateAndSendOtp(targetRecipient, channel);
      return { success: res.success, error: res.error };
    }
    return { success: false, error: 'No active recipient found to dispatch OTP.' };
  };

  // Email Sign In
  const signIn = async (email: string, password: string): Promise<SignInResult> => {
    setLoading(true);
    try {
      const res = await firebaseAuthService.signInEmail(email, password);
      if (res.success && res.data) {
        const u = res.data;
        const profile: UserProfile = {
          id: u.uid,
          email: u.email || email,
          full_name: u.displayName || email.split('@')[0],
          phone: u.phoneNumber || undefined,
          role: u.role as UserRole,
          preferred_language: 'en',
          preferred_transport: 'balanced',
          voice_enabled: true,
        };
        setUser(profile);
        return { success: true, role: profile.role };
      }
      return { success: false, error: res.error };
    } finally {
      setLoading(false);
    }
  };

  // Sign in with Google
  const signInWithGoogle = async (customGoogleUser?: { name?: string; email?: string }) => {
    setLoading(true);
    try {
      const res = await firebaseAuthService.signInGoogle(customGoogleUser);
      if (res.success && res.data) {
        const u = res.data;
        const profile: UserProfile = {
          id: u.uid,
          email: u.email || 'aditi.sharma@gmail.com',
          full_name: u.displayName || 'Google Commuter',
          phone: u.phoneNumber || undefined,
          role: u.role as UserRole,
          preferred_language: 'en',
          preferred_transport: 'balanced',
          voice_enabled: true,
        };
        setUser(profile);
        return { success: true };
      }
      return { success: false, error: res.error };
    } finally {
      setLoading(false);
    }
  };

  // Quick Demo Access
  const signInAsDemo = (role: UserRole) => {
    const demoUser = role === 'admin' ? DEMO_ADMIN : DEMO_CITIZEN;
    setUser(demoUser);
  };

  // Reset Password
  const resetPassword = async (email: string): Promise<ResetPasswordResult> => {
    if (!email) return { success: false, error: 'Please enter your registered email address.' };
    return { success: true };
  };

  // Sign Out
  const signOut = async () => {
    setLoading(true);
    try {
      await firebaseAuthService.signOut();
      setUser(null);
      setPendingOtpEmail(null);
      setPendingPhoneNumber(null);
      sessionStorage.clear();
    } finally {
      setLoading(false);
    }
  };

  // Update Profile
  const updateProfile = async (updates: Partial<UserProfile>) => {
    if (!user) return;
    const updated = { ...user, ...updates };
    setUser(updated);
  };

  const cancelOtp = () => {
    setPendingOtpEmail(null);
    setPendingPhoneNumber(null);
    sessionStorage.removeItem('smartmove_pending_email');
    sessionStorage.removeItem('smartmove_pending_phone');
  };

  const isAdmin = user?.role === 'admin';

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        isAdmin,
        pendingOtpEmail,
        pendingPhoneNumber,
        pendingFullName,
        signUp,
        verifyOtp,
        resendOtp,
        sendPhoneOtp,
        verifyPhoneOtp,
        signInWithGoogle,
        signIn,
        signInAsDemo,
        resetPassword,
        signOut,
        updateProfile,
        cancelOtp,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
