import type { Metadata } from "next";
import { cache } from "react";
import dbConnect from "@/lib/db";
import Project from "@/models/Project";
import ProjectDetailContent from "./ProjectDetailContent";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://kowsik.me";

type ProjectSeoData = {
    _id?: string;
    title?: string;
    description?: string;
    longDescription?: string;
    techStack?: string[];
    imageUrl?: string;
    liveUrl?: string;
    githubUrl?: string;
    createdAt?: string | Date;
    updatedAt?: string | Date;
};

const getProjectSeoData = cache(async (id: string): Promise<ProjectSeoData | null> => {
    await dbConnect();
    const project = await Project.findById(id).lean();
    return project as ProjectSeoData | null;
});

export async function generateMetadata(
    { params }: { params: Promise<{ id: string }> }
): Promise<Metadata> {
    try {
        const { id } = await params;
        const project = await getProjectSeoData(id);

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

export default async function ProjectDetailPage(
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params;
    const project = await getProjectSeoData(id);

    const breadcrumbJsonLd = {
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        itemListElement: [
            {
                "@type": "ListItem",
                position: 1,
                name: "Home",
                item: siteUrl,
            },
            {
                "@type": "ListItem",
                position: 2,
                name: "Projects",
                item: `${siteUrl}/projects`,
            },
            {
                "@type": "ListItem",
                position: 3,
                name: project?.title || "Project",
                item: `${siteUrl}/projects/${id}`,
            },
        ],
    };

    const projectJsonLd = {
        "@context": "https://schema.org",
        "@type": "CreativeWork",
        name: project?.title || "Project",
        description: project?.longDescription || project?.description || "Project details",
        url: `${siteUrl}/projects/${id}`,
        image: project?.imageUrl ? [project.imageUrl] : undefined,
        keywords: project?.techStack,
        creator: {
            "@type": "Person",
            name: "Kowsik Y",
            url: siteUrl,
        },
        datePublished: project?.createdAt ? new Date(project.createdAt).toISOString() : undefined,
        dateModified: project?.updatedAt ? new Date(project.updatedAt).toISOString() : undefined,
        codeRepository: project?.githubUrl,
        isBasedOn: project?.liveUrl,
    };

    const techSummary = project?.techStack?.length
        ? project.techStack.join(", ")
        : "Modern web technologies";

    const faqItems = [
        {
            q: `What is ${project?.title || "this project"} about?`,
            a: project?.description || "This project showcases practical full-stack and AI-focused engineering work.",
        },
        {
            q: "What technologies were used?",
            a: `This project uses ${techSummary}.`,
        },
        project?.githubUrl
            ? {
                q: "Where can I view the source code?",
                a: `Source code is available at ${project.githubUrl}.`,
            }
            : null,
        project?.liveUrl
            ? {
                q: "Is there a live demo available?",
                a: `Yes. You can explore the live demo at ${project.liveUrl}.`,
            }
            : null,
    ].filter(Boolean) as Array<{ q: string; a: string }>;

    const faqJsonLd = {
        "@context": "https://schema.org",
        "@type": "FAQPage",
        mainEntity: faqItems.map((item) => ({
            "@type": "Question",
            name: item.q,
            acceptedAnswer: {
                "@type": "Answer",
                text: item.a,
            },
        })),
    };

    return (
        <>
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
            />
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(projectJsonLd) }}
            />
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
            />
            <ProjectDetailContent />
        </>
    );
}


