import type { Metadata } from "next";
import { cache } from "react";
import dbConnect from "@/lib/db";
import Project from "@/models/Project";
import Breadcrumbs from "@/components/layout/Breadcrumbs";
import { detailBreadcrumbs } from "@/lib/breadcrumbs";
import ProjectDetailContent from "./ProjectDetailContent";
import { permanentRedirect } from "next/navigation";
import { blobDisplayUrl } from "@/lib/blob-url";
import {
    buildProjectSlug,
    isObjectIdLike,
    projectPath,
} from "@/lib/project-slug";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://kowsik.me";

type ProjectSeoData = {
    _id?: string;
    slug?: string;
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

    const project = isObjectIdLike(id)
        ? await Project.findById(id).lean()
        : await Project.findOne({ slug: id }).lean();

    if (!project) return null;

    const typedProject = project as ProjectSeoData;
    if (!typedProject.slug && typedProject._id) {
        const generatedSlug = buildProjectSlug(typedProject.title, typedProject._id);
        await Project.findByIdAndUpdate(typedProject._id, { slug: generatedSlug });
        typedProject.slug = generatedSlug;
    }

    return typedProject;
});


function createSoftwareApplicationJsonLd(project: ProjectSeoData, publicSlug: string) {
    const canonicalUrl = `${siteUrl}/projects/${publicSlug}`;
    const ogImage = project.imageUrl ? [blobDisplayUrl(project.imageUrl)] : [];

    return {
        "@context": "https://schema.org",
        "@type": "SoftwareApplication",
        name: project.title,
        description: project.description,
        applicationCategory: "WebApplication",
        operatingSystem: "Web",
        url: project.liveUrl || canonicalUrl,
        author: {
            "@type": "Person",
            name: "Kowsik Y",
            url: siteUrl
        },
        image: ogImage,
        datePublished: project.createdAt ? new Date(project.createdAt).toISOString() : new Date().toISOString(),
        dateModified: project.updatedAt ? new Date(project.updatedAt).toISOString() : new Date().toISOString(),
    };
}

export async function generateMetadata(
    { params }: { params: Promise<{ id: string }> }
): Promise<Metadata> {
    try {
        const { id: slugOrId } = await params;
        const project = await getProjectSeoData(slugOrId);

        if (!project) return { title: "Project Not Found" };

        const projectId = project._id || slugOrId;
        const publicSlug = project.slug || buildProjectSlug(project.title, projectId);
        const canonicalPath = projectPath({ _id: projectId, title: project.title, slug: publicSlug });

        const ogImage = project.imageUrl
            ? [{ url: blobDisplayUrl(project.imageUrl), alt: project.title }]
            : [{ url: `${siteUrl}/og-default.svg`, alt: "Kowsik Y Project" }];

        return {
            title: project.title,
            description: project.description,
            keywords: project.techStack,
            openGraph: {
                title: `${project.title} — Kowsik Y`,
                description: project.description,
                url: `${siteUrl}${canonicalPath}`,
                type: "website",
                siteName: "Kowsik Y",
                images: ogImage,
            },
            twitter: {
                title: `${project.title} — Kowsik Y`,
                description: project.description,
                card: "summary_large_image",
                images: ogImage?.map((image) => image.url),
            },
            alternates: {
                canonical: `${siteUrl}${canonicalPath}`,
            },
        };
    } catch {
        return { title: "Project" };
    }
}

export default async function ProjectDetailPage(
    { params }: { params: Promise<{ id: string }> }
) {
    const { id: slugOrId } = await params;
    const project = await getProjectSeoData(slugOrId);

    const projectId = project?._id || slugOrId;
    const publicSlug = project
        ? (project.slug || buildProjectSlug(project.title, projectId))
        : slugOrId;

    if (project && isObjectIdLike(slugOrId) && publicSlug !== slugOrId) {
        permanentRedirect(projectPath({ _id: projectId, title: project.title, slug: publicSlug }));
    }

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
                item: `${siteUrl}/projects/${publicSlug}`,
            },
        ],
    };

    const projectJsonLd = {
        "@context": "https://schema.org",
        "@type": "CreativeWork",
        name: project?.title || "Project",
        description: project?.longDescription || project?.description || "Project details",
        url: `${siteUrl}/projects/${publicSlug}`,
        image: project?.imageUrl ? [blobDisplayUrl(project.imageUrl)] : undefined,
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

    const softwareApplicationJsonLd = project
        ? createSoftwareApplicationJsonLd(project, publicSlug)
        : null;

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
            {softwareApplicationJsonLd && (
                <script
                    type="application/ld+json"
                    dangerouslySetInnerHTML={{ __html: JSON.stringify(softwareApplicationJsonLd) }}
                />
            )}
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
            />
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-28 pb-2">
                <Breadcrumbs
                    items={detailBreadcrumbs("Projects", "/projects", project?.title || "Project", `/projects/${publicSlug}`)}
                />
            </div>
            <ProjectDetailContent />
        </>
    );
}


