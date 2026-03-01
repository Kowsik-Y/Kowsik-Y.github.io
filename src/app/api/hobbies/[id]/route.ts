import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import Hobby from "@/models/Hobby";
import { requireAdmin } from "@/lib/require-admin";

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const deny = await requireAdmin();
  if (deny) return deny;
  await dbConnect();
  const { id } = await params;
  const body = await req.json();
  const item = await Hobby.findByIdAndUpdate(id, body, { returnDocument: "after" });
  if (!item) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(item);
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const deny = await requireAdmin();
  if (deny) return deny;
  await dbConnect();
  const { id } = await params;
  await Hobby.findByIdAndDelete(id);
  return NextResponse.json({ ok: true });
}
