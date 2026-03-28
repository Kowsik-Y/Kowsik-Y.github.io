"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Github, ExternalLink, Star, ArrowRight } from "lucide-react";
import FadeIn from "@/components/ui/fade-in";
import ProjectsCanvasClient from "@/components/three/ProjectsCanvasClient";
import { blobDisplayUrl } from "@/lib/blob-url";
import type { IProject } from "@/types";
import { usePortfolioStore } from "@/lib/stores/portfolioStore";

function ProjectCard({ project, index }: { project: IProject; index: number }) {
    const router = useRouter();
    return (
        <FadeIn delay={index * 0.08}>
            <div
                role="link"
                tabIndex={0}
                onClick={() => router.push(`/projects/${project._id}`)}
                onKeyDown={(e) => e.key === "Enter" && router.push(`/projects/${project._id}`)}
                className="block h-full group cursor-pointer"
            >
                <div className={`glass-card h-full flex flex-col p-6 transition-transform duration-200 ${project.featured ? "gradient-border" : ""}`}>
                    {/* Header: app icon + title */}
                    <div className="flex items-start gap-4 mb-4">
                        {project.imageUrl ? (
                            <div className="relative w-14 h-14 rounded-2xl overflow-hidden shrink-0 border border-white/10 shadow-lg bg-white/5">
                                <Image src={blobDisplayUrl(project.imageUrl)} alt={project.title} fill className="object-cover" unoptimized />
                            </div>
                        ) : (
                            <div className="w-14 h-14 rounded-2xl shrink-0 border border-white/10 bg-violet-500/15 flex items-center justify-center text-violet-300 text-xl font-bold shadow-lg">
                                {project.title.charAt(0)}
                            </div>
                        )}
                        <div className="flex-1 min-w-0 pt-0.5">
                            {project.featured && (
                                <div className="flex items-center gap-1 text-amber-400 text-xs font-medium mb-1">
                                    <Star size={11} fill="currentColor" /> Featured
                                </div>
                            )}
                            <h3 className="font-bold text-base text-white leading-snug">{project.title}</h3>
                        </div>
                    </div>
                    <div className="flex flex-col flex-1">
                        <p className="text-slate-400 text-sm leading-relaxed mb-4 flex-1">{project.description}</p>
                        <div className="flex flex-wrap gap-1.5 mb-5">
                            {project.techStack.map((tech) => (
                                <span key={tech} className="px-2 py-0.5 rounded-md text-xs font-medium border border-violet-500/20 text-violet-300 bg-violet-500/8">
                                    {tech}
                                </span>
                            ))}
                        </div>
                        <div className="flex items-center justify-between mt-auto pt-4 border-t border-white/5">
                            <div className="flex items-center gap-3" onClick={(e) => e.stopPropagation()}>
                                {project.githubUrl && (
                                    <a href={project.githubUrl} target="_blank" rel="noopener noreferrer"
                                        className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-violet-400 transition-colors">
                                        <Github size={14} /> Source
                                    </a>
                                )}
                                {project.liveUrl && (
                                    <a href={project.liveUrl} target="_blank" rel="noopener noreferrer"
                                        className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-cyan-400 transition-colors">
                                        <ExternalLink size={14} /> Live
                                    </a>
                                )}
                            </div>
                            <span className="flex items-center gap-1 text-xs text-violet-400 group-hover:gap-2 transition-all">
                                Details <ArrowRight size={12} />
                            </span>
                        </div>
                    </div>
                </div>
            </div>
        </FadeIn>
    );
}

export default function ProjectsPage() {
    const projects = usePortfolioStore((s) => s.projects);
    const isLoading = usePortfolioStore((s) => s.loading);
    const hydrated = usePortfolioStore((s) => s.hydrated);
    const fetchOverview = usePortfolioStore((s) => s.fetchOverview);

    useEffect(() => {
        if (!hydrated) {
            void fetchOverview();
        }
    }, [fetchOverview, hydrated]);

    return (
        <div className="relative">
            <div className="fixed inset-0 -z-10 opacity-20 pointer-events-none">
                <ProjectsCanvasClient />
            </div>
            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-28">
                <FadeIn>
                    <div className="text-sm font-medium text-violet-400 uppercase tracking-widest">My Work</div>
                    <h1 className="text-4xl sm:text-5xl font-bold mb-4">
                        <span className="gradient-text">Projects</span>
                    </h1>
                    <p className="text-slate-400 text-lg max-w-2xl mb-14">
                        A collection of things I&apos;ve built — from AI-powered apps to full-stack platforms.
                    </p>
                </FadeIn>

                {isLoading ? (
                    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                        {[...Array(3)].map((_, i) => (<div key={i} className="glass-card p-6 h-72 animate-pulse" />))}
                    </div>
                ) : projects.length > 0 ? (
                    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                        {projects.map((p, i) => (<ProjectCard key={String(p._id)} project={p} index={i} />))}
                    </div>
                ) : (
                    <div className="glass-card p-12 text-center text-slate-500">No projects yet — check back soon!</div>
                )}
            </div>
        </div>
    );
}
