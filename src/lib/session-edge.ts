import { jwtVerify } from "jose";

export const SESSION_COOKIE = "dc_session";

function secret(): Uint8Array {
  const s = process.env.AUTH_SECRET;
  if (!s || s.length < 16) {
    return new TextEncoder().encode("devcontext-dev-secret-do-not-use-in-prod");
  }
  return new TextEncoder().encode(s);
}

/** Edge-safe session check for middleware (cookie + JWT only, no DB). */
export async function hasValidSession(token: string | undefined): Promise<boolean> {
  if (!token) return false;
  try {
    await jwtVerify(token, secret());
    return true;
  } catch {
    return false;
  }
}
