// SMARTMOVE Google Maps JavaScript API Loader
// Dynamically, safely, and robustly loads Google Maps JS API with Places, Geometry, and Marker libraries
// Includes fallback polling, timeout safeguard, and gm_authFailure interception.

let loadPromise: Promise<typeof google.maps> | null = null;
let loadedKey: string | null = null;

export function loadGoogleMapsScript(apiKey: string): Promise<typeof google.maps> {
  if (typeof window === 'undefined') {
    return Promise.reject(new Error('Window is not defined'));
  }

  // Already loaded and Map constructor is available
  if ((window as any).google?.maps?.Map) {
    return Promise.resolve((window as any).google.maps);
  }

  if (!apiKey || apiKey.trim().length === 0 || apiKey.includes('YOUR_GOOGLE_MAPS_API_KEY')) {
    return Promise.reject(new Error('Google Maps API key is missing. Please configure VITE_GOOGLE_MAPS_API_KEY in .env'));
  }

  if (loadPromise && loadedKey === apiKey) {
    return loadPromise;
  }

  loadedKey = apiKey;
  loadPromise = new Promise((resolve, reject) => {
    // 12-second safeguard timeout to prevent hanging indefinitely
    const timeoutId = setTimeout(() => {
      if ((window as any).google?.maps?.Map) {
        resolve((window as any).google.maps);
      } else {
        loadPromise = null;
        reject(new Error('Google Maps loading timed out. Please check your network connection or Google Cloud API Key settings.'));
      }
    }, 12000);

    // Watch for Google Maps authentication failure (e.g. invalid key, billing, or referrer restriction)
    const prevAuthFailure = (window as any).gm_authFailure;
    (window as any).gm_authFailure = () => {
      clearTimeout(timeoutId);
      loadPromise = null;
      try {
        window.dispatchEvent(new CustomEvent('smartmove_google_maps_error'));
      } catch {}
      if (typeof prevAuthFailure === 'function') {
        try { prevAuthFailure(); } catch {}
      }
      reject(new Error('Google Maps API authentication failed or daily quota reached. Verify API activation in Google Cloud Console.'));
    };

    // Helper to check readiness
    const checkReady = (): boolean => {
      if ((window as any).google?.maps?.Map) {
        clearTimeout(timeoutId);
        resolve((window as any).google.maps);
        return true;
      }
      return false;
    };

    // Check if script tag is already in DOM
    const existingScript = document.querySelector('script[src*="maps.googleapis.com/maps/api/js"]');
    if (existingScript) {
      if (checkReady()) return;
      const pollInterval = setInterval(() => {
        if (checkReady()) {
          clearInterval(pollInterval);
        }
      }, 50);

      existingScript.addEventListener('error', () => {
        clearTimeout(timeoutId);
        clearInterval(pollInterval);
        loadPromise = null;
        reject(new Error('Failed to load Google Maps script from Google servers.'));
      });
      return;
    }

    // Create and inject script tag
    const script = document.createElement('script');
    script.src = `https://maps.googleapis.com/maps/api/js?key=${encodeURIComponent(
      apiKey
    )}&libraries=places,geometry&language=en&v=weekly`;
    script.async = true;
    script.defer = true;

    script.onload = () => {
      const pollInterval = setInterval(() => {
        if (checkReady()) {
          clearInterval(pollInterval);
        }
      }, 50);
    };

    script.onerror = () => {
      clearTimeout(timeoutId);
      loadPromise = null;
      reject(new Error('Failed to load Google Maps script from Google servers. Please check your network and API key.'));
    };

    document.head.appendChild(script);
  });

  return loadPromise;
}

export function isGoogleMapsLoaded(): boolean {
  return typeof window !== 'undefined' && !!(window as any).google?.maps?.Map;
}

