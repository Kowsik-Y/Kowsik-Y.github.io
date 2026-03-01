import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import Hobby from "@/models/Hobby";
import { requireAdmin } from "@/lib/require-admin";

export async function GET() {
  await dbConnect();
  const items = await Hobby.find({}).sort({ order: 1, name: 1 });
  return NextResponse.json(items);
}

export async function POST(req: NextRequest) {
  const deny = await requireAdmin();
  if (deny) return deny;
  await dbConnect();
  const body = await req.json();
  const item = await Hobby.create(body);
  return NextResponse.json(item, { status: 201 });
}
