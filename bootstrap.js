import { installLocalGenerationAdapter } from './local-generation-adapter.js';

function getStaticSiteBasePath(moduleUrl = import.meta.url) {
  const baseUrl = new URL('.', moduleUrl);
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

rewriteRootRelativeLinks();
installLocalGenerationAdapter(globalThis);
await import('./app.js');
