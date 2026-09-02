import test from 'node:test';
import assert from 'node:assert/strict';
import handler from '../api/generate.js';
import { buildLocalGeneration } from '../lib/brief-core.js';

const input = {
  projectType: 'digital-product',
  brandName: 'Mellow Club',
  business: 'A digital wellbeing service for short workday resets.',
  problem: 'Remote workers need recovery without more productivity pressure.',
  audience: 'Remote professionals who feel overloaded during the workday.',
  audienceNeed: 'A short and realistic reset that does not become another obligation.',
  goal: 'Launch a new brand',
  personality: 'calm, intelligent, warm',
  competitors: 'Wellness apps and free video content',
  differentiator: 'Five-minute reset rituals designed around remote work.',
  proof: 'An early moderated pilot collected user feedback.',
  deliverables: 'Identity and landing page',
  avoid: 'Medical claims and generic wellness gradients',
  language: 'en'
};

function responseDouble() {
  return {
    headers: {}, statusCode: 200, body: null,
    setHeader(key, value) { this.headers[key] = value; },
    status(code) { this.statusCode = code; return this; },
    json(value) { this.body = value; return this; }
  };
}

test('handler retries invalid model output once and returns a validated generation', async () => {
  const originalFetch = globalThis.fetch;
  const originalKey = process.env.GROQ_API_KEY;
  process.env.GROQ_API_KEY = 'test-key';
  let calls = 0;
  globalThis.fetch = async () => {
    calls += 1;
    const content = calls === 1 ? JSON.stringify({ invalid: true }) : JSON.stringify(buildLocalGeneration(input));
    return { ok: true, status: 200, json: async () => ({ choices: [{ message: { content } }] }), headers: new Headers() };
  };
  const request = { method: 'POST', headers: { 'content-type': 'application/json', 'x-forwarded-for': '198.51.100.22' }, body: input, socket: {} };
  const response = responseDouble();
  try {
    await handler(request, response);
    assert.equal(response.statusCode, 200);
    assert.equal(response.body.meta.attempts, 2);
    assert.equal(response.body.meta.provider, 'groq');
    assert.equal(calls, 2);
  } finally {
    globalThis.fetch = originalFetch;
    if (originalKey === undefined) delete process.env.GROQ_API_KEY;
    else process.env.GROQ_API_KEY = originalKey;
  }
});
