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

function list(value) {
  return String(value || '').split(/[,;\n]/u).map(item => item.trim()).filter(Boolean);
}

function trimSentence(value) {
  return String(value || '').trim().replace(/[.!?…]+$/u, '');
}

function sentence(value) {
  const clean = trimSentence(value);
  return clean ? `${clean}.` : '';
}

function lowerLead(value, fallback = '') {
  const clean = trimSentence(value) || fallback;
  if (!clean) return '';
  return clean.charAt(0).toLowerCase() + clean.slice(1);
}

function trustItem(status, sources, note = '') {
  return { status, sources: sources.filter(source => Object.hasOwn(FIELD_LIMITS, source)), note };
}

function projectFrame(data, ru) {
  const frames = ru ? {
    'new-brand': 'сформировать понятную стартовую позицию и систему, которую можно последовательно запустить',
    rebrand: 'обновить восприятие бренда, сохранив полезную накопленную ценность',
    campaign: 'свести коммуникационную задачу к одному ясному сообщению и реакции аудитории',
    'personal-brand': 'связать экспертизу, доверие и узнаваемый голос в последовательную систему',
    'digital-product': 'связать обещание бренда с реальным продуктовым опытом и поведением интерфейса',
    packaging: 'сделать ценность и отличие понятными в условиях быстрого выбора и ограниченной поверхности'
  } : {
    'new-brand': 'establish a clear launch position and a system that can scale consistently',
    rebrand: 'change perception while protecting useful existing brand equity',
    campaign: 'reduce the communication challenge to one clear message and audience response',
    'personal-brand': 'connect expertise, trust and a recognizable voice into one consistent system',
    'digital-product': 'connect the brand promise to the actual product experience and interface behavior',
    packaging: 'make value and difference legible in a fast-choice, constrained physical context'
  };
  return frames[data.projectType] || (ru ? 'свести вводные к ясной стратегической системе' : 'turn the supplied context into a clear strategic system');
}

function evidenceLine(data, ru) {
  if (data.proof) return ru
    ? `Опора из вводных: ${sentence(data.proof)}`
    : `Supplied proof: ${sentence(data.proof)}`;
  return ru
    ? 'Подтверждающие факты пока не указаны; ключевое обещание следует считать гипотезой до проверки.'
    : 'No supporting proof was supplied; the core promise should remain a hypothesis until validated.';
}

function marketLine(data, ru) {
  if (!data.market) return '';
  return ru ? ` Контекст рынка: ${sentence(data.market)}` : ` Market context: ${sentence(data.market)}`;
}

function competitorLine(data, ru) {
  if (!data.competitors) return ru
    ? 'Конкурентное поле не описано, поэтому сравнительные выводы требуют отдельной проверки.'
    : 'The competitive field was not supplied, so comparative conclusions require separate validation.';
  return ru
    ? `Сравнивать направление прежде всего с указанными альтернативами: ${sentence(data.competitors)}`
    : `Compare the direction first against the supplied alternatives: ${sentence(data.competitors)}`;
}

export function buildLocalTrust(data) {
  const hasNeed = Boolean(data.audienceNeed);
  const hasProof = Boolean(data.proof);
  const hasScope = Boolean(data.deliverables);
  const hasCompetitors = Boolean(data.competitors);
  const ru = data.language === 'ru';
  return {
    overview: trustItem('grounded', ['projectType', 'brandName', 'business', 'goal', 'market']),
    challenge: trustItem('mixed', ['problem', 'goal', 'projectType'], ru ? 'Стратегический фокус сформулирован из задачи и типа проекта.' : 'Strategic focus is derived from the supplied challenge and project type.'),
    audience: trustItem('grounded', ['audience']),
    insight: trustItem(hasNeed ? 'mixed' : 'needs-validation', hasNeed ? ['audience', 'audienceNeed'] : ['audience'], hasNeed ? (ru ? 'Потребность указана пользователем, но интерпретация требует проверки.' : 'The need is supplied, but its interpretation still requires validation.') : (ru ? 'Потребность или барьер аудитории не указаны.' : 'No audience need or barrier was supplied.')),
    positioning: trustItem(hasProof && hasCompetitors ? 'mixed' : 'hypothesis', ['audience', 'differentiator', 'competitors', 'proof'], hasProof ? (ru ? 'Позиционирование использует указанные доказательства, но не заменяет проверку рынка.' : 'Positioning uses supplied proof but does not replace market validation.') : (ru ? 'Для позиционирования нет подтверждающего факта.' : 'No supporting proof was supplied for the positioning direction.')),
    valueProposition: trustItem(hasProof ? 'mixed' : 'hypothesis', ['business', 'audience', 'audienceNeed', 'differentiator', 'proof']),
    personality: trustItem('grounded', ['personality']),
    tone: trustItem('mixed', ['personality', 'audience', 'avoid']),
    messages: trustItem(hasProof ? 'mixed' : 'hypothesis', ['brandName', 'audience', 'differentiator', 'proof']),
    visual: trustItem('hypothesis', ['projectType', 'personality', 'avoid', 'deliverables'], ru ? 'Визуальное направление — рабочая гипотеза для концепт-теста.' : 'Visual direction is a working hypothesis for concept testing.'),
    deliverables: trustItem(hasScope ? 'grounded' : 'needs-validation', ['deliverables', 'notes']),
    risks: trustItem('mixed', ['proof', 'competitors', 'notes', 'avoid']),
    nextSteps: trustItem('hypothesis', ['goal', 'competitors', 'deliverables', 'notes'], ru ? 'Следующие шаги предложены как рабочий процесс и должны учитывать реальные сроки и бюджет.' : 'Next steps are a proposed working process and should be adapted to real timing and budget.')
  };
}

export function buildLocalDraft(rawData) {
  const data = sanitizeFormData(rawData);
  const traits = list(data.personality);
  const avoids = list(data.avoid);
  const traitLine = traits.slice(0, 4).join(', ');
  const frameRu = projectFrame(data, true);
  const frameEn = projectFrame(data, false);

  if (data.language === 'ru') {
    const personality = traitLine || 'ясный, уверенный, человечный';
    const audienceTension = data.audienceNeed
      ? `Из вводных видно напряжение: ${sentence(data.audienceNeed)} Это стоит проверить на реальных разговорах или данных, прежде чем превращать в инсайт.`
      : 'Ключевая потребность или барьер аудитории не описаны. До проверки это главный пробел брифа, а не готовый инсайт.';
    const avoidLine = avoids.length
      ? `Избегать ${avoids.slice(0, 4).join(', ')}.`
      : 'На этапе концепции отдельно определить клише категории и нежелательные визуальные коды.';
    const scope = data.deliverables
      ? `${sentence(data.deliverables)} Для каждого носителя сначала определить роль в системе, а затем уже визуальный приём.`
      : 'Носители пока не зафиксированы. До разработки концепции определить приоритетный набор форматов и технические ограничения.';

    return {
      overview: `${data.brandName} — ${sentence(data.business)} Цель проекта: ${lowerLead(data.goal)}.${marketLine(data, true)}`,
      challenge: `${sentence(data.problem)} Стратегическая задача — ${frameRu}, а не просто выбрать визуальный стиль.`,
      audience: `${sentence(data.audience)} Бриф должен проверять решения относительно их контекста выбора, а не относительно усреднённого «пользователя».`,
      insight: audienceTension,
      positioning: `${data.brandName} может строить позицию вокруг заявленного отличия: ${sentence(data.differentiator)} ${competitorLine(data, true)} ${evidenceLine(data, true)}`,
      valueProposition: `Для аудитории — ${lowerLead(data.audience)} — ценность должна быть связана не только с тем, что предлагает продукт, но и с причиной выбрать его: ${sentence(data.differentiator)} ${data.audienceNeed ? `Особенно важно отвечать на обозначенную потребность: ${sentence(data.audienceNeed)}` : 'Потребность аудитории необходимо уточнить до формулировки окончательного обещания.'}`,
      personality,
      tone: `Голос бренда: ${personality}. Формулировки должны быть конкретными, показывать заявленное отличие и не выдавать предположения за факты. ${avoids.length ? `Не использовать в тоне и сообщениях: ${avoids.slice(0, 4).join(', ')}.` : ''}`.trim(),
      messages: [
        `${data.brandName}: ${sentence(data.differentiator)}`,
        data.audienceNeed ? `Для ${lowerLead(data.audience)}: ${sentence(data.audienceNeed)}` : `Для ${lowerLead(data.audience)}: показать ценность через конкретный сценарий использования, а не абстрактное обещание.`,
        data.proof ? `Подтверждение: ${sentence(data.proof)}` : 'Доказательство обещания: определить факт, кейс, процесс или обратную связь, которые можно проверить.'
      ],
      visual: `Рабочая гипотеза: перевести качества «${traits.slice(0, 3).join(', ') || 'ясность, уверенность, человечность'}» в систему через типографику, композицию, ритм, изображения и один повторяемый отличительный принцип. ${avoidLine} Визуальный приём должен поддерживать ${frameRu}.`,
      deliverables: scope,
      risks: `${evidenceLine(data, true)} ${competitorLine(data, true)} ${data.notes ? `Дополнительный контекст, который может повлиять на решение: ${sentence(data.notes)}` : 'Сроки, согласующие стороны и обязательные элементы не описаны полностью.'}`,
      nextSteps: [
        data.audienceNeed ? 'Проверить заявленную потребность и критерии выбора аудитории на 3–5 реальных примерах, разговорах или доступных данных.' : 'Сформулировать и проверить потребность, барьер и критерии выбора аудитории.',
        data.competitors ? `Разобрать указанные альтернативы — ${trimSentence(data.competitors)} — по обещанию, доказательствам и визуальным кодам, не копируя их.` : 'Собрать 3–5 релевантных альтернатив и сравнить их обещание, доказательства и визуальные коды.',
        data.deliverables ? `Проверить выбранное направление минимум на одном приоритетном носителе: ${trimSentence(data.deliverables)}.` : 'Выбрать один приоритетный носитель и проверить на нём стратегию, сообщения и визуальную систему.'
      ]
    };
  }

  const personality = traitLine || 'clear, confident and human';
  const audienceTension = data.audienceNeed
    ? `The supplied tension is: ${sentence(data.audienceNeed)} Validate it with real conversations or evidence before treating it as an audience insight.`
    : 'The core audience need or barrier has not been supplied. Treat that as the main evidence gap, not as a completed insight.';
  const avoidLine = avoids.length
    ? `Avoid ${avoids.slice(0, 4).join(', ')}.`
    : 'Define category clichés and unwanted visual codes during concept development.';
  const scope = data.deliverables
    ? `${sentence(data.deliverables)} Define the role of each touchpoint before choosing its visual treatment.`
    : 'Touchpoints are not fixed yet. Confirm the priority formats and technical constraints before concept development.';

  return {
    overview: `${data.brandName} — ${sentence(data.business)} Project goal: ${lowerLead(data.goal)}.${marketLine(data, false)}`,
    challenge: `${sentence(data.problem)} The strategic task is to ${frameEn}, not simply to choose a visual style.`,
    audience: `${sentence(data.audience)} Judge decisions against the audience's actual choice context rather than an abstract average user.`,
    insight: audienceTension,
    positioning: `${data.brandName} can build its position around the stated difference: ${sentence(data.differentiator)} ${competitorLine(data, false)} ${evidenceLine(data, false)}`,
    valueProposition: `For ${lowerLead(data.audience)}, value should connect what the offer does with the reason to choose it: ${sentence(data.differentiator)} ${data.audienceNeed ? `It should directly address the stated need: ${sentence(data.audienceNeed)}` : 'Clarify the audience need before locking the final promise.'}`,
    personality,
    tone: `Brand voice: ${personality}. Use concrete language, foreground the stated difference and never present assumptions as facts. ${avoids.length ? `Avoid in wording and message behavior: ${avoids.slice(0, 4).join(', ')}.` : ''}`.trim(),
    messages: [
      `${data.brandName}: ${sentence(data.differentiator)}`,
      data.audienceNeed ? `For ${lowerLead(data.audience)}: ${sentence(data.audienceNeed)}` : `For ${lowerLead(data.audience)}: demonstrate value through a concrete use context rather than a generic promise.`,
      data.proof ? `Proof: ${sentence(data.proof)}` : 'Proof to establish: identify a verifiable fact, case, process or customer signal behind the promise.'
    ],
    visual: `Working hypothesis: translate ${traits.slice(0, 3).join(', ') || 'clarity, confidence and humanity'} into a system through typography, composition, rhythm, imagery and one repeatable distinctive principle. ${avoidLine} The visual device should help ${frameEn}.`,
    deliverables: scope,
    risks: `${evidenceLine(data, false)} ${competitorLine(data, false)} ${data.notes ? `Additional context that may affect the direction: ${sentence(data.notes)}` : 'Timing, stakeholders and mandatory elements are not fully specified.'}`,
    nextSteps: [
      data.audienceNeed ? 'Validate the stated audience need and decision criteria using 3–5 real examples, conversations or available evidence.' : 'Define and validate the audience need, barrier and decision criteria.',
      data.competitors ? `Review the supplied alternatives — ${trimSentence(data.competitors)} — by promise, proof and visual codes without copying them.` : 'Collect 3–5 relevant alternatives and compare their promise, proof and visual codes.',
      data.deliverables ? `Test the chosen direction on at least one priority touchpoint: ${trimSentence(data.deliverables)}.` : 'Choose one priority touchpoint and test the strategy, messages and visual system there.'
    ]
  };
}

export function buildLocalAlternatives(rawData) {
  const data = sanitizeFormData(rawData);
  const hasProof = Boolean(data.proof);
  if (data.language === 'ru') return [
    {
      name: 'Ясность и доверие',
      rationale: `Снизить усилие выбора: быстро объяснить, что такое ${data.brandName}, для кого он и почему заслуживает внимания.`,
      positioning: `Понятный и надёжный выбор для аудитории: ${trimSentence(data.audience)}.`,
      tone: 'Спокойный, конкретный, уверенный без давления.',
      visualPrinciple: 'Строгая сетка, ясная типографика, контролируемый контраст и повторяемые функциональные элементы.',
      advantage: 'Облегчает понимание предложения и масштабируется на разные носители.',
      risk: 'Без одного сильного отличительного приёма направление может выглядеть слишком безопасным.'
    },
    {
      name: 'Отличие как система',
      rationale: `Сделать главным заявленное отличие — ${trimSentence(data.differentiator)} — и подчинить ему сообщения и визуальный принцип.`,
      positioning: `Более заметная альтернатива привычным решениям категории${data.competitors ? ` рядом с ${trimSentence(data.competitors)}` : ''}.`,
      tone: 'Характерный, точный, более выразительный, но без неподтверждённых заявлений.',
      visualPrinciple: 'Один узнаваемый графический принцип, заметная иерархия и контрастный ритм, который повторяется на всех ключевых носителях.',
      advantage: 'Повышает шанс запомниться и быстрее связывает визуальную систему с заявленным отличием.',
      risk: hasProof ? 'Нужно проверить, сохраняется ли доверие при более выразительной подаче.' : 'Без доказательств сильная подача может сделать обещание менее убедительным.'
    }
  ];

  return [
    {
      name: 'Clarity and trust',
      rationale: `Reduce decision effort by making ${data.brandName}, its audience and reason to care immediately understandable.`,
      positioning: `A clear and dependable choice for ${trimSentence(data.audience)}.`,
      tone: 'Calm, concrete and confident without pressure.',
      visualPrinciple: 'Disciplined grid, legible typography, controlled contrast and repeatable functional assets.',
      advantage: 'Makes the offer easier to understand and scales cleanly across touchpoints.',
      risk: 'Without one strong distinctive device, the direction may feel too safe.'
    },
    {
      name: 'Difference as a system',
      rationale: `Lead with the stated difference — ${trimSentence(data.differentiator)} — and make messages and visual behavior reinforce it.`,
      positioning: `A more noticeable alternative to familiar category choices${data.competitors ? ` such as ${trimSentence(data.competitors)}` : ''}.`,
      tone: 'Distinctive, precise and more expressive without unsupported claims.',
      visualPrinciple: 'One recognizable graphic principle, decisive hierarchy and contrasting rhythm repeated across priority touchpoints.',
      advantage: 'Improves memorability and links the visual system more directly to the stated difference.',
      risk: hasProof ? 'Test whether the more expressive presentation still preserves trust.' : 'Without proof, a stronger presentation may make the promise feel less credible.'
    }
  ];
}

export function buildLocalGeneration(rawData) {
  const data = sanitizeFormData(rawData);
  return { brief: buildLocalDraft(data), trust: buildLocalTrust(data), alternatives: buildLocalAlternatives(data) };
}
