import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";

export async function requireAdmin(): Promise<NextResponse | null> {
  const session = await auth();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  return null;
}
