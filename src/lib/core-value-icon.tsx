import { Accessibility, Award, HandHeart, Handshake, HeartHandshake, Scale, ShieldCheck, Sparkles, Trophy } from "lucide-react";

// Keyword match against whatever the admin has typed into SiteSetting's
// core-values list — same approach as ServiceCard's serviceIcon, since
// these are free-text values, not a fixed enum. Shared by the homepage
// About section and the standalone About page so both pick the same icon
// for the same value.
export function coreValueIcon(value: string) {
  const text = value.toLowerCase();
  if (text.includes("integrity")) return Scale;
  if (text.includes("professional")) return Award;
  if (text.includes("customer") || text.includes("care")) return HeartHandshake;
  if (text.includes("safe")) return ShieldCheck;
  if (text.includes("accessib")) return Accessibility;
  if (text.includes("responsib")) return HandHeart;
  if (text.includes("trust")) return Handshake;
  if (text.includes("excellen")) return Trophy;
  return Sparkles;
}
