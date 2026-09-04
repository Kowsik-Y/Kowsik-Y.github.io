import dbConnect from "@/lib/db";
import Achievement from "@/models/Achievement";
import type { IAchievement } from "@/types";
import AchievementsPageClient from "@/components/portfolio/AchievementsPageClient";

export const revalidate = 300;

type LeanAchievement = IAchievement & { _id: { toString(): string } };

export default async function AchievementsPage() {
    await dbConnect();

    const achievementDocs = (await Achievement.find({})
        .sort({ createdAt: -1 })
        .lean()) as LeanAchievement[];

    const achievements: IAchievement[] = achievementDocs.map((doc) => ({
        _id: doc._id.toString(),
        title: doc.title,
        description: doc.description,
        org: doc.org,
        date: doc.date,
        imageUrl: doc.imageUrl,
        link: doc.link,
        createdAt: doc.createdAt,
    }));

    return <AchievementsPageClient achievements={achievements} />;
}