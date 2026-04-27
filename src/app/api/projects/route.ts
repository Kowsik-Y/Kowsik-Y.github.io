import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import Project from "@/models/Project";
import { requireAdmin } from "@/lib/require-admin";
import { buildProjectSlug, normalizeProjectSlug } from "@/lib/project-slug";

export async function GET() {
  await dbConnect();
  const projects = await Project.find({}).sort({ order: 1, createdAt: -1 });

  await Promise.all(
    projects.map(async (project) => {
      if (!project.slug) {
        project.slug = buildProjectSlug(project.title, project._id.toString());
        await project.save();
      }
    })
  );

  return NextResponse.json(projects);
}

export async function POST(req: NextRequest) {
  const deny = await requireAdmin();
  if (deny) return deny;

  await dbConnect();
  const body = await req.json();
  const project = new Project(body);

  const requestedSlug = typeof body.slug === "string" ? normalizeProjectSlug(body.slug) : "";
  project.slug = requestedSlug || buildProjectSlug(project.title, project._id.toString());

  await project.save();
  return NextResponse.json(project, { status: 201 });
}
