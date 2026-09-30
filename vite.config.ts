import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { fileURLToPath, URL } from 'node:url';
import nodemailer from 'nodemailer';

function gmailSmtpPlugin(env: Record<string, string>) {
  return {
    name: 'gmail-smtp-plugin',
    configureServer(server: any) {
      server.middlewares.use('/api/send-gmail-otp', (req: any, res: any) => {
        if (req.method === 'POST') {
          let body = '';
          req.on('data', (chunk: any) => {
            body += chunk;
          });
          req.on('end', async () => {
            try {
              const { to, otpCode } = JSON.parse(body || '{}');
              const user = env.VITE_GMAIL_USER || 'hajeesh6382@gmail.com';
              const pass = (env.VITE_GMAIL_APP_PASSWORD || '').replace(/\s+/g, '');

              if (!pass) {
                res.writeHead(400, { 'Content-Type': 'application/json' });
                res.end(
                  JSON.stringify({
                    success: false,
                    error: 'VITE_GMAIL_APP_PASSWORD is not set in .env',
                  })
                );
                return;
              }

              const transporter = nodemailer.createTransport({
                service: 'gmail',
                auth: { user, pass },
              });

              await transporter.sendMail({
                from: `"SMARTMOVE Mobility" <${user}>`,
                to,
                subject: `Your SMARTMOVE Verification Code: ${otpCode}`,
                html: `
                  <div style="font-family: Arial, sans-serif; background: #030712; color: #f8fafc; padding: 28px; border-radius: 16px; max-width: 480px; margin: 0 auto; border: 1px solid #1e293b;">
                    <h2 style="color: #06b6d4; margin-bottom: 8px;">SMARTMOVE Mobility</h2>
                    <p style="color: #94a3b8; font-size: 14px;">Your One-Time Passcode for instant login:</p>
                    <div style="background: #0f172a; padding: 18px; border-radius: 12px; text-align: center; margin: 16px 0; border: 1px solid #334155;">
                      <span style="font-size: 36px; font-weight: 900; letter-spacing: 8px; color: #10b981; font-family: monospace;">${otpCode}</span>
                    </div>
                    <p style="color: #64748b; font-size: 12px; text-align: center;">Valid for 10 minutes. If you did not request this, please ignore.</p>
                  </div>
                `,
              });

              console.log(`[Gmail SMTP] Direct email delivered to ${to}`);
              res.writeHead(200, { 'Content-Type': 'application/json' });
              res.end(JSON.stringify({ success: true, message: `Delivered to ${to}` }));
            } catch (err: any) {
              console.error('[Gmail SMTP] Error:', err.message);
              res.writeHead(500, { 'Content-Type': 'application/json' });
              res.end(JSON.stringify({ success: false, error: err.message }));
            }
          });
        }
      });
    },
  };
}

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');

  return {
    plugins: [
      react(),
      tailwindcss(),
      gmailSmtpPlugin(env),
    ],
    resolve: {
      alias: {
        '@': fileURLToPath(new URL('./src', import.meta.url)),
      },
    },
    server: {
      port: 5173,
      host: true,
      proxy: {
        '/api/fast2sms': {
          target: 'https://www.fast2sms.com',
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/api\/fast2sms/, ''),
        },
        '/api/resend': {
          target: 'https://api.resend.com',
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/api\/resend/, ''),
        },
      },
    },
  };
});
