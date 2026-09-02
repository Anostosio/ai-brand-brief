const form = document.getElementById('briefForm');
const exampleButton = document.getElementById('exampleButton');
const copyButton = document.getElementById('copyButton');
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

function normalizeWords(value) {
  return value
    .split(',')
    .map(item => item.trim())
    .filter(Boolean);
}

function buildBrief(data) {
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
    next: `Validate this direction against 3–5 real competitors, then turn it into a moodboard, message hierarchy and one key application. The next iteration should test whether the positioning is both distinctive and believable for the target audience.`
  };
}

function renderBrief(data) {
  const brief = buildBrief(data);
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
}

function getFormData() {
  return Object.fromEntries(Object.entries(fields).map(([key, element]) => [key, element.value.trim()]));
}

form.addEventListener('submit', event => {
  event.preventDefault();
  if (!form.reportValidity()) return;
  renderBrief(getFormData());
});

exampleButton.addEventListener('click', () => {
  Object.entries(example).forEach(([key, value]) => {
    fields[key].value = value;
  });
  renderBrief(example);
});

copyButton.addEventListener('click', async () => {
  const data = getFormData();
  const brief = buildBrief(data);
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