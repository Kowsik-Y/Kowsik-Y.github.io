import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import Blog from "@/models/Blog";
import { requireAdmin } from "@/lib/require-admin";

function toSlug(input: string) {
    return input
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9\s-]/g, "")
        .replace(/\s+/g, "-")
        .replace(/-+/g, "-")
        .replace(/^-|-$/g, "");
}

function resolveSlug(body: Record<string, unknown>) {
    const slugInput = typeof body.slug === "string" ? body.slug.trim() : "";
    const titleInput = typeof body.title === "string" ? body.title.trim() : "";
    return toSlug(slugInput || titleInput);
}

export async function GET() {
    await dbConnect();
    const blogs = await Blog.find({}).sort({ order: 1, createdAt: -1 });
    return NextResponse.json(blogs);
}

export async function POST(req: NextRequest) {
    const deny = await requireAdmin();
    if (deny) return deny;

    await dbConnect();
    const body = await req.json();

    const slugBase = resolveSlug(body as Record<string, unknown>);
    if (!slugBase) {
        return NextResponse.json({ error: "Slug or title is required" }, { status: 400 });
    }

    try {
        const blog = await Blog.create({
            ...body,
            slug: slugBase,
        });

        return NextResponse.json(blog, { status: 201 });
    } catch (error) {
        if (
            typeof error === "object" &&
            error !== null &&
            "code" in error &&
            (error as { code?: number }).code === 11000
        ) {
            return NextResponse.json({ error: "Slug already exists. Choose a different slug." }, { status: 409 });
        }

        throw error;
    }
}
