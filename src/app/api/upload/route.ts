import { put } from "@vercel/blob";
import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/require-admin";

export async function POST(req: Request) {
  const adminError = await requireAdmin();
  if (adminError) return adminError;

  const { searchParams } = new URL(req.url);
  const filename = searchParams.get("filename");
  if (!filename) return NextResponse.json({ error: "filename required" }, { status: 400 });

  const body = req.body;
  if (!body) return NextResponse.json({ error: "no body" }, { status: 400 });

  const blob = await put(filename, body, {
    access: "private",
    addRandomSuffix: true,
  });

  return NextResponse.json({ url: blob.url });
}
