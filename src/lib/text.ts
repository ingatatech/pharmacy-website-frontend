/** Strips any HTML tags and collapses whitespace, for previewing rich-text content as plain text. */
export function stripHtml(html: string): string {
  return html
    .replace(/<[^>]*>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export function excerpt(content: string, maxLength = 160): string {
  const text = stripHtml(content);
  if (text.length <= maxLength) return text;
  return `${text.slice(0, maxLength).replace(/\s+\S*$/, "")}…`;
}

const WORDS_PER_MINUTE = 200;

export function estimateReadMinutes(content: string): number {
  const words = stripHtml(content).split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.round(words / WORDS_PER_MINUTE));
}

export function initials(fullName: string): string {
  const parts = fullName.trim().split(/\s+/);
  const first = parts[0]?.[0] || "";
  const last = parts.length > 1 ? parts[parts.length - 1][0] : "";
  return (first + last).toUpperCase();
}

const ROLE_LABELS: Record<string, string> = {
  admin: "Pharmacy Team",
  pharmacist_reviewer: "Licensed Pharmacist",
  customer: "Contributor",
};

export function roleLabel(role: string): string {
  return ROLE_LABELS[role] || role;
}

const RELATIVE_UNITS: [Intl.RelativeTimeFormatUnit, number][] = [
  ["year", 31536000],
  ["month", 2592000],
  ["day", 86400],
  ["hour", 3600],
  ["minute", 60],
];

const relativeFormatter = new Intl.RelativeTimeFormat("en", { numeric: "auto" });

/** Formats an ISO timestamp as "3 hours ago" style relative text, for admin activity feeds. */
export function timeAgo(iso: string): string {
  const seconds = (Date.now() - new Date(iso).getTime()) / 1000;
  if (seconds < 60) return "just now";

  for (const [unit, secondsInUnit] of RELATIVE_UNITS) {
    if (seconds >= secondsInUnit) {
      return relativeFormatter.format(-Math.floor(seconds / secondsInUnit), unit);
    }
  }
  return relativeFormatter.format(-Math.floor(seconds / 60), "minute");
}

/** Derives a URL-safe slug from a name/title, e.g. for admin form auto-fill. */
export function slugify(text: string): string {
  return text
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}
