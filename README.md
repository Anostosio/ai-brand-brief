# AI Brand Brief

AI Brand Brief is a lightweight AI-assisted product that turns a short business questionnaire into a structured starter direction for branding and communication.

The project was created as part of my transition from graphic design and advertising into **AI-assisted product building / vibe coding**.

## What the product does

The user answers a short set of questions about a business:

- brand or project name
- product / service
- target audience
- market
- business goal
- desired personality
- competitors
- things the brand should avoid

The app generates a structured result containing:

- brand summary
- audience focus
- positioning direction
- tone of voice
- three key messages
- visual direction
- recommended next step

The result can also be copied as a formatted text brief.

## Current MVP

**MVP v0.2 — AI-ready full flow**

The project now has two generation paths:

1. **Live AI generation** through a secure server-side endpoint at `api/generate.js`.
2. **Built-in deterministic fallback** so the prototype remains usable when the AI service is unavailable or not configured.

The browser never receives the private API key.

## Why I built it

My background is in graphic design, branding and advertising. A recurring problem in design projects is that clients often start with scattered information instead of a usable brief.

This product explores how an AI-assisted workflow can structure that context before visual work begins.

Instead of building a generic coding exercise, I wanted the first product in my AI-builder portfolio to solve a problem connected to my actual professional experience.

## My role

- Product concept
- UX structure
- UI direction
- Brand / communication logic
- Prompt and output architecture
- Front-end implementation with AI-assisted coding
- Serverless AI integration
- Error and fallback flow
- Testing and iteration

## Stack

- HTML5
- CSS3
- Vanilla JavaScript
- Responsive layout
- Browser Clipboard API
- Serverless JavaScript API route
- OpenAI Responses API
- Environment variables for secret management
- Git / GitHub
- Vercel-ready deployment structure

## Architecture

```text
User questionnaire
      ↓
Browser UI
      ↓
POST /api/generate
      ↓
Serverless function
      ↓
OpenAI Responses API
      ↓
Validated JSON brief
      ↓
Rendered result
```

If the server-side request fails, the frontend switches to a deterministic local fallback instead of breaking the experience.

## Security decision

The AI API key is **never stored in `app.js` or any other browser-visible file**.

For deployment, it must be added as a server-side environment variable:

```text
OPENAI_API_KEY=...
OPENAI_MODEL=gpt-5.6-luna
```

`.env.example` documents the required variables, while `.gitignore` prevents local environment files from being committed.

## Local usage

The front-end demo can still be opened directly through `index.html`, but the serverless AI endpoint requires a compatible local/deployed runtime.

For a public live version, deploy the repository to Vercel and configure the environment variables there.

## Deployment — Vercel

1. Import this GitHub repository into Vercel.
2. Keep the default project settings; no build command is required.
3. Add `OPENAI_API_KEY` in **Project Settings → Environment Variables**.
4. Optionally add `OPENAI_MODEL` with value `gpt-5.6-luna`.
5. Redeploy.
6. Open the generated Vercel URL and test **Use example**.

Do not place the real API key in GitHub, JavaScript, screenshots or the README.

## Product decisions

### Safe AI integration

The first prototype intentionally separated browser UI from the model request. This lets the public repository demonstrate a real AI architecture without exposing private credentials.

### Graceful fallback

An AI product should not become unusable just because one external request fails. The app keeps a deterministic generation path as a fallback and clearly tells the user which mode produced the result.

### Structured output

The server asks the model for a predictable JSON object and validates the expected fields before returning them to the interface. This makes rendering more reliable than treating AI output as an arbitrary block of text.

### Design-led development

The interface uses a restrained editorial visual system rather than a generic SaaS template. The goal is to combine product thinking with my existing visual communication skills.

## Next improvements

- editable generated sections
- export to PDF
- local brief history
- regenerate individual sections
- stronger schema-constrained model output
- lightweight request limiting / abuse protection
- accessibility and UX testing

## About

Created by **Anostosio°**  
Graphic Design · Branding · Advertising · AI-assisted Product Building

Portfolio: https://anostosio.ru/
