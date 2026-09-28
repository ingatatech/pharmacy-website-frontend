// Each staff role has its own area of the site, and the two places that enforce
// that — src/proxy.ts (server, before the route resolves) and the two area
// layouts (client, after login) — both resolve it through this module so they
// cannot drift.
//
// This replaced an earlier version that let a pharmacist_reviewer into two
// paths of the admin area. The roles are now disjoint: an admin has /admin, a
// pharmacist has /pharmacist, and neither can reach the other's.
export const ADMIN_HOME = "/admin";
export const PHARMACIST_HOME = "/pharmacist";

export type StaffRole = "admin" | "pharmacist_reviewer";

export function isStaffRole(role: string | null | undefined): role is StaffRole {
  return role === "admin" || role === "pharmacist_reviewer";
}

/**
 * The area a role belongs to, or null for a customer / unknown role.
 * Used to send someone to their own home rather than bouncing them.
 */
export function homeForRole(role: string | null | undefined): string | null {
  if (role === "admin") return ADMIN_HOME;
  if (role === "pharmacist_reviewer") return PHARMACIST_HOME;
  return null;
}

/**
 * True when `role` is allowed to view `pathname`.
 *
 * Prefix matching is segment-aware on purpose: "/pharmacist-refills" must not
 * count as being inside "/pharmacist". An earlier version treated "/admin" as a
 * prefix, which made `startsWith("/admin/")` match every admin subpath and
 * quietly let a pharmacist into /admin/products — the reason the exact path and
 * the prefix are kept separate below.
 */
export function roleCanAccessPath(role: string | null | undefined, pathname: string | null | undefined): boolean {
  if (!isStaffRole(role) || !pathname) return false;

  const home = homeForRole(role)!;

  return pathname === home || pathname === `${home}/` || pathname.startsWith(`${home}/`);
}

/** Where someone who isn't allowed on `pathname` should be sent instead. */
export function homeForRolePath(pathname: string | null | undefined): string {
  return pathname?.startsWith(PHARMACIST_HOME) ? PHARMACIST_HOME : ADMIN_HOME;
}
