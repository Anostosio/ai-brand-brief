# AI Brand Brief

AI Brand Brief is a lightweight AI-assisted product that turns a short business questionnaire into a structured starter direction for branding and communication.

**Live demo:** https://ai-brand-brief.vercel.app/

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

**MVP v0.3 — deployed portfolio prototype**

The project is publicly deployed on Vercel and has two generation paths:

1. **Server-side AI generation** through `api/generate.js` when an API key is configured.
2. **Built-in deterministic fallback** so the public prototype remains fully usable when the AI service is unavailable or intentionally not configured.

The current public deployment intentionally runs safely without a private API credential. The browser never receives or stores an API key.

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
- Deployment
- Testing and iteration

## Stack

- HTML5
- CSS3
- Vanilla JavaScript
- Responsive layout
- Browser Clipboard API
- Serverless JavaScript API route
- OpenAI-compatible server-side generation architecture
- Environment variables for secret management
- Git / GitHub
- Vercel

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
AI provider when configured
      ↓
Validated JSON brief
      ↓
Rendered result
```

If the server-side request fails or AI credentials are not configured, the frontend switches to a deterministic local fallback instead of breaking the experience.

## Security decision

The AI API key is **never stored in `app.js` or any other browser-visible file**.

For a private or production AI-enabled deployment, credentials should be added only as server-side environment variables in the deployment platform.

`.env.example` documents the expected variables, while `.gitignore` prevents local environment files from being committed.

## Live deployment

The portfolio version is deployed at:

**https://ai-brand-brief.vercel.app/**

The public version currently demonstrates the complete product flow using the safe fallback mode. This keeps the project testable without exposing credentials or creating third-party API costs.

## Product decisions

### Safe AI architecture

The browser UI and the model request are separated. This lets the public repository demonstrate a real server-side AI architecture without exposing private credentials.

### Graceful fallback

An AI product should not become unusable just because one external request fails. The app keeps a deterministic generation path as a fallback and clearly tells the user which mode produced the result.

### Structured output

The server expects a predictable JSON object and validates the expected fields before returning them to the interface. This makes rendering more reliable than treating model output as an arbitrary block of text.

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
- optional private AI-enabled deployment

## About

Created by **Anostosio°**  
Graphic Design · Branding · Advertising · AI-assisted Product Building

Portfolio: https://anostosio.ru/
