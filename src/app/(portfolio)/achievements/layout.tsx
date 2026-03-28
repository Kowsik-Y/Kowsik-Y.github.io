import type { Metadata } from "next";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://kowsik.me";

export const metadata: Metadata = {
    title: "Achievements",
    description:
        "Highlights, wins, and milestones from Kowsik Y's journey in AI, ML, and software development.",
    alternates: {
        canonical: "/achievements",
    },
    openGraph: {
        title: "Achievements — Kowsik Y",
        description:
            "Highlights, wins, and milestones from Kowsik Y's journey.",
        url: "/achievements",
        images: [
            {
                url: "/og-achievements.png",
                width: 1200,
                height: 630,
                alt: "Achievements by Kowsik Y",
            },
        ],
    },
    twitter: {
        title: "Achievements — Kowsik Y",
        description: "Highlights and milestones from Kowsik Y's journey.",
        images: ["/og-achievements.png"],
    },
};

export default function AchievementsLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const jsonLd = {
        "@context": "https://schema.org",
        "@type": "CollectionPage",
        name: "Achievements",
        description: "Milestones and recognitions from Kowsik Y's work.",
        url: `${siteUrl}/achievements`,
    };

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
                name: "Achievements",
                item: `${siteUrl}/achievements`,
            },
        ],
    };

    return (
        <>
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
            />
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
            />
            {children}
        </>
    );
}
