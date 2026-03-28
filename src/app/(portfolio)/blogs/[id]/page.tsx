import type { Metadata } from "next";
import dbConnect from "@/lib/db";
import Blog from "@/models/Blog";
import { cache } from "react";
import Link from "next/link";
import Image from "next/image";
import ReactMarkdown from "react-markdown";
import remarkBreaks from "remark-breaks";
import remarkGfm from "remark-gfm";
import { ArrowLeft } from "lucide-react";
import { permanentRedirect } from "next/navigation";
import { blobDisplayUrl } from "@/lib/blob-url";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://kowsik.me";

type BlogPageData = {
    _id?: string;
    slug?: string;
    title?: string;
    excerpt?: string;
    content?: string;
    coverImage?: string;
    tags?: string[];
    published?: boolean;
    createdAt?: string | Date;
    updatedAt?: string | Date;
};

function normalizeBlogMarkdown(content: string) {
    return content
        .split("\n")
        .reduce<string[]>((acc, rawLine, index, lines) => {
            const line = rawLine.trimEnd();
            const headingOnly = line.match(/^(#{1,6})\s*$/);

            if (headingOnly) {
                const nextLine = (lines[index + 1] ?? "").trim();
                if (nextLine && !/^(#{1,6})\s+/.test(nextLine)) {
                    acc.push(`${headingOnly[1]} ${nextLine}`);
                    return acc;
                }
            }

            const isHeadingTextAlreadyUsed =
                index > 0 && /^(#{1,6})\s*$/.test((lines[index - 1] ?? "").trim()) && line.trim().length > 0;

            if (!isHeadingTextAlreadyUsed) {
                acc.push(line);
            }

            return acc;
        }, [])
        .join("\n")
        .replace(/\n{3,}/g, "\n\n")
        .trim();
}

function normalizeLinkUrl(url?: string | Blob | null) {
    if (typeof url !== "string") return "";
    if (url.startsWith("www.")) return `https://${url}`;
    return url;
}

const getBlog = cache(async (slugOrId: string): Promise<BlogPageData | null> => {
    await dbConnect();
    const isObjectId = /^[a-f\d]{24}$/i.test(slugOrId);
    const blog = isObjectId
        ? await Blog.findById(slugOrId).lean()
        : await Blog.findOne({ slug: slugOrId }).lean();
    return blog as BlogPageData | null;
});

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
    const { id: slugOrId } = await params;
    const blog = await getBlog(slugOrId);

    if (!blog) return { title: "Blog Not Found" };

    const publicSlug = blog.slug || slugOrId;

    return {
        title: blog.title,
        description: blog.excerpt,
        keywords: blog.tags,
        alternates: {
            canonical: `${siteUrl}/blogs/${publicSlug}`,
        },
        openGraph: {
            title: `${blog.title} — Kowsik Y`,
            description: blog.excerpt,
            url: `${siteUrl}/blogs/${publicSlug}`,
            type: "article",
            images: blog.coverImage ? [{ url: blog.coverImage, alt: blog.title }] : undefined,
        },
        twitter: {
            title: `${blog.title} — Kowsik Y`,
            description: blog.excerpt,
            card: "summary_large_image",
        },
    };
}

export default async function BlogDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const { id: slugOrId } = await params;
    const blog = await getBlog(slugOrId);

    if (!blog || !blog.published) {
        return (
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-28 text-center">
                <p className="text-slate-400 mb-6">Blog post not found.</p>
                <Link href="/blogs" className="text-violet-400 hover:text-violet-300 inline-flex items-center gap-2">
                    <ArrowLeft size={16} /> Back to Blogs
                </Link>
            </div>
        );
    }

    const isObjectIdPath = /^[a-f\d]{24}$/i.test(slugOrId);
    if (isObjectIdPath && blog.slug) {
        permanentRedirect(`/blogs/${blog.slug}`);
    }

    const publicSlug = blog.slug || slugOrId;
    const normalizedContent = normalizeBlogMarkdown(blog.content || "");

    const breadcrumbJsonLd = {
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        itemListElement: [
            { "@type": "ListItem", position: 1, name: "Home", item: siteUrl },
            { "@type": "ListItem", position: 2, name: "Blogs", item: `${siteUrl}/blogs` },
            { "@type": "ListItem", position: 3, name: blog.title || "Blog", item: `${siteUrl}/blogs/${publicSlug}` },
        ],
    };

    const articleJsonLd = {
        "@context": "https://schema.org",
        "@type": "Article",
        headline: blog.title,
        description: blog.excerpt,
        datePublished: blog.createdAt ? new Date(blog.createdAt).toISOString() : undefined,
        dateModified: blog.updatedAt ? new Date(blog.updatedAt).toISOString() : undefined,
        image: blog.coverImage ? [blog.coverImage] : undefined,
        author: {
            "@type": "Person",
            name: "Kowsik Y",
        },
        mainEntityOfPage: `${siteUrl}/blogs/${publicSlug}`,
        keywords: blog.tags,
    };

    return (
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-28 pb-16">
            <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }} />
            <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(articleJsonLd) }} />

            <Link href="/blogs" className="inline-flex items-center gap-2 text-sm text-slate-400 hover:text-violet-400 transition-colors mb-8">
                <ArrowLeft size={16} /> Back to Blogs
            </Link>

            <article className="glass-card p-6 sm:p-8">
                <h1 className="text-3xl sm:text-4xl font-bold text-white mb-4 leading-tight">{blog.title}</h1>
                <p className="text-slate-400 mb-6">{blog.excerpt}</p>

                {blog.tags && blog.tags.length > 0 && (
                    <div className="flex flex-wrap gap-2 mb-6">
                        {blog.tags.map((tag) => (
                            <span key={tag} className="px-2.5 py-1 rounded-full text-xs font-medium border border-violet-500/30 text-violet-300 bg-violet-500/10">
                                {tag}
                            </span>
                        ))}
                    </div>
                )}

                {blog.coverImage && (
                    <div className="relative w-full aspect-16/8 rounded-xl overflow-hidden border border-white/10 mb-8">
                        <Image src={blobDisplayUrl(blog.coverImage)} alt={blog.title || "Blog cover"} fill className="object-cover" unoptimized />
                    </div>
                )}

                <div className="prose prose-invert max-w-none prose-p:text-slate-300 prose-headings:text-white prose-a:text-violet-400">
                    <ReactMarkdown
                        remarkPlugins={[remarkGfm, remarkBreaks]}
                        urlTransform={normalizeLinkUrl}
                        components={{
                            h1: ({ children }) => <h1 className="text-3xl font-bold text-white mt-8 mb-4">{children}</h1>,
                            h2: ({ children }) => <h2 className="text-2xl font-semibold text-white mt-7 mb-3">{children}</h2>,
                            h3: ({ children }) => <h3 className="text-xl font-semibold text-white mt-6 mb-3">{children}</h3>,
                            hr: () => <hr className="border-t my-6" />,
                            a: ({ href, children }) => {
                                const safeHref = normalizeLinkUrl(href || "");
                                const isExternal = /^https?:\/\//.test(safeHref);
                                return (
                                    <a
                                        href={safeHref}
                                        target={isExternal ? "_blank" : undefined}
                                        rel={isExternal ? "noopener noreferrer" : undefined}
                                        className="text-violet-400 hover:text-violet-300 underline underline-offset-2 break-all"
                                    >
                                        {children}
                                    </a>
                                );
                            },
                            img: ({ src, alt }) => {
                                if (!src) return null;

                                return (
                                    // eslint-disable-next-line @next/next/no-img-element
                                    <img
                                        src={normalizeLinkUrl(src)}
                                        alt={alt || "Blog image"}
                                        className="block mx-auto my-6 max-w-full h-auto rounded-lg border border-white/10"
                                        loading="lazy"
                                    />
                                );
                            },
                        }}
                    >
                        {normalizedContent}
                    </ReactMarkdown>
                </div>
            </article>
        </div>
    );
}
