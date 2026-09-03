# Brand Brief Studio — Privacy Data Map

Status: **target Russian production architecture / migration branch**  
Last reviewed: **2026-09-03**

This document is a technical data-flow record, not a declaration of legal compliance. Production status is reached only after the Yandex Cloud deployment, operator details, Roskomnadzor obligations and account-level settings are verified.

## Target flow

```text
User browser
  ├─ local questionnaire draft ───────────────> browser localStorage only
  ├─ recent brief history ───────────────────> browser localStorage only
  ├─ optional Metrica consent ───────────────> Yandex Metrica only after opt-in
  └─ Generate AI
       ↓ HTTPS
Yandex Cloud API Gateway — Russia
       ↓
Yandex Cloud Function — Russia
       ├─ validation / body-size limit
       ├─ raw client address -> in-process HMAC rate-limit key
       ├─ request ID / outcome / duration logs only
       └─ questionnaire
            ↓
Yandex Cloud AI Studio — Russian production contour
       ├─ x-data-logging-enabled: false
       └─ structured generation
            ↓
Cloud Function validates output
       ↓
Browser renders and stores recent result locally
```

The previous Vercel -> Groq route is **legacy** and must not remain the production AI path after migration.

## Data inventory

| Data | Browser | API Gateway / Function | AI Studio | Application storage | Logging / metadata |
| --- | --- | --- | --- | --- | --- |
| Questionnaire content | Form + draft | Full validated POST on Generate | Full project input required for generation | No server application DB | Must never be passed to application `console.*` |
| Potential personal data inside free text | Possible | Same as questionnaire | Same as questionnaire | No server application DB | Same rule as questionnaire |
| Raw IP / client address | Network-level | Infrastructure receives it; app reads it only to derive HMAC key | Not intentionally included in AI prompt | No raw-IP application DB | Raw IP must not be added to Brand Brief Studio application logs; platform metadata must be verified separately |
| HMAC rate-limit key | No | In-memory rate bucket | No | No persistent DB | Application memory only; 10-minute activity window |
| Request ID | Receives in response metadata | Created/provided by runtime | Not intentionally included in prompt | No | Request ID + outcome + duration may be logged |
| Timestamps | Draft/history timestamps | Request/runtime timestamps | Provider metadata may exist | Browser localStorage only for product records | Platform logs; verify production retention |
| Generated output | Rendered/edited/exported | Returned and validated | Generated there | Up to 8 recent entries per language in localStorage | Must not be application-logged |
| Evidence map / alternative routes | Rendered | Returned and validated | Generated there | Browser history | Same as generated output |
| Analytics consent | localStorage | No | No | `brandBrief.analyticsConsent.v1` | No application log needed |
| Metrica identifiers/events | After opt-in only | No app API involvement | No | Yandex/browser storage | Yandex Metrica according to counter settings |

## Browser storage

### Draft

Key: `brand-brief-studio:draft:shared`

Contains questionnaire data and `updatedAt`.

### Recent history

Key pattern: `brand-brief-studio:history:v12:<language>`

Maximum: 8 entries per language.

An entry includes:

- source questionnaire `data`;
- generated/local `brief`;
- evidence/trust metadata;
- alternative strategic routes;
- mode and created timestamp.

No automatic TTL exists. The UI includes **Delete local data**, which removes all `brand-brief-studio:*` keys from the current browser.

### Analytics preference

Key: `brandBrief.analyticsConsent.v1`

Values: `accepted` / `declined`.

This preference is deliberately separate from product draft/history deletion.

## AI generation

Target provider: **Yandex Cloud AI Studio**.

Application controls:

- Russian Yandex Cloud Function adapter;
- service-account IAM token from Cloud Functions context in production;
- no long-lived AI API key required in repository or frontend;
- `x-data-logging-enabled: false` in AI request;
- strict generation schema;
- server-side output validation;
- one retry for invalid structured output;
- no prompt/output body in application logs.

Current model target: `gpt://<folder_id>/yandexgpt-5.1` (explicit URI should be verified at deploy time).

Official references:

- AI Studio request logging control: https://yandex.cloud/en/docs/ai-studio/concepts/resources/data-logging
- YandexGPT model catalogue: https://yandex.cloud/en/docs/ai-studio/concepts/generation/models
- Cloud Functions service-account authentication/context: https://yandex.cloud/en/docs/functions/operations/function-sa

## Rate limiting and IP minimization

The legacy implementation used raw IP as an in-memory `Map` key. The migration core now immediately derives an HMAC-SHA256 pseudonymous key using an instance-local random secret.

Important limitations:

- this reduces application-level retention/exposure; it does **not** mean network infrastructure never receives the original IP;
- HMAC pseudonymization is not the same as legal anonymization;
- production API Gateway / Cloud Functions request metadata and logging must be checked in the actual account;
- if infrastructure rate limiting is added later, its data policy and training/telemetry settings must be reviewed before enabling.

## Analytics

Provider: **Yandex Metrica**, counter `112263821`.

Application behavior:

- tag is not loaded before `accepted`;
- decline sets the official counter-disable flag;
- Session Replay / Webvisor is disabled (`webvisor: false`);
- withdrawal disables future counter activity and attempts to remove accessible first-party `_ym_*` cookies/storage identifiers;
- previously transmitted events cannot be withdrawn retroactively by client JavaScript.

Production owner action: verify the Metrica dashboard itself, including Session Replay and any advanced/contact-data tracking features, rather than relying only on repository JavaScript.

## External services / domains

| Service | Domain / surface | Purpose | Data | Target region / status | Necessary? | Action |
| --- | --- | --- | --- | --- | --- | --- |
| Yandex Cloud API Gateway | target `brief.anostosio.ru` backend/static gateway | public entry point | IP, headers, request metadata; AI POST body | Russia target | Yes | Keep; verify logs/settings |
| Yandex Cloud Functions | internal Yandex Cloud | generation backend | questionnaire during request | Russia target | Yes | Keep; attach least-privilege service account |
| Yandex Cloud AI Studio | `ai.api.cloud.yandex.net` | AI generation | questionnaire + system prompt; generated result | Russian target | Yes | Keep; request logging disabled |
| Yandex Metrica | `mc.yandex.ru` | optional analytics | browser/session analytics after opt-in | Yandex | No | Keep optional; Webvisor OFF |
| Google Fonts | `fonts.googleapis.com`, `fonts.gstatic.com` | typography | ordinary network request metadata | foreign | No | **Migration blocker: replace with licensed self-hosted WOFF2 before production cutover** |
| Vercel | `ai-brand-brief.vercel.app` | legacy hosting/API | legacy traffic | foreign | No after cutover | Keep only until migration verified; then redirect/retire |
| Groq | `api.groq.com` | legacy AI | legacy questionnaire AI payload | foreign | No after cutover | Remove from production route and credentials |
| Google Search Console verification | static verification file | ownership verification | no runtime API call from file | n/a | Optional | May keep |
| GitHub | source/CI | development | repository/CI data, not visitor brief flow | foreign developer service | Yes for development | Keep outside visitor processing path |
| Anostosio portfolio | `anostosio.ru` | outbound portfolio link | request only after click | separate site | Optional | Keep with `noreferrer` |

## Cross-border transfer status

The **target AI path intentionally contains no foreign AI recipient**. Therefore a cross-border checklist is not part of the target AI flow.

If any foreign provider is reintroduced for user questionnaire processing (including as fallback, experiment, observability proxy, model gateway or backup), stop deployment and perform a new localization/trans-border assessment **before enabling it**. Do not rely on a consent checkbox or on “Russian database first” as an automatic solution.

## Production verification gates

- [ ] Russian region confirmed for all target resources handling questionnaire requests.
- [ ] `brief.anostosio.ru` resolves to the Russian target path.
- [ ] No questionnaire request reaches Vercel or Groq in production.
- [ ] AI request logging control verified in live request/settings.
- [ ] Platform-log retention/access documented.
- [ ] Metrica network is silent before consent.
- [ ] Webvisor absent from network/CSP/dashboard.
- [ ] Google Fonts removed and replaced by licensed self-hosted assets.
- [ ] Operator details completed in privacy pages.
- [ ] Applicable Roskomnadzor actions completed by the actual operator.
