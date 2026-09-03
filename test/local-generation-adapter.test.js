import test from 'node:test';
import assert from 'node:assert/strict';
import { createLocalGenerationPayload, installLocalGenerationAdapter } from '../local-generation-adapter.js';
import { validateGeneration } from '../lib/brief-core.js';

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

test('creates a schema-valid local generation without a remote provider', () => {
  const result = createLocalGenerationPayload(input);
  assert.equal(result.ok, true);
  assert.equal(result.status, 200);
  assert.equal(result.body.meta.mode, 'local');
  assert.equal(result.body.meta.provider, 'browser-local');
  assert.equal(validateGeneration(result.body), true);
});

test('local adapter intercepts only the generation route', async () => {
  let remoteCalls = 0;
  const target = {
    fetch: async () => {
      remoteCalls += 1;
      return new Response('remote');
    }
  };
  installLocalGenerationAdapter(target);

  const response = await target.fetch('/api/generate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input)
  });
  const payload = await response.json();
  assert.equal(response.status, 200);
  assert.equal(response.headers.get('X-Brand-Brief-Processing'), 'browser-local');
  assert.equal(payload.meta.mode, 'local');
  assert.equal(remoteCalls, 0);

  await target.fetch('/other-resource');
  assert.equal(remoteCalls, 1);
});

test('invalid local input fails without making a network request', async () => {
  let remoteCalls = 0;
  const target = { fetch: async () => { remoteCalls += 1; return new Response('remote'); } };
  installLocalGenerationAdapter(target);
  const response = await target.fetch('/api/generate', { method: 'POST', body: JSON.stringify({ language: 'ru' }) });
  const payload = await response.json();
  assert.equal(response.status, 400);
  assert.equal(payload.error.code, 'VALIDATION_ERROR');
  assert.equal(remoteCalls, 0);
});
