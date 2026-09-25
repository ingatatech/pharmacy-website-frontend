# Ingata Pharmacy — Frontend

This is the customer-facing website and admin dashboard for Ingata Pharmacy, a pharmacy chain operating across Kigali. It's built with Next.js (App Router) and talks to a separate Express/Prisma API ([pharmacy-website-backend](https://github.com/ingatatech/pharmacy-website-backend)) for everything — there's no data fetched or stored on this side beyond what the API returns.

## What's in here

The public site covers the usual ground for a pharmacy: services, a product catalog with search, a blog/health-articles section, branch locations with opening hours and maps, prescription refill requests, and a contact form. All of it is translatable on the fly — the language switcher in the header calls Groq to translate page content into Kinyarwanda without needing a separate set of pre-translated pages.

The `/admin` section is a full dashboard for staff: CRUD for services, products, categories, locations, FAQs and articles, plus a review queue for articles (draft → pending review → approved → published) so a pharmacist can sign off on anything medical before it goes live. There's also a refill-request and contact-inquiry inbox, a site-settings editor for things like the homepage copy and opening hours, user management, and an audit log. Access is role-gated — `admin` and `pharmacist_reviewer` see different things, and everyone else gets redirected out.

## Stack

- Next.js 16 (App Router, Turbopack), React 19, TypeScript
- Tailwind CSS
- Framer Motion for the scroll/entrance animations
- Groq for live translation

## Running it locally

You'll need the backend running too — this project doesn't work standalone since it has no database of its own.

```bash
cp .env.local.example .env.local
npm install
npm run dev
```

The site comes up on `http://localhost:3000`. Set `NEXT_PUBLIC_API_URL` in `.env.local` to wherever the backend is running (`http://localhost:4000` by default). If you want the language switcher to actually translate anything, drop a Groq API key in `GROQ_API_KEY` — without it the switcher is still there but just leaves the page in English.

Other scripts:

```bash
npm run build       # production build
npm start            # serve the production build
npm run typecheck    # tsc --noEmit
npm run lint         # eslint
```

## Environment variables

| Variable | Required | Purpose |
|---|---|---|
| `NEXT_PUBLIC_API_URL` | yes | Base URL of the backend API. This gets baked into the client bundle, so it has to be reachable from the browser, not just the server. |
| `GROQ_API_KEY` | no | Enables the language switcher's live translation. Server-only — never prefix this with `NEXT_PUBLIC_`, it's read inside `/api/translate` and must never reach the browser. |
| `GROQ_MODEL` | no | Defaults to `openai/gpt-oss-120b` if you leave it blank. |

## A few things worth knowing before you touch the code

- Product and article images are uploaded through the admin panel and served by the *backend* on its own origin, not this one — `resolveUploadUrl()` in `src/lib/api.ts` turns the relative `/uploads/...` path the API returns into an absolute URL. If you add a new place that renders an uploaded image, route it through that helper or it'll silently 404 locally.
- Admin pages are plain, untranslated English on purpose — it's an internal tool, so there's no reason to pay for translation there.
- Sessions expire after 8 hours (set on the backend). When a request comes back 401 with a token attached, the frontend logs the user out automatically instead of showing a confusing error.
- This is a Next 16 project, which changed some things from what you might expect out of older Next.js docs — worth checking `node_modules/next/dist/docs` if something behaves unexpectedly.

## Deploying

```bash
docker build -t pharmacy-website-frontend .
docker run -p 3000:3000 --env-file .env.local pharmacy-website-frontend
```
