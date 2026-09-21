// A single restrained, tone-on-tone visual move for the hero: an oversized
// capsule silhouette rendered in shades of the brand green, not a
// contrasting decorative graphic. Deliberately abstract rather than a stock
// photo or a literal icon-as-hero.
export function CapsuleMotif({ className }: { className?: string }) {
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
        fill="#115E59"
      />
      <path
        d="M143 231 A100 100 0 0 1 289 145 L365 271 A100 100 0 0 1 219 357 Z"
        transform="rotate(-18 290 280)"
        fill="#0F766E"
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
