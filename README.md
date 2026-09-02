# Brand Brief Studio

A bilingual, AI-assisted workspace for turning real project context into an editable brand brief—without presenting model assumptions as market research.

**Live product:** https://ai-brand-brief.vercel.app/

**Russian version:** https://ai-brand-brief.vercel.app/ru/

## Portfolio snapshot

**Role:** product concept · brand methodology · UX/UI · front-end · serverless integration · testing · deployment

**Status:** v1.1

**Format:** EN / RU · responsive web application

**Core idea:** help a designer or client team move from fragmented inputs to a reviewable working document

## The problem

Brand projects often start with scattered notes, visual preferences and unverified assumptions. A short AI prompt can make that material sound polished, but it can also hide what is missing, invent confidence and produce a document that is difficult to use in real work.

## The solution

Brand Brief Studio asks for the context that a serious first brief needs:

- business offer and project challenge
- primary goal and market
- audience, needs and barriers
- competitors and alternatives
- defensible difference and proof
- personality, deliverables and constraints

It turns those inputs into 13 editable sections, including positioning, value proposition, messaging, visual direction, risks and ordered next steps. Missing evidence remains visible instead of being silently filled with invented research.

## Product flow

```text
Professional questionnaire
        ↓
Local autosave + validation
        ↓
POST /api/generate
        ↓
Server-side input limits + rate guard
        ↓
Groq API + strict JSON Schema
        ↓
Validated working brief
        ↓
Edit · history · copy · JSON · PDF
```

If AI generation is unavailable, the interface preserves the answers and offers two explicit choices: retry or create a clearly labelled local structured draft. It never disguises a template as a successful AI response.

## Key product decisions

### Evidence-aware output

The prompt forbids invented research, market claims and proof. The output includes a dedicated “Risks and unknowns” section so uncertainty remains part of the working document.

### Schema-constrained generation

The server uses Structured Outputs with a strict JSON Schema, then validates the response again before returning it to the browser.

### Honest failure states

API errors, timeouts and unavailable credentials produce a recoverable interface state. The user’s local draft remains intact and the fallback is always labelled as non-AI.

### Local-first continuity

Questionnaire drafts and the eight most recent briefs are stored in the current browser. No account is required, and recent work can be reopened and edited.

### Lightweight exports

The product supports formatted clipboard output, machine-readable JSON and a print-optimized browser PDF workflow without adding heavy client dependencies.

## Reliability and safety

- API credentials remain server-side
- required-field and length validation in browser and server
- request body size limit
- request timeout and best-effort per-instance rate guard
- strict schema-constrained model output
- output validation before rendering
- explicit warning against submitting confidential client information
- no HTML injection from generated content
- security headers and restrictive Content Security Policy
- reduced-motion and keyboard-focus support
- automated core tests and GitHub Actions checks

The in-memory rate guard is intentionally lightweight for this portfolio deployment. A production multi-instance service should use a shared rate-limit store or the hosting provider’s firewall.

Questionnaire answers submitted for AI generation are processed by Groq. The public demo should be used with fictional or non-confidential project information.

## Stack

- semantic HTML5
- responsive CSS and print styles
- vanilla JavaScript ES modules
- Local Storage, Clipboard and Blob APIs
- Vercel serverless function
- Groq Chat Completions API with Structured Outputs
- Node.js built-in test runner
- GitHub Actions
- Vercel

## Run locally

The static interface works with any local web server. AI generation requires a Vercel-compatible serverless environment and the variables from `.env.example`.

```bash
npm install
npm run check
npm test
```

Environment variables:

```text
GROQ_API_KEY=your_server_side_key_here
GROQ_MODEL=openai/gpt-oss-20b
```

## Project structure

```text
api/generate.js          server-side generation and validation
lib/brief-core.js        shared data rules and local-draft logic
test/                    dependency-free core tests
.github/workflows/       automated quality checks
index.html               English interface
ru/index.html            Russian interface
app.js                   browser state and interaction layer
style.css                responsive and print design system
vercel.json              deployment security headers
```

## What I learned

This project connects my branding practice with product-building. The most important lesson was that a reliable AI product is not defined by the prompt alone: it needs good input structure, explicit uncertainty, predictable data contracts, recoverable errors and a useful workflow before and after generation.

## Related work

**Job Search CRM:** https://job-search-crm-psi.vercel.app/  
**Portfolio:** https://anostosio.ru/

---

Created by **Anostosio°**

Graphic Design · Branding · Advertising · AI-assisted Product Building
