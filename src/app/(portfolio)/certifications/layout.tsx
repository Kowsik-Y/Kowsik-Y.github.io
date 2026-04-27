import type { Metadata } from "next";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://kowsik.me";

export const metadata: Metadata = {
    title: "Certifications",
    description:
        "Professional certifications and credentials earned by Kowsik Y in AI, ML, and software development.",
    alternates: {
        canonical: `${siteUrl}/certifications`,
    },
    openGraph: {
        title: "Certifications — Kowsik Y",
        description:
            "Professional certifications and credentials in AI, ML, and software development.",
        url: `${siteUrl}/certifications`,
        type: "website",
        siteName: "Kowsik Y",
        images: [
            {
                url: `${siteUrl}/og-default.svg`,
                width: 1200,
                height: 630,
                alt: "Certifications by Kowsik Y",
            },
        ],
    },
    twitter: {
        card: "summary_large_image",
        title: "Certifications — Kowsik Y",
        description: "Professional certifications and credentials by Kowsik Y.",
        images: [`${siteUrl}/og-default.svg`],
    },
};

export default function CertificationsLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const jsonLd = {
        "@context": "https://schema.org",
        "@type": "CollectionPage",
        name: "Certifications",
        description: "Professional certifications and credentials earned by Kowsik Y.",
        url: `${siteUrl}/certifications`,
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
                name: "Certifications",
                item: `${siteUrl}/certifications`,
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
