import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import Project from "@/models/Project";
import { requireAdmin } from "@/lib/require-admin";
import {
  buildProjectSlug,
  isObjectIdLike,
  normalizeProjectSlug,
} from "@/lib/project-slug";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  await dbConnect();
  const { id } = await params;

  const project = isObjectIdLike(id)
    ? await Project.findById(id).lean()
    : await Project.findOne({ slug: id }).lean();

  if (!project) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const typedProject = project as { _id: { toString(): string }; title?: string; slug?: string };
  if (!typedProject.slug) {
    const generatedSlug = buildProjectSlug(typedProject.title, typedProject._id.toString());
    await Project.findByIdAndUpdate(typedProject._id, { slug: generatedSlug });
    return NextResponse.json({ ...project, slug: generatedSlug });
  }

  return NextResponse.json(project);
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const deny = await requireAdmin();
  if (deny) return deny;

  await dbConnect();
  const body = await req.json();
  const { id } = await params;

  const existing = await Project.findById(id);
  if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const updates = { ...body } as Record<string, unknown>;
  const requestedSlug =
    typeof updates.slug === "string" ? normalizeProjectSlug(updates.slug) : "";

  if (requestedSlug) {
    updates.slug = requestedSlug;
  } else if (!existing.slug) {
    updates.slug = buildProjectSlug(
      typeof updates.title === "string" ? updates.title : existing.title,
      existing._id.toString()
    );
  }

  const project = await Project.findByIdAndUpdate(id, updates, {
    returnDocument: "after",
  });
  if (!project) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(project);
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const deny = await requireAdmin();
  if (deny) return deny;

  await dbConnect();
  const { id } = await params;
  await Project.findByIdAndDelete(id);
  return NextResponse.json({ success: true });
}
