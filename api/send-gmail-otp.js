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
      from: `"SMARTMOVE Authority" <${user}>`,
      to,
      subject: `Your SMARTMOVE Verification Code: ${otpCode}`,
      html: `
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #030712; color: #f8fafc; padding: 36px; border-radius: 20px; border: 1px solid #1e293b; max-width: 500px; margin: 0 auto;">
          <div style="text-align: center; margin-bottom: 24px;">
            <div style="display: inline-block; width: 48px; height: 48px; border-radius: 12px; background: #06b6d4; line-height: 48px; font-size: 24px; font-weight: 900; color: #030712;">S</div>
            <h1 style="color: #06b6d4; font-size: 24px; margin: 12px 0 4px; font-weight: 800; letter-spacing: -0.5px;">SMARTMOVE Mobility</h1>
            <p style="color: #94a3b8; font-size: 13px; margin: 0;">AI-Enabled Smart & Sustainable Urban Mobility Platform</p>
          </div>
          <div style="background: #0f172a; padding: 24px; border-radius: 16px; text-align: center; border: 1px solid #334155; margin-bottom: 24px;">
            <p style="color: #94a3b8; font-size: 13px; text-transform: uppercase; letter-spacing: 1px; margin-top: 0; margin-bottom: 12px; font-weight: 700;">One-Time Passcode</p>
            <div style="font-size: 42px; font-weight: 900; letter-spacing: 10px; color: #10b981; font-family: monospace; padding: 4px 0;">
              ${otpCode}
            </div>
            <p style="color: #64748b; font-size: 12px; margin-top: 12px; margin-bottom: 0;">Valid for 10 minutes • Never share this code</p>
          </div>
          <p style="color: #64748b; font-size: 12px; text-align: center; line-height: 1.5; margin: 0;">
            If you did not request this verification code, please ignore this email or contact city transit support.
          </p>
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
