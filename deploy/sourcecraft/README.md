# SourceCraft Sites deployment — zero-cost target

Brand Brief Studio v1.3 is a static browser-local application. No server runtime, database, remote AI provider or Yandex Cloud billing account is required.

## Why SourceCraft Sites

SourceCraft Sites is documented by Yandex as free static website hosting. The SourceCraft Free plan is not billed. A Sites deployment must use a public repository in a public SourceCraft organization.

Official references:

- https://sourcecraft.dev/portal/docs/ru/sourcecraft/tutorials/sites
- https://sourcecraft.dev/portal/docs/ru/sourcecraft/concepts/sites
- https://sourcecraft.dev/portal/docs/ru/sourcecraft/pricing

## Repository configuration

`.sourcecraft/sites.yaml` publishes the repository's `main` branch directly. The website is plain HTML/CSS/JavaScript and needs no build step.

```yaml
site:
  ref: main
```

## Manual setup after this PR is ready

1. Sign in to SourceCraft. Stay on **SourceCraft Free**; do not attach a billing account or enable Pro for this project.
2. Create or use a **public SourceCraft organization**.
3. Import/mirror the public GitHub repository `Anostosio/ai-brand-brief` into a **public SourceCraft repository**.
4. Confirm `.sourcecraft/sites.yaml` is present in SourceCraft `main`.
5. Enable/publish SourceCraft Sites for the repository if it is not picked up automatically.
6. Wait for the public `https://<organization>.sourcecraft.site/<repository>/` address.
7. Test EN, RU, Privacy, JSON export and PDF/print output.
8. In browser DevTools Network, submit a completed questionnaire and verify there is **no network request containing questionnaire text** and no `/api/generate` HTTP request. The local adapter intentionally handles the legacy route name inside the browser only.
9. Decline analytics and verify no `mc.yandex.ru` request occurs. Then accept analytics and verify basic Metrica loads while no Webvisor endpoint appears.
10. Record the final SourceCraft public URL in privacy/legal documentation and update canonical/sitemap/robots if `brief.anostosio.ru` is not actually used.
11. Only after the new static production URL is verified should the old Vercel/Groq production deployment be redirected or retired.

## Domain note

The SourceCraft Sites documentation currently guarantees a `sourcecraft.site` URL. This repository does **not** assume that a free custom domain is available for Sites. `brief.anostosio.ru` remains a proposed canonical target until an actually supported zero-cost domain mapping/redirect is confirmed. Do not purchase infrastructure solely to preserve that hostname.

## Privacy invariant

The production questionnaire path must remain:

```text
browser form
  -> browser-local rules engine
  -> browser render/localStorage/export
```

Adding any remote AI, form endpoint, logging collector, proxy or server-side fallback for questionnaire contents requires a new privacy/legal review before deployment.
