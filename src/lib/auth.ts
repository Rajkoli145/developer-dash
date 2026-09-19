import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import { randomBytes, scryptSync, timingSafeEqual } from "crypto";
import { db } from "./db";

const COOKIE = "dc_session";

export type SessionUser = { id: string; email: string; name: string };

function secret(): Uint8Array {
  const s = process.env.AUTH_SECRET;
  if (!s || s.length < 16) {
    // Dev fallback keeps local preview working; production must set AUTH_SECRET.
    if (process.env.VERCEL) throw new Error("AUTH_SECRET env var is required in production");
    return new TextEncoder().encode("devcontext-dev-secret-do-not-use-in-prod");
  }
  return new TextEncoder().encode(s);
}

export function hashPassword(password: string): string {
  const salt = randomBytes(16).toString("hex");
  const hash = scryptSync(password, salt, 64).toString("hex");
  return `${salt}:${hash}`;
}

export function verifyPassword(password: string, stored: string): boolean {
  const [salt, hash] = stored.split(":");
  if (!salt || !hash) return false;
  const candidate = scryptSync(password, salt, 64);
  const expected = Buffer.from(hash, "hex");
  return candidate.length === expected.length && timingSafeEqual(candidate, expected);
}

/**
 * Sessions end when the browser/tab closes: the cookie has no Max-Age (a
 * "session cookie" the browser discards on exit) and the token itself expires
 * after 12h as a hard backstop. Next visit always asks for fingerprint/password.
 */
const SESSION_TTL_HOURS = 12;

export async function createSession(userId: string) {
  const token = await new SignJWT({ sub: userId })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(`${SESSION_TTL_HOURS}h`)
    .sign(secret());

  const jar = await cookies();
  jar.set(COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.VERCEL === "1",
    // No maxAge/expires on purpose → browser deletes the cookie when it closes.
    path: "/",
  });
}

export async function destroySession() {
  const jar = await cookies();
  jar.delete(COOKIE);
}

export async function getSessionUserId(): Promise<string | null> {
  try {
    const jar = await cookies();
    const token = jar.get(COOKIE)?.value;
    if (!token) return null;
    const { payload } = await jwtVerify(token, secret());
    return (payload.sub as string) ?? null;
  } catch {
    return null;
  }
}

/** Session user or null — safe everywhere (login pages, middleware-adjacent code). */
export async function getSessionUser(): Promise<SessionUser | null> {
  const userId = await getSessionUserId();
  if (!userId) return null;
  try {
    const user = await db.user.findUnique({
      where: { id: userId },
      select: { id: true, email: true, name: true },
    });
    return user ?? null;
  } catch {
    return null;
  }
}

/** Throws when unauthenticated — for server components/routers that require a session. */
export async function requireUser(): Promise<SessionUser> {
  const user = await getSessionUser();
  if (!user) throw new Error("UNAUTHENTICATED");
  return user;
}

/**
 * First-time setup detection, shared by the /setup gate and auth API:
 * an unclaimed workspace has a user with no password and no passkeys.
 */
export async function isWorkspaceClaimed(): Promise<boolean> {
  const owner = await db.user.findFirst({ where: { role: "OWNER" } });
  if (!owner) return false;
  const passkeys = await db.authCredential.count({ where: { userId: owner.id } });
  return Boolean(owner.passwordHash) || passkeys > 0;
}
