export const FIELD_LIMITS = Object.freeze({
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
  'brandName',
  'business',
  'problem',
  'audience',
  'goal',
  'personality',
  'differentiator'
]);

export const BRIEF_KEYS = Object.freeze([
  'overview',
  'challenge',
  'audience',
  'insight',
  'positioning',
  'valueProposition',
  'personality',
  'tone',
  'messages',
  'visual',
  'deliverables',
  'risks',
  'nextSteps'
]);

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
  for (const field of REQUIRED_FIELDS) {
    if (!data[field]) errors[field] = 'required';
  }
  return { valid: Object.keys(errors).length === 0, data, errors };
}

export function validateBrief(input) {
  if (!input || typeof input !== 'object' || Array.isArray(input)) return false;
  const arrayKeys = new Set(['messages', 'nextSteps']);
  return BRIEF_KEYS.every(key => {
    const value = input[key];
    if (arrayKeys.has(key)) {
      return Array.isArray(value) && value.length === 3 && value.every(item => typeof item === 'string' && item.trim());
    }
    return typeof value === 'string' && value.trim();
  });
}

function list(value) {
  return value.split(',').map(item => item.trim()).filter(Boolean);
}

function withoutTerminalPunctuation(value) {
  return value.trim().replace(/[.!?…]+$/u, '');
}

export function buildLocalDraft(rawData) {
  const data = sanitizeFormData(rawData);
  const traits = list(data.personality);
  if (data.language === 'ru') {
    const traitLine = traits.slice(0, 4).join(', ') || 'ясный, уверенный, человечный';
    return {
      overview: `${data.brandName} — ${data.business}`,
      challenge: data.problem || `Сформулировать ясное и узнаваемое направление бренда для задачи «${data.goal.toLowerCase()}».`,
      audience: data.audience,
      insight: data.audienceNeed || 'Требуется подтвердить потребности, барьеры и критерии выбора аудитории в интервью или исследовании.',
      positioning: `${data.brandName} должен занимать понятную позицию в категории за счёт следующего отличия: ${withoutTerminalPunctuation(data.differentiator) || 'требуется уточнить подтверждаемое отличие бренда'}.`,
      valueProposition: `${data.brandName} помогает выбранной аудитории решить обозначенную задачу более уместным и последовательным способом. Конкретное обещание нужно подтвердить фактами и обратной связью клиентов.`,
      personality: traitLine,
      tone: `Коммуникация должна звучать ${traitLine}. Использовать конкретные формулировки, избегать неподтверждённых обещаний и шаблонного рекламного языка.`,
      messages: [
        `${data.brandName}: ясное решение обозначенной задачи.`,
        `Подход строится вокруг реального контекста аудитории: ${withoutTerminalPunctuation(data.audience)}.`,
        `${data.differentiator || 'Ключевое отличие бренда необходимо проверить и сформулировать точнее.'}`
      ],
      visual: `Визуальная система должна передавать качества «${traits.slice(0, 3).join(', ') || 'ясность, уверенность, человечность'}» через типографику, композицию, ритм, изображения и повторяемые элементы. ${data.avoid ? `Избегать: ${withoutTerminalPunctuation(data.avoid)}.` : 'Отдельно определить визуальные клише категории, которых следует избегать.'}`,
      deliverables: data.deliverables || 'Уточнить список носителей, форматов и технических требований до начала дизайн-концепции.',
      risks: `${data.proof ? `Опорные факты: ${withoutTerminalPunctuation(data.proof)}.` : 'Пока не указаны подтверждения ценности и отличий бренда.'} Не считать предположения о рынке и аудитории доказанными без исследования.`,
      nextSteps: [
        `Проверить вводные и спорные предположения с заказчиком.`,
        `Сравнить направление с 3–5 релевантными конкурентами${data.competitors ? `, включая ${data.competitors}` : ''}.`,
        `Собрать мудборд и проверить систему на одном ключевом носителе.`
      ]
    };
  }

  const traitLine = traits.slice(0, 4).join(', ') || 'clear, confident and human';
  return {
    overview: `${data.brandName} — ${data.business}`,
    challenge: data.problem || `Define a clear and recognizable brand direction for the goal: ${data.goal.toLowerCase()}.`,
    audience: data.audience,
    insight: data.audienceNeed || 'Audience needs, barriers and decision criteria still need to be validated through interviews or research.',
    positioning: `${data.brandName} should earn a clear place in its category through this stated difference: ${withoutTerminalPunctuation(data.differentiator) || 'a defensible brand difference still needs to be defined'}.`,
    valueProposition: `${data.brandName} helps its chosen audience address the stated challenge in a more relevant and consistent way. The specific promise should be validated with evidence and customer feedback.`,
    personality: traitLine,
    tone: `Communication should feel ${traitLine}. Use concrete language and avoid unsupported claims or generic advertising language.`,
    messages: [
      `${data.brandName}: a clearer response to the stated challenge.`,
      `Built around the real context of ${withoutTerminalPunctuation(data.audience)}.`,
      `${data.differentiator || 'The key brand difference must be validated and articulated more precisely.'}`
    ],
    visual: `The visual system should express ${traits.slice(0, 3).join(', ') || 'clarity, confidence and humanity'} through typography, composition, rhythm, imagery and repeatable assets. ${data.avoid ? `Avoid: ${withoutTerminalPunctuation(data.avoid)}.` : 'Identify category clichés that the system should avoid.'}`,
    deliverables: data.deliverables || 'Confirm the required touchpoints, formats and technical specifications before concept development.',
    risks: `${data.proof ? `Available proof: ${withoutTerminalPunctuation(data.proof)}.` : 'No proof points have been supplied yet.'} Do not present assumptions about the market or audience as research findings.`,
    nextSteps: [
      'Review the inputs and uncertain assumptions with the client.',
      `Compare the direction with 3–5 relevant competitors${data.competitors ? `, including ${data.competitors}` : ''}.`,
      'Build a moodboard and test the system on one priority touchpoint.'
    ]
  };
}
