"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { ArrowUpRight, Search, X } from "lucide-react";
import { FilterDropdown } from "@/components/ui/filter-dropdown";
import Breadcrumbs from "@/components/layout/Breadcrumbs";
import { sectionBreadcrumbs } from "@/lib/breadcrumbs";
import { getReadingTimeMinutes, getWordCount } from "@/lib/content-metrics";
import type { IBlog } from "@/types";
import BentoCard from "@/components/ui/BentoCard";
import ImageReveal from "@/components/ui/ImageReveal";
import { blobDisplayUrl } from "@/lib/blob-url";

function BlogCard({ blog, index }: { blog: IBlog; index: number }) {
    const readingTime = getReadingTimeMinutes(blog.content);

    return (
        <BentoCard interactive delay={index * 0.05} className="flex flex-col group h-full">
            <Link href={`/blogs/${blog.slug || blog._id}`} className="flex-1 flex flex-col p-6 outline-none">
                {/* Image */}
                {blog.coverImage && (
                    <div className="mb-6 -mx-2 -mt-2">
                        <ImageReveal 
                            src={blobDisplayUrl(blog.coverImage)} 
                            alt={blog.title} 
                            aspectRatio="video"
                            containerClassName="w-full rounded-2xl"
                        />
                    </div>
                )}
                
                {/* Meta */}
                <div className="flex flex-wrap gap-2 mb-4">
                    {blog.tags.slice(0, 3).map((tag) => (
                        <span key={tag} className="px-2 py-1 rounded-md text-[10px] font-bold uppercase tracking-wide bg-secondary text-secondary-foreground">
                            {tag}
                        </span>
                    ))}
                    <span className="ml-auto text-xs font-medium text-muted-foreground flex items-center">
                        {readingTime} min read
                    </span>
                </div>

                {/* Content */}
                <h2 className="text-xl font-bold leading-snug mb-3 group-hover:opacity-70 transition-opacity">
                    {blog.title}
                </h2>
                <p className="text-sm text-muted-foreground line-clamp-3 mb-6 flex-1">
                    {blog.excerpt}
                </p>

                {/* Footer */}
                <div className="mt-auto pt-4 border-t border-border flex items-center justify-between font-bold text-sm">
                    Read Article
                    <div className="w-8 h-8 rounded-full bg-foreground text-background flex items-center justify-center transition-transform group-hover:scale-110 group-hover:-rotate-12">
                        <ArrowUpRight size={16} />
                    </div>
                </div>
            </Link>
        </BentoCard>
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
        <div className="min-h-screen pt-32 pb-20 dot-pattern">
            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
                
                <div className="mb-12 flex flex-col md:flex-row md:items-end justify-between gap-6">
                    <div>
                        <h1 className="text-4xl sm:text-5xl font-bold tracking-tight mb-4">Writings</h1>
                        <p className="text-muted-foreground text-lg max-w-xl">
                            Thoughts, learnings, and deep dives on software engineering, AI, and design.
                        </p>
                    </div>
                    
                    <div className="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto">
                        <div className="relative flex-1 sm:w-64">
                            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                            <input
                                type="text"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                placeholder="Search articles..."
                                className="w-full pl-9 pr-8 py-2.5 bg-card border border-border rounded-full text-sm outline-none focus:border-foreground transition-colors"
                            />
                            {search && (
                                <button 
                                    onClick={() => setSearch('')}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                                >
                                    <X size={14} />
                                </button>
                            )}
                        </div>
                        <FilterDropdown 
                            options={tags}
                            activeOption={activeTag}
                            onSelect={setActiveTag}
                            label="Topic"
                            allLabel="All Topics"
                        />
                    </div>
                </div>

                {filteredBlogs.length > 0 ? (
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filteredBlogs.map((blog, i) => (
                            <BlogCard key={blog._id} blog={blog} index={i} />
                        ))}
                    </div>
                ) : (
                    <div className="p-12 text-center text-muted-foreground bg-card rounded-3xl border border-border">
                        {blogs.length === 0
                            ? "No articles published yet."
                            : "No matching articles found."}
                    </div>
                )}
            </div>
        </div>
    );
}
