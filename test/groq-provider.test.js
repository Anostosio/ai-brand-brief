import test from 'node:test';
import assert from 'node:assert/strict';
import { classifyUpstreamStatus, extractText } from '../api/generate.js';

test('extracts a Groq chat completion', () => {
  const content = JSON.stringify({ overview: 'Working brief' });
  assert.equal(extractText({ choices: [{ message: { content } }] }), content);
});

test('returns an empty string for a malformed Groq response', () => {
  assert.equal(extractText({ choices: [] }), '');
});

test('surfaces model refusals', () => {
  assert.throws(
    () => extractText({ choices: [{ message: { refusal: 'Blocked' } }] }),
    /MODEL_REFUSAL/
  );
});

test('classifies upstream status codes for recoverable UI states', () => {
  assert.equal(classifyUpstreamStatus(401), 'configuration');
  assert.equal(classifyUpstreamStatus(403), 'configuration');
  assert.equal(classifyUpstreamStatus(429), 'rate-limit');
  assert.equal(classifyUpstreamStatus(500), 'upstream');
});
