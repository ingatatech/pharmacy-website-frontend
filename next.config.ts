import type { NextConfig } from "next";

// Allows next/image to load Product/Service/Article images served by the
// backend (e.g. /uploads/<file>) from whatever host the API URL points at,
// in any environment. This runs at build time on the server, so it reads
// either name; only the browser-visible code needs the NEXT_PUBLIC_ prefix.
const apiBase = process.env.NEXT_PUBLIC_API_URL ?? process.env.NEXT_API_URL;
const apiOrigin = apiBase ? new URL(apiBase) : undefined;

const nextConfig: NextConfig = {
  images: {
    remotePatterns: apiOrigin
      ? [
          {
            protocol: apiOrigin.protocol.replace(":", "") as "http" | "https",
            hostname: apiOrigin.hostname,
            port: apiOrigin.port,
          },
        ]
      : [],
    // Next 16's SSRF guard refuses to optimize images whose hostname
    // resolves to a private/loopback IP — which "localhost" always does in
    // local dev, since the API URL points at the backend on the
    // same machine. Safe here because remotePatterns above already scopes
    // optimization to that one, explicitly configured backend origin.
    dangerouslyAllowLocalIP: true,
  },
};

export default nextConfig;
