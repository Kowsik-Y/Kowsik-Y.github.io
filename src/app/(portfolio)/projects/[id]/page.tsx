import type { Metadata } from "next";
import dbConnect from "@/lib/db";
import Project from "@/models/Project";
import ProjectDetailContent from "./ProjectDetailContent";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://kowsik.dev";

export async function generateMetadata(
    { params }: { params: Promise<{ id: string }> }
): Promise<Metadata> {
    try {
        await dbConnect();
        const { id } = await params;
        const project = await Project.findById(id).lean() as {
            title?: string;
            description?: string;
            techStack?: string[];
            imageUrl?: string;
        } | null;

        if (!project) return { title: "Project Not Found" };

        const ogImage = project.imageUrl
            ? [{ url: project.imageUrl, alt: project.title }]
            : undefined;

        return {
            title: project.title,
            description: project.description,
            keywords: project.techStack,
            openGraph: {
                title: `${project.title} — Kowsik Y`,
                description: project.description,
                url: `${siteUrl}/projects/${id}`,
                type: "article",
                images: ogImage,
            },
            twitter: {
                title: `${project.title} — Kowsik Y`,
                description: project.description,
                card: "summary_large_image",
            },
            alternates: {
                canonical: `${siteUrl}/projects/${id}`,
            },
        };
    } catch {
        return { title: "Project" };
    }
}

export default function ProjectDetailPage() {
    return <ProjectDetailContent />;
}


