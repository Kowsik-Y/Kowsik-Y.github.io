"use client";

import { useRouter } from "next/navigation";
import Image from "next/image";
import { useEffect, useMemo, useState } from "react";
import { Github, ExternalLink, Star, ArrowRight, ChevronLeft, ChevronRight, Images } from "lucide-react";
import { FilterDropdown } from "@/components/ui/filter-dropdown";
import FadeIn from "@/components/ui/fade-in";
import Breadcrumbs from "@/components/layout/Breadcrumbs";
import { sectionBreadcrumbs } from "@/lib/breadcrumbs";
import ProjectsCanvasClient from "@/components/three/ProjectsCanvasClient";
import { blobDisplayUrl } from "@/lib/blob-url";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import type { IProject } from "@/types";

type ProjectCardProps = {
    project: IProject;
    index: number;
    onPreview: (project: IProject) => void;
};

function ProjectCard({ project, index, onPreview }: ProjectCardProps) {
    const router = useRouter();

    const hasGallery = project.screenshots.length > 0 || Boolean(project.imageUrl);

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
                    <div className="flex items-start gap-4 mb-4">
                        {project.imageUrl ? (
                            <div className="relative w-14 h-14 rounded-2xl overflow-hidden shrink-0 border border-border/70 shadow-lg ui-surface">
                                <Image src={blobDisplayUrl(project.imageUrl)} alt={project.title} fill className="object-cover" unoptimized />
                            </div>
                        ) : (
                            <div className="w-14 h-14 rounded-2xl shrink-0 border border-border/70 bg-violet-500/10 flex items-center justify-center text-violet-700 dark:text-violet-300 text-xl font-bold shadow-lg">
                                {project.title.charAt(0)}
                            </div>
                        )}
                        <div className="flex-1 min-w-0 pt-0.5">
                            {project.featured && (
                                <div className="flex items-center gap-1 text-amber-400 text-xs font-medium mb-1">
                                    <Star size={11} fill="currentColor" /> Featured
                                </div>
                            )}
                            <h3 className="font-bold text-base text-foreground leading-snug">{project.title}</h3>
                        </div>
                    </div>
                    <div className="flex flex-col flex-1">
                        <p className="text-muted-foreground text-sm leading-relaxed mb-4 flex-1">{project.description}</p>
                        <div className="flex flex-wrap gap-1.5 mb-5">
                            {project.techStack.map((tech) => (
                                <span key={tech} className="ui-chip px-2 py-0.5 rounded-md text-xs font-medium">
                                    {tech}
                                </span>
                            ))}
                        </div>
                        <div className="flex items-center justify-between mt-auto pt-4 border-t border-border/50">
                            <div className="flex items-center gap-3" onClick={(e) => e.stopPropagation()}>
                                {project.githubUrl && (
                                    <a
                                        href={project.githubUrl}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-primary transition-colors"
                                    >
                                        <Github size={14} /> Source
                                    </a>
                                )}
                                {project.liveUrl && (
                                    <a
                                        href={project.liveUrl}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-accent transition-colors"
                                    >
                                        <ExternalLink size={14} /> Live
                                    </a>
                                )}
                                {hasGallery && (
                                    <button
                                        type="button"
                                        onClick={() => onPreview(project)}
                                        className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-primary transition-colors"
                                    >
                                        <Images size={14} /> Preview
                                    </button>
                                )}
                            </div>
                            <span className="flex items-center gap-1 text-xs text-primary group-hover:gap-2 transition-all">
                                Details <ArrowRight size={12} />
                            </span>
                        </div>
                    </div>
                </div>
            </div>
        </FadeIn>
    );
}

interface ProjectsPageClientProps {
    initialProjects: IProject[];
}

export default function ProjectsPageClient({ initialProjects }: ProjectsPageClientProps) {
    const [activeTech, setActiveTech] = useState("all");
    const [previewOpen, setPreviewOpen] = useState(false);
    const [previewProject, setPreviewProject] = useState<IProject | null>(null);
    const [activeImageIndex, setActiveImageIndex] = useState(0);

    const techOptions = useMemo(() => {
        const allTech = initialProjects.flatMap((project) => project.techStack);
        return ["all", ...Array.from(new Set(allTech))];
    }, [initialProjects]);

    const visibleProjects = useMemo(() => {
        if (activeTech === "all") return initialProjects;
        return initialProjects.filter((project) => project.techStack.includes(activeTech));
    }, [activeTech, initialProjects]);

    const previewImages = useMemo(() => {
        if (!previewProject) return [];

        const imageSet = [...previewProject.screenshots];
        if (previewProject.imageUrl && !imageSet.includes(previewProject.imageUrl)) {
            imageSet.unshift(previewProject.imageUrl);
        }

        return imageSet;
    }, [previewProject]);

    const openPreview = (project: IProject) => {
        setPreviewProject(project);
        setActiveImageIndex(0);
        setPreviewOpen(true);
    };

    const showNext = () => {
        setActiveImageIndex((prev) => (prev + 1) % Math.max(previewImages.length, 1));
    };

    const showPrevious = () => {
        setActiveImageIndex((prev) => {
            const total = Math.max(previewImages.length, 1);
            return (prev - 1 + total) % total;
        });
    };

    useEffect(() => {
        if (!previewOpen) return;

        const onKeyDown = (event: KeyboardEvent) => {
            if (event.key === "ArrowRight") {
                setActiveImageIndex((prev) => (prev + 1) % Math.max(previewImages.length, 1));
            }
            if (event.key === "ArrowLeft") {
                setActiveImageIndex((prev) => {
                    const total = Math.max(previewImages.length, 1);
                    return (prev - 1 + total) % total;
                });
            }
        };

        window.addEventListener("keydown", onKeyDown);
        return () => window.removeEventListener("keydown", onKeyDown);
    }, [previewOpen, previewImages.length]);

    return (
        <div className="relative">
            <div className="fixed inset-0 -z-10 opacity-20 pointer-events-none">
                <ProjectsCanvasClient />
            </div>
            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-28">
                <Breadcrumbs
                    className="mb-6"
                    items={sectionBreadcrumbs("Projects", "/projects")}
                />
                <FadeIn>
                    <div className="text-sm font-medium text-violet-400 uppercase tracking-widest">My Work</div>
                    <h1 className="text-4xl sm:text-5xl font-bold mb-4">
                        <span className="gradient-text">Projects</span>
                    </h1>
                    <p className="text-muted-foreground text-lg max-w-2xl mb-10">
                        A collection of things I&apos;ve built — from AI-powered apps to full-stack platforms.
                    </p>
                </FadeIn>

                <FadeIn delay={0.03}>
                    <div className="flex flex-col sm:flex-row items-center gap-4 mb-10 w-full z-10">
                        <FilterDropdown 
                            options={techOptions}
                            activeOption={activeTech}
                            onSelect={setActiveTech}
                            label="Filter by Stack"
                            allLabel="All Projects"
                        />
                        {activeTech !== "all" && (
                            <button
                                onClick={() => setActiveTech("all")}
                                className="px-4 py-2 text-sm text-muted-foreground hover:text-foreground hover:bg-black/5 dark:hover:bg-white/5 rounded-lg transition-colors border border-transparent hover:border-border/50"
                            >
                                Clear Filter
                            </button>
                        )}
                    </div>
                </FadeIn>

                {visibleProjects.length > 0 ? (
                    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                        {visibleProjects.map((project, index) => (
                            <ProjectCard key={project._id} project={project} index={index} onPreview={openPreview} />
                        ))}
                    </div>
                ) : (
                    <div className="glass-card p-12 text-center text-muted-foreground">
                        {initialProjects.length === 0
                            ? "No projects yet. You can still explore blogs, certifications, and achievements."
                            : "No projects match this stack yet. Try another filter."}
                    </div>
                )}
            </div>

            <Dialog open={previewOpen} onOpenChange={setPreviewOpen}>
                <DialogContent className="sm:max-w-4xl p-4 sm:p-6 ui-surface-strong">
                    <DialogHeader>
                        <DialogTitle>{previewProject?.title ?? "Project Preview"}</DialogTitle>
                        <DialogDescription>
                            Use arrow keys to navigate project screenshots.
                        </DialogDescription>
                    </DialogHeader>

                    {previewImages.length > 0 ? (
                        <div className="space-y-4">
                            <div className="relative aspect-video rounded-xl overflow-hidden border border-border/70 ui-surface">
                                <Image
                                    src={blobDisplayUrl(previewImages[activeImageIndex])}
                                    alt={`${previewProject?.title ?? "Project"} preview ${activeImageIndex + 1}`}
                                    fill
                                    unoptimized
                                    className="object-cover"
                                />

                                {previewImages.length > 1 && (
                                    <>
                                        <button
                                            type="button"
                                            onClick={showPrevious}
                                            className="absolute left-3 top-1/2 -translate-y-1/2 rounded-full ui-surface-strong p-2 text-foreground hover:text-primary"
                                            aria-label="Previous screenshot"
                                        >
                                            <ChevronLeft size={18} />
                                        </button>
                                        <button
                                            type="button"
                                            onClick={showNext}
                                            className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full ui-surface-strong p-2 text-foreground hover:text-primary"
                                            aria-label="Next screenshot"
                                        >
                                            <ChevronRight size={18} />
                                        </button>
                                    </>
                                )}
                            </div>

                            {previewImages.length > 1 && (
                                <div className="flex flex-wrap gap-2">
                                    {previewImages.map((img, index) => (
                                        <button
                                            key={`${img}-${index}`}
                                            type="button"
                                            onClick={() => setActiveImageIndex(index)}
                                            className={`relative h-14 w-24 overflow-hidden rounded-md border ${activeImageIndex === index ? "border-primary" : "border-border/70"}`}
                                            aria-label={`View screenshot ${index + 1}`}
                                        >
                                            <Image src={blobDisplayUrl(img)} alt="Project thumbnail" fill className="object-cover" unoptimized />
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>
                    ) : (
                        <div className="rounded-lg border border-border/70 p-8 text-sm text-muted-foreground text-center">
                            This project does not include preview images yet.
                        </div>
                    )}
                </DialogContent>
            </Dialog>
        </div>
    );
}
