# Brand Brief Studio — Privacy Data Map

Status: **zero-cost local-only target / migration branch**  
Last reviewed: **2026-09-03**

This is a technical data-flow record, not a declaration of legal compliance.

## Target questionnaire flow

```text
static site delivery
        ↓
user browser
  ├─ questionnaire input
  ├─ validation/readiness
  ├─ evidence-aware local rules engine
  ├─ structured brief + trust map + two routes
  ├─ localStorage draft/history
  └─ JSON/PDF export

optional analytics
  └─ Yandex Metrica only after opt-in
```

**No questionnaire field is intentionally sent to a Brand Brief Studio backend or remote AI provider.**

## Important implementation detail

`app.js` still calls the internal route-shaped interface `/api/generate`, but `bootstrap.js` installs `local-generation-adapter.js` before the app starts. The adapter intercepts that call in the browser and creates a local `Response` from `buildLocalGeneration()`.

Production verification must confirm in DevTools that pressing Build does not create a real `/api/generate` network request.

## Data inventory

| Data | Browser | Brand Brief Studio server | Remote AI | Static host / network | Analytics |
| --- | --- | --- | --- | --- | --- |
| Questionnaire fields | form + local processing | none | none | not intentionally included in requests | must not be intentionally sent |
| Generated brief | render/edit/export | none | none | not intentionally included | must not be intentionally sent |
| Draft/history | localStorage | none | none | none by product logic | no |
| IP / request headers | normal page request | no app backend | none | hosting infrastructure receives ordinary request metadata | Metrica receives its own request metadata only after opt-in |
| Analytics preference | localStorage | none | none | no | controls Metrica loading |
| Exported JSON/PDF | user device | none | none | none by product logic | no |

## Browser storage

### Draft

`brand-brief-studio:draft:shared`

Contains questionnaire data and an update timestamp.

### Recent history

`brand-brief-studio:history:v12:<language>`

Maximum: eight entries per language. An entry can include source questionnaire data, generated brief, trust/evidence metadata, alternative directions, mode and local timestamp.

No automatic TTL exists. The UI includes **Delete local data**, which removes all `brand-brief-studio:*` product keys from the current browser.

### Analytics preference

`brandBrief.analyticsConsent.v1` stores `accepted` or `declined`.

Product draft/history deletion deliberately does not silently change the user's analytics preference.

## Generation

Target generation type: **browser-local deterministic rules engine**.

Files:

- `lib/brief-core.js` — sanitization, readiness, trust/evidence statuses and generated text;
- `local-generation-adapter.js` — local response contract;
- `bootstrap.js` — installs the adapter before `app.js` starts.

Controls:

- required-field validation;
- per-field length limits;
- no remote AI call;
- no server database;
- output contract validation in the existing UI;
- hypotheses and missing evidence remain labelled;
- no claim that the result is market research.

## Static hosting

Target: **SourceCraft Sites / SourceCraft Free**.

SourceCraft documentation describes Sites as free static hosting with HTTPS and requires a public repository in a public organization.

Production facts still to record:

- SourceCraft organization and repository;
- final public URL;
- applicable hosting terms;
- infrastructure log/access/retention information available to the operator.

Static hosting still receives ordinary network metadata needed to deliver a page, including an IP address. Local-only questionnaire processing does not mean the website has zero technical-data processing at every infrastructure layer.

## Analytics

Yandex Metrica counter: `112263821`.

Application behavior:

- tag does not load before `accepted`;
- decline sets the counter-disable flag;
- `webvisor: false`;
- withdrawal blocks future counter activity and attempts best-effort cleanup of accessible first-party Metrica identifiers;
- already transmitted analytics events are not retroactively erased by client JavaScript.

Production owner action: verify the Metrica dashboard, especially Session Replay/Webvisor and advanced/contact-data tracking settings.

## External runtime services

| Service | Purpose | Questionnaire content | Required? | Target action |
| --- | --- | --- | --- | --- |
| SourceCraft Sites | static page delivery | no | yes for target hosting | verify live host/settings |
| Yandex Metrica | optional analytics | must not be intentionally sent | no | consent-gated, Webvisor off |
| Google Fonts | typography | no | no | removed from target runtime |
| Groq | legacy AI | legacy only | no | absent from target runtime |
| Yandex Cloud AI Studio | abandoned paid migration option | no in target | no | absent from target runtime |
| GitHub | source/CI | no visitor questionnaire path | development only | keep |
| Anostosio portfolio | outbound link | no | optional | request occurs only after click |

## Cross-border status of questionnaire content

The target architecture has **no recipient of questionnaire content outside the browser**. Therefore the earlier Groq cross-border AI flow is eliminated rather than papered over with a checkbox.

If a remote model, form endpoint, error collector, observability SDK, proxy or backup service is later added and receives questionnaire content, stop and perform a new localization/trans-border review before enabling it.

## Production verification gates

- [ ] SourceCraft Free deployment live over HTTPS.
- [ ] Final production URL recorded.
- [ ] Build action produces no network request containing questionnaire text.
- [ ] No Groq/YandexGPT/remote model request occurs.
- [ ] No Google Fonts request occurs.
- [ ] Metrica is silent before consent.
- [ ] Webvisor absent from code/network/dashboard.
- [ ] Operator/contact information completed.
- [ ] Applicable Roskomnadzor actions reviewed/completed.
- [ ] Final privacy notice reconciled with the live host and analytics settings.
