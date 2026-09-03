const METRICA_ID = 112263821;
const CONSENT_KEY = 'brandBrief.analyticsConsent.v1';

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

function loadMetrica() {
  if (window.ym) return;

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
    webvisor: true,
    clickmap: true,
    ecommerce: 'dataLayer',
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
  hideBanner();
  if (wasAccepted) location.reload();
});

settingsButton?.addEventListener('click', showBanner);

const consent = readConsent();
if (consent === 'accepted') loadMetrica();
else if (consent !== 'declined') showBanner();
