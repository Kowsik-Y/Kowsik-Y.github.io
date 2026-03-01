import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import Language from "@/models/Language";
import { requireAdmin } from "@/lib/require-admin";

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const deny = await requireAdmin();
  if (deny) return deny;
  await dbConnect();
  const body = await req.json();
  const { id } = await params;
  const item = await Language.findByIdAndUpdate(id, body, { returnDocument: "after" });
  if (!item) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(item);
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const deny = await requireAdmin();
  if (deny) return deny;
  await dbConnect();
  const { id } = await params;
  await Language.findByIdAndDelete(id);
  return NextResponse.json({ success: true });
}
