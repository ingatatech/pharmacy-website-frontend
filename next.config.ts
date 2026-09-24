import type { NextConfig } from "next";

// Allows next/image to load Product/Service/Article images served by the
// backend (e.g. /uploads/<file>) from whatever host NEXT_PUBLIC_API_URL
// points at, in any environment.
const apiOrigin = process.env.NEXT_PUBLIC_API_URL ? new URL(process.env.NEXT_PUBLIC_API_URL) : undefined;

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
    // local dev, since NEXT_PUBLIC_API_URL points at the backend on the
    // same machine. Safe here because remotePatterns above already scopes
    // optimization to that one, explicitly configured backend origin.
    dangerouslyAllowLocalIP: true,
  },
};

export default nextConfig;
