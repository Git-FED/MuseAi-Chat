const json = (data, status = 200) => new Response(JSON.stringify(data), {
  status,
  headers: { "content-type": "application/json; charset=utf-8", "cache-control": "no-store" },
});

function cors(response) {
  const headers = new Headers(response.headers);
  headers.set("access-control-allow-origin", "*");
  headers.set("access-control-allow-headers", "content-type, x-agent-key");
  headers.set("access-control-allow-methods", "GET, POST, OPTIONS");
  return new Response(response.body, { status: response.status, headers });
}

function authenticated(request, env) {
  const expected = env.MUSEAI_AGENT_KEY;
  return Boolean(expected && request.headers.get("X-Agent-Key") === expected);
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    if (request.method === "OPTIONS") return cors(new Response(null, { status: 204 }));
    if (url.pathname === "/health" && request.method === "GET") {
      return cors(json({ ok: true, service: "MuseAi Agent Chat", mode: "store-and-forward" }));
    }
    if (!authenticated(request, env)) return cors(new Response("unauthorized", { status: 401 }));

    if (request.method === "POST" && url.pathname === "/send") {
      let payload;
      try { payload = await request.json(); } catch { return cors(json({ error: "invalid_json" }, 400)); }
      const from = String(payload.from || "").trim();
      const to = String(payload.to || "").trim();
      const text = String(payload.body || "").trim();
      if (!from || !to || !text || text.length > 20000) return cors(json({ error: "invalid_message" }, 400));
      const ts = Date.now();
      const id = crypto.randomUUID();
      const message = { id, ts, from, to, body: text, thread_id: payload.thread_id || id };
      const key = `inbox:${to}:${String(ts).padStart(16, "0")}:${id}`;
      await env.MESSAGES.put(key, JSON.stringify(message), { expirationTtl: 60 * 60 * 24 * 30 });
      return cors(json({ ok: true, id, ts }, 201));
    }

    if (request.method === "GET" && url.pathname === "/inbox") {
      const agent = String(url.searchParams.get("agent") || "").trim();
      const since = Number(url.searchParams.get("since") || 0);
      const limit = Math.min(Math.max(Number(url.searchParams.get("limit") || 50), 1), 100);
      if (!agent || !Number.isFinite(since)) return cors(json({ error: "invalid_query" }, 400));
      const listed = await env.MESSAGES.list({ prefix: `inbox:${agent}:`, limit: 1000 });
      const messages = [];
      for (const key of listed.keys) {
        const ts = Number(key.name.split(":")[2]);
        if (ts <= since) continue;
        const value = await env.MESSAGES.get(key.name);
        if (value) messages.push(JSON.parse(value));
      }
      messages.sort((a, b) => a.ts - b.ts);
      const selected = messages.slice(0, limit);
      const last = selected.length ? selected[selected.length - 1].ts : since;
      return cors(json({ messages: selected, last, truncated: messages.length > selected.length }));
    }

    return cors(new Response("not found", { status: 404 }));
  },
};
