// Daily rebuild trigger, called by the Vercel cron in vercel.json.
//
// Security: this endpoint used to be public and had the deploy-hook URL hard-coded,
// so anyone could trigger unlimited production builds. It now requires:
//   CRON_SECRET     - Vercel sends `Authorization: Bearer <CRON_SECRET>` on cron calls
//   DEPLOY_HOOK_URL - the (rotated) Vercel deploy hook URL
// Both are set in Vercel -> Project -> Settings -> Environment Variables.
import { timingSafeEqual } from 'node:crypto';

const safeEqual = (a, b) => {
  const x = Buffer.from(String(a));
  const y = Buffer.from(String(b));
  return x.length === y.length && timingSafeEqual(x, y);
};

export default async function handler(req, res) {
  const secret = process.env.CRON_SECRET;
  const hookUrl = process.env.DEPLOY_HOOK_URL;

  if (!secret || !hookUrl) {
    return res.status(503).json({ error: 'Redeploy is not configured' });
  }
  if (!safeEqual(req.headers.authorization || '', `Bearer ${secret}`)) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const result = await fetch(hookUrl, { method: 'POST' });
  return res.status(result.ok ? 200 : 502).json({ triggered: result.ok });
}
