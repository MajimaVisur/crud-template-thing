// Client-side auth helper: stores token in localStorage and wraps fetch
export type User = {
  id: number;
  username: string;
  email: string;
  is_admin: boolean;
};

const TOKEN_KEY = "token";

export function getToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(TOKEN_KEY);
}

export function setToken(token: string) {
  if (typeof window === "undefined") return;
  localStorage.setItem(TOKEN_KEY, token);
}

export function clearToken() {
  if (typeof window === "undefined") return;
  localStorage.removeItem(TOKEN_KEY);
}

export async function apiFetch(path: string, opts: RequestInit = {}) {
  const headers = new Headers(opts.headers as HeadersInit);
  const token = getToken();
  if (token) headers.set("Authorization", `Bearer ${token}`);
  if (!headers.get("Content-Type"))
    headers.set("Content-Type", "application/json");

  const res = await fetch(path, { ...opts, headers });
  const text = await res.text().catch(() => "");
  let data: any = null;
  try {
    data = text ? JSON.parse(text) : null;
  } catch (e) {
    data = text;
  }
  return { ok: res.ok, status: res.status, data };
}

export async function register(
  username: string,
  email: string,
  password: string,
) {
  return apiFetch("/api/auth/register", {
    method: "POST",
    body: JSON.stringify({ username, email, password }),
  });
}

export async function login(emailOrUsername: string, password: string) {
  return apiFetch("/api/auth/login", {
    method: "POST",
    body: JSON.stringify({ emailOrUsername, password }),
  });
}

export async function me() {
  return apiFetch("/api/auth/me", { method: "GET" });
}

export function logout() {
  clearToken();
}

export default {
  getToken,
  setToken,
  clearToken,
  apiFetch,
  register,
  login,
  me,
  logout,
};
