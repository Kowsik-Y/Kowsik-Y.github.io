import type { Metadata } from "next";

export const metadata: Metadata = {
    title: "Achievements",
    description:
        "Highlights, wins, and milestones from Kowsik Y's journey in AI, ML, and software development.",
    openGraph: {
        title: "Achievements — Kowsik Y",
        description:
            "Highlights, wins, and milestones from Kowsik Y's journey.",
        url: "/achievements",
    },
    twitter: {
        title: "Achievements — Kowsik Y",
        description: "Highlights and milestones from Kowsik Y's journey.",
    },
};

export default function AchievementsLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return <>{children}</>;
}
