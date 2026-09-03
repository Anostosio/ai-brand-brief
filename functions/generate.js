import { generateBrandBrief } from '../api/generate.js';

function normalizeHeaders(headers = {}) {
  return Object.fromEntries(Object.entries(headers).map(([key, value]) => [key.toLowerCase(), value]));
}

function parseBody(event, context) {
  if (typeof context?.getPayload === 'function') {
    try { return context.getPayload(); } catch { /* Fall through to raw event body. */ }
  }

  if (event?.body && typeof event.body === 'object') return event.body;
  if (typeof event?.body !== 'string' || event.body.length === 0) return {};

  try {
    const raw = event.isBase64Encoded ? Buffer.from(event.body, 'base64').toString('utf8') : event.body;
    return JSON.parse(raw);
  } catch {
    return {};
  }
}

function clientAddress(event, headers) {
  const forwarded = headers['x-forwarded-for'];
  if (forwarded) return String(forwarded).split(',')[0].trim();
  return event?.requestContext?.http?.sourceIp
    || event?.requestContext?.identity?.sourceIp
    || 'anonymous';
}

export async function handler(event, context) {
  const headers = normalizeHeaders(event?.headers || {});
  const result = await generateBrandBrief({
    method: event?.requestContext?.http?.method || event?.httpMethod || 'POST',
    headers,
    body: parseBody(event, context),
    clientAddress: clientAddress(event, headers),
    requestId: context?.requestId || event?.requestContext?.requestId,
    auth: {
      iamToken: context?.token?.access_token,
      folderId: context?.functionFolderId,
      modelUri: process.env.YANDEX_MODEL_URI
    }
  });

  return {
    statusCode: result.statusCode,
    headers: result.headers,
    isBase64Encoded: false,
    body: JSON.stringify(result.body)
  };
}
