# Brand Brief Studio — Legal / Operator Checklist (Russia)

Status: **owner-action checklist for the zero-cost local-only target**  
Reviewed: **2026-09-03**

This checklist separates code changes from obligations that depend on the real personal-data operator and live infrastructure. It is not a certificate of compliance and must not contain invented legal details.

## 0. Operator identity

Known and supplied by the owner:

- [x] Legal status for this product: **individual / физическое лицо**.
- [x] Public contact channel for privacy and personal-data requests: **Anostosio@yandex.ru**.
- [ ] Full legal name, if required for a Roskomnadzor filing, formal request handling or another applicable operator document.
- [ ] Address/details required in the operator’s notices/documents, if applicable.
- [ ] Responsible person/process for personal-data matters, if applicable.
- [x] Do not insert fictitious IP/INN/OGRN/self-employed status or other requisites.

The public Privacy pages identify the operator as the individual owner of Anostosio° / Product Lab and publish the supplied contact email. They do not invent registration details.

## 1. What changed legally with local-only generation

The target questionnaire path is now:

```text
browser questionnaire -> browser-local rules engine -> browser render/localStorage/export
```

There is no Brand Brief Studio application backend, database or remote AI recipient for questionnaire contents.

This materially reduces the personal-data processing surface compared with the legacy `browser -> Vercel -> Groq` architecture. It does **not** justify saying that the site performs no personal-data processing at all, because:

- static hosting receives ordinary technical request metadata such as IP address/headers/timestamps;
- optional Yandex Metrica processes analytics data after opt-in;
- operator obligations depend on the actual purposes, data and live provider configuration.

## 2. Notification of personal-data processing — review still required

**OWNER ACTION**

Determine whether the actual operator must submit or update the notification under Article 22 of Federal Law No. 152-FZ. Do not assume that a static/local-only site is automatically exempt.

The review should reflect what the live site actually processes, including where applicable:

- ordinary hosting/network identifiers;
- analytics identifiers/events after consent;
- purposes and legal bases;
- categories of subjects/data actually involved;
- providers/persons processing data on the operator's instructions, if applicable;
- security measures and infrastructure information requested by the current Roskomnadzor form;
- start/termination conditions.

Primary sources:

- Federal Law No. 152-FZ, Article 22: https://www.consultant.ru/document/cons_doc_LAW_61801/d996966e22e1320c9de1ab82d9f6be12c3d9d765/
- Roskomnadzor Personal Data portal: https://pd.rkn.gov.ru/

## 3. Localization under Article 18(5)

The target architecture intentionally avoids collecting questionnaire contents into an operator-controlled application database at all: the questionnaire remains in the user's browser.

Before final cutover:

- [ ] Verify that no hidden form endpoint, telemetry SDK, error collector or remote AI receives questionnaire fields.
- [x] Record the actual target static-host provider and public project: SourceCraft Sites, `Anostosio Product Lab / ai-brand-brief`, `https://anostosio-product-lab.sourcecraft.site/ai-brand-brief/`.
- [ ] Record infrastructure/log information available to the operator from current SourceCraft terms/settings.
- [ ] Review Article 18(5) against the actual technical-data/analytics flows rather than claiming that browser Local Storage itself is an operator-controlled Russian database.
- [x] Do not describe localStorage as a statutory localization mechanism.

Primary law:

- Federal Law No. 152-FZ, Article 18(5): https://www.consultant.ru/document/cons_doc_LAW_61801/cbf4e15b7c330f9372e876cdf2bc928bad7950ef/

Informational 2025 MinDigital explanation:

- Letter No. П25-44929 dated 12 May 2025: https://www.consultant.ru/document/cons_doc_LAW_511584/

## 4. Cross-border transfers

**QUESTIONNAIRE TARGET: NO REMOTE RECIPIENT**

The local-only target eliminates the previous foreign AI transfer of questionnaire content.

A separate Article 12 assessment becomes necessary again **before release** if questionnaire/free-text content is later sent to any remote recipient, including:

- AI/model API;
- form endpoint;
- error/observability collector;
- analytics custom event containing form values;
- remote backup/sync;
- session-replay/form-recording tool;
- proxy or remote fallback.

Do not assume a consent checkbox automatically solves localization or cross-border requirements.

Primary law:

- Federal Law No. 152-FZ, Article 12: https://www.consultant.ru/document/cons_doc_LAW_61801/e4ebbe1780de623c7cf32a59ca82a7bb523a25dd/

## 5. Public privacy information

**CODE + OWNER ACTION**

EN/RU privacy pages now describe:

- operator status: individual / физическое лицо;
- public contact: `Anostosio@yandex.ru`;
- browser-local questionnaire processing;
- Local Storage draft/history;
- SourceCraft static-host technical metadata;
- optional Yandex Metrica;
- Webvisor disabled in code;
- deletion/analytics choices.

Before final publication:

- [x] Insert the supplied operator status/contact information without inventing registration details.
- [x] Replace SourceCraft/live-host placeholders with the known public project and URL.
- [ ] Verify analytics statements against the Metrica dashboard.
- [ ] Remove the pre-launch warning only after live network + analytics verification.
- [x] Keep the privacy page readily accessible from the product.

## 6. Consent and analytics

Current product behaviour:

- Metrica is not initialized before an explicit analytics choice;
- Webvisor is disabled in site code;
- withdrawing consent disables further counter activity and attempts best-effort cleanup of accessible first-party Metrica identifiers.

Still verify outside the repository:

- [ ] Webvisor / Session Replay disabled in the actual Metrica dashboard.
- [ ] Form analysis/session recording settings do not capture questionnaire content.
- [ ] Advanced/contact-data collection is disabled unless separately justified and documented.
- [ ] A no-consent page load sends no Metrica request.

## 7. Live-network release gate

Before retiring the Vercel/Groq deployment, use browser DevTools Network on the SourceCraft version and confirm:

- [ ] Build/Generate sends no questionnaire/free-text request to a remote API.
- [ ] No request to `api.groq.com` or another AI API exists.
- [ ] No Google Fonts request exists.
- [ ] No Webvisor/session-replay request exists.
- [ ] Before analytics consent, no Yandex Metrica tag/request is initiated by the application.
- [ ] After analytics consent, only the intended basic analytics dependencies appear.

Keep a dated screenshot or short release note as evidence of this check.

## 8. Incident and rights process

Even with a small/static product, maintain a minimal owner process:

- privacy/personal-data inbox: `Anostosio@yandex.ru`;
- respond to substantiated subject requests using the applicable statutory process;
- document deletion/restriction actions where relevant;
- maintain an incident escalation note for hosting/analytics incidents;
- review current Article 21 notification duties if a qualifying personal-data incident occurs.

Primary law:

- Federal Law No. 152-FZ, Article 21: https://www.consultant.ru/document/cons_doc_LAW_61801/cf0253024e2f96f501863c5303fb312151eea36d/

## 9. Do not silently reintroduce remote questionnaire processing

Any future change that sends questionnaire/free-text content off-device must trigger a fresh privacy/legal review before release. This includes “temporary” AI fallback, error monitoring with payloads, form analytics or cloud synchronization.

The repository regression tests intentionally guard the current local-only architecture, but tests are not a substitute for live network verification.
