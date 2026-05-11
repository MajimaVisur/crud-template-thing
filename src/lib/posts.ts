import db from "./db";

export type PostRecord = {
  id: number;
  user_id: number;
  category_id: number | null;
  title: string;
  description: string | null;
  price: number | null;
  image_url: string | null;
  is_blocked: number;
  is_active: number;
  created_at: string;
  updated_at: string;
  username?: string;
  category_name?: string;
};

export async function createPost(
  userId: number,
  categoryId: number | null,
  title: string,
  description: string | null,
  price: number | null,
  image_url: string | null,
) {
  await db`INSERT INTO posts (user_id, category_id, title, description, price, image_url) VALUES (${userId}, ${categoryId}, ${title}, ${description}, ${price}, ${image_url})`;
  const rows =
    (await db`SELECT id, user_id, category_id, title, description, price, image_url, is_blocked, is_active, created_at, updated_at FROM posts WHERE user_id=${userId} ORDER BY created_at DESC LIMIT 1`) as any[];
  return rows?.[0] ?? null;
}

export async function getPostById(id: number): Promise<PostRecord | null> {
  const rows =
    (await db`SELECT p.id, p.user_id, p.category_id, p.title, p.description, p.price, p.image_url, p.is_blocked, p.is_active, p.created_at, p.updated_at, u.username, c.name AS category_name FROM posts p LEFT JOIN users u ON u.id = p.user_id LEFT JOIN categories c ON c.id = p.category_id WHERE p.id=${id} LIMIT 1`) as any[];
  return rows?.[0] ?? null;
}

export async function updatePost(
  id: number,
  updates: Partial<Record<string, any>>,
): Promise<PostRecord | null> {
  const fields: string[] = [];
  const values: any[] = [];
  if (updates.title !== undefined) {
    fields.push("title = ?");
    values.push(updates.title);
  }
  if (updates.description !== undefined) {
    fields.push("description = ?");
    values.push(updates.description);
  }
  if (updates.price !== undefined) {
    fields.push("price = ?");
    values.push(updates.price);
  }
  if (updates.image_url !== undefined) {
    fields.push("image_url = ?");
    values.push(updates.image_url);
  }
  if (updates.category_id !== undefined) {
    fields.push("category_id = ?");
    values.push(updates.category_id);
  }
  if (fields.length === 0) return getPostById(id);
  const title = updates.title ?? (await getPostById(id))?.title ?? null;
  const description =
    updates.description ?? (await getPostById(id))?.description ?? null;
  const price = updates.price ?? (await getPostById(id))?.price ?? null;
  const image_url =
    updates.image_url ?? (await getPostById(id))?.image_url ?? null;
  const category_id =
    updates.category_id ?? (await getPostById(id))?.category_id ?? null;
  await db`UPDATE posts SET title=${title}, description=${description}, price=${price}, image_url=${image_url}, category_id=${category_id}, updated_at=CURRENT_TIMESTAMP WHERE id=${id}`;
  return getPostById(id);
}

export async function deletePost(id: number): Promise<boolean> {
  await db`DELETE FROM posts WHERE id=${id}`;
  return true;
}

export async function listPosts(options?: {
  category?: number;
  q?: string;
  page?: number;
  limit?: number;
}) {
  const page = options?.page && options.page > 0 ? options.page : 1;
  const limit = options?.limit && options.limit > 0 ? options.limit : 20;
  const offset = (page - 1) * limit;

  if (options?.category && options?.q) {
    const q = `%${options.q}%`;
    const rows =
      (await db`SELECT p.id, p.user_id, p.category_id, p.title, p.description, p.price, p.image_url, p.is_blocked, p.is_active, p.created_at, p.updated_at, u.username, c.name AS category_name FROM posts p LEFT JOIN users u ON u.id = p.user_id LEFT JOIN categories c ON c.id = p.category_id WHERE p.category_id=${options.category} AND (p.title LIKE ${q} OR p.description LIKE ${q}) AND p.is_active=1 AND p.is_blocked=0 ORDER BY p.created_at DESC LIMIT ${limit} OFFSET ${offset}`) as any[];
    return rows ?? [];
  }
  if (options?.category) {
    const rows =
      (await db`SELECT p.id, p.user_id, p.category_id, p.title, p.description, p.price, p.image_url, p.is_blocked, p.is_active, p.created_at, p.updated_at, u.username, c.name AS category_name FROM posts p LEFT JOIN users u ON u.id = p.user_id LEFT JOIN categories c ON c.id = p.category_id WHERE p.category_id=${options.category} AND p.is_active=1 AND p.is_blocked=0 ORDER BY p.created_at DESC LIMIT ${limit} OFFSET ${offset}`) as any[];
    return rows ?? [];
  }

  if (options?.q) {
    const q = `%${options.q}%`;
    const rows =
      (await db`SELECT p.id, p.user_id, p.category_id, p.title, p.description, p.price, p.image_url, p.is_blocked, p.is_active, p.created_at, p.updated_at, u.username, c.name AS category_name FROM posts p LEFT JOIN users u ON u.id = p.user_id LEFT JOIN categories c ON c.id = p.category_id WHERE (p.title LIKE ${q} OR p.description LIKE ${q}) AND p.is_active=1 AND p.is_blocked=0 ORDER BY p.created_at DESC LIMIT ${limit} OFFSET ${offset}`) as any[];
    return rows ?? [];
  }

  const rows =
    (await db`SELECT p.id, p.user_id, p.category_id, p.title, p.description, p.price, p.image_url, p.is_blocked, p.is_active, p.created_at, p.updated_at, u.username, c.name AS category_name FROM posts p LEFT JOIN users u ON u.id = p.user_id LEFT JOIN categories c ON c.id = p.category_id WHERE p.is_active=1 AND p.is_blocked=0 ORDER BY p.created_at DESC LIMIT ${limit} OFFSET ${offset}`) as any[];
  return rows ?? [];
}

export async function getPostsByUser(userId: number) {
  const rows =
    (await db`SELECT p.id, p.user_id, p.category_id, p.title, p.description, p.price, p.image_url, p.is_blocked, p.is_active, p.created_at, p.updated_at, u.username, c.name AS category_name FROM posts p LEFT JOIN users u ON u.id = p.user_id LEFT JOIN categories c ON c.id = p.category_id WHERE p.user_id=${userId} ORDER BY p.created_at DESC`) as any[];
  return rows ?? [];
}

export async function setPostBlocked(
  id: number,
  blocked: boolean,
): Promise<boolean> {
  await db`UPDATE posts SET is_blocked=${blocked ? 1 : 0}, updated_at=CURRENT_TIMESTAMP WHERE id=${id}`;
  return true;
}

export default {
  createPost,
  getPostById,
  updatePost,
  deletePost,
  listPosts,
  setPostBlocked,
};
