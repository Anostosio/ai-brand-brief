import test from 'node:test';
import assert from 'node:assert/strict';
import { generateBrandBrief } from '../api/generate.js';
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

test('generation retries invalid Yandex output and preserves privacy controls', async () => {
  const originalFetch = globalThis.fetch;
  const calls = [];
  globalThis.fetch = async (url, options) => {
    calls.push({ url, options });
    const content = calls.length === 1
      ? JSON.stringify({ invalid: true })
      : JSON.stringify(buildLocalGeneration(input));
    return {
      ok: true,
      status: 200,
      json: async () => ({ alternatives: [{ status: 'ALTERNATIVE_STATUS_FINAL', message: { text: content } }] }),
      headers: new Headers()
    };
  };

  try {
    const response = await generateBrandBrief({
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: input,
      clientAddress: '198.51.100.22',
      requestId: 'test-request-id',
      auth: {
        folderId: 'test-folder',
        iamToken: 'test-token',
        modelUri: 'gpt://test-folder/yandexgpt-5.1'
      }
    });

    assert.equal(response.statusCode, 200);
    assert.equal(response.body.meta.attempts, 2);
    assert.equal(response.body.meta.provider, 'yandex-ai-studio');
    assert.equal(calls.length, 2);

    const first = calls[0];
    assert.equal(first.url, 'https://llm.api.cloud.yandex.net/foundationModels/v1/completion');
    assert.equal(first.options.headers.Authorization, 'Bearer test-token');
    assert.equal(first.options.headers['x-folder-id'], 'test-folder');
    assert.equal(first.options.headers['x-data-logging-enabled'], 'false');

    const providerBody = JSON.parse(first.options.body);
    assert.equal(providerBody.modelUri, 'gpt://test-folder/yandexgpt-5.1');
    assert.equal(providerBody.completionOptions.stream, false);
    assert.equal(providerBody.jsonSchema.schema.type, 'object');
    assert.ok(providerBody.messages.some(message => message.role === 'user' && message.text.includes('Mellow Club')));
    assert.ok(!first.options.body.includes('198.51.100.22'));
    assert.ok(!first.options.body.includes('test-request-id'));
  } finally {
    globalThis.fetch = originalFetch;
  }
});

test('legacy Vercel default path is fail-closed', async () => {
  const { default: legacyHandler } = await import('../api/generate.js');
  const response = {
    statusCode: 200,
    body: null,
    headers: {},
    setHeader(key, value) { this.headers[key] = value; },
    status(code) { this.statusCode = code; return this; },
    json(value) { this.body = value; return this; }
  };

  await legacyHandler({}, response);
  assert.equal(response.statusCode, 503);
  assert.equal(response.body.error.code, 'MIGRATION_REQUIRED');
});
