import test from 'node:test';
import assert from 'node:assert/strict';
import { buildLocalDraft, sanitizeFormData, validateBrief, validateFormData } from '../lib/brief-core.js';

const validInput = {
  brandName: 'Mellow Club',
  business: 'A digital wellbeing service.',
  problem: 'Remote workers are overloaded.',
  audience: 'Remote professionals',
  audienceNeed: 'They need short, low-pressure resets.',
  goal: 'Launch a new brand',
  personality: 'calm, intelligent, warm',
  differentiator: 'Short practices without hustle culture',
  language: 'en'
};

test('sanitizes unknown values and enforces field limits', () => {
  const data = sanitizeFormData({ ...validInput, brandName: `  ${'x'.repeat(140)}  `, unknown: 'ignored' });
  assert.equal(data.brandName.length, 100);
  assert.equal(data.unknown, undefined);
});

test('reports missing required fields', () => {
  const result = validateFormData({ language: 'ru' });
  assert.equal(result.valid, false);
  assert.equal(result.errors.brandName, 'required');
  assert.equal(result.data.language, 'ru');
});

test('builds a schema-valid local draft', () => {
  const result = validateFormData(validInput);
  assert.equal(result.valid, true);
  assert.equal(validateBrief(buildLocalDraft(result.data)), true);
});

test('rejects malformed brief output', () => {
  assert.equal(validateBrief({ overview: 'Only one field' }), false);
});
