import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

for (const path of ['index.html', 'ru/index.html']) {
  test(`${path} exposes the v1.2 interaction contract`, async () => {
    const html = await readFile(new URL(`../${path}`, import.meta.url), 'utf8');
    for (const id of ['projectType', 'readinessScore', 'readinessChecks', 'importInput', 'alternativesOutput', 'printTitle']) {
      assert.match(html, new RegExp(`id=["']${id}["']`));
    }
    assert.match(html, /Version 1\.2|Версия 1\.2/);
    assert.match(html, /rel=["']icon["'][^>]+favicon\.svg/);
    assert.match(html, /rel=["']canonical["'][^>]+ai-brand-brief\.vercel\.app/);
    assert.match(html, /hreflang=["']en["']/);
    assert.match(html, /hreflang=["']ru["']/);
  });
}

test('search discovery files expose both locales and protect the API route', async () => {
  const [robots, sitemap, manifest, favicon] = await Promise.all([
    readFile(new URL('../robots.txt', import.meta.url), 'utf8'),
    readFile(new URL('../sitemap.xml', import.meta.url), 'utf8'),
    readFile(new URL('../site.webmanifest', import.meta.url), 'utf8'),
    readFile(new URL('../favicon.svg', import.meta.url), 'utf8')
  ]);

  assert.match(robots, /Sitemap: https:\/\/ai-brand-brief\.vercel\.app\/sitemap\.xml/);
  assert.match(robots, /Disallow: \/api\//);
  assert.match(sitemap, /<loc>https:\/\/ai-brand-brief\.vercel\.app\/<\/loc>/);
  assert.match(sitemap, /<loc>https:\/\/ai-brand-brief\.vercel\.app\/ru\/<\/loc>/);
  assert.equal(JSON.parse(manifest).icons[0].src, '/favicon.svg');
  assert.match(favicon, /B° — Brand Brief Studio/);
});
