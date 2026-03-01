import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import Skill from "@/models/Skill";
import { requireAdmin } from "@/lib/require-admin";

export async function GET() {
  await dbConnect();
  const skills = await Skill.find({}).sort({ category: 1, name: 1 });
  return NextResponse.json(skills);
}

export async function POST(req: NextRequest) {
  const deny = await requireAdmin();
  if (deny) return deny;
  await dbConnect();
  const body = await req.json();
  const skill = await Skill.create(body);
  return NextResponse.json(skill, { status: 201 });
}
