const REFILL_STATUS_STYLES: Record<string, string> = {
  submitted: "bg-slate-100 text-slate-700",
  under_review: "bg-amber-100 text-amber-800",
  approved: "bg-teal-100 text-teal-800",
  completed: "bg-emerald-100 text-emerald-800",
  rejected: "bg-red-100 text-red-700",
};

const CONTACT_STATUS_STYLES: Record<string, string> = {
  new: "bg-slate-100 text-slate-700",
  in_progress: "bg-amber-100 text-amber-800",
  resolved: "bg-emerald-100 text-emerald-800",
};

const ARTICLE_STATUS_STYLES: Record<string, string> = {
  draft: "bg-slate-100 text-slate-700",
  pending_review: "bg-amber-100 text-amber-800",
  approved: "bg-teal-100 text-teal-800",
  published: "bg-emerald-100 text-emerald-800",
};

const AVAILABILITY_STATUS_STYLES: Record<string, string> = {
  in_stock: "bg-emerald-100 text-emerald-800",
  out_of_stock: "bg-red-100 text-red-700",
  unknown: "bg-slate-100 text-slate-700",
};

const PUBLISH_STATUS_STYLES: Record<string, string> = {
  true: "bg-emerald-100 text-emerald-800",
  false: "bg-slate-100 text-slate-700",
};

const INQUIRY_TYPE_STYLES: Record<string, string> = {
  general: "bg-slate-100 text-slate-700",
  health: "bg-rose-100 text-rose-700",
  product: "bg-teal-100 text-teal-800",
  service: "bg-amber-100 text-amber-800",
};

export const STATUS_STYLE_SETS = {
  refill: REFILL_STATUS_STYLES,
  contact: CONTACT_STATUS_STYLES,
  article: ARTICLE_STATUS_STYLES,
  availability: AVAILABILITY_STATUS_STYLES,
  published: PUBLISH_STATUS_STYLES,
  inquiryType: INQUIRY_TYPE_STYLES,
} as const;

export type StatusStyleSet = keyof typeof STATUS_STYLE_SETS;

const LABEL_OVERRIDES: Record<string, string> = {
  true: "Published",
  false: "Draft",
};

function formatStatus(status: string) {
  return LABEL_OVERRIDES[status] || status.replace(/_/g, " ").replace(/^./, (c) => c.toUpperCase());
}

// Shared status pill used across every admin list/detail screen — one
// place to keep the color language for "where something stands" (draft,
// pending, published, in stock, etc.) consistent.
export function StatusBadge({ status, set }: { status: string; set: StatusStyleSet }) {
  const styles = STATUS_STYLE_SETS[set];
  const className = styles[status as keyof typeof styles] || "bg-slate-100 text-slate-700";

  return (
    <span className={`inline-flex shrink-0 items-center rounded-full px-2.5 py-1 text-xs font-medium ${className}`}>
      {formatStatus(status)}
    </span>
  );
}
