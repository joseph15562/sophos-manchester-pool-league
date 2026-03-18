/**
 * GET /api/sync-check — Check if Upstash Redis is configured on Vercel.
 * Returns { redis: true } when UPSTASH_REDIS_REST_URL and UPSTASH_REDIS_REST_TOKEN are set.
 * Does not confirm Redis is reachable or working, only that env vars exist.
 */
export default async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;
  const configured = !!(url && token);
  return res.status(200).json({ redis: configured });
}
