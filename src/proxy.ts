import { NextResponse, type NextRequest } from "next/server";
import { homeForRole, roleCanAccessPath } from "@/lib/admin-access";

// Next 16 renamed `middleware.ts` to `proxy.ts` — same behaviour, and only one
// such file is allowed per project, so all of the logic lives here.
//
// Why this exists: the client-side `return null` guard in the area layouts is
// not sufficient on its own. The Next docs are explicit that a layout "does not
// control whether the rest of the route renders", so those routes were
// prerendered and served to anyone who asked, with the redirect only happening
// after hydration. This runs before the route resolves.
//
// TRUST MODEL — read before treating this as a security boundary. It is not
// one. The cookie below is written by the client and is deliberately *not*
// verified here: this file has no access to JWT_SECRET, and the Next docs call
// this pattern an "optimistic check" that "should not be your only line of
// defence". It holds no secret (just the id and role), and forging it gets an
// attacker past this redirect and nowhere else — apiFetch still sends the real
// token from localStorage, and the backend still 403s every request. The real
// fix is for the backend to issue an httpOnly session cookie.
const SESSION_COOKIE = "ingata_session";

function readRole(request: NextRequest): string | null {
  const raw = request.cookies.get(SESSION_COOKIE)?.value;
  if (!raw) return null;

  try {
    const parsed = JSON.parse(raw) as { role?: unknown };
    return typeof parsed.role === "string" ? parsed.role : null;
  } catch {
    // Malformed cookie (or a hand-edited one) — treat as signed out.
    return null;
  }
}

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const role = readRole(request);

  if (!role) {
    const login = new URL("/login", request.url);
    login.searchParams.set("next", pathname);
    return NextResponse.redirect(login);
  }

  // The two staff areas are disjoint, so this one check covers both: a
  // pharmacist cannot reach /admin at all, and an admin cannot reach
  // /pharmacist. roleCanAccessPath compares the path against the role's own
  // home, so it also keeps a role out of the *other* role's area.
  if (!roleCanAccessPath(role, pathname)) {
    const home = homeForRole(role);
    // A customer (or an unrecognised role) has no staff area at all, so send
    // them to the public site rather than to a staff dashboard.
    return NextResponse.redirect(new URL(home ?? "/", request.url));
  }

  return NextResponse.next();
}

export const config = {
  // Only the two staff areas — deliberately narrow, so the public site and
  // /api/translate don't pay for this on every request.
  //
  // These must be written out as literal strings. Next parses `config.matcher`
  // statically at build time, so it rejects references to ADMIN_HOME /
  // PHARMACIST_HOME and template interpolation with "Entry matcher[N] need to
  // be static strings or static objects" — even though the values are
  // identical. Keep in sync with the area constants in @/lib/admin-access.
  matcher: ["/admin", "/admin/:path*", "/pharmacist", "/pharmacist/:path*"],
};
