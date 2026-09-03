# Brand Brief Studio — Security & Privacy Engineering Notes

Status: migration branch `privacy-rf-architecture`  
Reviewed: 2026-09-03

## Design goals

1. Keep questionnaire drafts/history browser-local unless the user explicitly starts AI generation.
2. Keep the public user-data path inside the planned Russian Yandex Cloud production contour.
3. Avoid a server-side brief database unless the product later genuinely needs accounts/sync.
4. Minimize technical identifiers and do not application-log questionnaire or generated content.
5. Treat optional analytics as optional and reversible.
6. Fail closed rather than silently falling back to a foreign AI backend.

## Generation backend

### Platform-neutral core

`api/generate.js` contains validation, schema, throttling and Yandex AI request logic.

### Russian runtime adapter

`functions/generate.js` is the Yandex Cloud Functions adapter. It passes the runtime IAM token and function folder to the generation core.

Production should attach a dedicated service account with only the permissions required to invoke the selected AI model. Do not configure a long-lived API key in the browser or repository.

### Legacy Vercel safety behavior

The default Vercel handler in `api/generate.js` returns `503 MIGRATION_REQUIRED` and does **not** send the questionnaire to any provider. This is deliberate.

Reason: after the migration code is merged, an accidental Vercel deployment must not recreate the old `Vercel -> Groq` personal-data path.

Do not merge until the Russian endpoint is live, because otherwise AI generation on the old production domain will intentionally stop.

## AI request controls

The Yandex AI request sets:

```http
x-data-logging-enabled: false
```

The application sends the questionnaire only for generation, requests structured JSON and validates the returned structure before sending it to the browser.

The code allows one retry when model output fails validation. A retry means the same questionnaire may be sent to AI Studio a second time; privacy documentation should not imply exactly one provider request per click.

## Application logging

Allowed application log fields:

- request ID;
- outcome;
- duration;
- attempt number;
- model/provider identifier;
- upstream HTTP status / internal error code.

Do **not** add:

- questionnaire/body;
- prompt text;
- generated brief;
- raw IP/client address;
- authorization token;
- cookies;
- imported JSON content.

Changes to `logRequest()` require privacy review.

Platform-level API Gateway / Cloud Functions logs are separate from application `console.info`. Their actual retention, request metadata and access must be verified in the production Yandex Cloud account.

## Rate limiting

Application throttling uses:

```text
raw client address
  -> HMAC-SHA256 with per-instance random secret
  -> in-memory rate bucket
```

Window: 10 minutes.  
Per-client application limit: 5 requests per window.  
Global per-instance application limit: 80 requests/hour.

This is intentionally lightweight and is not a durable distributed quota. It reduces raw-IP retention in application state but does not hide the IP from the underlying network infrastructure.

If a shared/infrastructure rate limiter is introduced, review its storage region, logs, training/telemetry options and retention before production use.

## Browser-local data

Draft/history use Local Storage. Up to 8 recent briefs per locale are stored.

`privacy-controls.js` deletes all keys beginning with:

```text
brand-brief-studio:
```

This does not delete files the user previously exported or the separate analytics-consent preference.

## Analytics

`analytics.js` requirements:

- never load the Metrica tag until `accepted` is stored;
- `webvisor: false`;
- no automatic session replay/form recording;
- decline sets `disableYaCounter<ID>` before any counter initialization;
- withdrawal disables future activity and performs best-effort removal of accessible `_ym_*` cookies and related browser-storage identifiers;
- user can reopen settings later.

Production dashboard check is mandatory. Repository JavaScript cannot prove that every dashboard-side Metrica feature is disabled.

## CSP / external connections

Target final CSP should contain no domains for:

- Groq;
- Vercel user-data processing;
- Google Fonts;
- `mc.webvisor.org`.

Metrica domains remain only if analytics is retained.

### Current migration blocker: fonts

The HTML still references Google Fonts temporarily so the migration branch does not ship with missing typography assets.

Manrope and Unbounded are licensed under SIL Open Font License 1.1 and can be self-hosted subject to the license conditions. Before final cutover:

1. obtain the official font files from the upstream licensed distribution;
2. keep the OFL notices in the project/deployment package;
3. serve only required WOFF2 files from the Russian static origin;
4. use `font-display: swap`;
5. preload only genuinely critical font files;
6. remove `fonts.googleapis.com` / `fonts.gstatic.com` from HTML and CSP;
7. verify by browser network trace that no Google Fonts request remains.

Do not copy arbitrary font binaries from third-party mirrors.

License references:

- Manrope: https://github.com/google/fonts/tree/main/ofl/manrope
- Unbounded: https://github.com/google/fonts/tree/main/ofl/unbounded

## Secrets

Production target should need no stored user-facing AI API key.

Local development may use a short-lived IAM token through environment variables. Never commit real tokens.

`.env.example` may contain names/placeholders only.

## Content Security Policy

During migration, `vercel.json` remains a legacy/preview security config. The Yandex production gateway/static response must reproduce equivalent security headers:

- `X-Content-Type-Options: nosniff`;
- `Referrer-Policy: strict-origin-when-cross-origin`;
- restrictive `Permissions-Policy`;
- CSP with `default-src 'self'` and narrow Metrica allowances;
- frame/object restrictions.

After self-hosting fonts, remove Google origins from the policy.

## Data minimization rules for future features

Before adding a feature that needs any of the following, perform a new data-flow review:

- accounts/login;
- cloud brief history;
- collaboration/invitations;
- email export;
- CRM integrations;
- user-uploaded files;
- external web research/search;
- foreign AI models/fallbacks;
- error/session replay SDKs;
- payment systems;
- user profiling/personalization.

Do not reuse the current privacy wording for new flows automatically.

## Incident engineering checklist

- retain enough non-content diagnostic metadata to correlate a failing request without logging questionnaire text;
- document who has Yandex Cloud/GitHub access;
- revoke compromised credentials/service-account permissions promptly;
- preserve incident evidence before log rotation where legally/operationally required;
- follow the operator incident process in `LEGAL-OPERATOR-CHECKLIST.md`.

## Pre-cutover privacy smoke tests

1. Fresh browser: load `/` and `/ru/`; Metrica requests must be absent before consent.
2. Decline analytics; reload; Metrica must remain absent.
3. Accept analytics; confirm Metrica loads; confirm no Webvisor endpoint/session replay.
4. Withdraw analytics; confirm future Metrica requests stop after reload.
5. Type questionnaire but do not generate; confirm no questionnaire POST occurs.
6. Generate with test non-personal content; confirm POST goes to Russian production origin only.
7. Confirm no request to Groq or Vercel generation API.
8. Confirm AI response passes strict structure and evidence validation.
9. Confirm application logs contain no input/output text or raw IP.
10. Delete local data; confirm draft + both locale histories are removed.
11. Confirm Google Fonts is absent after the font migration step.
12. Re-run CSP/security-header checks on final domain.
