import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import Achievement from "@/models/Achievement";
import { requireAdmin } from "@/lib/require-admin";

export async function GET() {
  await dbConnect();
  const items = await Achievement.find({}).sort({ createdAt: -1 });
  return NextResponse.json(items);
}

export async function POST(req: NextRequest) {
  const deny = await requireAdmin();
  if (deny) return deny;
  await dbConnect();
  const body = await req.json();
  const item = await Achievement.create(body);
  return NextResponse.json(item, { status: 201 });
}
