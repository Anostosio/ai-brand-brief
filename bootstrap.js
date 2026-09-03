import { installLocalGenerationAdapter } from './local-generation-adapter.js';

function getStaticSiteBaseUrl(moduleUrl = import.meta.url) {
  return new URL('.', moduleUrl);
}

function getStaticSiteBasePath(moduleUrl = import.meta.url) {
  const baseUrl = getStaticSiteBaseUrl(moduleUrl);
  return baseUrl.pathname.endsWith('/') ? baseUrl.pathname : `${baseUrl.pathname}/`;
}

function rewriteRootRelativeLinks(documentObject = globalThis.document, basePath = getStaticSiteBasePath()) {
  if (!documentObject || basePath === '/') return;

  for (const element of documentObject.querySelectorAll('[href^="/"], [src^="/"], [action^="/"]')) {
    for (const attribute of ['href', 'src', 'action']) {
      const value = element.getAttribute(attribute);
      if (!value || !value.startsWith('/') || value.startsWith('//')) continue;
      element.setAttribute(attribute, `${basePath}${value.slice(1)}`);
    }
  }
}

function syncRuntimeSeo(documentObject = globalThis.document, baseUrl = getStaticSiteBaseUrl()) {
  if (!documentObject) return;

  const isRussian = documentObject.body?.dataset?.lang === 'ru';
  const enUrl = new URL('./', baseUrl).href;
  const ruUrl = new URL('ru/', baseUrl).href;
  const currentUrl = isRussian ? ruUrl : enUrl;
  const previewUrl = new URL('assets/ai-brand-brief-preview.webp', baseUrl).href;

  documentObject.querySelector('link[rel="canonical"]')?.setAttribute('href', currentUrl);
  documentObject.querySelector('link[rel="alternate"][hreflang="en"]')?.setAttribute('href', enUrl);
  documentObject.querySelector('link[rel="alternate"][hreflang="ru"]')?.setAttribute('href', ruUrl);
  documentObject.querySelector('link[rel="alternate"][hreflang="x-default"]')?.setAttribute('href', enUrl);
  documentObject.querySelector('meta[property="og:url"]')?.setAttribute('content', currentUrl);
  documentObject.querySelector('meta[property="og:image"]')?.setAttribute('content', previewUrl);
}

rewriteRootRelativeLinks();
syncRuntimeSeo();
installLocalGenerationAdapter(globalThis);
await import('./app.js');
