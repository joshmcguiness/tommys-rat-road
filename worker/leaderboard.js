// Tommy's Rat Road — global leaderboard API (Cloudflare Worker + KV)
// GET  /scores  -> top 20 [{name, score, level, ts}]
// POST /scores  {name, score, level} -> {ok, rank, top}

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

export default {
  async fetch(req, env) {
    if (req.method === 'OPTIONS') return new Response(null, { headers: CORS });
    const url = new URL(req.url);
    if (url.pathname !== '/scores') {
      return new Response('Not found', { status: 404, headers: CORS });
    }

    // separate boards per game: default key 'top' (Rat Road), 'top-berry' (Blueberry Dash)
    const board = url.searchParams.get('board') === 'berry' ? 'top-berry' : 'top';

    if (req.method === 'GET') {
      const top = JSON.parse((await env.SCORES.get(board)) || '[]');
      return Response.json(top.slice(0, 20), { headers: CORS });
    }

    if (req.method === 'POST') {
      let body;
      try { body = await req.json(); } catch {
        return new Response('Bad JSON', { status: 400, headers: CORS });
      }
      const name = String(body.name || '').replace(/[^\w \-!?.']/g, '').trim().slice(0, 12);
      const score = Math.floor(Number(body.score));
      const level = Math.max(1, Math.min(99, Math.floor(Number(body.level) || 1)));
      if (!name || !Number.isFinite(score) || score < 1 || score > 9999) {
        return new Response('Invalid score', { status: 400, headers: CORS });
      }

      const top = JSON.parse((await env.SCORES.get(board)) || '[]');
      const entry = { name, score, level, ts: Date.now() };
      top.push(entry);
      top.sort((a, b) => b.score - a.score || a.ts - b.ts);
      const trimmed = top.slice(0, 50);
      await env.SCORES.put(board, JSON.stringify(trimmed));
      const rank = trimmed.findIndex(e => e.ts === entry.ts && e.name === name) + 1;
      return Response.json({ ok: true, rank: rank || null, top: trimmed.slice(0, 20) }, { headers: CORS });
    }

    return new Response('Method not allowed', { status: 405, headers: CORS });
  },
};
