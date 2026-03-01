import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import Certificate from "@/models/Certificate";
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
  const cert = await Certificate.findByIdAndUpdate(id, body, { returnDocument: "after" });
  if (!cert) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(cert);
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const deny = await requireAdmin();
  if (deny) return deny;
  await dbConnect();
  const { id } = await params;
  await Certificate.findByIdAndDelete(id);
  return NextResponse.json({ success: true });
}
