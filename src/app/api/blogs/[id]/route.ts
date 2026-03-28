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

export async function GET(
    _req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    await dbConnect();
    const { id } = await params;
    const isObjectId = /^[a-f\d]{24}$/i.test(id);
    const blog = isObjectId
        ? await Blog.findById(id).lean()
        : await Blog.findOne({ slug: id }).lean();
    if (!blog) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json(blog);
}

export async function PUT(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const deny = await requireAdmin();
    if (deny) return deny;

    await dbConnect();
    const { id } = await params;
    const body = await req.json();

    const update = {
        ...body,
        slug: resolveSlug(body as Record<string, unknown>),
    } as Record<string, unknown>;

    if (!update.slug) delete update.slug;

    try {
        const blog = await Blog.findByIdAndUpdate(id, update, {
            returnDocument: "after",
            runValidators: true,
        });

        if (!blog) return NextResponse.json({ error: "Not found" }, { status: 404 });
        return NextResponse.json(blog);
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

export async function DELETE(
    _req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const deny = await requireAdmin();
    if (deny) return deny;

    await dbConnect();
    const { id } = await params;
    await Blog.findByIdAndDelete(id);
    return NextResponse.json({ success: true });
}
