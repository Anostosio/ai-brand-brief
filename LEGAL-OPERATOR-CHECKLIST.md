# Brand Brief Studio — Legal / Operator Checklist (Russia)

Status: **owner-action checklist for the target Russian architecture**  
Reviewed: **2026-09-03**

This file separates changes that can be implemented in code from obligations that depend on the real personal-data operator. It is not a certificate of compliance and must not contain invented legal details.

## 0. Operator identity — blocking item

**OWNER ACTION — REQUIRED BEFORE PUBLIC CUTOVER**

Complete and verify:

- [ ] Full legal name / actual legal status of the operator.
- [ ] Address/details required for the operator’s notices and internal documents.
- [ ] Contact channel for personal-data requests.
- [ ] Responsible person/process for personal-data matters, if applicable.
- [ ] Do not insert fictitious IP/INN/OGRN/self-employed status or other requisites.

Repository placeholders in the privacy pages must remain obvious TODOs until this is supplied.

## 1. Notification of personal-data processing

**OWNER ACTION**

Before launch, determine whether the operator must submit/update the notification under Article 22 of Federal Law No. 152-FZ. For a public automated web service, do not assume an exemption without documenting its exact statutory basis.

The notification should reflect the real target system, including as applicable:

- purposes of processing;
- categories of personal data and data subjects actually processed;
- processing actions;
- legal basis;
- Russian database / infrastructure information required in the notification form;
- security measures;
- processors/persons acting on the operator’s instructions where applicable;
- start/termination conditions.

Official starting points:

- Federal Law No. 152-FZ, Article 22: https://www.consultant.ru/document/cons_doc_LAW_61801/d996966e22e1320c9de1ab82d9f6be12c3d9d765/
- Roskomnadzor Personal Data portal: https://pd.rkn.gov.ru/

**CODE**

- [x] Target architecture documented in `PRIVACY-DATA-MAP.md`.
- [ ] Replace migration placeholders only after owner details are supplied.

## 2. Localization under Article 18(5)

**OWNER + ARCHITECTURE**

The target is designed so the public site/API/AI request path is hosted in the Russian Yandex Cloud contour rather than `browser -> Vercel -> Groq`.

Before declaring migration complete:

- [ ] Confirm the actual production resources handling questionnaire requests are in the Russian region/contour.
- [ ] Confirm DNS and API Gateway route do not proxy AI-generation requests through Vercel or another foreign backend.
- [ ] Confirm no hidden telemetry/model gateway sends questionnaire content abroad.
- [ ] Verify platform logging and copies/backups relevant to collected personal data.

Primary law:

- Federal Law No. 152-FZ, Article 18(5): https://www.consultant.ru/document/cons_doc_LAW_61801/cbf4e15b7c330f9372e876cdf2bc928bad7950ef/

Useful 2025 MinDigital explanation (informational, not itself a normative act):

- Letter No. П25-44929 dated 12 May 2025: https://www.consultant.ru/document/cons_doc_LAW_511584/

## 3. Cross-border transfers

**TARGET ARCHITECTURE: NO FOREIGN AI RECIPIENT**

No separate AI cross-border checklist is required for the planned Russian Yandex AI Studio path.

However, **OWNER + ENGINEERING MUST STOP BEFORE RELEASE** if any foreign recipient is reintroduced, including:

- foreign AI/model API;
- foreign fallback model;
- proxy/model gateway;
- external error/observability service receiving questionnaire payloads;
- foreign database/cache;
- foreign form/session-replay tool.

Then perform a fresh Article 12 analysis and, if applicable, the separate Roskomnadzor trans-border notification **before** the transfer begins. “Russian layer first” and a checkbox do not automatically solve Article 12.

Primary law:

- Federal Law No. 152-FZ, Article 12: https://www.consultant.ru/document/cons_doc_LAW_61801/e4ebbe1780de623c7cf32a59ca82a7bb523a25dd/

## 4. Public policy / information to data subjects

**CODE + OWNER ACTION**

Code now includes Brand Brief Studio-specific migration-draft privacy pages covering:

- browser-local drafts/history;
- AI generation server processing;
- target AI provider;
- Yandex Metrica;
- IP / request metadata / rate limiting;
- retention limits that are actually known;
- deletion/analytics choices;
- operator/contact placeholders.

Before public cutover:

- [ ] Insert real operator/contact information.
- [ ] Confirm every retention statement against actual cloud settings.
- [ ] Remove migration-draft warning only after all gates are satisfied.
- [ ] Make the policy readily accessible from all pages where personal data may be collected.

Article 18.1 public policy requirement:

- https://www.consultant.ru/document/cons_doc_LAW_61801/eeeebe22bf738fd65bb66b95cc278911ae2525ee/

## 5. Legal basis / consent model

**OWNER ACTION**

Do not create a consent checkbox merely because the form contains data.

For each actual purpose, document the applicable legal basis under Article 6. If consent is relied on, it must satisfy the current Article 9 requirements and be separately presented/provable where required.

- Article 6: https://www.consultant.ru/document/cons_doc_LAW_61801/315f051396c88f1e4f827ba3f2ae313d999a1873/
- Article 9: https://www.consultant.ru/document/cons_doc_LAW_61801/6c94959bc017ac80140621762d2ac59f6006b08c/

The product UX currently uses a clear notice and prohibits third-party/sensitive/secrets input rather than claiming that a blanket checkbox legalizes all data flows.

## 6. Third-party personal data

**CODE + OWNER POLICY**

- [x] Generate notice says not to enter personal data of third parties.
- [x] Special-category personal data, credentials/secrets and confidential client information are also discouraged.
- [ ] Decide whether additional validation/redaction is warranted after observing real use.
- [ ] Do not represent the user as able to consent on behalf of unrelated third parties without a valid basis.

## 7. Yandex Cloud / processor relationship

**OWNER ACTION**

Before launch, collect and retain the current contractual and provider materials relevant to the chosen Yandex Cloud services:

- [ ] account/contract terms;
- [ ] roles of operator/processor as applicable;
- [ ] region/data-location configuration;
- [ ] access-control configuration;
- [ ] logging/diagnostic configuration;
- [ ] AI request data-logging setting;
- [ ] list of relevant subprocessors/third parties if applicable to the service arrangement;
- [ ] deletion/termination procedures.

Do not infer these solely from application code.

## 8. Yandex Metrica

**CODE**

- [x] Tag loads only after stored `accepted` choice.
- [x] Explicit decline supported.
- [x] Persistent settings control supported.
- [x] Webvisor disabled in code.
- [x] Withdrawal disables further counter activity and attempts browser-side cleanup.

**OWNER ACTION**

- [ ] Check Webvisor / Session Replay is also disabled in the Metrica dashboard.
- [ ] Check advanced/contact-data tracking features are off unless separately justified and documented.
- [ ] Record actual analytics purposes and provider terms in operator documentation.
- [ ] Live-test that no Metrica network request occurs before consent.

## 9. Incident response / unlawful disclosure

**OWNER ACTION — PREPARE BEFORE LAUNCH**

Create an incident process that can meet the statutory notification windows when an incident falls within Article 21 requirements:

- [ ] identify and contain incident;
- [ ] preserve evidence and determine affected data/subjects;
- [ ] initial Roskomnadzor notice within **24 hours** where the statutory trigger is met;
- [ ] internal investigation results / follow-up within **72 hours** where required;
- [ ] maintain incident register, responsible contacts and decision record;
- [ ] coordinate provider incident information.

Primary law:

- Federal Law No. 152-FZ, Article 21: https://www.consultant.ru/document/cons_doc_LAW_61801/d3fe43a7c415353b17faab255bc0de92bea127da/

## 10. Subject requests and deletion

**OWNER ACTION**

Document the operational workflow for requests to access, clarify, block, stop or delete personal data where required by law and the chosen legal basis.

**CODE**

The application already supports:

- local draft/history deletion in the current browser;
- optional analytics withdrawal;
- local (non-AI) draft mode.

These product controls do not replace the operator’s statutory request process.

## 11. Security / access

**ENGINEERING + OWNER**

- [ ] Dedicated least-privilege service account for AI invocation.
- [ ] No AI API key in frontend or repository.
- [ ] Function IAM token supplied by runtime context.
- [ ] Restrict cloud console/IAM access to people who need it.
- [ ] Enable MFA and secure account recovery for cloud/GitHub/admin accounts.
- [ ] Review platform logs and prohibit questionnaire-body logging.
- [ ] Keep secrets out of Git history and exported briefs.
- [ ] Review dependencies and runtime versions periodically.

## 12. Pre-merge / pre-cutover gate

Do **not** merge the migration PR into production merely because CI is green.

Required first:

- [ ] operator details available;
- [ ] relevant Roskomnadzor notification/action completed or documented as not applicable with legal basis;
- [ ] Russian Yandex Cloud resources provisioned and tested;
- [ ] AI quality/structured-output tests pass against live Yandex model;
- [ ] production logs reviewed;
- [ ] Metrica dashboard reviewed;
- [ ] Google Fonts replaced by licensed self-hosted font assets;
- [ ] live network trace confirms no Vercel/Groq/Google Fonts/Webvisor dependency in final user-data path;
- [ ] privacy pages changed from migration draft to final verified wording.
