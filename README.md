# AI Brand Brief

AI Brand Brief is a lightweight AI-assisted product that turns a short business questionnaire into a structured starter direction for branding and communication.

**Live demo:** https://ai-brand-brief.vercel.app/  
**Russian version:** https://ai-brand-brief.vercel.app/ru/

The project was created as part of my transition from graphic design and advertising into **AI-assisted product building / vibe coding**.

## What the product does

The user answers a short set of questions about a business and receives a structured result containing:

- brand summary
- audience focus
- positioning direction
- tone of voice
- three key messages
- visual direction
- recommended next step

The generated result can be **edited directly in the interface**, copied as formatted text, or saved as a clean **PDF through the browser print workflow**.

## Current MVP

**MVP v0.4 — bilingual deployed portfolio prototype**

The project is publicly deployed on Vercel and now includes:

- English interface
- Russian interface at `/ru/`
- language-aware demo generation
- server-side AI generation path through `api/generate.js`
- deterministic fallback when AI credentials are unavailable
- editable generated sections
- copy-to-clipboard
- PDF export / print layout
- responsive UI

The current public deployment intentionally runs safely without a private API credential. The browser never receives or stores an API key.

## Why I built it

My background is in graphic design, branding and advertising. A recurring problem in design projects is that clients often start with scattered information instead of a usable brief.

This product explores how an AI-assisted workflow can structure that context before visual work begins. Instead of building a generic coding exercise, I wanted the first product in my AI-builder portfolio to solve a problem connected to my actual professional experience.

## My role

- Product concept
- UX structure
- UI direction
- Brand / communication logic
- Prompt and output architecture
- Front-end implementation with AI-assisted coding
- Serverless AI integration
- Bilingual product flow
- Editing and export features
- Error and fallback flow
- Deployment
- Testing and iteration

## Stack

- HTML5
- CSS3
- Vanilla JavaScript
- Responsive layout
- Browser Clipboard API
- ContentEditable API
- Print / PDF CSS
- Serverless JavaScript API route
- OpenAI-compatible server-side generation architecture
- Environment variables for secret management
- Git / GitHub
- Vercel

## Architecture

```text
User questionnaire
      ↓
Browser UI (EN / RU)
      ↓
POST /api/generate
      ↓
Serverless function
      ↓
AI provider when configured
      ↓
Validated JSON brief
      ↓
Editable result
      ↓
Copy / Save PDF
```

If the server-side request fails or AI credentials are not configured, the frontend switches to a deterministic local fallback instead of breaking the experience.

## Security decision

The AI API key is **never stored in `app.js` or any other browser-visible file**. For a private or production AI-enabled deployment, credentials should be added only as server-side environment variables in the deployment platform.

## Product decisions

### Graceful fallback

The app remains usable even when the external AI service is unavailable. The fallback keeps the whole product flow testable without exposing credentials or creating API costs.

### Editable output

Generated strategy is treated as a working draft rather than a final answer. The user can switch the result into edit mode, refine individual sections, and then copy or save the edited version.

### PDF without a heavy dependency

The MVP uses a dedicated print stylesheet and the browser's native **Save as PDF** flow instead of adding a large client-side PDF library.

### Bilingual flow

The English and Russian interfaces share the same logic and server endpoint. The selected interface language is passed to the generation layer so a future live AI response can follow the user's language.

### Design-led development

The interface uses a restrained editorial visual system rather than a generic SaaS template. The goal is to combine product thinking with my existing visual communication skills.

## Next improvements

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
