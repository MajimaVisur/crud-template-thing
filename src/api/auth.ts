import db from "../lib/db";
import * as bcrypt from "bcryptjs";
import { signToken, verifyToken } from "../lib/jwt";
import { getUserById } from "../lib/users";
import { jsonResponse } from "../lib/http";

export async function authHandler(req: Request): Promise<Response> {
  try {
    const url = new URL(req.url);

    if (url.pathname === "/api/auth/register" && req.method === "POST") {
      const body = (await req.json()) as Record<string, any>;
      const { username, email, password } = body ?? {};
      if (!username || !email || !password) {
        return jsonResponse({ error: "Missing fields" }, 400);
      }

      const existing =
        (await db`SELECT id FROM users WHERE username=${username} OR email=${email}`) as any[];
      if (existing && existing.length > 0) {
        return jsonResponse({ error: "User already exists" }, 400);
      }

      const password_hash = await bcrypt.hash(password, 10);
      await db`INSERT INTO users (username, email, password_hash) VALUES (${username}, ${email}, ${password_hash})`;

      const rows =
        (await db`SELECT id, username, email, is_admin FROM users WHERE email=${email}`) as any[];
      const user = Array.isArray(rows) ? rows[0] : rows?.[0];
      if (!user) return jsonResponse({ error: "User creation failed" }, 500);

      const token = signToken({ id: user.id, username: user.username, is_admin: user.is_admin });

      return jsonResponse({
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
          is_admin: !!user.is_admin,
        },
        token,
      });
    }

    if (url.pathname === "/api/auth/login" && req.method === "POST") {
      const body = (await req.json()) as Record<string, any>;
      const { emailOrUsername, password } = body ?? {};
      if (!emailOrUsername || !password) {
        return jsonResponse({ error: "Missing fields" }, 400);
      }
      const rows =
        (await db`SELECT id, username, email, password_hash, is_admin, is_blocked FROM users WHERE email=${emailOrUsername} OR username=${emailOrUsername}`) as any[];
      const user = Array.isArray(rows) ? rows[0] : rows?.[0];
      if (!user) return jsonResponse({ error: "Invalid credentials" }, 401);
      if (user.is_blocked)
        return jsonResponse({ error: "User is blocked" }, 403);

      const ok = await bcrypt.compare(password, user.password_hash);
      if (!ok) return jsonResponse({ error: "Invalid credentials" }, 401);

      const token = signToken({ id: user.id, username: user.username, is_admin: user.is_admin });

      return jsonResponse({
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
          is_admin: !!user.is_admin,
        },
        token,
      });
    }

    if (url.pathname === "/api/auth/me" && req.method === "GET") {
      const auth = req.headers.get("authorization") || "";
      const match = auth.match(/^Bearer\s+(.+)$/);
      if (!match) return jsonResponse({ error: "Missing token" }, 401);
      const token = match[1] as string;
      try {
        const payload = verifyToken(token) as any;
        const user = await getUserById(payload?.id);
        if (!user) return jsonResponse({ error: "User not found" }, 401);
        return jsonResponse({
          user: {
            id: user.id,
            username: user.username,
            email: user.email,
            is_admin: !!user.is_admin,
          },
        });
      } catch (err) {
        return jsonResponse({ error: "Invalid token" }, 401);
      }
    }

    return jsonResponse({ error: "Not found" }, 404);
  } catch (err) {
    console.error("Auth handler error", err);
    return jsonResponse({ error: "Server error" }, 500);
  }
}

export default authHandler;
