import nodemailer from 'nodemailer';

// Cached singleton pooled transporter
let cachedTransporter = null;

function getTransporter() {
  if (cachedTransporter) return cachedTransporter;
  const user = process.env.VITE_GMAIL_USER || process.env.GMAIL_USER || 'hajeesh6382@gmail.com';
  const pass = (
    process.env.VITE_GMAIL_APP_PASSWORD ||
    process.env.GMAIL_APP_PASSWORD ||
    'ftphxknjhtqenguz'
  ).replace(/\s+/g, '');

  cachedTransporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user,
      pass,
    },
    pool: true,
    maxConnections: 5,
    maxMessages: 100,
    rateLimit: 14,
  });
  return cachedTransporter;
}

export default async function handler(req, res) {
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
        // ignore
      }
    }

    const {
      recipients = [], // string or array of emails
      corridorName = 'Theni Highway Gantry (NH-85)',
      roadName = 'Madurai - Theni Expressway',
      congestionLevel = 82,
      expectedDelayMin = 22,
      predictedHorizon = 'Next 15–30 minutes',
      alternativeRoute = 'Periyakulam Bypass (Route 2 via NH-44)',
      timeSavedMin = 16,
      transitAlternative = 'Theni Express Bus 101 (Departs in 10 mins)',
      navigateUrl = 'https://smart-move-yg21.vercel.app/routes',
    } = body || {};

    const targetList = Array.isArray(recipients) ? recipients : [recipients];
    const cleanRecipients = targetList
      .map((r) => String(r || '').trim().toLowerCase())
      .filter((r) => r.includes('@'));

    if (cleanRecipients.length === 0) {
      // Default to admin email if none provided
      cleanRecipients.push('hajeesh6382@gmail.com');
    }

    const user = process.env.VITE_GMAIL_USER || process.env.GMAIL_USER || 'hajeesh6382@gmail.com';
    const transporter = getTransporter();

    const subject = `⚠️ High Traffic Alert: ${congestionLevel}% Congestion Predicted on ${corridorName}`;

    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>SMARTMOVE Predictive Traffic Alert</title>
      </head>
      <body style="margin: 0; padding: 24px; background-color: #030712; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #f8fafc;">
        <div style="max-width: 580px; margin: 0 auto; background: #0f172a; border: 1px solid rgba(239, 68, 68, 0.4); border-radius: 20px; overflow: hidden; box-shadow: 0 20px 40px rgba(0, 0, 0, 0.6);">
          
          <!-- Alert Header Banner -->
          <div style="background: linear-gradient(135deg, #991b1b 0%, #dc2626 50%, #ea580c 100%); padding: 24px 28px; text-align: left;">
            <div style="display: inline-block; background: rgba(0, 0, 0, 0.3); border: 1px solid rgba(255, 255, 255, 0.3); border-radius: 9999px; padding: 4px 12px; font-size: 11px; font-weight: bold; letter-spacing: 1px; text-transform: uppercase; color: #ffffff; margin-bottom: 8px;">
              🚨 AI PREDICTIVE TRAFFIC ADVISORY
            </div>
            <h1 style="margin: 0; font-size: 22px; font-weight: 900; color: #ffffff; line-height: 1.3;">
              High Traffic Surge Predicted Ahead
            </h1>
            <p style="margin: 6px 0 0 0; font-size: 13px; color: #fecaca;">
              Corridor: <strong>${corridorName}</strong> (${roadName})
            </p>
          </div>

          <!-- Alert Details Card -->
          <div style="padding: 24px 28px;">
            <p style="margin: 0 0 18px 0; font-size: 14px; line-height: 1.6; color: #cbd5e1;">
              SMARTMOVE AI predictive analytics detected an impending severe vehicle bottleneck on your monitored corridor. Traffic is projected to reach peak congestion within <strong>${predictedHorizon}</strong>.
            </p>

            <!-- Metrics Grid -->
            <table style="width: 100%; border-collapse: separate; border-spacing: 10px 0; margin-bottom: 22px;">
              <tr>
                <td style="width: 33%; background: #1e293b; border: 1px solid #334155; border-radius: 12px; padding: 14px; text-align: center;">
                  <div style="font-size: 10px; font-weight: bold; text-transform: uppercase; color: #94a3b8; margin-bottom: 4px;">Predicted Congestion</div>
                  <div style="font-size: 24px; font-weight: 900; color: #ef4444; font-family: monospace;">${congestionLevel}%</div>
                  <div style="font-size: 10px; color: #f87171; font-weight: bold;">CRITICAL SURGE</div>
                </td>
                <td style="width: 33%; background: #1e293b; border: 1px solid #334155; border-radius: 12px; padding: 14px; text-align: center;">
                  <div style="font-size: 10px; font-weight: bold; text-transform: uppercase; color: #94a3b8; margin-bottom: 4px;">Expected Delay</div>
                  <div style="font-size: 24px; font-weight: 900; color: #f59e0b; font-family: monospace;">+${expectedDelayMin}m</div>
                  <div style="font-size: 10px; color: #fbbf24; font-weight: bold;">ABOVE NORMAL</div>
                </td>
                <td style="width: 33%; background: #1e293b; border: 1px solid #334155; border-radius: 12px; padding: 14px; text-align: center;">
                  <div style="font-size: 10px; font-weight: bold; text-transform: uppercase; color: #94a3b8; margin-bottom: 4px;">Horizon Window</div>
                  <div style="font-size: 18px; font-weight: 900; color: #38bdf8; font-family: monospace; padding-top: 4px;">${predictedHorizon}</div>
                  <div style="font-size: 10px; color: #7dd3fc; font-weight: bold;">AI FORECAST</div>
                </td>
              </tr>
            </table>

            <!-- AI Suggestions Box -->
            <div style="background: rgba(14, 165, 233, 0.1); border: 1px solid rgba(56, 189, 248, 0.3); border-radius: 14px; padding: 18px; margin-bottom: 24px;">
              <div style="font-size: 12px; font-weight: 800; text-transform: uppercase; color: #38bdf8; letter-spacing: 0.5px; margin-bottom: 8px;">
                💡 Recommended Actionable Suggestions:
              </div>
              <ul style="margin: 0; padding-left: 20px; font-size: 13px; line-height: 1.7; color: #e2e8f0;">
                <li><strong>Recommended Alternate Route:</strong> Divert via <em>${alternativeRoute}</em> to save approximately <strong>~${timeSavedMin} minutes</strong>.</li>
                <li><strong>Public Transit Option:</strong> Switch to <em>${transitAlternative}</em> with dedicated green wave priority lanes.</li>
                <li><strong>Timing Advisory:</strong> If driving, delay departure by 25 minutes or leave immediately to beat the congestion wave.</li>
              </ul>
            </div>

            <!-- Direct CTA: Navigate Through Our Website -->
            <div style="text-align: center; margin-bottom: 24px;">
              <a href="${navigateUrl}" target="_blank" style="display: inline-block; background: linear-gradient(135deg, #0284c7 0%, #0ea5e9 100%); color: #ffffff; text-decoration: none; font-size: 15px; font-weight: 800; padding: 14px 32px; border-radius: 14px; box-shadow: 0 10px 25px rgba(2, 132, 199, 0.4); text-transform: uppercase; letter-spacing: 0.5px;">
                🗺️ Navigate Through SMARTMOVE Website &rarr;
              </a>
              <p style="margin: 8px 0 0 0; font-size: 11px; color: #64748b;">
                Instant rerouting, live GPS map telematics, and real-time toll status
              </p>
            </div>

            <!-- Notice for User & Admin -->
            <div style="border-top: 1px solid #1e293b; padding-top: 16px; font-size: 11px; color: #64748b; line-height: 1.6;">
              <p style="margin: 0 0 4px 0;">
                🛡️ <strong>Notification Policy:</strong> This predictive advisory was dispatched to both Registered Commuters and City Traffic Command Admins.
              </p>
              <p style="margin: 0;">
                SMARTMOVE — AI-Enabled Smart & Sustainable Urban Mobility Platform.
              </p>
            </div>
          </div>
        </div>
      </body>
      </html>
    `;

    const textContent = `
[SMARTMOVE HIGH TRAFFIC PREDICTION ALERT]
Corridor: ${corridorName} (${roadName})
Congestion Predicted: ${congestionLevel}%
Expected Delay: +${expectedDelayMin} mins
Prediction Horizon: ${predictedHorizon}

SUGGESTIONS:
1. Alternate Route: ${alternativeRoute} (Saves ~${timeSavedMin} mins)
2. Smart Transit: ${transitAlternative}
3. Navigate through our website: ${navigateUrl}

Dispatched to: ${cleanRecipients.join(', ')}
    `;

    // Send in parallel to all recipients
    const sendPromises = cleanRecipients.map((recipient) =>
      transporter.sendMail({
        from: `"SMARTMOVE Traffic AI" <${user}>`,
        to: recipient,
        subject,
        text: textContent,
        html: htmlContent,
      })
    );

    const results = await Promise.allSettled(sendPromises);
    const successful = results.filter((r) => r.status === 'fulfilled');

    console.log(`[send-traffic-alert] Dispatched alerts to ${successful.length}/${cleanRecipients.length} recipients`);

    return res.status(200).json({
      success: true,
      dispatchedCount: successful.length,
      recipients: cleanRecipients,
      corridorName,
      congestionLevel,
      message: `High traffic predictive alert successfully sent to ${successful.length} recipient(s).`,
    });
  } catch (error) {
    console.error('[send-traffic-alert] Error sending email:', error);
    return res.status(500).json({
      success: false,
      error: error.message || 'Failed to dispatch traffic alert email',
    });
  }
}
