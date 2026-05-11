import db from "./db";

export type UserRecord = {
  id: number;
  username: string;
  email: string;
  is_admin: number;
  is_blocked: number;
  password_hash?: string;
};

export async function getUserById(id: number): Promise<UserRecord | null> {
  const rows = (await db`SELECT id, username, email, is_admin, is_blocked FROM users WHERE id=${id}`) as any[];
  return rows?.[0] ?? null;
}

export async function findUserByEmailOrUsername(emailOrUsername: string): Promise<UserRecord | null> {
  const rows = (await db`SELECT id, username, email, password_hash, is_admin, is_blocked FROM users WHERE email=${emailOrUsername} OR username=${emailOrUsername}`) as any[];
  return rows?.[0] ?? null;
}

export async function createUser(username: string, email: string, password_hash: string): Promise<UserRecord | null> {
  await db`INSERT INTO users (username, email, password_hash) VALUES (${username}, ${email}, ${password_hash})`;
  const rows = (await db`SELECT id, username, email, is_admin FROM users WHERE email=${email}`) as any[];
  return rows?.[0] ?? null;
}

export async function setUserBlocked(id: number, blocked: boolean): Promise<boolean> {
  await db`UPDATE users SET is_blocked=${blocked ? 1 : 0}, updated_at=CURRENT_TIMESTAMP WHERE id=${id}`;
  return true;
}

export default {
  getUserById,
  findUserByEmailOrUsername,
  createUser,
  setUserBlocked,
};
