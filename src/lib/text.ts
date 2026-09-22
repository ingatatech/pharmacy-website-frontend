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
