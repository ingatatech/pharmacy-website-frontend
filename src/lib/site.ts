// The canonical public URL of this site — used for metadataBase, the
// sitemap, robots.txt and structured data. Falls back to localhost so
// local dev doesn't need this set, but production MUST set
// NEXT_PUBLIC_SITE_URL to the real domain once one exists.
export const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000").replace(/\/$/, "");
