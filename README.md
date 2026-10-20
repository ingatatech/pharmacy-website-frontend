# Ingata Pharmacy — Frontend

This is the customer-facing website and admin dashboard for Ingata Pharmacy, a pharmacy chain operating across Kigali. It's built with Next.js (App Router) and talks to a separate Express/TypeORM API ([pharmacy-website-backend](https://github.com/ingatatech/pharmacy-website-backend)) for everything — there's no data fetched or stored on this side beyond what the API returns.

## What's in here

The public site covers the usual ground for a pharmacy: services, a product catalog with search, a blog/health-articles section, branch locations with opening hours and maps, prescription refill requests, and a contact form. On top of that there's an About/team section, testimonials, a complaints page, and the usual legal pages. All of it is translatable on the fly — the language switcher in the header calls Groq to translate page content into Kinyarwanda without needing a separate set of pre-translated pages.

The `/admin` section is a full dashboard for staff: CRUD for services, products, categories, locations, FAQs, articles, testimonials and team members, plus a review queue for articles (draft → pending review → approved → published) so a pharmacist can sign off on anything medical before it goes live. There's also a refill-request and contact-inquiry inbox, a site-settings editor for things like the homepage copy and opening hours, user management, and an audit log. Testimonials and team members are only *readable* publicly — the public `GET /api/testimonials` and `GET /api/team` return only `isPublished` entries (new ones default to unpublished until a real, pharmacy-approved quote/member is ready), while `/admin/all` is what the dashboard edits.

`/pharmacist` is a separate, smaller workspace for `pharmacist_reviewer` accounts: their own article list, branch view, and read-only views of inquiries and refill requests. The two staff areas are **disjoint** — an admin cannot reach `/pharmacist` and a pharmacist cannot reach `/admin`. That rule lives in one place, `src/lib/admin-access.ts`, and is enforced twice: server-side in `src/proxy.ts` before the route resolves, and client-side in the two area layouts after login.

## Project structure

```
pharmacy-website-frontend/          # 68 pages in total
├── src/
│   ├── app/
│   │   ├── (public)/          # 18 page areas (27 page.tsx files), open to all
│   │   ├── (admin)/admin/     # 14 dashboard sections (34 pages), admin-only
│   │   ├── (pharmacist)/pharmacist/  # 4 sections (7 pages), pharmacist_reviewer
│   │   ├── api/translate/     # server route that calls Groq
│   │   ├── sitemap.ts         # generated from the API's public lists
│   │   └── robots.ts
│   ├── components/            # 73 components, grouped by feature
│   ├── lib/                   # api.ts, auth-context.tsx, admin-access.ts, site.ts, json-ld.ts
│   ├── types/                 # shared types mirroring the API's response shapes
│   └── proxy.ts               # Next 16 middleware — gates the two staff areas
├── public/                    # static assets, images
├── next.config.ts · tailwind.config.ts
├── Dockerfile
└── .github/workflows/ci.yml
```

Route groups change the folder layout, not the URL — so `(public)`, `(admin)` and `(pharmacist)` each get their own layout and guard while `/admin/articles` stays exactly that.

## Stack

- Next.js 16 (App Router, Turbopack), React 19, TypeScript
- Tailwind CSS
- Framer Motion for the scroll/entrance animations
- Lucide icons
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

There is no test suite on the frontend yet — CI runs typecheck, lint and build only.

## Environment variables

| Variable | Required | Purpose |
|---|---|---|
| `NEXT_PUBLIC_API_URL` | yes | Base URL of the backend API. This gets baked into the client bundle, so it has to be reachable from the browser, not just the server. `NEXT_API_URL` is read as a fallback during SSR/build, but only `NEXT_PUBLIC_API_URL` reaches the browser. |
| `NEXT_PUBLIC_SITE_URL` | no | The site's own public URL, used for the sitemap, robots.txt, canonical/OG metadata and structured data. Defaults to localhost; production must set it to the real domain. |
| `NEXT_PUBLIC_GA_MEASUREMENT_ID` | no | Google Analytics 4 property id. When set, analytics only loads for visitors who accept the cookie-consent banner. |
| `GROQ_API_KEY` | no | Enables the language switcher's live translation. Server-only — never prefix this with `NEXT_PUBLIC_`, it's read inside `/api/translate` and must never reach the browser. |
| `GROQ_MODEL` | no | Defaults to `openai/gpt-oss-120b` if you leave it blank. |

## A few things worth knowing before you touch the code

- Product and article images are uploaded through the admin panel and served by the *backend* on its own origin, not this one — `resolveUploadUrl()` in `src/lib/api.ts` turns the relative `/uploads/...` path the API returns into an absolute URL. If you add a new place that renders an uploaded image, route it through that helper or it'll silently 404 locally.
- Every API call goes through `apiFetch`/`apiFetchPaginated` in `src/lib/api.ts`. They throw an `ApiError` carrying the backend's own error message, so prefer surfacing `err.message` over a generic string — and if you add a call that needs `X-Total-Count`, use the paginated variant or you'll lose the header.
- Admin and pharmacist pages are plain, untranslated English on purpose — they're internal tools, so there's no reason to pay for translation there.
- Sessions expire after 8 hours (set on the backend). When a request comes back 401 *with a token attached*, `apiFetch` fires an `ingata:session-expired` event on `window`; `AuthProvider` listens for it and logs the user out so route guards redirect to `/login`, instead of every page showing its own "failed to load". A 401 on an anonymous request deliberately does **not** fire it.
- The staff-area gate in `src/proxy.ts` is an optimistic check, not a security boundary — it reads a client-written cookie and does not verify it. Real authorisation is still the backend's job (the JWT in localStorage and the role middleware); forging the cookie gets someone past a redirect and nothing else.
- This is a Next 16 project, which changed some things from what you might expect out of older Next.js docs — `middleware.ts` is now `proxy.ts`, for instance. Worth checking `node_modules/next/dist/docs` if something behaves unexpectedly.

## Deploying

The site is deployed on Vercel; `NEXT_PUBLIC_API_URL` must be set there to the deployed Render API URL, or every browser-side request fails. Public pages are regenerated on a short interval (120 seconds), so newly published content appears within about two minutes rather than instantly.

```bash
docker build -t pharmacy-website-frontend .
docker run -p 3000:3000 --env-file .env.local pharmacy-website-frontend
```

