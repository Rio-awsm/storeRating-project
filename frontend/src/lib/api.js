const TOKEN_KEY = "auth_token";

export function getToken() {
  return localStorage.getItem(TOKEN_KEY);
}

export function setToken(token) {
  if (token) localStorage.setItem(TOKEN_KEY, token);
  else localStorage.removeItem(TOKEN_KEY);
}

export class ApiError extends Error {
  constructor(status, message, details) {
    super(message);
    this.status = status;
    this.details = details;
  }
}

export async function api(path, options = {}) {
  const headers = {
    "Content-Type": "application/json",
    ...options.headers,
  };
  const token = getToken();
  if (token) headers.Authorization = `Bearer ${token}`;

  const res = await fetch(`/api${path}`, { ...options, headers });
  const text = await res.text();
  const body = text ? JSON.parse(text) : null;

  if (!res.ok) {
    const fieldErrors = body?.error?.fieldErrors ?? {};
    const firstFieldError = Object.values(fieldErrors)[0]?.[0];
    const message =
      typeof body?.error === "string"
        ? body.error
        : body?.error?.formErrors?.[0] ||
          firstFieldError ||
          `Request failed (${res.status})`;
    throw new ApiError(res.status, message, body?.error);
  }
  return body;
}
