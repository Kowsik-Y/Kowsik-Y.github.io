import type { Metadata } from "next";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://kowsik.me";

export const metadata: Metadata = {
    title: "Blogs",
    description: "Read blog posts by Kowsik Y on AI, machine learning, software engineering, and portfolio-building insights.",
    alternates: {
        canonical: "/blogs",
    },
    openGraph: {
        title: "Blogs — Kowsik Y",
        description: "Insights and articles on AI, ML, and full-stack development.",
        url: "/blogs",
        images: [
            {
                url: "/og-blogs.png",
                width: 1200,
                height: 630,
                alt: "Blogs by Kowsik Y",
            },
        ],
    },
    twitter: {
        title: "Blogs — Kowsik Y",
        description: "Insights and articles on AI, ML, and full-stack development.",
        images: ["/og-blogs.png"],
    },
};

export default function BlogsLayout({ children }: { children: React.ReactNode }) {
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
                name: "Blogs",
                item: `${siteUrl}/blogs`,
            },
        ],
    };

    return (
        <>
            <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }} />
            {children}
        </>
    );
}
