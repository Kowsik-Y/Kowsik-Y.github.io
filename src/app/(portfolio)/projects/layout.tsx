import type { Metadata } from "next";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://kowsik.me";

export const metadata: Metadata = {
    title: "Projects",
    description:
        "Explore AI, ML, and full-stack projects by Kowsik Y — from intelligent agents to web applications.",
    alternates: {
        canonical: "/projects",
    },
    openGraph: {
        title: "Projects — Kowsik Y",
        description:
            "Explore AI, ML, and full-stack projects — from intelligent agents to web applications.",
        url: "/projects",
        images: [
            {
                url: "/og-projects.png",
                width: 1200,
                height: 630,
                alt: "Projects by Kowsik Y",
            },
        ],
    },
    twitter: {
        title: "Projects — Kowsik Y",
        description:
            "Explore AI, ML, and full-stack projects by Kowsik Y.",
        images: ["/og-projects.png"],
    },
};

export default function ProjectsLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const jsonLd = {
        "@context": "https://schema.org",
        "@type": "CollectionPage",
        name: "Projects",
        description: "AI, ML, and full-stack projects by Kowsik Y",
        url: `${siteUrl}/projects`,
        isPartOf: {
            "@type": "WebSite",
            name: "Kowsik Y",
            url: siteUrl,
        },
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
                name: "Projects",
                item: `${siteUrl}/projects`,
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
