import nodemailer from 'nodemailer';

export default async function handler(req, res) {
  // CORS configuration
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: 'Method not allowed' });
  }

  try {
    let body = req.body;
    if (typeof body === 'string') {
      try {
        body = JSON.parse(body);
      } catch (e) {
        // ignore parse error
      }
    }

    const { to, otpCode } = body || {};

    if (!to || !otpCode) {
      return res.status(400).json({
        success: false,
        error: 'Missing required parameters: to and otpCode',
      });
    }

    const user = process.env.VITE_GMAIL_USER || process.env.GMAIL_USER || 'hajeesh6382@gmail.com';
    const pass = (
      process.env.VITE_GMAIL_APP_PASSWORD ||
      process.env.GMAIL_APP_PASSWORD ||
      'ftphxknjhtqenguz'
    ).replace(/\s+/g, '');

    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user,
        pass,
      },
    });

    const info = await transporter.sendMail({
      from: `"SMARTMOVE Team" <${user}>`,
      to,
      subject: `Your SMARTMOVE Verification Code`,
      text: `Hello,\n\nYour SMARTMOVE verification code is ${otpCode}.\n\nUse this code to verify your account. This code will expire in 10 minutes.\n\nFor your security, please do not share this code with anyone. If you did not request this code, you can safely ignore this email.\n\nSMARTMOVE Team\nAI-Powered Smart & Sustainable Urban Mobility`,
      html: `
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background: #ffffff; color: #1e293b; padding: 32px 24px; max-width: 540px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 16px; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);">
          <div style="margin-bottom: 24px;">
            <p style="font-size: 15px; color: #1e293b; line-height: 1.6; margin: 0 0 16px 0;">Hello,</p>
            <p style="font-size: 15px; color: #1e293b; line-height: 1.6; margin: 0 0 16px 0;">
              Your SMARTMOVE verification code is <strong style="font-size: 20px; color: #0284c7; font-family: monospace; letter-spacing: 2px;">${otpCode}</strong>.
            </p>
            <div style="background: #f0f9ff; border: 1px solid #bae6fd; border-radius: 12px; padding: 20px; text-align: center; margin: 24px 0;">
              <span style="font-size: 38px; font-weight: 800; letter-spacing: 8px; color: #0369a1; font-family: 'Courier New', Courier, monospace; display: block;">
                ${otpCode}
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
      `,
    });

    console.log(`[send-gmail-otp] Successfully delivered OTP ${otpCode} to ${to} (Message ID: ${info.messageId})`);
    return res.status(200).json({
      success: true,
      message: `Verification code successfully sent to ${to}`,
      messageId: info.messageId,
    });
  } catch (error) {
    console.error('[send-gmail-otp] Exception sending email:', error);
    return res.status(500).json({
      success: false,
      error: error.message || 'Failed to dispatch email',
    });
  }
}
