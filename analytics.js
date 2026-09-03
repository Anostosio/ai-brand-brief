const METRICA_ID = 112263821;
const CONSENT_KEY = 'brandBrief.analyticsConsent.v1';
const DISABLE_FLAG = `disableYaCounter${METRICA_ID}`;

const banner = document.querySelector('#analyticsConsent');
const acceptButton = document.querySelector('#analyticsAccept');
const declineButton = document.querySelector('#analyticsDecline');
const settingsButton = document.querySelector('#analyticsSettings');

function readConsent() {
  try { return localStorage.getItem(CONSENT_KEY); } catch { return null; }
}

function saveConsent(value) {
  try { localStorage.setItem(CONSENT_KEY, value); } catch { /* Consent still applies for this page. */ }
}

function expireCookie(name) {
  const encoded = encodeURIComponent(name);
  const hostParts = location.hostname.split('.');
  const domains = ['', location.hostname, hostParts.length > 2 ? `.${hostParts.slice(-2).join('.')}` : ''].filter(Boolean);
  const paths = ['/', location.pathname || '/'];

  for (const domain of domains) {
    for (const path of paths) {
      document.cookie = `${encoded}=; Max-Age=0; Expires=Thu, 01 Jan 1970 00:00:00 GMT; Path=${path}; Domain=${domain}; SameSite=Lax`;
    }
  }
  document.cookie = `${encoded}=; Max-Age=0; Expires=Thu, 01 Jan 1970 00:00:00 GMT; Path=/; SameSite=Lax`;
}

function clearMetricaClientData() {
  try {
    for (const item of document.cookie.split(';')) {
      const name = decodeURIComponent(item.split('=')[0]?.trim() || '');
      if (/^_ym_/i.test(name)) expireCookie(name);
    }
  } catch { /* Best effort: some cookie modes do not expose identifiers to JavaScript. */ }

  for (const storage of [localStorage, sessionStorage]) {
    try {
      for (let index = storage.length - 1; index >= 0; index -= 1) {
        const key = storage.key(index);
        if (key && /^_?ym/i.test(key) && key !== CONSENT_KEY) storage.removeItem(key);
      }
    } catch { /* Storage may be unavailable in privacy modes. */ }
  }
}

function disableMetrica() {
  window[DISABLE_FLAG] = true;
  clearMetricaClientData();
}

function enableMetrica() {
  window[DISABLE_FLAG] = false;
}

function loadMetrica() {
  if (window.ym) return;
  enableMetrica();

  (function initQueue(m, e, t, r, i, k, a) {
    m[i] = m[i] || function queueCall() { (m[i].a = m[i].a || []).push(arguments); };
    m[i].l = 1 * new Date();
    for (let j = 0; j < document.scripts.length; j += 1) {
      if (document.scripts[j].src === r) return;
    }
    k = e.createElement(t);
    a = e.getElementsByTagName(t)[0];
    k.async = true;
    k.src = r;
    a.parentNode.insertBefore(k, a);
  }(window, document, 'script', `https://mc.yandex.ru/metrika/tag.js?id=${METRICA_ID}`, 'ym'));

  window.ym(METRICA_ID, 'init', {
    ssr: true,
    webvisor: false,
    clickmap: true,
    referrer: document.referrer,
    url: location.href,
    accurateTrackBounce: true,
    trackLinks: true
  });
}

function showBanner() {
  if (!banner) return;
  banner.hidden = false;
  acceptButton?.focus({ preventScroll: true });
}

function hideBanner() {
  if (banner) banner.hidden = true;
}

acceptButton?.addEventListener('click', () => {
  saveConsent('accepted');
  loadMetrica();
  hideBanner();
});

declineButton?.addEventListener('click', () => {
  const wasAccepted = readConsent() === 'accepted';
  saveConsent('declined');
  disableMetrica();
  hideBanner();
  // Reload only after revoking an active counter so no queued page activity is sent afterwards.
  if (wasAccepted) location.reload();
});

settingsButton?.addEventListener('click', showBanner);

const consent = readConsent();
if (consent === 'accepted') loadMetrica();
else {
  disableMetrica();
  if (consent !== 'declined') showBanner();
}
