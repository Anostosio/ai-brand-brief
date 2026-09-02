export const FIELD_LIMITS = Object.freeze({
  projectType: 80,
  brandName: 100,
  business: 1200,
  problem: 800,
  audience: 800,
  audienceNeed: 800,
  market: 240,
  goal: 240,
  personality: 300,
  competitors: 600,
  differentiator: 800,
  proof: 800,
  deliverables: 500,
  avoid: 600,
  notes: 800
});

export const REQUIRED_FIELDS = Object.freeze([
  'projectType', 'brandName', 'business', 'problem', 'audience',
  'goal', 'personality', 'differentiator'
]);

export const BRIEF_KEYS = Object.freeze([
  'overview', 'challenge', 'audience', 'insight', 'positioning',
  'valueProposition', 'personality', 'tone', 'messages', 'visual',
  'deliverables', 'risks', 'nextSteps'
]);

export const TRUST_STATUSES = Object.freeze(['grounded', 'mixed', 'hypothesis', 'needs-validation']);
export const ALTERNATIVE_KEYS = Object.freeze(['name', 'rationale', 'positioning', 'tone', 'visualPrinciple', 'advantage', 'risk']);

export function sanitizeFormData(input = {}) {
  const clean = {};
  for (const [field, limit] of Object.entries(FIELD_LIMITS)) {
    const value = typeof input[field] === 'string' ? input[field].trim() : '';
    clean[field] = value.slice(0, limit);
  }
  clean.language = input.language === 'ru' ? 'ru' : 'en';
  return clean;
}

export function validateFormData(input = {}) {
  const data = sanitizeFormData(input);
  const errors = {};
  for (const field of REQUIRED_FIELDS) if (!data[field]) errors[field] = 'required';
  return { valid: Object.keys(errors).length === 0, data, errors };
}

export function validateBrief(input) {
  if (!input || typeof input !== 'object' || Array.isArray(input)) return false;
  const arrayKeys = new Set(['messages', 'nextSteps']);
  return BRIEF_KEYS.every(key => {
    const value = input[key];
    if (arrayKeys.has(key)) return Array.isArray(value) && value.length === 3 && value.every(item => typeof item === 'string' && item.trim());
    return typeof value === 'string' && value.trim();
  });
}

export function validateTrust(input) {
  if (!input || typeof input !== 'object' || Array.isArray(input)) return false;
  return BRIEF_KEYS.every(key => {
    const item = input[key];
    return item && TRUST_STATUSES.includes(item.status)
      && Array.isArray(item.sources) && item.sources.length <= 5
      && item.sources.every(source => Object.hasOwn(FIELD_LIMITS, source))
      && typeof item.note === 'string';
  });
}

export function validateAlternatives(input) {
  return Array.isArray(input) && input.length === 2 && input.every(route =>
    route && ALTERNATIVE_KEYS.every(key => typeof route[key] === 'string' && route[key].trim())
  );
}

export function validateGeneration(input) {
  return Boolean(input && validateBrief(input.brief) && validateTrust(input.trust) && validateAlternatives(input.alternatives));
}

export function assessBriefReadiness(rawData) {
  const data = sanitizeFormData(rawData);
  const checks = [
    { key: 'foundation', weight: 25, ready: Boolean(data.projectType && data.brandName && data.business.length >= 40 && data.problem.length >= 40) },
    { key: 'audience', weight: 20, ready: Boolean(data.audience.length >= 35 && data.audienceNeed.length >= 25) },
    { key: 'difference', weight: 20, ready: Boolean(data.differentiator.length >= 35 && data.competitors.length >= 15) },
    { key: 'evidence', weight: 20, ready: data.proof.length >= 20 },
    { key: 'scope', weight: 15, ready: Boolean(data.deliverables.length >= 10 && (data.avoid.length >= 10 || data.notes.length >= 20)) }
  ];
  const score = checks.reduce((sum, check) => sum + (check.ready ? check.weight : 0), 0);
  return { score, level: score >= 80 ? 'strong' : score >= 50 ? 'workable' : 'thin', checks };
}

function list(value) { return value.split(',').map(item => item.trim()).filter(Boolean); }
function withoutTerminalPunctuation(value) { return value.trim().replace(/[.!?…]+$/u, ''); }
function trustItem(status, sources, note = '') { return { status, sources, note }; }

export function buildLocalTrust(data) {
  const hasNeed = Boolean(data.audienceNeed);
  const hasProof = Boolean(data.proof);
  const hasScope = Boolean(data.deliverables);
  const ru = data.language === 'ru';
  return {
    overview: trustItem('grounded', ['projectType', 'brandName', 'business', 'goal', 'market']),
    challenge: trustItem('grounded', ['problem', 'goal']),
    audience: trustItem('grounded', ['audience']),
    insight: trustItem(hasNeed ? 'mixed' : 'needs-validation', hasNeed ? ['audience', 'audienceNeed'] : ['audience'], hasNeed ? (ru ? 'Напряжение аудитории указано, но требует проверки.' : 'Audience tension is supplied but still benefits from validation.') : (ru ? 'Потребность или барьер аудитории не указаны.' : 'No audience need or barrier was supplied.')),
    positioning: trustItem(hasProof ? 'mixed' : 'hypothesis', ['audience', 'differentiator', 'competitors', 'proof'], hasProof ? (ru ? 'Направление использует указанные доказательства, но требует проверки на рынке.' : 'Direction uses supplied proof but still needs market validation.') : (ru ? 'Для позиционирования не указаны подтверждающие факты.' : 'Positioning has no supplied proof point.')),
    valueProposition: trustItem(hasProof ? 'mixed' : 'hypothesis', ['business', 'audience', 'differentiator', 'proof']),
    personality: trustItem('grounded', ['personality']),
    tone: trustItem('mixed', ['personality', 'avoid']),
    messages: trustItem('mixed', ['brandName', 'audience', 'differentiator', 'proof']),
    visual: trustItem('hypothesis', ['personality', 'avoid', 'deliverables'], ru ? 'Креативное направление необходимо проверить на этапе концепции.' : 'Creative direction must be tested during concept development.'),
    deliverables: trustItem(hasScope ? 'grounded' : 'needs-validation', ['deliverables', 'notes']),
    risks: trustItem('mixed', ['proof', 'competitors', 'notes']),
    nextSteps: trustItem('hypothesis', ['goal', 'competitors', 'deliverables'], ru ? 'Этапы процесса нужно адаптировать под бюджет и сроки.' : 'Proposed process steps should be adapted to budget and timing.')
  };
}

export function buildLocalDraft(rawData) {
  const data = sanitizeFormData(rawData);
  const traits = list(data.personality);
  if (data.language === 'ru') {
    const traitLine = traits.slice(0, 4).join(', ') || 'ясный, уверенный, человечный';
    return {
      overview: `${data.brandName} — ${data.business}`,
      challenge: data.problem || `Сформулировать направление бренда для задачи «${data.goal.toLowerCase()}».`,
      audience: data.audience,
      insight: data.audienceNeed || 'Гипотеза: потребности, барьеры и критерии выбора аудитории требуют проверки.',
      positioning: `Гипотеза направления: ${data.brandName} может занимать понятную позицию за счёт отличия — ${withoutTerminalPunctuation(data.differentiator) || 'отличие требует уточнения'}.`,
      valueProposition: `${data.brandName} предлагает обозначенной аудитории более уместный способ решить заявленную задачу. Обещание необходимо подтвердить фактами и обратной связью.`,
      personality: traitLine,
      tone: `Коммуникация должна звучать ${traitLine}. Использовать конкретные формулировки и избегать неподтверждённых обещаний.`,
      messages: [`${data.brandName}: ясное решение обозначенной задачи.`, `Подход строится вокруг контекста аудитории: ${withoutTerminalPunctuation(data.audience)}.`, data.differentiator || 'Ключевое отличие необходимо проверить.'],
      visual: `Гипотеза: выразить качества «${traits.slice(0, 3).join(', ') || 'ясность, уверенность, человечность'}» через типографику, композицию, ритм, изображения и повторяемые элементы. ${data.avoid ? `Избегать: ${withoutTerminalPunctuation(data.avoid)}.` : 'Определить клише категории, которых следует избегать.'}`,
      deliverables: data.deliverables || 'Уточнить носители, форматы и технические требования до начала концепции.',
      risks: `${data.proof ? `Указанные опорные факты: ${withoutTerminalPunctuation(data.proof)}.` : 'Подтверждения ценности и отличий пока не указаны.'} Предположения о рынке и аудитории нельзя считать исследованием.`,
      nextSteps: ['Проверить вводные и спорные предположения с заказчиком.', `Сравнить направление с релевантными альтернативами${data.competitors ? `, включая ${data.competitors}` : ''}.`, 'Собрать мудборд и проверить систему на одном приоритетном носителе.']
    };
  }
  const traitLine = traits.slice(0, 4).join(', ') || 'clear, confident and human';
  return {
    overview: `${data.brandName} — ${data.business}`,
    challenge: data.problem || `Define a brand direction for the goal: ${data.goal.toLowerCase()}.`,
    audience: data.audience,
    insight: data.audienceNeed || 'Hypothesis: audience needs, barriers and decision criteria still require validation.',
    positioning: `Direction hypothesis: ${data.brandName} can earn a clear position through this difference — ${withoutTerminalPunctuation(data.differentiator) || 'the difference needs clarification'}.`,
    valueProposition: `${data.brandName} offers the stated audience a more relevant way to address the declared challenge. The promise must be validated with evidence and feedback.`,
    personality: traitLine,
    tone: `Communication should feel ${traitLine}. Use concrete language and avoid unsupported claims.`,
    messages: [`${data.brandName}: a clearer response to the stated challenge.`, `Built around the context of ${withoutTerminalPunctuation(data.audience)}.`, data.differentiator || 'The key brand difference must be validated.'],
    visual: `Hypothesis: express ${traits.slice(0, 3).join(', ') || 'clarity, confidence and humanity'} through typography, composition, rhythm, imagery and repeatable assets. ${data.avoid ? `Avoid: ${withoutTerminalPunctuation(data.avoid)}.` : 'Identify category clichés to avoid.'}`,
    deliverables: data.deliverables || 'Confirm touchpoints, formats and technical requirements before concept development.',
    risks: `${data.proof ? `Supplied proof: ${withoutTerminalPunctuation(data.proof)}.` : 'No proof points have been supplied.'} Market and audience assumptions must not be presented as research.`,
    nextSteps: ['Review inputs and uncertain assumptions with the client.', `Compare the direction with relevant alternatives${data.competitors ? `, including ${data.competitors}` : ''}.`, 'Build a moodboard and test the system on one priority touchpoint.']
  };
}

export function buildLocalAlternatives(data) {
  if (data.language === 'ru') return [
    { name: 'Ясность и доверие', rationale: 'Сделать предложение максимально понятным и снизить барьер первого контакта.', positioning: `Понятный выбор для аудитории: ${withoutTerminalPunctuation(data.audience)}.`, tone: 'Спокойный, конкретный, поддерживающий.', visualPrinciple: 'Строгая сетка, ясная типографика, функциональные повторяемые элементы.', advantage: 'Легко объяснить продукт и масштабировать систему.', risk: 'Направление может выглядеть слишком безопасным без сильного отличительного приёма.' },
    { name: 'Выразительное отличие', rationale: `Сделать центральным заявленное отличие: ${withoutTerminalPunctuation(data.differentiator)}.`, positioning: 'Более заметная и эмоциональная альтернатива привычным решениям категории.', tone: 'Уверенный, живой, характерный.', visualPrinciple: 'Контрастный ритм, один узнаваемый графический принцип и смелая иерархия.', advantage: 'Выше шанс запомниться и выделиться в категории.', risk: 'Необходимо проверить, не снижает ли выразительность доверие аудитории.' }
  ];
  return [
    { name: 'Clarity and trust', rationale: 'Make the offer immediately understandable and lower the barrier to first use.', positioning: `A clear choice for ${withoutTerminalPunctuation(data.audience)}.`, tone: 'Calm, concrete and supportive.', visualPrinciple: 'Disciplined grid, legible typography and functional repeatable assets.', advantage: 'Easy to explain and scale across touchpoints.', risk: 'May feel too safe without one distinctive brand device.' },
    { name: 'Expressive difference', rationale: `Lead with the stated difference: ${withoutTerminalPunctuation(data.differentiator)}.`, positioning: 'A more visible and emotionally distinctive alternative to category conventions.', tone: 'Confident, lively and characteristic.', visualPrinciple: 'Contrasting rhythm, one recognizable graphic principle and bold hierarchy.', advantage: 'More memorable and differentiated.', risk: 'Test whether expressiveness reduces perceived trust for the audience.' }
  ];
}

export function buildLocalGeneration(rawData) {
  const data = sanitizeFormData(rawData);
  return { brief: buildLocalDraft(data), trust: buildLocalTrust(data), alternatives: buildLocalAlternatives(data) };
}
