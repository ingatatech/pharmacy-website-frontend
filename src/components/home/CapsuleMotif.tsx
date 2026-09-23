// A single restrained, tone-on-tone visual move: an oversized capsule
// silhouette, not a contrasting decorative graphic. "teal" (the default)
// is a subtle brand-teal tint for the light-background usages (PageHeader,
// ServicesSection); "white" is a soft translucent white highlight for use
// over the dark hero gradient, where a teal-on-teal shape reads as nearly
// invisible flat color rather than a shape with any depth.
export function CapsuleMotif({
  className,
  tone = "teal",
}: {
  className?: string;
  tone?: "teal" | "white";
}) {
  const colors =
    tone === "white"
      ? { outer: "rgba(255,255,255,0.14)", inner: "rgba(255,255,255,0.26)" }
      : { outer: "#115E59", inner: "#0F766E" };

  return (
    <svg
      viewBox="0 0 520 520"
      fill="none"
      aria-hidden="true"
      className={className}
    >
      <rect
        x="60"
        y="180"
        width="460"
        height="200"
        rx="100"
        transform="rotate(-18 290 280)"
        fill={colors.outer}
      />
      <path
        d="M143 231 A100 100 0 0 1 289 145 L365 271 A100 100 0 0 1 219 357 Z"
        transform="rotate(-18 290 280)"
        fill={colors.inner}
      />
      <line
        x1="205"
        y1="180"
        x2="275"
        y2="298"
        stroke="#34D399"
        strokeWidth="3"
        transform="rotate(-18 290 280)"
      />
    </svg>
  );
}
