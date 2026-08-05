import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export class UnauthorizedError extends Error {
  constructor() {
    super("You must be signed in as an admin to do that.");
  }
}

/**
 * Defense-in-depth session check for server actions. `middleware.ts` already
 * blocks unauthenticated requests to `/admin/*`, but server actions can be
 * invoked directly, so every mutating action re-checks the session here.
 */
export async function requireAdmin() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    throw new UnauthorizedError();
  }
  return session.user;
}
