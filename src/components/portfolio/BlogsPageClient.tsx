"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { ArrowRight } from "lucide-react";
import { FilterDropdown } from "@/components/ui/filter-dropdown";
import { Search, X } from "lucide-react";
import FadeIn from "@/components/ui/fade-in";
import Breadcrumbs from "@/components/layout/Breadcrumbs";
import { sectionBreadcrumbs } from "@/lib/breadcrumbs";
import { blobDisplayUrl } from "@/lib/blob-url";
import { getReadingTimeMinutes, getWordCount } from "@/lib/content-metrics";
import type { IBlog } from "@/types";

function BlogCard({ blog, index }: { blog: IBlog; index: number }) {
    const readingTime = getReadingTimeMinutes(blog.content);
    const wordCount = getWordCount(blog.content);

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
                        <h2 className="text-lg font-semibold text-foreground mb-2 leading-tight">{blog.title}</h2>
                        <p className="text-sm text-muted-foreground mb-4 line-clamp-3">{blog.excerpt}</p>
                        <div className="flex items-center gap-3 text-xs text-muted-foreground mb-4">
                            <span>{readingTime} min read</span>
                            <span className="text-border">•</span>
                            <span>{wordCount.toLocaleString()} words</span>
                        </div>
                        {blog.tags.length > 0 && (
                            <div className="flex flex-wrap gap-2 mb-4">
                                {blog.tags.slice(0, 4).map((tag) => (
                                    <span key={tag} className="ui-chip px-2 py-0.5 rounded-md text-xs font-medium">
                                        {tag}
                                    </span>
                                ))}
                            </div>
                        )}
                        <span className="inline-flex items-center gap-1 text-sm text-primary group-hover:gap-2 transition-all">
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
                <p className="text-muted-foreground text-lg max-w-2xl mb-12">Thoughts, learnings, and deep dives from my AI and full-stack journey.</p>
            </FadeIn>

            <FadeIn delay={0.05}>
                <div className="flex flex-col md:flex-row gap-4 mb-10 w-full z-10 relative">
                    <div className="relative flex-1 ui-surface rounded-xl border border-border/60 shadow-xs focus-within:border-primary/50 focus-within:ring-1 focus-within:ring-primary/20 transition-all flex items-center px-4 py-1.5 h-15.5">
                        <Search size={18} className="text-muted-foreground shrink-0 mr-3" />
                        <input
                            type="text"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder="Search by title, excerpt, or tag..."
                            className="w-full bg-transparent border-none focus:ring-0 text-sm text-foreground placeholder:text-muted-foreground outline-none"
                        />
                        {search && (
                            <button 
                                type="button" 
                                onClick={() => setSearch('')}
                                className="text-muted-foreground hover:text-foreground p-1 transition-colors"
                            >
                                <X size={14} />
                            </button>
                        )}
                    </div>
                    <div className="w-full md:w-auto md:min-w-70">
                        <FilterDropdown 
                            options={tags}
                            activeOption={activeTag}
                            onSelect={setActiveTag}
                            label="Filter by Topic"
                            allLabel="All Topics"
                        />
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
                <div className="glass-card p-12 text-center text-muted-foreground">
                    {blogs.length === 0
                        ? "No blog posts published yet. Explore projects and certifications while I publish new articles."
                        : "No matching blog posts found."}
                </div>
            )}
        </div>
    );
}
