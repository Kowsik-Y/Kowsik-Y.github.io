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

    const profile = (profileDoc as Partial<IProfile>) ?? {};
    const serializedSkills = (skills as LeanDoc<ISkill>[]).map(serialize);
    const serializedEducation = (education as LeanDoc<IEducation>[]).map(serialize);
    const serializedLanguages = (languages as LeanDoc<ILanguage>[]).map(serialize);

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