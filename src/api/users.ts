import { jsonResponse } from "../lib/http";
import { getUserFromRequest } from "../lib/jwt";
import * as favorites from "../lib/favorites";
import * as posts from "../lib/posts";

export async function usersHandler(req: Request): Promise<Response> {
  try {
    const url = new URL(req.url);

    if (url.pathname === "/api/users/me" && req.method === "GET") {
      const user = await getUserFromRequest(req);
      if (!user) return jsonResponse({ error: "Missing or invalid token" }, 401);
      return jsonResponse({ user: { id: user.id, username: user.username, email: user.email, is_admin: !!user.is_admin } });
    }

    if (url.pathname === "/api/users/favorites" && req.method === "GET") {
      const user = await getUserFromRequest(req);
      if (!user) return jsonResponse({ error: "Missing or invalid token" }, 401);
      const favs = await favorites.getFavoritesByUser(user.id);
      return jsonResponse({ favorites: favs });
    }

    if (url.pathname === "/api/users/posts" && req.method === "GET") {
      const user = await getUserFromRequest(req);
      if (!user) return jsonResponse({ error: "Missing or invalid token" }, 401);
      const rows = await posts.getPostsByUser(user.id);
      return jsonResponse({ posts: rows });
    }

    return jsonResponse({ error: "Not found" }, 404);
  } catch (err) {
    console.error("Users handler error", err);
    return jsonResponse({ error: "Server error" }, 500);
  }
}

export default usersHandler;
