"use client";

import { useMemo, useState } from "react";
import useSWR from "swr";
import { useParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { Github, ExternalLink, Link as LinkIcon, ChevronLeft, ChevronRight, X } from "lucide-react";
import FadeIn from "@/components/ui/fade-in";
import { blobDisplayUrl } from "@/lib/blob-url";
import type { IProject } from "@/types";
import BentoCard from "@/components/ui/BentoCard";
import MagneticButton from "@/components/ui/MagneticButton";
import ImageReveal from "@/components/ui/ImageReveal";

const fetcher = (url: string) => fetch(url).then((r) => r.json());

export default function ProjectDetailContent() {
    const { id } = useParams<{ id: string }>();
    const { data: project, isLoading } = useSWR<IProject>(
        id ? `/api/projects/${id}` : null,
        fetcher
    );
    const [activeScreenshot, setActiveScreenshot] = useState(0);
    const [lightboxOpen, setLightboxOpen] = useState(false);

    const screenshots = useMemo(() => project?.screenshots ?? [], [project?.screenshots]);

    const hasScreenshots = screenshots.length > 0;
    const currentIndex = Math.min(activeScreenshot, Math.max(screenshots.length - 1, 0));

    const goPrev = () => {
        if (!hasScreenshots) return;
        setActiveScreenshot((prev) => (prev - 1 + screenshots.length) % screenshots.length);
    };

    const goNext = () => {
        if (!hasScreenshots) return;
        setActiveScreenshot((prev) => (prev + 1) % screenshots.length);
    };

    if (isLoading) {
        return (
            <div className="relative min-h-screen pt-32 pb-20 dot-pattern">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="bg-card border border-border rounded-[2rem] p-8 animate-pulse h-96" />
                </div>
            </div>
        );
    }

    if (!project) {
        return (
            <div className="relative min-h-screen pt-32 pb-20 dot-pattern flex items-center justify-center">
                <div className="text-center">
                    <p className="text-muted-foreground mb-6">Project not found.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen pt-32 pb-20 dot-pattern">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                
                {/* Hero */}
                <FadeIn delay={0.05}>
                    <BentoCard className="p-8 sm:p-10 mb-8">
                        <div className="flex flex-col sm:flex-row sm:items-start gap-8">
                            {/* App icon */}
                            {project.imageUrl ? (
                                <div className="relative w-28 h-28 sm:w-32 sm:h-32 shrink-0">
                                    <ImageReveal 
                                        src={blobDisplayUrl(project.imageUrl)} 
                                        alt={project.title} 
                                        aspectRatio="square"
                                        className="w-full h-full object-cover"
                                        containerClassName="w-full h-full rounded-[calc(var(--radius-3xl)-0.5rem)]"
                                    />
                                </div>
                            ) : (
                                <div className="w-28 h-28 sm:w-32 sm:h-32 shrink-0 rounded-[calc(var(--radius-3xl)-0.5rem)] bg-secondary flex items-center justify-center text-foreground text-4xl font-bold">
                                    {project.title.charAt(0)}
                                </div>
                            )}
                            
                            {/* Title + meta + links */}
                            <div className="flex-1 min-w-0">
                                <div className="flex flex-wrap items-center gap-2 mb-3">
                                    {project.featured && (
                                        <span className="text-[10px] font-bold uppercase tracking-wide bg-foreground text-background px-2.5 py-1 rounded-full">
                                            Featured
                                        </span>
                                    )}
                                </div>
                                <h1 className="text-3xl sm:text-4xl font-bold text-foreground mb-4 leading-tight">{project.title}</h1>
                                <p className="text-muted-foreground text-base leading-relaxed mb-8 max-w-xl">{project.description}</p>
                                
                                <div className="flex flex-wrap gap-3">
                                    {project.githubUrl && (
                                        <MagneticButton 
                                            as="a" 
                                            href={project.githubUrl} 
                                            target="_blank" 
                                            rel="noopener noreferrer"
                                            className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-secondary border border-border text-sm font-bold hover:bg-foreground hover:text-background transition-colors"
                                        >
                                            <Github size={16} /> Source Code
                                        </MagneticButton>
                                    )}
                                    {project.liveUrl && (
                                        <MagneticButton 
                                            as="a" 
                                            href={project.liveUrl} 
                                            target="_blank" 
                                            rel="noopener noreferrer"
                                            className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-foreground text-background text-sm font-bold transition-transform hover:scale-[0.98]"
                                        >
                                            <ExternalLink size={16} /> Live Demo
                                        </MagneticButton>
                                    )}
                                </div>
                            </div>
                        </div>
                    </BentoCard>
                </FadeIn>

                {/* Tech Stack */}
                <FadeIn delay={0.1}>
                    <div className="flex flex-wrap gap-2 mb-8">
                        {project.techStack.map((tech) => (
                            <span key={tech} className="px-4 py-2 rounded-full text-xs font-bold uppercase tracking-wide border border-border bg-background">
                                {tech}
                            </span>
                        ))}
                    </div>
                </FadeIn>

                {/* Description */}
                <FadeIn delay={0.2}>
                    <BentoCard className="p-8 sm:p-10 mb-8">
                        <h2 className="text-sm font-bold text-muted-foreground uppercase tracking-widest mb-6">About this project</h2>
                        <div className="prose prose-sm dark:prose-invert max-w-none text-base leading-loose whitespace-pre-wrap">
                            {project.longDescription || project.description}
                        </div>
                    </BentoCard>
                </FadeIn>

                {/* Screenshots */}
                {hasScreenshots && (
                    <FadeIn delay={0.25}>
                        <h2 className="text-sm font-bold text-muted-foreground uppercase tracking-widest mb-6 pl-2">Screenshots</h2>
                        <BentoCard className="p-6">
                            <div className="relative aspect-video rounded-2xl overflow-hidden bg-secondary group">
                                <button
                                    type="button"
                                    onClick={(e) => {
                                        e.preventDefault();
                                        setLightboxOpen(true);
                                    }}
                                    className="absolute inset-0 block w-full outline-none"
                                >
                                    <ImageReveal
                                        src={blobDisplayUrl(screenshots[currentIndex])}
                                        alt={`Screenshot ${currentIndex + 1}`}
                                        aspectRatio="video"
                                        className="w-full h-full object-cover group-hover:scale-[1.02] transition-transform duration-500"
                                        containerClassName="w-full h-full"
                                    />
                                </button>

                                {screenshots.length > 1 && (
                                    <>
                                        <button
                                            type="button"
                                            onClick={goPrev}
                                            className="absolute left-4 top-1/2 -translate-y-1/2 z-10 w-10 h-10 rounded-full bg-background/50 backdrop-blur-md border border-border text-foreground hover:bg-background transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100"
                                        >
                                            <ChevronLeft size={20} />
                                        </button>
                                        <button
                                            type="button"
                                            onClick={goNext}
                                            className="absolute right-4 top-1/2 -translate-y-1/2 z-10 w-10 h-10 rounded-full bg-background/50 backdrop-blur-md border border-border text-foreground hover:bg-background transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100"
                                        >
                                            <ChevronRight size={20} />
                                        </button>
                                    </>
                                )}
                            </div>

                            {screenshots.length > 1 && (
                                <div className="mt-6 flex gap-3 overflow-x-auto pb-2 px-1">
                                    {screenshots.map((src, i) => (
                                        <button
                                            key={i}
                                            type="button"
                                            onClick={() => setActiveScreenshot(i)}
                                            className={`relative h-20 w-32 shrink-0 overflow-hidden rounded-xl border-2 transition-all ${
                                                i === currentIndex
                                                    ? "border-foreground scale-105"
                                                    : "border-transparent opacity-50 hover:opacity-100 hover:border-border"
                                            }`}
                                        >
                                            <Image
                                                src={blobDisplayUrl(src)}
                                                alt={`Thumbnail ${i + 1}`}
                                                fill
                                                className="object-cover"
                                                unoptimized
                                            />
                                        </button>
                                    ))}
                                </div>
                            )}
                        </BentoCard>
                    </FadeIn>
                )}
            </div>

            {lightboxOpen && hasScreenshots && (
                <div className="fixed inset-0 z-50 bg-background/90 backdrop-blur-md flex items-center justify-center p-4 sm:p-8">
                    <button
                        type="button"
                        onClick={() => setLightboxOpen(false)}
                        className="absolute top-6 right-6 w-12 h-12 rounded-full bg-secondary border border-border text-foreground hover:bg-foreground hover:text-background transition-colors flex items-center justify-center z-50"
                    >
                        <X size={20} />
                    </button>

                    {screenshots.length > 1 && (
                        <button
                            type="button"
                            onClick={goPrev}
                            className="absolute left-6 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-secondary border border-border text-foreground hover:bg-foreground hover:text-background transition-colors flex items-center justify-center z-50 hidden sm:flex"
                        >
                            <ChevronLeft size={24} />
                        </button>
                    )}

                    <div className="relative w-full max-w-7xl aspect-video rounded-3xl overflow-hidden border border-border shadow-2xl bg-secondary">
                        <Image
                            src={blobDisplayUrl(screenshots[currentIndex])}
                            alt={`Screenshot ${currentIndex + 1}`}
                            fill
                            className="object-contain"
                            unoptimized
                        />
                    </div>

                    {screenshots.length > 1 && (
                        <button
                            type="button"
                            onClick={goNext}
                            className="absolute right-6 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-secondary border border-border text-foreground hover:bg-foreground hover:text-background transition-colors flex items-center justify-center z-50 hidden sm:flex"
                        >
                            <ChevronRight size={24} />
                        </button>
                    )}
                </div>
            )}
        </div>
    );
}
