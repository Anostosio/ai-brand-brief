import {
  BRIEF_KEYS, FIELD_LIMITS, REQUIRED_FIELDS, assessBriefReadiness,
  buildLocalGeneration, sanitizeFormData, validateAlternatives, validateBrief,
  validateFormData, validateGeneration, validateTrust
} from './lib/brief-core.js';

const language = document.body.dataset.lang === 'ru' ? 'ru' : 'en';
const form = document.getElementById('briefForm');
const formPanel = document.querySelector('.form-panel');
const resultPanel = document.querySelector('.result-panel');
const submitButton = form.querySelector('button[type="submit"]');
const submitLabel = submitButton.querySelector('span:first-child');
const fields = Object.fromEntries(Object.keys(FIELD_LIMITS).map(key => [key, document.getElementById(key)]));
const outputs = Object.fromEntries(BRIEF_KEYS.map(key => [key, document.getElementById(`${key}Output`)]));

const commonExample = {
  projectType: 'digital-product', brandName: 'Mellow Club',
  market: 'Europe, English-speaking digital market',
  personality: 'calm, intelligent, warm, contemporary, quietly premium',
  competitors: 'Headspace, Calm, productivity apps, coworking communities and free video content'
};

const ui = {
  en: {
    example: { ...commonExample, business: 'A subscription-based digital wellbeing service with short guided reset sessions, focus rituals and low-pressure productivity tools for remote workers.', problem: 'The category often frames wellbeing as another performance target. The new brand must feel useful and credible without adding pressure or sounding clinical.', audience: 'Remote professionals aged 24–38 who feel mentally overloaded but reject aggressive productivity culture.', audienceNeed: 'They want a practical way to reset during the workday, but long routines and exaggerated wellness promises feel unrealistic.', goal: 'Launch a new brand', differentiator: 'Five-minute reset rituals designed specifically for the rhythms and constraints of remote work.', proof: 'Sessions are designed with an occupational wellbeing advisor; an early pilot included 42 remote professionals.', deliverables: 'Core identity, landing page, onboarding screens and social launch templates', avoid: 'Pastel wellness gradients, mystical language, hustle culture, medical claims and corporate HR tone.', notes: 'The first launch is planned as a small paid pilot. The identity must work in a compact mobile interface.' },
    complete: value => `${value}% complete`, saved: 'Draft saved locally', notSaved: 'Draft not saved',
    requiredError: 'Complete all required fields before generating the brief.', generate: 'Generate evidence-aware brief', generating: 'Building brief…',
    edit: 'Edit', done: 'Done editing', copy: 'Copy', copied: 'Copied', copyFailed: 'Copy failed',
    aiMeta: date => `Evidence-aware AI draft · ${date}`, localMeta: date => `Local structured draft · ${date} · no AI`,
    historyPlaceholder: 'Recent briefs', clearConfirm: 'Clear the questionnaire and its saved draft?', titleSuffix: 'working brand brief',
    importInvalid: 'This file is not a valid Brand Brief Studio export.', importLoaded: 'Project imported successfully.',
    readiness: { strong: 'Strong inputs. The generated brief can focus on strategy rather than filling gaps.', workable: 'Workable inputs. Complete the missing areas to reduce assumptions.', thin: 'The brief is still thin. Add context before relying on strategic conclusions.' },
    checks: { foundation: 'Foundation and challenge', audience: 'Audience tension', difference: 'Competitive difference', evidence: 'Evidence and proof', scope: 'Scope and constraints' },
    trust: { grounded: 'Grounded', mixed: 'Mixed', hypothesis: 'Hypothesis', 'needs-validation': 'Needs validation' },
    sourcePrefix: 'Sources', noSources: 'No direct source',
    sources: { projectType: 'project type', brandName: 'name', business: 'offer', problem: 'challenge', audience: 'audience', audienceNeed: 'audience tension', market: 'market', goal: 'goal', personality: 'personality', competitors: 'competitors', differentiator: 'difference', proof: 'proof', deliverables: 'deliverables', avoid: 'avoid list', notes: 'notes' },
    routeLabels: { rationale: 'Strategic idea', positioning: 'Positioning', tone: 'Tone', visualPrinciple: 'Visual principle', advantage: 'Advantage', risk: 'Risk' },
    errors: {
      RATE_LIMITED: ['Free AI limit reached', 'Please wait a little before retrying. Your answers are saved, and the local draft remains available.'],
      TIMEOUT: ['Generation took too long', 'The provider did not answer in time. Retry once or create a local draft.'],
      AI_NOT_CONFIGURED: ['AI is temporarily unavailable', 'The server connection needs attention. Your answers are safe in this browser.'],
      MODEL_REFUSAL: ['The model declined this request', 'Review the supplied wording or create a local draft without AI.'],
      INVALID_GENERATION: ['The result failed quality checks', 'The service retried automatically but did not return a reliable structure. Please retry later.'],
      default: ['AI generation is unavailable', 'Your answers are saved. Retry the request or create a clearly labelled local draft without AI.']
    },
    printReadiness: score => `Input readiness ${score}/100`,
    projectHints: { 'new-brand': 'Focus on category entry, difference and launch system.', rebrand: 'Explain what must change and what equity should remain.', campaign: 'Define the communication objective, response and channel constraints.', 'personal-brand': 'Clarify expertise, audience trust and recognizable voice.', 'digital-product': 'Connect positioning to product experience and interface behavior.', packaging: 'Consider shelf context, hierarchy and production constraints.' },
    labels: ['PROJECT OVERVIEW', 'CORE CHALLENGE', 'AUDIENCE', 'AUDIENCE INSIGHT', 'POSITIONING DIRECTION', 'VALUE PROPOSITION', 'BRAND PERSONALITY', 'TONE OF VOICE', 'KEY MESSAGES', 'VISUAL DIRECTION', 'DELIVERABLES', 'RISKS AND UNKNOWNS', 'NEXT STEPS']
  },
  ru: {
    example: { ...commonExample, market: 'Европа, англоязычный онлайн-рынок', business: 'Цифровой wellness-сервис по подписке с короткими практиками восстановления, ритуалами для фокуса и спокойными инструментами продуктивности для удалённых специалистов.', problem: 'Категория часто превращает заботу о себе в ещё одну гонку за эффективностью. Новый бренд должен быть полезным и убедительным, но не давить и не звучать клинически.', audience: 'Удалённые специалисты 24–38 лет, которые перегружены, но не принимают агрессивную культуру продуктивности.', audienceNeed: 'Им нужен реалистичный способ восстановиться в течение рабочего дня, но длинные практики и громкие wellness-обещания кажутся неуместными.', goal: 'Запуск нового бренда', personality: 'спокойный, умный, тёплый, современный, сдержанно-премиальный', competitors: 'Headspace, Calm, приложения для продуктивности, coworking-сообщества и бесплатный видеоконтент', differentiator: 'Пятиминутные ритуалы восстановления, разработанные именно под ритм и ограничения удалённой работы.', proof: 'Практики разработаны вместе со специалистом по wellbeing на рабочем месте; в раннем пилоте участвовали 42 удалённых специалиста.', deliverables: 'Айдентика, лендинг, onboarding-экраны и шаблоны для запуска в соцсетях', avoid: 'Пастельные wellness-градиенты, мистический язык, hustle-культура, медицинские обещания и корпоративный HR-тон.', notes: 'Первый запуск планируется как небольшой платный пилот. Айдентика должна работать в компактном мобильном интерфейсе.' },
    complete: value => `Заполнено ${value}%`, saved: 'Черновик сохранён локально', notSaved: 'Черновик не сохранён',
    requiredError: 'Заполните все обязательные поля перед созданием брифа.', generate: 'Собрать доказательный бриф', generating: 'Собираем бриф…',
    edit: 'Редактировать', done: 'Готово', copy: 'Копировать', copied: 'Скопировано', copyFailed: 'Не удалось скопировать',
    aiMeta: date => `Доказательный AI-черновик · ${date}`, localMeta: date => `Локальный структурированный черновик · ${date} · без ИИ`,
    historyPlaceholder: 'Недавние брифы', clearConfirm: 'Очистить анкету и сохранённый черновик?', titleSuffix: 'рабочий бренд-бриф',
    importInvalid: 'Файл не является корректным экспортом Brand Brief Studio.', importLoaded: 'Проект успешно импортирован.',
    readiness: { strong: 'Сильные вводные. ИИ сможет сосредоточиться на стратегии, а не заполнять пробелы.', workable: 'Вводных достаточно для черновика. Заполните пропуски, чтобы уменьшить число предположений.', thin: 'Пока вводных мало. Добавьте контекст, прежде чем опираться на стратегические выводы.' },
    checks: { foundation: 'Основа и задача', audience: 'Напряжение аудитории', difference: 'Конкурентное отличие', evidence: 'Доказательства', scope: 'Объём и ограничения' },
    trust: { grounded: 'Из вводных', mixed: 'Смешанное', hypothesis: 'Гипотеза', 'needs-validation': 'Нужна проверка' },
    sourcePrefix: 'Источники', noSources: 'Нет прямого источника',
    sources: { projectType: 'тип проекта', brandName: 'название', business: 'предложение', problem: 'задача', audience: 'аудитория', audienceNeed: 'потребность аудитории', market: 'рынок', goal: 'цель', personality: 'характер', competitors: 'конкуренты', differentiator: 'отличие', proof: 'доказательства', deliverables: 'носители', avoid: 'ограничения', notes: 'контекст' },
    routeLabels: { rationale: 'Стратегическая идея', positioning: 'Позиционирование', tone: 'Тон', visualPrinciple: 'Визуальный принцип', advantage: 'Преимущество', risk: 'Риск' },
    errors: {
      RATE_LIMITED: ['Бесплатный лимит временно исчерпан', 'Немного подождите перед повтором. Ответы сохранены, локальный черновик по-прежнему доступен.'],
      TIMEOUT: ['Генерация заняла слишком много времени', 'Сервис не успел ответить. Повторите один раз или создайте локальный черновик.'],
      AI_NOT_CONFIGURED: ['ИИ временно недоступен', 'Серверное подключение требует проверки. Ответы сохранены в этом браузере.'],
      MODEL_REFUSAL: ['Модель отклонила запрос', 'Проверьте формулировки во вводных или создайте локальный черновик без ИИ.'],
      INVALID_GENERATION: ['Результат не прошёл проверку качества', 'Сервис автоматически повторил запрос, но не получил надёжную структуру. Попробуйте позже.'],
      default: ['AI-генерация сейчас недоступна', 'Ответы сохранены. Можно повторить запрос или собрать явно отмеченный локальный черновик без ИИ.']
    },
    printReadiness: score => `Готовность вводных ${score}/100`,
    projectHints: { 'new-brand': 'Фокус: вход в категорию, отличие и система запуска.', rebrand: 'Опишите, что нужно изменить и какую ценность важно сохранить.', campaign: 'Уточните коммуникационную цель, желаемую реакцию и ограничения каналов.', 'personal-brand': 'Уточните экспертизу, доверие аудитории и узнаваемый голос.', 'digital-product': 'Свяжите позиционирование с продуктовым опытом и поведением интерфейса.', packaging: 'Учитывайте полку, иерархию информации и производственные ограничения.' },
    labels: ['ОБЗОР ПРОЕКТА', 'КЛЮЧЕВАЯ ЗАДАЧА', 'АУДИТОРИЯ', 'ИНСАЙТ ОБ АУДИТОРИИ', 'НАПРАВЛЕНИЕ ПОЗИЦИОНИРОВАНИЯ', 'ЦЕННОСТНОЕ ПРЕДЛОЖЕНИЕ', 'ХАРАКТЕР БРЕНДА', 'ТОН КОММУНИКАЦИИ', 'КЛЮЧЕВЫЕ СООБЩЕНИЯ', 'ВИЗУАЛЬНОЕ НАПРАВЛЕНИЕ', 'МАТЕРИАЛЫ И НОСИТЕЛИ', 'РИСКИ И НЕИЗВЕСТНОЕ', 'СЛЕДУЮЩИЕ ШАГИ']
  }
}[language];

const elements = Object.fromEntries([
  'exampleButton', 'importButton', 'importInput', 'clearButton', 'editButton', 'copyButton', 'jsonButton', 'pdfButton',
  'retryButton', 'localDraftButton', 'historySelect', 'completionProgress', 'completionLabel', 'draftStatus', 'formError',
  'generationNotice', 'noticeTitle', 'noticeText', 'emptyState', 'result', 'resultTitle', 'resultMeta', 'readinessScore',
  'readinessSummary', 'readinessChecks', 'alternativesOutput', 'printTitle', 'printDate', 'printReadiness', 'projectTypeHint'
].map(id => [id, document.getElementById(id)]));

const DRAFT_KEY = 'brand-brief-studio:draft:shared';
const HISTORY_KEY = `brand-brief-studio:history:v12:${language}`;
const MAX_HISTORY = 8;
let latestBrief = null;
let latestTrust = null;
let latestAlternatives = null;
let latestData = null;
let currentEntryId = null;
let editing = false;
let saveTimer = null;

function getFormData() { return sanitizeFormData({ ...Object.fromEntries(Object.entries(fields).map(([key, field]) => [key, field?.value || ''])), language }); }
function setFormData(data = {}) { for (const [key, field] of Object.entries(fields)) if (field) field.value = typeof data[key] === 'string' ? data[key] : ''; updateProjectHint(); updateCompletion(); }
function readStorage(key, fallback) { try { return JSON.parse(localStorage.getItem(key)) ?? fallback; } catch { return fallback; } }
function writeStorage(key, value) { try { localStorage.setItem(key, JSON.stringify(value)); return true; } catch { return false; } }

function updateProjectHint() {
  const selected = fields.projectType?.value;
  elements.projectTypeHint.textContent = ui.projectHints[selected] || (language === 'ru' ? 'Тип проекта меняет стратегический акцент результата.' : 'The project type adapts the strategic emphasis.');
}

function updateReadiness(data) {
  const readiness = assessBriefReadiness(data);
  elements.readinessScore.textContent = `${readiness.score}/100`;
  elements.readinessScore.dataset.level = readiness.level;
  elements.readinessSummary.textContent = ui.readiness[readiness.level];
  elements.readinessChecks.replaceChildren(...readiness.checks.map(check => {
    const item = document.createElement('li');
    item.dataset.ready = String(check.ready);
    item.textContent = `${check.ready ? '✓' : '○'} ${ui.checks[check.key]}`;
    return item;
  }));
  return readiness;
}

function updateCompletion() {
  const data = getFormData();
  const values = Object.keys(FIELD_LIMITS).map(key => data[key]);
  const percent = Math.round((values.filter(Boolean).length / values.length) * 100);
  elements.completionProgress.value = percent;
  elements.completionProgress.textContent = `${percent}%`;
  elements.completionLabel.textContent = ui.complete(percent);
  updateReadiness(data);
}

function saveDraft() {
  const data = getFormData();
  const hasContent = Object.keys(FIELD_LIMITS).some(key => data[key]);
  if (!hasContent) { localStorage.removeItem(DRAFT_KEY); elements.draftStatus.textContent = ui.notSaved; return; }
  elements.draftStatus.textContent = writeStorage(DRAFT_KEY, { data, updatedAt: new Date().toISOString() }) ? ui.saved : ui.notSaved;
}
function queueDraftSave() { elements.draftStatus.textContent = ui.notSaved; clearTimeout(saveTimer); saveTimer = setTimeout(saveDraft, 450); }

function normalizeGeneration(data, candidate = {}) {
  const fallback = buildLocalGeneration(data);
  return {
    brief: validateBrief(candidate.brief) ? candidate.brief : fallback.brief,
    trust: validateTrust(candidate.trust) ? candidate.trust : fallback.trust,
    alternatives: validateAlternatives(candidate.alternatives) ? candidate.alternatives : fallback.alternatives
  };
}

function getHistory() {
  const value = readStorage(HISTORY_KEY, []);
  return Array.isArray(value) ? value.filter(entry => entry && validateBrief(entry.brief)) : [];
}
function refreshHistory() {
  elements.historySelect.replaceChildren(new Option(ui.historyPlaceholder, ''));
  for (const entry of getHistory()) {
    const date = new Intl.DateTimeFormat(language, { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' }).format(new Date(entry.createdAt));
    elements.historySelect.add(new Option(`${entry.data.brandName} · ${date}`, entry.id));
  }
  elements.historySelect.value = currentEntryId || '';
}
function saveToHistory(data, generation, mode, generatedAt = new Date().toISOString()) {
  const history = getHistory();
  const entry = { id: currentEntryId || crypto.randomUUID(), data, ...generation, mode, createdAt: generatedAt };
  writeStorage(HISTORY_KEY, [entry, ...history.filter(item => item.id !== entry.id)].slice(0, MAX_HISTORY));
  currentEntryId = entry.id;
  refreshHistory();
}

function formatDate(date) { return new Intl.DateTimeFormat(language, { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(date)); }
function replaceList(element, items) {
  element.replaceChildren(...items.map(item => { const li = document.createElement('li'); li.textContent = item; return li; }));
}

function renderTrust(trust) {
  for (const key of BRIEF_KEYS) {
    const container = outputs[key].closest('div');
    let row = container.querySelector('.trust-row');
    if (!row) { row = document.createElement('div'); row.className = 'trust-row'; container.insertBefore(row, outputs[key]); }
    const item = trust[key];
    const sources = item.sources.length ? item.sources.map(source => ui.sources[source]).join(', ') : ui.noSources;
    row.replaceChildren();
    const badge = document.createElement('span'); badge.className = `trust-badge trust-${item.status}`; badge.textContent = ui.trust[item.status];
    const source = document.createElement('span'); source.className = 'trust-source'; source.textContent = `${ui.sourcePrefix}: ${sources}`;
    row.append(badge, source);
    if (item.note) { const note = document.createElement('p'); note.className = 'trust-note'; note.textContent = item.note; row.append(note); }
  }
}

function renderAlternatives(alternatives) {
  elements.alternativesOutput.replaceChildren(...alternatives.map((route, index) => {
    const article = document.createElement('article');
    const number = document.createElement('span'); number.className = 'route-number'; number.textContent = `0${index + 1}`;
    const title = document.createElement('h3'); title.textContent = route.name;
    article.append(number, title);
    for (const key of Object.keys(ui.routeLabels)) {
      const paragraph = document.createElement('p');
      const label = document.createElement('strong'); label.textContent = `${ui.routeLabels[key]}: `;
      paragraph.append(label, document.createTextNode(route[key])); article.append(paragraph);
    }
    return article;
  }));
}

function renderBrief(data, candidate, meta) {
  const generation = normalizeGeneration(data, candidate);
  latestData = data; latestBrief = generation.brief; latestTrust = generation.trust; latestAlternatives = generation.alternatives;
  elements.resultTitle.textContent = `${data.brandName} — ${ui.titleSuffix}`;
  for (const key of BRIEF_KEYS) Array.isArray(generation.brief[key]) ? replaceList(outputs[key], generation.brief[key]) : outputs[key].textContent = generation.brief[key];
  renderTrust(generation.trust); renderAlternatives(generation.alternatives);
  const generatedAt = meta.generatedAt || new Date().toISOString();
  const readiness = assessBriefReadiness(data);
  elements.resultMeta.textContent = meta.mode === 'ai' ? ui.aiMeta(formatDate(generatedAt)) : ui.localMeta(formatDate(generatedAt));
  elements.printTitle.textContent = `${data.brandName} — ${ui.titleSuffix}`; elements.printDate.textContent = formatDate(generatedAt); elements.printReadiness.textContent = ui.printReadiness(readiness.score);
  elements.emptyState.hidden = true; elements.generationNotice.hidden = true; elements.result.hidden = false; resultPanel.setAttribute('aria-busy', 'false');
  setEditing(false); saveToHistory(data, generation, meta.mode, generatedAt);
}

function syncEditedBrief() {
  if (!latestBrief) return;
  const brief = {};
  for (const key of BRIEF_KEYS) brief[key] = ['messages', 'nextSteps'].includes(key) ? [...outputs[key].querySelectorAll('li')].map(item => item.textContent.trim()).filter(Boolean).slice(0, 3) : outputs[key].textContent.trim();
  if (validateBrief(brief)) { latestBrief = brief; const current = getHistory().find(entry => entry.id === currentEntryId); saveToHistory(latestData, { brief, trust: latestTrust, alternatives: latestAlternatives }, current?.mode || 'local', current?.createdAt || new Date().toISOString()); }
}
function setEditing(nextState) {
  const wasEditing = editing; editing = Boolean(nextState && latestBrief);
  document.querySelectorAll('[data-editable]').forEach(node => { node.setAttribute('contenteditable', String(editing)); node.setAttribute('spellcheck', String(editing)); });
  elements.editButton.textContent = editing ? ui.done : ui.edit;
  if (wasEditing && !editing) syncEditedBrief();
}

function showGenerationError(error) {
  resultPanel.setAttribute('aria-busy', 'false');
  const [title, text] = ui.errors[error?.message] || ui.errors.default;
  elements.noticeTitle.textContent = title; elements.noticeText.textContent = text; elements.generationNotice.hidden = false;
  if (!latestBrief) elements.emptyState.hidden = false;
}

async function requestBrief(data) {
  const controller = new AbortController(); const timeout = setTimeout(() => controller.abort(), 35_000);
  try {
    const response = await fetch('/api/generate', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data), signal: controller.signal });
    const payload = await response.json().catch(() => ({}));
    if (!response.ok || !validateGeneration(payload)) throw new Error(payload?.error?.code || 'GENERATION_FAILED');
    return payload;
  } catch (error) { if (error.name === 'AbortError') throw new Error('TIMEOUT'); throw error; }
  finally { clearTimeout(timeout); }
}

async function generate() {
  const validation = validateFormData(getFormData()); elements.formError.hidden = true;
  if (!validation.valid || !form.checkValidity()) {
    elements.formError.textContent = ui.requiredError; elements.formError.hidden = false;
    (REQUIRED_FIELDS.map(key => fields[key]).find(field => !field?.value.trim()) || form.querySelector(':invalid'))?.focus(); return;
  }
  latestData = validation.data; submitButton.disabled = true; submitLabel.textContent = ui.generating; resultPanel.setAttribute('aria-busy', 'true'); elements.generationNotice.hidden = true; currentEntryId = null;
  try { const payload = await requestBrief(validation.data); renderBrief(validation.data, payload, payload.meta || { mode: 'ai' }); if (window.matchMedia('(max-width: 900px)').matches) resultPanel.scrollIntoView({ behavior: 'smooth', block: 'start' }); }
  catch (error) { console.warn('Brief generation failed', error.message); showGenerationError(error); }
  finally { submitButton.disabled = false; submitLabel.textContent = ui.generate; }
}

function createLocalDraft() {
  const validation = validateFormData(getFormData());
  if (!validation.valid) { elements.formError.textContent = ui.requiredError; elements.formError.hidden = false; formPanel.scrollIntoView({ behavior: 'smooth', block: 'start' }); return; }
  currentEntryId = null; renderBrief(validation.data, buildLocalGeneration(validation.data), { mode: 'local', generatedAt: new Date().toISOString() });
}

function buildPlainText() {
  const sections = BRIEF_KEYS.map((key, index) => {
    const value = latestBrief[key]; const body = Array.isArray(value) ? value.map((item, itemIndex) => `${key === 'nextSteps' ? `${itemIndex + 1}.` : '•'} ${item}`).join('\n') : value;
    return `${ui.labels[index]} · ${ui.trust[latestTrust[key].status]}\n${body}`;
  });
  return `${latestData.brandName} — Brand Brief Studio\n\n${sections.join('\n\n')}`;
}

function downloadJson() {
  syncEditedBrief();
  const payload = { schemaVersion: '1.2', project: latestData, brief: latestBrief, trust: latestTrust, alternatives: latestAlternatives };
  const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' }); const link = document.createElement('a'); link.href = URL.createObjectURL(blob);
  link.download = `${latestData.brandName.toLowerCase().replace(/[^a-zа-я0-9]+/gi, '-').replace(/^-|-$/g, '') || 'brand'}-brief.json`; link.click(); URL.revokeObjectURL(link.href);
}

async function importJson(file) {
  try {
    const payload = JSON.parse(await file.text()); const data = sanitizeFormData({ ...(payload.project || payload.data), language });
    if (!Object.keys(FIELD_LIMITS).some(key => data[key])) throw new Error('invalid');
    setFormData(data); saveDraft(); elements.formError.textContent = ui.importLoaded; elements.formError.hidden = false;
    if (validateBrief(payload.brief)) { currentEntryId = null; renderBrief(data, payload, { mode: 'local', generatedAt: new Date().toISOString() }); }
  } catch { elements.formError.textContent = ui.importInvalid; elements.formError.hidden = false; }
}

form.addEventListener('input', () => { updateProjectHint(); updateCompletion(); queueDraftSave(); });
form.addEventListener('change', () => { updateProjectHint(); updateCompletion(); queueDraftSave(); });
form.addEventListener('submit', event => { event.preventDefault(); generate(); });
elements.exampleButton.addEventListener('click', () => { setFormData(ui.example); saveDraft(); elements.formError.hidden = true; });
elements.importButton.addEventListener('click', () => elements.importInput.click());
elements.importInput.addEventListener('change', async () => { const [file] = elements.importInput.files; if (file) await importJson(file); elements.importInput.value = ''; });
elements.clearButton.addEventListener('click', () => { if (!window.confirm(ui.clearConfirm)) return; form.reset(); localStorage.removeItem(DRAFT_KEY); elements.draftStatus.textContent = ui.notSaved; elements.formError.hidden = true; updateProjectHint(); updateCompletion(); fields.projectType.focus(); });
elements.retryButton.addEventListener('click', generate); elements.localDraftButton.addEventListener('click', createLocalDraft); elements.editButton.addEventListener('click', () => setEditing(!editing));
elements.copyButton.addEventListener('click', async () => { syncEditedBrief(); try { await navigator.clipboard.writeText(buildPlainText()); elements.copyButton.textContent = ui.copied; setTimeout(() => { elements.copyButton.textContent = ui.copy; }, 1400); } catch { elements.copyButton.textContent = ui.copyFailed; } });
elements.jsonButton.addEventListener('click', downloadJson); elements.pdfButton.addEventListener('click', () => { setEditing(false); window.print(); });
elements.historySelect.addEventListener('change', () => { const entry = getHistory().find(item => item.id === elements.historySelect.value); if (!entry) return; currentEntryId = entry.id; setFormData(entry.data); renderBrief(entry.data, entry, { mode: entry.mode, generatedAt: entry.createdAt }); });

const savedDraft = readStorage(DRAFT_KEY, null);
if (savedDraft?.data) { setFormData(savedDraft.data); elements.draftStatus.textContent = ui.saved; } else updateCompletion();
refreshHistory();
