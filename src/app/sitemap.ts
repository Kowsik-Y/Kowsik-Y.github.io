import type { MetadataRoute } from "next";
import dbConnect from "@/lib/db";
import Project from "@/models/Project";
import Blog from "@/models/Blog";
import { buildProjectSlug } from "@/lib/project-slug";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://kowsik.me";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: siteUrl,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 1.0,
    },
    {
      url: `${siteUrl}/about`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.8,
    },
    {
      url: `${siteUrl}/projects`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.9,
    },
    {
      url: `${siteUrl}/blogs`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.85,
    },
    {
      url: `${siteUrl}/achievements`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.7,
    },
    {
      url: `${siteUrl}/certifications`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.7,
    },
    {
      url: `${siteUrl}/contact`,
      lastModified: new Date(),
      changeFrequency: "yearly",
      priority: 0.6,
    },
  ];

  try {
    await dbConnect();
    const [projects, blogs] = await Promise.all([
      Project.find({})
        .select("_id title slug updatedAt createdAt")
        .lean(),
      Blog.find({ published: true })
        .select("_id slug updatedAt createdAt")
        .lean(),
    ]);

    const projectRoutes: MetadataRoute.Sitemap = projects.map((p) => {
      const doc = p as {
        _id: { toString(): string };
        title?: string;
        slug?: string;
        updatedAt?: Date;
        createdAt?: Date;
      };
      const projectId = doc._id.toString();
      const publicSlug = doc.slug || buildProjectSlug(doc.title, projectId);

      if (!doc.slug) {
        void Project.findByIdAndUpdate(projectId, { slug: publicSlug });
      }

      return {
        url: `${siteUrl}/projects/${publicSlug}`,
        lastModified: doc.updatedAt ?? doc.createdAt ?? new Date(),
        changeFrequency: "monthly" as const,
        priority: 0.8,
      };
    });

    const blogRoutes: MetadataRoute.Sitemap = blogs.map((b) => {
      const doc = b as { _id: unknown; slug?: string; updatedAt?: Date; createdAt?: Date };
      return {
        url: `${siteUrl}/blogs/${doc.slug || doc._id}`,
        lastModified: doc.updatedAt ?? doc.createdAt ?? new Date(),
        changeFrequency: "monthly" as const,
        priority: 0.75,
      };
    });

    return [...staticRoutes, ...projectRoutes, ...blogRoutes];
  } catch {
    // If DB is unavailable during build, return static routes only
    return staticRoutes;
  }
}
