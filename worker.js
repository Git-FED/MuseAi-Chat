/*
 * Muse AI relay worker with optional image attachments.
 *
 * Bind a KV namespace named MESSAGES to persist relay messages.
 * The existing deployment's authentication and storage logic should be
 * merged into this handler if your relay already has additional behavior.
 */

const MAX_IMAGE_BYTES = 2 * 1024 * 1024;
const MAX_MESSAGES = 1000;
const MESSAGE_KEY = "messages";

export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    if (request.method === "OPTIONS") {
      return new Response(null, { status: 204, headers: corsHeaders() });
    }

    try {
      if (request.method === "POST" && url.pathname === "/send") {
        return withCors(await sendMessage(request, env));
      }

      if (request.method === "GET" && url.pathname === "/inbox") {
        return withCors(await getInbox(request, env));
      }

      return withCors(json({ error: "Not found" }, 404));
    } catch (error) {
      console.error(error);
      return withCors(json({ error: "Internal server error" }, 500));
    }
  },
};

async function sendMessage(request, env) {
  let payload;
  try {
    payload = await request.json();
  } catch {
    return json({ error: "Request body must be valid JSON" }, 400);
  }

  if (!payload || typeof payload !== "object") {
    return json({ error: "Request body must be a JSON object" }, 400);
  }

  const message = {
    ...payload,
    image: validateImage(payload.image),
    timestamp: payload.timestamp || new Date().toISOString(),
  };

  const messages = await readMessages(env);
  messages.push(message);
  const trimmed = messages.slice(-MAX_MESSAGES);
  await writeMessages(env, trimmed);

  return json({ ok: true, message }, 200);
}

async function getInbox(request, env) {
  const url = new URL(request.url);
  const messages = await readMessages(env);
  const since = url.searchParams.get("since");
  const filtered = since
    ? messages.filter((message) => String(message.timestamp || "") > since)
    : messages;

  return json({ messages: filtered });
}

function validateImage(image) {
  if (image === undefined || image === null || image === "") {
    return undefined;
  }

  if (typeof image !== "string") {
    throw httpError("image must be a string", 400);
  }

  if (image.startsWith("data:")) {
    if (!/^data:image\/[a-z0-9.+-]+;base64,[A-Za-z0-9+/=]+$/i.test(image)) {
      throw httpError("image must be a base64 image data URL", 400);
    }

    const comma = image.indexOf(",");
    const base64 = image.slice(comma + 1);
    const byteLength = Math.floor((base64.length * 3) / 4) -
      (base64.endsWith("==") ? 2 : base64.endsWith("=") ? 1 : 0);

    if (byteLength > MAX_IMAGE_BYTES) {
      throw httpError("image exceeds the 2 MB limit", 413);
    }
    return image;
  }

  let parsed;
  try {
    parsed = new URL(image);
  } catch {
    throw httpError("image must be a data URL or HTTPS URL", 400);
  }

  if (parsed.protocol !== "https:") {
    throw httpError("image URLs must use HTTPS", 400);
  }

  // A remote URL is not downloaded by the worker. Its referenced content
  // size cannot be measured here, so clients should enforce the local cap.
  return image;
}

async function readMessages(env) {
  if (!env.MESSAGES || typeof env.MESSAGES.get !== "function") {
    return [];
  }
  return (await env.MESSAGES.get(MESSAGE_KEY, "json")) || [];
}

async function writeMessages(env, messages) {
  if (!env.MESSAGES || typeof env.MESSAGES.put !== "function") {
    throw new Error("Missing MESSAGES KV binding");
  }
  await env.MESSAGES.put(MESSAGE_KEY, JSON.stringify(messages));
}

function httpError(message, status) {
  const error = new Error(message);
  error.status = status;
  return error;
}

function json(body, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "content-type": "application/json; charset=utf-8" },
  });
}

function withCors(response) {
  const headers = new Headers(response.headers);
  for (const [key, value] of Object.entries(corsHeaders())) headers.set(key, value);
  return new Response(response.body, { status: response.status, headers });
}

function corsHeaders() {
  return {
    "access-control-allow-origin": "*",
    "access-control-allow-methods": "GET,POST,OPTIONS",
    "access-control-allow-headers": "content-type,authorization",
  };
}

// Convert validation failures into their intended HTTP status.
const originalSendMessage = sendMessage;
sendMessage = async function wrappedSendMessage(request, env) {
  try {
    return await originalSendMessage(request, env);
  } catch (error) {
    if (error && Number.isInteger(error.status)) {
      return json({ error: error.message }, error.status);
    }
    throw error;
  }
};
