import test from 'node:test';
import assert from 'node:assert/strict';
import { classifyUpstreamStatus, extractText, pseudonymizeClientAddress } from '../api/generate.js';

test('extracts a Yandex AI Studio text completion', () => {
  const content = JSON.stringify({ overview: 'Working brief' });
  assert.equal(extractText({ result: { alternatives: [{ message: { text: content } }] } }), content);
});

test('returns an empty string for a malformed Yandex response', () => {
  assert.equal(extractText({ result: { alternatives: [] } }), '');
});

test('still surfaces explicit provider refusals', () => {
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

test('rate-limit client key is pseudonymous and stable within the process', () => {
  const ip = '198.51.100.22';
  const first = pseudonymizeClientAddress(ip);
  const second = pseudonymizeClientAddress(ip);
  assert.equal(first, second);
  assert.notEqual(first, ip);
  assert.ok(first.length > 30);
});
