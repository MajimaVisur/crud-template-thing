import db from "./db";

export type CommentRecord = {
  id: number;
  post_id: number;
  user_id?: number | null;
  content: string;
  is_removed: number;
  removed_at?: string | null;
  created_at: string;
};

export async function createComment(post_id: number, user_id: number | null, content: string) {
  await db`INSERT INTO comments (post_id, user_id, content) VALUES (${post_id}, ${user_id}, ${content})`;
  const rows = (await db`SELECT id, post_id, user_id, content, is_removed, removed_at, created_at FROM comments WHERE post_id=${post_id} ORDER BY created_at DESC LIMIT 1`) as any[];
  return rows?.[0] ?? null;
}

export async function getCommentsByPostId(post_id: number) {
  const rows = (await db`SELECT id, post_id, user_id, content, is_removed, removed_at, created_at FROM comments WHERE post_id=${post_id} AND is_removed=0 ORDER BY created_at ASC`) as any[];
  return rows ?? [];
}

export async function getCommentById(id: number) {
  const rows = (await db`SELECT id, post_id, user_id, content, is_removed, removed_at, created_at FROM comments WHERE id=${id} LIMIT 1`) as any[];
  return rows?.[0] ?? null;
}

export async function removeComment(id: number): Promise<boolean> {
  await db`UPDATE comments SET is_removed=1, removed_at=CURRENT_TIMESTAMP WHERE id=${id}`;
  return true;
}

export default { createComment, getCommentsByPostId, getCommentById, removeComment };
