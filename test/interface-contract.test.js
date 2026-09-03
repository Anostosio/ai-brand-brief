import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

for (const path of ['index.html', 'ru/index.html']) {
  test(`${path} exposes the v1.3 local-only interaction and privacy contract`, async () => {
    const html = await readFile(new URL(`../${path}`, import.meta.url), 'utf8');
    for (const id of ['projectType', 'readinessScore', 'readinessChecks', 'importInput', 'alternativesOutput', 'printTitle']) {
      assert.match(html, new RegExp(`id=["']${id}["']`));
    }
    assert.match(html, /Version 1\.3|Версия 1\.3/);
    assert.match(html, /rel=["']icon["'][^>]+favicon\.svg/);
    assert.match(html, /hreflang=["']en["']/);
    assert.match(html, /hreflang=["']ru["']/);
    for (const id of ['analyticsConsent', 'analyticsAccept', 'analyticsDecline', 'analyticsSettings', 'localDataDelete']) {
      assert.match(html, new RegExp(`id=["']${id}["']`));
    }
    assert.match(html, /bootstrap\.js/);
    assert.match(html, /privacy-controls\.js/);
    assert.match(html, /analytics\.js/);
    assert.match(html, /processed locally|обрабатывается локально/);
    assert.match(html, /not sent to a Brand Brief Studio server|не отправляется на сервер Brand Brief Studio/);
    assert.doesNotMatch(html, /Yandex Cloud AI Studio/);
    assert.doesNotMatch(html, /api\.groq\.com/);
  });
}

test('bootstrap rebases root-relative links for static subpath hosting without hardcoding SourceCraft', async () => {
  const source = await readFile(new URL('../bootstrap.js', import.meta.url), 'utf8');
  assert.match(source, /new URL\('\.', moduleUrl\)/);
  assert.match(source, /\[href\^="\/"\], \[src\^="\/"\], \[action\^="\/"\]/);
  assert.doesNotMatch(source, /\/ai-brand-brief\//);
});

test('privacy pages use relative assets and back links so subpath hosting cannot escape to the domain root', async () => {
  const [en, ru] = await Promise.all([
    readFile(new URL('../privacy/index.html', import.meta.url), 'utf8'),
    readFile(new URL('../ru/privacy/index.html', import.meta.url), 'utf8')
  ]);
  for (const html of [en, ru]) {
    assert.match(html, /Migration draft|Черновик миграции/);
    assert.match(html, /Local Storage/);
    assert.match(html, /SourceCraft Sites/);
    assert.match(html, /Webvisor|Вебвизор/);
    assert.match(html, /TODO/);
    assert.doesNotMatch(html, /Yandex Cloud AI Studio/);
    assert.doesNotMatch(html, /(?:href|src)=["']\/(?!\/)/);
  }
});

test('search discovery files target the live SourceCraft URLs and remain subpath-safe', async () => {
  const [robots, sitemap, manifest, favicon] = await Promise.all([
    readFile(new URL('../robots.txt', import.meta.url), 'utf8'),
    readFile(new URL('../sitemap.xml', import.meta.url), 'utf8'),
    readFile(new URL('../site.webmanifest', import.meta.url), 'utf8'),
    readFile(new URL('../favicon.svg', import.meta.url), 'utf8')
  ]);

  assert.doesNotMatch(robots, /Disallow:\s*\/api\//);
  assert.match(sitemap, /<loc>https:\/\/anostosio-product-lab\.sourcecraft\.site\/ai-brand-brief\/<\/loc>/);
  assert.match(sitemap, /<loc>https:\/\/anostosio-product-lab\.sourcecraft\.site\/ai-brand-brief\/ru\/<\/loc>/);
  const parsedManifest = JSON.parse(manifest);
  assert.equal(parsedManifest.start_url, './');
  assert.equal(parsedManifest.scope, './');
  assert.equal(parsedManifest.icons[0].src, './favicon.svg');
  assert.match(favicon, /B° — Brand Brief Studio/);
});

test('analytics stays consent-gated, Webvisor is off and external font hosts are absent from target HTML/CSP', async () => {
  const [analytics, verification, vercelSource, en, ru] = await Promise.all([
    readFile(new URL('../analytics.js', import.meta.url), 'utf8'),
    readFile(new URL('../google2fe5591a71bf2d9d.html', import.meta.url), 'utf8'),
    readFile(new URL('../vercel.json', import.meta.url), 'utf8'),
    readFile(new URL('../index.html', import.meta.url), 'utf8'),
    readFile(new URL('../ru/index.html', import.meta.url), 'utf8')
  ]);

  assert.match(analytics, /METRICA_ID = 112263821/);
  assert.match(analytics, /consent === 'accepted'/);
  assert.match(analytics, /webvisor:\s*false/);
  assert.match(analytics, /disableYaCounter/);
  assert.doesNotMatch(analytics, /webvisor:\s*true/);
  assert.equal(verification.trim(), 'google-site-verification: google2fe5591a71bf2d9d.html');

  for (const html of [en, ru]) {
    assert.doesNotMatch(html, /fonts\.googleapis\.com/);
    assert.doesNotMatch(html, /fonts\.gstatic\.com/);
  }

  const csp = JSON.parse(vercelSource).headers[0].headers.find(header => header.key === 'Content-Security-Policy').value;
  assert.match(csp, /https:\/\/mc\.yandex\.ru/);
  assert.doesNotMatch(csp, /mc\.webvisor\.org/);
  assert.doesNotMatch(csp, /fonts\.googleapis\.com/);
  assert.doesNotMatch(csp, /fonts\.gstatic\.com/);
});
