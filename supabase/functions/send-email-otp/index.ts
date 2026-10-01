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
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000).toISOString(); // 10 minutes

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
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background: #ffffff; color: #1e293b; padding: 32px 24px; max-width: 540px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 16px; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);">
          <div style="margin-bottom: 24px;">
            <p style="font-size: 15px; color: #1e293b; line-height: 1.6; margin: 0 0 16px 0;">Hello,</p>
            <p style="font-size: 15px; color: #1e293b; line-height: 1.6; margin: 0 0 16px 0;">
              Your SMARTMOVE verification code is <strong style="font-size: 20px; color: #0284c7; font-family: monospace; letter-spacing: 2px;">${otp}</strong>.
            </p>
            <div style="background: #f0f9ff; border: 1px solid #bae6fd; border-radius: 12px; padding: 20px; text-align: center; margin: 24px 0;">
              <span style="font-size: 38px; font-weight: 800; letter-spacing: 8px; color: #0369a1; font-family: 'Courier New', Courier, monospace; display: block;">
                ${otp}
              </span>
            </div>
            <p style="font-size: 14px; color: #334155; line-height: 1.6; margin: 0 0 16px 0;">
              Use this code to verify your account. This code will expire in 10 minutes.
            </p>
            <p style="font-size: 13px; color: #64748b; line-height: 1.6; margin: 0 0 24px 0;">
              For your security, please do not share this code with anyone. If you did not request this code, you can safely ignore this email.
            </p>
          </div>
          <div style="border-top: 1px solid #e2e8f0; padding-top: 20px;">
            <p style="font-size: 14px; font-weight: 700; color: #0f172a; margin: 0 0 4px 0;">SMARTMOVE Team</p>
            <p style="font-size: 12px; color: #64748b; margin: 0;">AI-Powered Smart & Sustainable Urban Mobility</p>
          </div>
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
          subject: `Your SMARTMOVE Verification Code`,
          text: `Hello,\n\nYour SMARTMOVE verification code is ${otp}.\n\nUse this code to verify your account. This code will expire in 10 minutes.\n\nFor your security, please do not share this code with anyone. If you did not request this code, you can safely ignore this email.\n\nSMARTMOVE Team\nAI-Powered Smart & Sustainable Urban Mobility`,
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
