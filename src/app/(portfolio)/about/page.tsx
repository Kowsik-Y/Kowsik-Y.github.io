import dbConnect from "@/lib/db";
import Profile from "@/models/Profile";
import Project from "@/models/Project";
import Skill from "@/models/Skill";
import Education from "@/models/Education";
import Language from "@/models/Language";
import Certificate from "@/models/Certificate";
import type { IProfile, ISkill, IEducation, ILanguage } from "@/types";
import AboutPageClient from "@/components/portfolio/AboutPageClient";

export const revalidate = 300;

type LeanDoc<T> = T & { _id: { toString(): string } };

function serialize<T extends { _id: unknown }>(doc: T): T & { _id: string } {
    return { ...doc, _id: (doc._id as { toString(): string }).toString() };
}

export default async function AboutPage() {
    await dbConnect();

    const [profileDoc, skills, education, languages, projectsCount, certsCount] =
        await Promise.all([
            Profile.findOneAndUpdate(
                { _key: "main" },
                { $setOnInsert: { _key: "main" } },
                { upsert: true, returnDocument: "after", lean: true }
            ),
            Skill.find({}).sort({ category: 1, name: 1 }).lean(),
            Education.find({}).sort({ order: 1, createdAt: -1 }).lean(),
            Language.find({}).sort({ order: 1, name: 1 }).lean(),
            Project.countDocuments({}),
            Certificate.countDocuments({}),
        ]);

    const rawProfile = profileDoc ? JSON.parse(JSON.stringify(profileDoc)) : {};
    const profile = {
        ...rawProfile,
        _id: rawProfile._id ? String(rawProfile._id) : undefined,
        customLinks: Array.isArray(rawProfile.customLinks)
            ? rawProfile.customLinks.map((item: any) => ({
                label: String(item.label || ""),
                url: String(item.url || ""),
            }))
            : [],
        githubActivityLinks: Array.isArray(rawProfile.githubActivityLinks)
            ? rawProfile.githubActivityLinks.map((item: any) => ({
                label: String(item.label || ""),
                url: String(item.url || ""),
            }))
            : [],
    };

    const serializedSkills = JSON.parse(JSON.stringify(skills)).map((s: any) => ({
        ...s,
        _id: String(s._id || ""),
    }));
    const serializedEducation = JSON.parse(JSON.stringify(education)).map((e: any) => ({
        ...e,
        _id: String(e._id || ""),
    }));
    const serializedLanguages = JSON.parse(JSON.stringify(languages)).map((l: any) => ({
        ...l,
        _id: String(l._id || ""),
    }));

    return (
        <AboutPageClient
            profile={profile}
            skills={serializedSkills}
            education={serializedEducation}
            languages={serializedLanguages}
            projectsCount={projectsCount}
            certsCount={certsCount}
        />
    );
}