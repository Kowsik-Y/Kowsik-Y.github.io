import dbConnect from "@/lib/db";
import Project from "@/models/Project";
import ProjectsPageClient from "@/components/portfolio/ProjectsPageClient";
import type { IProject } from "@/types";
import { buildProjectSlug } from "@/lib/project-slug";
import type { Metadata } from "next";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://kowsik.me";

export const metadata: Metadata = {
  title: "Generative AI Projects | Kowsik Y",
  description: "Browse state-of-the-art Generative AI projects built by Kowsik Y, including LLM agents, RAG pipelines, and intelligent chatbots.",
  alternates: {
    canonical: `${siteUrl}/genai-projects`,
  },
  openGraph: {
    title: "Generative AI Projects | Kowsik Y",
    description: "Browse state-of-the-art Generative AI projects built by Kowsik Y.",
    url: `${siteUrl}/genai-projects`,
    images: [{ url: `${siteUrl}/og-default.svg`, width: 1200, height: 630, alt: "Generative AI Projects" }],
    type: "website",
  },
};

export const revalidate = 300;

type ProjectLean = {
    _id: { toString(): string };
    slug?: string;
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

export default async function GenAiProjectsPage() {
    await dbConnect();
    const allProjects = await Project.find({}).sort({ order: 1, createdAt: -1 }).lean() as ProjectLean[];

    // Ensure slugs are created
    await Promise.all(allProjects.map(async (doc) => {
        if (!doc.slug) {
            const generatedSlug = buildProjectSlug(doc.title, doc._id.toString());
            await Project.findByIdAndUpdate(doc._id, { slug: generatedSlug });
            doc.slug = generatedSlug;
        }
    }));

    const genAiKeywords = ["genai", "llm", "large language model", "openai", "gpt", "rag", "langchain", "llama", "chatbot", "agent", "gemini", "claude"];
    
    // Filter projects locally
    const filteredDocs = allProjects.filter(doc => {
       const techStr = ((doc.title || "") + " " + (doc.description || "") + " " + (doc.techStack || []).join(" ")).toLowerCase();
       return genAiKeywords.some(kw => techStr.includes(kw));
    });

    const initialProjects: IProject[] = filteredDocs.map((doc) => ({
        _id: doc._id.toString(),
        slug: doc.slug,
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

    return <ProjectsPageClient initialProjects={initialProjects} />;
}
