# Ingata Pharmacy — Frontend

Next.js (App Router) frontend for the Ingata Pharmacy application, styled with Tailwind CSS. Talks to the [pharmacy-website-backend](https://github.com/ingatatech/pharmacy-website-backend) API.

## Stack

- Next.js (App Router), TypeScript, Tailwind CSS

## Run locally

```bash
cp .env.local.example .env.local   # set NEXT_PUBLIC_API_URL to the backend's URL
npm install
npm run dev                         # http://localhost:3000
```

Other scripts: `npm run build`, `npm start`, `npm run typecheck`.

## Environment variables

See `.env.local.example`:

| Variable | Purpose |
|---|---|
| `NEXT_PUBLIC_API_URL` | Base URL the frontend calls for the backend API |

## Run with Docker

```bash
docker build -t pharmacy-website-frontend .
docker run -p 3000:3000 --env-file .env.local pharmacy-website-frontend
```
