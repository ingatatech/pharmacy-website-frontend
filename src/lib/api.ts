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

/**
 * Like apiFetch, but also reads the X-Total-Count header the paginated
 * admin list endpoints (refill requests, contact inquiries, audit log) set
 * — apiFetch alone only returns the parsed body, discarding headers.
 */
export async function apiFetchPaginated<T = unknown>(
  path: string,
  options: RequestInit = {},
  token?: string
): Promise<{ data: T; total: number }> {
  if (!API_URL) {
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

  const total = Number(response.headers.get("X-Total-Count") || 0);
  const data = (await response.json()) as T;
  return { data, total };
}

/**
 * Uploads a single image file to POST /api/uploads and returns its URL.
 * Kept separate from apiFetch because a multipart/form-data body must NOT
 * have an explicit Content-Type set — the browser fills in the boundary —
 * whereas apiFetch always defaults to application/json.
 */
export async function uploadImage(file: File, token: string): Promise<{ url: string }> {
  if (!API_URL) {
    throw new ApiError(0, "NEXT_PUBLIC_API_URL is not set — cannot upload");
  }

  const formData = new FormData();
  formData.append("image", file);

  const response = await fetch(`${API_URL}/api/uploads`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
    body: formData,
  });

  if (!response.ok) {
    const body = await response.json().catch(() => null);
    throw new ApiError(response.status, body?.error || `Upload failed with status ${response.status}`);
  }

  return response.json() as Promise<{ url: string }>;
}

/** Resolves a possibly-relative upload path (e.g. "/uploads/x.jpg") returned by the API into an absolute URL for <img>/<Image>. Already-absolute URLs pass through unchanged. */
export function resolveUploadUrl(url: string): string {
  return /^https?:\/\//.test(url) ? url : `${API_URL || ""}${url}`;
}
