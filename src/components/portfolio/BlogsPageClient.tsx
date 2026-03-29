"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { ArrowRight } from "lucide-react";
import FadeIn from "@/components/ui/fade-in";
import Breadcrumbs from "@/components/layout/Breadcrumbs";
import { sectionBreadcrumbs } from "@/lib/breadcrumbs";
import { blobDisplayUrl } from "@/lib/blob-url";
import type { IBlog } from "@/types";

function BlogCard({ blog, index }: { blog: IBlog; index: number }) {
    return (
        <FadeIn delay={index * 0.06}>
            <Link href={`/blogs/${blog.slug || blog._id}`} className="block group h-full">
                <div className="glass-card h-full overflow-hidden border border-white/10 hover:border-violet-500/40 transition-colors">
                    {blog.coverImage && (
                        <div className="relative aspect-16/8 w-full overflow-hidden border-b border-white/10">
                            <Image src={blobDisplayUrl(blog.coverImage)} alt={blog.title} fill className="object-cover group-hover:scale-105 transition-transform duration-300" unoptimized />
                        </div>
                    )}
                    <div className="p-5">
                        <h2 className="text-lg font-semibold text-white mb-2 leading-tight">{blog.title}</h2>
                        <p className="text-sm text-slate-400 mb-4 line-clamp-3">{blog.excerpt}</p>
                        {blog.tags.length > 0 && (
                            <div className="flex flex-wrap gap-2 mb-4">
                                {blog.tags.slice(0, 4).map((tag) => (
                                    <span key={tag} className="px-2 py-0.5 rounded-md text-xs font-medium border border-violet-500/30 text-violet-300 bg-violet-500/10">
                                        {tag}
                                    </span>
                                ))}
                            </div>
                        )}
                        <span className="inline-flex items-center gap-1 text-sm text-violet-400 group-hover:gap-2 transition-all">
                            Read post <ArrowRight size={14} />
                        </span>
                    </div>
                </div>
            </Link>
        </FadeIn>
    );
}

interface BlogsPageClientProps {
    initialBlogs: IBlog[];
}

export default function BlogsPageClient({ initialBlogs }: BlogsPageClientProps) {
    const blogs = initialBlogs.filter((blog) => blog.published);
    const [search, setSearch] = useState("");
    const [activeTag, setActiveTag] = useState<string>("all");

    const tags = useMemo(
        () => ["all", ...Array.from(new Set(blogs.flatMap((blog) => blog.tags).filter(Boolean)))],
        [blogs]
    );

    const filteredBlogs = useMemo(() => {
        const q = search.trim().toLowerCase();

        return blogs.filter((blog) => {
            const matchesTag = activeTag === "all" || blog.tags.includes(activeTag);
            if (!matchesTag) return false;
            if (!q) return true;

            return (
                blog.title.toLowerCase().includes(q) ||
                blog.excerpt.toLowerCase().includes(q) ||
                blog.tags.some((tag) => tag.toLowerCase().includes(q))
            );
        });
    }, [activeTag, blogs, search]);

    return (
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-28">
            <Breadcrumbs
                className="mb-6"
                items={sectionBreadcrumbs("Blogs", "/blogs")}
            />
            <FadeIn>
                <div className="text-sm font-medium text-violet-400 uppercase tracking-widest">Insights</div>
                <h1 className="text-4xl sm:text-5xl font-bold mb-4">
                    <span className="gradient-text">Blogs</span>
                </h1>
                <p className="text-slate-400 text-lg max-w-2xl mb-12">Thoughts, learnings, and deep dives from my AI and full-stack journey.</p>
            </FadeIn>

            <FadeIn delay={0.05}>
                <div className="glass-card p-4 mb-8 border border-white/10 space-y-4">
                    <input
                        type="text"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="Search by title, excerpt, or tag..."
                        className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-white placeholder:text-slate-500 outline-none focus:border-violet-500/50"
                    />
                    <div className="flex flex-wrap gap-2">
                        {tags.map((tag) => {
                            const active = activeTag === tag;
                            return (
                                <button
                                    key={tag}
                                    type="button"
                                    onClick={() => setActiveTag(tag)}
                                    className={`px-3 py-1 rounded-full text-xs border transition-colors ${active
                                        ? "border-violet-400 bg-violet-500/20 text-violet-200"
                                        : "border-white/10 bg-white/5 text-slate-300 hover:border-violet-500/40"
                                        }`}
                                >
                                    {tag === "all" ? "All" : tag}
                                </button>
                            );
                        })}
                    </div>
                </div>
            </FadeIn>

            {filteredBlogs.length > 0 ? (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredBlogs.map((blog, i) => (
                        <BlogCard key={blog._id} blog={blog} index={i} />
                    ))}
                </div>
            ) : (
                <div className="glass-card p-12 text-center text-slate-500">
                    {blogs.length === 0
                        ? "No blog posts published yet. Explore projects and certifications while I publish new articles."
                        : "No matching blog posts found."}
                </div>
            )}
        </div>
    );
}
