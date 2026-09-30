// Supabase Edge Function: send-sms-otp
// Dispatches real-time cellular SMS directly to physical mobile phones via Fast2SMS Gateway
// Logs dispatch telemetry in Supabase 'realtime_otps' table

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

declare const Deno: any;

serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { phoneNumber, otpCode } = await req.json();

    if (!phoneNumber) {
      return new Response(JSON.stringify({ success: false, error: "Phone number is required." }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 400,
      });
    }

    // Clean Indian mobile number (Extract 10 digits)
    const digitsOnly = phoneNumber.replace(/\D/g, "");
    const clean10Digits = digitsOnly.length > 10 ? digitsOnly.slice(-10) : digitsOnly;

    if (clean10Digits.length !== 10) {
      return new Response(JSON.stringify({
        success: false,
        error: "Please provide a valid 10-digit Indian mobile number."
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 400,
      });
    }

    // Generate or use provided 6-digit OTP
    const code = otpCode || String(Math.floor(100000 + Math.random() * 900000));
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000).toISOString();

    // Fast2SMS API Key from Edge Function secrets or environment
    const fast2smsKey = Deno.env.get("FAST2SMS_API_KEY");

    let smsDispatched = false;
    let gatewayResponse: any = null;

    if (fast2smsKey && fast2smsKey.length > 5) {
      // 1. Dispatch via Fast2SMS Quick OTP route
      try {
        const response = await fetch("https://www.fast2sms.com/dev/bulkV2", {
          method: "POST",
          headers: {
            "authorization": fast2smsKey,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            route: "otp",
            variables_values: code,
            numbers: clean10Digits,
          }),
        });

        gatewayResponse = await response.json();
        if (gatewayResponse && gatewayResponse.return === true) {
          smsDispatched = true;
        } else {
          // Try fallback Quick route if OTP route template has restrictions
          const fallbackRes = await fetch("https://www.fast2sms.com/dev/bulkV2", {
            method: "POST",
            headers: {
              "authorization": fast2smsKey,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              route: "q",
              message: `Your SMARTMOVE verification code is ${code}. Valid for 10 minutes.`,
              language: "english",
              flash: 0,
              numbers: clean10Digits,
            }),
          });
          gatewayResponse = await fallbackRes.json();
          if (gatewayResponse && gatewayResponse.return === true) {
            smsDispatched = true;
          }
        }
      } catch (smsErr: any) {
        console.error("[Fast2SMS] Cellular dispatch error:", smsErr);
        gatewayResponse = { error: smsErr.message };
      }
    } else {
      console.warn("[Fast2SMS] FAST2SMS_API_KEY not set in Edge Function secrets.");
    }

    // 2. Persist in Supabase 'realtime_otps' table
    const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? Deno.env.get("SUPABASE_ANON_KEY") ?? "";

    if (supabaseUrl && supabaseKey) {
      try {
        const supabase = createClient(supabaseUrl, supabaseKey);
        await supabase.from("realtime_otps").insert([
          {
            recipient: `+91${clean10Digits}`,
            otp_code: code,
            channel: "sms",
            status: "pending",
            attempts: 0,
            metadata: {
              gateway: "Fast2SMS",
              cellular_dispatched: smsDispatched,
              gateway_response: gatewayResponse,
            },
            expires_at: expiresAt,
            created_at: new Date().toISOString(),
          },
        ]);
      } catch (dbErr) {
        console.error("[DB] Error recording OTP:", dbErr);
      }
    }

    return new Response(JSON.stringify({
      success: true,
      cellularDispatched: smsDispatched,
      recipient: `+91${clean10Digits}`,
      otpCode: code,
      expiresAt,
      message: smsDispatched
        ? `Real SMS successfully delivered to mobile +91 ${clean10Digits}`
        : `OTP generated and synced to Supabase database. Add FAST2SMS_API_KEY to enable direct carrier SMS.`,
      gatewayResponse,
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (err: any) {
    return new Response(JSON.stringify({ success: false, error: err.message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
