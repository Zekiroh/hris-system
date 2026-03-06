const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

export async function apiClient(endpoint: string, options: RequestInit = {}) {
  const token = localStorage.getItem("auth.token") ?? sessionStorage.getItem("auth.token");

  const headers = new Headers(options.headers);
  if (!headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }

  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  const res = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  if (res.status === 401) {
    console.warn("Unauthorized request");
  }

  return res;
}