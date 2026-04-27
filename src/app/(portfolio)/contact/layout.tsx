import type { Metadata } from "next";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://kowsik.me";

export const metadata: Metadata = {
    title: "Contact",
    description:
        "Get in touch with Kowsik Y — open to collaborations, projects, and opportunities in AI, ML, and full-stack development.",
    alternates: {
        canonical: `${siteUrl}/contact`,
    },
    openGraph: {
        title: "Contact — Kowsik Y",
        description:
            "Open to collaborations, projects, and opportunities in AI & ML.",
        url: `${siteUrl}/contact`,
        type: "website",
        siteName: "Kowsik Y",
        images: [
            {
                url: `${siteUrl}/og-default.svg`,
                width: 1200,
                height: 630,
                alt: "Contact Kowsik Y",
            },
        ],
    },
    twitter: {
        card: "summary_large_image",
        title: "Contact — Kowsik Y",
        description: "Get in touch with Kowsik Y for collaborations and projects.",
        images: [`${siteUrl}/og-default.svg`],
    },
};

export default function ContactLayout({
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
                name: "Contact",
                item: `${siteUrl}/contact`,
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
