import { jsonResponse } from "../lib/http";
import { getUserFromRequest } from "../lib/jwt";
import { setUserBlocked } from "../lib/users";
import db from "../lib/db";

export async function adminHandler(req: Request): Promise<Response> {
  try {
    const url = new URL(req.url);

    // POST /api/admin/users/:id/block
    const blockMatch = url.pathname.match(/^\/api\/admin\/users\/(\d+)\/block$/);
    if (blockMatch && req.method === "POST") {
      const current = await getUserFromRequest(req);
      if (!current || !current.is_admin) return jsonResponse({ error: "Forbidden" }, 403);
      const targetId = Number(blockMatch[1]);
      await setUserBlocked(targetId, true);
      return jsonResponse({ success: true });
    }

    // POST /api/admin/posts/:id/block
    const blockPostMatch = url.pathname.match(/^\/api\/admin\/posts\/(\d+)\/block$/);
    if (blockPostMatch && req.method === "POST") {
      const current = await getUserFromRequest(req);
      if (!current || !current.is_admin) return jsonResponse({ error: "Forbidden" }, 403);
      const targetId = Number(blockPostMatch[1]);
      await db`UPDATE posts SET is_blocked=1, updated_at=CURRENT_TIMESTAMP WHERE id=${targetId}`;
      return jsonResponse({ success: true });
    }

    // POST /api/admin/categories
    if (url.pathname === "/api/admin/categories" && req.method === "POST") {
      const current = await getUserFromRequest(req);
      if (!current || !current.is_admin) return jsonResponse({ error: "Forbidden" }, 403);
      const body = (await req.json()) as Record<string, any>;
      const { name, description } = body ?? {};
      if (!name) return jsonResponse({ error: "Missing name" }, 400);
      await db`INSERT INTO categories (name, description) VALUES (${name}, ${description})`;
      return jsonResponse({ success: true });
    }

    return jsonResponse({ error: "Not found" }, 404);
  } catch (err) {
    console.error("Admin handler error", err);
    return jsonResponse({ error: "Server error" }, 500);
  }
}

export default adminHandler;
