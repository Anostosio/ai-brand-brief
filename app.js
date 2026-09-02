const form = document.getElementById('briefForm');
const exampleButton = document.getElementById('exampleButton');
const copyButton = document.getElementById('copyButton');
const submitButton = form.querySelector('button[type="submit"]');
const submitLabel = submitButton.querySelector('span:first-child');
const statusText = document.getElementById('generationStatus');
const emptyState = document.getElementById('emptyState');
const result = document.getElementById('result');
const resultTitle = document.getElementById('resultTitle');

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

const example = {
  brandName: 'Mellow Club',
  business: 'A subscription-based digital wellbeing service that gives remote workers short guided reset sessions, focus rituals and low-pressure productivity tools.',
  audience: 'Remote professionals aged 24–38 who feel mentally overloaded but dislike aggressive productivity culture.',
  market: 'Europe, English-speaking digital market',
  goal: 'Launch a new brand',
  personality: 'calm, intelligent, warm, contemporary, quietly premium',
  competitors: 'Headspace, Calm, productivity apps and coworking communities',
  avoid: 'Wellness clichés, pastel gradients, mystical language, hustle culture and corporate HR tone.'
};

let latestBrief = null;

function normalizeWords(value) {
  return value
    .split(',')
    .map(item => item.trim())
    .filter(Boolean);
}

function buildDemoBrief(data) {
  const traits = normalizeWords(data.personality);
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
  resultTitle.textContent = `${data.brandName} — starter direction`;
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
  statusText.textContent = mode === 'ai'
    ? 'Generated with AI · strategic starter direction, not market research.'
    : 'Demo fallback used · connect the server-side API key for live AI generation.';
}

function getFormData() {
  return Object.fromEntries(Object.entries(fields).map(([key, element]) => [key, element.value.trim()]));
}

async function generateWithAI(data) {
  const response = await fetch('/api/generate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });

  const payload = await response.json().catch(() => ({}));
  if (!response.ok || !payload.brief) {
    throw new Error(payload.error || 'AI generation is unavailable.');
  }

  return payload.brief;
}

async function handleGeneration(data) {
  submitButton.disabled = true;
  submitLabel.textContent = 'Generating…';
  statusText.textContent = 'Turning your answers into a structured direction…';

  try {
    const brief = await generateWithAI(data);
    renderBrief(data, brief, 'ai');
  } catch (error) {
    console.warn(error);
    renderBrief(data, buildDemoBrief(data), 'demo');
  } finally {
    submitButton.disabled = false;
    submitLabel.textContent = 'Generate brand direction';
  }
}

form.addEventListener('submit', async event => {
  event.preventDefault();
  if (!form.reportValidity()) return;
  await handleGeneration(getFormData());
});

exampleButton.addEventListener('click', async () => {
  Object.entries(example).forEach(([key, value]) => {
    fields[key].value = value;
  });
  await handleGeneration(example);
});

copyButton.addEventListener('click', async () => {
  const data = getFormData();
  const brief = latestBrief || buildDemoBrief(data);
  const text = [
    `${data.brandName} — AI Brand Brief`,
    '',
    `BRAND SUMMARY\n${brief.summary}`,
    '',
    `AUDIENCE FOCUS\n${brief.audience}`,
    '',
    `POSITIONING DIRECTION\n${brief.positioning}`,
    '',
    `TONE OF VOICE\n${brief.tone}`,
    '',
    `KEY MESSAGES\n${brief.messages.map(item => `• ${item}`).join('\n')}`,
    '',
    `VISUAL DIRECTION\n${brief.visual}`,
    '',
    `NEXT STEP\n${brief.next}`
  ].join('\n');

  try {
    await navigator.clipboard.writeText(text);
    const original = copyButton.textContent;
    copyButton.textContent = 'Copied';
    setTimeout(() => { copyButton.textContent = original; }, 1400);
  } catch {
    copyButton.textContent = 'Copy failed';
  }
});