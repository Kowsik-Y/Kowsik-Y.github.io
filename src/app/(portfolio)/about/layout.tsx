import type { Metadata } from "next";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://kowsik.me";

export const metadata: Metadata = {
    title: "About",
    description:
        "Learn about Kowsik Y — AI & ML engineering student, full-stack developer, and AI agent builder. Explore skills, education, and experience.",
    alternates: {
        canonical: `${siteUrl}/about`,
    },
    openGraph: {
        title: "About — Kowsik Y",
        description:
            "AI & ML student, full-stack developer, and AI agent builder. Skills, education, and background.",
        url: `${siteUrl}/about`,
        type: "website",
        siteName: "Kowsik Y",
        images: [
            {
                url: `${siteUrl}/og-default.svg`,
                width: 1200,
                height: 630,
                alt: "About Kowsik Y",
            },
        ],
    },
    twitter: {
        card: "summary_large_image",
        title: "About — Kowsik Y",
        description:
            "AI & ML student, full-stack developer, and AI agent builder.",
        images: [`${siteUrl}/og-default.svg`],
    },
};

export default function AboutLayout({
    children,
}: {
    children: React.ReactNode;
}) {
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
                name: "About",
                item: `${siteUrl}/about`,
            },
        ],
    };

    return (
        <>
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
            />
            {children}
        </>
    );
}
