// SMARTMOVE Predictive High-Traffic Gmail Alert Service
// Automatically monitors corridors, predicts high congestion, and dispatches
// rich actionable Gmail alerts to both Citizen/User and Admin with re-routing suggestions
// and direct navigation link to the website.

import { cityStore } from '../lib/supabase/mockStore';

export interface TrafficAlertPayload {
  recipients?: string[];
  corridorName: string;
  roadName: string;
  congestionLevel: number;
  expectedDelayMin: number;
  predictedHorizon?: string;
  alternativeRoute?: string;
  timeSavedMin?: number;
  transitAlternative?: string;
  navigateUrl?: string;
}

export interface TrafficAlertRecord {
  id: string;
  timestamp: string;
  corridorName: string;
  congestionLevel: number;
  recipients: string[];
  status: 'sent' | 'failed';
  message: string;
}

const STORAGE_KEY_ALERTS_LOG = 'smartmove_traffic_alerts_log';
const STORAGE_KEY_AUTO_ALERTS = 'smartmove_traffic_auto_alerts_enabled';
const STORAGE_KEY_ADMIN_EMAIL = 'smartmove_admin_alert_email';

// In-memory cooldown map: corridorId -> lastTimestamp
const alertCooldownMap = new Map<string, number>();
const COOLDOWN_MS = 4 * 60 * 1000; // 4 minutes between automatic alerts per corridor

class TrafficAlertService {
  private defaultAdminEmail = 'hajeesh6382@gmail.com';

  /**
   * Returns current configured admin email
   */
  public getAdminAlertEmail(): string {
    if (typeof localStorage !== 'undefined') {
      return localStorage.getItem(STORAGE_KEY_ADMIN_EMAIL) || this.defaultAdminEmail;
    }
    return this.defaultAdminEmail;
  }

  /**
   * Sets custom admin alert email
   */
  public setAdminAlertEmail(email: string): void {
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem(STORAGE_KEY_ADMIN_EMAIL, email.trim().toLowerCase());
    }
  }

  /**
   * Returns whether automatic high-traffic alert dispatch is enabled
   */
  public isAutoAlertEnabled(): boolean {
    if (typeof localStorage !== 'undefined') {
      return localStorage.getItem(STORAGE_KEY_AUTO_ALERTS) !== 'false';
    }
    return true;
  }

  /**
   * Sets auto alert toggle
   */
  public setAutoAlertEnabled(enabled: boolean): void {
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem(STORAGE_KEY_AUTO_ALERTS, enabled ? 'true' : 'false');
    }
  }

  /**
   * Returns recent dispatched alerts log
   */
  public getAlertsLog(): TrafficAlertRecord[] {
    try {
      if (typeof localStorage !== 'undefined') {
        const raw = localStorage.getItem(STORAGE_KEY_ALERTS_LOG);
        return raw ? JSON.parse(raw) : [];
      }
    } catch {
      // ignore
    }
    return [];
  }

  /**
   * Saves record to alerts log
   */
  private saveAlertRecord(record: TrafficAlertRecord): void {
    try {
      if (typeof localStorage !== 'undefined') {
        const current = this.getAlertsLog();
        const updated = [record, ...current.slice(0, 24)];
        localStorage.setItem(STORAGE_KEY_ALERTS_LOG, JSON.stringify(updated));
      }
    } catch {
      // ignore
    }
  }

  /**
   * Dispatches high traffic predictive alert to both User and Admin via Gmail
   */
  public async dispatchHighTrafficAlert(payload: TrafficAlertPayload): Promise<{
    success: boolean;
    recipients: string[];
    message: string;
  }> {
    const adminEmail = this.getAdminAlertEmail();

    // Determine user email from storage
    let userEmail: string | null = null;
    try {
      const rawUser = localStorage.getItem('smartmove_firebase_profile');
      if (rawUser) {
        const parsed = JSON.parse(rawUser);
        userEmail = parsed.email || null;
      }
      if (!userEmail && typeof sessionStorage !== 'undefined') {
        userEmail = sessionStorage.getItem('smartmove_pending_recipient') || null;
      }
    } catch {
      // ignore
    }

    const recipientsSet = new Set<string>();
    if (adminEmail && adminEmail.includes('@')) {
      recipientsSet.add(adminEmail.toLowerCase().trim());
    }
    if (userEmail && userEmail.includes('@')) {
      recipientsSet.add(userEmail.toLowerCase().trim());
    }
    if (payload.recipients && Array.isArray(payload.recipients)) {
      payload.recipients.forEach((r) => {
        if (r && r.includes('@')) recipientsSet.add(r.toLowerCase().trim());
      });
    }

    // Default to at least one recipient if empty
    if (recipientsSet.size === 0) {
      recipientsSet.add('hajeesh6382@gmail.com');
    }

    const targetRecipients = Array.from(recipientsSet);

    // Site navigation URL pointing to Route Planner or Live Map
    const baseUrl = typeof window !== 'undefined' ? window.location.origin : 'https://smart-move-yg21.vercel.app';
    const navigateUrl = payload.navigateUrl || `${baseUrl}/routes`;

    const requestBody = {
      recipients: targetRecipients,
      corridorName: payload.corridorName,
      roadName: payload.roadName,
      congestionLevel: payload.congestionLevel,
      expectedDelayMin: payload.expectedDelayMin || Math.round((payload.congestionLevel / 100) * 25),
      predictedHorizon: payload.predictedHorizon || 'Next 15–30 minutes',
      alternativeRoute: payload.alternativeRoute || 'Periyakulam Bypass (Route 2 via NH-44)',
      timeSavedMin: payload.timeSavedMin || 16,
      transitAlternative: payload.transitAlternative || 'Theni Express Bus 101 (Dedicated Priority Lane)',
      navigateUrl,
    };

    try {
      const res = await fetch('/api/send-traffic-alert', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody),
      });

      if (res.ok) {
        const data = await res.json();

        // Also add in-app alert to cityStore
        cityStore.addAlert({
          title: `⚠️ High Traffic Predicted: ${payload.corridorName}`,
          message: `Congestion is forecast to reach ${payload.congestionLevel}%. Suggestion: Take ${requestBody.alternativeRoute} to save ~${requestBody.timeSavedMin} mins.`,
          severity: 'critical',
          category: 'traffic',
        });

        const record: TrafficAlertRecord = {
          id: 'alert_' + Date.now(),
          timestamp: new Date().toLocaleTimeString(),
          corridorName: payload.corridorName,
          congestionLevel: payload.congestionLevel,
          recipients: targetRecipients,
          status: 'sent',
          message: data.message || `Dispatched to ${targetRecipients.length} recipients`,
        };
        this.saveAlertRecord(record);

        return {
          success: true,
          recipients: targetRecipients,
          message: `Predictive High-Traffic alert dispatched to ${targetRecipients.join(' & ')}!`,
        };
      } else {
        const err = await res.text();
        return {
          success: false,
          recipients: targetRecipients,
          message: `Server returned ${res.status}: ${err}`,
        };
      }
    } catch (e: any) {
      console.warn('[TrafficAlertService] Network dispatch error:', e);
      return {
        success: false,
        recipients: targetRecipients,
        message: e.message || 'Network error dispatching alert',
      };
    }
  }

  /**
   * Automatic Monitor: Checks if corridor congestion is > 60% and dispatches alert with cooldown
   */
  public checkAndDispatchIfHighTraffic(
    corridorId: string,
    corridorName: string,
    roadName: string,
    congestionPct: number
  ): void {
    if (!this.isAutoAlertEnabled()) return;
    if (congestionPct <= 60) return; // Dispatches alert whenever traffic is above 60%

    const now = Date.now();
    const lastSent = alertCooldownMap.get(corridorId) || 0;
    if (now - lastSent < COOLDOWN_MS) {
      // Cooldown active
      return;
    }

    // Set cooldown
    alertCooldownMap.set(corridorId, now);

    // Compute alternative recommendations
    const altRoute = corridorName.includes('Theni')
      ? 'Periyakulam Bypass (Route 2 via NH-44)'
      : corridorName.includes('Periyakulam')
      ? 'Theni Old Bypass Arterial'
      : 'Madurai Outer Ring Road (Service Lane)';

    const timeSaved = Math.round(10 + (congestionPct - 60) * 0.4);

    this.dispatchHighTrafficAlert({
      corridorName,
      roadName,
      congestionLevel: congestionPct,
      expectedDelayMin: Math.round(12 + (congestionPct - 60) * 0.5),
      predictedHorizon: 'Next 15–30 minutes',
      alternativeRoute: altRoute,
      timeSavedMin: timeSaved,
      transitAlternative: 'Theni Express Bus 101 (Departs every 15 min)',
    }).then((res) => {
      console.log('[TrafficAlertService] Automatic High Traffic Alert Triggered (>60%):', res);
    });
  }
}

export const trafficAlertService = new TrafficAlertService();
