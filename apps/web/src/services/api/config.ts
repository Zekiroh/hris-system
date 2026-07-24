function getApiBaseUrl(value: unknown): string {
  if (typeof value !== "string" || !value.trim()) {
    throw new Error("VITE_API_BASE_URL is required.");
  }

  const trimmed = value.trim().replace(/\/+$/, "");

  let parsedUrl: URL;

  try {
    parsedUrl = new URL(trimmed);
  } catch {
    throw new Error("VITE_API_BASE_URL must be a valid absolute URL.");
  }

  const usesHttp = parsedUrl.protocol === "http:";
  const usesHttps = parsedUrl.protocol === "https:";

  if (!usesHttp && !usesHttps) {
    throw new Error("VITE_API_BASE_URL must use HTTP or HTTPS.");
  }

  if (!import.meta.env.DEV && !usesHttps) {
    throw new Error("VITE_API_BASE_URL must use HTTPS in production.");
  }

  if (parsedUrl.username || parsedUrl.password) {
    throw new Error("VITE_API_BASE_URL must not include credentials.");
  }

  if (parsedUrl.search || parsedUrl.hash) {
    throw new Error(
      "VITE_API_BASE_URL must not include query parameters or a URL fragment."
    );
  }

  return trimmed;
}

export const API_BASE_URL = getApiBaseUrl(
  import.meta.env.VITE_API_BASE_URL
);