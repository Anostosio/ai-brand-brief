# Brand Brief Studio

A bilingual, evidence-aware browser workspace for turning real project context into an editable working brand brief without presenting assumptions as research.

**Brand:** Anostosio° / Product Lab  
**Target cost:** **0 ₽ / month**  
**Target hosting:** SourceCraft Sites / SourceCraft Free  
**Status of this branch:** local-only privacy migration — **not yet production cutover**

> The existing public Vercel/Groq deployment remains legacy until a free static production site is published and verified. Do not describe the legacy production URL with the new local-only privacy wording before cutover.

## Product flow

1. Complete a structured brand questionnaire.
2. Run a local readiness diagnostic.
3. Build a structured evidence-aware draft **inside the browser**.
4. Review evidence status and two alternative strategic routes.
5. Edit, reopen recent work, copy, export JSON or save PDF.

The evidence system distinguishes:

| Status | Meaning |
| --- | --- |
| Grounded | Directly supported by supplied fields |
| Mixed | Supplied facts plus structured interpretation |
| Hypothesis | A proposal that needs testing |
| Needs validation | Evidence is missing or uncertain |

## Zero-cost local-only architecture

```text
static site
   ↓
user browser
   ├─ questionnaire
   ├─ readiness scoring
   ├─ evidence-aware rules engine
   ├─ brief + trust map + 2 routes
   ├─ localStorage history
   └─ JSON / PDF export

optional Yandex Metrica
   └─ loads only after analytics opt-in
```

There is **no application backend, database or remote AI provider** in the target questionnaire flow.

The UI keeps the legacy internal route contract `/api/generate` only as an implementation detail: `local-generation-adapter.js` intercepts it in the browser and returns a local `Response`. No HTTP request is sent for generation.

## Local browser data

- questionnaire draft is stored in Local Storage;
- up to eight recent briefs per language are stored locally;
- no user account is required;
- no Brand Brief Studio database stores questionnaires or generated briefs;
- **Delete local data** removes product draft/history keys from the current browser.

## Analytics

Yandex Metrica remains optional:

- tag loads only after explicit opt-in;
- **Webvisor / Session Replay is disabled**;
- decline and later withdrawal are supported;
- withdrawal disables future counter activity and performs best-effort cleanup of accessible first-party Metrica browser identifiers.

Dashboard-side Metrica settings still require a production review.

## Hosting

The target is **SourceCraft Sites** on **SourceCraft Free**. Official SourceCraft documentation describes Sites as free static hosting and the Free plan as not billed.

SourceCraft Sites requires a public repository in a public SourceCraft organization and provides HTTPS without a server runtime.

See [`deploy/sourcecraft/README.md`](deploy/sourcecraft/README.md).

A custom `brief.anostosio.ru` hostname is **not assumed** to be free or supported by SourceCraft Sites. Until an actually supported zero-cost mapping is confirmed, the production address may be the SourceCraft-provided `sourcecraft.site` URL. Canonical/sitemap values must be finalized after the actual production URL exists.

## External runtime dependencies

Target questionnaire runtime:

- remote AI: **none**;
- Brand Brief Studio API: **none**;
- Google Fonts: **removed**;
- Yandex Metrica: optional, consent-gated;
- portfolio link: only after user click.

Until licensed local Manrope/Unbounded assets are committed, the site intentionally falls back to locally available/system fonts rather than making a Google Fonts request. The font families are OFL-licensed; see `assets/fonts/README.md` for provenance notes.

## Key files

```text
lib/brief-core.js                  validation, readiness, evidence-aware local generator
local-generation-adapter.js       browser-only generation response adapter
bootstrap.js                       installs local adapter before app startup
app.js                             UI workflow, editing, history and export
analytics.js                       consent-gated Metrica, Webvisor disabled
privacy-controls.js                local draft/history deletion
index.html                         English interface
ru/index.html                      Russian interface
privacy/index.html                 English migration-draft privacy page
ru/privacy/index.html              Russian migration-draft privacy page
PRIVACY-DATA-MAP.md                target data-flow inventory
LEGAL-OPERATOR-CHECKLIST.md        operator/Roskomnadzor tasks outside code
SECURITY-PRIVACY-NOTES.md          engineering privacy invariants
.sourcecraft/sites.yaml            free static hosting configuration
deploy/sourcecraft/README.md       zero-cost deployment runbook
test/                              local generation/privacy regression tests
```

## Development

```bash
npm ci
npm run check
npm test
```

Node.js 22+ is used only for repository quality checks. The production application is static HTML/CSS/JavaScript and does not require Node.js on the server.

## Reliability / privacy invariants

- questionnaire generation must not perform an HTTP request;
- no Groq/YandexGPT/other remote model in the production questionnaire path;
- generated output must validate against the same brief/trust/alternatives contract;
- inputs are sanitized and field-length limited;
- assumptions remain marked as hypotheses or needs-validation;
- no HTML injection from generated text;
- local history is bounded to eight entries per language;
- Webvisor remains off;
- analytics remains opt-in;
- privacy regression tests must fail if remote AI, Google Fonts or Webvisor is reintroduced without review.

## Production gates

Do not retire the legacy production site until all of these are complete:

- [ ] SourceCraft Free public organization/repository created;
- [ ] SourceCraft Sites deployment live over HTTPS;
- [ ] EN/RU/Privacy/export flows tested;
- [ ] DevTools Network proves questionnaire generation creates no network request containing questionnaire data;
- [ ] Metrica is silent before consent and Webvisor remains absent;
- [ ] actual static-host URL and infrastructure notes recorded;
- [ ] canonical/sitemap/robots updated to the real production URL;
- [ ] real personal-data operator/contact supplied for final public notice;
- [ ] applicable Roskomnadzor obligations reviewed/completed;
- [ ] final privacy wording reviewed against the live configuration;
- [ ] only then redirect/retire the old Vercel/Groq deployment.

---

Created by **Anostosio° / Product Lab**  
Graphic Design · Branding · Advertising · Product Building
