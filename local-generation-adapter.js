import { buildLocalGeneration, validateFormData } from './lib/brief-core.js';

export function createLocalGenerationPayload(rawData = {}) {
  const validation = validateFormData(rawData);
  if (!validation.valid) {
    return {
      ok: false,
      status: 400,
      body: {
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Required brief fields are missing.',
          fields: validation.errors
        }
      }
    };
  }

  const generation = buildLocalGeneration(validation.data);
  return {
    ok: true,
    status: 200,
    body: {
      ...generation,
      meta: {
        mode: 'local',
        provider: 'browser-local',
        model: 'evidence-aware-rules-v1',
        generatedAt: new Date().toISOString()
      }
    }
  };
}

export function installLocalGenerationAdapter(target = globalThis) {
  const originalFetch = typeof target.fetch === 'function' ? target.fetch.bind(target) : null;

  target.fetch = async (input, init = {}) => {
    const url = typeof input === 'string' ? input : input?.url;
    const method = String(init.method || (typeof input !== 'string' ? input?.method : '') || 'GET').toUpperCase();
    const isLocalGenerate = url === '/api/generate' || url?.endsWith('/api/generate');

    if (!isLocalGenerate) {
      if (!originalFetch) throw new TypeError('fetch is not available');
      return originalFetch(input, init);
    }

    if (method !== 'POST') {
      return new Response(JSON.stringify({ error: { code: 'METHOD_NOT_ALLOWED', message: 'Only POST requests are accepted.' } }), {
        status: 405,
        headers: { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store' }
      });
    }

    let data = {};
    try {
      if (typeof init.body === 'string') data = JSON.parse(init.body);
      else if (init.body && typeof init.body === 'object') data = init.body;
    } catch {
      return new Response(JSON.stringify({ error: { code: 'INVALID_BODY', message: 'The request body is not valid JSON.' } }), {
        status: 400,
        headers: { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store' }
      });
    }

    const result = createLocalGenerationPayload(data);
    return new Response(JSON.stringify(result.body), {
      status: result.status,
      headers: {
        'Content-Type': 'application/json; charset=utf-8',
        'Cache-Control': 'no-store',
        'X-Brand-Brief-Processing': 'browser-local'
      }
    });
  };
}
