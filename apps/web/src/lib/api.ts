const API_BASE_URL = import.meta.env.VITE_API_BASE_URL as string;

function getAuthToken(): string | null {
  const directLocalToken = localStorage.getItem("auth.token");
  if (directLocalToken) return directLocalToken;

  const directSessionToken = sessionStorage.getItem("auth.token");
  if (directSessionToken) return directSessionToken;

  const localAuthRaw = localStorage.getItem("auth");
  if (localAuthRaw) {
    try {
      const parsed = JSON.parse(localAuthRaw) as { token?: string };
      if (parsed?.token) return parsed.token;
    } catch {
      // ignore malformed local auth payload
    }
  }

  const sessionAuthRaw = sessionStorage.getItem("auth");
  if (sessionAuthRaw) {
    try {
      const parsed = JSON.parse(sessionAuthRaw) as { token?: string };
      if (parsed?.token) return parsed.token;
    } catch {
      // ignore malformed session auth payload
    }
  }

  return null;
}

export async function apiRequest<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = getAuthToken();

  const headers = new Headers(options.headers);

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

  if (res.status === 204) return undefined as T;

  return (await res.json()) as T;
}