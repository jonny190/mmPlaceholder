import { NextRequest } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "./auth";

export async function isAuthorizedApi(req: NextRequest): Promise<boolean> {
  const authHeader = req.headers.get("authorization");
  if (authHeader?.startsWith("Bearer ")) {
    const token = authHeader.slice(7);
    return token === process.env.API_KEY;
  }
  const session = await getServerSession(authOptions);
  return !!session;
}
