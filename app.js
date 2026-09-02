const form = document.getElementById('briefForm');
const exampleButton = document.getElementById('exampleButton');
const copyButton = document.getElementById('copyButton');
const editButton = document.getElementById('editButton');
const pdfButton = document.getElementById('pdfButton');
const submitButton = form.querySelector('button[type="submit"]');
const submitLabel = submitButton.querySelector('span:first-child');
const statusText = document.getElementById('generationStatus');
const emptyState = document.getElementById('emptyState');
const result = document.getElementById('result');
const resultTitle = document.getElementById('resultTitle');
const language = document.body.dataset.lang === 'ru' ? 'ru' : 'en';

const fields = {
  brandName: document.getElementById('brandName'),
  business: document.getElementById('business'),
  audience: document.getElementById('audience'),
  market: document.getElementById('market'),
  goal: document.getElementById('goal'),
  personality: document.getElementById('personality'),
  competitors: document.getElementById('competitors'),
  avoid: document.getElementById('avoid')
};

const outputs = {
  summary: document.getElementById('summaryOutput'),
  audience: document.getElementById('audienceOutput'),
  positioning: document.getElementById('positioningOutput'),
  tone: document.getElementById('toneOutput'),
  messages: document.getElementById('messagesOutput'),
  visual: document.getElementById('visualOutput'),
  next: document.getElementById('nextOutput')
};

const copy = {
  en: {
    example: {
      brandName: 'Mellow Club',
      business: 'A subscription-based digital wellbeing service that gives remote workers short guided reset sessions, focus rituals and low-pressure productivity tools.',
      audience: 'Remote professionals aged 24–38 who feel mentally overloaded but dislike aggressive productivity culture.',
      market: 'Europe, English-speaking digital market',
      goal: 'Launch a new brand',
      personality: 'calm, intelligent, warm, contemporary, quietly premium',
      competitors: 'Headspace, Calm, productivity apps and coworking communities',
      avoid: 'Wellness clichés, pastel gradients, mystical language, hustle culture and corporate HR tone.'
    },
    titleSuffix: 'starter direction',
    generating: 'Generating…',
    waiting: 'Turning your answers into a structured direction…',
    aiStatus: 'Generated with AI · strategic starter direction, not market research.',
    demoStatus: 'Demo fallback used · connect the server-side API key for live AI generation.',
    generate: 'Generate brand direction',
    edit: 'Edit result',
    done: 'Done editing',
    copied: 'Copied',
    copyFailed: 'Copy failed',
    copyLabel: 'Copy',
    pdf: 'Save PDF'
  },
  ru: {
    example: {
      brandName: 'Mellow Club',
      business: 'Цифровой wellness-сервис по подписке для удалённых специалистов: короткие практики восстановления, ритуалы для фокуса и спокойные инструменты продуктивности.',
      audience: 'Удалённые специалисты 24–38 лет, которые перегружены, но не принимают агрессивную культуру продуктивности.',
      market: 'Европа, онлайн',
      goal: 'Запуск нового бренда',
      personality: 'спокойный, умный, тёплый, современный, сдержанно-премиальный',
      competitors: 'Headspace, Calm, приложения для продуктивности и coworking-сообщества',
      avoid: 'Wellness-клише, пастельные градиенты, мистический язык, hustle-культура и корпоративный HR-тон.'
    },
    titleSuffix: 'стартовое направление',
    generating: 'Генерируем…',
    waiting: 'Превращаем ответы в структурированное направление бренда…',
    aiStatus: 'Сгенерировано ИИ · это стартовое стратегическое направление, а не исследование рынка.',
    demoStatus: 'Использован демо-режим · для живой AI-генерации нужен серверный API-ключ.',
    generate: 'Сгенерировать направление',
    edit: 'Редактировать',
    done: 'Готово',
    copied: 'Скопировано',
    copyFailed: 'Не удалось скопировать',
    copyLabel: 'Копировать',
    pdf: 'Сохранить PDF'
  }
}[language];

let latestBrief = null;
let editing = false;

function normalizeWords(value) {
  return value.split(',').map(item => item.trim()).filter(Boolean);
}

function buildDemoBrief(data) {
  const traits = normalizeWords(data.personality);
  if (language === 'ru') {
    const traitText = traits.slice(0, 4).join(', ') || 'ясный, уверенный и человечный';
    const visualTraits = traits.slice(0, 3).join(', ') || 'ясность, уверенность и тепло';
    return {
      summary: `${data.brandName} — бренд с характером «${traits.slice(0, 2).join(', ') || 'ясный и человечный'}», построенный вокруг идеи: ${data.business} Главная задача — ${data.goal.toLowerCase()}${data.market ? ` на рынке ${data.market}` : ''}.`,
      audience: `Фокус — ${data.audience}. Коммуникация должна учитывать реальный контекст и мотивацию этой аудитории, не перегружая её объяснениями. Ценность бренда должна считываться быстро и быть связана с повседневными задачами людей.`,
      positioning: `${data.brandName} стоит позиционировать как более продуманный и понятный выбор в своей категории. ${data.competitors ? `На фоне ${data.competitors} важно конкурировать за счёт ясности, уместности и собственного угла зрения.` : 'Важно избегать универсальных формул категории и строить более заметную точку зрения.'}`,
      tone: `Тон бренда: ${traitText}. Формулировки — конкретные, естественные и уверенные, без перегретых обещаний и рекламной надменности.`,
      messages: [
        `${data.brandName} делает сложную потребность понятнее и удобнее.`,
        `Решение строится вокруг реальных приоритетов аудитории: ${data.audience.toLowerCase()}.`,
        `${data.goal} без шаблонного языка категории.`
      ],
      visual: `Визуальная система должна опираться на ${visualTraits}. Используйте дисциплинированную иерархию, выразительную типографику, осмысленный контраст и ограниченный набор повторяемых графических приёмов. ${data.avoid ? `Важно избегать: ${data.avoid.toLowerCase()}.` : 'Важно избегать визуальных клише и лишнего шума.'}`,
      next: 'Сверить это направление с 3–5 реальными конкурентами, затем собрать мудборд, иерархию сообщений и один ключевой носитель. Следующий шаг должен проверить, насколько позиционирование одновременно отличается от рынка и выглядит правдоподобно для аудитории.'
    };
  }

  const mainTrait = traits[0] || 'clear';
  const secondaryTrait = traits[1] || 'human';
  const market = data.market ? ` in ${data.market}` : '';
  const competitorContext = data.competitors
    ? `Unlike ${data.competitors}, the brand should compete through clarity, relevance and a more distinct point of view.`
    : 'The brand should avoid generic category conventions and compete through clarity, relevance and a distinct point of view.';
  const avoidText = data.avoid
    ? `The system should deliberately avoid ${data.avoid.toLowerCase()}.`
    : 'The system should avoid category clichés and visual noise.';

  return {
    summary: `${data.brandName} is a ${mainTrait}, ${secondaryTrait} brand built around ${data.business.charAt(0).toLowerCase()}${data.business.slice(1)} Its immediate objective is to ${data.goal.toLowerCase()}${market}.`,
    audience: `Focus on ${data.audience}. Communication should recognise their existing context and motivations rather than over-explaining the category. The strongest messages will make the value feel immediately relevant to their everyday decisions.`,
    positioning: `${data.brandName} should position itself as the more thoughtful and useful choice in its category: strategically clear, easy to understand and emotionally aligned with the audience. ${competitorContext}`,
    tone: `Use a ${traits.slice(0, 4).join(', ') || 'clear, confident and human'} tone. Prefer concise language, specific benefits and natural phrasing. The voice should feel self-assured without sounding inflated, sales-heavy or impersonal.`,
    messages: [
      `${data.brandName} turns a complicated need into a clearer, easier experience.`,
      `Designed around the real priorities of ${data.audience.toLowerCase()}.`,
      `${data.goal} without relying on generic category language.`
    ],
    visual: `Build a visual system around ${traits.slice(0, 3).join(', ') || 'clarity, confidence and warmth'}. Use a disciplined hierarchy, distinctive typography, purposeful contrast and a limited set of repeatable graphic behaviours. ${avoidText}`,
    next: 'Validate this direction against 3–5 real competitors, then turn it into a moodboard, message hierarchy and one key application. The next iteration should test whether the positioning is both distinctive and believable for the target audience.'
  };
}

function renderBrief(data, brief, mode = 'ai') {
  latestBrief = brief;
  resultTitle.textContent = `${data.brandName} — ${copy.titleSuffix}`;
  outputs.summary.textContent = brief.summary;
  outputs.audience.textContent = brief.audience;
  outputs.positioning.textContent = brief.positioning;
  outputs.tone.textContent = brief.tone;
  outputs.visual.textContent = brief.visual;
  outputs.next.textContent = brief.next;
  outputs.messages.replaceChildren(...brief.messages.map(message => {
    const li = document.createElement('li');
    li.textContent = message;
    return li;
  }));
  emptyState.hidden = true;
  result.hidden = false;
  copyButton.disabled = false;
  editButton.disabled = false;
  pdfButton.disabled = false;
  statusText.textContent = mode === 'ai' ? copy.aiStatus : copy.demoStatus;
}

function getFormData() {
  return { ...Object.fromEntries(Object.entries(fields).map(([key, element]) => [key, element.value.trim()])), language };
}

function syncEditedBrief() {
  latestBrief = {
    summary: outputs.summary.textContent.trim(),
    audience: outputs.audience.textContent.trim(),
    positioning: outputs.positioning.textContent.trim(),
    tone: outputs.tone.textContent.trim(),
    messages: [...outputs.messages.querySelectorAll('li')].map(li => li.textContent.trim()),
    visual: outputs.visual.textContent.trim(),
    next: outputs.next.textContent.trim()
  };
}

function setEditing(nextState) {
  editing = nextState;
  document.querySelectorAll('[data-editable]').forEach(node => node.setAttribute('contenteditable', String(editing)));
  editButton.textContent = editing ? copy.done : copy.edit;
  if (!editing) syncEditedBrief();
}

async function generateWithAI(data) {
  const response = await fetch('/api/generate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
  const payload = await response.json().catch(() => ({}));
  if (!response.ok || !payload.brief) throw new Error(payload.error || 'AI generation is unavailable.');
  return payload.brief;
}

async function handleGeneration(data) {
  setEditing(false);
  submitButton.disabled = true;
  submitLabel.textContent = copy.generating;
  statusText.textContent = copy.waiting;
  try {
    renderBrief(data, await generateWithAI(data), 'ai');
  } catch (error) {
    console.warn(error);
    renderBrief(data, buildDemoBrief(data), 'demo');
  } finally {
    submitButton.disabled = false;
    submitLabel.textContent = copy.generate;
  }
}

form.addEventListener('submit', async event => {
  event.preventDefault();
  if (!form.reportValidity()) return;
  await handleGeneration(getFormData());
});

exampleButton.addEventListener('click', async () => {
  Object.entries(copy.example).forEach(([key, value]) => { fields[key].value = value; });
  await handleGeneration(getFormData());
});

editButton.addEventListener('click', () => setEditing(!editing));

copyButton.addEventListener('click', async () => {
  syncEditedBrief();
  const data = getFormData();
  const brief = latestBrief || buildDemoBrief(data);
  const labels = language === 'ru'
    ? ['ОПИСАНИЕ БРЕНДА', 'АУДИТОРИЯ', 'ПОЗИЦИОНИРОВАНИЕ', 'ТОН КОММУНИКАЦИИ', 'КЛЮЧЕВЫЕ СООБЩЕНИЯ', 'ВИЗУАЛЬНОЕ НАПРАВЛЕНИЕ', 'СЛЕДУЮЩИЙ ШАГ']
    : ['BRAND SUMMARY', 'AUDIENCE FOCUS', 'POSITIONING DIRECTION', 'TONE OF VOICE', 'KEY MESSAGES', 'VISUAL DIRECTION', 'NEXT STEP'];
  const text = [
    `${data.brandName} — AI Brand Brief`, '',
    `${labels[0]}\n${brief.summary}`, '',
    `${labels[1]}\n${brief.audience}`, '',
    `${labels[2]}\n${brief.positioning}`, '',
    `${labels[3]}\n${brief.tone}`, '',
    `${labels[4]}\n${brief.messages.map(item => `• ${item}`).join('\n')}`, '',
    `${labels[5]}\n${brief.visual}`, '',
    `${labels[6]}\n${brief.next}`
  ].join('\n');

  try {
    await navigator.clipboard.writeText(text);
    copyButton.textContent = copy.copied;
    setTimeout(() => { copyButton.textContent = copy.copyLabel; }, 1400);
  } catch {
    copyButton.textContent = copy.copyFailed;
  }
});

pdfButton.addEventListener('click', () => {
  if (editing) setEditing(false);
  syncEditedBrief();
  window.print();
});