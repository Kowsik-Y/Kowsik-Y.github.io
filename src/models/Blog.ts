import mongoose, { Document, Schema, models } from "mongoose";

export interface BlogDocument extends Document {
    slug: string;
    title: string;
    excerpt: string;
    content: string;
    coverImage?: string;
    tags: string[];
    published: boolean;
    order: number;
}

const BlogSchema = new Schema<BlogDocument>(
    {
        slug: { type: String, required: true, unique: true, lowercase: true, trim: true },
        title: { type: String, required: true, trim: true },
        excerpt: { type: String, default: "", trim: true },
        content: { type: String, required: true },
        coverImage: String,
        tags: { type: [String], default: [] },
        published: { type: Boolean, default: true },
        order: { type: Number, default: 0 },
    },
    { timestamps: true }
);

function toSlug(input: string) {
    return input
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9\s-]/g, "")
        .replace(/\s+/g, "-")
        .replace(/-+/g, "-")
        .replace(/^-|-$/g, "");
}

BlogSchema.pre("validate", function (next) {
    if (!this.slug && this.title) {
        this.slug = toSlug(this.title);
    }
    next();
});

BlogSchema.index({ slug: 1 }, { unique: true });

const Blog = models.Blog || mongoose.model<BlogDocument>("Blog", BlogSchema);

export default Blog;
