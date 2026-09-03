import { installLocalGenerationAdapter } from './local-generation-adapter.js';

function getStaticSiteBasePath(pathname = globalThis.location?.pathname || '/') {
  const marker = '/ai-brand-brief/';
  const index = pathname.indexOf(marker);
  return index >= 0 ? pathname.slice(0, index + marker.length) : '/';
}

function rewriteRootRelativeLinks(documentObject = globalThis.document) {
  if (!documentObject) return;
  const basePath = getStaticSiteBasePath();
  if (basePath === '/') return;

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
