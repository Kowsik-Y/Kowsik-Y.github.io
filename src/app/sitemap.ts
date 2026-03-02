import type { MetadataRoute } from "next";
import dbConnect from "@/lib/db";
import Project from "@/models/Project";

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
    const projects = await Project.find({})
      .select("_id updatedAt createdAt")
      .lean();

    const projectRoutes: MetadataRoute.Sitemap = projects.map((p) => {
      const doc = p as { _id: unknown; updatedAt?: Date; createdAt?: Date };
      return {
        url: `${siteUrl}/projects/${doc._id}`,
        lastModified: doc.updatedAt ?? doc.createdAt ?? new Date(),
        changeFrequency: "monthly" as const,
        priority: 0.8,
      };
    });

    return [...staticRoutes, ...projectRoutes];
  } catch {
    // If DB is unavailable during build, return static routes only
    return staticRoutes;
  }
}
