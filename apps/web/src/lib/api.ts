const API_BASE_URL = import.meta.env.VITE_API_BASE_URL as string;

function getAuthToken(): string | null {
  return localStorage.getItem("auth.token") ?? sessionStorage.getItem("auth.token");
}

export async function apiRequest<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = getAuthToken();

  const headers = new Headers(options.headers);

  // Only set JSON header if caller didn't set it (prevents breaking FormData later)
  if (!headers.has("Content-Type") && !(options.body instanceof FormData)) {
    headers.set("Content-Type", "application/json");
  }

  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  const res = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers,
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`Request failed (${res.status})${text ? `: ${text}` : ""}`);
  }

  // If no content
  if (res.status === 204) return undefined as T;

  return (await res.json()) as T;
}