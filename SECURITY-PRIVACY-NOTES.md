# Brand Brief Studio — Security & Privacy Notes

Status: **v1.3 local-only target**  
Reviewed: **2026-09-03**

These are engineering invariants for the production branch. They are not a substitute for legal/operator documentation.

## 1. Core privacy invariant

Questionnaire content and generated brief content must remain in the user's browser unless a future feature receives a new explicit privacy/legal review.

Current generation path:

```text
form -> sanitize/validate -> local rules engine -> render/localStorage/export
```

There is no production server generation endpoint and no remote AI provider.

## 2. Local adapter

`bootstrap.js` installs `local-generation-adapter.js` before `app.js` runs.

The adapter intercepts the legacy route-shaped call to `/api/generate` and returns a browser-created `Response`. This preserves the stable UI contract while removing network generation.

Regression requirement: a real network request to `/api/generate` during Build is a production bug.

## 3. Input handling

- sanitize all supported questionnaire fields;
- ignore unknown fields;
- enforce field length caps;
- require the defined foundation fields before generation;
- render output via text nodes / existing safe DOM paths, not injected HTML;
- imported JSON must pass validation before it becomes project state.

## 4. Local persistence

Product keys:

- `brand-brief-studio:draft:shared`
- `brand-brief-studio:history:v12:<language>`

History is bounded to eight entries per language. No TTL is currently applied. The UI provides a user-triggered deletion action for all `brand-brief-studio:*` product keys.

Do not add cloud sync, telemetry of brief contents or remote backup without a new review.

## 5. Analytics

Yandex Metrica is optional and must remain consent-gated.

Required code properties:

- no tag initialization before `accepted`;
- `webvisor: false`;
- official counter disable flag on decline/withdrawal;
- best-effort cleanup of accessible first-party Metrica identifiers on withdrawal;
- no custom event containing questionnaire text, generated brief text, names, emails or free-text field values.

Required account check before production:

- Session Replay/Webvisor off;
- form/session replay features off where applicable;
- advanced/contact-data tracking reviewed and disabled unless separately justified;
- access to analytics account limited appropriately.

## 6. Static hosting

Target: SourceCraft Sites / SourceCraft Free.

The app must remain deployable as static HTML/CSS/JavaScript. Do not introduce:

- server functions;
- databases;
- server-side environment secrets;
- remote AI fallback;
- server logging of questionnaire data.

Ordinary static-host request metadata exists at infrastructure level. Record actual host/log information after the live SourceCraft deployment rather than making unsupported retention promises in code documentation.

## 7. External resources

Target runtime must not load:

- `api.groq.com`;
- Yandex Cloud AI Studio endpoints;
- `fonts.googleapis.com`;
- `fonts.gstatic.com`;
- `mc.webvisor.org`.

`mc.yandex.ru` is allowed only after analytics consent.

Until licensed local Manrope/Unbounded font files are committed, use system/local font fallbacks.

## 8. CSP / browser permissions

Legacy Vercel previews retain a restrictive CSP as a regression aid:

- default/style/font: self;
- Metrica explicitly allowed where needed;
- no Webvisor or Google Fonts domains;
- `object-src 'none'`;
- `frame-ancestors 'none'`;
- camera/microphone/geolocation disabled.

SourceCraft header capabilities must be checked at deployment time. Do not assume Vercel-specific headers automatically transfer to another static host.

## 9. Secrets

The local-only production app requires no AI key, database credential or server environment secret.

If any future feature requires a secret, it cannot be embedded in client JavaScript. That feature must receive a new architecture/privacy review.

## 10. Regression checks

CI should fail if:

- local generator output becomes schema-invalid;
- local adapter stops identifying itself as `browser-local`;
- public HTML describes questionnaire processing as remote AI;
- Google Fonts hosts reappear;
- Webvisor becomes true;
- privacy pages reintroduce Yandex Cloud AI Studio as the active questionnaire processor.

Live pre-cutover test must additionally confirm via DevTools Network that Build sends no questionnaire request.

## 11. Incident boundary

Because Brand Brief Studio intentionally has no server copy of questionnaires, a compromise of application storage should not expose a central database of user briefs. This does not eliminate risks from:

- malicious client-side code supply-chain changes;
- compromised static hosting/source repository;
- analytics misconfiguration;
- data left in a shared browser/device;
- exported files saved by the user.

Treat unexpected remote transmission of questionnaire content as a privacy/security incident and stop the affected deployment while investigating.
