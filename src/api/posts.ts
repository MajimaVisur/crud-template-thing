import { jsonResponse } from "../lib/http";
import { getUserFromRequest } from "../lib/jwt";
import * as posts from "../lib/posts";
import * as comments from "../lib/comments";
import * as favorites from "../lib/favorites";
import { getPostById as getPost } from "../lib/posts";

export async function postsHandler(req: Request): Promise<Response> {
  try {
    const url = new URL(req.url);

    // GET /api/posts?page=&limit=&category=&q=
    if (url.pathname === "/api/posts" && req.method === "GET") {
      const page = Number(url.searchParams.get("page") || "1");
      const limit = Number(url.searchParams.get("limit") || "20");
      const category = url.searchParams.get("category") ? Number(url.searchParams.get("category")) : undefined;
      const q = url.searchParams.get("q") ?? undefined;
      const rows = await posts.listPosts({ category, q, page, limit });
      return jsonResponse({ posts: rows });
    }

    // GET /api/posts/:id
    const postMatch = url.pathname.match(/^\/api\/posts\/(\d+)$/);
    if (postMatch && req.method === "GET") {
      const id = Number(postMatch[1]);
      const post = await posts.getPostById(id);
      if (!post) return jsonResponse({ error: "Not found" }, 404);

      // include comments and favorite state for authenticated user
      const postComments = await comments.getCommentsByPostId(id);
      const current = await getUserFromRequest(req);
      let favorited = false;
      if (current) {
        favorited = await favorites.isFavorite(current.id, id);
      }

      return jsonResponse({ post: { ...post, comments: postComments, favorited } });
    }

    // POST /api/posts
    if (url.pathname === "/api/posts" && req.method === "POST") {
      const current = await getUserFromRequest(req);
      if (!current) return jsonResponse({ error: "Unauthorized" }, 401);
      const body = (await req.json()) as Record<string, any>;
      const { title, category_id, description, price, image_url } = body ?? {};
      if (!title) return jsonResponse({ error: "Missing title" }, 400);
      const created = await posts.createPost(current.id, category_id ?? null, title, description ?? null, price ?? null, image_url ?? null);
      return jsonResponse({ post: created });
    }

    // PUT /api/posts/:id
    if (postMatch && req.method === "PUT") {
      const id = Number(postMatch[1]);
      const current = await getUserFromRequest(req);
      if (!current) return jsonResponse({ error: "Unauthorized" }, 401);
      const post = await getPost(id);
      if (!post) return jsonResponse({ error: "Not found" }, 404);
      if (post.user_id !== current.id && !current.is_admin) return jsonResponse({ error: "Forbidden" }, 403);
      const body = (await req.json()) as Record<string, any>;
      const updated = await posts.updatePost(id, body);
      return jsonResponse({ post: updated });
    }

    // DELETE /api/posts/:id
    if (postMatch && req.method === "DELETE") {
      const id = Number(postMatch[1]);
      const current = await getUserFromRequest(req);
      if (!current) return jsonResponse({ error: "Unauthorized" }, 401);
      const post = await getPost(id);
      if (!post) return jsonResponse({ error: "Not found" }, 404);
      if (post.user_id !== current.id && !current.is_admin) return jsonResponse({ error: "Forbidden" }, 403);
      await posts.deletePost(id);
      return jsonResponse({ success: true });
    }

    // POST /api/posts/:id/favorite
    const favMatch = url.pathname.match(/^\/api\/posts\/(\d+)\/favorite$/);
    if (favMatch && req.method === "POST") {
      const id = Number(favMatch[1]);
      const current = await getUserFromRequest(req);
      if (!current) return jsonResponse({ error: "Unauthorized" }, 401);
      await favorites.addFavorite(current.id, id);
      return jsonResponse({ success: true });
    }

    // DELETE /api/posts/:id/favorite
    if (favMatch && req.method === "DELETE") {
      const id = Number(favMatch[1]);
      const current = await getUserFromRequest(req);
      if (!current) return jsonResponse({ error: "Unauthorized" }, 401);
      await favorites.removeFavorite(current.id, id);
      return jsonResponse({ success: true });
    }

    // POST /api/posts/:id/comments
    const commentMatch = url.pathname.match(/^\/api\/posts\/(\d+)\/comments$/);
    if (commentMatch && req.method === "POST") {
      const postId = Number(commentMatch[1]);
      const current = await getUserFromRequest(req);
      const body = (await req.json()) as Record<string, any>;
      const { content } = body ?? {};
      if (!content) return jsonResponse({ error: "Missing content" }, 400);
      const userId = current?.id ?? null;
      const comment = await comments.createComment(postId, userId, content);
      return jsonResponse({ comment });
    }

    // GET /api/posts/:id/comments
    if (commentMatch && req.method === "GET") {
      const postId = Number(commentMatch[1]);
      const list = await comments.getCommentsByPostId(postId);
      return jsonResponse({ comments: list });
    }

    // DELETE /api/comments/:id
    const delCommentMatch = url.pathname.match(/^\/api\/comments\/(\d+)$/);
    if (delCommentMatch && req.method === "DELETE") {
      const commentId = Number(delCommentMatch[1]);
      const current = await getUserFromRequest(req);
      if (!current) return jsonResponse({ error: "Unauthorized" }, 401);
      const comment = await comments.getCommentById(commentId);
      if (!comment) return jsonResponse({ error: "Not found" }, 404);
      const post = await posts.getPostById(comment.post_id);
      // allow comment author, post owner, or admin
      if ((comment.user_id && comment.user_id === current.id) || (post && post.user_id === current.id) || current.is_admin) {
        await comments.removeComment(commentId);
        return jsonResponse({ success: true });
      }
      return jsonResponse({ error: "Forbidden" }, 403);
    }

    return jsonResponse({ error: "Not found" }, 404);
  } catch (err) {
    console.error("Posts handler error", err);
    return jsonResponse({ error: "Server error" }, 500);
  }
}

export default postsHandler;
