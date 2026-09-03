# Yandex Cloud deployment — Brand Brief Studio

This directory describes the **target Russian production deployment**. Do not point public DNS to it until the pre-cutover checklist is complete.

Current target hostname: `brief.anostosio.ru`.

## Components

```text
brief.anostosio.ru
  -> Yandex API Gateway
      -> Object Storage (static EN/RU application)
      -> /api/generate -> Yandex Cloud Function (Node.js 22)
                           -> Yandex Cloud AI Studio / YandexGPT
```

Official references verified on 2026-09-03:

- Cloud Functions Node.js 22: https://yandex.cloud/en/docs/functions/lang/nodejs/
- Node.js function context / service-account IAM token: https://yandex.cloud/en/docs/functions/lang/nodejs/context
- API Gateway Cloud Functions integration: https://yandex.cloud/en/docs/api-gateway/concepts/extensions/cloud-functions
- API Gateway Object Storage integration: https://yandex.cloud/en/docs/api-gateway/concepts/extensions/object-storage
- API Gateway custom domains: https://yandex.cloud/en/docs/api-gateway/operations/api-gw-domains
- AI Studio model documentation: https://yandex.cloud/en/docs/ai-studio/concepts/generation/models

## 1. Create a dedicated Russian folder / resources

Use the Yandex Cloud Russia environment for every resource that handles questionnaire requests.

Create:

1. a private static Object Storage bucket;
2. a Cloud Function for generation;
3. a dedicated function service account for AI invocation;
4. a gateway service account for invoking the function and reading the static bucket;
5. an API Gateway from `api-gateway.yaml`;
6. a Certificate Manager certificate for `brief.anostosio.ru`;
7. DNS record for the final gateway custom domain.

Do not use the legacy Vercel endpoint as an HTTP integration or reverse proxy.

## 2. Function

Runtime: **Node.js 22**.  
Entry point: **`functions/generate.handler`**.  
Timeout: start with ~30 seconds and tune after live testing.  
Memory: use the smallest value that reliably handles the request/response size.

Attach the dedicated function service account. The Node.js invocation context then provides a short-lived IAM token in `context.token.access_token` and the folder ID in `context.functionFolderId`.

The application uses these runtime credentials. A permanent AI key is not required in production.

### Function environment

Set only the explicit model URI if desired:

```text
YANDEX_MODEL_URI=gpt://<FOLDER_ID>/yandexgpt-5.1
```

If Yandex changes the supported model identifier, verify the current model catalogue before deployment rather than silently switching to `/latest`.

### IAM

Grant the function service account only the AI Studio permissions required to invoke the chosen text-generation model. Do not give editor/admin roles simply to make the first deployment work.

Grant the API Gateway service account only:

- permission to invoke the private generation function;
- permission to read the static bucket.

Exact IAM role names should be selected from the current Yandex Cloud IAM UI/docs at deployment time.

## 3. AI request logging

`api/generate.js` sends:

```http
x-data-logging-enabled: false
```

Do not remove this header without a privacy review.

Also inspect AI Studio folder/account data-logging settings in the console before launch. Application code is not a substitute for account-level verification.

## 4. Function / Gateway logging

Brand Brief Studio application logs intentionally omit questionnaire content, generated text and raw IP.

Platform logs are separate. Before launch:

- inspect API Gateway logging options;
- inspect Cloud Functions logging options;
- record actual retention/access in `PRIVACY-DATA-MAP.md` and public privacy wording;
- use no-logging/minimal logging where operationally acceptable;
- ensure any required troubleshooting logs contain metadata rather than request bodies.

Do not claim “nothing is stored on the server” merely because the application has no database.

## 5. Static files

Upload the repository’s public static files to the private Object Storage bucket and serve them through API Gateway.

The gateway specification has explicit routes for:

- `/`
- `/ru/`
- `/privacy/`
- `/ru/privacy/`
- `/api/generate`

and a greedy GET route for other static assets.

Add a small `404.html` object before enabling the greedy route.

### Security headers

The old Vercel deployment used `vercel.json` for CSP and browser security headers. Reproduce equivalent headers on the final Yandex-hosted responses using the supported production mechanism chosen for the static delivery layer, then verify them from the public domain.

Required intent:

```text
X-Content-Type-Options: nosniff
Referrer-Policy: strict-origin-when-cross-origin
Permissions-Policy: camera=(), microphone=(), geolocation=()
Content-Security-Policy: restrictive, self-first, narrow Yandex Metrica allowances only
frame-ancestors 'none'
object-src 'none'
```

Do not copy Google Fonts / Webvisor origins into the final CSP once those dependencies are removed.

## 6. Fonts — mandatory cutover blocker

The migration branch temporarily retains Google Fonts links to avoid shipping missing fonts.

Before public cutover, add officially licensed self-hosted WOFF2 assets for:

- Manrope 400 / 500 / 600 / 700;
- Unbounded 500 / 600;

Both upstream families are licensed under SIL Open Font License 1.1. Preserve the license notices.

Then:

1. add local `@font-face` declarations with `font-display: swap`;
2. remove Google Fonts `<link>` and `preconnect` elements from all EN/RU/privacy HTML;
3. remove `fonts.googleapis.com` and `fonts.gstatic.com` from CSP;
4. verify a browser network trace contains no Google Fonts requests.

Upstream license/source references:

- https://github.com/google/fonts/tree/main/ofl/manrope
- https://github.com/google/fonts/tree/main/ofl/unbounded

## 7. API Gateway

Copy `api-gateway.yaml` and replace:

- `<GATEWAY_SERVICE_ACCOUNT_ID>`;
- `<GENERATION_FUNCTION_ID>`;
- `<STATIC_BUCKET_NAME>`.

The generation integration uses request payload format `2.0`; this provides `requestContext.http.sourceIp`, which the adapter immediately pseudonymizes for application rate limiting.

The application itself still validates body size/fields. Gateway validation/rate limiting may be added later, but its data/privacy behavior must be reviewed before use.

## 8. Custom domain

Only after the gateway works on its Yandex default domain:

1. issue/validate the TLS certificate;
2. bind `brief.anostosio.ru` to the gateway;
3. update DNS;
4. run all smoke tests below;
5. only then prepare the legacy Vercel deployment for redirect/retirement.

Do not make `ai-brand-brief.vercel.app` proxy requests to the Russian API; the final public user-data path should be direct to the Russian production origin.

## 9. Required live smoke tests

Use a fresh browser profile / DevTools Network:

- [ ] `/` works.
- [ ] `/ru/` works.
- [ ] privacy pages work.
- [ ] typing/saving local drafts sends no questionnaire network request.
- [ ] AI generation calls `https://brief.anostosio.ru/api/generate` only.
- [ ] no request to `api.groq.com`.
- [ ] no AI request to Vercel.
- [ ] structured AI response passes application validation.
- [ ] application logs contain no questionnaire text, output text or raw IP.
- [ ] before analytics consent, no Metrica tag/request is present.
- [ ] after consent, Metrica loads but Webvisor/session replay does not.
- [ ] after withdrawal/reload, Metrica stays disabled.
- [ ] Google Fonts requests are absent after self-hosting is completed.
- [ ] security headers are present on HTML and API responses where applicable.
- [ ] final policy wording matches observed behavior.

## 10. Do not merge yet if any of these remain

- operator/contact TODOs;
- Roskomnadzor/operator actions unresolved;
- Yandex Cloud resources not provisioned;
- live Yandex model has not passed representative generation tests;
- Google Fonts still load;
- Webvisor dashboard status unverified;
- production log retention/access not documented;
- DNS/certificate not ready.

CI passing is necessary but not sufficient for this migration.
