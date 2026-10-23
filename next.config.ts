import type { NextConfig } from "next";

// Allows next/image to load Product/Service/Article images served by the
// backend from whatever host the API URL points at, in any environment, plus
// Cloudinary, which now hosts every uploaded image. This runs at build time on
// the server, so it reads either name; only the browser-visible code needs the
// NEXT_PUBLIC_ prefix.
const apiBase = process.env.NEXT_PUBLIC_API_URL ?? process.env.NEXT_API_URL;
const apiOrigin = apiBase ? new URL(apiBase) : undefined;

const nextConfig: NextConfig = {
  // Next.js only inlines NEXT_PUBLIC_* variables into the browser bundle, and
  // the API calls in src/lib/api.ts run in client components ("use client").
  // This project's convention is to name the variable NEXT_API_URL, so it is
  // re-exported here under that name via the `env` option — the documented way
  // to make a differently-named variable available to the browser.
  //
  // This is inlined at BUILD time: restart `npm run dev` after changing it, and
  // on a host like Vercel set NEXT_API_URL (or NEXT_PUBLIC_API_URL) there and
  // redeploy. NEXT_PUBLIC_API_URL still takes precedence when both are set, so
  // nothing breaks if you use the standard name instead.
  env: {
    NEXT_API_URL: apiBase ?? "",
  },
  images: {
    remotePatterns: [
      // Cloudinary serves all uploaded images (secure_url URLs).
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
      },
      // The backend origin, for any image URL that still points at the API.
      ...(apiOrigin
        ? [
            {
              protocol: apiOrigin.protocol.replace(":", "") as "http" | "https",
              hostname: apiOrigin.hostname,
              port: apiOrigin.port,
            },
          ]
        : []),
    ],
    // Next 16's SSRF guard refuses to optimize images whose hostname
    // resolves to a private/loopback IP — which "localhost" always does in
    // local dev, since the API URL points at the backend on the
    // same machine. Safe here because remotePatterns above already scopes
    // optimization to that one, explicitly configured backend origin.
    dangerouslyAllowLocalIP: true,
  },
};

export default nextConfig;
