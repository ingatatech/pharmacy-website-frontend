// Renders structured data as a <script type="application/ld+json"> tag.
// Escapes "<" so a value containing a literal "</script>" can't break out
// of the tag — standard hardening for JSON embedded in HTML, even though
// our structured data always comes from our own admin-curated content.
export function jsonLd(data: object) {
  return JSON.stringify(data).replace(/</g, "\\u003c");
}
