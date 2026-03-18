const KEY = 'pool-league';

export default async function handler(req, res) {
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;

  if (!url || !token) {
    if (req.method === 'GET') return res.status(200).json({ players: [], matches: [], bracket: null, groups: null, groupMatches: [] });
    return res.status(503).json({ error: 'Server state not configured. Add Upstash Redis env vars for TV sync across devices.' });
  }

  if (req.method === 'GET') {
    try {
      const r = await fetch(`${url}/get/${KEY}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await r.json();
      if (data.error) return res.status(400).json({ error: data.error });
      const raw = data.result == null ? null : JSON.parse(data.result);
      const state = raw
        ? {
            players: raw.players ?? [],
            matches: raw.matches ?? [],
            bracket: raw.bracket ?? null,
            groups: raw.groups ?? null,
            groupMatches: Array.isArray(raw.groupMatches) ? raw.groupMatches : [],
          }
        : { players: [], matches: [], bracket: null, groups: null, groupMatches: [] };
      return res.status(200).json(state);
    } catch (e) {
      return res.status(500).json({ error: String(e.message) });
    }
  }

  if (req.method === 'POST') {
    try {
      const body = typeof req.body === 'string' ? req.body : JSON.stringify(req.body || {});
      const r = await fetch(`${url}/set/${KEY}`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        body,
      });
      const data = await r.json();
      if (data.error) return res.status(400).json({ error: data.error });
      return res.status(200).json({ ok: true });
    } catch (e) {
      return res.status(500).json({ error: String(e.message) });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
