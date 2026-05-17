export type Role = "ADMIN" | "USER" | "OWNER";

export interface User {
  id: string;
  name: string;
  email: string;
  address: string;
  role: Role;
}

const TOKEN_KEY = "auth_token";

export function getToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

export function setToken(token: string | null) {
  if (token) localStorage.setItem(TOKEN_KEY, token);
  else localStorage.removeItem(TOKEN_KEY);
}

export class ApiError extends Error {
  status: number;
  details: unknown;
  constructor(status: number, message: string, details?: unknown) {
    super(message);
    this.status = status;
    this.details = details;
  }
}

export async function api<T = unknown>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string> | undefined),
  };
  const token = getToken();
  if (token) headers.Authorization = `Bearer ${token}`;

  const res = await fetch(`/api${path}`, { ...options, headers });
  const text = await res.text();
  const body = text ? JSON.parse(text) : null;

  if (!res.ok) {
    const fieldErrors = (body?.error?.fieldErrors ?? {}) as Record<string, string[]>;
    const firstFieldError = Object.values(fieldErrors)[0]?.[0];
    const message =
      typeof body?.error === "string"
        ? body.error
        : body?.error?.formErrors?.[0] ||
          firstFieldError ||
          `Request failed (${res.status})`;
    throw new ApiError(res.status, message, body?.error);
  }
  return body as T;
}
