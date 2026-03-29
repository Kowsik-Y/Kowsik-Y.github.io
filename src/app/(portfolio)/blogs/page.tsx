import dbConnect from "@/lib/db";
import Blog from "@/models/Blog";
import BlogsPageClient from "@/components/portfolio/BlogsPageClient";
import type { IBlog } from "@/types";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://kowsik.me";

export const revalidate = 300;

type BlogLean = {
    _id: { toString(): string };
    slug?: string;
    title: string;
    excerpt?: string;
    content?: string;
    coverImage?: string;
    tags?: string[];
    published?: boolean;
    order?: number;
    createdAt?: Date;
    updatedAt?: Date;
};

export default async function BlogsPage() {
    await dbConnect();

    const blogDocs = (await Blog.find({ published: true }).sort({ order: 1, createdAt: -1 }).lean()) as BlogLean[];

    const initialBlogs: IBlog[] = blogDocs.map((doc) => ({
        _id: doc._id.toString(),
        slug: doc.slug ?? "",
        title: doc.title,
        excerpt: doc.excerpt ?? "",
        content: doc.content ?? "",
        coverImage: doc.coverImage,
        tags: doc.tags ?? [],
        published: doc.published ?? true,
        order: doc.order ?? 0,
        createdAt: doc.createdAt?.toISOString(),
        updatedAt: doc.updatedAt?.toISOString(),
    }));

    const blogsItemListJsonLd = {
        "@context": "https://schema.org",
        "@type": "ItemList",
        name: "Blogs",
        itemListOrder: "https://schema.org/ItemListOrderAscending",
        itemListElement: initialBlogs.map((blog, index) => ({
            "@type": "ListItem",
            position: index + 1,
            name: blog.title,
            url: `${siteUrl}/blogs/${blog.slug || blog._id}`,
        })),
    };

    return (
        <>
            <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(blogsItemListJsonLd) }} />
            <BlogsPageClient initialBlogs={initialBlogs} />
        </>
    );
}
