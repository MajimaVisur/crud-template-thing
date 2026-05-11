import * as jwt from "jsonwebtoken";
import { getUserById } from "./users";
import type { UserRecord } from "./users";

export const JWT_SECRET: string = (process.env.JWT_SECRET ?? "dev_secret") as string;
export const TOKEN_EXPIRY = "7d";

export function signToken(payload: object): string {
  return jwt.sign(payload as any, JWT_SECRET) as string;
}

export function verifyToken(token: string): any {
  return jwt.verify(token, JWT_SECRET) as any;
}

export async function getUserFromRequest(req: Request): Promise<UserRecord | null> {
  const auth = req.headers.get("authorization") || "";
  const match = auth.match(/^Bearer\s+(.+)$/);
  if (!match) return null;
  const token = match[1] as string;
  try {
    const payload = verifyToken(token) as any;
    const id = payload?.id;
    if (!id) return null;
    return await getUserById(Number(id));
  } catch (err) {
    return null;
  }
}

export default { signToken, verifyToken, getUserFromRequest };
