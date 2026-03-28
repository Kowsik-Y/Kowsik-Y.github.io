import type { Metadata } from "next";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://kowsik.me";

export const metadata: Metadata = {
    title: "Certifications",
    description:
        "Professional certifications and credentials earned by Kowsik Y in AI, ML, and software development.",
    alternates: {
        canonical: "/certifications",
    },
    openGraph: {
        title: "Certifications — Kowsik Y",
        description:
            "Professional certifications and credentials in AI, ML, and software development.",
        url: "/certifications",
        images: [
            {
                url: "/og-certifications.png",
                width: 1200,
                height: 630,
                alt: "Certifications by Kowsik Y",
            },
        ],
    },
    twitter: {
        title: "Certifications — Kowsik Y",
        description: "Professional certifications and credentials by Kowsik Y.",
        images: ["/og-certifications.png"],
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
