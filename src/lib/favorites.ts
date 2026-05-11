import db from "./db";

export async function addFavorite(user_id: number, post_id: number) {
  const exists = (await db`SELECT id FROM favorites WHERE user_id=${user_id} AND post_id=${post_id}`) as any[];
  if (exists && exists.length > 0) return exists[0];
  await db`INSERT INTO favorites (user_id, post_id) VALUES (${user_id}, ${post_id})`;
  const rows = (await db`SELECT id, user_id, post_id, created_at FROM favorites WHERE user_id=${user_id} AND post_id=${post_id} LIMIT 1`) as any[];
  return rows?.[0] ?? null;
}

export async function removeFavorite(user_id: number, post_id: number) {
  await db`DELETE FROM favorites WHERE user_id=${user_id} AND post_id=${post_id}`;
  return true;
}

export async function isFavorite(user_id: number, post_id: number) {
  const rows = (await db`SELECT id FROM favorites WHERE user_id=${user_id} AND post_id=${post_id}`) as any[];
  return rows && rows.length > 0;
}

export async function getFavoritesByUser(user_id: number) {
  const rows = (await db`SELECT f.id, f.user_id, f.post_id, f.created_at, p.title, p.image_url FROM favorites f JOIN posts p ON p.id = f.post_id WHERE f.user_id=${user_id} ORDER BY f.created_at DESC`) as any[];
  return rows ?? [];
}

export default { addFavorite, removeFavorite, isFavorite, getFavoritesByUser };
