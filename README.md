# SMARTMOVE: AI-Enabled Smart & Sustainable Urban Mobility
> **"MOVE SMARTER. LIVE BETTER."** — Predict urban mobility bottlenecks *before* they become traffic jams.

SMARTMOVE is an integrated **Urban Mobility Decision and Simulation Platform**. Rather than reacting after roads are gridlocked like traditional navigation systems, SMARTMOVE connects traffic flow, public transit, parking, traffic signals, pedestrian safety, emergency corridors, and environmental sustainability into one cohesive **Mobility Intelligence Layer** powered by **Google Gemini** and real-time multi-agent simulation.

---

## 🗺️ Real Map vs. Real Data: Provenance Architecture

| Layer | What it means | Source in SMARTMOVE |
|---|---|---|
| **Real Map** | Actual roads, junctions & geography | OpenStreetMap tiles via Leaflet |
| **Real-time Updates** | UI updates live when DB changes | Supabase Realtime (`postgres_changes`) |
| **Real Traffic** | Needs live sensors / Traffic API | Simulated by default; pluggable provider adapter |
| **Real Bus Location** | Needs actual GPS / GTFS-RT API | Simulated by default; pluggable GTFS-RT adapter |
| **Bus Overcrowding** | Passenger-counting or ticketing feeds | **Always simulated / estimated** |

> [!IMPORTANT]
> **Data Honesty Rule**: Real-time delivery is not the same as real-world data. Supabase Realtime pushes what is in the database, whether written by the simulator or a real feed. A green "LIVE" badge is never shown alongside simulated data — SMARTMOVE displays `🟠 SIMULATED LIVE`, `🔵 HYBRID`, or `🟢 LIVE API DATA` explicitly.

---

## 🏗️ System Architecture & Real-Time Flow

```
Admin Controls / Schedules ──► simulation_state
                                     │
           Edge Function "sim-tick" (every 3–5s; pg_cron + client trigger)
                                     │ recomputes city state + predictions + recommendations
                                     ▼
           Postgres DB ──────► Supabase Realtime (postgres_changes)
                ▲                    │
                │                    ▼
     Edge Function "assistant" ◄─── React UI (Citizen Dashboard & Admin Command)
   (Gemini + Grounded Tools)
```

---

## 🛠️ Technology Stack
- **Frontend**: Vite, React 19, TypeScript, Tailwind CSS v4, Lucide Icons, React Router v7, TanStack Query v5, Recharts, Canvas Confetti.
- **Design System**: Stitch Design System tokens defined in [`/src/config/design-tokens.ts`](file:///c:/Users/N.A.Hajeesh/.gemini/config/urban%20mobility/src/config/design-tokens.ts).
- **Map & GIS**: Interactive Leaflet & OpenStreetMap tiles (`© OpenStreetMap contributors`) with SVG fallback.
- **Backend**: Supabase (Postgres, Auth, Realtime Streams, TypeScript Edge Functions, `pg_cron`).
- **Pluggable Providers**: Located in [`/supabase/functions/_shared/providers/`](file:///c:/Users/N.A.Hajeesh/.gemini/config/urban%20mobility/supabase/functions/_shared/providers/):
  - `simulation` (Default reactive loop)
  - `traffic-live` (TomTom / HERE Flow API stub)
  - `bus-gtfs-rt` (GTFS-Realtime vehicle position stream stub)
  - `crowding-estimator` (Demand-based passenger crowding model)
- **AI Engine**: Pure deterministic modeling ([`/src/lib/ai/`](file:///c:/Users/N.A.Hajeesh/.gemini/config/urban%20mobility/src/lib/ai/)) + Google Gemini with function calling (tools).
- **Voice**: Web Speech API (`SpeechRecognition` & `speechSynthesis`) with BCP-47 regional voice support + audio fallback.
- **i18n**: `react-i18next` covering 10 Indian Regional Languages (English, हिन्दी, தமிழ், తెలుగు, ಕನ್ನಡ, മലയാളം, বাংলা, मराठी, ગુજરાતી, ਪੰਜਾਬੀ).

---

## 🧠 Documented Mathematical Formulas & Simulation Models

All mathematical functions in [`/src/lib/ai/formulas.ts`](file:///c:/Users/N.A.Hajeesh/.gemini/config/urban%20mobility/src/lib/ai/formulas.ts) are pure and unit-testable:

1. **Congestion Index (%)**:
   $$\text{Congestion} = \text{clamp}\left(\frac{\text{vehicle\_count}}{\text{road\_capacity}} \times \text{time\_multiplier} \times 100, 0, 100\right)$$

2. **Traffic Prediction (15 / 30 / 60 Min)**:
   $$\text{Predicted}_{15m} = \left(\text{Current} \times 0.7 + \text{Trend} \times 0.3 + \text{ScheduleSurge} \times 0.25\right) \times \text{SimVolume}$$

3. **Peak Mobility Demand Forecast**:
   Overlaps college and corporate departure schedules into 15-minute demand bins to detect severe congestion windows ($>4,500\text{ commuters/hr}$).

4. **Bus Occupancy & Delay**:
   $$\text{Occupancy} = \text{clamp}\left(\text{Current} + \text{BoardingRate} \times \text{Demand} - \text{Alighting} - \text{ExtraBuses} \times 12, 0, 100\right)$$
   $$\text{Delay (min)} = \text{BaseDelay} \times \text{CongestionFactor} - \text{ExtraBuses} \times 1.5$$

5. **Adaptive Signal Timing (Queue-Proportional Split)**:
   $$\text{GreenTime}_i = \text{clamp}\left(\frac{\text{QueueCount}_i}{\sum \text{QueueCounts}} \times \text{TotalCycleSec}, 15\text{s}, 70\text{s}\right)$$

6. **Pedestrian Hazard Risk Index (0–100)**:
   $$\text{RiskScore} = (\text{PedDensity} \times 0.35) + (\text{VehDensity} \times 0.35) + (\text{Speed} \times 0.30)$$
   *Bands: 🟢 Lower (<35), 🟡 Moderate (35–65), 🔴 Higher (>65).*

7. **CO₂ & Fuel Waste Estimation (ESTIMATED VALUE)**:
   $$\text{CO}_2\,(\text{kg/hr}) = \text{VehicleCount} \times \text{AvgTripKm} \times 0.120 \times (1 + 0.0075 \times \text{CongestionPct})$$
   $$\text{Fuel}\,(\text{L/hr}) = \text{VehicleCount} \times \text{AvgTripKm} \times 0.075 \times (1 + 0.0085 \times \text{CongestionPct})$$

---

## 🚀 Quick Start & Local Execution

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure Environment
```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-supabase-anon-key
```

### 3. Run Development Server
```bash
npm run dev
```
Open **`http://localhost:5173`** in your browser.

---

## 🎬 Judge-Facing 12-Step Demo Sequence (`/demo`)
Tap **"Run Peak-Hour Simulation"** to observe live state progression:
1. **16:45** — Baseline Normal Traffic (38% capacity)
2. **16:55** — NIT Campus Gate Opens (2,200 students enter network)
3. **17:00** — Vehicular Volume Rises across College Road (66% congestion)
4. **17:05** — AI Detects Inflow Anomaly & Triggers Advisory Alert
5. **17:10** — AI 15-Min Prediction flags severe 92% congestion
6. **17:12** — Bus Route 102 Hits 94% Overload (140+ passengers queued)
7. **17:14** — Campus Parking Reaches Exhaustion (Cruising traffic peaks)
8. **17:15** — Pedestrian Crosswalk Risk escalates to 78/100 (Higher)
9. **17:18** — Peak Emissions Spike to 565 kg CO₂/hr
10. **17:20** — AI Synthesizes 4 Coordinated Actions with "Why?" factors
11. **17:22** — Multi-Agency Coordination Executed (Shuttles + Green Wave + Staggering)
12. **17:30** — Optimized State Displayed: **BEFORE vs SIMULATED AFTER** (-52% congestion, -68% delay)

---

## 🔐 Demo Accounts for Judges
- **Demo Citizen**: `citizen@smartmove.city`
- **Demo Admin**: `admin@smartmove.city`

---

## ⚖️ Disclaimers & Compliance
- **Simulation Transparency**: Signal timings shown are AI recommendations for simulation. The application does not directly control public traffic signals.
- **Emergency Advice**: For physical emergencies, users are directed to dial **112** immediately.
- **Confidence Indicator**: Confidence scores are heuristic indicators and not scientifically calibrated values.

---

### PREDICT. CONNECT. OPTIMIZE. MOVE SMARTER.
