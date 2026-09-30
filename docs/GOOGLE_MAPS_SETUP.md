# SMARTMOVE Google Maps Platform Integration Guide

This guide explains how to configure Google Maps Platform web APIs for SMARTMOVE to provide a real interactive Google Map base layer with Salem, Tamil Nadu coordinates and AI mobility telemetry.

---

## 1. Google Cloud Console Setup

### Step 1: Create a Google Cloud Project
1. Go to the [Google Cloud Console](https://console.cloud.google.com/).
2. Create a new project named **`smartmove-urban-mobility`**.
3. Link a Billing Account to the project (Google provides $200 free monthly credit for Maps Platform).

---

### Step 2: Enable Required APIs
Navigate to **APIs & Services** $\to$ **Library** and enable the following 3 APIs:

1. **Maps JavaScript API**: Renders the interactive vector/raster map, Map types, controls, markers, and dark theme styles.
2. **Places API (New) / Places Library**: Powers the floating search bar with debounced place autocomplete (Colleges, Hospitals, Bus stands, Railway station, Parking, etc.).
3. **Routes API**: Calculates real-time traffic-aware directions and multi-objective routing alternatives.

---

### Step 3: Create and Restrict Your API Key
1. Go to **APIs & Services** $\to$ **Credentials**.
2. Click **Create Credentials** $\to$ **API Key**.
3. Under **Application restrictions**, select **Websites (HTTP referrers)**:
   - `http://localhost:5173/*`
   - `https://your-smartmove-deployment.vercel.app/*`
4. Under **API restrictions**, select **Restrict key**:
   - Check **Maps JavaScript API**
   - Check **Places API**
   - Check **Routes API**
5. Save the key.

---

## 2. Environment Configuration

Add your key to your `.env` or `.env.local` file in the project root:

```env
# Google Maps JavaScript & Places API Key (Client-Safe / Referrer-Restricted)
VITE_GOOGLE_MAPS_API_KEY=AIzaSyYourActualGoogleMapsKeyHere

# Optional Map Provider Toggle (Default: google)
VITE_MAP_PROVIDER=google
```

> **Note**: You can also enter or update your Google Maps API key directly from the map interface using the **Key** icon on the top-right control stack. It is stored securely in your browser's `localStorage`.

---

## 3. Configurable Default City (Salem, Tamil Nadu)

All geographic landmarks, corridors, and junctions are centrally configured in [`src/config/map-config.ts`](file:///c:/Users/N.A.Hajeesh/.gemini/config/urban%20mobility/src/config/map-config.ts):

```typescript
export const DEFAULT_CITY = 'Salem, Tamil Nadu, India';
export const DEFAULT_LATITUDE = 11.6643;
export const DEFAULT_LONGITUDE = 78.1460;
export const DEFAULT_ZOOM = 14;
```

### Pre-Configured Salem Geographic Landmarks:
- **Junction A**: Five Roads Junction (`11.6643° N, 78.1460° E`)
- **Junction B**: Four Roads / New Bus Stand Cross (`11.6680° N, 78.1380° E`)
- **Junction C**: Old Bus Stand Cross (`11.6538° N, 78.1575° E`)
- **Junction D**: Hospital Link Road (`11.6580° N, 78.1510° E`)
- **Tech Campus**: Sona College of Technology (`11.6740° N, 78.1270° E`)
- **Central Bus Stand**: Salem MGR Integrated Bus Stand (`11.6690° N, 78.1390° E`)
- **Hospital**: Govt Mohan Kumaramangalam Medical College Hospital (`11.6580° N, 78.1510° E`)
- **Railway Station**: Salem Railway Junction (`11.6710° N, 78.1250° E`)

---

## 4. Layer Provenance & Transparency

SMARTMOVE clearly identifies the source of all map data:

| Map Layer | Data Source | Provenance Label | Description |
|---|---|---|---|
| **Google Basemap** | Google Maps JS API | `LIVE API DATA` | Real roads, satellite imagery, topography, and labels. |
| **Google Traffic Layer** | Google Maps Platform | `LIVE API DATA (Display Only)` | Official Google real-time traffic density. |
| **SMARTMOVE Congestion** | SMARTMOVE Simulation Engine | `SIMULATED DATA` | Predictive corridor congestion polylines with 15m/30m/60m time scrubbing. |
| **Smart Buses** | GPS Telemetry Simulation | `ESTIMATED VALUE` | Gliding bus marker with crowd occupancy rings. |
| **Parking Bays** | Smart Sensor Simulator | `SIMULATED DATA` | Available spots and 15-minute exhaustion forecast. |
| **Pedestrian Risk** | Accident & Density Modeling | `ESTIMATED VALUE` | Conflict risk zones near educational campuses and markets. |
| **Emergency Corridor** | AI Preemption Model | `SIMULATED DATA` | Recommended emergency ambulance green corridor to Govt Hospital. |
