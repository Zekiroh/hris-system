function getApiBaseUrl(value: unknown): string {
  if (typeof value !== "string" || !value.trim()) {
    throw new Error("VITE_API_BASE_URL is required.");
  }

  const trimmed = value.trim().replace(/\/+$/, "");

  try {
    new URL(trimmed);
  } catch {
    throw new Error("VITE_API_BASE_URL must be a valid absolute URL.");
  }

  return trimmed;
}

export const API_BASE_URL = getApiBaseUrl(import.meta.env.VITE_API_BASE_URL);
