import dbConnect from "@/lib/db";
import Project from "@/models/Project";
import ProjectsPageClient from "@/components/portfolio/ProjectsPageClient";
import type { IProject } from "@/types";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://kowsik.me";

export const revalidate = 300;

type ProjectLean = {
    _id: { toString(): string };
    title: string;
    description: string;
    longDescription?: string;
    techStack?: string[];
    githubUrl?: string;
    liveUrl?: string;
    otherLinks?: { label: string; url: string }[];
    imageUrl?: string;
    screenshots?: string[];
    featured?: boolean;
    order?: number;
    createdAt?: Date;
};

export default async function ProjectsPage() {
    await dbConnect();

    const projectDocs = (await Project.find({}).sort({ order: 1, createdAt: -1 }).lean()) as ProjectLean[];

    const initialProjects: IProject[] = projectDocs.map((doc) => ({
        _id: doc._id.toString(),
        title: doc.title,
        description: doc.description,
        longDescription: doc.longDescription,
        techStack: doc.techStack ?? [],
        githubUrl: doc.githubUrl,
        liveUrl: doc.liveUrl,
        otherLinks: doc.otherLinks ?? [],
        imageUrl: doc.imageUrl,
        screenshots: doc.screenshots ?? [],
        featured: doc.featured ?? false,
        order: doc.order ?? 0,
        createdAt: doc.createdAt?.toISOString(),
    }));

    const projectsItemListJsonLd = {
        "@context": "https://schema.org",
        "@type": "ItemList",
        name: "Projects",
        itemListOrder: "https://schema.org/ItemListOrderAscending",
        itemListElement: initialProjects.map((project, index) => ({
            "@type": "ListItem",
            position: index + 1,
            name: project.title,
            url: `${siteUrl}/projects/${project._id}`,
        })),
    };

    return (
        <>
            <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(projectsItemListJsonLd) }} />
            <ProjectsPageClient initialProjects={initialProjects} />
        </>
    );
}
