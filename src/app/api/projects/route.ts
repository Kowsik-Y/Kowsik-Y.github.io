import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import Project from "@/models/Project";
import { requireAdmin } from "@/lib/require-admin";

export async function GET() {
  await dbConnect();
  const projects = await Project.find({}).sort({ order: 1, createdAt: -1 });
  return NextResponse.json(projects);
}

export async function POST(req: NextRequest) {
  const deny = await requireAdmin();
  if (deny) return deny;

  await dbConnect();
  const body = await req.json();
  const project = await Project.create(body);
  return NextResponse.json(project, { status: 201 });
}
