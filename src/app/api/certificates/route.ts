import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import Certificate from "@/models/Certificate";
import { requireAdmin } from "@/lib/require-admin";

export async function GET() {
  await dbConnect();
  const certs = await Certificate.find({}).sort({ createdAt: -1 });
  return NextResponse.json(certs);
}

export async function POST(req: NextRequest) {
  const deny = await requireAdmin();
  if (deny) return deny;
  await dbConnect();
  const body = await req.json();
  const cert = await Certificate.create(body);
  return NextResponse.json(cert, { status: 201 });
}
