# Brand Brief Studio — Legal / Operator Checklist (Russia)

Status: **owner-action checklist for the zero-cost local-only target**  
Reviewed: **2026-09-03**

This checklist separates code changes from obligations that depend on the real personal-data operator and live infrastructure. It is not a certificate of compliance and must not contain invented legal details.

## 0. Operator identity — blocking item

**OWNER ACTION — REQUIRED BEFORE FINAL PUBLIC NOTICE**

Complete and verify:

- [ ] Full legal name / actual legal status of the operator.
- [ ] Address/details required in the operator’s notices/documents, if applicable.
- [ ] Contact channel for personal-data requests.
- [ ] Responsible person/process for personal-data matters, if applicable.
- [ ] Do not insert fictitious IP/INN/OGRN/self-employed status or other requisites.

Privacy-page placeholders must remain obvious TODOs until real information is supplied.

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
- [ ] Record the actual static-host provider and infrastructure information available to the operator.
- [ ] Review Article 18(5) against the actual technical-data/analytics flows rather than claiming that browser Local Storage itself is an operator-controlled Russian database.
- [ ] Do not describe localStorage as a statutory localization mechanism.

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

Migration-draft EN/RU privacy pages currently describe:

- browser-local questionnaire processing;
- Local Storage draft/history;
- static-host technical metadata;
- optional Yandex Metrica;
- Webvisor disabled;
- deletion/analytics choices;
- operator/contact placeholders.

Before final publication:

- [ ] Insert real operator/contact information.
- [ ] Replace SourceCraft/live-host TODOs with verified facts.
- [ ] Verify analytics statements against the Metrica dashboard.
- [ ] Remove the migration-draft warning only after live verification.
- [ ] Keep the privacy page readily accessible from the product.

Article 18.1:

- https://www.consultant.ru/document/cons_doc_LAW_61801/eeeebe22bf738fd65bb66b95cc278911ae2525ee/

## 6. Legal basis and consent

**OWNER ACTION**

Document a legal basis for each real processing purpose under Article 6.

The questionnaire itself is designed to remain on the user's device. Optional analytics is a separate purpose and is already presented as a separate opt-in choice.

If consent is relied on for a processing purpose, it must satisfy current Article 9 requirements; do not hide consent inside unrelated terms or rely on one blanket checkbox for every possible flow.

- Article 6: https://www.consultant.ru/document/cons_doc_LAW_61801/315f051396c88f1e4f827ba3f2ae313d999a1873/
- Article 9: https://www.consultant.ru/document/cons_doc_LAW_61801/6c94959bc017ac80140621762d2ac59f6006b08c/

## 7. Third-party personal data

Because the questionnaire no longer leaves the user's browser, third-party content entered there is not intentionally transferred to Brand Brief Studio infrastructure.

Still:

- [ ] do not encourage users to enter passwords, API keys or unnecessary sensitive information;
- [ ] do not claim the user can consent on behalf of unrelated third parties;
- [ ] if any future sync/server/AI feature is introduced, reassess third-party personal-data handling before release.

## 8. SourceCraft Sites / static-host relationship

**OWNER ACTION**

Before production cutover, retain current materials relevant to the actual SourceCraft Sites deployment:

- [ ] SourceCraft organization/repository and final public URL;
- [ ] current Free-plan/hosting terms;
- [ ] information available about infrastructure logs/access/retention;
- [ ] account access controls and MFA/recovery settings;
- [ ] confirmation that no paid/Pro resource was enabled for this project unless the owner explicitly chooses it later.

Do not infer infrastructure facts solely from repository code.

## 9. Yandex Metrica

**CODE**

- [x] Tag loads only after stored `accepted` choice.
- [x] Explicit decline supported.
- [x] Analytics settings can be reopened.
- [x] Webvisor disabled in code.
- [x] Withdrawal disables further counter activity and attempts browser-side cleanup.
- [x] No custom questionnaire values are intentionally sent by Brand Brief Studio code.

**OWNER ACTION**

- [ ] Check Webvisor / Session Replay is also disabled in the Metrica dashboard.
- [ ] Check advanced/contact-data tracking features are off unless separately justified/documented.
- [ ] Record actual analytics purpose and provider terms.
- [ ] Live-test that no Metrica request occurs before consent.
- [ ] Live-test that questionnaire/free-text values are not present in analytics requests/events.

## 10. Incident response

**OWNER ACTION — PREPARE BEFORE FINAL LAUNCH**

A local-only questionnaire reduces the chance of a central brief database breach, but incidents are still possible through hosting/source compromise, analytics misconfiguration or accidental remote transmission.

Create a process capable of meeting Article 21 requirements where their statutory trigger is met:

- [ ] identify and contain the incident;
- [ ] preserve evidence and identify affected data/subjects;
- [ ] initial Roskomnadzor notice within **24 hours** where required;
- [ ] investigation/follow-up within **72 hours** where required;
- [ ] maintain an incident register and responsible contacts.

Primary law:

- Federal Law No. 152-FZ, Article 21: https://www.consultant.ru/document/cons_doc_LAW_61801/d3fe43a7c415353b17faab255bc0de92bea127da/

## 11. Subject requests and deletion

**CODE**

The application supports:

- local draft/history deletion in the current browser;
- optional analytics withdrawal.

These controls cover product-local storage only. They do not replace an operator process for requests relating to hosting/analytics data where statutory rights apply.

**OWNER ACTION**

Document how requests to access, clarify, stop, block or delete data will be handled, using the final operator contact.

## 12. Security / access

**ENGINEERING + OWNER**

- [x] No AI/API secret is required for the target app.
- [x] No server database is required.
- [x] Google Fonts removed from target runtime.
- [x] Webvisor disabled in code.
- [ ] Keep GitHub/SourceCraft/analytics accounts protected with MFA and secure recovery.
- [ ] Restrict repository and analytics access to people who need it.
- [ ] Review SourceCraft and Metrica account settings before cutover.
- [ ] Keep questionnaire content out of future telemetry/events.

## 13. Pre-merge / pre-cutover gate

CI success alone is not enough to retire the legacy site.

Required before production cutover:

- [ ] SourceCraft Free site is live and tested over HTTPS;
- [ ] DevTools Network proves Build causes no questionnaire HTTP request;
- [ ] no Groq/YandexGPT/Google Fonts/Webvisor request occurs in the target path;
- [ ] Metrica is silent before consent;
- [ ] actual SourceCraft URL and host facts are recorded;
- [ ] canonical/sitemap/robots point to the actual production URL;
- [ ] real operator/contact information is available;
- [ ] relevant Roskomnadzor action is completed or documented as not applicable with a defensible basis;
- [ ] final privacy wording is reconciled with live hosting/analytics settings;
- [ ] only then redirect or retire the legacy Vercel/Groq production deployment.
