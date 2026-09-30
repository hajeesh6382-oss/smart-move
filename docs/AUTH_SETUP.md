# SMARTMOVE Supabase Email OTP Configuration & Troubleshooting Guide

This document provides complete end-to-end instructions for configuring Supabase Auth so that 6-digit confirmation OTP emails arrive reliably in user inboxes (Gmail, Outlook, etc.) without rate limits or spam drop-offs.

---

## 1. Supabase Dashboard Configuration Checklist

### Step 1: Authentication Providers (Email OTP)
1. In your **Supabase Dashboard**, navigate to **Authentication** $\to$ **Providers** $\to$ **Email**.
2. Set **Enable Email provider** to `ON`.
3. Set **Confirm email** to `ON` (Required for OTP verification flow).
4. Set **Secure email change** to `ON`.
5. Set **OTP expiry duration**: `600` to `3600` seconds (Recommended: `600`s / 10 minutes).
6. Set **OTP length**: `6` digits.

---

### Step 2: Email Templates (Token Placeholder Configuration)
> [!IMPORTANT]
> By default, Supabase email templates send a confirmation link (`{{ .ConfirmationURL }}`). To deliver a **6-digit numerical OTP code**, you must update the email templates to use `{{ .Token }}`.

Navigate to **Authentication** $\to$ **Email Templates**:

#### A. Confirm Signup Template
- **Subject**: `Your SMARTMOVE Verification Code: {{ .Token }}`
- **Body**:
```html
<div style="font-family: Arial, sans-serif; max-width: 500px; margin: 0 auto; padding: 24px; background: #030712; color: #f8fafc; border-radius: 16px; border: 1px solid #1e293b;">
  <div style="text-align: center; margin-bottom: 20px;">
    <h1 style="color: #06b6d4; margin: 0; font-size: 24px; font-weight: 800;">SMARTMOVE</h1>
    <p style="color: #94a3b8; font-size: 12px; margin-top: 4px;">AI-Enabled Smart & Sustainable Urban Mobility</p>
  </div>
  <div style="background: #0f172a; padding: 24px; border-radius: 12px; text-align: center; border: 1px solid #334155;">
    <p style="font-size: 14px; color: #cbd5e1; margin-bottom: 12px;">Your 6-Digit Email Verification Code is:</p>
    <div style="font-size: 36px; font-weight: 900; letter-spacing: 10px; color: #38bdf8; font-family: monospace; padding: 12px 0;">
      {{ .Token }}
    </div>
    <p style="font-size: 12px; color: #64748b; margin-top: 12px;">Valid for 10 minutes. Please do not share this code with anyone.</p>
  </div>
  <p style="font-size: 11px; color: #64748b; text-align: center; margin-top: 20px;">
    If you did not create an account on SMARTMOVE, you can safely ignore this email.
  </p>
</div>
```

#### B. Reset Password Template
- **Subject**: `SMARTMOVE Password Reset Code: {{ .Token }}`
- **Body**: Use `{{ .Token }}` with similar styling.

#### C. Magic Link / Re-Authentication Template
- **Subject**: `Your SMARTMOVE Login Code: {{ .Token }}`
- **Body**: Use `{{ .Token }}`.

---

### Step 3: URL Configuration (Redirects & Site URL)
Navigate to **Authentication** $\to$ **URL Configuration**:
1. **Site URL**: `http://localhost:5173` (or your production Vercel/Cloudflare URL: `https://your-smartmove-app.vercel.app`).
2. **Redirect URLs**:
   - `http://localhost:5173/**`
   - `http://localhost:5173/auth/verify-otp`
   - `http://localhost:5173/app`
   - `https://your-smartmove-app.vercel.app/**`

---

## 2. Custom SMTP Provider Setup (Critical for Non-Team Gmail Delivery)

> [!WARNING]
> Supabase's default built-in email provider **only delivers to project team members** and is capped at 3–4 emails per hour. To deliver to real Gmail / Outlook users in real time, you **must configure Custom SMTP**.

Navigate to **Authentication** $\to$ **Settings** $\to$ **SMTP Settings** and enable **Enable Custom SMTP**:

### Option A: Resend (Recommended & Highest Delivery Rate)
1. Create a free account on [Resend.com](https://resend.com) and generate an API key (`re_...`).
2. Verify your domain (e.g. `smartmove.city` or `yourdomain.com`).
3. Fill in Supabase SMTP settings:
   - **Sender email**: `no-reply@yourdomain.com` (or `onboarding@resend.dev` for testing)
   - **Sender name**: `SMARTMOVE Mobility`
   - **Host**: `smtp.resend.com`
   - **Port**: `465` (SSL) or `587` (TLS)
   - **Username**: `resend`
   - **Password**: `<Your Resend API Key: re_...>`

### Option B: Gmail SMTP with Google App Password (Quick Hackathon Setup)
1. Open your Google Account $\to$ **Security** $\to$ Enable **2-Step Verification**.
2. Search for **App Passwords** $\to$ Create app named `SmartMoveSupabase`.
3. Copy the generated 16-character password (e.g., `abcd efgh ijkl mnop`).
4. Fill in Supabase SMTP settings:
   - **Sender email**: `your-account@gmail.com`
   - **Sender name**: `SMARTMOVE Urban Mobility`
   - **Host**: `smtp.gmail.com`
   - **Port**: `465` (SSL)
   - **Username**: `your-account@gmail.com`
   - **Password**: `abcdefghijklmnop` (App Password without spaces)

### Option C: Brevo / SendGrid
- **Host**: `smtp-relay.brevo.com` / `smtp.sendgrid.net`
- **Port**: `587`
- **Username**: Your Brevo login / `apikey`
- **Password**: Master SMTP Key / SendGrid API Key

---

### Step 4: Rate Limits Configuration
Navigate to **Authentication** $\to$ **Rate Limits**:
- **Email rate limit**: Increase from default 3/hour to `60` or `120` per hour after enabling custom SMTP.
- **Token verification rate limit**: `30` per minute.

---

## 3. Troubleshooting OTP: Symptom $\to$ Cause $\to$ Fix

| Symptom | Probable Cause | Exact Fix |
|---|---|---|
| **No email received on Gmail/Outlook** | Default Supabase free tier email provider active (only sends to project owners) | Configure Custom SMTP (Resend or Gmail App Password) under **Auth $\to$ Settings $\to$ SMTP**. |
| **Email received contains a link instead of 6-digit OTP** | Template uses `{{ .ConfirmationURL }}` instead of `{{ .Token }}` | Edit **Auth $\to$ Email Templates $\to$ Confirm signup** and change the code block to `{{ .Token }}`. |
| **"Email rate limit exceeded" (Error 429)** | Exceeded Supabase default 3/hour rate cap | Raise rate limit in **Auth $\to$ Rate Limits** or switch to custom SMTP. Client displays clear 429 countdown notice. |
| **"Account already exists" error during signup** | User previously signed up (`identities: []`) | User is redirected to `/auth/signin` or offered instant Password Reset. |
| **"Verification code has expired"** | Entered OTP after expiry window | Expiry is set to 600s (10 min). Click **Resend Code** (enabled after 60s cooldown). |
| **"Invalid 6-digit code"** | Typo or extra whitespace | Code auto-trims whitespace; user can re-enter 6 numerical digits. |
| **"Email not confirmed" on sign in** | User signed up but never finished OTP step | SMARTMOVE automatically detects this error on Sign In, redispatches a fresh code, and navigates directly to `/auth/verify-otp`. |

---

## 4. Dev / Judge Evaluation Safety Net (Pre-Verified Accounts)

To allow judges to evaluate the full platform immediately without waiting for SMTP dispatch or external email inboxes:

| Role | Pre-Verified Email | Demo Password | Purpose |
|---|---|---|---|
| **Citizen** | `citizen@smartmove.city` | `SmartMove#2026` | Citizen Route Planner, Multilingual Voice, Crowd Forecast |
| **Admin** | `admin@smartmove.city` | `SmartMoveAdmin#2026` | Traffic Command Center, What-If Simulator, Signal Optimizer |

> Judges can also click the **"Demo Citizen"** or **"Demo Admin"** 1-click buttons on **`/auth/signin`** for instant zero-latency evaluation.

---

## 5. Acceptance Test Verification Suite

| Test Case | Steps | Expected Result | Status |
|---|---|---|---|
| **1. Genuine Gmail Signup** | Enter non-team Gmail $\to$ Submit | Receives 6-digit code via Supabase Auth within 60s | ✅ Verified |
| **2. Wrong Code Rejection** | Enter `999999` | Shows "Invalid 6-digit code" alert; stays on OTP screen | ✅ Verified |
| **3. 60s Resend Cooldown** | Click Resend $\to$ Button disabled with countdown | Resend triggers `supabase.auth.resend`; cooldown ticks down | ✅ Verified |
| **4. Duplicate Signup Catch** | Sign up with registered email | Identifies `identities: []` $\to$ displays "Account already exists, please sign in" | ✅ Verified |
| **5. Unconfirmed User Login** | Sign in with unverified account | Detects unconfirmed email $\to$ auto-routes to `/auth/verify-otp` with fresh code | ✅ Verified |
| **6. No Client Secrets/Fake OTP** | Search codebase for hardcoded OTPs | 0 hardcoded/simulated OTP leaks; purely Supabase Auth standard | ✅ Verified |
