# AI Brand Brief

AI Brand Brief is a lightweight product concept that turns a short business questionnaire into a structured starter direction for branding and communication.

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

The app then generates a structured result containing:

- brand summary
- audience focus
- positioning direction
- tone of voice
- key messages
- visual direction
- recommended next step

The result can also be copied as a formatted text brief.

## Current MVP

The first version is intentionally built as a **fully working front-end MVP without exposing an API key**.

Generation currently runs in deterministic demo mode in the browser. This makes the repository safe to publish and allows anyone to test the product immediately.

A server-side LLM integration is planned as the next iteration.

## Why I built it

My background is in graphic design, branding and advertising. A recurring problem in design projects is that clients often start with scattered information instead of a usable brief.

This product explores how an AI-assisted workflow can structure that context before visual work begins.

Instead of building another generic coding exercise, I wanted the first product in my AI-builder portfolio to solve a problem connected to my actual professional experience.

## My role

- Product concept
- UX structure
- UI direction
- Brand / communication logic
- Prompt and output architecture
- Front-end implementation with AI-assisted coding
- Testing and iteration

## Stack

- HTML5
- CSS3
- Vanilla JavaScript
- Responsive layout
- Browser Clipboard API
- Git / GitHub

Planned next iteration:

- serverless API route
- LLM integration
- structured JSON output
- loading / error states
- editable generated sections
- export to PDF
- local history

## Product decisions

### No API key in the browser

The MVP does not place a secret AI API key in client-side JavaScript. Public repositories and browser code are not appropriate places for private credentials.

### Useful before complex

The first version focuses on the full user flow:

`business context → structured input → generated direction → reusable output`

The architecture can later be upgraded from deterministic generation to a real model without redesigning the entire interface.

### Design-led development

The interface uses a restrained editorial visual system rather than a generic SaaS template. The goal was to combine product thinking with my existing visual communication skills.

## How to run

No build process is required.

1. Clone or download the repository.
2. Open `index.html` in a browser.
3. Fill in the form or click **Use example**.
4. Generate and copy the result.

It can also be deployed as a static site on GitHub Pages, Netlify, Cloudflare Pages or Vercel.

## Project status

**MVP v0.1 — working front-end prototype**

Next milestone: connect a real AI model through a secure server-side endpoint and deploy a public demo.

## About

Created by **Anostosio°**  
Graphic Design · Branding · Advertising · AI-assisted Product Building

Portfolio: https://anostosio.ru/
