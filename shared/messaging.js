const DEFAULT_URL = "";
// Any leftover placeholder (e.g. from old saved settings) is treated as unset,
// so the app can never try to reach a dead example URL.
const PLACEHOLDER_RE = /example\./i;

export function config(overrides = {}) {
  let url = overrides.url || DEFAULT_URL;
  if (PLACEHOLDER_RE.test(url)) url = "";
  return {
    url: url.replace(/\/$/, ""),
    agentId: overrides.agentId || "muse1",
    key: overrides.key || "",
    pollIntervalMs: Number(overrides.pollIntervalMs || 300000),
  };
}

async function request(url, options = {}) {
  const response = await fetch(url, options);
  if (!response.ok) throw new Error(`${response.status}: ${await response.text()}`);
  return response.json();
}

export function sendMessage(settings, to, body, threadId = null) {
  return request(`${settings.url}/send`, {
    method: "POST",
    headers: { "content-type": "application/json", "x-agent-key": settings.key },
    body: JSON.stringify({ from: settings.agentId, to, body, thread_id: threadId }),
  });
}

export function fetchInbox(settings, since = 0, limit = 50) {
  const url = new URL(`${settings.url}/inbox`);
  url.searchParams.set("agent", settings.agentId);
  url.searchParams.set("since", String(since));
  url.searchParams.set("limit", String(limit));
  return request(url, { headers: { "x-agent-key": settings.key } });
}
