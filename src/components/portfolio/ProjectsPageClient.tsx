"use client";

import { useRouter } from "next/navigation";
import Image from "next/image";
import { useEffect, useMemo, useState } from "react";
import { Github, ExternalLink, Star, ArrowUpRight, Images, X, ChevronLeft, ChevronRight } from "lucide-react";
import { FilterDropdown } from "@/components/ui/filter-dropdown";
import Breadcrumbs from "@/components/layout/Breadcrumbs";
import { sectionBreadcrumbs } from "@/lib/breadcrumbs";
import { blobDisplayUrl } from "@/lib/blob-url";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import type { IProject } from "@/types";
import { projectPath } from "@/lib/project-slug";
import BentoCard from "@/components/ui/BentoCard";
import ImageReveal from "@/components/ui/ImageReveal";
import MagneticButton from "@/components/ui/MagneticButton";

type ProjectCardProps = {
    project: IProject;
    index: number;
    onPreview: (project: IProject) => void;
};

function ProjectCard({ project, index, onPreview }: ProjectCardProps) {
    const router = useRouter();
    const projectHref = projectPath({
        _id: project._id,
        title: project.title,
        slug: project.slug,
    });

    const hasGallery = project.screenshots.length > 0 || Boolean(project.imageUrl);

    return (
        <BentoCard 
            interactive 
            delay={index * 0.05} 
            className={`flex flex-col group h-full ${project.featured ? "md:col-span-2 !bg-foreground !text-background" : "bg-card"}`}
        >
            <div 
                role="link"
                tabIndex={0}
                onClick={() => router.push(projectHref)}
                onKeyDown={(e) => e.key === "Enter" && router.push(projectHref)}
                className="flex-1 flex flex-col p-6 outline-none"
            >
                {/* Header */}
                <div className="flex items-start gap-5 mb-6">
                    {project.imageUrl && (
                        <div className="relative w-16 h-16 shrink-0 rounded-2xl overflow-hidden bg-secondary border border-border/50" onClick={(e) => e.stopPropagation()}>
                             <Image 
                                src={blobDisplayUrl(project.imageUrl)} 
                                alt={project.title} 
                                fill
                                className={`object-cover transition-transform duration-500 group-hover:scale-110`}
                                unoptimized
                            />
                        </div>
                    )}
                    <div className="flex-1 min-w-0">
                        {project.featured && (
                            <div className="flex items-center gap-1.5 text-background/70 text-xs font-bold uppercase tracking-wider mb-2">
                                <Star size={12} fill="currentColor" /> Featured
                            </div>
                        )}
                        <h3 className="font-bold text-xl sm:text-2xl leading-tight mb-2 group-hover:opacity-80 transition-opacity truncate">
                            {project.title}
                        </h3>
                        <div className="flex flex-wrap gap-1.5">
                            {project.techStack.slice(0, 3).map((tech) => (
                                <span key={tech} className={`px-2 py-1 rounded-md text-[10px] font-bold uppercase tracking-wide ${
                                    project.featured ? "bg-background/10 border border-background/20" : "bg-secondary text-secondary-foreground"
                                }`}>
                                    {tech}
                                </span>
                            ))}
                            {project.techStack.length > 3 && (
                                <span className={`px-2 py-1 rounded-md text-[10px] font-bold uppercase tracking-wide ${
                                    project.featured ? "bg-background/10 border border-background/20" : "bg-secondary text-secondary-foreground"
                                }`}>
                                    +{project.techStack.length - 3}
                                </span>
                            )}
                        </div>
                    </div>
                    
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 transition-transform duration-500 group-hover:scale-110 ${
                        project.featured ? "bg-background text-foreground" : "bg-foreground text-background"
                    }`}>
                        <ArrowUpRight size={18} />
                    </div>
                </div>

                {/* Description */}
                <p className={`text-sm leading-relaxed mb-6 flex-1 ${
                    project.featured ? "text-background/80" : "text-muted-foreground"
                }`}>
                    {project.description}
                </p>



                {/* Footer Actions */}
                <div className="mt-auto flex items-center gap-3 pt-4 border-t border-border/50" onClick={(e) => e.stopPropagation()}>
                    {project.githubUrl && (
                        <MagneticButton 
                            as="a"
                            href={project.githubUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            strength={10}
                            className={`flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-lg transition-colors ${
                                project.featured ? "hover:bg-background/10" : "hover:bg-secondary"
                            }`}
                        >
                            <Github size={14} /> Source
                        </MagneticButton>
                    )}
                    {project.liveUrl && (
                        <MagneticButton 
                            as="a"
                            href={project.liveUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            strength={10}
                            className={`flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-lg transition-colors ${
                                project.featured ? "hover:bg-background/10" : "hover:bg-secondary"
                            }`}
                        >
                            <ExternalLink size={14} /> Live
                        </MagneticButton>
                    )}
                    {hasGallery && (
                        <MagneticButton 
                            as="button"
                            onClick={() => onPreview(project)}
                            strength={10}
                            className={`flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-lg transition-colors ${
                                project.featured ? "hover:bg-background/10" : "hover:bg-secondary"
                            }`}
                        >
                            <Images size={14} /> Gallery
                        </MagneticButton>
                    )}
                </div>
            </div>
        </BentoCard>
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

    return (
        <div className="min-h-screen pt-32 pb-20 dot-pattern">
            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
                
                <div className="mb-12 flex flex-col md:flex-row md:items-end justify-between gap-6">
                    <div>
                        <h1 className="text-4xl sm:text-5xl font-bold tracking-tight mb-4">Selected Work</h1>
                        <p className="text-muted-foreground text-lg max-w-xl">
                            A showcase of intelligent systems, full-stack applications, and experimental projects.
                        </p>
                    </div>
                    
                    <div className="flex items-center gap-3">
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
                                className="px-4 py-2 text-sm font-medium rounded-full border border-border hover:bg-foreground hover:text-background transition-colors"
                            >
                                Clear
                            </button>
                        )}
                    </div>
                </div>

                {visibleProjects.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {visibleProjects.map((project, index) => (
                            <ProjectCard key={project._id} project={project} index={index} onPreview={openPreview} />
                        ))}
                    </div>
                ) : (
                    <div className="p-12 text-center text-muted-foreground bg-card rounded-3xl border border-border">
                        {initialProjects.length === 0
                            ? "No projects available yet."
                            : "No projects match this stack. Try another filter."}
                    </div>
                )}
            </div>

            {/* Premium Gallery Dialog */}
            <Dialog open={previewOpen} onOpenChange={setPreviewOpen}>
                <DialogContent className="sm:max-w-5xl p-0 overflow-hidden bg-background border-border rounded-3xl">
                    <DialogHeader className="p-6 pb-0 absolute top-0 left-0 right-0 z-50 flex flex-row items-center justify-between bg-linear-to-b from-background/80 to-transparent">
                        <DialogTitle className="text-lg font-bold">{previewProject?.title}</DialogTitle>
                    </DialogHeader>

                    {previewImages.length > 0 ? (
                        <div className="relative aspect-video w-full bg-secondary mt-12">
                            <Image
                                src={blobDisplayUrl(previewImages[activeImageIndex])}
                                alt={`${previewProject?.title} screenshot`}
                                fill
                                unoptimized
                                className="object-contain"
                            />

                            {previewImages.length > 1 && (
                                <>
                                    <button
                                        onClick={() => setActiveImageIndex((prev) => (prev - 1 + previewImages.length) % previewImages.length)}
                                        className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-background/50 backdrop-blur-md border border-border flex items-center justify-center hover:bg-background transition-colors"
                                    >
                                        <ChevronLeft size={20} />
                                    </button>
                                    <button
                                        onClick={() => setActiveImageIndex((prev) => (prev + 1) % previewImages.length)}
                                        className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-background/50 backdrop-blur-md border border-border flex items-center justify-center hover:bg-background transition-colors"
                                    >
                                        <ChevronRight size={20} />
                                    </button>
                                </>
                            )}
                        </div>
                    ) : (
                        <div className="p-12 text-center text-muted-foreground">No images available</div>
                    )}
                    
                    {previewImages.length > 1 && (
                        <div className="p-4 flex flex-wrap gap-2 justify-center bg-card">
                            {previewImages.map((img, index) => (
                                <button
                                    key={index}
                                    onClick={() => setActiveImageIndex(index)}
                                    className={`relative w-16 h-10 rounded-md overflow-hidden transition-all ${
                                        activeImageIndex === index ? "ring-2 ring-foreground scale-110 z-10" : "opacity-50 hover:opacity-100"
                                    }`}
                                >
                                    <Image src={blobDisplayUrl(img)} alt="Thumbnail" fill className="object-cover" unoptimized />
                                </button>
                            ))}
                        </div>
                    )}
                </DialogContent>
            </Dialog>
        </div>
    );
}