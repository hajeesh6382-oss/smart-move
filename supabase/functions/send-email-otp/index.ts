// Supabase Edge Function: send-email-otp
// Generates a 6-digit OTP, saves it with a 5-minute expiry, and sends it directly to Gmail using Resend or custom SMTP

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY") ?? "";
const SENDER_EMAIL = Deno.env.get("SENDER_EMAIL") ?? "SMARTMOVE <onboarding@resend.dev>";

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { email, type = "signup" } = await req.json();

    if (!email || !email.includes("@")) {
      return new Response(JSON.stringify({ error: "Valid email is required" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 400,
      });
    }

    // 1. Generate a random 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000).toISOString(); // 5 minutes

    const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";
    const supabase = createClient(supabaseUrl, supabaseKey);

    // 2. Upsert OTP in otp_verifications table
    await supabase.from("otp_verifications").upsert({
      email: email.toLowerCase().trim(),
      otp_code: otp,
      expires_at: expiresAt,
      verified: false,
      created_at: new Date().toISOString(),
    });

    // 3. Dispatch Email via Resend if API key is provided
    let emailSent = false;
    let providerNote = "";

    if (RESEND_API_KEY) {
      const emailHtml = `
        <div style="font-family: Arial, sans-serif; max-width: 500px; margin: 0 auto; padding: 24px; background: #090d16; color: #f8fafc; border-radius: 16px; border: 1px solid #1e293b;">
          <div style="text-align: center; margin-bottom: 20px;">
            <h1 style="color: #06b6d4; margin: 0; font-size: 24px; font-weight: 800;">SMARTMOVE</h1>
            <p style="color: #94a3b8; font-size: 12px; margin-top: 4px;">AI-Enabled Smart & Sustainable Urban Mobility</p>
          </div>
          <div style="background: #0f172a; padding: 20px; border-radius: 12px; text-align: center; border: 1px solid #334155;">
            <p style="font-size: 14px; color: #cbd5e1; margin-bottom: 12px;">Your 6-Digit Verification Code is:</p>
            <div style="font-size: 32px; font-weight: 900; letter-spacing: 8px; color: #38bdf8; font-family: monospace; padding: 8px 0;">
              ${otp}
            </div>
            <p style="font-size: 12px; color: #64748b; margin-top: 12px;">Valid for 5 minutes. Never share this code with anyone.</p>
          </div>
          <p style="font-size: 11px; color: #64748b; text-align: center; margin-top: 20px;">
            If you did not request this code, you can safely ignore this email.
          </p>
        </div>
      `;

      const resendRes = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${RESEND_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          from: SENDER_EMAIL,
          to: [email],
          subject: `Your SMARTMOVE Verification Code: ${otp}`,
          html: emailHtml,
        }),
      });

      const resendData = await resendRes.json();
      if (resendRes.ok) {
        emailSent = true;
        providerNote = "Dispatched via Resend SMTP to Gmail";
      } else {
        providerNote = "Resend API error: " + (resendData.message || "Failed");
      }
    } else {
      providerNote = "Simulated delivery: Set RESEND_API_KEY secret for live Gmail delivery.";
    }

    return new Response(JSON.stringify({
      success: true,
      email,
      otp, // provided in response for instant local test verification
      emailSent,
      note: providerNote,
      expiresAt,
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (err: any) {
    return new Response(JSON.stringify({ error: err.message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
