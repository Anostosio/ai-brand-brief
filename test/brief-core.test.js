import test from 'node:test';
import assert from 'node:assert/strict';
import {
  assessBriefReadiness, buildLocalDraft, buildLocalGeneration, sanitizeFormData,
  validateBrief, validateFormData, validateGeneration
} from '../lib/brief-core.js';

const validInput = {
  projectType: 'digital-product',
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

test('builds a complete local generation with trust and alternatives', () => {
  const generation = buildLocalGeneration(validInput);
  assert.equal(validateGeneration(generation), true);
  assert.equal(generation.alternatives.length, 2);
  assert.equal(generation.trust.visual.status, 'hypothesis');
});

test('scores evidence-aware readiness without calling AI', () => {
  const thin = assessBriefReadiness(validInput);
  const strong = assessBriefReadiness({
    ...validInput,
    business: 'A subscription-based digital wellbeing service with short guided workday resets.',
    problem: 'Remote workers are overloaded and existing tools create more productivity pressure.',
    audienceNeed: 'Short routines feel realistic while long sessions create another obligation.',
    competitors: 'Calm, Headspace and free video content',
    proof: 'An early moderated pilot included customer feedback.',
    deliverables: 'Identity and landing page',
    avoid: 'Medical claims and generic wellness gradients'
  });
  assert.ok(strong.score > thin.score);
  assert.equal(strong.level, 'strong');
});

test('does not duplicate terminal punctuation from user input', () => {
  const draft = buildLocalDraft({ ...validInput, audience: 'Remote professionals.', proof: 'Tested with 42 people.' });
  assert.equal(draft.messages[1].includes('..'), false);
  assert.equal(draft.risks.includes('..'), false);
});

test('rejects malformed brief output', () => {
  assert.equal(validateBrief({ overview: 'Only one field' }), false);
});
