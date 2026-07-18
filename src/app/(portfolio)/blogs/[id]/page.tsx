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
import { getReadingTimeMinutes, getWordCount } from "@/lib/content-metrics";
import BentoCard from "@/components/ui/BentoCard";

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

type RelatedBlog = {
    _id: string;
    slug?: string;
    title: string;
    excerpt?: string;
    tags?: string[];
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

const getRelatedBlogs = cache(async (currentBlogId: string, tags: string[]): Promise<RelatedBlog[]> => {
    if (tags.length === 0) return [];

    await dbConnect();
    const related = await Blog.find({
        _id: { $ne: currentBlogId },
        published: true,
        tags: { $in: tags },
    })
        .select("_id slug title excerpt tags")
        .limit(3)
        .lean();

    return (related as Array<RelatedBlog & { _id: { toString(): string } }>).map((item) => ({
        _id: item._id.toString(),
        slug: item.slug,
        title: item.title,
        excerpt: item.excerpt,
        tags: item.tags ?? [],
    }));
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
            images: blog.coverImage
                ? [{ url: blobDisplayUrl(blog.coverImage), alt: blog.title }]
                : [{ url: `${siteUrl}/og-default.svg`, alt: "Kowsik Y Blog" }],
        },
        twitter: {
            title: `${blog.title} — Kowsik Y`,
            description: blog.excerpt,
            card: "summary_large_image",
            images: blog.coverImage ? [blobDisplayUrl(blog.coverImage)] : [`${siteUrl}/og-default.svg`],
        },
    };
}

export default async function BlogDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const { id: slugOrId } = await params;
    const blog = await getBlog(slugOrId);

    if (!blog || !blog.published) {
        return (
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-28 text-center">
                <p className="text-muted-foreground mb-6">Blog post not found.</p>
                <Link href="/blogs" className="text-foreground font-bold hover:opacity-70 inline-flex items-center gap-2">
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
    const readingTime = getReadingTimeMinutes(normalizedContent);
    const wordCount = getWordCount(normalizedContent);
    const relatedBlogs = blog._id ? await getRelatedBlogs(blog._id, blog.tags ?? []) : [];

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
        image: blog.coverImage ? [blobDisplayUrl(blog.coverImage)] : undefined,
        author: {
            "@type": "Person",
            name: "Kowsik Y",
        },
        mainEntityOfPage: `${siteUrl}/blogs/${publicSlug}`,
        keywords: blog.tags,
    };

    return (
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-32 pb-20 dot-pattern">
            <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }} />
            <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(articleJsonLd) }} />


            <Link href="/blogs" className="inline-flex items-center gap-2 text-sm font-bold text-muted-foreground hover:text-foreground transition-colors mb-8">
                <ArrowLeft size={16} /> Back to Blogs
            </Link>

            <BentoCard className="p-8 sm:p-12 mb-12">
                <h1 className="text-3xl sm:text-5xl font-bold text-foreground mb-6 leading-tight">{blog.title}</h1>
                <p className="text-xl text-muted-foreground mb-6 leading-relaxed">{blog.excerpt}</p>
                
                <div className="flex flex-wrap items-center gap-3 text-sm font-medium text-muted-foreground mb-8">
                    <span>{readingTime} min read</span>
                    <span className="text-border">•</span>
                    <span>{wordCount.toLocaleString()} words</span>
                    {blog.createdAt && (
                        <>
                            <span className="text-border">•</span>
                            <span>{new Date(blog.createdAt).toLocaleDateString()}</span>
                        </>
                    )}
                </div>

                {blog.tags && blog.tags.length > 0 && (
                    <div className="flex flex-wrap gap-2 mb-8">
                        {blog.tags.map((tag) => (
                            <span key={tag} className="px-4 py-2 rounded-full text-xs font-bold uppercase tracking-wide border border-border bg-background">
                                {tag}
                            </span>
                        ))}
                    </div>
                )}

                {blog.coverImage && (
                    <div className="relative w-full aspect-video rounded-[calc(var(--radius-3xl)-1rem)] overflow-hidden border border-border mb-12 bg-secondary">
                        <Image src={blobDisplayUrl(blog.coverImage)} alt={blog.title || "Blog cover"} fill className="object-cover" unoptimized />
                    </div>
                )}

                <div className="prose max-w-none dark:prose-invert prose-p:text-muted-foreground prose-headings:text-foreground prose-a:text-foreground prose-a:font-bold prose-strong:text-foreground">
                    <ReactMarkdown
                        remarkPlugins={[remarkGfm, remarkBreaks]}
                        urlTransform={normalizeLinkUrl}
                        components={{
                            h1: ({ children }) => <h1 className="text-3xl font-bold text-foreground mt-12 mb-6">{children}</h1>,
                            h2: ({ children }) => <h2 className="text-2xl font-bold text-foreground mt-10 mb-5">{children}</h2>,
                            h3: ({ children }) => <h3 className="text-xl font-bold text-foreground mt-8 mb-4">{children}</h3>,
                            h4: ({ children }) => <h4 className="text-lg font-bold text-foreground mt-6 mb-3">{children}</h4>,
                            h5: ({ children }) => <h5 className="text-base font-bold text-foreground mt-5 mb-3">{children}</h5>,
                            h6: ({ children }) => <h6 className="text-sm font-bold text-muted-foreground uppercase tracking-wider mt-5 mb-3">{children}</h6>,
                            p: ({ children }) => <p className="text-muted-foreground my-5 leading-loose text-lg">{children}</p>,
                            hr: () => <hr className="border-t border-border my-8" />,
                            a: ({ href, children }) => {
                                const safeHref = normalizeLinkUrl(href || "");
                                const isExternal = /^https?:\/\//.test(safeHref);
                                return (
                                    <a
                                        href={safeHref}
                                        target={isExternal ? "_blank" : undefined}
                                        rel={isExternal ? "noopener noreferrer" : undefined}
                                        className="text-foreground hover:opacity-70 underline underline-offset-4 decoration-2 break-all transition-opacity"
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
                                        className="block mx-auto my-8 max-w-full h-auto rounded-2xl border border-border"
                                        loading="lazy"
                                    />
                                );
                            },
                            ul: ({ children }) => <ul className="list-disc list-inside my-6 space-y-3 text-muted-foreground text-lg ml-2">{children}</ul>,
                            ol: ({ children }) => <ol className="list-decimal list-inside my-6 space-y-3 text-muted-foreground text-lg ml-2">{children}</ol>,
                            li: ({ children }) => <li className="text-muted-foreground leading-loose">{children}</li>,
                            blockquote: ({ children }) => (
                                <blockquote className="border-l-4 border-foreground pl-6 my-8 italic text-foreground/80 bg-secondary py-4 pr-6 rounded-r-2xl text-lg font-medium">
                                    {children}
                                </blockquote>
                            ),
                            code: ({ className, children }) => {
                                const isCodeBlock = className?.includes('language-');
                                if (!isCodeBlock) {
                                    return <code className="bg-secondary text-foreground px-2 py-1 rounded-md text-sm font-mono border border-border">{children}</code>;
                                }
                                return <code className="bg-transparent text-foreground px-1 font-mono text-sm">{children}</code>;
                            },
                            pre: ({ children }) => (
                                <pre className="bg-secondary border border-border rounded-2xl p-6 my-8 overflow-x-auto text-sm">
                                    {children}
                                </pre>
                            ),
                            table: ({ children }) => (
                                <div className="overflow-x-auto my-8 rounded-2xl border border-border">
                                    <table className="border-collapse w-full">
                                        {children}
                                    </table>
                                </div>
                            ),
                            thead: ({ children }) => (
                                <thead className="bg-secondary border-b border-border">
                                    {children}
                                </thead>
                            ),
                            tbody: ({ children }) => (
                                <tbody className="divide-y divide-border">
                                    {children}
                                </tbody>
                            ),
                            tr: ({ children }) => (
                                <tr>
                                    {children}
                                </tr>
                            ),
                            th: ({ children }) => (
                                <th className="text-foreground font-bold text-left px-6 py-4 text-sm uppercase tracking-wider">
                                    {children}
                                </th>
                            ),
                            td: ({ children }) => (
                                <td className="text-muted-foreground px-6 py-4 text-base leading-relaxed">
                                    {children}
                                </td>
                            ),
                            strong: ({ children }) => <strong className="font-bold text-foreground">{children}</strong>,
                            em: ({ children }) => <em className="italic text-foreground/90">{children}</em>,
                        }}
                    >
                        {normalizedContent}
                    </ReactMarkdown>
                </div>
            </BentoCard>

            <section className="mt-16">
                <h2 className="text-sm font-bold text-muted-foreground uppercase tracking-widest mb-6 px-2">Related Posts</h2>
                {relatedBlogs.length > 0 ? (
                    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                        {relatedBlogs.map((related) => (
                            <Link key={related._id} href={`/blogs/${related.slug || related._id}`} className="block h-full outline-none">
                                <BentoCard className="p-6 h-full hover:bg-secondary transition-colors cursor-pointer group">
                                    <h3 className="font-bold text-lg text-foreground mb-3 line-clamp-2 group-hover:opacity-80 transition-opacity">{related.title}</h3>
                                    <p className="text-sm text-muted-foreground leading-relaxed line-clamp-2">{related.excerpt}</p>
                                </BentoCard>
                            </Link>
                        ))}
                    </div>
                ) : (
                    <BentoCard className="p-8 text-center text-sm font-medium text-muted-foreground">
                        No related posts yet. Check back for more articles.
                    </BentoCard>
                )}
            </section>
        </div>
    );
}
