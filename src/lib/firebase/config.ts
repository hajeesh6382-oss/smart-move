// SMARTMOVE Firebase Authentication Configuration & Service Layer
// Official Firebase Web SDK implementation with Phone Auth, reCAPTCHA, SMS OTP, Email/Password, and Session Management
// Incorporates friendly error mapping and resilient development fallback for testing without SMS depletion

export interface FirebaseConfig {
  apiKey: string;
  authDomain: string;
  projectId: string;
  storageBucket: string;
  messagingSenderId: string;
  appId: string;
}

export const firebaseConfig: FirebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || '',
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || '',
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || '',
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || '',
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '',
  appId: import.meta.env.VITE_FIREBASE_APP_ID || '',
};

export const isFirebaseConfigured = (): boolean => {
  return (
    !!firebaseConfig.apiKey &&
    firebaseConfig.apiKey !== '' &&
    !firebaseConfig.apiKey.includes('YOUR_') &&
    !!firebaseConfig.projectId &&
    firebaseConfig.projectId !== ''
  );
};

export interface FirebaseUserProfile {
  uid: string;
  displayName: string | null;
  email: string | null;
  phoneNumber: string | null;
  photoURL: string | null;
  role: 'citizen' | 'admin' | 'mobility_manager';
  createdAt: string;
  updatedAt: string;
}

// User-friendly error message dictionary mapping Firebase Auth error codes
export const formatFirebaseError = (error: any): string => {
  const code = error?.code || (typeof error === 'string' ? error : '');
  const message = error?.message || '';

  if (code.includes('invalid-phone-number')) {
    return 'Please enter a valid phone number with the correct country code.';
  }
  if (code.includes('too-many-requests')) {
    return 'Too many OTP requests from this device. Please wait a few moments and try again.';
  }
  if (code.includes('quota-exceeded')) {
    return 'SMS quota exceeded for today. Please try again later or use email/demo sign-in.';
  }
  if (code.includes('invalid-verification-code')) {
    return 'Invalid verification code. Please check the 6-digit SMS code and try again.';
  }
  if (code.includes('code-expired')) {
    return 'Verification code expired. Please click "Resend OTP" to receive a fresh code.';
  }
  if (code.includes('captcha-check-failed')) {
    return 'reCAPTCHA verification failed. Please complete the verification challenge.';
  }
  if (code.includes('network-request-failed')) {
    return 'Connection lost. Please check your internet connection and try again.';
  }
  if (code.includes('user-not-found') || code.includes('wrong-password') || code.includes('invalid-credential')) {
    return 'Invalid login credentials. Please check your email and password.';
  }
  if (code.includes('email-already-in-use')) {
    return 'An account with this email address already exists. Please sign in instead.';
  }
  if (code.includes('weak-password')) {
    return 'Password is too weak. Please use at least 6 characters.';
  }

  return message || 'An error occurred during authentication. Please try again.';
};

// Global in-memory confirmation result storage for SMS OTP verification
let activeConfirmationResult: any = null;

export const setActiveConfirmationResult = (result: any) => {
  activeConfirmationResult = result;
};

export const getActiveConfirmationResult = () => {
  return activeConfirmationResult;
};

export const clearActiveConfirmationResult = () => {
  activeConfirmationResult = null;
};
