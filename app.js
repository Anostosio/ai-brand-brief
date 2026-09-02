import {
  BRIEF_KEYS,
  FIELD_LIMITS,
  REQUIRED_FIELDS,
  buildLocalDraft,
  sanitizeFormData,
  validateBrief,
  validateFormData
} from './lib/brief-core.js';

const language = document.body.dataset.lang === 'ru' ? 'ru' : 'en';
const form = document.getElementById('briefForm');
const formPanel = document.querySelector('.form-panel');
const resultPanel = document.querySelector('.result-panel');
const submitButton = form.querySelector('button[type="submit"]');
const submitLabel = submitButton.querySelector('span:first-child');
const fields = Object.fromEntries(Object.keys(FIELD_LIMITS).map(key => [key, document.getElementById(key)]));
const outputs = Object.fromEntries(BRIEF_KEYS.map(key => [key, document.getElementById(`${key}Output`)]));

const ui = {
  en: {
    example: {
      brandName: 'Mellow Club',
      business: 'A subscription-based digital wellbeing service with short guided reset sessions, focus rituals and low-pressure productivity tools for remote workers.',
      problem: 'The category often frames wellbeing as another performance target. The new brand must feel useful and credible without adding pressure or sounding clinical.',
      audience: 'Remote professionals aged 24–38 who feel mentally overloaded but reject aggressive productivity culture.',
      audienceNeed: 'They want a practical way to reset during the workday, but long routines and exaggerated wellness promises feel unrealistic.',
      market: 'Europe, English-speaking digital market',
      goal: 'Launch a new brand',
      personality: 'calm, intelligent, warm, contemporary, quietly premium',
      competitors: 'Headspace, Calm, productivity apps, coworking communities and free video content',
      differentiator: 'Five-minute reset rituals designed specifically for the rhythms and constraints of remote work.',
      proof: 'Sessions are designed with an occupational wellbeing advisor; an early pilot included 42 remote professionals.',
      deliverables: 'Core identity, landing page, onboarding screens and social launch templates',
      avoid: 'Pastel wellness gradients, mystical language, hustle culture, medical claims and corporate HR tone.',
      notes: 'The first launch is planned as a small paid pilot. The identity must work in a compact mobile interface.'
    },
    complete: value => `${value}% complete`,
    saved: 'Draft saved locally',
    notSaved: 'Draft not saved',
    requiredError: 'Complete all required fields before generating the brief.',
    generate: 'Generate working brief',
    generating: 'Building brief…',
    edit: 'Edit',
    done: 'Done editing',
    copy: 'Copy',
    copied: 'Copied',
    copyFailed: 'Copy failed',
    aiMeta: date => `AI working draft · ${date}`,
    localMeta: date => `Local structured draft · ${date} · no AI`,
    errorTitle: 'AI generation is unavailable',
    errorText: 'Your answers are still saved. Retry the request or create a clearly labelled local draft without AI.',
    historyPlaceholder: 'Recent briefs',
    clearConfirm: 'Clear the questionnaire and its saved draft?',
    titleSuffix: 'working brand brief',
    labels: ['PROJECT OVERVIEW', 'CORE CHALLENGE', 'AUDIENCE', 'AUDIENCE INSIGHT', 'POSITIONING DIRECTION', 'VALUE PROPOSITION', 'BRAND PERSONALITY', 'TONE OF VOICE', 'KEY MESSAGES', 'VISUAL DIRECTION', 'DELIVERABLES', 'RISKS AND UNKNOWNS', 'NEXT STEPS']
  },
  ru: {
    example: {
      brandName: 'Mellow Club',
      business: 'Цифровой wellness-сервис по подписке с короткими практиками восстановления, ритуалами для фокуса и спокойными инструментами продуктивности для удалённых специалистов.',
      problem: 'Категория часто превращает заботу о себе в ещё одну гонку за эффективностью. Новый бренд должен быть полезным и убедительным, но не давить и не звучать клинически.',
      audience: 'Удалённые специалисты 24–38 лет, которые перегружены, но не принимают агрессивную культуру продуктивности.',
      audienceNeed: 'Им нужен реалистичный способ восстановиться в течение рабочего дня, но длинные практики и громкие wellness-обещания кажутся неуместными.',
      market: 'Европа, англоязычный онлайн-рынок',
      goal: 'Запуск нового бренда',
      personality: 'спокойный, умный, тёплый, современный, сдержанно-премиальный',
      competitors: 'Headspace, Calm, приложения для продуктивности, coworking-сообщества и бесплатный видеоконтент',
      differentiator: 'Пятиминутные ритуалы восстановления, разработанные именно под ритм и ограничения удалённой работы.',
      proof: 'Практики разработаны вместе со специалистом по wellbeing на рабочем месте; в раннем пилоте участвовали 42 удалённых специалиста.',
      deliverables: 'Айдентика, лендинг, onboarding-экраны и шаблоны для запуска в соцсетях',
      avoid: 'Пастельные wellness-градиенты, мистический язык, hustle-культура, медицинские обещания и корпоративный HR-тон.',
      notes: 'Первый запуск планируется как небольшой платный пилот. Айдентика должна работать в компактном мобильном интерфейсе.'
    },
    complete: value => `Заполнено ${value}%`,
    saved: 'Черновик сохранён локально',
    notSaved: 'Черновик не сохранён',
    requiredError: 'Заполните все обязательные поля перед созданием брифа.',
    generate: 'Собрать рабочий бриф',
    generating: 'Собираем бриф…',
    edit: 'Редактировать',
    done: 'Готово',
    copy: 'Копировать',
    copied: 'Скопировано',
    copyFailed: 'Не удалось скопировать',
    aiMeta: date => `Рабочий AI-черновик · ${date}`,
    localMeta: date => `Локальный структурированный черновик · ${date} · без ИИ`,
    errorTitle: 'AI-генерация сейчас недоступна',
    errorText: 'Ответы сохранены. Можно повторить запрос или собрать явно отмеченный локальный черновик без ИИ.',
    historyPlaceholder: 'Недавние брифы',
    clearConfirm: 'Очистить анкету и сохранённый черновик?',
    titleSuffix: 'рабочий бренд-бриф',
    labels: ['ОБЗОР ПРОЕКТА', 'КЛЮЧЕВАЯ ЗАДАЧА', 'АУДИТОРИЯ', 'ИНСАЙТ ОБ АУДИТОРИИ', 'НАПРАВЛЕНИЕ ПОЗИЦИОНИРОВАНИЯ', 'ЦЕННОСТНОЕ ПРЕДЛОЖЕНИЕ', 'ХАРАКТЕР БРЕНДА', 'ТОН КОММУНИКАЦИИ', 'КЛЮЧЕВЫЕ СООБЩЕНИЯ', 'ВИЗУАЛЬНОЕ НАПРАВЛЕНИЕ', 'МАТЕРИАЛЫ И НОСИТЕЛИ', 'РИСКИ И НЕИЗВЕСТНОЕ', 'СЛЕДУЮЩИЕ ШАГИ']
  }
}[language];

const elements = {
  exampleButton: document.getElementById('exampleButton'),
  clearButton: document.getElementById('clearButton'),
  editButton: document.getElementById('editButton'),
  copyButton: document.getElementById('copyButton'),
  jsonButton: document.getElementById('jsonButton'),
  pdfButton: document.getElementById('pdfButton'),
  retryButton: document.getElementById('retryButton'),
  localDraftButton: document.getElementById('localDraftButton'),
  historySelect: document.getElementById('historySelect'),
  completionProgress: document.getElementById('completionProgress'),
  completionLabel: document.getElementById('completionLabel'),
  draftStatus: document.getElementById('draftStatus'),
  formError: document.getElementById('formError'),
  generationNotice: document.getElementById('generationNotice'),
  noticeTitle: document.getElementById('noticeTitle'),
  noticeText: document.getElementById('noticeText'),
  emptyState: document.getElementById('emptyState'),
  result: document.getElementById('result'),
  resultTitle: document.getElementById('resultTitle'),
  resultMeta: document.getElementById('resultMeta')
};

const DRAFT_KEY = `brand-brief-studio:draft:${language}`;
const HISTORY_KEY = `brand-brief-studio:history:${language}`;
const MAX_HISTORY = 8;
let latestBrief = null;
let latestData = null;
let currentEntryId = null;
let editing = false;
let saveTimer = null;

function getFormData() {
  return sanitizeFormData({ ...Object.fromEntries(Object.entries(fields).map(([key, field]) => [key, field.value])), language });
}

function setFormData(data = {}) {
  for (const [key, field] of Object.entries(fields)) field.value = typeof data[key] === 'string' ? data[key] : '';
  updateCompletion();
}

function readStorage(key, fallback) {
  try { return JSON.parse(localStorage.getItem(key)) ?? fallback; } catch { return fallback; }
}

function writeStorage(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
    return true;
  } catch {
    return false;
  }
}

function updateCompletion() {
  const data = getFormData();
  const values = Object.keys(FIELD_LIMITS).map(key => data[key]);
  const percent = Math.round((values.filter(Boolean).length / values.length) * 100);
  elements.completionProgress.value = percent;
  elements.completionProgress.textContent = `${percent}%`;
  elements.completionLabel.textContent = ui.complete(percent);
}

function saveDraft() {
  const hasContent = Object.values(getFormData()).some((value, index) => index < Object.keys(FIELD_LIMITS).length && value);
  if (!hasContent) {
    localStorage.removeItem(DRAFT_KEY);
    elements.draftStatus.textContent = ui.notSaved;
    return;
  }
  const saved = writeStorage(DRAFT_KEY, { data: getFormData(), updatedAt: new Date().toISOString() });
  elements.draftStatus.textContent = saved ? ui.saved : ui.notSaved;
}

function queueDraftSave() {
  elements.draftStatus.textContent = ui.notSaved;
  clearTimeout(saveTimer);
  saveTimer = setTimeout(saveDraft, 450);
}

function getHistory() {
  const value = readStorage(HISTORY_KEY, []);
  return Array.isArray(value) ? value.filter(entry => entry && validateBrief(entry.brief)) : [];
}

function refreshHistory() {
  const history = getHistory();
  elements.historySelect.replaceChildren(new Option(ui.historyPlaceholder, ''));
  for (const entry of history) {
    const date = new Intl.DateTimeFormat(language, { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' }).format(new Date(entry.createdAt));
    elements.historySelect.add(new Option(`${entry.data.brandName} · ${date}`, entry.id));
  }
  elements.historySelect.value = currentEntryId || '';
}

function saveToHistory(data, brief, mode, generatedAt = new Date().toISOString()) {
  const history = getHistory();
  const entry = { id: currentEntryId || crypto.randomUUID(), data, brief, mode, createdAt: generatedAt };
  const next = [entry, ...history.filter(item => item.id !== entry.id)].slice(0, MAX_HISTORY);
  writeStorage(HISTORY_KEY, next);
  currentEntryId = entry.id;
  refreshHistory();
}

function formatDate(date) {
  return new Intl.DateTimeFormat(language, { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(date));
}

function replaceList(element, items) {
  element.replaceChildren(...items.map(item => {
    const li = document.createElement('li');
    li.textContent = item;
    return li;
  }));
}

function renderBrief(data, brief, meta) {
  if (!validateBrief(brief)) throw new Error('Invalid brief');
  latestData = data;
  latestBrief = brief;
  elements.resultTitle.textContent = `${data.brandName} — ${ui.titleSuffix}`;
  for (const key of BRIEF_KEYS) {
    if (key === 'messages' || key === 'nextSteps') replaceList(outputs[key], brief[key]);
    else outputs[key].textContent = brief[key];
  }
  const generatedAt = meta.generatedAt || new Date().toISOString();
  elements.resultMeta.textContent = meta.mode === 'ai' ? ui.aiMeta(formatDate(generatedAt)) : ui.localMeta(formatDate(generatedAt));
  elements.emptyState.hidden = true;
  elements.generationNotice.hidden = true;
  elements.result.hidden = false;
  resultPanel.setAttribute('aria-busy', 'false');
  setEditing(false);
  saveToHistory(data, brief, meta.mode, generatedAt);
}

function syncEditedBrief() {
  if (!latestBrief) return;
  const brief = {};
  for (const key of BRIEF_KEYS) {
    if (key === 'messages' || key === 'nextSteps') {
      brief[key] = [...outputs[key].querySelectorAll('li')].map(item => item.textContent.trim()).filter(Boolean).slice(0, 3);
    } else brief[key] = outputs[key].textContent.trim();
  }
  if (validateBrief(brief)) {
    latestBrief = brief;
    const history = getHistory();
    const current = history.find(entry => entry.id === currentEntryId);
    saveToHistory(latestData, brief, current?.mode || 'local', current?.createdAt || new Date().toISOString());
  }
}

function setEditing(nextState) {
  const wasEditing = editing;
  editing = Boolean(nextState && latestBrief);
  document.querySelectorAll('[data-editable]').forEach(node => {
    node.setAttribute('contenteditable', String(editing));
    node.setAttribute('spellcheck', String(editing));
  });
  if (elements.editButton) elements.editButton.textContent = editing ? ui.done : ui.edit;
  if (wasEditing && !editing) syncEditedBrief();
}

function showGenerationError() {
  resultPanel.setAttribute('aria-busy', 'false');
  elements.noticeTitle.textContent = ui.errorTitle;
  elements.noticeText.textContent = ui.errorText;
  elements.generationNotice.hidden = false;
  if (!latestBrief) elements.emptyState.hidden = false;
}

async function requestBrief(data) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 35_000);
  try {
    const response = await fetch('/api/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
      signal: controller.signal
    });
    const payload = await response.json().catch(() => ({}));
    if (!response.ok || !validateBrief(payload.brief)) throw new Error(payload?.error?.code || 'GENERATION_FAILED');
    return payload;
  } finally {
    clearTimeout(timeout);
  }
}

async function generate() {
  const validation = validateFormData(getFormData());
  elements.formError.hidden = true;
  if (!validation.valid || !form.checkValidity()) {
    elements.formError.textContent = ui.requiredError;
    elements.formError.hidden = false;
    const firstInvalid = REQUIRED_FIELDS.map(key => fields[key]).find(field => !field.value.trim()) || form.querySelector(':invalid');
    firstInvalid?.focus();
    return;
  }

  latestData = validation.data;
  submitButton.disabled = true;
  submitLabel.textContent = ui.generating;
  resultPanel.setAttribute('aria-busy', 'true');
  elements.generationNotice.hidden = true;
  currentEntryId = null;
  try {
    const payload = await requestBrief(validation.data);
    renderBrief(validation.data, payload.brief, payload.meta || { mode: 'ai' });
    if (window.matchMedia('(max-width: 900px)').matches) resultPanel.scrollIntoView({ behavior: 'smooth', block: 'start' });
  } catch (error) {
    console.warn('Brief generation failed', error.message);
    showGenerationError();
  } finally {
    submitButton.disabled = false;
    submitLabel.textContent = ui.generate;
  }
}

function createLocalDraft() {
  const validation = validateFormData(getFormData());
  if (!validation.valid) {
    elements.formError.textContent = ui.requiredError;
    elements.formError.hidden = false;
    formPanel.scrollIntoView({ behavior: 'smooth', block: 'start' });
    return;
  }
  currentEntryId = null;
  renderBrief(validation.data, buildLocalDraft(validation.data), { mode: 'local', generatedAt: new Date().toISOString() });
}

function buildPlainText() {
  const sections = BRIEF_KEYS.map((key, index) => {
    const value = latestBrief[key];
    const body = Array.isArray(value) ? value.map((item, itemIndex) => `${key === 'nextSteps' ? `${itemIndex + 1}.` : '•'} ${item}`).join('\n') : value;
    return `${ui.labels[index]}\n${body}`;
  });
  return `${latestData.brandName} — Brand Brief Studio\n\n${sections.join('\n\n')}`;
}

function downloadJson() {
  syncEditedBrief();
  const blob = new Blob([JSON.stringify({ project: latestData, brief: latestBrief }, null, 2)], { type: 'application/json' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = `${latestData.brandName.toLowerCase().replace(/[^a-zа-я0-9]+/gi, '-').replace(/^-|-$/g, '') || 'brand'}-brief.json`;
  link.click();
  URL.revokeObjectURL(link.href);
}

form.addEventListener('input', () => { updateCompletion(); queueDraftSave(); });
form.addEventListener('change', () => { updateCompletion(); queueDraftSave(); });
form.addEventListener('submit', event => { event.preventDefault(); generate(); });

elements.exampleButton.addEventListener('click', () => { setFormData(ui.example); saveDraft(); elements.formError.hidden = true; });
elements.clearButton.addEventListener('click', () => {
  if (!window.confirm(ui.clearConfirm)) return;
  form.reset();
  localStorage.removeItem(DRAFT_KEY);
  elements.draftStatus.textContent = ui.notSaved;
  elements.formError.hidden = true;
  updateCompletion();
  fields.brandName.focus();
});
elements.retryButton.addEventListener('click', generate);
elements.localDraftButton.addEventListener('click', createLocalDraft);
elements.editButton.addEventListener('click', () => setEditing(!editing));
elements.copyButton.addEventListener('click', async () => {
  syncEditedBrief();
  try {
    await navigator.clipboard.writeText(buildPlainText());
    elements.copyButton.textContent = ui.copied;
    setTimeout(() => { elements.copyButton.textContent = ui.copy; }, 1400);
  } catch {
    elements.copyButton.textContent = ui.copyFailed;
  }
});
elements.jsonButton.addEventListener('click', downloadJson);
elements.pdfButton.addEventListener('click', () => { setEditing(false); window.print(); });
elements.historySelect.addEventListener('change', () => {
  const entry = getHistory().find(item => item.id === elements.historySelect.value);
  if (!entry) return;
  currentEntryId = entry.id;
  setFormData(entry.data);
  renderBrief(entry.data, entry.brief, { mode: entry.mode, generatedAt: entry.createdAt });
});

const savedDraft = readStorage(DRAFT_KEY, null);
if (savedDraft?.data) {
  setFormData(savedDraft.data);
  elements.draftStatus.textContent = ui.saved;
} else updateCompletion();
refreshHistory();
