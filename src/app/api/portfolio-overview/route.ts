import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import Profile from "@/models/Profile";
import Project from "@/models/Project";
import Skill from "@/models/Skill";
import Education from "@/models/Education";
import Language from "@/models/Language";
import Hobby from "@/models/Hobby";
import Certificate from "@/models/Certificate";
import Achievement from "@/models/Achievement";
import Blog from "@/models/Blog";
import type { IPortfolioOverviewResponse } from "@/types";

export const revalidate = 300;

export async function GET(req: NextRequest) {
    try {
        const includeAdminMeta = req.nextUrl.searchParams.get("includeAdminMeta") === "1";
        const includeHeavyMedia = req.nextUrl.searchParams.get("includeHeavyMedia") === "1";

        await dbConnect();

        const [profileDoc, projects, blogs, skills, education, languages, hobbies, certificates, achievements] =
            await Promise.all([
                Profile.findOneAndUpdate(
                    { _key: "main" },
                    { $setOnInsert: { _key: "main" } },
                    { upsert: true, returnDocument: "after" }
                ).lean(),
                Project.find(
                    {},
                    includeHeavyMedia
                        ? undefined
                        : {
                            title: 1,
                            description: 1,
                            techStack: 1,
                            githubUrl: 1,
                            liveUrl: 1,
                            imageUrl: 1,
                            featured: 1,
                            order: 1,
                            createdAt: 1,
                        }
                )
                    .sort({ order: 1, createdAt: -1 })
                    .lean(),
                Blog.find(includeAdminMeta ? {} : { published: true })
                    .sort({ order: 1, createdAt: -1 })
                    .lean(),
                Skill.find({}).sort({ category: 1, name: 1 }).lean(),
                Education.find({}).sort({ order: 1, createdAt: -1 }).lean(),
                Language.find({}).sort({ order: 1, name: 1 }).lean(),
                Hobby.find({}).sort({ order: 1, name: 1 }).lean(),
                Certificate.find({}).sort({ createdAt: -1 }).lean(),
                Achievement.find({}).sort({ createdAt: -1 }).lean(),
            ]);

        const payload: IPortfolioOverviewResponse = {
            profile: (profileDoc as IPortfolioOverviewResponse["profile"]) ?? null,
            projects: projects as IPortfolioOverviewResponse["projects"],
            blogs: blogs as IPortfolioOverviewResponse["blogs"],
            skills: skills as IPortfolioOverviewResponse["skills"],
            education: education as IPortfolioOverviewResponse["education"],
            languages: languages as IPortfolioOverviewResponse["languages"],
            hobbies: hobbies as IPortfolioOverviewResponse["hobbies"],
            certificates: certificates as IPortfolioOverviewResponse["certificates"],
            achievements: achievements as IPortfolioOverviewResponse["achievements"],
            summary: {
                projectsCount: projects.length,
                blogsCount: blogs.length,
                certificatesCount: certificates.length,
                achievementsCount: achievements.length,
                skillsCount: skills.length,
                educationCount: education.length,
                languagesCount: languages.length,
                hobbiesCount: hobbies.length,
            },
            adminOverview: includeAdminMeta
                ? {
                    profileName: profileDoc?.name ?? "",
                    profileTitle: profileDoc?.title ?? "",
                    updatedAt: (profileDoc?.updatedAt as string | undefined) ?? undefined,
                }
                : undefined,
        };

        return NextResponse.json(payload, {
            headers: {
                "Cache-Control": "public, s-maxage=300, stale-while-revalidate=600",
            },
        });
    } catch {
        return NextResponse.json(
            {
                error: "Failed to load portfolio overview",
            },
            { status: 500 }
        );
    }
}
