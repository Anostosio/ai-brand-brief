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
    for (const id of ['analyticsConsent', 'analyticsAccept', 'analyticsDecline', 'analyticsSettings']) {
      assert.match(html, new RegExp(`id=["']${id}["']`));
    }
    assert.match(html, /analytics\.js/);
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

test('analytics stays consent-gated and Google verification remains exact', async () => {
  const [analytics, verification, vercelSource] = await Promise.all([
    readFile(new URL('../analytics.js', import.meta.url), 'utf8'),
    readFile(new URL('../google2fe5591a71bf2d9d.html', import.meta.url), 'utf8'),
    readFile(new URL('../vercel.json', import.meta.url), 'utf8')
  ]);

  assert.match(analytics, /METRICA_ID = 112263821/);
  assert.match(analytics, /consent === 'accepted'/);
  assert.equal(verification.trim(), 'google-site-verification: google2fe5591a71bf2d9d.html');
  const csp = JSON.parse(vercelSource).headers[0].headers.find(header => header.key === 'Content-Security-Policy').value;
  assert.match(csp, /https:\/\/mc\.yandex\.ru/);
});
