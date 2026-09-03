import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

for (const path of ['index.html', 'ru/index.html']) {
  test(`${path} exposes the v1.2 interaction and privacy contract`, async () => {
    const html = await readFile(new URL(`../${path}`, import.meta.url), 'utf8');
    for (const id of ['projectType', 'readinessScore', 'readinessChecks', 'importInput', 'alternativesOutput', 'printTitle']) {
      assert.match(html, new RegExp(`id=["']${id}["']`));
    }
    assert.match(html, /Version 1\.2|Версия 1\.2/);
    assert.match(html, /rel=["']icon["'][^>]+favicon\.svg/);
    assert.match(html, /rel=["']canonical["'][^>]+https:\/\/brief\.anostosio\.ru/);
    assert.match(html, /hreflang=["']en["']/);
    assert.match(html, /hreflang=["']ru["']/);
    for (const id of ['analyticsConsent', 'analyticsAccept', 'analyticsDecline', 'analyticsSettings', 'localDataDelete']) {
      assert.match(html, new RegExp(`id=["']${id}["']`));
    }
    assert.match(html, /privacy-controls\.js/);
    assert.match(html, /analytics\.js/);
    assert.match(html, /Privacy|Конфиденциальность/);
    assert.match(html, /personal data of third parties|персональные данные третьих лиц/);
  });
}

test('privacy pages describe local, server, AI, analytics and technical flows', async () => {
  const [en, ru] = await Promise.all([
    readFile(new URL('../privacy/index.html', import.meta.url), 'utf8'),
    readFile(new URL('../ru/privacy/index.html', import.meta.url), 'utf8')
  ]);
  for (const html of [en, ru]) {
    assert.match(html, /Migration draft|Черновик миграции/);
    assert.match(html, /Local Storage/);
    assert.match(html, /Yandex Cloud AI Studio/);
    assert.match(html, /Webvisor|Вебвизор/);
    assert.match(html, /TODO/);
  }
});

test('search discovery files target the Russian production hostname and protect the API route', async () => {
  const [robots, sitemap, manifest, favicon] = await Promise.all([
    readFile(new URL('../robots.txt', import.meta.url), 'utf8'),
    readFile(new URL('../sitemap.xml', import.meta.url), 'utf8'),
    readFile(new URL('../site.webmanifest', import.meta.url), 'utf8'),
    readFile(new URL('../favicon.svg', import.meta.url), 'utf8')
  ]);

  assert.match(robots, /Sitemap: https:\/\/brief\.anostosio\.ru\/sitemap\.xml/);
  assert.match(robots, /Disallow: \/api\//);
  assert.match(sitemap, /<loc>https:\/\/brief\.anostosio\.ru\/<\/loc>/);
  assert.match(sitemap, /<loc>https:\/\/brief\.anostosio\.ru\/ru\/<\/loc>/);
  assert.equal(JSON.parse(manifest).icons[0].src, '/favicon.svg');
  assert.match(favicon, /B° — Brand Brief Studio/);
});

test('analytics stays consent-gated, Webvisor is off and Google verification remains exact', async () => {
  const [analytics, verification, vercelSource] = await Promise.all([
    readFile(new URL('../analytics.js', import.meta.url), 'utf8'),
    readFile(new URL('../google2fe5591a71bf2d9d.html', import.meta.url), 'utf8'),
    readFile(new URL('../vercel.json', import.meta.url), 'utf8')
  ]);

  assert.match(analytics, /METRICA_ID = 112263821/);
  assert.match(analytics, /consent === 'accepted'/);
  assert.match(analytics, /webvisor:\s*false/);
  assert.match(analytics, /disableYaCounter/);
  assert.doesNotMatch(analytics, /webvisor:\s*true/);
  assert.equal(verification.trim(), 'google-site-verification: google2fe5591a71bf2d9d.html');

  const csp = JSON.parse(vercelSource).headers[0].headers.find(header => header.key === 'Content-Security-Policy').value;
  assert.match(csp, /https:\/\/mc\.yandex\.ru/);
  assert.doesNotMatch(csp, /mc\.webvisor\.org/);
});
