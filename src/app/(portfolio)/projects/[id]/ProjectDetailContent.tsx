"use client";

import useSWR from "swr";
import { useParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { ArrowLeft, Github, ExternalLink, Link as LinkIcon } from "lucide-react";
import FadeIn from "@/components/ui/fade-in";
import ProjectsCanvasClient from "@/components/three/ProjectsCanvasClient";
import { blobDisplayUrl } from "@/lib/blob-url";
import type { IProject } from "@/types";

const fetcher = (url: string) => fetch(url).then((r) => r.json());

export default function ProjectDetailContent() {
    const { id } = useParams<{ id: string }>();
    const { data: project, isLoading } = useSWR<IProject>(
        id ? `/api/projects/${id}` : null,
        fetcher
    );

    if (isLoading) {
        return (
            <div className="relative min-h-screen">
                <div className="fixed inset-0 -z-10 opacity-20 pointer-events-none"><ProjectsCanvasClient /></div>
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-28">
                    <div className="glass-card p-8 animate-pulse h-96" />
                </div>
            </div>
        );
    }

    if (!project) {
        return (
            <div className="relative min-h-screen flex items-center justify-center">
                <div className="fixed inset-0 -z-10 opacity-20 pointer-events-none"><ProjectsCanvasClient /></div>
                <div className="text-center">
                    <p className="text-slate-400 mb-6">Project not found.</p>
                    <Link href="/projects" className="text-violet-400 hover:text-violet-300 flex items-center gap-2 justify-center">
                        <ArrowLeft size={16} /> Back to Projects
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="relative">
            <div className="fixed inset-0 -z-10 opacity-20 pointer-events-none">
                <ProjectsCanvasClient />
            </div>
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-28">
                {/* Back */}
                <FadeIn>
                    <Link href="/projects" className="inline-flex items-center gap-2 text-sm text-slate-400 hover:text-violet-400 transition-colors mb-8">
                        <ArrowLeft size={16} /> Back to Projects
                    </Link>
                </FadeIn>

                {/* Hero: app icon + title + links */}
                <FadeIn delay={0.05}>
                    <div className="glass-card p-6 sm:p-8 mb-8">
                        <div className="flex flex-col sm:flex-row sm:items-start gap-6">
                            {/* App icon */}
                            {project.imageUrl ? (
                                <div className="relative w-24 h-24 sm:w-28 sm:h-28 rounded-3xl overflow-hidden shrink-0 border border-white/10 shadow-xl bg-white/5">
                                    <Image src={blobDisplayUrl(project.imageUrl)} alt={project.title} fill className="object-cover" unoptimized />
                                </div>
                            ) : (
                                <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-3xl shrink-0 border border-white/10 bg-violet-500/15 flex items-center justify-center text-violet-300 text-4xl font-bold shadow-xl">
                                    {project.title.charAt(0)}
                                </div>
                            )}
                            {/* Title + meta + links */}
                            <div className="flex-1 min-w-0">
                                <div className="flex flex-wrap items-center gap-2 mb-1">
                                    {project.featured && (
                                        <span className="text-xs text-amber-400 font-medium border border-amber-500/30 px-2 py-0.5 rounded-full">
                                            ★ Featured
                                        </span>
                                    )}
                                </div>
                                <h1 className="text-2xl sm:text-3xl font-bold text-white mb-3 leading-tight">{project.title}</h1>
                                <p className="text-slate-400 text-sm leading-relaxed mb-5">{project.description}</p>
                                <div className="flex flex-wrap gap-2">
                                    {project.githubUrl && (
                                        <Link href={project.githubUrl} target="_blank" rel="noopener noreferrer"
                                            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-sm text-slate-300 hover:text-violet-400 hover:border-violet-500/40 transition-colors">
                                            <Github size={15} /> Source Code
                                        </Link>
                                    )}
                                    {project.liveUrl && (
                                        <Link href={project.liveUrl} target="_blank" rel="noopener noreferrer"
                                            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-violet-600/80 border border-violet-500/40 text-sm text-white hover:bg-violet-500 transition-colors">
                                            <ExternalLink size={15} /> Live Demo
                                        </Link>
                                    )}
                                    {project.otherLinks?.map((l) => (
                                        <Link key={l.url} href={l.url} target="_blank" rel="noopener noreferrer"
                                            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-sm text-slate-300 hover:text-cyan-400 hover:border-cyan-500/40 transition-colors">
                                            <LinkIcon size={14} /> {l.label}
                                        </Link>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </FadeIn>

                {/* Tech Stack */}
                <FadeIn delay={0.1}>
                    <div className="flex flex-wrap gap-2 mb-8">
                        {project.techStack.map((tech) => (
                            <span key={tech} className="px-3 py-1 rounded-full text-xs font-medium border border-violet-500/30 text-violet-300 bg-violet-500/10">
                                {tech}
                            </span>
                        ))}
                    </div>
                </FadeIn>

                {/* Description */}
                <FadeIn delay={0.2}>
                    <div className="glass-card p-6 mb-8">
                        <h2 className="text-lg font-semibold text-white mb-3">About this project</h2>
                        <p className="text-slate-400 leading-relaxed whitespace-pre-wrap">
                            {project.longDescription || project.description}
                        </p>
                    </div>
                </FadeIn>

                {/* Screenshots */}
                {project.screenshots && project.screenshots.length > 0 && (
                    <FadeIn delay={0.25}>
                        <h2 className="text-xl font-bold text-white mb-4">Screenshots</h2>
                        <div className="grid sm:grid-cols-2 gap-4">
                            {project.screenshots.map((src, i) => (
                                <a key={i} href={blobDisplayUrl(src)} target="_blank" rel="noopener noreferrer"
                                    className="relative block aspect-video rounded-xl overflow-hidden border border-white/10 hover:border-violet-500/50 transition-colors group">
                                    <Image src={blobDisplayUrl(src)} alt={`Screenshot ${i + 1}`} fill className="object-cover group-hover:scale-105 transition-transform duration-300" unoptimized />
                                </a>
                            ))}
                        </div>
                    </FadeIn>
                )}
            </div>
        </div>
    );
}
