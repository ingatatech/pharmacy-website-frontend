const API_URL = process.env.NEXT_PUBLIC_API_URL;

export class ApiError extends Error {
  status: number;

  constructor(status: number, message: string) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

/**
 * The single way the rest of the app calls the backend API. Prepends
 * NEXT_PUBLIC_API_URL, defaults Content-Type to application/json, attaches
 * a Bearer token when one is passed, and throws an ApiError with the
 * backend's error message on a non-ok response.
 */
export async function apiFetch<T = unknown>(
  path: string,
  options: RequestInit = {},
  token?: string
): Promise<T> {
  if (!API_URL) {
    // A malformed URL (e.g. "undefined/api/...") doesn't fail fast here —
    // Next's patched fetch hangs on it until its 60s page-generation
    // timeout, tripping 3 retries and failing the whole build. Guard
    // against that explicitly instead of ever calling fetch with one.
    throw new ApiError(0, `NEXT_PUBLIC_API_URL is not set — cannot fetch ${path}`);
  }

  const headers = new Headers(options.headers);
  if (!headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }
  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  const response = await fetch(`${API_URL}${path}`, { ...options, headers });

  if (!response.ok) {
    const body = await response.json().catch(() => null);
    const message = body?.error || `Request to ${path} failed with status ${response.status}`;
    throw new ApiError(response.status, message);
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return response.json() as Promise<T>;
}
